import {setupNavigation} from "./navigation";
import {SetupLayout} from "./layout";
import {SetupAnimation} from "./animation";
import {SetupMusic} from "./music";
import {SetupNarration} from "./narration";

function attach() {
    setupNavigation();
    SetupLayout();
    SetupAnimation();
    SetupMusic();
    SetupNarration();
}

document.addEventListener("DOMContentLoaded", attach, false);
