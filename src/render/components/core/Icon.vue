<template lang="html">
    <div class="icon">
        <img class="icon-img" :src="`assets/icons/${props.name}.svg`" />
    </div>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

const props = defineProps({
    name: {
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
.icon {
    &-img {
        height: 100%;
        width: 100%;

        &:hover {
            filter: brightness(0.8);
            cursor: pointer;
        }

        &:active {
            filter: brightness(0.6);
        }
    }
}
</style>
