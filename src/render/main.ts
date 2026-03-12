import '@/styles/main.scss';
import App from '@render/App.vue';
import { useAppBootstrap } from '@render/composables/useAppBootstrap';
import router from '@render/router';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

const { initializeApp } = await useAppBootstrap();
try {
    await initializeApp();
    app.mount('#app');
} catch (error) {
    console.error('Initialization failed, stopping opening App.', error);
}
