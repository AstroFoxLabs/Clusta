<template lang="html">
    <div class="grid-image" @click="onClick($event)" @click.right.prevent.stop="onRightClick">
        <div
            :class="['grid-image-favorite-action', props.image.is_favorite ? 'favorite' : '']"
            ref="favoriteIcon"
            @click.prevent.stop="toggleFavorite"
            @dragover.prevent.stop
        >
            <Icon codicon-name="star" />
        </div>
        <img class="grid-image-image" :src="imagePath ?? ''" />
    </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@render/stores/appStore';
import { useImageStore } from '@render/stores/imageStore';
import { useSettingsStore } from '@render/stores/settingsStore';
import type { CatalogImage } from '@shared/types';
import { computed } from 'vue';
import Icon from './Icon.vue';

// --- PROPS & EMITS ---

const props = defineProps({
    image: {
        type: Object as () => CatalogImage,
        required: true,
    },
    selected: {
        type: Boolean,
        default: false,
    },
});

const emits = defineEmits(['onClick']);

// --- STORES ---

const appStore = useAppStore();
const imageStore = useImageStore();
const settingsStore = useSettingsStore();

// --- STATES ---

// --- COMPUTED ---

const imagePath = computed(
    () =>
        `${settingsStore.settings.paths.images}/${props.image.hash}.${settingsStore.settings.image.conversion.format}`,
);

// --- WATCHERS ---

// --- METHODS ---

const onClick = (e: MouseEvent) => {
    //ctxWinPosition.value = { x: e.clientX, y: e.clientY };
    emits('onClick', e, props.image);
};

const toggleFavorite = async () => {
    const image = imageStore.collection.find((i: CatalogImage) => i.id === props.image.id);
    if (!image) {
        console.error('Image not found in store when trying to toggle favorite status');
        return;
    }
    await imageStore.update({
        ...image,
        is_favorite: !image.is_favorite,
    });
};

const onRightClick = (e: MouseEvent) => {
    appStore.setRightClickMenu({
        x: e.clientX,
        y: e.clientY,
        cb: [
            {
                label: 'Favorite',
                cb: () => {
                    toggleFavorite();
                },
            },
            {
                label: 'Delete Image',
                cb: () => {
                    imageStore.deleteImage(props.image.id);
                },
            },
        ],
    });
};
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

.grid-image {
    break-inside: avoid;
    margin-bottom: 0.5rem;
    width: 100%;
    display: block;
    border-radius: $border-radius-xs;
    overflow: hidden;
    position: relative;
    z-index: 1;

    &:hover {
        .grid-image-favorite-action {
            visibility: visible;
        }
    }

    &-favorite-action {
        visibility: hidden;
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        z-index: 2;
        opacity: 1;
        background-color: #00000054;
        border-radius: $border-radius-sm;
        width: 2rem;
        height: 2rem;
    }

    .favorite {
        background-color: #d19d7a;
    }

    &-image {
        &:hover {
            outline: 2px solid $primary-400;
            outline-offset: -2px; // optional to mimic border placement
        }
    }
}
</style>
