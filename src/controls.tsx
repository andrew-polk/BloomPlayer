/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
import Navigation from "./navigation";
import "./controls.less";
import {ToggleMusic} from "./music";
import LiteEvent from "./event";
import Animation from "./animation";
import {Music} from "./music";

export var Play: LiteEvent<void>;
export var Pause: LiteEvent<void>;

let paused: Boolean = false;

export function IsPaused(): Boolean {
    return paused;
}

// Controls is the overlay of buttons that controls
// navigation, play/pause, toggling the music, etc.
export default class Controls {
    private navigation: Navigation;

    public constructor(navigation: Navigation) {
        this.navigation = navigation;
        Play = new LiteEvent<void>();
        Pause = new LiteEvent<void>();

        document.body.insertAdjacentHTML("afterbegin", "<div id='control-root'></div>");
        const controlRoot: HTMLElement = document.getElementById("control-root");
        controlRoot.addEventListener("touchstart", (event) => {
            controlRoot.classList.add("touchCapabilityDetected");
            controlRoot.classList.add("displayBasedOnTouch");
            setTimeout(() =>
                controlRoot.classList.remove("displayBasedOnTouch")
                , 5000);
        }, false);

        // For now we consider a document multimedia if it has either narration or animation.
        this.multimedia = !!(document.getElementsByClassName("audio-sentence").length
            || Animation.getAnimationView(document.body));
        if (this.multimedia) {
            controlRoot.classList.add("multimedia");
        }

        // similarly, we mark the controls if the document has any background music
        const hasMusic = [].slice.call(document.body.getElementsByClassName("bloom-page"))
            .find(p => Music.pageHasMusic(p));
        if (hasMusic) {
            controlRoot.classList.add("hasMusic");
        }

        ReactDOM.render(
            <div id="controls">
                <div id="toolbar">
                    <div id="homeButton" className="button"
                        onClick={() => this.navigation.showFirstPage() }/>
                    <div id="musicButton" className="button"
                        onClick={() => ToggleMusic.raise() }/>
                    {/* <div id="narrationButton" className="button"
                        onClick={() => alert("will someday toggle narration")}/> */}
                    <div id="bloomButton" className="button"
                        onClick={() => alert("This book was created with Bloom. Find more books at BloomLibrary.org") }/>
                </div>
                <div id="middleBar">
                    <div id="previousButton" className="button"
                        onClick={() => this.navigation.gotoPreviousPage() } />
                    <div id="playAndPauseButton" className="button"
                        onClick={(event: Event) => {
                            paused = !paused;
                            const btn: HTMLElement = event.target as HTMLElement;
                            if (paused) {
                                btn.classList.add("paused");
                                Pause.raise();
                            } else {
                                btn.classList.remove("paused");
                                Play.raise();
                            }
                        } } />
                    <div id="nextButton" className="button"
                        onClick={() => this.navigation.gotoNextPage() } />
                </div>
            </div>,
            controlRoot
        );
    }

    public documentHasMultimedia(): boolean {
        return this.multimedia;
    }

    private multimedia: boolean;
}