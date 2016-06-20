import './navigation.less';
import LiteEvent from './event';

export var PageVisible : LiteEvent<HTMLElement>;
export var PageHidden : LiteEvent<HTMLElement>;

export function SetupNavigation(){
    PageVisible = new LiteEvent<HTMLElement>();
    PageHidden = new LiteEvent<HTMLElement>();

    var toolbar = document.createElement("div");
    document.body.appendChild(toolbar);
    toolbar.outerHTML = "<div id='playerToolbar'>Home</div>";
    
    document.getElementById("playerToolbar").onclick = function(event){
        event.stopPropagation();
        [].forEach.call(document.body.querySelectorAll('.bloom-page'), function(page){
            page.classList.remove("currentPage");
        });
       showFirstPage();
    }
    
    document.body.onclick = handleClick;

    showFirstPage();
}

function showFirstPage(){
    document.body.getElementsByClassName("bloom-page")[0].classList.add("currentPage");
}

function handleClick(event:Event):void{
    var current = document.body.getElementsByClassName("currentPage")[0] as HTMLElement;
    if(current){
        //hide the current page
        current.classList.remove("currentPage");
        PageHidden.raise(current);

        //find the next one
        var next = current.nextElementSibling as HTMLElement;
        if(next){
            next.classList.add("currentPage");
            PageVisible.raise(next);
        }
        else {
            // wrap around (review)
            showFirstPage();
        }
    }
}
