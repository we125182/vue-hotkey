<template>
  <md-app
    v-cloak
    md-waterfall
    md-mode="fixed"
  >
    <md-app-toolbar class="md-primary md-dense md-layout md-alignment-center-space-between">
      <div class="md-layout-item md-title">
        Testing v-hotkey
      </div>
    </md-app-toolbar>

    <md-app-content>
      <div class="md-layout md-alignment-center-left">
        <div class="md-subheading">
          Reported events: <span id="reported">{{ reported.join(', ') }}</span>
        </div>

        <md-button
          id="clear-reported"
          class="md-icon-button md-dense"
          @click="reported = []"
        >
          <md-icon>clear</md-icon>
        </md-button>
      </div>

      <hr>

      <div class="md-headline">
        Dispatching click events
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div
          v-for="k in ['Ctrl+', 'Alt+', 'Shift+', 'Ctrl+Alt+', 'Ctrl+Shift+', 'Alt+Shift+', 'Ctrl+Alt+Shift+']"
          :key="k"
          class="md-layout-item md-flex-none"
        >
          <button
            v-hotkey="{ keys: k + 'Enter' }"
            @click="reported.push(k + 'Enter')"
          >
            {{ k }}Enter
          </button>
        </div>

        <md-button
          v-hotkey="{ keys: ['Ctrl+s'] }"
          class="md-layout-item md-flex-none md-raised"
          @click="reported.push('Ctrl+S')"
        >
          Ctrl+S
        </md-button>

        <md-menu
          class="md-layout-item md-flex-none"
          md-size="medium"
          md-align-trigger
        >
          <md-button
            v-hotkey="'alt+m'"
            class="md-raised"
            md-menu-trigger
          >
            Alt+M for menu
          </md-button>

          <md-menu-content class="md-layout-item">
            <md-menu-item
              v-for="i in [1,2,3]"
              :key="i"
              v-hotkey="`ctrl+${i}`"
              @click="reported.push(`Ctrl+${i}`)"
            >
              Ctrl+{{ i }}
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>


      <div class="md-headline">
        Dispatching other events
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div
          v-hotkey="{ keys: 'ctrl+g', action: 'dblclick' }"
          class="md-layout-item md-flex-none clickable"
          @dblclick="reported.push('Ctrl+G')"
        >
          Ctrl+G on doubleclick
        </div>

        <div
          v-hotkey="{ keys: 'alt+g', action: dropEvent }"
          class="md-layout-item md-flex-none droptarget"
          @dragover.prevent
          @dragenter.prevent
          @drop="reported.push('Alt+G')"
        >
          Alt+G on drop
        </div>

        <div
          class="md-layout-item md-flex-none clickable"
          draggable
        >
          Draggable
        </div>
      </div>


      <div class="md-headline">
        Performing function calls
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item md-flex-none">
          <input
            id="toggling"
            v-hotkey="{ keys: 'Ctrl+K', action: el => el.checked = !el.checked }"
            type="checkbox"
          >
          <label>Ctrl+K</label>
        </div>

        <md-field
          v-hotkey="{ keys: '/', action: el => el.focus(), selector: 'input' }"
          class="md-layout-item md-size-25"
        >
          <label>Search ("/" to focus)</label>
          <md-input
            id="search"
            type="text"
          />
        </md-field>

        <div class="md-layout-item md-flex-none">
          <input
            id="input"
            type="search"
            placeholder="Can type &quot;/&quot; here"
          >
        </div>

        <textarea
          id="textarea"
          class="md-layout-item md-flex-none"
        >
          Can type "/" here
        </textarea>

        <div
          id="contenteditable"
          class="md-layout-item md-flex-none droptarget"
          contenteditable
        >
          Can type "/" here
        </div>
      </div>


      <div class="md-headline">
        Multiple hotkeys mapped to the same event
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item md-flex-none">
          <button
            v-hotkey="{ keys: [ 'alt+a', 'ALT+B', 'Alt+c' ] }"
            @click="reported.push('Alt+A/B/C')"
          >
            Alt+A/B/C
          </button>
        </div>
      </div>


      <div class="md-headline">
        Enabling/disabling, function calls
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item md-flex-none">
          <input
            v-model="buttonEnabled"
            v-hotkey="{ keys: 'Ctrl+E', action: () => $nextTick(() => buttonEnabled = !buttonEnabled) }"
            type="checkbox"
          >
          <label>Hotkey enabled (Ctrl+E):</label>
        </div>

        <div class="md-layout-item md-flex-none">
          <button
            v-hotkey="{ enabled: buttonEnabled, keys: 'ctrl+shift+e' }"
            @click="reported.push('Ctrl+Shift+E')"
          >
            Ctrl+Shift+E
          </button>
        </div>
      </div>


      <div class="md-headline">
        Enabling/disabling multiple directives on the same element
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item md-flex-none">
          <input
            v-model="divEnabled"
            v-hotkey="{ keys: 'Alt+D', action: () => $nextTick(() => divEnabled = !divEnabled) }"
            type="checkbox"
          >
          <label>Hotkeys enabled (Alt+D):</label>
        </div>

        <div
          v-hotkey:1="{ enabled: divEnabled, keys: 'ctrl+f1', selector: 'button' }"
          v-hotkey:2="{ enabled: divEnabled, keys: 'ctrl+f2', selector: 'button ~ button' }"
          class="md-layout-item md-flex-none"
        >
          <md-button
            class="md-raised"
            @click="reported.push('Ctrl+F1')"
          >
            Ctrl+F1
          </md-button>

          <md-button
            class="md-raised"
            @click="reported.push('Ctrl+F2')"
          >
            Ctrl+F2
          </md-button>
        </div>
      </div>


      <div class="md-headline">
        Priority among multiple events mapped to the same hotkey
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item md-flex-none">
          Priority:
        </div>

        <div
          v-for="i in [1, 2, 3, 4]"
          :key="i"
          class="md-layout-item md-flex-none"
        >
          <button
            v-hotkey="i !== 3 ? 'ctrl+o' : { keys: 'ctrl+o', priority: 1 }"
            class="button-1 md-layout-item"
            @click="reported.push(`Ctrl+O#${i}`)"
          >
            {{ `Ctrl+O#${i}` + (i === 3 ? ' wins' : '') }}
          </button>
        </div>
      </div>


      <div class="md-headline">
        Actions inside opaque components, multiple directives on the same element
      </div>

      <div class="md-layout md-alignment-center-left md-gutter">
        <md-button
          id="confirm"
          class="md-raised"
          @click="confirmActive = true"
        >
          Confirm
        </md-button>

        <md-button
          id="dialog"
          class="md-layout-item md-flex-none md-raised"
          @click="dialogActive = true"
        >
          Dialog
        </md-button>
      </div>

      <md-dialog-confirm
        v-hotkey:1="{ keys: 'N', selector: '.md-dialog-actions button' }"
        v-hotkey:2="{ keys: 'Y', selector: '.md-dialog-actions button ~ button' }"
        :md-active.sync="confirmActive"
        md-title="Test confirmation"
        md-content="Press Y or N to confirm or reject"
        md-confirm-text="Yes"
        md-cancel-text="No"
        @md-cancel="reported.push('N:confirm')"
        @md-confirm="reported.push('Y:confirm')"
      />

      <md-dialog
        v-hotkey:1="{ keys: 'ctrl+o', priority: 10, selector: '.button-1' }"
        v-hotkey:2="{ keys: 'ctrl+x', selector: '.button-2' }"
        :md-active.sync="dialogActive"
      >
        <md-dialog-title>Test dialog</md-dialog-title>

        <md-dialog-content>Lorem ipsum...</md-dialog-content>

        <md-dialog-actions>
          <md-button
            class="md-raised button-1"
            @click="reported.push('Ctrl+O:dialog'); dialogActive=false"
          >
            Ctrl+O
          </md-button>

          <md-button
            class="md-raised button-2"
            @click="reported.push('Ctrl+X:dialog'); dialogActive=false"
          >
            Ctrl+X
          </md-button>
        </md-dialog-actions>
      </md-dialog>
    </md-app-content>
  </md-app>
</template>

<script>
    export default {
        name: "App",

        data() {
            return {
                reported: [],
                dropEvent: new DragEvent('drop'),
                buttonEnabled: false,
                divEnabled: true,
                dialogActive: false,
                confirmActive: false,
            }
        },
    }
</script>

<style scoped>
</style>
