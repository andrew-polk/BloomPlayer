function attach(){
    
    var link = document.createElement('link');
    link.href = '../playerStyles.css';
    link.rel = 'stylesheet';
    link.type = 'text/css'; // no need for HTML5
    document.head.appendChild(link);
    
    var toolbar = document.createElement("div");
    document.body.appendChild(toolbar);
    toolbar.outerHTML = "<div id='playerToolbar'>Home</div>";
    
    //show the first page
    document.body.getElementsByClassName("bloom-page")[0].classList.add("currentPage");
            
    document.getElementById("playerToolbar").onclick = function(event){
        event.stopPropagation();
        [].forEach.call(document.body.querySelectorAll('.bloom-page'), function(page){
            page.classList.remove("currentPage");
        });
        document.body.getElementsByClassName("bloom-page")[0].classList.add("currentPage");
    }
    
    document.body.onclick = function(event){
        var current = document.body.getElementsByClassName("currentPage")[0];
        if(current){
            current.classList.remove("currentPage");
            current = current.nextElementSibling;
            if(current){
                current.classList.add("currentPage");
            }            
        }
    }
    resize();   
}

function resize(){
    var pageWidth = document.querySelectorAll('.bloom-page')[0].scrollWidth;
    var pageHeight = document.querySelectorAll('.bloom-page')[0].scrollHeight;
    //var scale = window.scrollWidth / pageWidth;
    var scale = Math.min(window.innerWidth/pageWidth,window.innerHeight/pageHeight);
//   var scale = window.innerWidth/pageWidth;
    document.body.style.transform = "scale("+scale+")";
}

document.addEventListener('DOMContentLoaded', attach, false);

window.addEventListener('resize', function(){resize()}, false);
