class RT {
    constructor() {
        this.rt = null;
    }
    countGame() {
        if (this.rt === null) return;
        this.rt--;
        if (this.rt === 0) return new DefaultRTClass;
    }
    hitCheck(hit) {
        return null;
    }
    onHit(hit) {
        return this.hitCheck(hit) || this.countGame() || this;
    }
    onLot() {
        return null;
    }
}

class DefaultRT extends RT {
    constructor() {
        super();
        console.log(this.constructor.name + 'へ以降');
        this.rt = null;
        $('.rt-lamp').css({ background: 'black' })
    }
    hitCheck(hit) {
        switch (hit) {}
    }
    onLot(lot) {}
}



const DefaultRTClass = DefaultRT;