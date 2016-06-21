import "./navigation.less";
import LiteEvent from "./event";

export var PageVisible: LiteEvent<HTMLElement>;
export var PageHidden: LiteEvent<HTMLElement>;

export function setupNavigation() {
    PageVisible = new LiteEvent<HTMLElement>();
    PageHidden = new LiteEvent<HTMLElement>();

    document.body.insertAdjacentHTML("afterbegin", "<div id='pages-carousel'></div>");
    const carousel = document.getElementById("pages-carousel");
    const pages = document.getElementsByClassName("bloom-page");
    for (let index = 0; index < pages.length; index++) {
        carousel.appendChild(pages[index]);
    }

    const toolbar = document.createElement("div");
    document.body.appendChild(toolbar);
    toolbar.outerHTML = "<div id='playerToolbar'>Home</div>";

    document.getElementById("playerToolbar").onclick = function(event){
        event.stopPropagation();
        [].forEach.call(document.body.querySelectorAll(".bloom-page"), function(page){
            page.classList.remove("currentPage");
        });
        showFirstPage();
    };

    document.body.onclick = handleClick;

    showFirstPage();
}

function showFirstPage() {
    const firstPage = document.body.getElementsByClassName("bloom-page")[0] as HTMLElement;
    firstPage.classList.add("currentPage");
    document.getElementById("pages-carousel").style.left = "0px";
    PageVisible.raise(firstPage);
}

function handleClick(event: Event): void {
    gotoNextPage();
}

export function gotoNextPage(): void {
    const carousel = document.getElementById("pages-carousel");
    const visiblePages = carousel.getElementsByClassName("currentPage");
    const current = visiblePages[visiblePages.length - 1] as HTMLElement;
    if (current) {
        let left: number = (parseInt(carousel.style.left, 10) || 0);
        left = left - current.scrollWidth;

        carousel.setAttribute("style", "left:" + left + "px");

        //find the next one
        const next = current.nextElementSibling as HTMLElement;
        PageHidden.raise(current);

        if (next) {
            next.classList.add("currentPage");
            //hide the current page after it has slid off the screen
            current.addEventListener("transitionend", () => {
                current.classList.remove("currentPage");
                carousel.setAttribute("style", "left: 0px");
                PageVisible.raise(next);
            }, true);
        } else {
            // wrap around (review)
            showFirstPage();
        }
    }
}

