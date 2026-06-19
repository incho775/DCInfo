// DCInfo — core: 설정·전역·공통 유틸

const ICON_TYPE = {icon_notic: false,
    icon_toprecomimg: true,
    icon_recomimg: true,
    icon_recomtxt: true,
    icon_pic: true,
    icon_txt: true,
    icon_movie: true,
    icon_recomovie: true,
    icon_survey: false,
    icon_issue: false,
    icon_ad: false,
    icon_voice_tit: true,
    icon_slow: true,
    icon_secret: true,
    icon_secret2: true,
    icon_vote_tit: true,
    icon_fnews: false,
    icon_autodel_tit: true,
    icon_rtimebest: true,
    icon_btimebest: true,
    icon_lrtimebest: true,
    icon_lbtimebest: true,
    icon_hit: true,
    icon_lottery: true,
    icon_ai: true,
    icon_recoai: true,
    icon_nft: true,
    icon_reconft: true
}
let INDEX, DIBESETTING, STATE, LIST, MEMOS;
let NIKICON_URL = {fix_nik: ["image/fix_nik-2x.gif",""],
    nik: ["image/nik-2x.gif",""],
    fix_managernik: ["image/fix_managernik-2x.gif",""],
    fix_sub_managernik: ["image/fix_sub_managernik-2x.gif",""],
    bestcon_fix: ["image/bestcon_fix-2x.png",""],
    bestcon: ["image/bestcon-2x.png",""]
};
let DCLOGO_URL = {gallery: ["image/tit_gallery-2x.png","","55","45"],
    mgallery: ["image/tit_mgallery-2x.png","","96","45"],
    ngallery: ["image/tit_ngallery-2x.png","","78","45"]
};
let ISHIDPI = undefined;

function binarySearch(arr, target){
    let max = arr.length -1;
    let min = 0;
    let mid;
    let elm;

    while (min <= max){
        mid = ((max + min) / 2) | 0;
        elm = arr[mid][0];

        if(target < elm){
            max = mid - 1;
        } else if (target > elm){
            min = mid + 1;
        } else{
            return mid;
        }
    }

    return -1;
}

function setState() {
    const urlpath = window.location.pathname;
    
    if (urlpath.indexOf('/list') != -1) {
        if (window.location.search.indexOf('&board_type=album') != -1) {
            return -3;
        } else{
            return 1;
        }
    } else if (urlpath.indexOf('/view') != -1) {
        return -2;
    } else if (urlpath.indexOf('/write') != -1) {
        return -4;
    } else {
        return -1;
    }
}

function setCurrentIndex(selector){
    selector = selector || LIST;

    const tablerow = selector.getElementsByClassName('ub-content');

    for(let row of tablerow){
        const icon = row.getAttribute('data-type');
        if (ICON_TYPE[icon]) {
            INDEX = row.rowIndex - 1;
            return;
        }
    }
}

function getToday() {
    const date = new Date();
    let year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate();

    if (("" + month).length == 1) {
        month = "0" + month;
    }
    if (("" + day).length == 1) {
        day = "0" + day;
    }

    return `${year}-${month}-${day}`;
}

function getData(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    return fetch(url, {
        signal: controller.signal,
        referrerPolicy: "strict-origin-when-cross-origin"
    }).then(response => {
        clearTimeout(timeoutId);
        if(!response.ok){
            throw new Error (response.statusText);
        }
        return response.text();
    }).then(data => {
        const parser = new DOMParser();
        let doc = parser.parseFromString(data, "text/html");
        return doc.getElementById('container');
    }).catch(err => {
        console.log("ajax err! : ", err);
        return 0;
    });
}

function getLocalFileURL(dict) {
    for (const key in dict){
        dict[key][1] = chrome.runtime.getURL(dict[key][0]);
    }
}

function dcPlaceFloating(el, x, y) {
    el.style.left = '0px';
    el.style.top = '0px';
    const r = el.getBoundingClientRect();
    let nx = x, ny = y;
    if (nx + r.width > window.innerWidth - 6) nx = window.innerWidth - r.width - 6;
    if (ny + r.height > window.innerHeight - 6) ny = window.innerHeight - r.height - 6;
    if (nx < 6) nx = 6;
    if (ny < 6) ny = 6;
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
}

function dcinfoToast(msg) {
    const t = document.createElement('div');
    t.className = 'dcinfo_toast';
    t.textContent = msg;
    document.body.appendChild(t);
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(function () {
        t.classList.remove('show');
        setTimeout(function () { t.remove(); }, 320);
    }, 1500);
}

