import {PageVisible, PageHidden} from "./navigation";

export function SetupAnimation(): void {
    PageVisible.subscribe(page => {
        Animation.playAnimation(page);
    });
    PageHidden.subscribe(page => {
        // Anything to do here?
    });
}

// Defines the extra fields we expect to find in the dataset of an HTMLElement
// that has animation specified (to make TypeScript and TSLint happy).
interface IAnimation { initialrect: string;  finalrect: string; }

class Animation {
    public static playAnimation(page: HTMLElement): void {
        const animationView = <HTMLElement> ([].slice.call(page.getElementsByClassName("bloom-imageContainer"))
            .find(v => (<IAnimation> v.dataset).initialrect));
        if (!animationView) {return; } // no image to animate
        const stylesheet = this.getAnimationStylesheet().sheet;
        const initialRectStr = (<IAnimation> <any> animationView.dataset).initialrect;

        //Fetch the data from the dataset and reformat into scale width and height along with offset x and y
        const initialRect = initialRectStr.split(" ");
        const viewWidth = animationView.getBoundingClientRect().width;
        const viewHeight = animationView.getBoundingClientRect().height;
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
        if ((<CSSStyleSheet> stylesheet).cssRules.length > 1) {
            // remove rules from some previous picture
            (<CSSStyleSheet> stylesheet).removeRule(1);
            (<CSSStyleSheet> stylesheet).removeRule(0);
        }

        //Insert the keyframe animation rule with the dynamic begin and end set
        (<CSSStyleSheet> stylesheet).insertRule("@keyframes movepic { from{ transform-origin: 0px 0px; transform: "
            + initialTransform + "; } to{ transform-origin: 0px 0px; transform: " + finalTransform + "; } }", 0);

        //Insert the css for the imageView div that utilizes the newly created animation
        (<CSSStyleSheet> stylesheet).insertRule(".bloom-animate { transform-origin: 0px 0px; transform: "
            + initialTransform
            + "; animation-name: movepic; animation-duration: 2500ms; animation-fill-mode: forwards; }", 1);
        this.addClass(animationView, "bloom-animate");
    }

    private static addClass(elt: HTMLElement, className: string) {
        const index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + " " + className;
        }
    }

    private static getAnimationStylesheet(): HTMLStyleElement {
        let animationElement = document.getElementById("animationSheet");
        if (!animationElement) {
            animationElement = document.createElement("style");
            animationElement.setAttribute("type", "text/css");
            animationElement.setAttribute("id", "animationSheet");
            animationElement.innerText = ".bloom-imageContainer {overflow: hidden}";
            document.body.appendChild(animationElement);
        }
        return <HTMLStyleElement> animationElement;
    }
}
