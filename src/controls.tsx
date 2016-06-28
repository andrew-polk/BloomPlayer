/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Carousel} from "./carousel";
import "./controls.less";

export default class Controls {
    private carousel: Carousel;

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
                        onClick={() => alert("will someday toggle music")}/>
                    <div id="narrationButton" className="button"
                        onClick={() => alert("will someday toggle narration")}/>
                    <div id="bloomButton" className="button"
                        onClick={() => alert("will someday do an about box")}/>
                </div>
                <div id="middleBar">
                    <div id="previousButton" className="button"
                        onClick={() => this.carousel.gotoPreviousPage()} />
                    <div id="playAndPauseButton" className="button"
                        onClick={() => alert("will someday play and pause")}/>
                    <div id="nextButton" className="button"
                        onClick={() => this.carousel.gotoNextPage()} />
                </div>
            </div>,
      controlsElement
    );
  }
}