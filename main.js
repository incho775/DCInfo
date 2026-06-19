// DCInfo — 초기화·메시지·진입점

function initconsole() {
    const image = new Image();
    const url = chrome.runtime.getURL('image/dc_logo.gif')
      
    image.onload = function() {
        const style = [
            'font-size: 1px;',
            'padding: ' + this.height * .5 + 'px ' + this.width * .5 + 'px;',
            'background-size: ' + this.width + 'px ' + this.height + 'px;',
            'background: url('+ url +');'
            ].join(' ');
        console.log('%c ', style);
        console.log("%cDCInfo                              \n%c디시인사이드 작성자 IP·ID 정보 표시\nv1.0.0",
        "background-color: #505aa0; color: white; font-family: Arial; line-height: 90%; font-size:100px;","");
    };
    image.src = url;
}

function initDcinfo() {
    LIST = document.getElementsByClassName('gall_list')[0];
    MEMOS = SETTING.dcinfo_memos || {};

    if(window.devicePixelRatio >= 2){
        ISHIDPI = true

        getLocalFileURL(NIKICON_URL);
        getLocalFileURL(DCLOGO_URL);
        
        const dc_logo = $(".dc_logo .logo_img")[0];
        const gall_logo = $(".dc_logo .logo_img2")[0];
        
        if (dc_logo.src.indexOf("/dcin_logo.png") != -1){
            dc_logo.src = chrome.runtime.getURL('image/dcin_logo-2x.png');
            dc_logo.width = "211";
            dc_logo.height = "45";
        }

        for (const key in DCLOGO_URL){
            if (gall_logo.src.indexOf("tit_"+ key) != -1){
                gall_logo.src = DCLOGO_URL[key][1];
                gall_logo.width = DCLOGO_URL[key][2];
                gall_logo.height = DCLOGO_URL[key][3];
                break;
            }
        }
    }

    setMobileReg();
    checkNewTab(LIST);
    checkWriter(LIST);
    checkdate(LIST);

    initDcinfoContextMenu();

    //initDcinfo가 DOMContentLoaded 이후 실행될 수 있으므로(MutationObserver 콜백) 상태 확인 후 처리
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setPagination);
    } else {
        setPagination();
    }

    if (STATE === 1) {
        setCurrentIndex();
        setAutoRefresh();
    } else if (STATE === -2 || STATE === -3){
        checkReply();
        checkWriter(document.getElementsByClassName('gallview_head')[0]);
    }
}

function observeDcLoaded(){
    const target = STATE === 1 ? 'floating_box' : 'list_bottom_btnbox';
    const glist_obsrv = new MutationObserver((mutations, observer) => {
        for(let mutation of mutations){ 
            if(mutation.addedNodes.length === 0 || mutation.removedNodes.length > 0){
                continue;
            }
            if(mutation.target.className == target){
                observer.disconnect();
                initDcinfo();
                return;
            }
        };
    });

    glist_obsrv.observe(document, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
}

function checkDcPath() {
    STATE = setState();
    if(STATE === 1 || STATE === -2 || STATE === -3){
        observeDcLoaded();
        initconsole();
    } else if(STATE === -4){
        initconsole();
    }
}

/* ============================================================
   팝업 ↔ 콘텐츠 스크립트: 차단 목록 조회/해제
   (차단값은 dcinside 도메인 localStorage에 있으므로 콘텐츠 스크립트가 중계)
   ============================================================ */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || !msg.type) return;

    if (msg.type === 'dcinfo_getBlockList') {
        sendResponse({
            block_all: localStorage.getItem('block_all'),
            block_parts: localStorage.getItem('block_parts')
        });
        return;
    }

    if (msg.type === 'dcinfo_removeBlock') {
        try {
            if (msg.scope === 'all') {
                const ba = localStorage.getItem('block_all');
                if (ba) {
                    const d = JSON.parse(ba);
                    d[msg.field] = dcRemoveBlockValueFromField(d[msg.field], msg.value);
                    localStorage.setItem('block_all', JSON.stringify(d));
                }
            } else {
                const bp = localStorage.getItem('block_parts');
                if (bp) {
                    const dp = JSON.parse(bp);
                    if (dp[msg.scope]) {
                        dp[msg.scope][msg.field] = dcRemoveBlockValueFromField(dp[msg.scope][msg.field], msg.value);
                        localStorage.setItem('block_parts', JSON.stringify(dp));
                    }
                }
            }
            dcReapplyBlocks();
            sendResponse({
                ok: true,
                block_all: localStorage.getItem('block_all'),
                block_parts: localStorage.getItem('block_parts')
            });
        } catch (e) {
            sendResponse({ ok: false, error: String(e) });
        }
        return;
    }
});

chrome.storage.local.get(null, (key) => {
    SETTING = key;
    checkDcPath();
});