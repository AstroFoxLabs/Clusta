<template lang="html">
    <div class="catalog-grid">
        <div class="catalog-grid-header">
            <ImageFilter
                v-if="!settingsStore.settings.grid.disableFilter"
                class="catalog-grid-filter"
                @on-update="onUpdateFilter"
                :images="gridImages"
                :filter-keys="filterKeys"
            />

            <div class="catalog-grid-categories">
                <ToggleButton
                    v-if="settingsStore.settings.grid.showCategoryAll"
                    :item="{
                        state: categoryStore.selectedCategoryId === 'all',
                        displayValue: 'All',
                        value: 'all',
                    }"
                    class="catalog-grid-categories-toggle"
                    @on-change="(e, v) => onChangeCategory(e, 'all')"
                />
                <ToggleButton
                    v-if="settingsStore.settings.grid.showCategoryUncategorized"
                    :item="{
                        state: categoryStore.selectedCategoryId === 'uncategorized',
                        displayValue: 'Uncategorized',
                        value: 'uncategorized',
                    }"
                    class="catalog-grid-categories-toggle"
                    @on-change="(e: PointerEvent, v) => onChangeCategory(e, 'uncategorized')"
                />
                <DropWrapper
                    v-for="category in categoryStore.collection"
                    :key="category.id"
                    @onDrop="(e: DragEvent) => onDropImageToCategory(e, category.id)"
                >
                    <ToggleButton
                        :item="{
                            state: categoryStore.selectedCategoryId === category.id,
                            displayValue: category.display_name,
                            value: category.id,
                        }"
                        class="catalog-grid-categories-toggle"
                        @on-change="(e: PointerEvent, v) => onChangeCategory(e, v)"
                        @click.right="(e: PointerEvent) => onCategoryRightClick(e, category.id)"
                    />
                </DropWrapper>
                <InlineButtonInput @on-submit="onSubmitNewCategory" class="catalog-grid-categories-add">
                    <Icon codicon-name="add"></Icon>
                </InlineButtonInput>
            </div>
        </div>

        <Grid
            :images="displayedImages"
            class="catalog-grid-grid"
            @dragenter="onGridDragEnter"
            @click.right="onOpenGridMenu"
            :filterKeys="[
                { name: 'name', displayName: 'Name' },
                { name: 'tags.technical_name', displayName: 'Tags' },
            ]"
        >
            <template #default="{ images }">
                <DragElement
                    v-for="image in images"
                    :key="image.id"
                    :image-src="`${settingsStore.settings.paths.images}/${image.hash}.${settingsStore.settings.image.conversion.format}`"
                    :data="image"
                >
                    <GridImage
                        :image="image"
                        :selected="selectedImage?.id === image.id"
                        @on-click="selectImage"
                        class="catalog-grid-image"
                    />
                </DragElement>

                <DropArea
                    v-if="showDropArea"
                    class="catalog-grid-drop-area"
                    @on-close="onCloseDropArea"
                    @on-drop="onDropDropArea"
                />
            </template>
        </Grid>

        <teleport to="body">
            <CloseableWindow
                @on-close="closeContextWindow($event, null)"
                v-if="selectedImage"
                :position="ctxWinPosition"
            >
                <ImageContextWindow
                    :image="selectedImage"
                    class="catalog-grid-context-window"
                    @on-close="(e: PointerEvent) => closeContextWindow(e, null)"
                />
            </CloseableWindow>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import CloseableWindow from '@render/components/core/CloseableWindow.vue';
import DragElement from '@render/components/core/DragElement.vue';
import DropArea from '@render/components/core/DropArea.vue';
import DropWrapper from '@render/components/core/DropWrapper.vue';
import type { FuzzySearchKey } from '@render/components/core/FuzzySearch.vue';
import Grid from '@render/components/core/Grid.vue';
import GridImage from '@render/components/core/GridImage.vue';
import Icon from '@render/components/core/Icon.vue';
import InlineButtonInput from '@render/components/core/InlineButtonInput.vue';
import ToggleButton from '@render/components/core/ToggleButton.vue';
import ImageFilter from '@render/components/features/ImageFilter.vue';
import type { RightClickMenu } from '@render/stores/appStore';
import { INTERNAL_DATA_TRANSFER_TYPE, useAppStore } from '@render/stores/appStore';
import { useCategoryStore } from '@render/stores/categoryStore';
import { useImageStore } from '@render/stores/imageStore';
import type { ModalDialog, ModalInput } from '@render/stores/modalStore';
import { useModalStore } from '@render/stores/modalStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { openFileExplorerForImageUpload, uploadFileList } from '@render/utils';
import type { CatalogImage } from '@shared/types';
import { PointerEvent } from 'react';
import { computed, ref } from 'vue';
import ImageContextWindow from './ImageContextWindow.vue';

// --- PROPS & EMITS ---

// --- STORES ---

const appStore = useAppStore();
const imageStore = useImageStore();
const categoryStore = useCategoryStore();
const modalStore = useModalStore();
const settingsStore = useSettingsStore();

// --- STATES ---

const selectedImage = ref<CatalogImage | null>(null);
const showDropArea = ref(false);

const ctxWinPosition = ref({ x: 0, y: 0 });
const gridImages = computed(() => imageStore.collection); // Raw, before filters
const displayedImages = ref<CatalogImage[]>(gridImages.value); // After filters
const filterKeys = ref<FuzzySearchKey[]>([
    { displayName: 'Name', name: 'name' },
    { displayName: 'Tags', name: 'tags.technical_name' },
]);

// --- COMPUTED ---

// --- WATCHERS ---

// --- METHODS ---

const onGridDragEnter = (e: DragEvent) => {
    const types = e.dataTransfer?.types;
    if (types) {
        // We want to avoid showing drop area if we drag app data
        if (!types.includes(INTERNAL_DATA_TRANSFER_TYPE) && types.includes('Files')) {
            showDropArea.value = true;
            return;
        }
    }
    showDropArea.value = false;
};

const onCloseDropArea = (e: DragEvent) => {
    showDropArea.value = false;
};

const onDropDropArea = async (e: DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length == 0) {
        console.warn('No files found in drop event.');
        return;
    }

    if (e.dataTransfer?.types.includes(INTERNAL_DATA_TRANSFER_TYPE)) {
        return;
    }

    await uploadFileList(files);
    showDropArea.value = false;
};

const closeContextWindow = (e: PointerEvent, image: CatalogImage | null) => {
    selectedImage.value = null;
};

const selectImage = (e: PointerEvent, image: CatalogImage) => {
    if (selectedImage.value && selectedImage.value.id === image.id) {
        selectedImage.value = null;
    } else {
        ctxWinPosition.value = { x: e.clientX, y: e.clientY };
        selectedImage.value = image;
    }
};

const onUpdateFilter = (i: CatalogImage[]) => {
    displayedImages.value = i;
};

const onDropImageToCategory = async (e: DragEvent, cID: string) => {
    const data = e.dataTransfer?.getData(INTERNAL_DATA_TRANSFER_TYPE);
    if (data && cID !== 'uncategorized' && cID !== 'all') {
        const image = JSON.parse(data);
        if (image && image.id && image.hash) {
            await categoryStore.assignToImage(image.id, cID);
        }
    }
};

const onChangeCategory = (e: PointerEvent, cID: string) => {
    if (cID === 'all') {
        categoryStore.selectedCategoryId = 'all';
    } else if (cID === 'uncategorized') {
        categoryStore.selectedCategoryId = 'uncategorized';
    } else {
        const category = categoryStore.collection.find((cat) => cat.id === cID);
        if (category) {
            categoryStore.selectedCategoryId = cID;
        } else {
            console.warn('Category not found for id:', cID);
        }
    }
};

const onCategoryRightClick = (e: PointerEvent, cID: string) => {
    if (cID === 'uncategorized' || cID === 'all') {
        return;
    }
    appStore.setRightClickMenu({
        x: e.clientX,
        y: e.clientY,
        cb: [
            {
                label: 'Rename Category',
                cb: async () => {
                    const c = categoryStore.collection.find((c) => c.id === cID);
                    if (!c) {
                        console.error('Category not found for id:', cID);
                        return;
                    }
                    modalStore.setModal({
                        title: `Rename Category "${c.display_name}"`,
                        description: `Enter a new name`,
                        type: 'input',
                        inputLabel: 'Category Name',
                        inputPlaceholder: 'New category name',
                        initialValue: c.display_name,
                        onConfirm: {
                            label: 'Confirm',
                            cb: async (newName: string) => {
                                await categoryStore.update({
                                    ...c,
                                    display_name: newName,
                                });
                                modalStore.setModal(null);
                            },
                        },
                        onCancel: {
                            label: 'Cancel',
                            cb: () => {
                                modalStore.setModal(null);
                            },
                        },
                    } as ModalInput);
                },
            },
            {
                label: 'Delete Category',
                cb: async () => {
                    modalStore.setModal({
                        title: 'Delete Category',
                        description: `Are you sure you want to delete the category "${categoryStore.collection.find((c) => c.id === cID)?.display_name}"?`,
                        type: 'dialog',
                        onConfirm: {
                            label: 'Delete',
                            cb: async () => {
                                await categoryStore.deleteRecord(cID);
                                modalStore.setModal(null);
                            },
                        },
                        onCancel: {
                            label: 'Cancel',
                            cb: () => {
                                modalStore.setModal(null);
                            },
                        },
                    } as ModalDialog);
                },
            },
        ],
    } as RightClickMenu);
};

const onSubmitNewCategory = async (e: KeyboardEvent, categoryName: string) => {
    await categoryStore.create(categoryName);
};

const onOpenGridMenu = (e: PointerEvent) => {
    appStore.setRightClickMenu({
        x: e.clientX,
        y: e.clientY,
        cb: [
            {
                label: 'Add New Image',
                cb: async () => {
                    await openFileExplorerForImageUpload(async (files: FileList) => {
                        await uploadFileList(files);
                    });
                },
            },
        ],
    } as RightClickMenu);
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;
.catalog-grid {
    padding: 1rem;
    position: relative;

    &-header {
        padding: 0.5rem;
        position: sticky;
        top: 0;
        z-index: 10;
        background-color: $primary-300;
        container-type: inline-size; // Easy way to make child elements react to available width for responsive design
    }
    &-filter {
        margin-bottom: 1rem;
        border-bottom: 1px solid #ffffff0d;
        padding-bottom: 1rem;
    }

    &-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        border-bottom: 1px solid #ffffff0d;
        padding: 1rem 0;
        font-size: 0.875rem;

        &-add {
            height: 100%;
        }
    }

    &-grid {
        padding: 0 1rem 1rem 1rem;
        min-height: 75vh;
        z-index: 0;
        position: relative;
    }

    &-image {
    }

    &-drop-area {
    }

    &-context-window {
    }
}

// based on parent container width
@container (max-width: 200px) {
    .catalog-grid-categories {
        display: none;
    }

    .catalog-grid-filter {
        display: none;
    }
}
</style>
