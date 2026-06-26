import '@/styles/main.scss'

import { createApp, type Component } from 'vue'
import { createPinia } from 'pinia'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { prepareIconsLibrary } from '@/plugins/font-awesome.plugin'
import { useTheme } from '@/composables/useTheme'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const { initTheme } = useTheme()

initTheme()

prepareIconsLibrary()
app.component('font-awesome-icon', FontAwesomeIcon as Component)

app.use(createPinia())
app.use(router)

app.mount('#app')
