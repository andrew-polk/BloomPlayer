import Navigation from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration, SetupNarrationEvents} from "./narration";

function attach() {
    SetupNarrationEvents();  // very early, defines events others subscribe to.
    const nav = new Navigation(); // first: sets up events others hook
    nav.setupNavigation();

    nav.showFirstPage(); // get things visible
    SetupLayout(); // first page must be visible before we can determine the scale needed
    SetupAnimation();
    SetupMusic();
    SetupNarration();
    nav.showFirstPage(); // now go to first page again so that all the fancy stuff gets triggered
}

document.addEventListener("DOMContentLoaded", attach, false);
