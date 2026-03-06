<template lang="html">
    <div class="notification-toast">
        <div class="notification-toast-message" v-for="message in messages" :key="message">
            {{ message }}
        </div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';
    import { useEventStore } from '../../stores/eventStore';

    // --- PROPS & EMITS ---

    // --- STORES ---

    const eventStore = useEventStore();

    // --- STATES ---

    const messages = ref<string[]>([]);

    const intervalId = ref<number | null>(null);

    // --- COMPUTED ---

    // --- WATCHERS ---

    // add new message to the component when eventStore.logMessages changes
    watch(
        () => eventStore.logMessages.length,
        (newLen, oldLen) => {
            if (newLen > oldLen) {
                messages.value.push(eventStore.logMessages[newLen - 1]);
                // reset the interval so messages stay longer when new ones arrive
                if (intervalId.value) {
                    clearInterval(intervalId.value);
                }
                intervalId.value = window.setInterval(() => {
                    if (messages.value.length > 0) {
                        messages.value.shift();
                    }
                }, 5000);
            }
        }
    );

    // --- METHODS ---
</script>

<style scoped lang="scss">
    .notification-toast {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        &-message {
            padding: 1rem;
            background-color: RGBA(0, 0, 0, 0.5);
            color: white;
            border-radius: 0.25rem;
        }
    }
</style>
