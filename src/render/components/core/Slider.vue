<template lang="html">
    <input
        type="range"
        @change="onChange"
        v-model.number="model"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        draggable="false"
        class="slider"
    />
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

const props = defineProps({
    min: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: 100,
    },
    step: {
        type: Number,
        default: 10,
    },
});

const emits = defineEmits(['onChange', 'onInput']);

// --- STORES ---

// --- STATES ---

const model = defineModel({
    type: Number,
    default: 50,
});

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

// Happens after letting go of the slider
const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    emits('onChange', e, parseInt(target.value));
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.slider {
    background-color: transparent;
    -webkit-appearance: none;
    appearance: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: $border-radius-full;
        outline: none;
        background-color: $white-500;
        pointer-events: none;

        &:hover {
            background-color: $white;
            cursor: pointer;
        }
    }

    &::-webkit-slider-runnable-track {
        height: 10px;
        background: $primary-800;
        border-radius: $border-radius-full;

        &:hover {
            cursor: pointer;
        }
    }
}
</style>
