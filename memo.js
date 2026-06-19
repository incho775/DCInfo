// DCInfo — 메모 편집기·툴팁·배지 핸들러

/* ============================================================
   DCInfo 메모 + 네이티브 닉네임 팝업 통합
   ============================================================ */
let dcinfoEditorEl = null;
let dcinfoTipEl = null;
let dcLastMenuX = 0, dcLastMenuY = 0;
let dcinfoCtxInited = false;

function dcCloseEditor() {
    if (dcinfoEditorEl) { dcinfoEditorEl.remove(); dcinfoEditorEl = null; }
    document.removeEventListener('mousedown', dcOnEditorDown, true);
    document.removeEventListener('keydown', dcOnEditorKey, true);
}

function dcOnEditorDown(e) {
    if (dcinfoEditorEl && !e.target.closest('.dcinfo_memo_editor')) dcCloseEditor();
}

function dcOnEditorKey(e) {
    if (e.key === 'Escape') dcCloseEditor();
}

function dcOpenMemoEditor(info) {
    dcCloseEditor();
    const existing = MEMOS[info.key] || '';
    const panel = document.createElement('div');
    panel.className = 'dcinfo_memo_editor';

    const hd = document.createElement('div');
    hd.className = 'hd';
    hd.appendChild(document.createTextNode('📝 메모 '));
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = info.label;
    hd.appendChild(who);

    const ta = document.createElement('textarea');
    ta.className = 'dcinfo_memo_input';
    ta.rows = 3;
    ta.maxLength = 300;
    ta.placeholder = '이 작성자에 대한 메모…';
    ta.value = existing;

    const btns = document.createElement('div');
    btns.className = 'btns';
    if (existing) {
        const delBtn = document.createElement('button');
        delBtn.className = 'del';
        delBtn.textContent = '삭제';
        btns.appendChild(delBtn);
    }
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel';
    cancelBtn.textContent = '취소';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save';
    saveBtn.textContent = '저장';
    btns.appendChild(cancelBtn);
    btns.appendChild(saveBtn);

    panel.appendChild(hd);
    panel.appendChild(ta);
    panel.appendChild(btns);

    panel.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.body.appendChild(panel);
    dcinfoEditorEl = panel;
    dcPlaceFloating(panel, dcLastMenuX, dcLastMenuY);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);

    panel.querySelector('.save').addEventListener('click', function () {
        dcSaveMemo(info.key, ta.value.trim());
        dcCloseEditor();
    });
    panel.querySelector('.cancel').addEventListener('click', dcCloseEditor);
    const del = panel.querySelector('.del');
    if (del) del.addEventListener('click', function () { dcDeleteMemo(info.key); dcCloseEditor(); });
    ta.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            dcSaveMemo(info.key, ta.value.trim());
            dcCloseEditor();
        }
    });

    document.addEventListener('mousedown', dcOnEditorDown, true);
    document.addEventListener('keydown', dcOnEditorKey, true);
}

function dcSaveMemo(key, text) {
    if (!text) { dcDeleteMemo(key); return; }
    MEMOS[key] = text;
    chrome.storage.local.set({ dcinfo_memos: MEMOS });
    applyMemos(document);
    dcinfoToast('메모가 저장되었습니다');
}

function dcDeleteMemo(key) {
    if (MEMOS[key] === undefined) return;
    delete MEMOS[key];
    chrome.storage.local.set({ dcinfo_memos: MEMOS });
    applyMemos(document);
    dcinfoToast('메모가 삭제되었습니다');
}

function dcShowTip(badge) {
    dcHideTip();
    const memo = badge.getAttribute('data-memo');
    if (!memo) return;
    const tip = document.createElement('div');
    tip.className = 'dcinfo_memo_tip';
    tip.textContent = memo;
    document.body.appendChild(tip);
    dcinfoTipEl = tip;
    const br = badge.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    let x = br.left;
    let y = br.bottom + 6;
    if (x + tr.width > window.innerWidth - 6) x = window.innerWidth - tr.width - 6;
    if (y + tr.height > window.innerHeight - 6) y = br.top - tr.height - 6;
    if (x < 6) x = 6;
    if (y < 6) y = 6;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
}

function dcHideTip() {
    if (dcinfoTipEl) { dcinfoTipEl.remove(); dcinfoTipEl = null; }
}

function dcOnMemoHover(e) {
    const badge = e.target.closest ? e.target.closest('.dcinfo_memo_badge') : null;
    if (badge) dcShowTip(badge);
}

function dcOnMemoLeave(e) {
    const badge = e.target.closest ? e.target.closest('.dcinfo_memo_badge') : null;
    if (badge) dcHideTip();
}

//배지 클릭이 닉네임 정보창 등 페이지 기본 동작을 트리거하지 않도록 차단
function dcOnBadgeClick(e) {
    if (e.target.closest && e.target.closest('.dcinfo_memo_badge')) {
        e.stopPropagation();
        e.preventDefault();
    }
}

//네이티브 닉네임 팝업(.user_data.add)에 DCInfo 메모 항목을 네이티브 스타일로 끼워넣기
