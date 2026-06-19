chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == 'install'){
        chrome.storage.local.set({
            isnewtab: false,
            isdefaultfont: false,
            ischeckip: true,
            ishideblock: true,
            isblockmobile: false,
            isnickid: true,
            ispagination: true,
            isrefresh: false,
            refreshtime: "10"
        })
    } else if(details.reason == "update"){
        chrome.storage.local.get(['isblockmobile','ispagination'],(val) => {
            if(val.isblockmobile === undefined){
                chrome.storage.local.set({
                    isblockmobile: false
                });
            }
            if(val.ispagination === undefined) {
                chrome.storage.local.set({
                    ispagination: false
                });
            }
        });
    }
});
