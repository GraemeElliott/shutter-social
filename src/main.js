import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import './index.css';

const pinia = createPinia();

loadFonts();

createApp(App).use(router).use(vuetify).use(pinia).mount('#app');
