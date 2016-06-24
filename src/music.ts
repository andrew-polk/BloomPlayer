import {PageVisible, PageHidden} from "./carousel";

export function SetupMusic(): void {
    PageVisible.subscribe(page => {
        if (Music.pageHasMusic(page)) {
            Music.listen(page);
        }
    });
    PageHidden.subscribe(page => {
        // Nothing to do at this point
    });
}

class Music {
    public static pageHasMusic(page: HTMLElement): boolean {
        return page.attributes["data-backgroundaudio"];
    }

    public static listen(page: HTMLElement): void {
        this.playerPage = page;
        this.setAudioSource();
        this.play();
    }

    private static playerPage: HTMLElement;

    private static play() {
        this.getPlayer().play();
    }

    private static getPlayer(): HTMLMediaElement {
         let player = document.querySelector("#music-player");
         if (!player) {
             player = document.createElement("audio");
             player.setAttribute("id", "music-player");
             document.body.appendChild(player);

             // if we just pass the function, it has the wrong "this"
             player.addEventListener("ended", () => this.playEnded());
         }
         return <HTMLMediaElement> player;
    }

    // Gecko has no way of knowing that we've created or modified the audio file,
    // so it will cache the previous content of the file or
    // remember if no such file previously existed. So we add a bogus query string
    // based on the current time so that it asks the server for the file again.
    private static setAudioSource(): void {
        let player  = this.getPlayer();
        player.setAttribute("src", this.playerPage.attributes["data-backgroundaudio"].value +
         "?nocache=" + new Date().getTime());
    }

    private static playEnded(): void {
        // continuous loop until a new page with new music comes along
        Music.play();
    }
}
