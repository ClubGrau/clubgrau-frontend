import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './routes'
import { i18n } from './i18n'
import { pinia } from './stores'
import { VueQueryPlugin, vueQueryOptions } from './query'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VueQueryPlugin, vueQueryOptions)

app.mount('#app')
