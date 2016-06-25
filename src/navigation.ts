import "./navigation.less";
//import LiteEvent from "./event";
import {Scale} from "./layout";
import {Carousel} from "./carousel";

export  class Navigation {

    private carousel: Carousel;

    public subscribeToEvents() {

        //commented out because we are getting these events even if there is no narration.
        // PageNarrationComplete.subscribe(page => {
        //     if (page === this.currentPage()) {
        //         this.gotoNextPage();
        //     }
        // });
    }

    public setupNavigation() {
        // the hierarch is
        // body
        //      navigation
        //          scaler
        //              carousel
        //                  pages

        document.body.insertAdjacentHTML("afterbegin", "<div id='navigation'></div>");
        const navigationElement = document.getElementById("navigation");
        navigationElement.insertAdjacentHTML("afterbegin", "<div id='scaler'></div>");
        const scalerElement = document.getElementById("scaler");
  //      console.log(Scale());

        window.setTimeout( () => scalerElement.style.transform =  "scale(" + Scale() + ")");
//        console.log(scalerElement.style.transform);
        this.carousel = new Carousel(scalerElement);

        this.addOverlayButton("homeButton", () => this.carousel.showFirstPage());
        this.addOverlayButton("nextButton", () => this.carousel.gotoNextPage());
        this.addOverlayButton("previousButton", () => this.carousel.gotoPreviousPage());
    }

    public GotoFirstPage() {
        this.carousel.showFirstPage();
    }

    private addOverlayButton(id: string, clickHandler: (evt: MouseEvent) => void) {
        const navigation = document.getElementById("navigation");
        navigation.insertAdjacentHTML("afterBegin", "<div id='" + id + "' class='overlay'></div>");

        document.getElementById(id).onclick = (event) => {
            event.stopPropagation();
            clickHandler(event);
        };
    }

    // private carousel(): HTMLElement {
    //     return  document.getElementById("pages-carousel");
    // }
    // private  currentPage(): HTMLElement {
    //     return document.qu.getElementsByClassName("currentPage")[0] as HTMLElement;
    // }
    // private  firstPage(): HTMLElement {
    //     return document.body.getElementsByClassName("bloom-page")[5] as HTMLElement;
    // }

    // private  pageWidth(): number {
    //     return this.currentPage().scrollWidth;
    // }
}
