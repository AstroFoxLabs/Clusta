import '@/styles/main.scss';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { useAppBootstrap } from './composables/useAppBootstrap';
import router from './router';
const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

const { initializeApp } = await useAppBootstrap();
try {
    await initializeApp();
} catch (error) {
    console.error('Initialization failed, continuing to mount app', error);
}

// Always mount the app so the UI renders even if bootstrap failed
app.mount('#app');
