import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from './views/home/HomeView.vue';
import SettingsView from './views/settings/SettingsView.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'app', component: HomeView },
        { path: '/settings', name: 'settings', component: SettingsView },
    ],
});

export default router;
