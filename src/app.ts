import {Navigation} from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration, SetupNarrationEvents, PageNarrationComplete} from "./narration";
import {GoNextPage} from "./carousel";

function attach() {

    SetupLayout();

    const nav = new Navigation(); // first: sets up events others hook
    nav.setupNavigation();

    SetupNarrationEvents();  // very early, defines events others subscribe to.
    SetupAnimation();
    SetupMusic();
    SetupNarration();
    nav.GotoFirstPage(); // now go to first page again so that all the fancy stuff gets triggered

    //commented out because we are getting these events even if there is no narration.
    // PageNarrationComplete.subscribe(page => {
    //     if (page === nav.currentPage()) {
    //          GoNextPage.raise();
    //     }
    // });
}

document.addEventListener("DOMContentLoaded", attach, false);
