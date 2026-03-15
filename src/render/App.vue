<template>
    <div class="app">
        <div class="app-router-view">
            <RouterView />
        </div>
        <div class="app-event-log">
            <div class="app-event-log-toast">
                <div
                    class="app-event-log-toast-message"
                    v-for="message in notificationStore.eventMessages"
                    :key="message"
                >
                    {{ message }}
                </div>
                <slot></slot>
            </div>
        </div>
        <RightClickMenu />
        <ModalInput />
        <ModalDialog />
    </div>
</template>

<script lang="ts" setup>
import ModalDialog from '@render/components/core/ModalDialog.vue';
import ModalInput from '@render/components/core/ModalInput.vue';
import RightClickMenu from '@render/components/features/RightClickMenu.vue';
import { useModalStore } from '@render/stores/modalStore';
import { useNotificationStore } from '@render/stores/notificationStore';
const notificationStore = useNotificationStore();
const modalStore = useModalStore();
</script>

<style lang="scss">
@use '@render/styles/variables' as *;

.app {
    display: flex;
    height: 100vh;
    font-family: $font-title;
    flex-direction: column;

    &-router-view {
        width: 100%;
        height: 100%;
    }

    &-event-log {
        position: fixed;
        bottom: 4rem;
        right: 4rem;
        z-index: $z-index-toast;
        font-size: 1.2rem;

        &-toast {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            &-message {
                padding: 1rem;
                background-color: rgba(22, 38, 41, 0.75);
                color: $white;
                border-radius: 0.25rem;
            }
        }
    }
}
</style>
