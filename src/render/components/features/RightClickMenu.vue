<template lang="html">
    <Teleport to="body">
        <div class="right-click-menu" v-if="appStore.rightClickMenu" :style="position">
            <div class="right-click-menu-list">
                <div
                    v-for="callback in appStore.rightClickMenu.cb"
                    @click="onMenuItemClick(callback.cb)"
                    :key="callback.label"
                    class="right-click-menu-list-item"
                >
                    {{ callback.label }}
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
    import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
    import { useAppStore } from '../../stores/appStore';

    // --- PROPS & EMITS ---

    // --- STORES ---

    const appStore = useAppStore();

    // --- STATES ---

    // --- COMPUTED ---

    const position = computed(() => {
        if (appStore.rightClickMenu) {
            return {
                left: `${appStore.rightClickMenu.x}px`,
                top: `${appStore.rightClickMenu.y}px`,
            };
        }
        return {};
    });

    // --- WATCHERS ---

    // --- METHODS ---
    function closeMenu() {
        appStore.setRightClickMenu(null);
    }

    function onGlobalPointerDown(e: PointerEvent) {
        const target = e.target as HTMLElement;
        // If click is outside menu -> close
        if (!target.closest('.right-click-menu')) {
            closeMenu();
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape' && appStore.rightClickMenu) {
            closeMenu();
        }
    }

    function onMenuItemClick(callback: () => void) {
        callback();
        closeMenu();
    }

    onMounted(() => {
        // Using capture to ensure this runs before other pointerdown handlers
        // So that the menu closes even if other handlers stop propagation
        window.addEventListener('pointerdown', onGlobalPointerDown, { capture: true });
        window.addEventListener('keydown', onKeyDown);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('pointerdown', onGlobalPointerDown, { capture: true });
        window.removeEventListener('keydown', onKeyDown);
    });
</script>

<style scoped lang="scss">
    @use '../../styles/_variables.scss' as *;

    .right-click-menu {
        background-color: $primary-600;
        width: 200px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        position: fixed;
        z-index: $z-index-right-click-menu;
        font-size: 1rem;
        border-radius: $border-radius-sm;

        &-list {
            display: flex;
            flex-direction: column;

            &-item {
                padding: 0.75rem;
                cursor: pointer;

                &:not(:last-child) {
                    border-bottom: 1px solid $white-trans-10;
                }

                &:hover {
                    background-color: $primary-400;
                }
            }
        }
    }
</style>
