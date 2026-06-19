// DCInfo — 네이티브 닉네임 팝업 통합

function dcInjectIntoNativePopup(popup) {
    const ul = popup.querySelector('ul.user_data_list');
    if (!ul || ul.querySelector('.dcinfo_native_item')) return;
    const writerEl = popup.closest('.ub-writer') || popup.closest('.gall_writer');
    const info = getWriterInfo(writerEl);
    if (!info) return;

    const hasMemo = !!MEMOS[info.key];
    const li = document.createElement('li');
    li.className = 'bg_grey dcinfo_native_item';
    const a = document.createElement('a');
    a.href = 'javascript:;';
    a.textContent = hasMemo ? 'DCInfo 메모 편집' : 'DCInfo 메모 추가';
    const aEm = document.createElement('em');
    aEm.className = 'sp_img icon_go';
    a.appendChild(aEm);
    a.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        //편집기를 실제 클릭(마우스) 위치에 띄운다. 키보드 활성화 시엔 항목 좌상단으로 폴백
        if (e.clientX || e.clientY) {
            dcLastMenuX = e.clientX;
            dcLastMenuY = e.clientY;
        } else {
            const r = li.getBoundingClientRect();
            dcLastMenuX = r.left;
            dcLastMenuY = r.top;
        }
        const open = document.querySelector('.user_data.add');
        if (open) open.remove();
        dcOpenMemoEditor(info);
    });
    li.appendChild(a);
    ul.appendChild(li);
}

function dcWatchNativePopup() {
    const obs = new MutationObserver(function (muts) {
        for (let i = 0; i < muts.length; i++) {
            const added = muts[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
                const node = added[j];
                if (node.nodeType !== 1) continue;
                let popup = null;
                if (node.classList && node.classList.contains('user_data') && node.classList.contains('add')) {
                    popup = node;
                } else if (node.querySelector) {
                    popup = node.querySelector('.user_data.add');
                }
                if (popup) dcInjectIntoNativePopup(popup);
            }
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });
}

function initDcinfoContextMenu() {
    if (dcinfoCtxInited) return;
    dcinfoCtxInited = true;
    document.addEventListener('mouseover', dcOnMemoHover, true);
    document.addEventListener('mouseout', dcOnMemoLeave, true);
    document.addEventListener('click', dcOnBadgeClick, true);
    dcWatchNativePopup();
}

