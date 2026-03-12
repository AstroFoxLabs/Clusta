<template lang="html">
    <span class="chip"><slot></slot></span>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.chip {
    padding: 0.25rem 0.5rem;
    border: 1px solid $white-trans-50;
    border-radius: $border-radius-full;
    font-size: 0.85rem;
    font-weight: 500;
    height: fit-content;
    font-family: $font-input;

    &:hover {
        background-color: $primary-400;
        cursor: pointer;
    }
}
</style>
