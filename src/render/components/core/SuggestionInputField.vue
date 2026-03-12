<template lang="html">
    <FuzzySearch
        class="suggestion-input-field"
        :source-data="source"
        :filter-keys="[]"
        @on-update-results="onUpdateResults"
        ref="refInputField"
    >
        <template #fuzzy-search-suggestions>
            <datalist id="suggestions">
                <option v-for="hit in hits" :key="hit" :value="hit"></option>
            </datalist>
        </template>
    </FuzzySearch>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import FuzzySearch from './FuzzySearch.vue';

const props = defineProps({
    source: {
        type: Array as () => Array<any>,
        required: true,
    },
});

// --- PROPS & EMITS ---

// --- STORES ---

// --- STATES ---

const hits = ref<Array<any>>([]);
const refInputField = useTemplateRef('refInputField');

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onUpdateResults = (results: Array<any>) => {
    hits.value = [...results];
};

defineExpose({
    focus: () => {
        if (refInputField.value) {
            refInputField.value.focus();
        }
    },
});
</script>

<style scoped lang="scss">
.suggestion-input-field {
}
</style>
