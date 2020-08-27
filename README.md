# A flexible Vue hotkey directive

![Minified size](https://badgen.net/bundlephobia/min/@undecaf/vue-hotkey)
![Open issues](https://badgen.net/github/open-issues/undecaf/vue-hotkey)
![Total downloads](https://badgen.net/npm/dt/@undecaf/vue-hotkey)
![License](https://badgen.net/github/license/undecaf/vue-hotkey)

This directive, `v-hotkey`, transforms hotkey keystrokes to an event on a target element or to
a function call. It offers the following features:

+   When placed on a Vue component (as opposed to a plain HTML element), `v-hotkey` can also target
    an inner element, determined by a CSS selector.
+   The target element can receive an event, or a method can be called with the target 
    element as argument.
+   The hotkey mapping is maintained for the lifetime of the element on which 
    `v-hotkey` is placed. Thus, hotkey mappings appear and disappear automatically together
    with the elements they are placed on.
+   Hotkeys can be combinations of `Ctrl`, `Alt`, `Shift` and `Meta` with a character or a
    special [key value](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values).
    Multiple hotkeys can be mapped to the same action.
+   Hotkeys will override browser shortcuts if possible.
+   The configuration can be changed dynamically.
+   The directive can be disabled.
   

## Installation

As a module:

```shell script
$ npm install @undecaf/vue-hotkey
    or
$ yarn add @undecaf/vue-hotkey
```

Included as `<script>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@undecaf/vue-hotkey/dist/directives.min.js"></script>
```


## Usage

### Registering the directive

```javascript 1.8
import hotkey from 'vue-hotkey'

Vue.use(hotkey)
```


### Configuration

`v-hotkey` requires a configuration object, or a string or an array (sets the `keys` property).
Unspecified options get default values.

The configuration object supports the following properties:

| Name | Type | Effect | Default |
|------|------|--------|---------|
| `enabled` | `Boolean` | Enables the directive if truthy. | `true` |
| `keys` | `String` or `Array<String>` | Hotkey(s) in the format <code>[Ctrl+][Shift+][Alt+][Meta+]<a href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values">key_value</a></code>.<br>Plain characters should have at least one `Ctrl`, `Alt` or `Meta` modifier in order to avoid conflicts with input elements (see [this example](#using-plain-characters-as-hotkeys) for an exception). `Shift` is irrelevant for plain characters as they are matched case-insensitively.<br>Hotkeys will override browser shortcuts if possible.| none, must be specified |
| `action` | `String` or `Event` or `Function` | An event name, an [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object, or a function to be called.<br>The function receives the target element as argument, and `this` references the surrounding Vue component's `vm`. | `'click'` |
| `selector` | `String` | The first element matching this selector (starting with the element on which `v-hotkey` is placed) becomes the target for `action`. | `'*'` |
| `priority` | `Number` | Priority in relation to other hotkey configurations.<br>If the same hotkey has been mapped several times then the configuration with the highest priority wins. | `0` |

Property changes after binding are taken into account.


### Examples

#### Generating button clicks

Making hotkeys click a HTML button and a [Vue Material Button](https://vuematerial.io/components/button):

```html
<button v-hotkey="'alt+Enter'" @click="...">Submit</button>

<md-button v-hotkey="['ctrl+s', 'Alt+S']" @click="...">Save</md-button>
```

A `target` is not required for `<md-button>` since this component is resolved to a `<button>` anyway.
 

#### Calling a function in response to a hotkey

Toggling a checkbox value:

```html
<div>
  <input
    type="checkbox"
    v-model="details"       
    v-hotkey="{ keys: 'Ctrl+D', action: () => $nextTick(() => details = !details) }">
  <label>Show details (Ctrl-D to toggle)</label>
</div>
```

Please note that `action: details = !details` would lead to an infinite render loop, and
`action: el => el.checked = !el.checked` would not toggle variable `details`.


#### Using plain characters as hotkeys

Entering search text after a leading `/` (inspired by the [Vuetify](https://vuetifyjs.com/) homepage):

```html
<md-field v-hotkey="{ keys: '/', action: el => el.focus(), selector: 'input' }">
  <label>Search ("/" to focus)</label>
  <md-input type="text" />
</md-field>
```

Hotkeys that are plain characters are disabled automatically on inputs and contenteditable elements
so that these hotkeys can be entered in such elements.

`v-hotkey` could have been placed also on `<md-input>`, omitting the `selector` because `<md-input>`
resolves to `<input>`.


#### Placing multiple hotkey mappings on the same element

Multiple `v-hotkey` directives can be placed on the same element if a unique argument is appended
to each directive:

```vue
<md-dialog
  v-hotkey:1="{ keys: 'ctrl+s', selector: '.save-btn' }"
  v-hotkey:2="{ keys: 'ctrl+x', selector: '.exit-btn' }">
    ...
  <md-button class="save-btn">Save</md-button>
  <md-button class="exit-btn">Exit</md-button>
    ...
</md-dialog>
``` 


#### Clicking an element inside an opaque component

Although the inner structure of the [Vue Material confirms](https://vuematerial.io/components/dialog)
component is not exposed we can still map hotkeys to the buttons: 

```html
<md-dialog-confirm
  v-hotkey:1="{ keys: 'N', selector: '.md-dialog-actions button' }"
  v-hotkey:2="{ keys: 'Y', selector: '.md-dialog-actions button ~ button' }"
  md-content="Press Y or N to confirm or to reject"
  md-confirm-text="Yes"
  md-cancel-text="No" />
```


#### Context-sensitive mapping

If the [Vue Material dialog](https://vuematerial.io/components/dialog) is showing then `Ctrl-S` clicks
the `Save` button in the dialog; otherwise `Ctrl-S` clicks the `Save` button in the surrounding component:

```vue
<template>
  <md-dialog>
      ...
    <md-button v-hotkey="{ keys: 'ctrl+s', priority: 1 }">Save</md-button>
      ...
  </md-dialog>
    ...
  <md-button v-hotkey="'ctrl+s'">Save</md-button>
</template>
``` 


## License

Software: [MIT](http://opensource.org/licenses/MIT)

Documentation: [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
