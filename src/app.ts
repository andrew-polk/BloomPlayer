import {SetupNavigation} from './navigation';
import {SetupLayout} from './layout';
import {SetupAnimation} from './animation';
import {SetupMusic} from './music';
import {SetupNarration} from './narration';

function attach(){
    SetupNavigation();
    SetupLayout();
    SetupAnimation();
    SetupMusic();
    SetupNarration();
}

document.addEventListener('DOMContentLoaded', attach, false);
