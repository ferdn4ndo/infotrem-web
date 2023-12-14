import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { prepareIconsLibrary } from '@/plugins/font-awesome.plugin'

import App from './App.vue'
import router from './router'

const app = createApp(App)

prepareIconsLibrary()
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
