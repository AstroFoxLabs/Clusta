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
import { useAppStore } from '@render/stores/appStore';
import { computed, onBeforeUnmount, onMounted } from 'vue';

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
const closeMenu = () => {
    appStore.setRightClickMenu(null);
};

const onGlobalPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.right-click-menu')) {
        closeMenu();
    }
};

const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && appStore.rightClickMenu) {
        closeMenu();
    }
};

const onMenuItemClick = (cb: () => void) => {
    cb();
    closeMenu();
};

onMounted(() => {
    // capture => run before other handlers => closes even if other handlers call stopPropagation
    window.addEventListener('pointerdown', onGlobalPointerDown, { capture: true });
    window.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onGlobalPointerDown, { capture: true });
    window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped lang="scss">
@use '@render/styles/variables' as *;

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
