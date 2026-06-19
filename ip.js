// DCInfo — IP 정보 (통신사/외국 판별·표시)

function findTorIp(ip) {
    let max = TOR.length -1;
    let min = 0;
    let mid;
    let elm;

    while (min <= max){
        mid = ((max + min) / 2) | 0;
        elm = TOR[mid];

        if(ip < elm){
            max = mid - 1;
        } else if (ip > elm){
            min = mid + 1;
        } else{
            return mid;
        }
    }

    return false;
}

function findProxy(ip) {
    let info = null;
    for (let n = PROXY.length; n--;)
        if (ip === PROXY[n][0]) {
            info = PROXY[n][1];
            break
        } return info
}

function findIpinArray(ip, array) {
    let ip_front = ip.split('.')[0];
    let ip_back = ip.split('.')[1];
    let f_index = binarySearch(array, ip_front);
    let b_index;

    if(f_index !==  -1){
        b_index = binarySearch(array[f_index][1], ip_back);

        if(b_index !== -1){
            return [array[f_index][1][b_index][1], array[f_index][1][b_index][2]];
        } else {
            return false;
        }

    } else {
        return false;
    }
}

/**   현재 브라우저 경로가 게시물 리스트일시 : 1 반환/
    게시물 뷰 : -2 반환/
    앨범 뷰 : -3 반환/
    게시글 작성 : -4 반환/
    그 외 주소 : -1 반환 */
function getIpInfo(selector) {
    let isp_arr = [];
    const ip = selector.textContent.slice(1,-1);
    const result = findIpinArray(ip, TELECOM);

    if (result) {
        isp_arr.push(result[0]);
    } else {
        isp_arr.push('외국');
        findTorIp(ip) && isp_arr.push("토르");

        const proxyname = findProxy(ip);
        proxyname && isp_arr.push(proxyname);
    }

    const tooltip = isp_arr.join("/");
    const iptext = tooltip.length > 7 ? tooltip.substr(0, 7) + "…" : tooltip;
    //색상 분류: SK 빨강 / KT 초록 / LG 파랑 / 그 외 국내 노랑 / 외국 보라
    let cls = 'ip_foreign';
    if (result) {
        const ispname = result[0] || '';
        if (ispname.indexOf('SK') === 0) cls = 'ip_sk';
        else if (ispname.indexOf('KT') === 0) cls = 'ip_kt';
        else if (ispname.indexOf('LG') === 0) cls = 'ip_lg';
        else cls = 'ip_etc';
    }
    const tag = document.createElement('span');
    tag.className = 'ip_info ' + cls;
    tag.title = tooltip;
    tag.textContent = ' [' + iptext + ']';

    selector.parentNode.insertBefore(tag,selector.nextSibling);
}

