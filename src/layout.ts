import "./layout.less";

export function SetupLayout() {
    setOrientation();
    adjust();
    window.addEventListener("resize", () => window.setTimeout( adjust, 500));
    window.addEventListener("orientationchange", () => window.setTimeout( adjust, 500));
    window.addEventListener("orientationchange", setOrientation);
}

function adjust() {
    console.log("adjusting");

    //Enhance: would using meta.viewport be better?
    //http://stackoverflow.com/questions/8735457/scale-fit-mobile-web-content-using-viewport-meta-tag?rq=1

    const pageWidth = document.getElementById("pages-carousel").querySelectorAll(".bloom-page")[0].scrollWidth;
    const pageHeight = document.getElementById("pages-carousel").querySelectorAll(".bloom-page")[0].scrollHeight;

    //TODO: I suspect this equation is off, or rounding the wrong way, or not taking
    //consideration of scroll bar, or border of the navigation or carousel containers, something.
    //this 15 is a temporary fudge, roughly the scrollbar width
    const scale = Math.min((window.innerWidth ) / pageWidth, (window.innerHeight ) / pageHeight);
    const carousel = document.getElementById("pages-carousel");
    carousel.style.transform = "scale(" + scale + ")";
}

function setOrientation() {
      console.log("changing orientation");
     const carousel = document.getElementById("pages-carousel");
     const pages = carousel.getElementsByClassName("bloom-page");
     for (let index = 0; index < pages.length; index++) {
         const page = pages[index];

         //remove existing orientation class
         for (let i = 0; i < page.classList.length; i++) {
             const classname = page.classList[i];
             if (classname.indexOf("Portrait") > -1 || classname.indexOf("Landscape") > -1 ) {
                 page.className = page.className.replace(classname, "");
             }
         }

         //note: both FF and Chrome always report "landscape" on desktops
         //(unless you're in Chrome's Device Toolbar mode)
         //add in the class we want
         if ((<any> window.screen).orientation.type.indexOf("landscape") > -1) {
            page.classList.add("Device16x9Landscape");
         } else {
            page.classList.add("Device16x9Portrait");
         }
     }
}
