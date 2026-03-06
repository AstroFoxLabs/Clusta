<template lang="html">
    <span v-if="active">
        <component
            :is="enableSuggestion ? SuggestionInputField : InputField"
            :source="suggestionSource"
            @keydown.enter.down="onSubmit"
            @keydown.esc="active = false"
            ref="refInputField"
            autofocus
            v-model="inputValue"
            class="inline-button-input-field"
            @blur="
                active = false;
                emits('blur', $event);
            "
        />
    </span>
    <button v-else @click="onButtonClick" class="inline-button-input-button">
        <slot> </slot>
    </button>
</template>
<script setup lang="ts">
    import { nextTick, ref, useTemplateRef } from 'vue';
    import InputField from './InputField.vue';
    import SuggestionInputField from './SuggestionInputField.vue';

    // --- PROPS & EMITS ---

    const props = defineProps({
        enableSuggestion: {
            type: Boolean,
            required: false,
            default: false,
        },
        suggestionSource: {
            type: Array as () => Array<any>,
            required: false,
            default: () => [],
        },
    });

    const emits = defineEmits(['onSubmit', 'blur']);

    // --- STORES ---

    // --- STATES ---

    const active = ref<boolean>(false);
    const inputValue = defineModel<string>({
        type: String,
        required: false,
        default: '',
    });
    const refInputField = useTemplateRef('refInputField');

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---

    const onButtonClick = (e: MouseEvent) => {
        active.value = !active.value;
        // Await next tick to ensure the input field is rendered before trying to focus it
        nextTick(() => refInputField.value?.focus());
    };

    const onSubmit = async (e: KeyboardEvent) => {
        const v = inputValue.value.trim();
        if (v.length !== 0) {
            emits('onSubmit', e, v);
        } else {
            console.warn('Input value is empty, not submitting');
        }
        inputValue.value = '';
        active.value = false;
    };
</script>
<style scoped lang="scss">
    @use '../../styles/_variables' as *;

    .inline-button-input {
        &-button {
            height: inherit;
            width: inherit;
            line-height: 0;
            font-size: inherit;
            outline: unset;
            color: $white-trans-75;
        }
        &-field {
            width: 100%;
        }
    }
</style>
