// DCInfo — 차단 (통신사IP·사용자 차단·해제)

function regblockMobile(conf){
    //gall.dcinside.com 로컬 스토리지 차단값
    /* conf = {
        on :	on_off,
        word :	b_word.join('||'),
        id :	b_id.join('||'),
        nick :	b_nick.join('||'),  
        ip :	b_ip.join('||')
    };*/

    //localStorage.block_all {"on":*,"word":"*","id":"*","nick":"*","ip":"*"}
    //localStorage.block_parts {"gall_id":{"on":*,"word":"*","id":"*","nick":"*","ip":"*","name":"gall_name"}}"
    let ip_arr = ['mblck'];
    const len = TELECOM.length;

    for (let i = 0; i < len; i++){
        const sublen = TELECOM[i][1].length;
        for (let j = 0; j < sublen; j++){
            if (TELECOM[i][1][j][2] === 'MOB'){
                const ip = TELECOM[i][0] + '.' + TELECOM[i][1][j][0];
                ip_arr.push(ip);
            }
        }
    }

    ip_arr = ip_arr.join('||');
    conf.ip = conf.ip ? conf.ip + '||' + ip_arr : ip_arr;
    conf.on = 1;

    localStorage.block_all = JSON.stringify(conf);

    console.log('blocked mobile');
}

function delblockMobile(conf){
    conf.ip = conf.ip.split('mblck')[0];
    conf.ip = conf.ip && conf.ip.slice(0,-2);

    localStorage.block_all = JSON.stringify(conf);
    console.log('unblocked mobile');
}

function setMobileReg(){
    //dcinside localstorage 차단값 확인
    let dcsetting = localStorage.getItem('block_all');

    if(SETTING.isblockmobile){
        if (dcsetting !== null){
            dcsetting = JSON.parse(dcsetting);
            if(dcsetting.ip.indexOf('mblck') != -1 ){
                return;
            }
        } else {
            dcsetting = {
                on :	1,
                word :	'',
                id :	'',
                nick :	'',
                ip :	''
            };
        }
        regblockMobile(dcsetting);
    } else{
        if (dcsetting !== null){
            dcsetting = JSON.parse(dcsetting);
            if(dcsetting.ip.indexOf('mblck') != -1 ){
                delblockMobile(dcsetting);
            }
        }
    }
}

function checkUserBlock(selector) {
    selector = $(selector) || $(document);

    var ublock_elm	= selector;
	var uword_elm	= ublock_elm.find('.ub-word');
    var uwriter_elm	= ublock_elm.find('.ub-writer');

    var gall_id = $("#gallery_id").attr('value');

    if (window.location.pathname.indexOf('/mini') != -1) {
        gall_id = gall_id + "^MI";
    }

	var conf_arr = new Array('all', 'parts');
	var type_arr = new Array('word', 'nick', 'ip', 'id');
	
	// 전체 갤러리
	var block_all_json		= localStorage.getItem('block_all');
	var block_all_conf		= block_all_json ? $.parseJSON(block_all_json) : null;
	
	// 갤러리별
	var block_parts_json	= localStorage.getItem('block_parts');
	var block_parts_conf	= block_parts_json ? $.parseJSON(block_parts_json) : null;
	
	block_parts_conf		= block_parts_conf && typeof(block_parts_conf[gall_id]) != 'undefined' ? block_parts_conf[gall_id] : null;
	
	var _chk_str = function(conf, type, elm) {
		var block_words = conf.split('||');
		var data_word = '';
        for (var i in block_words){
			//인코딩 후 남는 정규식 메타문자( ( ) * . 등 )를 escape 처리해 RegExp 생성 오류 방지
			block_words[i] = encodeURIComponent(block_words[i]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
		
		for(var i in elm) {
			if(elm.eq(parseInt(i)).closest('.ub-content').hasClass('block-disable') || uwriter_elm.eq(i).attr('data-nick') == '운영자') {
				continue;
			}
			
			if(type == 'word') data_word = uword_elm.eq(i).clone().find('.blind').remove().end().text();
			if(type == 'nick') data_word = uwriter_elm.eq(i).attr('data-nick');
			if(type == 'ip') data_word = uwriter_elm.eq(i).attr('data-ip');
			if(type == 'id') data_word = uwriter_elm.eq(i).attr('data-uid');
			
			if(typeof(data_word) == 'undefined' || !data_word) {
				continue;
			}
			
			var patt = type == 'word' ? new RegExp(block_words.join('|'), 'm') : new RegExp('^(?:' + block_words.join('|') + ')$')
            data_word = encodeURIComponent(data_word)

			if(data_word.match(patt)) {
                var ub_container = elm.eq(parseInt(i)).closest('.ub-content');
				
				if(ub_container.hasClass('album_body')) {
					ub_container.prev().addClass('block-disable');
				}
				else {
                    ub_container.addClass('block-disable');
				}
			}
        }
	}
	
	for(var i in type_arr) {
		var conf = new Array();
		var elm = type_arr[i] == 'word' ? uword_elm : uwriter_elm;
		
		if(block_all_conf && block_all_conf['on'] && block_all_conf[type_arr[i]]) {
			conf.push(block_all_conf[type_arr[i]]);
		}
		
		if(block_parts_conf && block_parts_conf['on'] && block_parts_conf[type_arr[i]]) {
			conf.push(block_parts_conf[type_arr[i]]);
		}
		
		if(conf.length > 0) {
			_chk_str(conf.join('||'), type_arr[i], elm);
		}
    }
}

function dcRemoveBlockValueFromField(field, value) {
    if (!field) return field || '';
    return field.split('||').filter(function (v) { return v !== value; }).join('||');
}

function dcReapplyBlocks() {
    //목록 페이지에서만 즉시 반영(그 외 페이지는 새로고침 시 적용)
    if (!LIST) return;
    const hidden = LIST.querySelectorAll('.block-disable');
    for (let i = 0; i < hidden.length; i++) hidden[i].classList.remove('block-disable');
    checkUserBlock(LIST);
}

