import Vue from "vue"
import VueMaterial from 'vue-material'
// import hotkey from '@/../dist/directives.esm'
import hotkey from '@/vue-hotkey/hotkey'
import Test from "@/components/Test.vue"
import "@/main.css"


Vue.config.productionTip = false

Vue.use(VueMaterial)
Vue.use(hotkey)


new Vue({
    el: "#app",
    render: h => h(Test),
})
