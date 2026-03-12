import { defineStore } from 'pinia';
import { ref } from 'vue';

// TRes is optional
export interface ModalActionCb<TReq = void, TRes = void> {
    cb: (arg?: TReq) => TRes | Promise<TRes>;
    label: string;
    primary?: boolean;
}

export interface Modal {
    title: string;
    description?: string;
}

type ModalInstance = ModalDialog | ModalInput | ModalCustom;

export interface ModalDialog extends Modal {
    type: 'dialog';
    onConfirm: ModalActionCb<unknown, unknown>;
    onCancel?: ModalActionCb<unknown, unknown>;
}

export interface ModalInput extends Modal {
    type: 'input';
    inputLabel: string;
    inputPlaceholder?: string;
    onConfirm: ModalActionCb<string, unknown>;
    onCancel?: ModalActionCb<unknown, unknown>;
    initialValue?: string;
}

export interface ModalCustom extends Modal {
    type: 'custom';
    cb: ModalActionCb<unknown, unknown>[];
    props?: Record<string, any>;
}

export const useModalStore = defineStore('modal', () => {
    /* ---------------------------- STORES ---------------------------- */

    /* ---------------------------- STATES ---------------------------- */

    const modal = ref<ModalInstance | null>(null);

    /* ----------------------------- GETTERS ------------------------- */

    /* ---------------------------- INTERNALS ------------------------- */

    const setModal = (modalData: ModalInstance | null): void => {
        modal.value = modalData;
    };

    /* ----------------------------- ACTIONS ------------------------- */

    return {
        modal,
        setModal,
    };
});
