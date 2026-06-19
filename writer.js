// DCInfo — 작성자 표시 (닉ID·날짜·새탭·메모배지)

function checkdate(selector) {
    selector = selector || LIST;

    const today = getToday();
    const dates = selector.getElementsByClassName("gall_date");

    for(let date of dates){
        const datetime = date.title;

        if (datetime.split(" ")[0] == today) {
            date.textContent = datetime.split(" ")[1];
        }
    }

}

function checkWriter(selector) {
    selector = selector || document;

    applyMemos(selector);

    if(DIBESETTING.ischeckip){
        const ips = selector.getElementsByClassName("ip");

        for(let ip of ips){
            getIpInfo(ip);
        }
    }

    if(DIBESETTING.isnickid){
        const usertags = selector.querySelectorAll('.writer_nikcon img');

        for (let usertag of usertags){
            if (usertag.src.indexOf('/nik.gif') != -1) {
                const id = usertag.getAttribute('onclick').split('.com/')[1].split("');")[0];
                const idtext = id.length > 10 ? id.substr(0, 10) + "..." : id;
                const tag = document.createElement('span');

                tag.className = "nick_id";
                tag.title = id;
                tag.textContent = ' [' + idtext + ']';

                usertag.parentNode.parentNode.insertBefore(tag,usertag.parentNode.nextSibling);
            }

            //apply hidpi nick icon
            if (ISHIDPI) {
                for (let key in NIKICON_URL){
                    if (usertag.src.indexOf('/' + key) != -1){
                        usertag.src = NIKICON_URL[key][1];
                        break;
                    }
                }
            }
        }
    }
}

function checkNewTab(selector) {
    selector = selector || LIST;

    if(DIBESETTING.isnewtab && STATE === 1){
        let urls = selector.getElementsByClassName('icon_img');
        for(let url of urls){
            url.parentNode.setAttribute('target', '_blank');
        }
    }
}

function getWriterInfo(writerEl) {
    if (!writerEl) return null;
    const nick = writerEl.getAttribute('data-nick') || '';
    const uid = writerEl.getAttribute('data-uid') || '';
    const ip = writerEl.getAttribute('data-ip') || '';
    if (!nick && !uid && !ip) return null;
    let key;
    if (uid) key = 'uid:' + uid;
    else if (ip) key = 'ip:' + ip;
    else key = 'nick:' + nick;
    return { nick: nick, uid: uid, ip: ip, key: key, label: nick || uid || ip };
}

function applyMemos(selector) {
    selector = selector || document;
    if (!selector.querySelectorAll) return;
    const writers = selector.querySelectorAll('.ub-writer');
    for (let i = 0; i < writers.length; i++) {
        const w = writers[i];
        const info = getWriterInfo(w);
        const memo = info ? MEMOS[info.key] : null;
        //닉네임 텍스트 오른쪽에 인라인으로 배지를 붙인다(셀 레이아웃과 무관하게)
        const host = w.querySelector('.nickname') || w;
        let badge = w.querySelector('.dcinfo_memo_badge');
        if (memo) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'dcinfo_memo_badge';
                badge.textContent = '✎';
                host.appendChild(badge);
            }
            badge.setAttribute('data-memo', memo);
        } else if (badge) {
            badge.remove();
        }
    }
}

