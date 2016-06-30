/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Carousel} from "./carousel";
import "./controls.less";
import {ToggleMusic} from "./music";
import LiteEvent from "./event";

export var Play: LiteEvent<void>;
export var Pause: LiteEvent<void>;

export default class Controls {
    private carousel: Carousel;
    private paused: Boolean = false;

    public show( carousel: Carousel) {
        this.carousel = carousel;

        document.body.insertAdjacentHTML("afterbegin", "<div id='react-controls'></div>");
        const controlsElement = document.getElementById("react-controls");

        ReactDOM.render(
            <div id="controls">
                <div id="toolbar">
                    <div id="homeButton" className="button"
                        onClick={() => this.carousel.showFirstPage()}/>
                    <div id="musicButton" className="button"
                        onClick={() => ToggleMusic.raise() }/>
                    <div id="narrationButton" className="button"
                        onClick={() => alert("will someday toggle narration")}/>
                    <div id="bloomButton" className="button"
                        onClick={() => alert("will someday do an about box")}/>
                </div>
                <div id="middleBar">
                    <div id="previousButton" className="button"
                        onClick={() => this.carousel.gotoPreviousPage()} />
                    <div id="playAndPauseButton" className="button"
                        onClick={(event: Event) => {
                            this.paused = !this.paused;
                            const btn: HTMLElement = event.target as HTMLElement;
                            if (this.paused) {
                                btn.classList.add("paused");
                                Pause.raise();
                            } else {
                                btn.classList.remove("paused");
                                Play.raise();
                            }
                        }} />
                    <div id="nextButton" className="button"
                        onClick={() => this.carousel.gotoNextPage()} />
                </div>
            </div>,
      controlsElement
    );
  }
}