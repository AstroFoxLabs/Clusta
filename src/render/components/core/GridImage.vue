<template lang="html">
    <div class="grid-image" @click="onClick($event)" @click.right.prevent.stop="onRightClick">
        <div
            :class="['grid-image-favorite-action', props.image.is_favorite ? 'favorite' : '']"
            ref="favoriteIcon"
            @click.prevent.stop="toggleFavorite"
            @dragover.prevent.stop
        >
            <Icon name="icon_star" />
        </div>
        <img class="grid-image-image" :src="imagePath ?? ''" />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type { CatalogImage, Coordinates } from '@shared/types';
    import { useAppStore } from '@render/stores/appStore';
    import { useImageStore } from '@render/stores/imageStore';
    import Icon from './Icon.vue';
    import { useSettingsStore } from '@render/stores/settingsStore';

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

    //const ctxWinPosition = ref<Coordinates>({ x: 0, y: 0 });
    const favoriteIcon = ref<HTMLElement | null>(null);

    // --- COMPUTED ---

    const imagePath = computed(
        () =>
            `${settingsStore.settings.paths.imageDefaultPath}/${props.image.hash}.${settingsStore.settings.image.conversion.format}`
    );

    // --- WATCHERS ---

    // --- METHODS ---

    const onClick = (e: MouseEvent) => {
        //ctxWinPosition.value = { x: e.clientX, y: e.clientY };
        emits('onClick', e, props.image);
    };

    const toggleFavorite = async () => {
        const newFavoriteStatus = !props.image.is_favorite;
        await imageStore.updateFavorite(props.image.id, newFavoriteStatus);

        if (newFavoriteStatus) {
            favoriteIcon.value?.classList.add('favorite');
        } else {
            favoriteIcon.value?.classList.remove('favorite');
        }
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
    @use '../../styles/_variables' as *;

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
            padding: 0.25rem;
            background-color: #00000054;
            border-radius: $border-radius-sm;

            img:hover {
                padding: 0.1rem;
            }

            :deep(.icon) {
                height: 1.5rem;
            }
        }

        .favorite {
            background-color: #d19d7a;
        }

        &-image {
            &:hover {
                box-sizing: border-box; // to prevent layout shift when border is added
                border: 2px solid transparent;
                border-radius: $border-radius-sm;
            }
        }
    }
</style>
