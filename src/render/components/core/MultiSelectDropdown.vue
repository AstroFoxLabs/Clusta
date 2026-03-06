<template lang="html">
    <div class="multi-select-dropdown">
        <select name="selection-items" id="selection-items" @change="addToSelection($event)">
            <option value="" disabled selected>{{ props.defaultLabel }}</option>
            <option v-for="item in props.items" :key="item.value" :value="item.value" v-show="!item.selected">
                {{ item.displayName }}
            </option>
        </select>
        <Chip
            class="multi-select-dropdown-chip"
            v-for="item in props.items.filter((i) => i.selected)"
            :key="item.value"
            @click="onClickSelectedItem($event, item)"
        >
            {{ item.displayName }}
        </Chip>
    </div>
</template>

<script setup lang="ts">
    export interface DropdownSelectionItem {
        value: string;
        displayName: string;
        selected?: boolean;
    }

    import Chip from './Chip.vue';

    // --- PROPS & EMITS ---

    const props = defineProps({
        items: {
            type: Array as () => DropdownSelectionItem[],
            required: true,
        },
        defaultLabel: {
            type: String,
            required: false,
            default: 'Select...',
        },
    });

    const emits = defineEmits(['change', 'onClickSelectedItem']);

    // --- STORES ---

    // --- STATES ---

    // --- COMPUTED ---

    // --- WATCHERS ---

    // --- METHODS ---

    const addToSelection = (e: Event) => {
        const selectedValue = (e.target as HTMLSelectElement).value;
        const selectedItem = props.items.find((item) => item.value.toString() === selectedValue.toString());
        if (selectedItem) {
            selectedItem.selected = true;
            emits('change', e, props.items);
        }

        // reset selection
        (e.target as HTMLSelectElement).value = '';
    };

    const onClickSelectedItem = (e: MouseEvent, item: DropdownSelectionItem) => {
        emits('onClickSelectedItem', e, item.value);
    };
</script>

<style scoped lang="scss">
    @use '@/styles/_variables' as *;

    .multi-select-dropdown {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;

        &-chip {
        }
    }
</style>
