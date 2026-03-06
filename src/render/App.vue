<template>
    <div class="app">
        <div class="app-router-view">
            <RouterView />
        </div>
        <div class="app-event-log">
            <EventNotification />
        </div>
        <RightClickMenu />
        <InputModal />
        <DialogModal />
    </div>
</template>

<script lang="ts" setup>
import DialogModal from './components/core/DialogModal.vue';
import InputModal from './components/core/InputModal.vue';
import EventNotification from './components/features/NotificationToast.vue';
import RightClickMenu from './components/features/RightClickMenu.vue';
</script>

<style lang="scss">
@use './styles/_variables.scss' as *;

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
        bottom: 1rem;
        right: 1rem;
        z-index: $z-index-toast;
    }
}
</style>
