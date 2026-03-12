<template lang="html">
    <div
        class="drop-wrapper"
        @drop.prevent.stop="onDrop"
        @dragleave="onDragLeave"
        @dragover.prevent.stop="onDragOver"
        ref="dropWrapper"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
// This compoent is used as a wrapper for drop areas.
// This means you can wrap any component with this DropWrapper and enable dropping
// and additionally control the visuals

import type { Ref } from 'vue';
import { useTemplateRef } from 'vue';

// --- PROPS & EMITS ---

const emits = defineEmits(['onDrop']);
const dropWrapper = useTemplateRef('dropWrapper') as Ref<HTMLElement>;

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onDrop = (e: DragEvent) => {
    const dWrapper = dropWrapper.value;
    dWrapper.classList.remove('drag');
    emits('onDrop', e);
};

const onDragLeave = (e: DragEvent) => {
    const dWrapper = dropWrapper.value;
    dWrapper.classList.remove('drag');
};

// It would be more nice, to have this in DragEnter, but it glitches too much. Fix?
const onDragOver = (e: DragEvent) => {
    const dWrapper = dropWrapper.value;
    dWrapper.classList.add('drag');
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.drop-wrapper {
}

.drag {
    background-color: rgba(255, 255, 255, 0.3);
    outline: 2px solid $accent-400;
    border-radius: 10px;
}
</style>
