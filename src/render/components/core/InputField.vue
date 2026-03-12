<template lang="html">
    <input
        class="input-field"
        :placeholder="placeholder"
        @keydown.enter="onSubmit"
        v-model="model"
        type="text"
        @blur="$emit('blur', $event, model)"
        ref="refInputField"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue';

// --- PROPS & EMITS ---

const props = defineProps({
    label: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: false,
    },
});

const model = defineModel({
    type: null,
    required: true,
});

// TODO: Use the V-Model recommended pattern with defineModel
const emit = defineEmits(['onSubmit', 'blur']);
// --- STORES ---

// --- STATES ---

const refInputField = ref<HTMLInputElement | null>(null);

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onSubmit = (e: KeyboardEvent) => {
    refInputField.value?.blur();
    emit('onSubmit', e, model.value);
};

defineExpose({
    focus: () => {
        if (refInputField.value) {
            refInputField.value.focus();
        }
    },
});
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.input-field {
    background-color: $primary-700;
    border: none;
    box-shadow: none;
    border-radius: $border-radius-sm;
    padding: 0.25rem 0.5rem;
    color: $text-normal;
    width: inherit;
    font-size: inherit;
    font-weight: 500;

    &:focus-visible {
        border: none;
        box-shadow: none;
        outline: 2px solid $accent-400;
    }
}
</style>
