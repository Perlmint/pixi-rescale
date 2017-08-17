/// <reference types="pixi.js" />

export type Renderer = PIXI.CanvasRenderer | PIXI.WebGLRenderer;
interface RescaledInfo {
    renderer: Renderer;
    func: () => void;
}
const rescaled: RescaledInfo[] = [];

/**
 * Register or update renderer auto rescale
 * 
 * @param renderer PIXI renderer
 */
export default function(renderer: Renderer) {
    for (const info of rescaled) {
        if (info.renderer === renderer) {
            return;
        }
    }

    // register new
    const info = {
        renderer,
        func() {
            let screenW = window.innerWidth;
            let screenH = window.innerHeight;
            const screenRatio = screenW / screenH;
            let scale = 1;
            const ratio = renderer.width / renderer.height;
            if (screenRatio > ratio) {
                screenW = ratio * screenH;
                scale = screenH / renderer.height;
            } else {
                screenH = screenW / ratio;
                scale = screenW / renderer.width;
            }

            renderer.view.style.width = `${screenW}px`;
            renderer.view.style.height = `${screenH}px`;
        }
    };

    if (typeof window.onresize === "function") {
        const originalOnResize = window.onresize;
        const recapturedInfo = info;
        window.onresize = function(this: Window, ev: UIEvent) {
            originalOnResize.apply(this, [ev]);
            recapturedInfo.func();
        }
    } else {
        window.onresize = info.func;
    }

    renderer.autoResize = true;
    renderer.view.style.margin = "auto";
    
    rescaled.push(info);

    info.func();
}