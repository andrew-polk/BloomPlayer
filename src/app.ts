import Navigation from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration} from "./narration";

function attach() {
    const nav = new Navigation(); // first: sets up events others hook
    nav.setupNavigation();

    SetupNarration(); // before animation, sets up event it hooks
    SetupAnimation();
    SetupMusic();
    nav.showFirstPage(); // this should be after animation and music are ready to receive events
    SetupLayout(); // first page must be visible before we can determine the scale needed
}

document.addEventListener("DOMContentLoaded", attach, false);
