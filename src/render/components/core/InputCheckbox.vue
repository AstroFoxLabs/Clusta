<template lang="html">
    <div class="input-checkbox">
        <label class="input-checkbox-label" :for="`label-${getCurrentInstance()?.uid}`">{{ props.label }}</label>
        <input
            class="input-checkbox-input"
            type="checkbox"
            :id="`input-${getCurrentInstance()?.uid}`"
            v-model="model"
            :disabled="props.disabled"
        />
    </div>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

const props = defineProps({
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    label: {
        type: String,
        required: false,
        default: '',
    },
});

import { getCurrentInstance } from 'vue';

const model = defineModel({
    type: Boolean,
    required: true,
});

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
.input-checkbox {
    &-label {
    }
    &-input {
    }
}
</style>
