<template lang="html">
    <div class="fuzzy-search">
        <InputField
            ref="fuzzyInputField"
            list="suggestions"
            placeholder="Search..."
            type="text"
            v-model="searchQuery"
            @blur="$emit('blur', $event)"
            :class="props.class"
        ></InputField>
        <slot name="fuzzy-search-suggestions"></slot>
    </div>
</template>

<script setup lang="ts">
    import { ref, watch, useTemplateRef } from 'vue';
    import Fuse from 'fuse.js';
    import { computed } from 'vue';
    import InputField from './InputField.vue';

    // Key decides which object properties are searched
    export interface FuzzySearchKey {
        name: string;
        displayName: string;
    }

    // --- PROPS & EMITS ---

    const props = defineProps({
        sourceData: {
            type: Array as () => Array<any>,
            required: true,
        },
        filterKeys: {
            type: Array as () => Array<FuzzySearchKey>,
            required: false,
        },
        class: {
            type: String,
            required: false,
            default: '',
        },
    });

    const emits = defineEmits(['onUpdateResults', 'onUpdateQuery', 'blur']);

    // --- STORES ---

    // --- STATES ---

    const searchQuery = defineModel({
        type: String,
        required: false,
        default: '',
    });

    const fuzzyInputField = useTemplateRef('fuzzyInputField');

    // --- COMPUTED ---

    const fuseOptions = computed(() => ({
        keys: props.filterKeys?.map((key) => key.name),
        findAllMatches: true,
        threshold: 0.5, // TODO: make configurable
        shouldSort: true,
    }));

    // --- WATCHERS ---

    watch(searchQuery, (newQuery) => {
        emits('onUpdateQuery', newQuery);
        performSearch();
    });

    watch(
        () => [props.sourceData, fuseOptions.value],
        () => performSearch(),
        { deep: true }
    );

    // --- METHODS ---

    const performSearch = () => {
        const fuse = new Fuse(props.sourceData, fuseOptions.value);

        const adjustedSQ = searchQuery.value.trim().toLocaleLowerCase();
        if (adjustedSQ.trim() === '') {
            // Empty -> return all results
            emits('onUpdateResults', props.sourceData);
            return;
        }
        const res = fuse.search(searchQuery.value as string);
        const matches = res.map((result) => result.item);
        emits('onUpdateResults', matches);
    };

    defineExpose({
        focus: () => {
            if (fuzzyInputField.value) {
                fuzzyInputField.value.focus();
            }
        },
    });
</script>

<style lang="scss" scoped>
    @use '../../styles/_variables' as *;

    .fuzzy-search {
        text-align: center;
    }
</style>
