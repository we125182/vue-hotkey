import Vue from "vue"
import VueMaterial from 'vue-material'
import hotkey from '@/../dist/directives.esm'
import Demo from "@/components/Demo.vue"
import "@/main.css"


Vue.config.productionTip = false

Vue.use(VueMaterial)
Vue.use(hotkey)


new Vue({
    el: "#app",
    render: h => h(Demo),
})
