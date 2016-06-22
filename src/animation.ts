import {PageVisible, PageHidden} from './navigation';

export function SetupAnimation() : void{
    PageVisible.subscribe(page =>{
        Animation.playAnimation(page);
    })
    PageHidden.subscribe(page =>{

    })
}

class Animation {
    static playAnimation(page : HTMLElement) : void {
        var animationView = <HTMLElement>([].slice.call(page.getElementsByClassName("bloom-imageContainer")).find(v => v.dataset['initialrect']));
        if (!animationView) {return;} // no image to animate
        var stylesheet = this.getAnimationStylesheet().sheet;
        var initialRectStr = animationView.dataset['initialrect']; // already identified this element as having this attribute.

        //Fetch the data from the dataset and reformat into scale width and height along with offset x and y
        var initialRect = initialRectStr.split(" ");
        var viewWidth = animationView.getBoundingClientRect().width;
        var viewHeight = animationView.getBoundingClientRect().height;
        var initialScaleWidth = 1 / parseFloat(initialRect[2]);
        var initialScaleHeight = 1 / parseFloat(initialRect[3]);
        var finalRect = animationView.dataset['finalrect'].split(" ");
        var finalScaleWidth = 1/ parseFloat(finalRect[2]);
        var finalScaleHeight = 1/ parseFloat(finalRect[3]);
        
        var initialX = parseFloat(initialRect[0]) * viewWidth;
        var initialY = parseFloat(initialRect[1]) * viewHeight;
        var finalX = parseFloat(finalRect[0]) * viewWidth;
        var finalY = parseFloat(finalRect[1]) * viewHeight;

        //Will take the form of 'scale(W, H) translate(Xpx, Ypx)'
        var initialTransform = "scale(" + initialScaleWidth + ", " + initialScaleHeight + ") translate(-" + initialX + "px, -" + initialY + "px)";
        var finalTransform = "scale(" + finalScaleWidth + ", " + finalScaleHeight + ") translate(-" + finalX + "px, -" + finalY + "px)";

        console.log(initialTransform);
        console.log(finalTransform);
        if ((<CSSStyleSheet>stylesheet).cssRules.length > 1) {
            // remove rules from some previous picture
            (<CSSStyleSheet>stylesheet).removeRule(1);
            (<CSSStyleSheet>stylesheet).removeRule(0);
        }

        //Insert the keyframe animation rule with the dynamic begin and end set
        (<CSSStyleSheet>stylesheet).insertRule("@keyframes movepic { from{ transform-origin: 0px 0px; transform: " + initialTransform + "; } to{ transform-origin: 0px 0px; transform: " + finalTransform + "; } }", 0);

        //Insert the css for the imageView div that utilizes the newly created animation
        (<CSSStyleSheet>stylesheet).insertRule(".bloom-animate { transform-origin: 0px 0px; transform: " + initialTransform + "; animation-name: movepic; animation-duration: 2500ms; animation-fill-mode: forwards; }", 1);
        this.addClass(animationView,'bloom-animate');
    }
    
    static addClass(elt: HTMLElement, className: string) {
        var index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + ' ' + className;
        }
    }
    
    static getAnimationStylesheet() : HTMLStyleElement {
        var animationElement = document.getElementById("animationSheet");
        if (!animationElement) {
            animationElement = document.createElement('style');
            animationElement.setAttribute('type', 'text/css');
            animationElement.setAttribute('id', 'animationSheet');
            animationElement.innerText = '.bloom-imageContainer {overflow: hidden}';
            document.body.appendChild(animationElement);
        }
        return <HTMLStyleElement>animationElement;
    }
}