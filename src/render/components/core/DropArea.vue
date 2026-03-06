<template lang="html">
    <div class="drop-area" @dragleave.prevent.stop="onDragLeave" @drop.prevent.stop="onDrop" @dragover.prevent>
        <span class="drop-area-overlay">Drop Here</span>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref } from 'vue';
    import { useMouse } from '@render/composables/mouse';

    // --- PROPS & EMITS ---

    const emits = defineEmits(['onClose', 'onDrop']);

    // --- STORES ---

    // --- STATES ---

    // --- COMPUTED ---

    const { x, y } = useMouse();

    // --- WATCHERS ---

    // --- METHODS ---

    const onDrop = (e: DragEvent) => {
        emits('onDrop', e);
        emits('onClose', e);
    };

    const onDragLeave = (e: DragEvent) => {
        emits('onClose', e);
    };

    const addEventListeners = () => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                emits('onClose', e);
            }
        });
    };

    const removeEventListeners = () => {
        window.removeEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                emits('onClose', e);
            }
        });
    };

    onMounted(() => {
        addEventListeners();
    });

    onUnmounted(() => {
        removeEventListeners();
    });
</script>

<style scoped lang="scss">
    .drop-area {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);

        &-overlay {
            position: absolute;
            left: v-bind(x) + 'px';
            top: v-bind(y) + 'px';
        }
    }
</style>
