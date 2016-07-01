/// <reference path="../typings/index.d.ts" />

import {SetupLayout} from "./layout";
import Animation from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration, SetupNarrationEvents, PageNarrationComplete} from "./narration";
import Controls from "./controls";
import Navigation, {GoNextPage} from "./navigation";
import {Scale} from "./layout";

let animation: Animation;
let controls: Controls;

function attach() {
    SetupLayout();

    setUpDomForPlaying();

    SetupNarrationEvents();  // very early, defines events others subscribe to.
    animation = new Animation();
    SetupMusic();
    SetupNarration();

    (<any> window).navigation.showFirstPage();

    //nav.GotoFirstPage(); // now go to first page again so that all the fancy stuff gets triggered

    //commented out because we are getting these events even if there is no narration.
    PageNarrationComplete.subscribe(page => {
        if (page === (<any> window).navigation.currentPage()) {
             GoNextPage.raise();
        }
    });
}

function setUpDomForPlaying() {
    document.body.insertAdjacentHTML("afterbegin", "<div id='root'></div>");
    const rootElement = document.getElementById("root");
    rootElement.insertAdjacentHTML("afterbegin", "<div id='scaler'></div>");
    const scalerElement = document.getElementById("scaler");

    window.setTimeout( () => scalerElement.style.transform =  "scale(" + Scale() + ")");

    (<any> window).navigation = new Navigation(scalerElement);
    controls = new Controls((<any> window).navigation);
}

document.addEventListener("DOMContentLoaded", attach, false);
