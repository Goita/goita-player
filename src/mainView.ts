import * as PIXI from "pixi.js";
import * as goita from "goita-core";

interface IDictionary<TValue> {
    [id: string]: TValue;
}
const contentWidth = 600;
const contentHeight = 800;
const komaWidth = 48;
const komaHeight = 48;

export class MainView {
    public board: goita.Board;
    public playerNo: number;
    public showHidden: boolean = false;

    private app = new PIXI.Application(contentHeight, contentWidth, { antialias: false, backgroundColor: 0xccffaa });
    private graphics = new PIXI.Graphics();
    private textures: IDictionary<PIXI.Texture> = {};
    private hiddenSpriteList = new Array<PIXI.Sprite>();
    private textStyles: IDictionary<PIXI.TextStyle> = {};

    /**
     * load event
     */
    public onLoad() {
        const canvas = this.app.renderer.view;
        const view = document.getElementById("player-view");
        view.appendChild(canvas);

        // Scale mode for all textures, will retain pixelation
        // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.loadTextures();
        this.setupTextStyles();

        this.setStaticContent();
        this.updateMenuArea();
        this.updateBoard();

        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize();
        // this.animate();
    }

    private setStaticContent() {
        // board
        const scale = 0.7;
        const boardScaleX = scale;
        const boardScaleY = scale * 600 / 640;

        const boardBg = new PIXI.Sprite(this.textures["board-bg"]);
        boardBg.pivot.x = 600 / 2;
        boardBg.pivot.y = 640 / 2;
        boardBg.x = contentWidth / 2;
        boardBg.y = contentHeight / 2;
        boardBg.scale.set(boardScaleX, boardScaleY);
        this.app.stage.addChild(boardBg);

        const boardLines = new PIXI.Sprite(this.textures["board-line"]);
        boardLines.pivot.x = 551 / 2;
        boardLines.pivot.y = 589 / 2;
        boardLines.x = contentWidth / 2;
        boardLines.y = contentHeight / 2;
        boardLines.scale.set(boardScaleX, boardScaleY);
        this.app.stage.addChild(boardLines);
    }

    private update(): void {
        this.app.stage.removeChildren();
        this.setStaticContent();
        this.updateMenuArea();
        this.updateBoard();
        // this.app.renderer.render(this.app.stage);
    }

    private updateMenuArea(): void {
        const menu = this.createMenuAreaContainer();
        menu.x = 20;
        menu.y = 700;
        this.app.stage.addChild(menu);
    }

    private createMenuAreaContainer(): PIXI.Container {
        const menu = new PIXI.Container();
        // showHiddenButton
        const hiddenbutton = this.createButtonContentWithText("非表示切替", 100, 30);
        hiddenbutton.on("pointerdown", this.onHiddenSwitchClick.bind(this));

        menu.addChild(hiddenbutton);

        const backbutton = this.createButtonContentWithImage("back", 48, 48, 60, 60);
        backbutton.on("pointerdown", this.onPrevClick.bind(this));
        backbutton.x = 220;
        menu.addChild(backbutton);

        const nextbutton = this.createButtonContentWithImage("forward", 48, 48, 60, 60);
        nextbutton.on("pointerdown", this.onNextClick.bind(this));
        nextbutton.x = 300;
        menu.addChild(nextbutton);

        return menu;
    }

    private createButtonContentWithText(text: string, width: number, height: number): PIXI.Container {
        const button = new PIXI.Container();
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0x444444, 1);
        g.beginFill(0x77ccff, 1);
        g.drawRoundedRect(0, 0, width, height, 10);
        g.endFill();
        button.addChild(g);
        const t = new PIXI.Text(text, this.textStyles["rich"]);
        t.x = width / 2;
        t.y = height / 2;
        t.anchor.set(0.5);
        button.addChild(t);
        button.interactive = true;
        return button;
    }

    private createButtonContentWithImage(textureName: string, imgWidth: number, imgHeight: number, width: number, height: number): PIXI.Container {
        const button = new PIXI.Container();
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0x444444, 1);
        g.beginFill(0x77ccff, 1);
        g.drawRoundedRect(0, 0, width, height, 10);
        g.endFill();
        button.addChild(g);
        const t = new PIXI.Sprite(this.textures[textureName]);
        t.pivot.x = imgWidth / 2;
        t.pivot.y = imgHeight / 2;
        t.x = width / 2;
        t.y = height / 2;
        button.addChild(t);
        button.interactive = true;
        return button;
    }

    private updateBoard() {
        const history = this.createHistoryContainer(this.board.history);
        history.x = 2;
        history.y = 2;
        this.app.stage.addChild(history);

        const poslist = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        const rf = 135;
        const rh = 235;
        const cx = contentWidth / 2;
        const cy = contentHeight / 2;
        for (let i = 0; i < 4; i++) {
            // show field
            const p = this.board.players[i];
            const vi = goita.Util.shiftTurn(i, -this.playerNo);
            const field = this.createFieldContainer(p.field, p.hiddenfield);
            // degree to radius
            field.rotation = (-90 * vi) / 180 * Math.PI;
            field.x = cx + poslist[vi][0] * rf;
            field.y = cy + poslist[vi][1] * rf;
            this.app.stage.addChild(field);

            // show hand
            const hand = this.createHandConainer(p.hand, i !== this.playerNo);
            hand.rotation = (-90 * vi) / 180 * Math.PI;
            hand.x = cx + poslist[vi][0] * rh;
            hand.y = cy + poslist[vi][1] * rh;
            this.app.stage.addChild(hand);
        }
    }

    private loadTextures() {
        const pathToImg = "./img/";
        this.textures["koma"] = PIXI.Texture.fromImage(pathToImg + "koma.png");
        this.textures["koma0"] = PIXI.Texture.fromImage(pathToImg + "koma0.png");
        this.textures["komax"] = PIXI.Texture.fromImage(pathToImg + "komax.png");
        for (let i = 1; i < (10 || 0); i = i + 1) {
            this.textures["koma" + i] = PIXI.Texture.fromImage(pathToImg + "koma" + i + ".png");
            this.textures["koma" + i + "dark"] = PIXI.Texture.fromImage(pathToImg + "koma" + i + "dark.png");
        }
        this.textures["board-line"] = PIXI.Texture.fromImage(pathToImg + "japanese-chess-bdl.png");
        this.textures["board-bg"] = PIXI.Texture.fromImage(pathToImg + "japanese-chess-bg.jpg");
        this.textures["forward"] = PIXI.Texture.fromImage(pathToImg + "ic_arrow_forward_black_48dp_1x.png");
        this.textures["back"] = PIXI.Texture.fromImage(pathToImg + "ic_arrow_back_black_48dp_1x.png");
        this.textures["first"] = PIXI.Texture.fromImage(pathToImg + "ic_first_page_black_48dp_1x.png");
        this.textures["last"] = PIXI.Texture.fromImage(pathToImg + "ic_last_page_black_48dp_1x.png");
    }

    private createFieldContainer(field: goita.Koma[], hiddenField: goita.Koma[]): PIXI.Container {
        const pcontainer = new PIXI.Container();
        for (let i = 0; i < 8; i++) {
            const f = field[i];
            const hf = hiddenField[i];
            const x = Math.floor(i / 2) * komaWidth;
            const y = (i % 2) * komaHeight;
            const slist = this.getKomaSpriteList(f, hf);
            for (const s of slist) {
                s.x = x;
                s.y = y;
                pcontainer.addChild(s);
            }
        }

        pcontainer.pivot.x = komaWidth * 2;
        pcontainer.pivot.y = komaHeight;
        return pcontainer;
    }

    private createHandConainer(hand: goita.Koma[], hidden: boolean): PIXI.Container {
        const hcontainer = new PIXI.Container();
        for (let i = 0; i < 8; i++) {
            const h = hand[i];
            if (h.isEmpty) {
                continue;
            }
            const slist = new Array<PIXI.Sprite>();
            const x = i * komaWidth;
            const y = 0;
            if (hidden) {
                const sb = new PIXI.Sprite(this.textures["komax"]);
                const sf = new PIXI.Sprite(this.textures["koma" + h.value + "dark"]);
                sf.renderable = this.showHidden;
                this.hiddenSpriteList.push(sf);
                slist.push(sb);
                slist.push(sf);
            } else {
                const sb = new PIXI.Sprite(this.textures["koma"]);
                const sf = new PIXI.Sprite(this.textures["koma" + h.value]);
                slist.push(sb);
                slist.push(sf);
            }

            for (const s of slist) {
                s.x = x;
                s.y = y;
                hcontainer.addChild(s);
            }
        }
        hcontainer.pivot.x = komaWidth * 4;
        hcontainer.pivot.y = komaHeight / 2;
        return hcontainer;
    }

    private createHistoryContainer(history: goita.BoardHistory): PIXI.Container {
        const root = new PIXI.Container();
        // history window
        const g = new PIXI.Graphics();
        g.lineStyle(2, 0x0044CC, 1);
        g.beginFill(0x2299FF, 1);
        g.drawRoundedRect(0, 0, 596, 130, 15);
        g.endFill();

        root.addChild(g);

        const innerContent = new PIXI.Container();
        const moves = new Array<goita.Move[]>();
        for (let i = 0; i < 4; i++) {
            moves.push(new Array<goita.Move>());
        }
        // pad null to dealer position
        for (let i = 0; i < history.dealer; i++) {
            moves[i].push(null);
        }

        // fill with history
        for (const m of history.moveStack) {
            moves[m.no].push(m);
        }
        const nameOffset = 50;
        const margin = 10;
        const hlines = new Array<PIXI.Container>();
        for (let i = 0; i < 4; i++) {
            const c = new PIXI.Container();
            const pname = new PIXI.Text("p" + (i + 1), this.textStyles["rich"]);
            c.addChild(pname);
            let count = 0;
            for (const m of moves[i]) {
                if (!m) {
                    count++;
                    continue;
                }
                if (m.pass) {
                    const p = new PIXI.Text("なし", this.textStyles["history"]);
                    p.x = (komaWidth + margin) * count + nameOffset;
                    c.addChild(p);
                } else {
                    let blist: PIXI.Sprite[];
                    if (m.faceDown) {
                        if (m.no === this.playerNo) {
                            blist = this.getKomaSpriteList(goita.Koma.hidden, m.block, true);
                        } else {
                            blist = this.getKomaSpriteList(goita.Koma.hidden, m.block);
                        }
                    } else {
                        blist = this.getKomaSpriteList(m.block, m.block);
                    }
                    const alist = this.getKomaSpriteList(m.attack, m.attack);
                    for (const b of blist) {
                        b.x = (komaWidth + margin) * count + nameOffset;
                        b.scale.x = 0.5;
                        b.scale.y = 0.5;
                        c.addChild(b);
                    }
                    for (const a of alist) {
                        a.x = (komaWidth) * (count + 0.5) + margin * count + nameOffset;
                        a.scale.x = 0.5;
                        a.scale.y = 0.5;
                        c.addChild(a);
                    }
                }

                count++;
            }
            hlines.push(c);
        }
        const headerHeight = 23;
        for (let i = 0; i < 4; i++) {
            const line = hlines[i];
            line.position.y = (komaHeight + 6) / 2 * i + headerHeight;
            innerContent.addChild(line);
        }

        // history header
        for (let i = 0; i < moves[0].length; i++) {
            const text = new PIXI.Text((i + 1) + "順目", this.textStyles["rich"]);
            text.position.x = (komaWidth + margin) * i + nameOffset;
            innerContent.addChild(text);
        }

        innerContent.x = 4;
        innerContent.y = 0;
        root.addChild(innerContent);

        return root;
    }

    private getKomaSpriteList(koma: goita.Koma, hiddenKoma: goita.Koma, alwaysVisible: boolean = false): PIXI.Sprite[] {
        const slist = new Array<PIXI.Sprite>();
        if (koma.isEmpty) {
            const s = new PIXI.Sprite(this.textures["koma" + koma.value]);
            slist.push(s);
        } else if (koma.isHidden) {
            const s = new PIXI.Sprite(this.textures["koma" + koma.value]);
            const hs = new PIXI.Sprite(this.textures["koma" + hiddenKoma.value + "dark"]);
            if (!alwaysVisible) {
                hs.renderable = this.showHidden;
                this.hiddenSpriteList.push(hs);
            }
            slist.push(s);
            slist.push(hs);
        } else {
            const sb = new PIXI.Sprite(this.textures["koma"]);
            const sf = new PIXI.Sprite(this.textures["koma" + koma.value]);
            slist.push(sb);
            slist.push(sf);
        }
        return slist;
    }

    private setupTextStyles() {
        this.textStyles["rich"] = new PIXI.TextStyle({
            fontFamily: "",
            fontSize: 16,
            fontStyle: "italic",
            fontWeight: "bold",
            fill: ["#ffffff", "#00ff99"], // gradient
            stroke: "#4a1850",
            strokeThickness: 3,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 2,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 3,
            wordWrap: true,
            wordWrapWidth: 440,
        });
        this.textStyles["history"] = new PIXI.TextStyle({
            fontSize: 24,
        });
    }

    /** click event */
    private onHiddenSwitchClick() {
        const hidden = !this.showHidden;
        this.showHidden = hidden;
        for (const s of this.hiddenSpriteList) {
            s.renderable = hidden;
        }
    }

    private onNextClick() {
        if (this.board.canRedo()) {
            this.board.redo();
            this.update();
        }
    }

    private onPrevClick() {
        if (this.board.canUndo()) {
            this.board.undo();
            this.update();
        }
    }

    /** resize event */
    private onResize() {
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const ratio = Math.min(width / contentWidth, height / contentHeight);
        this.app.renderer.resize(contentWidth * ratio, contentHeight * ratio);
        this.app.stage.scale.set(ratio);
    }

    /**
     * アニメーション
     */
    private animate() {
        // this.app.renderer.render(this.app.stage);
        requestAnimationFrame(this.animate.bind(this));
    }
}
