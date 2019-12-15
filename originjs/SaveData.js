class SaveData {
    constructor({ coin, inCoin, outCoin, playCount, allPlayCount, bonusLog, coinLog, infomations }) {
        this.coin = coin || 0;
        this.playCount = playCount || 0;
        this.allPlayCount = allPlayCount || 0;
        this.bonusLog = bonusLog || [];
        this.currentBonus = null;
        this.inCoin = inCoin || 0;
        this.outCoin = outCoin || 0;
        this.coinLog = coinLog || []
        this.infomations = infomations || { saisyuLog: [] };
        this.infomations.saisyuLog = this.infomations.saisyuLog || [];
    }
    drawInfomation() {}
    bonusStart(name) {
        if (this.currentBonus) this.bonusEnd();
        this.currentBonus = {
            name,
            hitPlayCount: this.playCount,
            hitAllPlayCount: this.allPlayCount,
            startCoin: this.coin,
            playCount: 0
        }
        SlotLog(`${name} 開始 ${this.playCount}G(総ゲーム数 ${this.allPlayCount}G)`)
        let e = $('#dataCounter');
        let tower = $('<div class="tower"></div>');
        for (let i = 0; i < this.playCount / 100; i++) {
            let f = $('<div class="floor"></div>');
            if (name == 'BIG') {
                f.addClass('red');
            } else {
                f.addClass('green');
            }
            tower.append(f);
        }
        tower.append(`<div class="type">${name}</div>`);
        tower.append(`<div class="count">${this.playCount}<div>`);
        e.append(tower);
    }
    bonusEnd() {
        if (!this.currentBonus) return;
        this.currentBonus.coin = this.coin - this.currentBonus.startCoin;
        this.bonusLog.push(this.currentBonus);
        delete this.currentBonus.startCoin;

        SlotLog(`獲得枚数 ${this.currentBonus.coin}枚 ${this.currentBonus.playCount}G`);

        this.playCount = 0;

        this.currentBonus = null;
    }
    nextGame(betCoin) {
        // this.refreshGraph();
        if (this.currentBonus) {
            this.currentBonus.playCount++;
        } else {
            this.playCount++;
        }
        this.allPlayCount++;
        this.coinLog.push(-betCoin);
    }
    static load() {
        return new SaveData(JSON.parse(localStorage.getItem("savedata") || "{}"))
    }
    save() {
        localStorage.setItem('savedata', JSON.stringify(this));
    }
    clear() {
        this.coin = 0;
        this.playCount = 0;
        this.allPlayCount = 0;
        this.bonusLog = [];
        this.currentBonus = null;
        this.inCoin = 0;
        this.outCoin = 0;
        this.coinLog = [];
        this.infomations = { saisyuLog: [] };
    }
    refreshGraph() {
        let c = 0;
        console.log({
            data: {
                columns: [
                    ['差枚数', ...this.coinLog.map(d => {
                        c += d;
                        return c;
                    })]
                ]
            }
        })
        this.chart.load({
            columns: [
                ['差枚数', ...this.coinLog.map(d => {
                    c += d;
                    return c;
                })]
            ]
        })
    }
    get percentage() {
        return this.outCoin / this.inCoin * 100;
    }
}