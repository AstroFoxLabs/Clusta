<template lang="html">
    <div class="field">
        <label class="field-label">{{ props.label }}</label>
        <div class="field-content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

const props = defineProps({
    // The label of the field
    label: {
        type: String,
        required: true,
    },
});

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.field {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;

    &-label {
        max-width: 20rem;
        width: 12.5rem;
        min-width: 12.5rem;
        align-content: center;
    }

    &-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>
