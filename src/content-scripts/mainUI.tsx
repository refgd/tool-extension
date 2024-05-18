import '../style/base.css'

import { loadPlugin, sendPluginMessage } from "./plugin";

let eruda: any = undefined;

function loadEruda(initData: any = undefined){
  // @ts-ignore
  import('https://cdn.jsdelivr.net/npm/eruda@latest/+esm')
      .then((module) => {
          eruda = module.default;
          eruda.init({
              tool: ['console', 'elements', 'resources', 'sources'],
              defaults: {
                theme: 'Monokai Pro'
              }
          });
          eruda.show();
          eruda.position({x: 20, y: 20});
          
          eruda.onMessage = handleCommand;
          loadPlugin(eruda, initData);
      })
      .catch((err) => {
          console.error(err);
      });
}

let clickedEl: any = null;

document.addEventListener("mousedown", function (event) {
  clickedEl = event.target;
}, true);

function sendMessage(msg: any) {
  if(!eruda){
    loadEruda(msg);
  }else{
    sendPluginMessage(msg);
  }
}

function handleCommand(request: any) {
  switch (request.command) {
    case 'open_console':
      loadEruda();
      break;
    case 'evaluate':
      xh.query_ = request['query'];
      xh.clearHighlights();
      xh.updateBar_(false);
      break;
    case 'getXPath':
      //var path = xh.makeQueryForElement(clickedEl);
      //sendResponse({'xPath':path});
      xh.updateQueryAndBar_(clickedEl);
      break;
  }
}

// Extension namespace.
var xh: any = xh || {};

////////////////////////////////////////////////////////////////////////////////
// Generic helper functions and constants

xh.query_ = "";

xh.bind = function (object: any, method: any) {
  return function () {
    return method.apply(object, arguments);
  };
};

xh.elementsShareFamily = function (primaryEl: any, siblingEl: any) {
  if (primaryEl.tagName === siblingEl.tagName &&
    (!primaryEl.className || primaryEl.className === siblingEl.className) &&
    (!primaryEl.id || primaryEl.id === siblingEl.id)) {
    return true;
  }
  return false;
};

xh.getElementIndex = function (el: any) {
  var className = el.className;
  var id = el.id;

  var index = 1;  // XPath is one-indexed
  var sib;
  for (sib = el.previousSibling; sib; sib = sib.previousSibling) {
    if (sib.nodeType === Node.ELEMENT_NODE && xh.elementsShareFamily(el, sib)) {
      index++;
    }
  }
  if (index > 1) {
    return index;
  }
  for (sib = el.nextSibling; sib; sib = sib.nextSibling) {
    if (sib.nodeType === Node.ELEMENT_NODE && xh.elementsShareFamily(el, sib)) {
      return 1;
    }
  }
  return 0;
};

xh.makeQueryForElement = function (el: any) {
  var query = '';
  for (; el && el.nodeType === Node.ELEMENT_NODE; el = el.parentNode) {
    var tagName = el.tagName.toLowerCase();
    var component = tagName;
    var index = xh.getElementIndex(el);
    if (el.id) {
      component += '[@id=\'' + el.id + '\']';
    } else if (el.className) {
      component += '[@class=\'' + el.className + '\']';
    }
    if (index >= 1) {
      component += '[' + index + ']';
    }
    // If the last tag is an img, the user probably wants img/@src.
    if (query === '' && tagName === 'img') {
      component += '/@src';
    }
    query = '/' + component + query;
  }
  return query;
};

xh.highlightNodes = function (nodes: any) {
  for (var i = 0, l = nodes.length; i < l; i++) {
    nodes[i].className += ' chromexPathFinder';
  }
};

xh.clearHighlights = function () {
  var els = document.getElementsByClassName('chromexPathFinder');
  // Note: getElementsByClassName() returns a live NodeList.
  while (els.length) {
    els[0].className = els[0].className.replace(' chromexPathFinder', '');
  }
};
// Returns [values, nodeCount]. Highlights result nodes, if applicable. Assumes
// no nodes are currently highlighted.
xh.evaluateQuery = function (query: any) {
  var xpathResult = null;
  var str = '';
  var nodeCount = 0;
  var nodesToHighlight = [];

  try {
    xpathResult = document.evaluate(query, document, null,
      XPathResult.ANY_TYPE, null);
  } catch (e) {
    str = '[INVALID XPATH EXPRESSION]';
    nodeCount = 0;
  }

  if (!xpathResult) {
    return [str, nodeCount];
  }

  if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE) {
    str = xpathResult.booleanValue ? '1' : '0';
    nodeCount = 1;
  } else if (xpathResult.resultType === XPathResult.NUMBER_TYPE) {
    str = xpathResult.numberValue.toString();
    nodeCount = 1;
  } else if (xpathResult.resultType === XPathResult.STRING_TYPE) {
    str = xpathResult.stringValue;
    nodeCount = 1;
  } else if (xpathResult.resultType ===
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
    for (var it = xpathResult.iterateNext(); it;
      it = xpathResult.iterateNext()) {
      nodesToHighlight.push(it);
      if (str) {
        str += '\n';
      }
      str += it.textContent;
      nodeCount++;
    }
    if (nodeCount === 0) {
      str = '[NULL]';
    }
  } else {
    // Since we pass XPathResult.ANY_TYPE to document.evaluate(), we should
    // never get back a result type not handled above.
    str = '[INTERNAL ERROR]';
    nodeCount = 0;
  }

  xh.highlightNodes(nodesToHighlight);
  return [str, nodeCount];
};

xh.updateQueryAndBar_ = function (el: any) {
  xh.clearHighlights();
  xh.query_ = el ? xh.makeQueryForElement(el) : '';
  this.updateBar_(true);
};

xh.updateBar_ = function (update_query: any) {
  var results = xh.query_ ? xh.evaluateQuery(xh.query_) : ['', 0];
  var request = {
    'command': 'update',
    'query': update_query ? xh.query_ : null,
    'results': results
  };
  sendMessage(request);
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  handleCommand(request);
});