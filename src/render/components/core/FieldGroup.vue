<template lang="html">
    <div class="field-group">
        <div class="field-group-title" v-if="$slots.title">
            <slot name="title"></slot>
        </div>
        <div class="field-group-content">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
// This component is meant to be used as a wrapper for fields.
// Example: Settings page with multiple sections, each section can be a FieldGroup.

// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.field-group {
    &-title {
        font-size: 1.25rem;
        font-weight: 600;
        background-color: $white-trans-10;
        padding: 0.25rem 0.75rem;
        border-radius: $border-radius-sm;
    }
    &-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border: 2px solid $white-trans-10;
        border-radius: $border-radius-sm;
        margin-top: 0.25rem;
    }
}
</style>
