import {PageVisible, PageBeforeVisible, PageHidden} from "./navigation";
import {PageDuration, PageDurationAvailable} from "./narration";
import {Play, Pause /*, IsPaused*/} from "./controls";

// Defines the extra fields we expect to find in the dataset of an HTMLElement
// that has animation specified (to make TypeScript and TSLint happy).
interface IAnimation { initialrect: string;  finalrect: string; }

export default class Animation {

    public static documentHasAnimation(): boolean {
        return !!Animation.getAnimationView(document.body);
    }

    public static getAnimationView(parent: HTMLElement): HTMLElement {
        return <HTMLElement> ([].slice.call(parent.getElementsByClassName("bloom-imageContainer"))
            .find(v => (<IAnimation> v.dataset).initialrect));
    }

    private  currentPage: HTMLElement;
    private  lastDurationPage: HTMLElement;
    private animationView: HTMLElement;
    private permanentRuleCount: number; // rules from initial creation of stylesheet
    // incremented for each animated div, to keep animation rules for each one distinct
    private ruleModifier: number = 0;

     constructor() {
        PageVisible.subscribe(page => {
            this.pageVisible(page);
        });
        PageBeforeVisible.subscribe(page => {
            this.setupAnimation(page, true);
        });
        PageHidden.subscribe(page => {
            // Anything to do here?
        });
        PageDurationAvailable.subscribe(page => {
            this.durationAvailable(page);
        });

        Play.subscribe( () =>  {
            if (this.animationView) {
                const stylesheet = this.getAnimationStylesheet().sheet;
                (<CSSStyleSheet> stylesheet).removeRule((<CSSStyleSheet> stylesheet).cssRules.length - 1);
                this.permanentRuleCount--;
            }
        });
        Pause.subscribe( () => {
            if (this.animationView) {
                const stylesheet = this.getAnimationStylesheet().sheet;
                (<CSSStyleSheet> stylesheet).insertRule(
                    ".bloom-animate {animation-play-state: paused; -webkit-animation-play-state: paused}",
                    (<CSSStyleSheet> stylesheet).cssRules.length);
                this.permanentRuleCount++; // not really permanent, but not to be messed with.
            }
        });
    }

    public setupAnimation(page: HTMLElement, beforeVisible: boolean): void {

        this.animationView = Animation.getAnimationView(page);
        if (!this.animationView) {return; } // no image to animate

        const outerThis = this;
        const stylesheet = this.getAnimationStylesheet().sheet;
        const initialRectStr = (<IAnimation> <any> this.animationView.dataset).initialrect;

        //Fetch the data from the dataset and reformat into scale width and height along with offset x and y
        const initialRect = initialRectStr.split(" ");
        const viewWidth = this.animationView.clientWidth; // getBoundingClientRect().width;
        const viewHeight = this.animationView.clientHeight; // getBoundingClientRect().height;
        const initialScaleWidth = 1 / parseFloat(initialRect[2]);
        const initialScaleHeight = 1 / parseFloat(initialRect[3]);
        const finalRect = (<IAnimation> <any> this.animationView.dataset).finalrect.split(" ");
        const finalScaleWidth = 1 / parseFloat(finalRect[2]);
        const finalScaleHeight = 1 / parseFloat(finalRect[3]);

        // remove obsolete rules. We want to keep the permanent rules and the ones for the previous page
        // (which may still be visible). That's at most 2. It's harmless to keep an extra one.
        while ((<CSSStyleSheet> stylesheet).cssRules.length > this.permanentRuleCount + 2) {
            // remove the last (oldest, since we add at start) non-permanent rule
            (<CSSStyleSheet> stylesheet).removeRule((<CSSStyleSheet> stylesheet).cssRules.length
                - this.permanentRuleCount - 1);
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
        //          <div class="bloom-animate bloom-animateN" style="background-image:url('1.jpg');
        //               width: 400px; height; 300px"/>
        //              ...original content...
        //          </div>
        //      </div>
        // </div>
        const wrapperClassName = "bloom-ui-animationWrapper";
        // Assign each animation div a unique number so their rules are distinct.
        let ruleMod = this.animationView.getAttribute("data-animationNumber");
        if (!ruleMod) {
            ruleMod = "" + this.ruleModifier++;
            this.animationView.setAttribute("data-animationNumber", ruleMod);
        }
        const animateStyleName = "bloom-animate" + ruleMod;
        const movePicName = "movepic" + ruleMod;

        let wrapDiv: HTMLElement = null;
        let initialTransform = "";
        let finalTransform = "";

        // Figure out the transforms needed to bring about the animation. These are relative to the size of the wrapDiv
        // which clips the animation, so we can't compute it until we set that size, which in turn sometimes has to
        // wait until we get the aspect ratio of the image.
        function updateTransform() {
            const wrapDivWidth = wrapDiv.clientWidth;
            const wrapDivHeight = wrapDiv.clientHeight;
            const initialX = parseFloat(initialRect[0]) * wrapDivWidth;
            const initialY = parseFloat(initialRect[1]) * wrapDivHeight;
            const finalX = parseFloat(finalRect[0]) * wrapDivWidth;
            const finalY = parseFloat(finalRect[1]) * wrapDivHeight;

            // Will take the form of "scale3d(W, H,1.0) translate3d(Xpx, Ypx, 0px)"
            // Using 3d scale and transform apparently causes GPU to be used and improves
            // performance over scale/transform. (https://www.kirupa.com/html5/ken_burns_effect_css.htm)
            // May also help with blurring of material originally hidden.
            initialTransform = "scale3d(" + initialScaleWidth + ", " + initialScaleHeight
                + ", 1.0) translate3d(-" + initialX + "px, -" + initialY + "px, 0px)";
            finalTransform = "scale3d(" + finalScaleWidth + ", " + finalScaleHeight
                + ", 1.0) translate3d(-" + finalX + "px, -" + finalY + "px, 0px)";
        }

        // insert the rules that animate the image (or set its state during the page turn animation).
        // We hope this happens before the image is visible, but we can't do it until we get the aspect
        // ratio of the image and use it to compute the size of the wrapDiv.
        function insertAnimationRules() {
            if (beforeVisible) {
                // this rule puts it in the initial state for the animation, so we get a smooth
                // transition when the animation starts. Don't start THIS animation, though,
                // until the page-turn one completes.
                (<CSSStyleSheet> stylesheet).insertRule("." + animateStyleName
                    + " { transform-origin: 0px 0px; transform: "
                    + initialTransform + ";}", 0);
            } else {
                //Insert the keyframe animation rule with the dynamic begin and end set
                // The wrapDiv will always have been created during the beforeVisible pass, so we can
                // assume we don't have to wait for it.
                if (waitingForWrapDivWidth) {
                    alert("unexpectedly did not have a wrap div");
                }
                (<CSSStyleSheet> stylesheet).insertRule("@keyframes " + movePicName
                    + " { from{ transform-origin: 0px 0px; transform: " + initialTransform
                    + "; } to{ transform-origin: 0px 0px; transform: " + finalTransform + "; } }", 0);

                //Insert the css for the imageView div that utilizes the newly created animation
                (<CSSStyleSheet> stylesheet).insertRule("." + animateStyleName
                    + " { transform-origin: 0px 0px; transform: "
                    + initialTransform
                    + "; animation-name: " + movePicName + "; animation-duration: "
                    + PageDuration + "s; animation-fill-mode: forwards; "
                    + "animation-timing-function: linear;}", 1);
                // Remove the rule inserted by the beforeVisible event (but not any permanent rules).
                // Enhance: can we more reliably remove what and only what beforeVisible added, e.g.
                // by looking for all rules that apply to animateStyleName?
                // Note that we want to remove this only AFTER inserting the rules above, otherwise,
                // we get a flash of the full-size picture in the instant  when no rules apply.
                if ((<CSSStyleSheet> stylesheet).cssRules.length > outerThis.permanentRuleCount + 2) {
                    (<CSSStyleSheet> stylesheet).removeRule(2);
                }
            }
        }

        let waitingForWrapDivWidth = false;

        if (this.animationView.children.length !== 1
            || !this.hasClass(<HTMLElement> this.animationView.firstChild, wrapperClassName)) {

            wrapDiv = document.createElement("div");
            this.addClass(wrapDiv, wrapperClassName);
            const movingDiv = document.createElement("div");
            wrapDiv.appendChild(movingDiv);
            // hide it until we can set its size and the transform rule for its child properly.
            wrapDiv.setAttribute("style", "visibility: hidden;");
            let imageAspectRatio = 4 / 3; // default in case we're not using background image
            const viewAspectRatio = viewWidth / viewHeight;

            function updateWrapDivSize() {
                const oldStyle = wrapDiv.getAttribute("style"); // may have visibility:hidden
                if (imageAspectRatio < viewAspectRatio) {
                    // black bars on side
                    const imageWidth = viewHeight * imageAspectRatio;
                    wrapDiv.setAttribute("style", oldStyle + " height: 100%; width: " + imageWidth
                        + "px; left: " + (viewWidth - imageWidth) / 2  + "px");
                } else {
                    // black bars top and bottom
                    const imageHeight = viewWidth / imageAspectRatio;
                    wrapDiv.setAttribute("style", oldStyle + " width: 100%; height: " + imageHeight
                        + "px; top: " + (viewHeight - imageHeight) / 2  + "px");
                }
            }

            const styleData = this.animationView.getAttribute("style");
            if (styleData) {
                // This somewhat assumes the ONLY style attribute is the background image.
                // I think we can improve that when and if it becomes an issue.
                this.animationView.setAttribute("style", "");
                movingDiv.setAttribute("style", styleData);
                const imageSrc = styleData.replace(/.*url\((['"])([^)]*)\1\).*/i, "$2");
                const image = new Image();
                waitingForWrapDivWidth = true; // can't insert any rules until we get width
                image.addEventListener("load", () => {
                    if (image.height) {  // some browsers may not produce this?
                        imageAspectRatio = image.width / image.height;
                        updateWrapDivSize();
                        updateTransform();
                        insertAnimationRules();
                        const oldStyle = wrapDiv.getAttribute("style");
                         // now we can show it.
                        wrapDiv.setAttribute("style", oldStyle.substring("visibility: hidden; ".length));
                    }
                });
                image.src = imageSrc;
            } else {
                // Enhance: if the original div had content (typically an <img>), 
                // try to use its image to figure aspect ratio
                updateWrapDivSize(); // just do it with the ratio we guessed.
                updateTransform();
            }

            // Give this rule the class bloom-animate to trigger the rule created in getAnimationStylesheet,
            // and bloom-animationN to trigger the one we are about to create for page-specific animation.
            movingDiv.setAttribute("class", "bloom-animate " + animateStyleName);
            // If the animation view had content (typically an img), move it to the inner div
            while (this.animationView.childNodes.length) {
                movingDiv.appendChild(this.animationView.childNodes[0]);
            }
            this.animationView.appendChild(wrapDiv);
        } else {
            wrapDiv = <HTMLElement> this.animationView.children.item(0);
            // Enhance: possibly we should remember the aspect ratio we want and update its size
            // here in case the containing window size has changed.
            updateTransform();
        }

        // console.log(initialTransform);
        // console.log(finalTransform);
        if (!waitingForWrapDivWidth) {
            insertAnimationRules();
        }
    }

    // We cannot be absolutely sure whether the page transition or collecting the audio lengths will
    // take longer. So we listen for both events and start the animation when we have both have
    // occurred.
    public  durationAvailable(page: HTMLElement) {
        this.lastDurationPage = page;
        if (this.currentPage === this.lastDurationPage) {
            // already got the corresponding pageVisible event
            this.setupAnimation(page, false);
        }
    }

    public pageVisible(page: HTMLElement) {
        this.currentPage = page;
        if (this.currentPage === this.lastDurationPage) {
            // already got the corresponding durationAvailable event
            this.setupAnimation(page, false);
        }
    }

    private  addClass(elt: HTMLElement, className: string) {
        const index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + " " + className;
        }
    }

    // private  removeClass(elt: Element, className: string) {
    //     const index = elt.className.indexOf(className);
    //     if (index >= 0) {
    //         elt.className = elt.className.slice(0, index)
    //             + elt.className.slice(index + className.length, elt.className.length);
    //     }
    // }

    // a crude check good enough for the long class names we care about here.
    private  hasClass(elt: Element, className: string) {
        if (!elt || !elt.className) {
            return false;
        }
        return elt.className.indexOf(className) >= 0;
    }

    private getAnimationStylesheet(): HTMLStyleElement {
        let animationElement = document.getElementById("animationSheet");
        if (!animationElement) {
            animationElement = document.createElement("style");
            animationElement.setAttribute("type", "text/css");
            animationElement.setAttribute("id", "animationSheet");
            animationElement.innerText = ".bloom-ui-animationWrapper {overflow: hidden; translateZ(0)} "
                + ".bloom-animate {height: 100%; width: 100%; "
                + "background-repeat: no-repeat; background-size: contain}";
            document.body.appendChild(animationElement);
            this.permanentRuleCount = 2; // (<CSSStyleSheet> <any> animationElement).cssRules.length;
        }
        return <HTMLStyleElement> animationElement;
    }
}
