import "./layout.less";

export function SetupLayout() {
    //tell smart phone that we are taking care of zooming to fit them
    document.head.insertAdjacentHTML("afterBegin",
        "<meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'>");
    setOrientation();

    adjust();
    window.addEventListener("resize", () => window.setTimeout( adjust, 500));
    window.addEventListener("orientationchange", () => window.setTimeout( adjust, 500));
    window.addEventListener("orientationchange", setOrientation);
}

export function Scale(): number {
    //Enhance: would using meta.viewport be better?
    //http://stackoverflow.com/questions/8735457/scale-fit-mobile-web-content-using-viewport-meta-tag?rq=1

    const pageWidth = document.querySelectorAll(".currentPage")[0].scrollWidth;
    const pageHeight = document.querySelectorAll(".currentPage")[0].scrollHeight;
    if (!pageWidth) {
        debugger;
    }
    //TODO: I suspect this equation is off, or rounding the wrong way, or not taking
    //consideration of scroll bar, or border of the navigation or carousel containers, something.
    //this 15 is a temporary fudge, roughly the scrollbar width
    return Math.min((window.innerWidth ) / pageWidth, (window.innerHeight ) / pageHeight);
}

function adjust() {
    console.log("adjusting");

    const scaler = document.getElementById("scaler");
    if (scaler) {
        scaler.style.transform = "scale(" + Scale() + ")";
    }
}

function setOrientation() {
     console.log("changing orientation");
     const pages = document.querySelectorAll(".bloom-page");
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
