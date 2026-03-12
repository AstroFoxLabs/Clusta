import { onUnmounted, ref } from 'vue';

const x = ref(0);
const y = ref(0);

let initialized = false;

const update = (event: MouseEvent) => {
    x.value = event.pageX;
    y.value = event.pageY;
};

export function useMouse() {
    if (!initialized) {
        window.addEventListener('mousemove', update);
        initialized = true;
    }

    onUnmounted(() => {
        window.removeEventListener('mousemove', update);
    });

    return { x, y };
}
