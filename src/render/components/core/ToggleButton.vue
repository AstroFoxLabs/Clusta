<template lang="html">
    <button
        :class="`toggle-button ${item.state ? '' : 'disable'}`"
        @click="
            state = !state;
            emits('onChange', $event, item.value);
        "
    >
        {{ props.item.displayValue }}
    </button>
</template>

<script setup lang="ts">
    import { ref } from 'vue';

    export interface ToggleButtonItem {
        state: boolean;
        displayValue: string;
        value: unknown;
    }

    // --- PROPS & EMITS ---

    const props = defineProps({
        item: {
            type: Object as () => ToggleButtonItem,
            required: true,
        },
    });

    const emits = defineEmits(['onChange']);
    const state = ref(props.item.state);

    const model = defineModel({
        type: Boolean,
        default: false,
    });

    // --- STORES ---

    // --- STATES ---

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---
</script>

<style scoped lang="scss">
    @use '../../styles/variables' as *;

    .toggle-button {
        color: $white-400;
        border-radius: $border-radius-md;
        background-color: transparent;
        color: $white;
        font-size: inherit;
        outline: 2px solid $accent-400;

        &:hover {
            cursor: pointer;
            filter: brightness(1.1);
        }

        &.disable {
            color: $white-trans-50;
            outline: 2px solid $primary-700;
        }
    }
</style>
