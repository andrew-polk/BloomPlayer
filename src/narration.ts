import {PageVisible, PageBeforeVisible, PageHidden} from "./navigation";
import LiteEvent from "./event";
import {Play, Pause, IsPaused} from "./controls";

export function SetupNarration(): void {
    PageVisible.subscribe(page => {
        Narration.playAllSentences(page);
    });
    PageHidden.subscribe(page => {
        // Todo: stop playing?
    });
    PageBeforeVisible.subscribe(page => {
        Narration.computeDuration(page);
    });

    Narration.subscribeEvents();
}

// This can (and should) be called very early in the setup process, before any of the setup calls that use
// these events.
export function SetupNarrationEvents(): void {
    PageDurationAvailable = new LiteEvent<HTMLElement>();
    PageNarrationComplete = new LiteEvent<HTMLElement>();
}

export var PageDuration: number;
export var PageDurationAvailable: LiteEvent<HTMLElement>;
export var PageNarrationComplete: LiteEvent<HTMLElement>;

// Todo: to highlight current sentence, define properties for class ui-audioCurrent

enum Status {
    Disabled, // Can"t use button now (e.g., Play when there is no recording)
    Enabled, // Can use now, not the most likely thing to do next
    Expected, // The most likely/appropriate button to use next (e.g., Play right after recording)
    Active // Button now active (Play while playing; Record while held down)
};

class Narration {

    public static subscribeEvents() {
        Play.subscribe( () => {
            if (this.segments.length) {
                Narration.getPlayer().play();
            }
            this.paused = false;
            // adjust startPlay by the elapsed pause. This will cause fakePageNarrationTimedOut to
            // start a new timeout if we are depending on it to fake PageNarrationComplete.
            const pause = (new Date().getTime() - this.startPause.getTime());
            this.startPlay = new Date(this.startPlay.getTime() + pause);
            //console.log("paused for " + pause + " and adjusted start time to " + this.startPlay);
            if (this.fakeNarrationAborted) {
                // we already paused through the timeout for normal advance.
                // This call (now we are not paused and have adjusted startPlay)
                // will typically start a new timeout. If we are very close to
                // the desired duration it may just raise the event at once.
                // Either way we should get the event raised exactly once
                // at very close to the right time, allowing for pauses.
                this.fakeNarrationAborted = false;
                this.fakePageNarrationTimedOut(this.playerPage);
            }
        });
        Pause.subscribe( () => {
            if (this.segments.length) {
                Narration.getPlayer().pause();
            }
            this.paused = true;
            this.startPause = new Date();
        });
    }

    public static playAllSentences(page: HTMLElement): void {
        this.playerPage = page;
        const audioElts = this.getAudioElements();
        if (audioElts.length === 0) { return; } // nothing to play.
        const original: Element = page.querySelector(".ui-audioCurrent");
        const first = audioElts[0];
        this.setCurrentSpan(original, first);
        this.playingAll = true;
        this.setStatus("listen", Status.Active);
        this.playCurrentInternal();
    }

    public static computeDuration(page: HTMLElement): void {
        this.playerPage = page;
        this.segments = this.getAudioElements();
        this.pageDuration = 0.0;
        this.segmentIndex = -1; // so pre-increment in getNextSegment sets to 0.
        this.startPlay = new Date();
        //console.log("started play at " + this.startPlay);
        // in case we are already paused (but did manual advance), start computing
        // the pause duration from the beginning of this page.
        this.startPause = this.startPlay;
        if (this.segments.length === 0) {
            PageDuration = 2.0;
            PageDurationAvailable.raise(page);
            // Since there is nothing to play, we will never get an 'ended' event
            // from the player. If we are going to advance pages automatically,
            // we need to raise PageNarrationComplete some other way.
            // A timeout allows us to raise it after the arbitrary duration we have
            // selected. The tricky thing is to allow it to be paused.
            setTimeout(() => this.fakePageNarrationTimedOut(page), PageDuration * 1000);
            this.fakeNarrationAborted = false;
            return;
        }
        // trigger first duration evaluation. Each triggers another until we have them all.
        this.getNextSegment();
        //this.getDurationPlayer().setAttribute("src", this.currentAudioUrl(this.segments[0].getAttribute("id")));
    }

    private static playerPage: HTMLElement;
    private static idOfCurrentSentence: string;
    private static playingAll: boolean;
    private static segments: HTMLElement[];
    private static segmentIndex: number;
    private static pageDuration: number;
    private static paused: boolean = false;
    // The time we started to play the current page (set in computeDuration, adjusted for pauses)
    private static startPlay: Date;
    private static startPause: Date;
    private static fakeNarrationAborted: boolean = false;

    private static fakePageNarrationTimedOut(page: HTMLElement) {
        if (this.paused) {
            this.fakeNarrationAborted = true;
            return;
        }
        // It's possible we experienced one or more pauses and therefore this timeout
        // happened too soon. In that case, this.startPlay will have been adjusted by
        // the pauses, so we can detect that here and start a new timeout which will
        // occur at the appropriately delayed time.
        const duration = (new Date().getTime() - this.startPlay.getTime()) / 1000;
        if ( duration < PageDuration - 0.01) {
            // too soon; try again.
            setTimeout(() => this.fakePageNarrationTimedOut(page), (PageDuration - duration) * 1000);
            return;
        }
        PageNarrationComplete.raise(page);
    }
    private static getDurationPlayer(): HTMLMediaElement {
        return this.getAudio("bloom-duration", (audio) => {
            audio.addEventListener("durationchange", (ev) => {
                this.pageDuration += audio.duration;
                this.getNextSegment();
            });
            audio.addEventListener("error", (ev) => {
                this.getNextSegment(); // can't get a length for this segment, move on.
            });
        });
    }

    private static getNextSegment() {
        this.segmentIndex++;
        if (this.segmentIndex < this.segments.length) {
            const attrDuration = this.segments[this.segmentIndex].getAttribute("data-duration");
            if (attrDuration) {
                // precomputed duration available, use it and go on.
                this.pageDuration += parseFloat(attrDuration);
                this.segmentIndex++;
                this.getNextSegment();
                return;
            }
            this.getDurationPlayer().setAttribute("src",
                this.currentAudioUrl(this.segments[this.segmentIndex].getAttribute("id")));
        } else {
            if (this.pageDuration < 1.0) {
                this.pageDuration = 1.0; // maybe too small?
            }
            PageDuration = this.pageDuration;
            PageDurationAvailable.raise(this.playerPage);
        }
    }

    // Returns all elements that match CSS selector {expr} as an array.
    // Querying can optionally be restricted to {container}’s descendants
    private static findAll(expr: string, container: HTMLElement): HTMLElement[] {
        return [].slice.call((container || document).querySelectorAll(expr));
    }

    private static getRecordableDivs(): HTMLElement[] {
        return this.findAll("div.bloom-editable.bloom-content1", this.playerPage);
    }

    private static getAudioElements(): HTMLElement[] {
        return [].concat.apply([], this.getRecordableDivs().map(x => this.findAll(".audio-sentence", x)));
    }

    private static setCurrentSpan(current: Element, changeTo: HTMLElement): void {
        if (current) {
            this.removeClass(current, "ui-audioCurrent");
        }
        this.addClass(changeTo, "ui-audioCurrent");
        this.idOfCurrentSentence = changeTo.getAttribute("id");
        this.updatePlayerStatus();
        //this.changeStateAndSetExpected("record");
    }

    private static removeClass(elt: Element, className: string) {
        const index = elt.className.indexOf(className);
        if (index >= 0) {
            elt.className = elt.className.slice(0, index)
                + elt.className.slice(index + className.length, elt.className.length);
        }
    }

    private static addClass(elt: HTMLElement, className: string) {
        const index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + " " + className;
        }
    }

    private static getPlayer(): HTMLMediaElement {
        return this.getAudio("player", (audio) => {
              // if we just pass the function, it has the wrong "this"
             audio.addEventListener("ended", () => this.playEnded());
             audio.addEventListener("error", () => this.playEnded());
        });
    }

    private static getAudio(id: string, init: Function) {
         let player  = document.querySelector("#" + id);
         if (!player) {
             player = document.createElement("audio");
             player.setAttribute("id", id);
             document.body.appendChild(player);
             init(player);
         }
         return <HTMLMediaElement> player;
    }

    // Gecko has no way of knowing that we"ve created or modified the audio file,
    // so it will cache the previous content of the file or
    // remember if no such file previously existed. So we add a bogus query string
    // based on the current time so that it asks the server for the file again.
    // Fixes BL-3161
    private static updatePlayerStatus() {
        const player  = this.getPlayer();
        player.setAttribute("src", this.currentAudioUrl( this.idOfCurrentSentence)
            + "?nocache=" + new Date().getTime());
    }

    private static currentAudioUrl(id: string): string {
        return "audio/" + id + ".mp3";
    }

    private static setStatus(which: string, to: Status): void {
        // Todo: anything?
    }

    private static playCurrentInternal() {
        if (!IsPaused()) {
            this.getPlayer().play();
        }
    }

    private static playEnded(): void {
        if (this.playingAll) {
            const current: Element = this.playerPage.querySelector(".ui-audioCurrent");
            const audioElts = this.getAudioElements();
            const nextIndex = audioElts.indexOf(<HTMLElement> current) + 1;
            if (nextIndex < audioElts.length) {
                const next = audioElts[nextIndex];
                this.setCurrentSpan(current, next);
                this.setStatus("listen", Status.Active); // gets returned to enabled by setCurrentSpan
                this.playCurrentInternal();
                return;
            }
            this.playingAll = false;
            PageNarrationComplete.raise(this.playerPage);
            //this.changeStateAndSetExpected("listen");
            return;
        }
        //this.changeStateAndSetExpected("next");
    }
}
