<template lang="html">
    <div class="closeable-window" :style="containerStyle">
        <div class="closeable-window-topbar">
            <div class="closeable-window-topbar-close-button" @click="$emit('onClose')">
                <Icon codicon-name="close" />
            </div>
        </div>
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed } from 'vue';
import Icon from './Icon.vue';

// --- PROPS & EMITS ---

const props = defineProps({
    position: {
        type: Object as () => { x: number; y: number },
        required: false,
        default: null,
    },
});

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// CSSProperties needed to avoid TS error
const containerStyle = computed<CSSProperties | undefined>(() => {
    if (!props.position) return undefined;

    return {
        position: 'absolute',
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
    };
});

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.closeable-window {
    background-color: red;
    z-index: $z-index-window;
    padding: 1rem;
    border-radius: $border-radius-sm;
    box-shadow: $box-shadow-default;
    background-color: $primary-600;

    &-topbar {
        width: 100%;
        height: 2rem;
        display: flex;
        justify-content: flex-end;

        &-close-button {
            cursor: pointer;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}
</style>
