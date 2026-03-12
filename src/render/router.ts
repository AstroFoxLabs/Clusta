import HomeView from '@render/views/home/HomeView.vue';
import SettingsView from '@render/views/settings/SettingsView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'app', component: HomeView },
        { path: '/settings', name: 'settings', component: SettingsView },
    ],
});

export default router;
