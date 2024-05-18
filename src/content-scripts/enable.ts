var doc = document;
var _body = doc.body;
var _html = doc.documentElement;
_html.onselectstart = _html.oncopy = _html.oncut = _html.onpaste = _html.onkeydown = _html.oncontextmenu = _html.onmousemove = _body.oncopy = _body.oncut = _body.onpaste = _body.onkeydown = _body.oncontextmenu = _body.onmousemove = _body.onselectstart = _body.ondragstart = doc.onselectstart = doc.oncopy = doc.oncut = doc.onpaste = doc.onkeydown = doc.oncontextmenu = doc.onmousedown = doc.onmouseup = null;
_body.style.webkitUserSelect = 'auto';

function defaultHandler(event:any) {
    event.returnValue = true;
}

var event_type;
for (event_type in ['selectstart', 'copy', 'cut', 'paste', 'keydown', 'contextmenu', 'dragstart']) {
    _html.addEventListener(event_type, defaultHandler);
    _body.addEventListener(event_type, defaultHandler);
    doc.addEventListener(event_type, defaultHandler);
}

//@ts-ignore
var jQuery = window.jQuery;
if (jQuery) {
    jQuery(doc).unbind();
    jQuery(_body).unbind();
}

//@ts-ignore
var $Fn = window.$Fn;
if ($Fn) {
    try {
        $Fn.freeElement(doc);
        $Fn.freeElement(_body);
    } catch (e) {}
}

//@ts-ignore
var jindo = window.jindo;
if (jindo) {
    jindo.$A = null;
}

var url = doc.URL, element:any;
var domain_pattern = /^https?:\/\/([^\/]+)/;
var result = domain_pattern.exec(url);
if (result) {
    try {
        switch(result[1]) {
            case 'www.qidian.com':
            case 'read.qidian.com':
            case 'big5.qidian.com':
            case 'www.qdmm.com':
                element = doc.getElementById('bigcontbox');
                if (element) {
                    element.onmousedown = null;
                }
                break;
            case 'www.motie.com':
                element = jQuery('.page-content>pre')[0];
                element.ondragstart = element.oncopy = element.oncut = element.oncontextmenu = null;
                break;
            case 'board.miznet.daum.net':
                //@ts-ignore
                var gaia = unsafeWindow.gaia;
                doc.removeEventListener('selectstart', gaia.blockContent, false);
                doc.removeEventListener('dragstart', gaia.blockContent, false);
                doc.removeEventListener('contextmenu', gaia.blockContent, false);
                doc.removeEventListener('copy', gaia.blockContent, false);
                doc.removeEventListener('keydown', gaia.blockContent, false);
                break;
            case 'book.zongheng.com':
                element = jQuery('.readcon')[0];
                element.style.webkitUserSelect = 'auto';
                element.onselectstart = null;
                break;
            case 'www.kasi-time.com':
                element = doc.getElementById('center');
                if (element) {
                    element.onmousedown = null;
                    element = element.getElementsByClassName('mainkashi');
                    if (element) {
                        element[0].style.webkitUserSelect = 'auto';
                    }
                }
                break;
            case 'detail.china.alibaba.com':
                jQuery('div.mod-detail-gallery').unbind();
                break;
            case 'www.businessweekly.com.tw':
                jQuery('div.maincontent').unbind();
                break;
            case 'petitlyrics.com':
                //@ts-ignore
                doc.getElementById('lyrics_window').style.webkitUserSelect = 'auto';
                break;
            case 'tv.cntv.cn':
                //@ts-ignore
                doc.getElementById('epg_list').style.webkitUserSelect = 'auto';
                break;
        }
    } catch (e) {
    }
}