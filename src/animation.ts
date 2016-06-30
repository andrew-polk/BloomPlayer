import {PageVisible, PageBeforeVisible, PageHidden} from "./carousel";
import {PageDuration, PageDurationAvailable} from "./narration";
//import {Play, Pause} from "./controls";

export function SetupAnimation(): void {
    PageVisible.subscribe(page => {
        Animation.pageVisible(page);
    });
    PageBeforeVisible.subscribe(page => {
        Animation.setupAnimation(page, true);
    });
    PageHidden.subscribe(page => {
        // Anything to do here?
    });
    PageDurationAvailable.subscribe(page => {
        Animation.durationAvailable(page);
    });
}

// Defines the extra fields we expect to find in the dataset of an HTMLElement
// that has animation specified (to make TypeScript and TSLint happy).
interface IAnimation { initialrect: string;  finalrect: string; }

class Animation {
    public static paused: Boolean;

/*  I think this will be a lot cleaner if we convert this to a real class, with 
    real member variables.

    Play.subscribe( () =>  animationView.style = styleWeWereAimingForWhenPaused );
    Pause.subscribe( () => {
                styleWeWereAimingForWhenPaused = animationView.style;
                animationView.style = window.getComputedStyle(animationView);
        });
*/
    public static setupAnimation(page: HTMLElement, beforeVisible: boolean): void {

        const animationView = <HTMLElement> ([].slice.call(page.getElementsByClassName("bloom-imageContainer"))
            .find(v => (<IAnimation> v.dataset).initialrect));
        if (!animationView) {return; } // no image to animate

        this.removeClass(animationView, "bloom-animate"); // make sure the animation isn't triggered until we set it up.
        const stylesheet = this.getAnimationStylesheet().sheet;
        const initialRectStr = (<IAnimation> <any> animationView.dataset).initialrect;

        //Fetch the data from the dataset and reformat into scale width and height along with offset x and y
        const initialRect = initialRectStr.split(" ");
        const viewWidth = animationView.clientWidth; // getBoundingClientRect().width;
        const viewHeight = animationView.clientHeight; // getBoundingClientRect().height;
        const initialScaleWidth = 1 / parseFloat(initialRect[2]);
        const initialScaleHeight = 1 / parseFloat(initialRect[3]);
        const finalRect = (<IAnimation> <any> animationView.dataset).finalrect.split(" ");
        const finalScaleWidth = 1 / parseFloat(finalRect[2]);
        const finalScaleHeight = 1 / parseFloat(finalRect[3]);

        const initialX = parseFloat(initialRect[0]) * viewWidth;
        const initialY = parseFloat(initialRect[1]) * viewHeight;
        const finalX = parseFloat(finalRect[0]) * viewWidth;
        const finalY = parseFloat(finalRect[1]) * viewHeight;

        //Will take the form of "scale(W, H) translate(Xpx, Ypx)"
        const initialTransform = "scale(" + initialScaleWidth + ", " + initialScaleHeight
            + ") translate(-" + initialX + "px, -" + initialY + "px)";
        const finalTransform = "scale(" + finalScaleWidth + ", " + finalScaleHeight
            + ") translate(-" + finalX + "px, -" + finalY + "px)";

        console.log(initialTransform);
        console.log(finalTransform);
        while ((<CSSStyleSheet> stylesheet).cssRules.length > 2) {
            // remove rules from some previous picture
            (<CSSStyleSheet> stylesheet).removeRule(0);
        }

        // We expect to see something like this:
        // <div class="bloom-imageContainer bloom-backgroundImage bloom-leadingElement"
        // style="background-image:url('1.jpg')"
        // title="..."
        // data-initialrect="0.3615 0.0977 0.6120 0.6149" data-finalrect="0.0000 0.0800 0.7495 0.7526"
        // data-duration="5" />
        // ...
        // </div>
        //
        // We want to make something like this:
        // <div ...with all the original properties minus the background-image style>
        //      <div class="bloom-ui-animationWrapper" style = "width: 400px; height; 100%">
        //          <div class="bloom-animate" style="background-image:url('1.jpg'); width: 400px; height; 300px"/>
        //              ...original content...
        //          </div>
        //      </div>
        // </div>
        const wrapperClassName = "bloom-ui-animationWrapper";
        if (!this.hasClass(animationView, wrapperClassName)) {
            const wrapDiv = document.createElement("div");
            animationView.appendChild(wrapDiv);
            this.addClass(wrapDiv, wrapperClassName);
            const movingDiv = document.createElement("div");
            wrapDiv.appendChild(movingDiv);
            let imageAspectRatio = 4 / 3; // default in case we're not using background image
            const viewAspectRatio = viewWidth / viewHeight;

            function updateWrapDivSize() {
                if (imageAspectRatio < viewAspectRatio) {
                    // black bars on side
                    const imageWidth = viewHeight * imageAspectRatio;
                    wrapDiv.setAttribute("style", "height: 100%; width: " + imageWidth
                        + "px; left: " + (viewWidth - imageWidth) / 2  + "px");
                } else {
                    // black bars top and bottom
                    const imageHeight = viewWidth / imageAspectRatio;
                    wrapDiv.setAttribute("style", "width: 100%; height: " + imageHeight
                        + "px; top: " + (viewHeight - imageHeight) / 2  + "px");
                }
            }

            const styleData = animationView.getAttribute("style");
            if (styleData) {
                // This somewhat assumes the ONLY style attribute is the background image.
                // I think we can improve that when and if it becomes an issue.
                animationView.setAttribute("style", "");
                movingDiv.setAttribute("style", styleData);
                const imageSrc = styleData.replace(/.*url\((['"])([^)]*)\1\).*/i, "$2");
                const image = new Image();
                image.addEventListener("load", () => {
                    if (image.height) {  // some browsers may not produce this?
                        imageAspectRatio = image.width / image.height;
                        updateWrapDivSize();
                    }
                });
                image.src = imageSrc;
            } else {
                updateWrapDivSize(); // just do it with the ratio we guessed.
            }

            // Todo: if the original div had content (typically an <img>), move it
            // (and try to use its image to figure aspect ratio)
            movingDiv.setAttribute("class", "bloom-animate");
        }

        if (beforeVisible) {
            // this rule puts it in the initial state for the animation, so we get a smooth
            // transition when the animation starts. Don't start THIS animation, though,
            // until the page-turn one completes.
            (<CSSStyleSheet> stylesheet).insertRule(".bloom-animate { transform-origin: 0px 0px; transform: "
                 + initialTransform + ";}", 0);
        } else {
            //Insert the keyframe animation rule with the dynamic begin and end set
            (<CSSStyleSheet> stylesheet).insertRule("@keyframes movepic { from{ transform-origin: 0px 0px; transform: "
                + initialTransform + "; } to{ transform-origin: 0px 0px; transform: " + finalTransform + "; } }", 0);

            //Insert the css for the imageView div that utilizes the newly created animation
            (<CSSStyleSheet> stylesheet).insertRule(".bloom-animate { transform-origin: 0px 0px; transform: "
                + initialTransform
                + "; animation-name: movepic; animation-duration: "
                + PageDuration + "s; animation-fill-mode: forwards; }", 1);
        }
    }

    // We cannot be absolutely sure whether the page transition or collecting the audio lengths will
    // take longer. So we listen for both events and start the animation when we have both have
    // occurred.
    public static durationAvailable(page: HTMLElement) {
        this.lastDurationPage = page;
        if (this.currentPage === this.lastDurationPage) {
            // already got the corresponding pageVisible event
            this.setupAnimation(page, false);
        }
    }

    public static pageVisible(page: HTMLElement) {
        this.currentPage = page;
        if (this.currentPage === this.lastDurationPage) {
            // already got the corresponding durationAvailable event
            this.setupAnimation(page, false);
        }
    }

    private static currentPage: HTMLElement;
    private static lastDurationPage: HTMLElement;

    private static addClass(elt: HTMLElement, className: string) {
        const index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + " " + className;
        }
    }

    private static removeClass(elt: Element, className: string) {
        const index = elt.className.indexOf(className);
        if (index >= 0) {
            elt.className = elt.className.slice(0, index)
                + elt.className.slice(index + className.length, elt.className.length);
        }
    }

    // a crude check good enough for the long class names we care about here.
    private static hasClass(elt: Element, className: string) {
        return elt.className.indexOf(className) >= 0;
    }

    private static getAnimationStylesheet(): HTMLStyleElement {
        let animationElement = document.getElementById("animationSheet");
        if (!animationElement) {
            animationElement = document.createElement("style");
            animationElement.setAttribute("type", "text/css");
            animationElement.setAttribute("id", "animationSheet");
            animationElement.innerText = ".bloom-ui-animationWrapper {overflow: hidden} "
                + ".bloom-animate {height: 100%; width: 100%; "
                + "background-repeat: no-repeat; background-size: contain}";
            document.body.appendChild(animationElement);
        }
        return <HTMLStyleElement> animationElement;
    }
}
