class SlotHandler {
    constructor(slotModule, saveData) {
        this.slotModule = slotModule;
        this.saveData = saveData;
    }
}

const Main = async() => {

    const slotModule = await ControlRerquest("data/control.smr");
    const saveData = new SaveData({});


    let slotHandler = new SlotHandler(slotModule, saveData);
    console.log(slotHandler)

    SystemDefine(slotHandler);
    EffectDefine(slotHandler);
    UIDefine(slotHandler);
}

const SL = [];

const SlotLog = (text) => {
    SL.unshift(text);

    $('#slotLogs').html(SL.join('<br>'))
}

Main();