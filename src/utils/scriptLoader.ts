import $ from 'jquery';

declare global {
    interface Window {
        jQuery: typeof $;
        $: typeof $;
    }
}

window.jQuery = $;
window.$ = $;

export const loadScript = async (src: string): Promise<void> => {
    try {
        // For local scripts in the assets directory
        if (src.startsWith('@/assets/')) {
            const path = src.replace('@/assets/', '/src/assets/');
            await import(`..${path}`);
            return;
        }

        // For external scripts or other local scripts
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    } catch (error) {
        console.error(`Error loading script ${src}:`, error);
        throw error;
    }
};
