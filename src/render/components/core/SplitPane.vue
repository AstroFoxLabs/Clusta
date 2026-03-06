<template lang="html">
    <div class="split-pane">
        <div class="split-pane-container">
            <slot :name="props.mirror ? 'right' : 'left'"></slot>
        </div>
        <div class="split-pane-split" @pointerdown="onDown" ref="splitter">
            <div class="split-pane-split-icon"></div>
        </div>
        <div class="split-pane-container">
            <slot :name="props.mirror ? 'left' : 'right'"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue';
    import type { PropType } from 'vue';

    type SplitMode = 'LeftFull' | 'Equal' | 'RightFull';

    const props = defineProps({
        mode: {
            type: String as PropType<SplitMode>,
            default: 'Equal',
        },
        mirror: {
            type: Boolean,
            default: true,
        },
    });

    // --- STORES ---

    // --- STATES ---

    const splitDiff = ref(50);
    const gridTemplateColumns = computed(() => {
        let left = 'minmax(0, var(--split-diff))';
        let middle = '12px';
        let right = '1fr';

        if (props.mode === 'LeftFull') {
            left = '100%';
            middle = '0';
            right = '0';
        } else if (props.mode === 'RightFull') {
            left = '0';
            middle = '0';
            right = '100%';
        }

        return `${left} ${middle} ${right}`;
    });

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---

    const splitMove = (clientX: number, offset: number, appWidth: number) => {
        // Cursor position in % decides size of left container
        const clientXPercentage = ((clientX - offset) / appWidth) * 100;
        // Avoid dragging window too small
        if (clientXPercentage < 10 || clientXPercentage > 90) return;
        document.documentElement.style.setProperty('--split-diff', `${clientXPercentage}%`);
    };

    const onDown = (e: PointerEvent) => {
        const splitter = document.getElementsByClassName('split-pane-split')[0].getBoundingClientRect();
        document.body.classList.add('is-resizing');
        // fixes little jump on start, caused by how far you click to the right inside the splider
        const offset = e.clientX - splitter.left;
        const appWidth = document.getElementById('app')?.clientWidth;
        if (!appWidth) return;
        const onMove = (ev: PointerEvent) => splitMove(ev.clientX, offset, appWidth);
        const onUp = () => {
            document.body.classList.remove('is-resizing');
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    };

    onMounted(() => {
        // Set initial CSS variable for split difference
        document.documentElement.style.setProperty('--split-diff', `${splitDiff.value}%`);
    });
</script>

<style scoped lang="scss">
    @use '../../styles/variables.scss' as *;

    .split-pane {
        display: grid;
        grid-template-columns: v-bind(gridTemplateColumns);
        height: 100%;
        padding-bottom: 0.5rem;

        &-container {
            position: relative;
            height: 100%;
            overflow: auto;
            background-color: $primary-300;
            border-radius: $border-radius-md;
        }

        &-split {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;

            &:hover {
                cursor: pointer;

                .split-pane-split-icon {
                    background-color: $white-trans-50;
                }
            }

            &-icon {
                width: 50%;
                height: 3rem;
                background-color: $white-trans-25;
                border-radius: $border-radius-full;
            }
        }
    }
</style>
