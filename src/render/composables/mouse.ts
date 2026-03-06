import { ref, onMounted, onUnmounted } from 'vue';

export const useMouse = () => {
    const x = ref<number>(0);
    const y = ref<number>(0);

    const update = (event: MouseEvent) => {
        x.value = event.pageX;
        y.value = event.pageY;
    };

    onMounted(() => window.addEventListener('mousemove', update));
    onUnmounted(() => window.removeEventListener('mousemove', update));

    return { x, y };
};
