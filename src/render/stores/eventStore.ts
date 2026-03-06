import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useEventStore = defineStore('event', () => {
    /* ---------------------------- STORES ---------------------------- */

    /* ---------------------------- STATES ---------------------------- */

    const logMessages = ref<string[]>([]);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const addLogMessage = (message: string) => {
        logMessages.value = [message, ...logMessages.value];
    };

    const removeLogMessage = (index: number = 0) => {
        logMessages.value.splice(index, 1);
    };

    /* ----------------------------- ACTIONS ------------------------- */

    return {
        logMessages,
        addLogMessage,
        removeLogMessage,
    };
});
