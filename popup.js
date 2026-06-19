const optlist = ['newtab', 'defaultfont', 'checkip', 'hideblock', 'blockmobile', 'nickid', 'pagination', 'refresh', 'refreshtime'];

let statusTimer;

function showSaved() {
    const status = document.getElementById('status');
    status.textContent = '✓ 저장됨';
    status.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
        status.classList.remove('show');
    }, 1100);
}

function saveOptions() {
    const setting = {};

    for (let i = 0; i < optlist.length; i++) {
        if (optlist[i] === 'refreshtime') {
            //refreshtime은 select 값이므로 checked를 읽지 않는다
            setting['refreshtime'] = document.getElementById('refreshtime').value;
            continue;
        }
        setting['is' + optlist[i]] = document.getElementById(optlist[i]).checked;
    }
    //차단 게시물 숨기기는 항상 강제 활성
    setting['ishideblock'] = true;

    chrome.storage.local.set(setting, showSaved);
}

function loadOptions() {
    chrome.storage.local.get(null, function (items) {
        for (let i = 0; i < optlist.length; i++) {
            if (optlist[i] === 'refreshtime') {
                if (items['isrefresh'] === true) {
                    document.getElementById('refresh').checked = true;
                    document.getElementById('refreshtime').style.display = 'inline-block';
                    document.getElementById('refreshtime').value = items['refreshtime'];
                } else {
                    document.getElementById('refresh').checked = false;
                    document.getElementById('refreshtime').style.display = 'none';
                }
            } else if (optlist[i] === 'hideblock') {
                document.getElementById('hideblock').checked = true;
            } else if ('is' + optlist[i] in items) {
                document.getElementById(optlist[i]).checked = items['is' + optlist[i]];
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadOptions();

    //자동 갱신 토글: refreshtime 표시 전환
    document.getElementById('refresh').addEventListener("change", function () {
        document.getElementById('refreshtime').style.display = this.checked ? 'inline-block' : 'none';
    });

    //저장 버튼 제거 → 변경 즉시 자동 저장
    for (let i = 0; i < optlist.length; i++) {
        const el = document.getElementById(optlist[i]);
        if (el) {
            el.addEventListener("change", saveOptions);
        }
    }

    //차단 목록 보기
    document.getElementById('blocklist_btn').addEventListener('click', blOpen);
    document.getElementById('bl_back').addEventListener('click', function () {
        document.getElementById('blocklist_overlay').hidden = true;
    });
});

/* ===== 차단 목록 ===== */
function blSafeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
}

function blOpen() {
    const overlay = document.getElementById('blocklist_overlay');
    const body = document.getElementById('bl_body');
    overlay.hidden = false;
    body.innerHTML = '<div class="bl-empty">불러오는 중…</div>';

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs && tabs[0];
        if (!tab) { body.innerHTML = '<div class="bl-empty">탭을 찾을 수 없습니다.</div>'; return; }
        chrome.tabs.sendMessage(tab.id, { type: 'dcinfo_getBlockList' }, function (resp) {
            if (chrome.runtime.lastError || !resp) {
                body.innerHTML = '<div class="bl-empty">디시인사이드 페이지에서 열어주세요.</div>';
                return;
            }
            blRender(tab.id, resp);
        });
    });
}

function blRender(tabId, resp) {
    const body = document.getElementById('bl_body');
    const ba = resp.block_all ? blSafeParse(resp.block_all) : null;
    const bp = resp.block_parts ? blSafeParse(resp.block_parts) : null;
    body.innerHTML = '';
    let any = false;

    if (ba) {
        const sec = blBuildSection(tabId, '전체 갤러리', 'all', ba);
        if (sec) { body.appendChild(sec); any = true; }
    }
    if (bp) {
        Object.keys(bp).forEach(function (gid) {
            const conf = bp[gid] || {};
            const sec = blBuildSection(tabId, conf.name ? conf.name : gid, gid, conf);
            if (sec) { body.appendChild(sec); any = true; }
        });
    }
    if (!any) body.innerHTML = '<div class="bl-empty">차단된 항목이 없습니다.</div>';
}

function blBuildSection(tabId, title, scope, conf) {
    const labelMap = { nick: '닉', id: 'ID', ip: 'IP', word: '단어' };
    const items = [];
    let mobile = false;

    ['nick', 'id', 'ip', 'word'].forEach(function (f) {
        let raw = conf[f] || '';
        if (f === 'ip') {
            const idx = raw.indexOf('mblck');
            if (idx !== -1) { mobile = true; raw = raw.slice(0, idx).replace(/\|\|$/, ''); }
        }
        raw.split('||').filter(Boolean).forEach(function (v) {
            items.push({ field: f, value: v });
        });
    });
    if (items.length === 0 && !mobile) return null;

    const body = document.getElementById('bl_body');
    const sec = document.createElement('div');
    sec.className = 'bl-section';

    const h = document.createElement('div');
    h.className = 'bl-section-title';
    h.textContent = title;
    sec.appendChild(h);

    if (mobile) {
        const m = document.createElement('div');
        m.className = 'bl-mobile';
        m.textContent = '· 통신사 IP 일괄 차단 (자동)';
        sec.appendChild(m);
    }

    items.forEach(function (it) {
        const row = document.createElement('div');
        row.className = 'bl-item';

        const tag = document.createElement('span');
        tag.className = 'bl-type';
        tag.textContent = labelMap[it.field];

        const val = document.createElement('span');
        val.className = 'bl-value';
        val.textContent = it.value;
        val.title = it.value;

        const btn = document.createElement('button');
        btn.className = 'bl-remove';
        btn.textContent = '해제';
        btn.addEventListener('click', function () {
            btn.disabled = true;
            chrome.tabs.sendMessage(tabId, { type: 'dcinfo_removeBlock', scope: scope, field: it.field, value: it.value }, function (r) {
                if (chrome.runtime.lastError || !r || !r.ok) { btn.disabled = false; return; }
                row.remove();
                if (!sec.querySelector('.bl-item')) sec.remove();
                if (!body.querySelector('.bl-section')) body.innerHTML = '<div class="bl-empty">차단된 항목이 없습니다.</div>';
            });
        });

        row.appendChild(tag);
        row.appendChild(val);
        row.appendChild(btn);
        sec.appendChild(row);
    });

    return sec;
}
