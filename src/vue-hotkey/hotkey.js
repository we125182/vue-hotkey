/*

The MIT License (MIT)

Copyright (c) 2020-present Ferdinand Kasper <fkasper@modus-operandi.at>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

const defaults = {
    enabled: true,      // enables the directive if truthy
    keys: null,         // hotkey(s) as '[Ctrl+][Shift+][Alt+][Meta+]key_value'
    action: 'click',    // which action to perform on the selected element
    selector: '*',      // the action is performed on the first matching element
    priority: 0,        // priority in relation to other hotkey options
    displayKeys: false,  // display the hotkey(s) in the element
}

function setOptions(el, binding, vnode) {
    let options = {}

    // Make sure that options can be stored on this VNode
    vnode.$hotkey = vnode.$hotkey || new Map()

    // The directive argument is used as the VNode-local option name
    options.arg = getArg(binding)

    // Process directive value, validate regardless of whether enabled or not
    const value = binding.value

    if (Array.isArray(value)) {
        Object.assign(options, defaults, { keys: value.map(ev => String(ev)) })

    } else if (typeof value === 'string') {
        Object.assign(options, defaults, { keys: value })

    } else if (value && typeof value === 'object') {
        Object.keys(value).forEach(opt => {
            if (typeof defaults[opt] === 'undefined') {
                throw `Unknown option '${opt}'; known options: ${Object.keys(defaults).join(', ')}`
            }
        })
        Object.assign(options, defaults, value)

    } else {
        throw 'No configuration found'
    }

    if (!options.keys) {
        throw 'keys property not found'
    }

    if (options.enabled) {
        if (typeof options.keys === 'string') {
            options.keys = [options.keys]
        }

        options.keyIds = options.keys.map(toKeyEvent).map(toKeyId)

        if (typeof options.action === 'function') {
            options.action = options.action.bind(vnode.context)
        } else if (!(options.action instanceof Event)) {
            options.action = new Event(String(options.action), {bubbles: true, cancelable: false})
        }

        options.priority = Number(options.priority)

        options.el = el

        // Save options for each enabled directive in VNode
        vnode.$hotkey.set(options.arg, options)

        // Add to the global options set
        vnode.context.$hotkey.optionsSet.add(options)
    }

    // Invalidate the global keymap so that it gets rebuilt on the next key event
    delete vnode.context.$hotkey.keymap
    return options
}


function getArg(binding) {
    // Use a default that should never occur as an argument
    return binding.arg || '='
}


function toKeyEvent(key) {
    // Separate key from modifiers
    const keys = /^((?:(?:ctrl|shift|alt|meta)\+)*)(.|[a-z]+\d*)$/i.exec(String(key))

    if (!keys) {
        throw `Expected: [Ctrl+][Shift+][Alt+][Meta+]key_value, found: ${key}`
    }

    const keyEvent = {
        key: keys[2].toLowerCase(),
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
    }

    // Set keyEvent properties as appropriate
    keys[1]
        .toLowerCase()
        .split('+')
        .filter(k => k)
        .forEach(k => keyEvent[k + 'Key'] = true)

    return keyEvent
}


function toKeyId(keyEvent) {
    const key = keyEvent.key || keyEvent.code.replace(/(key|digit)/i, '')
    let id = key.toLowerCase() + '_'

    if (keyEvent.altKey) id += 'A'
    if (keyEvent.ctrlKey) id += 'C'
    if (keyEvent.metaKey) id += 'M'

    // The shift key is ignored for single characters that do not have any other modifier
    // because it depends on the type of keyboard whether or not it is required to produce that character
    if (keyEvent.shiftKey && (key.length !== 1 || keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey)) {
        id += 'S'
    }

    return id
}


// Deep object comparison
function equals(val1, val2) {
    function size(val) {
        return (val && typeof val === 'object') ? Object.keys(val).length : -1
    }

    if (val1 instanceof Function) {
        // Compare the source code
        return (val2 instanceof Function) && (val1.toString() === val2.toString())
    }

    const size1 = size(val1)

    if (size1 < 0) {
        // At least one non-object, requires strict equality
        return val1 === val2

    } else if (size(val2) !== size1) {
        // Two objects/arrays with differing numbers of properties/elements
        return false

    } else if (Array.isArray(val1)) {
        // At least one array, requires array comparison
        return Array.isArray(val2) && val1.every((el, index) => equals(el, val2[index]))

    } else {
        // Two objects with the same number of properties
        return Object.keys(val1).every(k => equals(val1[k], val2[k]))
    }
}


function cleanup(vnode) {
    if (vnode.$hotkey) {
        const
            optionsList = vnode.context.$hotkey.optionsList,
            index = optionsList.indexOf(vnode.$hotkey)

        if (index >= 0) {
            optionsList.splice(index, 1)
        }
    
        delete vnode.$hotkey
    }
}


const hotkey = {
    install(Vue, defaultOptions) {
        if (this.install.installed) {
            return
        }
        Object.assign(defaults, defaultOptions)
        this.install.installed = true


        Vue.prototype.$hotkey = {
            optionsSet: new Set(),
        }

        Vue.prototype.$hotkey.handleEvent = function(keyEvent) {

            // Ignore key events without a key property (caused by autocomplete)
            if (!keyEvent.key && !keyEvent.code) {
                return
            }

            // Do not process plain characters typed into contenteditable or input elements
            const keyId = toKeyId(keyEvent)
            if (keyId.length == 2 && document.activeElement &&
                (document.activeElement.isContentEditable || document.activeElement.selectionDirection)) {
                return
            }

            // Build the keymap lazily, assuming that keystrokes happen less frequently than directive updates
            if (!this.keymap) {
                // Sort options by ascending priority
                const sortedOptions = Array.from(this.optionsSet).sort((o1, o2) => o1.priority - o2.priority)

                // Map each keyId to the respective option
                this.keymap = new Map()
                sortedOptions.forEach(o => o.keyIds.forEach(ki => this.keymap.set(ki, o)))
            }

            // Find options matching this key event
            const options = this.keymap.get(keyId)

            if (options) {
                // Perform the action on the target element
                const target = options.el.matches(options.selector) ? options.el : options.el.querySelector(options.selector)
                if (target) {
                    if (typeof options.action === 'function') {
                        options.action(target)

                    } else {
                        target.dispatchEvent(options.action)
                    }

                    keyEvent.preventDefault()
                    keyEvent.stopImmediatePropagation()
                }
            }
        }

        document.addEventListener('keydown', Vue.prototype.$hotkey.handleEvent.bind(Vue.prototype.$hotkey), true)


        Vue.directive('hotkey', hotkey)
    },

    bind(el, binding, vnode) {
        const options = setOptions(el, binding, vnode)
        if ((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && options.displayKeys) {
            const kbd = document.createElement('kbd')
            kbd.innerText = options.keys
            el.appendChild(kbd)
        }
    },

    update(el, binding, vnode, oldVnode) {
        const arg = getArg(binding)

        if (equals(binding.value, binding.oldValue)) {
            // Options unchanged, just copy them over
            vnode.$hotkey = vnode.$hotkey || new Map()
            vnode.$hotkey.set(arg, oldVnode.$hotkey.get(arg))

        } else {
            // Replace options
            vnode.context.$hotkey.optionsSet.delete(oldVnode.$hotkey.get(arg))
            setOptions(el, binding, vnode)
        }
    },

    unbind(el, binding, vnode) {
        if (vnode.$hotkey) {
            vnode.$hotkey.forEach(o => vnode.context.$hotkey.optionsSet.delete(o))
            delete vnode.context.$hotkey.keymap
            delete vnode.$hotkey
        }
    },
}

export default hotkey
