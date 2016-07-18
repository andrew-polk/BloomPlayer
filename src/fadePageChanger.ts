import {PageVisible, PageBeforeVisible, PageHidden} from "./navigation";
import {IPageChanger} from "./IPageChanger";

// The FadeTransition is one system for transitioning between pages
export default class FadePageChanger implements IPageChanger {

    private pageBeingHidden: HTMLElement;

    public constructor(parent: HTMLElement) {
        //empty
    }

    public showFirstPage() {
        if (this.currentPage()) {
            this.currentPage().classList.remove("currentPage");
        }
        this.pageViewer().children[0].classList.add("currentPage");
    }

    public transitionPage(targetPage: HTMLElement, goForward: boolean /* unused */): void {
        const current = this.currentPage();

        this.pageBeingHidden = current;

        PageHidden.raise(current);

        //find the next one
        if (targetPage) {
            targetPage.classList.add("currentPage");
            targetPage.style.position = "absolute";
            targetPage.style.left = "0";
            targetPage.style.top = "0";

            //set our starting values that we will transition
            targetPage.style.opacity = "0";
            current.style.opacity = "1";

            //set our target values for the end of the transition
            window.setTimeout( () => {
                targetPage.style.opacity = "1.0";
                current.style.opacity = "0";
            }, 0);

            PageBeforeVisible.raise(targetPage);

            //at the end of the transition, clean things up
            // this number must match what is in the div.bloom-page rule in layout.less for opacity transition
            const transitionMilliseconds = 1000; //500;
            window.setTimeout(() => {
                        this.pageBeingHidden.classList.remove("currentPage");
                        this.pageBeingHidden.style.opacity = ""; //reset it
                        //this.pageViewer().style.transition = "";
                        targetPage.style.position = ""; //reset it
                        targetPage.style.top = ""; //reset it
                        targetPage.style.left = ""; //reset it
                        // if (targetPage) {
                        //     PageVisible.raise(targetPage);
                        // }
            }, transitionMilliseconds);
            // It seems to give a nice effect to start the animation and sound while the fade is
            // still in progress.
            window.setTimeout(() => {
                // targetPage.style.position = ""; //reset it
                // targetPage.style.top = ""; //reset it
                // targetPage.style.left = ""; //reset it
               if (targetPage) {
                    PageVisible.raise(targetPage);
                }
            }, 400);
        } else {
            // wrap around //TODO remove this when we can disable the "next button" on the last page
            //this.showFirstPage();
        }
    }

    private pageViewer(): HTMLElement {
        return  document.getElementById("pageViewer");
    }
    private  currentPage(): HTMLElement {
        return this.pageViewer().getElementsByClassName("currentPage")[0] as HTMLElement;
    }
}
