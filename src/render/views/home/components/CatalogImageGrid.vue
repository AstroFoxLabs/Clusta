<template lang="html">
    <div class="catalog-grid">
        <div class="catalog-grid-container">
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
                    <span class="codicon codicon-add"></span>
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
                    :image-src="`${settingsStore.settings.paths.imageDefaultPath}/${image.hash}.${settingsStore.settings.image.conversion.format}`"
                    :data="image"
                >
                    <GridImage
                        :image="image"
                        :selected="selectedImage?.id === image.id"
                        @on-click="onSelectImage"
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
            <ImageContextWindow
                v-if="selectedImage"
                :image="selectedImage"
                :position="ctxWinPosition"
                @on-close="onSelectImage"
                class="catalog-grid-context-window"
            />
        </teleport>
    </div>
</template>

<script setup lang="ts">
    import { useAppStore, INTERNAL_DATA_TRANSFER_TYPE } from '../../../stores/appStore';
    import type { RightClickMenu } from '../../../stores/appStore';
    import Grid from '../../../components/core/Grid.vue';
    import GridImage from '../../../components/core/GridImage.vue';
    import DragElement from '../../../components/core/DragElement.vue';
    import { computed, ref } from 'vue';
    import type { CatalogImage } from '@shared/types';
    import { useImageStore } from '../../../stores/imageStore';
    import DropArea from '@render/components/core/DropArea.vue';
    import ImageContextWindow from '@render/components/features/ImageContextWindow.vue';
    import ImageFilter from '@render/components/features/ImageFilter.vue';
    import ToggleButton from '@render/components/core/ToggleButton.vue';
    import { useCategoryStore } from '@render/stores/categoryStore';
    import DropWrapper from '@render/components/core/DropWrapper.vue';
    import { useModalStore } from '@render/stores/modalStore';
    import type { DialogModal, InputModal } from '@render/stores/modalStore';
    import InlineButtonInput from '@render/components/core/InlineButtonInput.vue';
    import { useSettingsStore } from '@render/stores/settingsStore';
    import { openFileExplorerForImageUpload, uploadFileList } from '@render/utils/utils';
    import { PointerEvent } from 'react';
    import type { FuzzySearchKey } from '@render/components/core/FuzzySearch.vue';

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
            if (types.includes(INTERNAL_DATA_TRANSFER_TYPE)) {
                console.warn('Grid detected internal drag&drop.');
            } else {
                if (types.includes('Files')) {
                    showDropArea.value = true;
                    return;
                }
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
            console.warn('Drop event contains internal data transfer type. Ignoring onDrop handler.');
            return;
        }

        await uploadFileList(files);
        showDropArea.value = false;
    };

    const onSelectImage = (e: PointerEvent, image: CatalogImage | null) => {
        ctxWinPosition.value = { x: e.clientX, y: e.clientY };
        selectedImage.value = image;
    };

    const onUpdateFilter = (i: CatalogImage[]) => {
        displayedImages.value = i;
    };

    const onDropImageToCategory = async (e: DragEvent, cID: string) => {
        const data = e.dataTransfer?.getData(INTERNAL_DATA_TRANSFER_TYPE);
        if (data && cID !== 'uncategorized' && cID !== 'all') {
            const image = JSON.parse(data);
            if (image && image.id && image.hash) {
                try {
                    await categoryStore.assignToImage(image.id, cID);
                } catch (error) {
                    console.error('Error assigning category to image:', error);
                }
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
                        modalStore.setModal({
                            title: 'Rename Category',
                            description: `Enter a new name for the category "${categoryStore.collection.find((c) => c.id === cID)?.display_name}":`,
                            type: 'input',
                            inputLabel: 'Category Name',
                            inputPlaceholder: 'New category name',
                            initialValue: categoryStore.collection.find((c) => c.id === cID)?.display_name,
                            onConfirm: {
                                label: 'Confirm',
                                cb: async (newName: string) => {
                                    await categoryStore.updateName(cID, newName);
                                    modalStore.setModal(null);
                                },
                            },
                            onCancel: {
                                label: 'Cancel',
                                cb: () => {
                                    modalStore.setModal(null);
                                },
                            },
                        } as InputModal);
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
                        } as DialogModal);
                    },
                },
            ],
        } as RightClickMenu);
    };

    const onSubmitNewCategory = async (e: KeyboardEvent, categoryName: string) => {
        try {
            const id = await categoryStore.create(categoryName);
            if (!id) {
                throw new Error('Category creation failed');
            }
            const c = categoryStore.collection.find((c) => c.id === id);
            if (!c) {
                throw new Error('Category not found after creation');
            }
            categoryStore.upsert([c]);
        } catch (error) {
            console.error('Error creating new category:', error);
        }
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
    @use '../../../styles/variables' as *;
    .catalog-grid {
        padding: 1rem;

        &-container {
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
            padding-bottom: 1rem;
            font-size: 0.875rem;
        }

        &-grid {
            padding: 0 1rem 1rem 1rem;
        }

        &-image {
        }

        &-drop-area {
        }

        &-context-window {
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
    }
</style>
