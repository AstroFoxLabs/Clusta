import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    /* ---------------------------- STORES ---------------------------- */

    /* ---------------------------- STATES ---------------------------- */

    const eventMessages = ref<string[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNAL ------------------------- */

    /* ----------------------------- ACTIONS ------------------------- */

    const addEventMessage = (message: string): void => {
        eventMessages.value.push(message);
        setTimeout(() => {
            eventMessages.value.shift();
        }, 5000);
    };

    return {
        addEventMessage,
        eventMessages,
    };
});
