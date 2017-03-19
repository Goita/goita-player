import * as PIXI from "pixi.js";
import { Greeter } from "./greeter";
import * as goita from "goita-core";
import { MainView } from "./mainView";

let board: goita.Board;
const view = new MainView();
document.addEventListener("DOMContentLoaded", onLoad.bind(this));

let history = getParameterByName("history");
const hide = getParameterByName("hide");
const playerNo = getParameterByName("no");
history = "12345678,12345679,11112345,11112345,s1,113,2p,3p,431,1p,2p,315,451";
board = goita.Factory.createBoardFromHistory(history);

function onLoad(): void {
    // for debug
    setTimeout(() => {
        view.board = board;
        view.playerNo = Number(playerNo);
        view.showHidden = hide !== "1";
        view.onLoad();
    }, 100);

}

/*
URL parameters to implement

[x] history: historystring
[ ] gamedate: datetime
[ ] names: player names
[x] no: player no
[ ] start: start index
[x] hide: == 1 will hide the other players info
*/

function getParameterByName(name: string, url?: string) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
