import Browser from 'webextension-polyfill'

var enable_script =
    '(function(){var enable_script = document.createElement("script");\
    enable_script.onload = function () {enable_script.remove()};\
    enable_script.src = "'+chrome.runtime.getURL('content-scripts/enable.js')+'";\
    document.body.appendChild(enable_script)})()'

Browser.contextMenus.create({
    "title": "Get xPath", "contexts": ["all"], "onclick": (_info: any, tab: Browser.Tabs.Tab) => {
        if (tab.id)
            Browser.tabs.sendMessage(tab.id, {
                command: "getXPath",
                tabId: tab.id
            });
    }
});

Browser.runtime.onMessage.addListener(async (message, sender, _sendResponse) => {
    let tabId = null;
    if(sender.tab?.id){
        tabId = sender.tab?.id;
    }else{
        const [tab] = await Browser.tabs.query({ active: true, lastFocusedWindow: true });
        tabId = tab?.id;
    }

    if (tabId) {
        if (message.type === "open_console") {
            Browser.tabs.sendMessage(tabId, { command: message.type });
        }else if (message.type === "unbind_click") {
            // Browser.tabs.sendMessage(tab.id, {command: message.type});
            Browser.tabs.executeScript(tabId, {
                code: enable_script,
                allFrames: true
            });
        }
    }
})