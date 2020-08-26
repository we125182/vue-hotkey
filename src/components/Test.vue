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

      <div class="md-layout md-alignment-center-space-between md-gutter">
        <button
          v-hotkey="'ctrl+s'"
          class="md-layout-item"
          @click="reported.push('Ctrl-S:click')"
        >
          Ctrl-S
        </button>

        <div class="md-layout-item">
          <input
            id="checkbox"
            v-model="enabled"
            v-hotkey="{ keys: 'Ctrl+D', action: el => el.checked = !el.checked }"
            type="checkbox"
          >
          <label>Enabled (Ctrl-D):</label>
        </div>

        <button
          v-hotkey="{ enabled, keys: 'alt+Enter' }"
          class="md-layout-item"
          @click="reported.push('Alt-Enter:click')"
        >
          Alt-Enter
        </button>

        <md-button
          v-hotkey="{ keys: ['shift+Insert'] }"
          class="md-layout-item md-raised"
          @click="reported.push('Shift-Insert:click')"
        >
          Shift-Insert
        </md-button>

        <md-button
          v-hotkey="{ keys: 'ctrl+Enter' }"
          class="md-layout-item md-raised"
          @click="reported.push('Ctrl-Enter:click')"
        >
          Ctrl-Enter
        </md-button>

        <md-field
          v-hotkey="{ keys: '/', action: el => el.focus(), selector: 'input' }"
          class="md-layout-item md-size-25"
        >
          <label>Search ("/" to focus)</label>
          <md-input id="search" type="text" />
        </md-field>

        <md-menu
          md-size="medium"
          md-align-trigger
        >
          <md-button
            v-hotkey="'alt+m'"
            class="md-raised"
            md-menu-trigger
          >
            Alt-M for menu
          </md-button>

          <md-menu-content class="md-layout-item">
            <md-menu-item
              v-for="i in [1,2,3]"
              :key="i"
              v-hotkey="`ctrl+${i}`"
              @click="reported.push(`Ctrl-${i}:click`)"
            >
              Ctrl-{{ i }}
            </md-menu-item>
          </md-menu-content>
        </md-menu>

        <div class="md-layout-item" />
      </div>

      <hr>

      <div class="md-layout md-alignment-center-left md-gutter">
        <div class="md-layout-item">
          Priority:
        </div>

        <button
          v-hotkey="['ctrl+o', 'F1']"
          class="button-1 md-layout-item"
          @click="reported.push('Ctrl-O, F1:click')"
        >
          Ctrl-O, F1
        </button>

        <button
          v-hotkey="['ctrl+o', 'F2']"
          class="button-2 md-layout-item"
          @click="reported.push('Ctrl-O, F2:click')"
        >
          Ctrl-O, F2
        </button>

        <button
          v-hotkey="{ keys: ['ctrl+o', 'F3'], priority: 5 }"
          class="button-1 md-layout-item"
          @click="reported.push('Ctrl-O, F3:click')"
        >
          Ctrl-O wins, F3
        </button>

        <button
          v-hotkey="['ctrl+o', 'F4']"
          class="button-2 md-layout-item"
          @click="reported.push('Ctrl-O, F4:click')"
        >
          Ctrl-O, F4
        </button>
      </div>

      <hr>

      <div class="md-layout md-alignment-center-left md-gutter">
        <md-button
          class="md-raised"
          @click="confirmActive = true"
        >
          Confirm
        </md-button>

        <md-button
          class="md-raised"
          @click="dialogActive = true"
        >
          Dialog
        </md-button>
      </div>

      <md-dialog-confirm
        v-hotkey.1="{ keys: 'N', selector: '.md-dialog-actions button' }"
        v-hotkey.2="{ keys: 'Y', selector: '.md-dialog-actions button ~ button' }"
        :md-active.sync="confirmActive"
        md-title="Test confirmation"
        md-content="Press Y or N to confirm or reject"
        md-confirm-text="Yes"
        md-cancel-text="No"
        @md-cancel="reported.push('N:confirm')"
        @md-confirm="reported.push('Y:confirm')"
      />

      <md-dialog
        v-hotkey.1="{ keys: 'ctrl+o', priority: 10, selector: '.button-1' }"
        v-hotkey.2="{ keys: 'ctrl+x', selector: '.button-2' }"
        :md-active.sync="dialogActive"
      >
        <md-dialog-title>Test dialog</md-dialog-title>

        <md-dialog-content>Lorem ipsum...</md-dialog-content>

        <md-dialog-actions>
          <md-button
            class="md-raised button-1"
            @click="reported.push('Ctrl-O:dialog:click'); dialogActive=false"
          >
            Ctrl-O
          </md-button>

          <md-button
            class="md-raised button-2"
            @click="reported.push('Ctrl-X:dialog:click'); dialogActive=false"
          >
            Ctrl-X
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
                enabled: false,
                reported: [],
                dialogActive: false,
                confirmActive: false,
            }
        },
    }
</script>

<style scoped>
</style>
