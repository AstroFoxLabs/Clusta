<template lang="html">
    <teleport to="body">
        <div class="modal">
            <div class="modal-content">
                <div class="modal-content-title">
                    <slot name="title"></slot>
                </div>
                <div class="modal-content-description">
                    <slot name="description"></slot>
                </div>
                <slot></slot>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
    import { onBeforeUnmount, onMounted } from 'vue';
    import { useModalStore } from '../../stores/modalStore';

    // --- PROPS & EMITS ---

    // --- STORES ---

    const modalStore = useModalStore();

    // --- STATES ---

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---

    // ESC key calls the onCancel callback if it exists, otherwise just sets modal to null
    const handleOnEsc = (e: KeyboardEvent) => {
        const currModal = modalStore.modal;
        if (e.key === 'Escape' && currModal) {
            if (currModal.type === 'dialog' && currModal.onCancel) {
                currModal.onCancel.cb();
                return;
            }
            if (currModal.type === 'input' && currModal.onCancel) {
                currModal.onCancel.cb();
                return;
            }
            modalStore.setModal(null);
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleOnEsc);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleOnEsc);
    });
</script>

<style scoped lang="scss">
    @use '../../styles/variables.scss' as *;

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: $z-index-modal;

        &-content {
            background-color: $primary-300;
            padding: 1.5rem 2rem;
            border-radius: $border-radius-md;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            max-width: 35rem;

            &-title {
                font-size: 1.25rem;
                font-weight: 500;
            }

            &-description {
                font-size: 1rem;
                color: $white-trans-75;
                text-align: center;
            }
        }
    }
</style>
