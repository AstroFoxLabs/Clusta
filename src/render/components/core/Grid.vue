<template>
    <div class="grid">
        <div class="grid-slider">
            <Slider v-if="props.images.length > 0" :value="zoomLevel" :min="10" :step="1" v-model="zoomLevel" />
        </div>
        <div class="grid-gallery masonry-layout">
            <slot name="default" :images="props.images"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { CatalogImage } from '@shared/types';
    import { computed, ref } from 'vue';
    import Slider from '@render/components/core/Slider.vue';

    // --- PROPS & EMITS ---

    // currently only supports image references
    const props = defineProps({
        images: {
            type: Array as () => CatalogImage[],
            required: true,
        },
    });

    // --- STORES ---

    // --- STATES ---

    const defaultWidth = ref<number>(350);
    const columnWidth = computed(() => {
        return `${Math.trunc((zoomLevel.value / 100) * defaultWidth.value)}px`;
    });

    const zoomLevel = defineModel({
        type: Number,
        default: 50,
    });

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---
</script>
<style lang="scss" scoped>
    @use '../../styles/_variables' as *;

    .grid {
        container-type: inline-size;

        &-slider {
            text-align: end;
            background: $primary-400;
            display: flex;
            justify-content: flex-end;
            padding: 0.5rem 0;
        }

        &-gallery {
            min-height: 100%;
        }

        .masonry-layout {
            column-width: v-bind(columnWidth);
            column-fill: balance;
            column-gap: 0.5rem;
        }

        @container (max-width: 200px) {
            .grid-slider {
                display: none;
            }
        }
    }
</style>
