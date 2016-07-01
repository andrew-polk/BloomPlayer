import "./controls.less";
import LiteEvent from "./event";
import Carousel from "./carousel";

export var PageVisible: LiteEvent<HTMLElement>;
export var PageBeforeVisible: LiteEvent<HTMLElement>;
export var PageHidden: LiteEvent<HTMLElement>;
export var GoNextPage: LiteEvent<void>;

// This class handles navigation commands from controls and
// owns the various navigation events. It determines
// what transition system (e.g. carousel or fade) that
// this book will use and manages that system.
export default class Navigation {

    private carousel: Carousel;

    public constructor(parent: HTMLElement) {
            PageVisible = new LiteEvent<HTMLElement>();
            PageBeforeVisible = new LiteEvent<HTMLElement>();
            PageHidden = new LiteEvent<HTMLElement>();
            GoNextPage = new LiteEvent<void>();
            GoNextPage.subscribe( () => this.gotoNextPage());
            this.carousel = new Carousel(parent);
    }

    public showFirstPage() {
        [].forEach.call(document.body.querySelectorAll(".bloom-page"), function(page){
                page.classList.remove("currentPage");
            });

        this.firstPage().classList.add("currentPage");

        //TODO better way to do this?
        this.carousel.showFirstPage();
        // No animation of showing first page, but seems safest to
        // raise this event anyway.
        PageBeforeVisible.raise(this.firstPage());
        PageVisible.raise(this.firstPage());
    }

    public  gotoNextPage(): void {
         this.carousel.transitionPage(this.currentPage().nextElementSibling  as HTMLElement, true);
    }

    public  gotoPreviousPage(): void {
        const target = this.currentPage().previousElementSibling  as HTMLElement;
        if (target.classList.contains("bloom-page")) {
            this.carousel.transitionPage(target, false);
        }
    }

    private  currentPage(): HTMLElement {
        return document.body.getElementsByClassName("currentPage")[0] as HTMLElement;
    }

    private  firstPage(): HTMLElement {
        return document.body.getElementsByClassName("bloom-page")[0] as HTMLElement;
    }
}
