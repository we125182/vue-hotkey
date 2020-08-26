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
    action: 'click',     // which action to perform on the selected element
    selector: '*',      // the action is performed on the first matching element
    priority: 0,        // priority in relation to other hotkey options
}

function setOptions(el, binding, vnode) {
    let options

    // Process directive value
    const value = binding.value

    if (Array.isArray(value)) {
        options = Object.assign({}, defaults, { keys: value.map(ev => String(ev)) })

    } else if (typeof value === 'string') {
        options = Object.assign({}, defaults, { keys: value })

    } else if (value && typeof value === 'object') {
        Object.keys(value).forEach(opt => {
            if (typeof defaults[opt] === 'undefined') {
                throw `Unknown option '${opt}'; known options: ${Object.keys(defaults).join(', ')}`
            }
        })
        options = Object.assign({}, defaults, value)

    } else {
        throw 'No configuration found'
    }

    if (!options.keys) {
        throw 'keys property not found'
    }

    if (typeof options.keys === 'string') {
        options.keys = [options.keys]
    }

    options.keyEvents = options.keys.map(toKeyEvent)

    if (typeof options.action === 'function') {
        options.action = options.action.bind(vnode.context)
    } else if (!(options.action instanceof Event)) {
        options.action = new Event(String(options.action), { bubbles: true, cancelable: false })
    }

    options.priority = Number(options.priority)

    options.el = el

    // Save options in VNode for update and cleanup
    vnode.$hotkey = options

    // Add options to options list and sort by descending priority
    vnode.context.$hotkey.optionsList.push(options)
    vnode.context.$hotkey.optionsList.sort((a, b) => b.priority - a.priority)
}


function toKeyEvent(key) {
    // Separate key from modifiers
    const keys = /^((?:(?:ctrl|shift|alt|meta)\+)*)(.|[a-z]+\d*)$/i.exec(String(key))

    if (!keys) {
        throw `Expected: [Ctrl+][Shift+][Alt+][Meta+]key_value, found: ${key}`
    }

    const keyEvent = {
        key: keys[2].toLowerCase(),
        modifiers: {
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
        },
    }

    // Set keyEvent properties as appropriate
    keys[1]
        .toLowerCase()
        .split('+')
        .filter(k => k)
        .forEach(k => keyEvent.modifiers[k + 'Key'] = true)

    // The shift key is irrelevant for single characters that do not have any other modifier.
    // Whether or not it is required to produce the character depends on the type of keyboard.
    if (keyEvent.key.length === 1 && !keyEvent.modifiers.altKey && !keyEvent.modifiers.ctrlKey && !keyEvent.modifiers.metaKey) {
        delete keyEvent.modifiers.shiftKey
    }

    return keyEvent
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
    install(Vue) {
        if (this.install.installed) {
            return
        }
        this.install.installed = true


        Vue.prototype.$hotkey = {
            optionsList: []
        }

        Vue.prototype.$hotkey.handleEvent = function(ev) {
            // Process option objects in order of descending priority
            this.optionsList.some(o => {
                // Are these options enabled and does the event match one of their key events?
                if (o.enabled &&
                    o.keyEvents
                        .some(ke =>
                            (ev.key.toLowerCase() === ke.key) &&
                            Object.keys(ke.modifiers).every(m => ev[m] === ke.modifiers[m]))
                ) {
                    // Perform the action on the target element
                    const target = o.el.matches(o.selector) ? o.el : o.el.querySelector(o.selector)
                    if (target) {
                        if (typeof o.action === 'function') {
                            o.action(target)

                        } else {
                            target.dispatchEvent(o.action)
                        }

                        ev.preventDefault()
                        ev.stopImmediatePropagation()

                        // Terminate .some()
                        return true
                    }
                }
            })
        }

        document.addEventListener('keydown', Vue.prototype.$hotkey.handleEvent.bind(Vue.prototype.$hotkey), true)


        Vue.directive('hotkey', hotkey)
    },

    bind(el, binding, vnode) {
        setOptions(el, binding, vnode)
    },

    update(el, binding, vnode, oldVnode) {
        if (vnode !== oldVnode) {
            if (equals(binding.value, binding.oldValue)) {
                // Options unchanged, just move them
                vnode.$hotkey = oldVnode.$hotkey

            } else {
                // Regenerate options
                cleanup(oldVnode)
                setOptions(el, binding, vnode)
            }
        }
    },

    unbind(el, binding, vnode) {
        cleanup(vnode)
    },
}

export default hotkey
