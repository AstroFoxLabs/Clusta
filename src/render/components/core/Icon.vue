<template lang="html">
    <div :class="`icon codicon codicon-${codiconName}`">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
// --- PROPS & EMITS ---

const props = defineProps({
    codiconName: {
        type: String,
        required: false,
        default: 'custom',
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
.icon {
    justify-content: center;
    align-items: center;
    line-height: 1.2;
    font-size: 20px;
    height: 100%;
    display: inline;
    align-content: center;

    &:hover {
        :deep(svg) {
            *:not([fill]) {
                fill: $white-trans-90;
                color: $white-trans-90;
            }
        }
    }

    :deep(svg) {
        * {
            fill: $white-trans-75;
            color: $white-trans-75;
        }
    }

    &:active {
        filter: brightness(0.5);
    }
}

.codicon {
    fill: $white-trans-75;
    color: $white-trans-75;

    &:hover {
        cursor: pointer;
        fill: $white-trans-90;
        color: $white-trans-90;
    }
}
</style>
