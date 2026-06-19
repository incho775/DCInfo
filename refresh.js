// DCInfo — 자동 갱신·페이지네이션·로더

function setLoader(time, status) {
    if (status === 'init') {
        const loader = document.createElement('div');
        loader.id = 'article_loader';
        document.getElementById('top').appendChild(loader);

        window.pageYOffset < 160 ? loader.classList.add('fixed') : loader.classList.remove('fixed');
        window.addEventListener('scroll', function(){
            loader && window.pageYOffset < 160 ? loader.classList.add('fixed') : loader.classList.remove('fixed');
        });

        console.log("loader init");

    } else if (status === 'update') {
        const loader = document.getElementById('article_loader');
        if (loader) {
            loader.style.animation = 'loaderspin ease-in-out ' + time + 's';
        }
    } else {
        document.getElementById('article_loader').remove();
    }
}

function checkReply() {
    if (DIBESETTING.ischeckip || DIBESETTING.isnickid) {
        const rply = new MutationObserver(function(mutations, observer) {
            if(STATE === -3){
                //앨범 뷰 댓글 감시
                for(let mutation of mutations){
                    if(mutation.attributeName == 'data-comment-cnt'){
                        checkWriter(mutation.target);
                    }
                }
            } else{
                let comment_list = document.getElementsByClassName('cmt_list')[0];
                comment_list && checkWriter(comment_list);
            }
        });

        if(STATE === -2){
            const obsrvNode = document.querySelector("[id^='comment_total_']");

            if(obsrvNode === null){
                return;
            }
    
            rply.observe(obsrvNode, {
                attributes: false,
                subtree: false,
                childList: true,
                characterData: false
            });
            const comment = document.getElementsByClassName('cmt_list');
            comment.length && checkWriter(comment[0]);
        } else {
            $('.comment_wrap').each(function(){
                rply.observe(this,{
                    attributes: true,
                    subtree: false,
                    childList: false,
                    characterData: false
                });
            });          
        }
    };
}

function setPagination() {
    if(!(DIBESETTING.ispagination)){
        return;
    }

    const pagelist_elem = $(document).find('#container .bottom_paging_wrap .bottom_paging_box');
    let pagelist = undefined;

    for (let elem of pagelist_elem){
        if(elem.parentNode.parentNode.localName == 'article'){
            pagelist = $(elem);
            break;
        }
    }

    if(pagelist === undefined || pagelist.length === 0){
        console.log("No page tag!");
        return;
    }

    pagelist.attr('id', 'dibe_pagination');
    pagelist.on("click", "a", function (event){
        //Prevent hyperlink
        event.preventDefault();

        //Prevent Double click event
        if (event.detail === 2){
            return;
        }

        getData(event.target.href).then(data => {
            const offset = $(LIST).offset();

            if(!data){
                throw new Error("No Data");
            }


            $(document).find('#user_data_lyr').remove();
            refreshList(data,true);

            $('html').animate({scrollTop : offset.top}, 200);

            if(event.target.className === "" ){ //페이지 숫자 클릭시
                const currenttag = pagelist.children('em');
                const currentnum = $(currenttag)[0].textContent;
                const replaceurl = event.target.href.split('dcinside.com')[1].replace(/&page=\d*/i, '&page=' + currentnum);

                const numEm = document.createElement('em');
                numEm.textContent = event.target.text;
                event.target.replaceWith(numEm);

                const numLink = document.createElement('a');
                numLink.href = replaceurl;
                numLink.textContent = currentnum;
                currenttag[0].replaceWith(numLink);

            } else { //페이지 이전 다음 클릭시
                const newpagelist_elem = $(data).find('.bottom_paging_wrap .bottom_paging_box');

                for (let elem of newpagelist_elem){
                    if(elem.id != "dibe_pagination" && elem.parentNode.parentNode.localName == 'article'){
                        pagelist.empty().append($(elem).children());
                        break;
                    }
                }        
            }
            setCurrentIndex();
            history.replaceState(null, null, event.target.href);

        }).catch(err => {
            const vibcls = 'vib';

            console.log("pagination err! : ", err);

            event.target.classList.add(vibcls);
            setTimeout(function() {
                event.target.classList.remove(vibcls);
            },400);
        });
    });
}

/** 기존 게시물 테이블과 새로운 게시물 테이블 비교 함수 */
function checkListChange(ajaxdata) {
    const newtable = ajaxdata.getElementsByClassName('gall_list')[0].getElementsByClassName('ub-content');
    const table = LIST.getElementsByClassName('ub-content');

    let curpostnum, newpostnum;
    let clen = table.length - 1, nlen = newtable.length - 1;

    while (nlen >= 0 && clen >= 0) {
        const curtr = table[clen], newtr = newtable[nlen];
        const curgallnum = curtr.getElementsByClassName('gall_num')[0].textContent,
            curview = curtr.getElementsByClassName('gall_count')[0],
            currecom = curtr.getElementsByClassName('gall_recommend')[0],
            newgallnum = newtr.getElementsByClassName('gall_num')[0].textContent,
            newview = newtr.getElementsByClassName('gall_count')[0].textContent,
            newrecom = newtr.getElementsByClassName('gall_recommend')[0].textContent;

        const currply = curtr.getElementsByClassName('reply_num')[0],
            newrply = newtr.getElementsByClassName('reply_num')[0];

        //게시물 번호는 숫자로 비교(문자열 비교 시 자릿수 경계에서 순서가 뒤집힘)
        const curnum = Number(curgallnum), newnum = Number(newgallnum);

        clen === INDEX ? curpostnum = curgallnum : null;
        nlen === INDEX ? newpostnum = newgallnum : null;

        if (curgallnum === newgallnum) {
            newview != curview.textContent ? curview.textContent = newview : null; //조회수 체크
            newrecom != currecom.textContent ? currecom.textContent = newrecom : null; //추천 수 체크

            //댓글 수 체크
            if (newrply) {
                if (currply) {
                    if (currply.textContent != newrply.textContent) {
                        currply.textContent = newrply.textContent;
                    }
                } else {
                    curtr.getElementsByClassName('gall_tit')[0].appendChild(newrply.parentNode);
                }
            }
            nlen--;
            clen--;

        //삭제된 게시글일 시
        } else if (curnum < newnum) {
            curview.textContent = '-';
            currecom.textContent = '-';
            clen--;
        } else if (curnum > newnum) {
            nlen--;
        } else {
            console.log('게시물 번호 불일치!');
            break;
        }
    }

    //마지막 게시물 번호보다 큰 게시물 리스트 추출
    if (curpostnum != newpostnum) {
        let newtablearr = Array.prototype.slice.call(newtable)
        let addlist = newtablearr.slice(INDEX,);

        const wrapper = document.createElement('div');

        for(let i = 0; i < addlist.length; i++){
            if(Number(addlist[i].getElementsByClassName('gall_num')[0].textContent) > Number(curpostnum)){
                wrapper.appendChild(addlist[i]);
            } else{
                break;
            }
        }

        const childcount = wrapper.childElementCount;
        if(childcount === 0){
            return;
        }

        checkUserBlock(wrapper);
        checkNewTab(wrapper);
        checkWriter(wrapper);
        checkdate(wrapper);

        const pagex = window.pageXOffset;
        const pagey = window.pageYOffset;

        $(table).eq(INDEX).before($(wrapper).children().addClass("new"));
        $(table).slice(-childcount).remove();

        window.scrollTo(pagex,pagey);
    }
}

function refreshList(ajaxdata, isreplaceAll) {
    if (isreplaceAll === false){
        checkListChange(ajaxdata);
    } else {
        const table = ajaxdata.getElementsByClassName('gall_list')[0];

        checkUserBlock(table);
        checkNewTab(table);
        checkWriter(table);
        checkdate(table);

        LIST.replaceWith(table);
        LIST = document.getElementsByClassName('gall_list')[0];
    }
}

function setAutoRefresh() {
    if(!(DIBESETTING.isrefresh)){
        return;
    }

    let mainloop = null;
    const interval = DIBESETTING.refreshtime * 1000;
    setLoader(0, 'init');
    setLoader(DIBESETTING.refreshtime, "update");

    mainloop = setTimeout(function ajax() {
        mainloop = setTimeout(ajax, interval);
        document.getElementById('article_loader').style.animation = '';
        getData(window.location.href).then(document => {
            document && setLoader(DIBESETTING.refreshtime, "update");
            document && refreshList(document, false);
        })
    }, interval);

    document.addEventListener("visibilitychange", function(){
        if (document.hidden) {
            setLoader(0, false);
            clearTimeout(mainloop);
            mainloop = 0;
        } else {
            
            if (mainloop === 0 && DIBESETTING.isrefresh) {
                setLoader(0, "init");
                setLoader(DIBESETTING.refreshtime, "update");
                mainloop = setTimeout(function ajaxLoop() {
                    mainloop = setTimeout(ajaxLoop, interval);
                    document.getElementById('article_loader').style.animation = '';
                    getData(window.location.href).then(document => {
                        document && setLoader(DIBESETTING.refreshtime, "update");
                        document && refreshList(document, false);
                    });
                }, interval);
            }
        }
    });
}

