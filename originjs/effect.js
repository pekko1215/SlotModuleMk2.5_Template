const MapMatrix = (matrix, fn) => {
    return matrix.map(arr => arr.map(fn));
}


const EffectDefine = (slotHandler) => {
    let { slotModule, saveData } = slotHandler;


    class EffectManager {
        constructor() {}
        async onLot(lot, control, gameMode, bonusFlag) {

        }
        async payEffect(payCoin, betCoin) {

        }
        async onPay(payCoin, betCoin) {
            await this.payEffect(payCoin, betCoin);
        }
    }

    class NormalEffect extends EffectManager {
        constructor() {
            super();
            this.isAT = false;
        }
        async onLot(lot, control, gameMode, bonusFlag) {
            SyotoEffect(control, bonusFlag);
        }
    }

    const SyotoEffect = (control, bonusFlag) => {
        let SyotoTable = {
            // 消灯確率 各数値/合計
            // 消灯なし,1,2,3消灯
            はずれ: [99, 0, 0, 1],
            リプレイ: [90, 10, 0, 0],
            ベル: [80, 20, 0, 0],
            スイカ1: [0, 0, 90, 10],
            スイカ2: [0, 0, 60, 30],
            チェリー: [20, 80, 0, 0],
            BIG: [25, 15, 25, 35],
            REG: [20, 10, 25, 45],
        }

        switch (bonusFlag) {
            case 'BIG1':
                control = 'BIG';
                break
            case 'REG1':
                control = 'REG';
        }

        let list = SyotoTable[control];
        if (!list) return;
        let syotoCount = ArrayLot(list);

        const YokokuTable = [2, 10, 75, 90];

        let isYokoku = YokokuTable[syotoCount] * 0.01 > Math.random()
        const SyotoFlashs = [
            [
                [2, 0, 0],
                [2, 0, 0],
                [2, 0, 0]
            ],
            [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 0]
            ],
            [
                [0, 0, 2],
                [0, 0, 2],
                [0, 0, 2]
            ]
        ];
        let flashMatrix = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]


        if (isYokoku) sounder.playSound('yokoku');


        slotModule.once('reelStop', ({ count, idx }) => {
            if (syotoCount === 0) return;
            syotoCount--;
            sounder.playSound('syoto')
            flashMatrix = flashMatrix.map((arr, y) => {
                return arr.map((b, x) => {
                    return b || SyotoFlashs[idx][y][x];
                })
            })

            slotModule.flashController.setFlash({
                front: Array(3).fill(Array(3).fill(ColorData.DEFAULT_F)),
                back: flashMatrix.map(arr => {
                    return arr.map(p => {
                        return [ColorData.DEFAULT_F, ColorData.DEFAULT_F, ColorData.SYOTO_F][p]
                    })
                })
            })

            return true;
        })
    }


    slotHandler.effectManeger = null
    effectManeger = new NormalEffect();
}