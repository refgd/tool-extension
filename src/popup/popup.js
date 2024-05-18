document.addEventListener("DOMContentLoaded", function () {
    var consoleBtn = document.getElementById('open_console');
    if(consoleBtn) consoleBtn.addEventListener('click', function (){
        chrome.runtime.sendMessage({type: "open_console"});
    });

    var unbindBtn = document.getElementById('unbind_click');
    if(unbindBtn) unbindBtn.addEventListener('click', function (){
        chrome.runtime.sendMessage({type: "unbind_click"});
    });
});