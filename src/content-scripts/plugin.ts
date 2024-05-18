let eruda:any;

const css = "#xpath_content{display:flex;width: 100%;height: 100%}#xpath_query, #xpath_results{width:50%;height:100%;display:flex;flex-direction:column;}#xpath_query textarea, #xpath_results textarea{flex:1}";
const html = '<div id="xpath_content">\
<div id="xpath_query">\
<div>Query:(<a href="#" id="xpath_enable">Enable ContextMenu</a>)</div>\
<textarea id="xpath_q" placeholder="You can enter xPath here"></textarea>\
</div>\
<div id="xpath_results">\
<div>Results (<span id="xpath_c"></span>):</div>\
<textarea id="xpath_r" readonly="readonly"></textarea>\
</div>\
</div>';

let enableEl, queryEl:any, resultsEl:any, nodeCountEl, nodeCountText:any;

let evaluateQuery = function() {
  var request = {
    'command': 'evaluate',
    'query': queryEl.value
  };
  eruda.onMessage(request);
};

function init($el: any, initData: any){
	queryEl = $el.find('#xpath_q')[0];
	resultsEl = $el.find('#xpath_r')[0];
	nodeCountEl = $el.find('#xpath_c')[0];
	enableEl = $el.find('#xpath_enable')[0];

	nodeCountText = document.createTextNode('0');
	nodeCountEl.appendChild(nodeCountText);
	queryEl.addEventListener('keyup', evaluateQuery);
	queryEl.addEventListener('mouseup', evaluateQuery);
	enableEl.addEventListener('keyup', enableClick);
	enableEl.addEventListener('mouseup', enableClick);

    if(initData){
        render(initData);
    }
}

/**
 * 渲染数据
 */
function render( request:any ){
	if( request.command == 'update' ) {
		if (request['query'] !== null) {
		  queryEl.value = request['query'];
		}
		if (request['results'] !== null) {
		  resultsEl.value = request['results'][0];
		  nodeCountText.nodeValue = request['results'][1];
		}

        if(!eruda._devTools._isShow){
            eruda.show();
        }
        if(eruda._devTools._curTool !== 'xpath'){
            eruda.show('xpath');
        }
	}
}

function loadPlugin(_eruda: any, initData: any = undefined){
    eruda = _eruda;
    eruda.add({
        name: 'xpath',
        init($el: any) {
            $el.html('<style>'+css+'</style>'+html);
            this._$el = $el;
            setTimeout(() => {
                init($el, initData);
            }, 500);
        },
        show() {
            this._$el.show();
        },
        hide() {
            this._$el.hide();
        },
        destroy() {}
    });
}

function enableClick() {
    chrome.runtime.sendMessage({
        type: 'unbind_click'
    });
}

function sendPluginMessage(msg: any){
    render(msg);
}
export { loadPlugin, sendPluginMessage }