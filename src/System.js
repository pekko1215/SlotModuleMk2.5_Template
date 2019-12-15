/*************************************
 * いわゆるメイン基板処理
 * 成立役=>制御の変換や、
 * 払い出し時のゲームモード移行などのアクションを定義する。
 */

const SystemDefine = (slotHandler) => {
    const { slotModule } = slotHandler;
    const { flashController, slotStatus } = slotModule;

    slotModule.RTdata = new DefaultRTClass;

    /***********************
     * 3リール停止後、SlotModuleから送られてくる成立役を元に、
     * 払い出し枚数、フラッシュ、アクションなどを決定する。
     */
    slotModule.onHitCheck = async(e) => {
        let replayFlag = false;
        let payCoin = 0;
        let flashMatrix = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        for (let data of e) {
            let { line, index, matrix } = data;
            let yaku = YakuData[index];
            let { name, pay } = yaku;
            payCoin += pay[slotModule.reelController.mode][3 - slotStatus.betCoin]

            if (!yaku.noEffectable) lastHit = { pay, name, yaku };

            let m = yaku.flashLine || matrix;

            // 成立役フラッシュの合成
            flashMatrix = flashMatrix.map((arr, y) => arr.map((d, x) => d || m[y][x]));


            switch (gameMode) {
                case 'normal':
                    switch (name) {
                        case 'リプレイ':
                            replayFlag = true;
                            break
                        case 'BIG1':
                        case 'BIG2':
                        case 'BIG3':
                            slotHandler.saveData.bonusStart('BIG');
                            bonusData = new BonusData.BigBonus4('BIG', 30, 3);
                            bonusFlag = null;
                            sounder.playSound('big', true);
                            break
                        case 'REG':
                            sounder.playSound('reg', true)
                            slotHandler.saveData.bonusStart('REG');
                            bonusData = new BonusData.RegularBonus4('REG', 8, 8);
                            bonusFlag = null;

                    }
                    break
                case 'BIG':
                    switch (name) {
                        case 'リプレイ':
                            sounder.stopSound('bgm')
                            sounder.playSound('reg', true)
                            bonusData.jacIn('JAC', 8, 8);
                    }
                    break
                case 'REG':
                    break
                case 'JAC':
                    break
            }
        }
        switch (name) {
            default:
            // 成立役フラッシュ
                (async() => {
                while (slotStatus.status !== 'beted') {
                    await flashController.setFlash(FlashData.default, 20);
                    await flashController.setFlash(replaceMatrix(FlashData.default, flashMatrix, ColorData.LINE_F, null), 20)
                }
            })();
        }
        return { payCoin, replayFlag };

    }

    slotModule.on("bonusEnd", async() => {
        /**************************
         * ボーナス終了後の処理
         * 【注意】
         * このイベントは、手動で発火が必要です。
         * slotModule.emit('bonusEnd')
         * と呼び出してください。
         */

        slotHandler.saveData.bonusEnd();
        sounder.stopSound("bgm")
        setGamemode("normal");
        slotModule.freeze();
        await Sleep(2000);
        slotModule.resume();
        bonusData = null;
        bonusFlag = null;
    });


    slotModule.onPayEnd = async({ payCoin, replayFlag }) => {
        /**************************
         * ボーナス終了後の処理
         * 払い出し後の演出や、ボーナス終了の処理を記述する。
         * 
         */

        await effectManeger.onPay(payCoin, slotStatus.betCoin);
        if (bonusData) {
            let isJacin = bonusData.isJacin;
            bonusData.onPay(payCoin);
            setGamemode(bonusData.getGameMode());
            changeBonusSeg();
            if (bonusData.isEnd) {
                slotModule.emit('bonusEnd')
            } else {
                // JACゲームからボーナスゲームに移行したとき
                if (isJacin && !bonusData.isJacin) {
                    sounder.stopSound('bgm');
                    sounder.playSound('true', true)
                }
            }
        }
    }
    slotModule.onBet = async() => {
        // ベットボタンを押したときの処理
        // フラッシュをリセットする
        flashController.clearFlashReservation();
    }
    slotModule.onBetCoin = async(betCoin) => {
        // ベットを行うときの処理
        // ベット枚数分音を鳴らしている

        changeBonusSeg();
        while (betCoin--) {
            sounder.playSound("bet")
            slotHandler.saveData.coin--;
            slotHandler.saveData.inCoin++;
            changeCredit(-1);
            await Sleep(70);
        }
        Segments.payseg.reset();
    }
    slotModule.onPay = async(e) => {
        // 払い出しの処理
        // 払い出しがあるかないか、そしてリプレイかどうかで処理を分けている

        let { payCoin, replayFlag, noSE } = e;
        let pays = payCoin;
        let loopPaySound = null;
        let payCount = 0;
        let seLoopFlag = true;
        if (pays > 1) {
            loopPaySound = 'pay'
            sounder.playSound(loopPaySound, seLoopFlag);
        }
        if (replayFlag) {
            await sounder.playSound('replay');
        }
        // SlotLog('payStart');
        while (pays--) {
            slotHandler.saveData.coin++;
            payCount++;
            slotHandler.saveData.outCoin++;
            slotHandler.saveData.coinLog[slotHandler.saveData.coinLog.length - 1]++;
            changeCredit(1);
            Segments.payseg.setSegments(payCount)
            await Sleep(90);
        }
        if (loopPaySound && seLoopFlag) {
            sounder.stopSound(loopPaySound);
            loopPaySound = null;
        }
        return { isReplay: replayFlag };
    }
    let jacFlag = false;
    let firstHit = false;
    slotModule.onLot = async() => {
        /**
         * 抽選処理
         * retに制御名を返す
         * Lotterクラスを使うと便利
         * lotdata.jsに各フラグの成立確率を記述しよう
         * フラグから制御への振り分けもココで行う。
         * サンプルだとスイカ1とスイカ2の振り分け
         * window.powerはデバッグの強制フラグ用
         */



        let ret = -1;
        let lotter = Lotdata[gameMode] && new Lotter(Lotdata[gameMode]);

        let lot = window.power || (lotter ? lotter.lot().name : null);
        window.power = null;


        switch (gameMode) {
            case "normal":
                switch (lot) {
                    case 'ベル':
                    case 'リプレイ':
                    case 'チェリー':
                        ret = lot;
                        break
                    case 'スイカ':
                        ret = ['スイカ1', 'スイカ2'][ArrayLot([75, 25])]
                        break
                    case 'BIG':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        bonusFlag = 'BIG1';
                        ret = ['BIG1', 'BIG2', 'BIG3'][ArrayLot([35, 55, 10])];
                        break
                    case 'REG':
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        bonusFlag = 'REG1';
                        ret = ['REG1', 'REG2'][ArrayLot([65, 35])];

                        break
                    default:
                        ret = 'はずれ';
                        if (bonusFlag) {
                            ret = bonusFlag;
                            break
                        }
                        break
                }
                break
            case 'BIG':
                switch (lot) {
                    case 'ベル':
                        ret = 'ボナ中小役'
                        break
                    case 'リプレイ':
                        ret = 'JACIN';
                        break
                    case 'チェリー':
                        ret = lot;
                        break
                    case 'スイカ':
                        ret = ['スイカ1', 'スイカ2'][ArrayLot([75, 25])]
                        break
                    default:
                        ret = 'はずれ';
                        break
                }
                break
            case 'REG':
            case 'JAC':
                ret = 'JACGAME';
                break

        }
        console.log({ lot, ret, RTdata: slotModule.RTdata, effectManeger })
        changeBonusSeg();
        await effectManeger.onLot(lot, ret, gameMode, bonusFlag);
        return Control.code.indexOf(ret);
    }
    slotModule.onReelStop = async() => {
        sounder.playSound("stop")
    }


    slotModule.on("reelStart", async() => {
        sounder.playSound("start")
        leverEffect = null;
        changeBonusSeg();
    })
    window.leverEffect = null;


    window.gameMode = 'normal';
    let bonusFlag = null
    let coin = 0;
    window.bonusData = null

    slotModule.on("leverOn", function() {
        // レバーオン時の処理
        // セーブデータの更新を行う
        slotHandler.saveData.nextGame(slotModule.slotStatus.betCoin);
        changeCredit(0)
    })

    function setGamemode(mode) {
        oldGameMode = gameMode;
        console.log(`${gameMode} -> ${mode}`);
        const { LOTMODE } = slotModule.reelController;
        switch (mode) {
            case 'normal':
                gameMode = 'normal';
                slotModule.reelController.mode = LOTMODE.NORMAL
                slotStatus.maxBet = 3;
                break
            case 'BIG':
                gameMode = 'BIG';
                slotModule.reelController.mode = LOTMODE.BIG
                slotStatus.maxBet = 3;
                break
            case 'REG':
                gameMode = 'REG';
                slotModule.reelController.mode = LOTMODE.JAC
                slotStatus.maxBet = 1;
                break
            case 'JAC':
                gameMode = 'JAC';
                slotModule.reelController.mode = LOTMODE.JAC
                slotStatus.maxBet = 1;
                break
        }
    }
    const Segments = {
        creditseg: segInit("#creditSegment", 2),
        payseg: segInit("#paySegment", 2),
        effectseg: segInit("#effectSegment", 3)
    }
    let credit = 50;
    Segments.creditseg.setSegments(50);
    Segments.creditseg.setOffColor(80, 30, 30);
    Segments.payseg.setOffColor(80, 30, 30);
    Segments.effectseg.setOffColor(5, 5, 5);
    Segments.creditseg.reset();
    Segments.payseg.reset();
    Segments.effectseg.reset();

    let lotgame;

    function changeCredit(delta) {
        credit += delta;
        if (credit < 0) {
            credit = 0;
        }
        if (credit > 50) {
            credit = 50;
        }
        console.log(slotHandler)
        $(".GameData").html(`
            差枚数:${slotHandler.saveData.coin}枚<br>
            ゲーム数:${slotHandler.saveData.playCount}G<br>
            総ゲーム数:${slotHandler.saveData.allPlayCount}G<br>
            機械割:${(''+slotHandler.saveData.percentage).slice(0,5)}%<br>
        `)
        Segments.creditseg.setSegments(credit)
    }


    let RandomSegIntervals = [false, false, false];

    const changeBonusSeg = () => {
        if (!bonusData || bonusData.isEnd) {
            Segments.effectseg.reset();
            return
        }
        Segments.effectseg.setSegments(bonusData.getBonusSeg());
    }


    function segInit(selector, size) {
        let cangvas = $(selector)[0];
        let sc = new SegmentControler(cangvas, size, 0, -3, 50, 30);
        sc.setOffColor(120, 120, 120)
        sc.setOnColor(230, 0, 0)
        sc.reset();
        return sc;
    }
}