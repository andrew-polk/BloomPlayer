import Navigation from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration} from "./narration";

function attach() {
    const nav = new Navigation(); // first: sets up events others hook
    nav.setupNavigation();
    SetupLayout();
    SetupAnimation();
    SetupMusic();
    SetupNarration();
    nav.showFirstPage(); // last: triggers event others want
}

document.addEventListener("DOMContentLoaded", attach, false);
