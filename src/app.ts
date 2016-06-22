import Navigation from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration} from "./narration";

function attach() {
    const nav = new Navigation(); // first: sets up events others hook
    nav.setupNavigation();
    SetupLayout();
    SetupNarration(); // before animation, sets up event it hooks
    SetupAnimation();
    SetupMusic();
    nav.showFirstPage(); // last: triggers event others want
}

document.addEventListener("DOMContentLoaded", attach, false);
