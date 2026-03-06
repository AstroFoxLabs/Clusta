import { defineStore } from 'pinia';
import { Component, DefineComponent, ref } from 'vue';
import { ipcAPI } from '@render/services/ipcAPIService';

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

// dataTransfer type to identify internal drag-and-drop operations
export const INTERNAL_DATA_TRANSFER_TYPE = 'application/x-clusta-internal-dragndrop';

export const useAppStore = defineStore('app', () => {
    /* ---------------------------- STORES ---------------------------- */
    /* ---------------------------- STATES ---------------------------- */

    // false => drag-and-drop operation from outside the app is happening
    // this means this needs to be toggled to true when dragging a grid item inside the app
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

    const setAlwaysOnTop = async (alwaysOnTop: boolean): Promise<void> => {
        try {
            await ipcAPI<void>(() => window.appWindow.setAlwaysOnTop(alwaysOnTop));
        } catch (error) {
            console.error('Error setting always on top:', error);
            throw error;
        }
    };

    return {
        rightClickMenu,
        setRightClickMenu,
        imageDefaultPath,
        imageDefaultExtension,
        fileDefaultPath,
        setAlwaysOnTop,
    };
});
