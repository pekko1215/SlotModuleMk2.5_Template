// 便利な関数たち

const Sleep = async(t) => {
    return new Promise(r => {
        setTimeout(r, t);
    })
}

const ArrayLot = list => {
    let sum = list.reduce((a, b) => a + b);
    let r = Rand(sum);
    return list.findIndex(n => {
        return (r -= n) < 0;
    })
}

const ContinueLot = (r) => {
    let p = 0;
    while (Math.random() < r) p++;
    return p;
}

const Rand = (m, n = 0) => {
    return Math.floor(Math.random() * m) + n;
}


const FlipMatrix = (base) => {
    let out = JSON.parse(JSON.stringify(base));
    return out.map(function(m) {
        return m.map(function(p) {
            return 1 - p;
        })
    })
}