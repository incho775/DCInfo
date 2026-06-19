let fontcss = document.createElement('style');
let spimgurl = chrome.runtime.getURL('image/sp_img.png');
let spminurl = chrome.runtime.getURL('image/sp_minor_txt.png')
let spnumurl = chrome.runtime.getURL('image/sp_num.png')
let hidpi_css = undefined;

if(window.devicePixelRatio >= 2){
    let iconimgurl_2x = chrome.runtime.getURL('image/icon_img-2x.png');
    let spminurl_2x = chrome.runtime.getURL('image/sp_minor_txt-2x.png');
    let spimgurl_2x = chrome.runtime.getURL('image/sp_img-2x.png');
    let spnumurl_2x = chrome.runtime.getURL('image/sp_num-2x.png');
    let spsnsurl_2x = chrome.runtime.getURL('image/sp_sns-2x.png');
    let iconminiurl_2x = chrome.runtime.getURL('image/icon_mini-2x.png');
    let sploginouturl_2x = chrome.runtime.getURL('image/sp_loginout-2x.png');
    let spnftimgurl_2x = chrome.runtime.getURL('image/sp_nftimage-2x.png');

    hidpi_css = document.createElement('style');
    hidpi_css.type = "text/css";
    hidpi_css.textContent = ".icon_img {background-image: url(" + iconimgurl_2x + ") !important; background-size: 30px 910px !important;}\
    .ranking_tit {background-image: url(" + spminurl_2x + ") !important; background-size: 300px 300px !important;}\
    .sp_img {background-image: url(" + spimgurl_2x + ") !important; background-size: 300px 1300px !important;}\
    .txt_img {background: url(" + spminurl_2x + ") 0 -188px no-repeat !important; background-size: 300px 300px !important;}\
    .num_img {background-image: url(" + spnumurl_2x + ") !important; background-size: 20px 338px !important;}\
    .outsied_img {background-image: url(" + spminurl_2x + ") !important; background-size: 300px 300px !important;}\
    .btn_write.txt::before {background:url(" + spimgurl_2x + ") no-repeat -133px -1023px !important; background-size: 300px 1300px !important;}\
    .sp_loginout {background-image:url(" + sploginouturl_2x + ") !important; background-size: 50px 115px !important;}\
    .sp_image {background-image:url(" + spnftimgurl_2x + ") !important; background-size: 500px 500px !important;}\
    .sp_sns{background-image:url(" + spsnsurl_2x + ") !important; background-size: 198px 435px !important;}\
    .icon_mini {background:url(" + iconminiurl_2x + ") no-repeat 0 0 !important; background-size: 16px 12px !important;}\
    .listwrap .time_best .tab_btn:after {background:url(" + spimgurl_2x + ")no-repeat -109px -1047px !important; background-size: 300px 1300px !important;}\
    .listwrap .time_best .tab_btn.best.on:after{background-position: -133px -1047px !important;}\
    .listwrap .time_best .tab_btn.light.on:after{background-position:-133px -1071px !important;}\
    .listwrap .time_best .tab_btn.night.on:after{background-position:-109px -1071px !important;}\
    .noacs_img::after {background:url(" + spimgurl_2x + ") no-repeat -0px -590px !important; background-size: 300px 1300px !important;}\
    .noacs_img.sp_img {display:contents !important;}";
}


fontcss.type = "text/css";
fontcss.textContent = "body, button, input, select, table, textarea{\
font-family: Dotum,'돋움',Helvetica,\"Apple SD Gothic Neo\",sans-serif !important;}\
.put_inquiry, .input_box label{font-family: Gulim !important;}\
.gall_list{font-family:'굴림',Gulim !important;}\
.gall_list .gall_num, .gall_list .gall_date, .gall_list .gall_count, .gall_list .gall_recommend {\
font-family: tahoma,sans-serif !important;}\
.comment_wrap,.view_content_wrap {font-family: '굴림',Gulim !important;}\
th {font-family: Dotum,'돋움' !important;}";

chrome.storage.local.get(null, (item) => {
    if (item['isdefaultfont'] === true) {
        document.head.appendChild(fontcss);
    } 
    hidpi_css && document.head.appendChild(hidpi_css);
});
