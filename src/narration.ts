import {PageVisible, PageBeforeVisible, PageHidden} from "./carousel";
import LiteEvent from "./event";

export function SetupNarration(): void {
    PageVisible.subscribe(page => {
        Narration.listen(page);
    });
    PageHidden.subscribe(page => {
        // Todo: stop playing?
    });
    PageBeforeVisible.subscribe(page => {
        Narration.computeDuration(page);
    });
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
    // "Listen" is shorthand for playing all the sentences on the page in sequence.
    public static listen(page: HTMLElement): void {
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
        const durationPlayer = this.getAudio("bloom-duration");
        this.playerPage = page;
        const segments = this.getAudioElements();
        let duration = 0.0;
        let index = 0;
        if (segments.length === 0) {
            PageDuration = 2.0;
            PageDurationAvailable.raise(page);
            setTimeout(function() {
                // Arbitrarily raise the event after this delay, so things move on.
                PageNarrationComplete.raise(page);
            }, PageDuration * 1000);
            return;
        }
        const outerThis = this;

        function getNextSegment() {
            index++;
            if (index < segments.length) {
                durationPlayer.setAttribute("src", outerThis.currentAudioUrl(segments[index].getAttribute("id")));
            } else {
                if (duration < 1.0) {
                    duration = 1.0; // maybe too small?
                }
                PageDuration = duration;
                PageDurationAvailable.raise(page);
            }
        }

        durationPlayer.addEventListener("durationchange", () => {
            duration += durationPlayer.duration;
            getNextSegment();
        });
        durationPlayer.addEventListener("error", () => {
            getNextSegment(); // can't get a length for this segment, move on.
        });
        // trigger first duration evaluation.
        durationPlayer.setAttribute("src", this.currentAudioUrl(segments[0].getAttribute("id")));
    }

    private static playerPage: HTMLElement;
    private static idOfCurrentSentence: string;
    private static playingAll: boolean;

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
        return this.getAudio("player");
    }

    private static getAudio(id: string) {
         let player  = document.querySelector("#" + id);
         if (!player) {
             player = document.createElement("audio");
             player.setAttribute("id", id);
             document.body.appendChild(player);
             // if we just pass the function, it has the wrong "this"
             player.addEventListener("ended", () => this.playEnded());
             player.addEventListener("error", () => this.playEnded());
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
        return this.urlPrefix() + id + ".wav";
    }

    private static  urlPrefix(): string {
        const bookSrc = document.URL;
        const index = bookSrc.lastIndexOf("/");
        const bookFolderUrl = bookSrc.substring(0, index + 1);
        return bookFolderUrl + "audio/";
    }

    private static setStatus(which: string, to: Status): void {
        // Todo: anything?
    }

    private static playCurrentInternal() {
        this.getPlayer().play();
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
