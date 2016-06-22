import "./layout.less";

export function SetupLayout() {
    adjust();
    window.addEventListener("resize", () => adjust(), false);
}

function adjust() {
    const pageWidth = document.querySelectorAll(".bloom-page")[0].scrollWidth;
    const pageHeight = document.querySelectorAll(".bloom-page")[0].scrollHeight;

    //TODO: I suspect this equation is off, or rounding the wrong way, or not taking
    //consideration of scroll bar, or border of the navigation or carousel containers, something.
    //this 15 is a temporary fudge, roughly the scrollbar width
    const scale = Math.min((window.innerWidth ) / pageWidth, (window.innerHeight ) / pageHeight);
    const carousel = document.getElementById("pages-carousel");
    carousel.style.transform = "scale(" + scale + ")";
}
