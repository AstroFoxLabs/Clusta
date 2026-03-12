<template lang="html">
    <div
        class="drag-element"
        @dragend.prevent.stop="onDragEnd"
        @dragstart="onDragStart"
        draggable="true"
        ref="dragElement"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { INTERNAL_DATA_TRANSFER_TYPE } from '@render/stores/appStore';
import { useTemplateRef } from 'vue';

// --- PROPS & EMITS ---

const props = defineProps({
    data: {
        type: null,
        required: true,
    },
    imageSrc: {
        type: String,
        required: false,
        default: null,
    },
});

const emits = defineEmits(['onDragEnd', 'onDragStart']);

// --- STORES ---

// --- STATES ---

const dragElement = useTemplateRef('dragElement');
const ghostImageOptions = {
    width: 50,
    height: 50,
    src: props.imageSrc || '',
    top: -1000,
    left: -1000,
    position: 'absolute' as const,
};

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onDragEnd = (e: DragEvent) => {
    const el = dragElement.value as HTMLElement;
    el.classList.remove('drag-element-item');
    emits('onDragEnd', e);
};

const onDragStart = (e: DragEvent) => {
    const el = dragElement.value as HTMLElement;
    el.classList.add('drag-element-item');
    // image is being dragged -> set custom ghost image
    if (props.imageSrc) {
        const ghost = document.createElement('img');
        ghost.src = ghostImageOptions.src;
        ghost.style.width = `${ghostImageOptions.width}px`;
        ghost.style.height = `${ghostImageOptions.height}px`;
        ghost.style.position = ghostImageOptions.position;
        ghost.style.top = `${ghostImageOptions.top}px`;
        ghost.style.left = `${ghostImageOptions.left}px`;

        // When using an HTML Element, it must be appended to the DOM
        // We position it off-screen to keep it invisible for the user
        ghost.classList.add('drag-ghost');
        document.body.appendChild(ghost);
        e.dataTransfer?.setDragImage(ghost, 0, 0);
    }
    e.dataTransfer?.setData(INTERNAL_DATA_TRANSFER_TYPE, JSON.stringify(props.data));
    emits('onDragStart', e);
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.drag-element {
    display: contents;

    cursor: grab;
    img {
        // prevent ghost image from being draggable itself
        pointer-events: none;
    }

    &-item {
        > * {
            opacity: 0.75;
            outline: 2px dashed $accent-400 !important;
            border: none;
        }
    }
}
</style>
