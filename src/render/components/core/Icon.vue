<template lang="html">
    <div :class="`icon codicon codicon-${codiconName}`">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
// TODO: It might be better if we load .svg files as components and directly use them.
// That way, we can easily change their color via CSS and also have more control over their styling in general.

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
    width: inherit;
    height: inherit;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    line-height: 1.2;

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
