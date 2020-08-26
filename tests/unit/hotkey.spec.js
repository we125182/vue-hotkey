import Vue from 'vue'
import { mount } from '@vue/test-utils'

import hotkey from '@/../dist/directives.esm'
import HotkeyMock from './hotkey.mock.vue'


Vue.use(hotkey)


describe('v-hotkey', () => {

    it('could be unit-tested if new Event() were working properly in the test environment', () => {
    })
})
