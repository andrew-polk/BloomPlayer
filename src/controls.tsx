/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
import Navigation from "./navigation";
import "./controls.less";
import {Mute} from "./music";
import LiteEvent from "./event";
import Music from "./music";
import Multimedia from "./multimedia";

export var Play: LiteEvent<void>;
export var Pause: LiteEvent<void>;

let paused: boolean = false;

export function IsPaused(): boolean {
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
        if (Multimedia.documentHasMultimedia()) {
            controlRoot.classList.add("multimedia");
        }

        // similarly, we mark the controls if the document has any background music
        let musicButton;
        if (Music.documentHasMusic()) {
            controlRoot.classList.add("hasMusic");
            musicButton = (<div id="musicButton" className= "button"
                            onClick={(event: Event)  => {
                                const isOff: boolean  = (event.target as HTMLElement).classList.contains("off");
                                //Start playing only if the overall multimedia is not paused, and 
                                //also music was previously turned off by the user
                                Mute.raise(!isOff);
                                (event.target as HTMLElement).classList.toggle("off");
                            } } />);
        }

        ReactDOM.render(
            <div id="controls">
                <div id="toolbar">
                    <div id="homeButton" className="button"
                        onClick={() => this.navigation.showFirstPage() }/>
                    {musicButton}
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
}