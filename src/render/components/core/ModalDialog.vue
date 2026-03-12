<template lang="html">
    <Modal class="dialog-modal" v-if="modalStore.modal && modalStore.modal.type === 'dialog'">
        <template v-if="modalStore.modal.title" #title>
            <span class="dialog-modal-title">{{ modalStore.modal.title }}</span>
        </template>

        <template v-if="modalStore.modal.description" #description>
            <span class="dialog-modal-description">{{ modalStore.modal.description }}</span>
        </template>

        <div class="dialog-modal-actions">
            <button @click="modalStore.modal.onConfirm.cb()" class="dialog-modal-button-confirm primary">
                {{ modalStore.modal.onConfirm.label }}
            </button>
            <button v-if="modalStore.modal.onCancel" @click="onCancel()" class="dialog-modal-button-cancel">
                {{ modalStore.modal.onCancel.label }}
            </button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useModalStore } from '@render/stores/modalStore';
import Modal from './Modal.vue';

// --- PROPS & EMITS ---

// --- STORES ---

const modalStore = useModalStore();

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onCancel = () => {
    if (modalStore.modal && modalStore.modal.type === 'dialog') {
        modalStore.modal.onCancel?.cb();
    }
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.dialog-modal {
    &-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
    }
}
</style>
