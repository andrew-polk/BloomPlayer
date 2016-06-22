/* tslint:disable */
import {PageVisible, PageHidden} from "./navigation";

export function SetupNarration() : void{
    PageVisible.subscribe(page =>{
        Narration.listen(page);
    })
    PageHidden.subscribe(page =>{
        // Todo: stop playing?
    })
}

// Todo: to highlight current sentence, define properties for class ui-audioCurrent

enum Status {
    Disabled, // Can't use button now (e.g., Play when there is no recording)
    Enabled, // Can use now, not the most likely thing to do next
    Expected, // The most likely/appropriate button to use next (e.g., Play right after recording)
    Active // Button now active (Play while playing; Record while held down)
};

class Narration {
    static playerPage : HTMLElement;
    static idOfCurrentSentence : string;
    static playingAll: boolean;
    // 'Listen' is shorthand for playing all the sentences on the page in sequence.
    static listen(page: HTMLElement): void {
        this.playerPage = page;
        var audioElts = this.getAudioElements();
        if (audioElts.length == 0) { return;} // nothing to play.
        var original: Element = page.querySelector('.ui-audioCurrent');
        var first = audioElts[0];
        this.setCurrentSpan(original, first);
        this.playingAll = true;
        this.setStatus('listen', Status.Active);
        this.playCurrentInternal();
    }

    // Returns all elements that match CSS selector {expr} as an array.
    // Querying can optionally be restricted to {container}’s descendants
    static findAll(expr : string, container: HTMLElement) : HTMLElement[] {
	    return [].slice.call((container || document).querySelectorAll(expr));
    }

    static getRecordableDivs() : HTMLElement[] {
        return this.findAll('div.bloom-editable.bloom-content1', this.playerPage);
    }

    static getAudioElements() : HTMLElement[] {
        return [].concat.apply([], this.getRecordableDivs().map(x => this.findAll('.audio-sentence', x)));
    }

    static setCurrentSpan(current: Element, changeTo: HTMLElement): void {
        if (current)
            this.removeClass(current, 'ui-audioCurrent');
        this.addClass(changeTo, 'ui-audioCurrent');
        this.idOfCurrentSentence = changeTo.getAttribute("id");
        this.updatePlayerStatus();
        //this.changeStateAndSetExpected('record');
    }

    static removeClass(elt: Element, className: string) {
        var index = elt.className.indexOf(className);
        if (index >= 0) {
            elt.className = elt.className.slice(0,index) + elt.className.slice(index + className.length, elt.className.length);
        }
    }

    static addClass(elt: HTMLElement, className: string) {
        var index = elt.className.indexOf(className);
        if (index < 0) {
            elt.className = elt.className + ' ' + className;
        }
    }

    static getPlayer() : HTMLMediaElement {
         var player  = document.querySelector('#player');
         if (!player) {
             player = document.createElement('audio');
             player.setAttribute('id', 'player');
             document.body.appendChild(player);
             player.addEventListener('ended', () => this.playEnded()); // if we just pass the function, it has the wrong 'this'
         }
         return <HTMLMediaElement>player;
    }

    // Gecko has no way of knowing that we've created or modified the audio file,
    // so it will cache the previous content of the file or
    // remember if no such file previously existed. So we add a bogus query string
    // based on the current time so that it asks the server for the file again.
    // Fixes BL-3161
    static updatePlayerStatus() {
        var player  = this.getPlayer();
        player.setAttribute('src', this.currentAudioUrl( this.idOfCurrentSentence)+"?nocache="+new Date().getTime());
    }

    static currentAudioUrl(id: string): string{
        return this.urlPrefix() + id + '.wav';
    }

    static  urlPrefix():string{
        var bookSrc = document.URL;
        var index = bookSrc.lastIndexOf('/');
        var bookFolderUrl = bookSrc.substring(0, index + 1);
        return bookFolderUrl+'audio/';
    }

    static setStatus(which: string, to: Status): void {
    }

    static playCurrentInternal() {
        this.getPlayer().play();
    }

    static playEnded(): void {
        if (this.playingAll) {
            var current: Element = this.playerPage.querySelector('.ui-audioCurrent');
            var audioElts = this.getAudioElements();
            var nextIndex = audioElts.indexOf(<HTMLElement>current) + 1;
            if (nextIndex < audioElts.length) {
                var next = audioElts[nextIndex];
                this.setCurrentSpan(current, next);
                this.setStatus('listen', Status.Active); // gets returned to enabled by setCurrentSpan
                this.playCurrentInternal();
                return;
            }
            this.playingAll = false;
            //this.changeStateAndSetExpected('listen');
            return;
        }
        //this.changeStateAndSetExpected('next');
    }
}
