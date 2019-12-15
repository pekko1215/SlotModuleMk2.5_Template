const UIDefine = (slotHandler) => {
    const { slotModule, saveData } = slotHandler;

    const Save = () => {
        saveData.save();
    }

    const Load = () => {
        slotHandler.saveData = SaveData.load();
    }

    const ClearData = () => {
        saveData.clear();
    }


    $("#cleardata").click(function() {
        if (confirm("データをリセットします。よろしいですか？")) {
            ClearData();
        }
    })
    $("#loadimg").click(function() {
        $("#dummyfiler").click();
    })

    $('#panel').on('click', () => {
        slotModule.pushEvent.almighty()
    })

    $('body').on('touchstart', () => {
        slotModule.pushEvent.almighty()
    })

    $(window).bind("unload", function() {
        Save();
    });
    Load();
}