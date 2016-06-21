import "./layout.less";

export function SetupLayout() {
    adjust();
    window.addEventListener("resize", () => adjust(), false);
}

function adjust() {
    const pageWidth = document.querySelectorAll(".bloom-page")[0].scrollWidth;
    const pageHeight = document.querySelectorAll(".bloom-page")[0].scrollHeight;
    const scale = Math.min(window.innerWidth / pageWidth, window.innerHeight / pageHeight);
    document.body.style.transform = "scale(" + scale + ")";
}
