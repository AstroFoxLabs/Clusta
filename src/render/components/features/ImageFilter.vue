<template lang="html">
    <div class="image-filter">
        <FuzzySearch
            @on-update-results="onUpdateSearchResults"
            v-model="searchQuery"
            :source-data="props.images"
            :filter-keys="enabledKeys"
            class="image-filter-search"
        />

        <div class="image-filter-toggles">
            <ToggleButton
                v-for="filterKey in props.filterKeys"
                :item="{
                    state: enabledKeys.includes(filterKey),
                    displayValue: filterKey.displayName,
                    value: filterKey,
                }"
                :state="enabledKeys.includes(filterKey)"
                class="image-filter-toggle"
                @on-change="toggleFilterKey"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FuzzySearchKey } from '@render/components/core/FuzzySearch.vue';
import FuzzySearch from '@render/components/core/FuzzySearch.vue';
import ToggleButton from '@render/components/core/ToggleButton.vue';
import { useCategoryStore } from '@render/stores/categoryStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import type { CatalogImage } from '@shared/types';
import { onMounted, ref, watch } from 'vue';

// --- PROPS & EMITS ---

const props = defineProps({
    showFilterOptions: {
        type: Boolean,
        default: true,
    },
    filterKeys: {
        type: Array as () => FuzzySearchKey[],
        required: false,
        default: () => [],
    },
    images: {
        type: Array as () => CatalogImage[],
        required: true,
    },
});

const emits = defineEmits(['onUpdate']);

// --- STORES ---

const categoryStore = useCategoryStore();
const settingsStore = useSettingsStore();

// --- STATES ---

const filteredImages = ref<CatalogImage[]>([]);

const searchQueryResults = ref<CatalogImage[]>([]);
const searchQuery = defineModel({
    type: String,
    required: false,
    default: '',
});

const enabledKeys = ref<FuzzySearchKey[]>(props.filterKeys);
// --- COMPUTED ---

// --- WATCHERS ---

watch(
    () => [categoryStore.selectedCategoryId, searchQueryResults.value, settingsStore.settings.grid],
    () => {
        applyFilters(props.images);
        onUpdate();
    },
    { deep: true },
);

// --- METHODS ---

const toggleFilterKey = (e: MouseEvent, key: FuzzySearchKey) => {
    if (enabledKeys.value.includes(key)) {
        enabledKeys.value = enabledKeys.value.filter((el: FuzzySearchKey) => el != key);
    } else {
        enabledKeys.value.push(key);
    }
};

const filterBySelectedCategory = (i: CatalogImage[]): CatalogImage[] => {
    const selectedCatID = categoryStore.selectedCategoryId;
    if (selectedCatID === 'uncategorized') {
        return i.filter((img) => img.categories.length === 0);
    } else if (selectedCatID === 'all') {
        return i;
    } else {
        return i.filter((img) => img.categories.some((cat) => cat.id == selectedCatID));
    }
};

const filterBySearchQueryResults = (i: CatalogImage[]): CatalogImage[] => {
    if (searchQuery.value.length === 0) {
        return i;
    }
    // Reverse because search results are returned in ascending order of relevance, but we want to show the most relevant first
    return i.filter((img) => searchQueryResults.value.map((i: CatalogImage) => i.id).includes(img.id)).reverse();
};

const onUpdateSearchResults = (results: CatalogImage[]) => {
    searchQueryResults.value = results;
};

const sortByFavorites = (i: CatalogImage[]): CatalogImage[] => {
    return i.sort((a, b) => {
        const aFav = a.is_favorite ? 1 : 0;
        const bFav = b.is_favorite ? 1 : 0;
        return bFav - aFav;
    });
};

const applyFilters = (rawImages: CatalogImage[]) => {
    let tmpImages = rawImages;
    tmpImages = filterBySelectedCategory(tmpImages);
    tmpImages = filterBySearchQueryResults(tmpImages);
    if (settingsStore.settings.grid.showFavoritesFirst) {
        tmpImages = sortByFavorites(tmpImages);
    }
    filteredImages.value = tmpImages;
};

const onUpdate = () => {
    emits('onUpdate', filteredImages.value);
};

onMounted(() => {
    applyFilters(props.images);
    onUpdate();
});
</script>

<style scoped lang="scss">
.image-filter {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;

    &-search {
        display: flex;
        align-items: center;
        font-size: 1.1rem;
        width: 100%;
        max-width: 15rem;
    }

    &-toggles {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.875rem;
    }

    &-toggle {
        vertical-align: middle;
    }
}
</style>
