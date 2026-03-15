<template lang="html">
    <div class="image-context-window">
        <FieldGroup>
            <template #title>
                <div class="field-group-title">
                    <img class="field-group-title-img" :src="imagePath" alt="" />
                    <div class="field-group title text">{{ image.name }}</div>
                </div>
            </template>
            <Field label="Image Name">
                <InputField v-model="tmpName" @on-submit="updateName" @blur="updateName" />
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
                                }) as DropdownSelectionItem,
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
                        <Icon codicon-name="plus"></Icon>
                    </InlineButtonInput>
                </div>
            </Field>
        </FieldGroup>
    </div>
</template>

<script setup lang="ts">
import Chip from '@render/components/core/Chip.vue';
import Field from '@render/components/core/Field.vue';
import FieldGroup from '@render/components/core/FieldGroup.vue';
import Icon from '@render/components/core/Icon.vue';
import InlineButtonInput from '@render/components/core/InlineButtonInput.vue';
import InputField from '@render/components/core/InputField.vue';
import type { DropdownSelectionItem } from '@render/components/core/MultiSelectDropdown.vue';
import MultiSelectDropdown from '@render/components/core/MultiSelectDropdown.vue';
import { useCategoryStore } from '@render/stores/categoryStore';
import { useImageStore } from '@render/stores/imageStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import { useTagStore } from '@render/stores/tagStore';
import type { CatalogImage } from '@shared/types';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// --- PROPS & EMITS ---

const props = defineProps({
    image: {
        type: Object as () => CatalogImage,
        required: true,
    },
});

const emits = defineEmits(['onClose']);

// --- STORES ---
const categoryStore = useCategoryStore();
const imageStore = useImageStore();
const tagStore = useTagStore();
const settingsStore = useSettingsStore();

// --- STATES ---

const tmpName = ref<string>(props.image.name);

// --- COMPUTED ---

const imagePath = computed(
    () =>
        `${settingsStore.settings.paths.images}/${props.image.hash}.${settingsStore.settings.image.conversion.format}`,
);

// --- WATCHERS ---

watch(
    () => props.image.name,
    (newName) => {
        tmpName.value = newName;
    },
);

// --- METHODS ---

const onSubmitTag = async (e: KeyboardEvent, tagName: string) => {
    const technicalName = tagName.trim();
    if (technicalName.length === 0) return;
    const tag = tagStore.collection.find((t) => t.technical_name === technicalName);
    if (tag) {
        const isAlreadyAssigned = props.image.tags.some((t) => t.id === tag.id);
        if (!isAlreadyAssigned) {
            await tagStore.assignToImage(props.image.id, tag.id);
        }
    } else {
        const newTag = await tagStore.create(technicalName);
        await tagStore.assignToImage(props.image.id, newTag.id);
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
    } catch (err) {
        console.error('Failed to assign category:', err);
        return;
    }
};

const onCategoryClick = async (e: MouseEvent, id: string) => {
    const imageCategoryIds = props.image.categories?.map((c) => c.id) || [];
    if (imageCategoryIds.includes(id)) {
        await categoryStore.unassignFromImage(props.image.id, id);
    }
};

const updateName = async (e: Event, value: string) => {
    const name = value.trim();
    if (name.toLocaleLowerCase() !== props.image.name.toLocaleLowerCase()) {
        await imageStore.update({
            ...props.image,
            name: name,
        });
    }
};

// close on click outsider
const onClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.image-context-window')) {
        emits('onClose', e);
    }
};

onMounted(() => {
    window.addEventListener('mousedown', onClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('mousedown', onClickOutside);
});
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.image-context-window {
    display: flex;
    flex-direction: column;
    border-radius: $border-radius-sm;
    max-width: 40rem;

    &-chips {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .field-group-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        .text {
            font-size: 1.25rem;
            font-weight: 600;
        }
        &-img {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: $border-radius-xs;
            object-fit: cover;
        }
    }
}
</style>
