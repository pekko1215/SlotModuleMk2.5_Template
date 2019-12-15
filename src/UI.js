const UIDefine = (slotHandler) => {
    const { saveData, slotModule } = slotHandler;

    const Save = () => {
        saveData.save();
    }

    const Load = () => {
        saveData.load();
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


    let lastTouch = 0;
    document.addEventListener('touchend', event => {
        const now = window.performance.now();
        if (now - lastTouch <= 500) {
            event.preventDefault();
        }
        lastTouch = now;
    }, true);
    Load();
}