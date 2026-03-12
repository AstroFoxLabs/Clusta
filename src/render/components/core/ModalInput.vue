<template lang="html">
    <Modal v-if="modalStore.modal && modalStore.modal.type === 'input'">
        <template v-if="modalStore.modal.title" #title>
            <span class="input-modal-title">{{ modalStore.modal.title }}</span>
        </template>
        <template v-if="modalStore.modal.description" #description>
            <span class="input-modal-description">{{ modalStore.modal.description }}</span>
        </template>
        <InputField
            :label="modalStore.modal.inputLabel"
            :placeholder="modalStore.modal.inputPlaceholder"
            :initial-value="modalStore.modal.initialValue"
            ref="refInputField"
            class="input-modal-input-field"
            v-model="inputValue"
        />
        <div class="input-modal-actions">
            <button @click="modalStore.modal.onConfirm.cb(inputValue)" class="input-modal-action-confirm primary">
                {{ modalStore.modal.onConfirm.label }}
            </button>
            <button v-if="modalStore.modal.onCancel" @click="onCancel()" class="input-modal-action-cancel">
                {{ modalStore.modal.onCancel.label }}
            </button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useModalStore } from '@render/stores/modalStore';
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';
import InputField from './InputField.vue';
import Modal from './Modal.vue';

// --- PROPS & EMITS ---

// --- STORES ---

const modalStore = useModalStore();

// --- STATES ---

const inputValue = defineModel<string>({
    type: String,
    required: false,
    default: '',
});
const refInputField = useTemplateRef('refInputField');

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const handleOnEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (modalStore.modal && modalStore.modal.type === 'input') {
            modalStore.modal.onConfirm.cb(inputValue.value);
        }
    }
};

const onCancel = () => {
    if (modalStore.modal && modalStore.modal.type === 'input') {
        modalStore.modal.onCancel?.cb();
    }
};

watch(
    () => modalStore.modal,
    async () => {
        await nextTick();
        refInputField.value?.focus(); // calls the exposed focus()
    },
);

onMounted(() => {
    window.addEventListener('keydown', handleOnEnter);
    if (modalStore.modal?.type === 'input') {
        inputValue.value = modalStore.modal.initialValue || '';
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleOnEnter);
});
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.input-modal {
    &-actions {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    &-input-field {
        margin: 0.25rem 0;
    }
}
</style>
