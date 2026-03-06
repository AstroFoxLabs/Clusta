<template lang="html">
    <div class="image-context-window" :style="{ left: `${position.x}px`, top: `${position.y}px` }">
        <FieldGroup>
            <Field label="Image Name">
                <InputField v-model="tmpName" @on-submit="(value) => updateName(value)" />
            </Field>

            <Field label="Categories">
                <MultiSelectDropdown
                    :items="
                        categoryStore.collection.map(
                            (cat) =>
                                ({
                                    value: cat.id,
                                    displayName: cat.display_name,
                                    selected: props.image.categories?.some((c) => c.id === cat.id) || false,
                                }) as DropdownSelectionItem
                        )
                    "
                    @change="onCategorySelectionChanged"
                    @on-click-selected-item="onCategoryClick"
                />
            </Field>

            <Field label="Tags">
                <div class="image-context-window-chips">
                    <Chip
                        class="image-context-window-chip"
                        v-for="t in image.tags"
                        :key="t.id"
                        @click="async () => await tagStore.unassignFromImage(image.id, t.id)"
                    >
                        {{ t.technical_name }}
                    </Chip>

                    <InlineButtonInput
                        :enable-suggestion="true"
                        :suggestion-source="tagStore.collection.map((t) => t.technical_name)"
                        placeholder="Add Tag"
                        @on-submit="onSubmitTag"
                        class="image-context-window-inline-button-input"
                    >
                        <div class="codicon codicon-plus"></div>
                    </InlineButtonInput>
                </div>
            </Field>
        </FieldGroup>
    </div>
</template>

<script setup lang="ts">
    import type { CatalogImage, Coordinates } from '@shared/types';
    import { nextTick, onMounted, onUnmounted, ref } from 'vue';
    import MultiSelectDropdown from '@render/components/core/MultiSelectDropdown.vue';
    import type { DropdownSelectionItem } from '@render/components/core/MultiSelectDropdown.vue';
    import { useCategoryStore } from '@render/stores/categoryStore';
    import { useImageStore } from '@render/stores/imageStore';
    import InlineButtonInput from '../core/InlineButtonInput.vue';
    import { useTagStore } from '@render/stores/tagStore';
    import Chip from '../core/Chip.vue';
    import InputField from '../core/InputField.vue';
    import FieldGroup from '@render/components/core/FieldGroup.vue';
    import Field from '@render/components/core/Field.vue';
    // --- PROPS & EMITS ---

    const props = defineProps({
        image: {
            type: Object as () => CatalogImage,
            required: true,
        },
        position: {
            type: Object as () => Coordinates,
            required: false,
            default: () => ({ x: 0, y: 0 }),
        },
    });

    const emits = defineEmits(['onClose']);

    // --- STORES ---
    // TODO: ADD FIELDGROUP
    const categoryStore = useCategoryStore();
    const imageStore = useImageStore();
    const tagStore = useTagStore();

    // --- STATES ---

    const tmpName = ref<string>(props.image.name);

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---

    const onSubmitTag = async (e: KeyboardEvent, tag: string) => {
        const technicalName = tag.trim();
        if (technicalName.length === 0) {
            return;
        }
        try {
            const id = await tagStore.create(technicalName);
            if (id) {
                const tag = tagStore.collection.find((t) => t.id === id);
                if (!tag) {
                    throw new Error('Newly created tag not found in store');
                }
                tagStore.upsert([tag]);
                await tagStore.assignToImage(props.image.id, id);
            } else {
                throw new Error('Tag creation failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onCategorySelectionChanged = async (e: Event, items: DropdownSelectionItem[]) => {
        const imageCategoryIds = props.image.categories?.map((c) => c.id) || [];
        const selectedCategoryIds = items.filter((i) => i.selected).map((i) => i.value);
        const categoriesToAdd = selectedCategoryIds.filter((id) => !imageCategoryIds.includes(id));

        try {
            for (const id of categoriesToAdd) {
                await categoryStore.assignToImage(props.image.id, id);
            }
        } catch (error) {
            console.error('Failed to assign category:', error);
            return;
        }
    };

    const onCategoryClick = async (e: MouseEvent, id: string) => {
        const imageCategoryIds = props.image.categories?.map((c) => c.id) || [];
        if (imageCategoryIds.includes(id)) {
            try {
                await categoryStore.unassignFromImage(props.image.id, id);
            } catch (error) {
                console.error('Failed to unassign category:', error);
            }
        }
    };

    const updateName = async (value: string) => {
        const name = value.trim();
        if (name.toLocaleLowerCase() !== props.image.name.toLocaleLowerCase()) {
            try {
                await imageStore.updateName(props.image.id, name);
            } catch (error) {
                console.error('Failed to update image name:', error);
            }
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.image-context-window')) {
            emits('onClose', event);
        }
    };

    onMounted(() => {
        // If you click outside, it should close.
        window.addEventListener('mouseup', handleClickOutside);
    });

    onUnmounted(() => {
        window.removeEventListener('mouseup', handleClickOutside);
    });
</script>

<style scoped lang="scss">
    @use '@/styles/_variables' as *;

    .image-context-window {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background-color: $primary-600;
        border-radius: $border-radius-sm;
        position: fixed;
        z-index: $z-index-popover;
        box-shadow: $box-shadow-default;
        max-width: 40rem;

        &-chips {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }
    }
</style>
