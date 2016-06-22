import "./navigation.less";
import LiteEvent from "./event";

export var PageVisible: LiteEvent<HTMLElement>;
export var PageBeforeVisible: LiteEvent<HTMLElement>;
export var PageHidden: LiteEvent<HTMLElement>;

export default class Navigation {
 private pageBeingHidden: HTMLElement;

    public setupNavigation() {
        PageVisible = new LiteEvent<HTMLElement>();
        PageBeforeVisible = new LiteEvent<HTMLElement>();
        PageHidden = new LiteEvent<HTMLElement>();

        document.body.insertAdjacentHTML("afterbegin", "<div id='navigation'></div>");
        const navigation = document.getElementById("navigation");

        navigation.insertAdjacentHTML("afterbegin", "<div id='pages-carousel'></div>");
        const carousel = document.getElementById("pages-carousel");

        carousel.addEventListener("transitionend", () => {
                        console.log("trans");
                        this.pageBeingHidden.classList.remove("currentPage");
                        carousel.style.transition = "";
                        carousel.style.left = "0px";
                        //carousel.style.right = "unset";

                        const current = this.currentPage();
                        if (current) {
                            PageVisible.raise(current);
                        }
                        console.log("endtrans");
                    }, true);

        const pages = document.getElementsByClassName("bloom-page");

        for (let index = 0; index < pages.length; index++) {
            carousel.appendChild(pages[index]);
        }
        this.addOverlayButton("homeButton", () => this.showFirstPage());
        this.addOverlayButton("nextButton", () => this.gotoNextPage());
        this.addOverlayButton("previousButton", () => this.gotoPreviousPage());
    }

    public showFirstPage() {
        [].forEach.call(document.body.querySelectorAll(".bloom-page"), function(page){
                page.classList.remove("currentPage");
            });

        this.firstPage().classList.add("currentPage");
        this.carousel().style.left = "0px";
        // No animation of showing first page, but seems safest to
        // raise this event anyway.
        PageBeforeVisible.raise(this.firstPage());
        PageVisible.raise(this.firstPage());
    }

    private addOverlayButton(id: string, clickHandler: (evt: MouseEvent) => void) {
        const navigation = document.getElementById("navigation");
        navigation.insertAdjacentHTML("afterBegin", "<div id='" + id + "' class='overlay'></div>");

        document.getElementById(id).onclick = (event) => {
            event.stopPropagation();
            clickHandler(event);
        };
    }

    private carousel(): HTMLElement {
        return  document.getElementById("pages-carousel");
    }
    private  currentPage(): HTMLElement {
        return this.carousel().getElementsByClassName("currentPage")[0] as HTMLElement;
    }
    private  firstPage(): HTMLElement {
        return document.body.getElementsByClassName("bloom-page")[0] as HTMLElement;
    }

    private  pageWidth(): number {
        return this.currentPage().scrollWidth;
    }

    private  gotoNextPage(): void {
         this.transitionPage(this.currentPage().nextElementSibling  as HTMLElement, true);
    }

    private  gotoPreviousPage(): void {
        this.transitionPage(this.currentPage().previousElementSibling  as HTMLElement, false);
    }

    private  transitionPage(targetPage: HTMLElement, goForward: boolean): void {
        const current = this.currentPage();
        // Here we set a new 'left' or 'right' and will animate transition from 0 to that new value.
        // As soon as it is done, an 'transtionend' event will just hide that page completely
        // and reset the carousel's positioning to 'left:0' (regardless of whether we were manipulating
        // the 'left' (to go forward) or 'right' (to go backward)).
        this.carousel().style.transition = "left 0.5s ease 0s, right 0.5s ease 0s";

        if (goForward) {
            this.carousel().style.left = (-1 * this.pageWidth()) + "px";
        } else {
            this.carousel().style.right =  this.pageWidth() + "px";
        }

        this.pageBeingHidden = current;

        PageHidden.raise(current);

        //find the next one
        if (targetPage) {
            targetPage.classList.add("currentPage");
            PageBeforeVisible.raise(targetPage); // before the animation
        } else {
            // wrap around //TODO remove this when we can disable the "next button" on the last page
            this.showFirstPage();
        }
    }
}
