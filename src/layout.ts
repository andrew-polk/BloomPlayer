import "./layout.less";

export function SetupLayout() {
    adjust();
    window.addEventListener("resize", ()=>adjust(), false);
}

function adjust() {
    var pageWidth = document.querySelectorAll(".bloom-page")[0].scrollWidth;
    var pageHeight = document.querySelectorAll(".bloom-page")[0].scrollHeight;
    var scale = Math.min(window.innerWidth/pageWidth,window.innerHeight/pageHeight);
    document.body.style.transform = "scale("+scale+")";
}