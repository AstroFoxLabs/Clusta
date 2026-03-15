import { ipcAPI } from '@render/services/ipcAPIService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum DragAndDropSource {
    EXTERNAL,
    INTERNAL_GRID,
    INTERNAL_SPLIT_PANE,
}

export interface RightClickMenu {
    x: number;
    y: number;
    cb: RightClickMenuCallback[];
}

export interface RightClickMenuCallback {
    label: string;
    cb: () => void;
}

// Identify internal drag-and-drop operations
export const INTERNAL_DATA_TRANSFER_TYPE = 'application/x-clusta-internal-dragndrop';

export const useAppStore = defineStore('app', () => {
    /* ---------------------------- STORES ---------------------------- */
    /* ---------------------------- STATES ---------------------------- */

    // false => drag-and-drop operation from outside the app is happening
    // Toggle to true when dragging a grid item inside the app
    const imageDefaultPath = ref<string>('');
    const imageDefaultExtension = ref<string>('');
    const fileDefaultPath = ref<string>('');
    const rightClickMenu = ref<RightClickMenu | null>(null);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const setRightClickMenu = (menu: RightClickMenu | null): void => {
        rightClickMenu.value = menu;
    };

    /* ----------------------------- ACTIONS ------------------------- */

    // TODO: Not a fan of having this in the app store.
    const setAlwaysOnTop = async (alwaysOnTop: boolean): Promise<void> => {
        await ipcAPI<void>(() => window.appWindow.setAlwaysOnTop(alwaysOnTop));
    };

    return {
        setRightClickMenu,
        setAlwaysOnTop,
        rightClickMenu,
        imageDefaultPath,
        imageDefaultExtension,
        fileDefaultPath,
    };
});
