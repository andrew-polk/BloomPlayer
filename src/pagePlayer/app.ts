/// <reference path="../../typings/index.d.ts" />
import Animation from "./animation";
import {SetupNarrationEvents, PageNarrationComplete, ComputeDuration,
    PlayAllSentences, PlaybackCompleted, SetAndroidMode} from "./narration";

// This is the root file in webpack-config.js for generating bloomPagePlayer, a cut-down version
// of BloomPlayer designed for use embedded in an app which uses its own controls for play, pause,
// page change, and so forth.
// Currently the only such app is BloomReader, an Android app; and sadly, a few things in this
// version are very specific to interacting with the Android code.

let animation: Animation;
let canStart = false;
let startRequested = false;

export function startNarration() {
    startRequested = true;

    if (startRequested && canStart) {
        reallyStart();
    }
}

// Called by android code when android sound play completed
export function playbackCompleted() {
    PlaybackCompleted();
}

function reallyStart() {
    // this slight delay makes it possible to catch breakpoints in vscode even for things that happen right away.
     window.setTimeout( () => {
        SetupNarrationEvents();  // very early, defines events others subscribe to.
        SetAndroidMode();
        animation = new Animation();
        // todo: Some of this at least is probably needed when we handle pan/zoom (Ken Burns) animations.
        // (At least) some changes on the Android side will be needed too; currently, this app is not
        // even being informed of play/pause events. The code here is just left over from when this
        // app was originally copied from the multi-page app.
        //     animation.SetFadePageTransitionMilliseconds(FadePageChanger.transitionMilliseconds);
        //     PageVisible.subscribe(page =>animation.HandlePageVisible(page));
        //     PageBeforeVisible.subscribe(page => animation.HandlePageBeforeVisible(page));
        //     PageDurationAvailable.subscribe(page => {
        //         animation.HandlePageDurationAvailable(page, PageDuration); }
        // );
        //     Play.subscribe(() =>  animation.PlayAnimation());
        //     Pause.subscribe(() => animation.PauseAnimation());

        //nav.GotoFirstPage(); // now go to first page again so that all the fancy stuff gets triggered

        // Subscribe even if this page has no audio, since ComputeDuration will (currently) trigger page
        // completed at once in that case.
        // (Besides, quite likely even if this page has no audio, if the document as a whole has narration,
        // its title very well may have it, and that will be in the data div which is common to all pages,
        // so we will find an audio-sentence in the doc.)
        PageNarrationComplete.subscribe(page => {
            (<any> (<any> (window)).Android).pageCompleted();
        });
        const page = <HTMLElement> (document.body.querySelector(".bloom-page"));
        if (page) {
            ComputeDuration(page); // precondition, though we don't yet need the result directly.
            PlayAllSentences(page);
        }
    // increase this number if doing source-level debugging an a breakpoint early in this method isn't being hit
    }, 100);
}

function canStartNarration() {
    canStart = true;
    if (startRequested && canStart) {
        reallyStart();
    }
    // This handshake allows the Java to know not only that the page is loaded, but that the
    // Javascript itself is loaded.
    (<any> (<any> (window)).Android).domContentLoaded();
}

document.addEventListener("DOMContentLoaded", canStartNarration, false);
