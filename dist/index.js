!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.clEditor=e()}(this,function(){"use strict";function t(){}function e(t){for(var e,n,i=1,o=arguments.length;i<o;i++){n=arguments[i];for(e in n)t[e]=n[e]}return t}function n(t,e){e.appendChild(t)}function i(t,e,n){e.insertBefore(t,n)}function o(t){t.parentNode.removeChild(t)}function r(t){for(var e=0;e<t.length;e+=1)t[e]&&t[e].d()}function s(t){return document.createElement(t)}function c(t){return document.createTextNode(t)}function l(t,e,n){t.addEventListener(e,n,!1)}function a(t,e,n){t.removeEventListener(e,n,!1)}function h(t,e,n){t.setAttribute(e,n)}function u(t,e,n){t.style.setProperty(e,n)}function d(){return Object.create(null)}function f(e){this.destroy=t,this.fire("destroy"),this.set=this.get=t,!1!==e&&this._fragment.u(),this._fragment.d(),this._fragment=this._state=null}function v(t,e){return t!==e||t&&"object"==typeof t||"function"==typeof t}function g(t,e,n,i,o){for(var r in e)if(n[r]){var s=i[r],c=o[r],l=e[r];if(l)for(var a=0;a<l.length;a+=1){var h=l[a];h.__calling||(h.__calling=!0,h.call(t,s,c),h.__calling=!1)}}}function p(t,e){t.options=e,t._observers={pre:d(),post:d()},t._handlers=d(),t._root=e._root||t,t._bind=e._bind}function m(t){for(;t&&t.length;)t.pop()()}function b(){return{actionBtns:[],height:"300px"}}function w(){var t=S(V,this.options.data&&this.options.data.actions);this.set({actionBtns:O(t),actionObj:t})}function _(t){h(t,"svelte-4231003605","")}function x(){var t=s("style");t.id="svelte-4231003605-style",t.textContent="[svelte-4231003605].cl,[svelte-4231003605] .cl{box-shadow:0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);box-sizing:border-box;width:100%}[svelte-4231003605].cl-content,[svelte-4231003605] .cl-content{box-sizing:border-box;height:300px;outline:0;overflow-y:auto;padding:10px;width:100%}[svelte-4231003605].cl-actionbar,[svelte-4231003605] .cl-actionbar{background-color:#ecf0f1;border-bottom:1px solid rgba(10, 10, 10, 0.1);width:100%}[svelte-4231003605].cl-button,[svelte-4231003605] .cl-button{background-color:transparent;border:none;cursor:pointer;height:35px;outline:0;width:35px;vertical-align:top}[svelte-4231003605].cl-button:hover,[svelte-4231003605] .cl-button:hover,[svelte-4231003605].cl-button.active,[svelte-4231003605] .cl-button.active{background-color:#fff}[svelte-4231003605].cl-button:disabled,[svelte-4231003605] .cl-button:disabled{opacity:.5;pointer-events:none}[svelte-4231003605].cl-textarea,[svelte-4231003605] .cl-textarea{display:none;width:100%;max-width:100%;border:none;padding:10px;box-sizing:border-box}[svelte-4231003605].cl-textarea:focus,[svelte-4231003605] .cl-textarea:focus{outline:none}",n(t,document.head)}function y(t,e){function h(t){e.onChange(t.target.innerHTML)}function d(t){e.handleButtonStatus()}function f(t){e.handleButtonStatus()}function v(t){e.onPaste(t)}for(var g,p,m,b,w,x,y=t.actionBtns,z=[],H=0;H<y.length;H+=1)z[H]=M(t,y,y[H],H,e);return{c:function(){g=s("div"),p=s("div");for(var t=0;t<z.length;t+=1)z[t].c();m=c("\r\n    "),b=s("div"),w=c("\r\n    \r\n    "),x=s("textarea"),this.h()},h:function(){_(g),g.className="cl",p.className="cl-actionbar",b.className="cl-content",u(b,"height",t.height),b.contentEditable="true",l(b,"input",h),l(b,"mouseup",d),l(b,"keyup",f),l(b,"paste",v),x.className="cl-textarea",u(x,"height",t.height)},m:function(t,o){i(g,t,o),n(p,g);for(var r=0;r<z.length;r+=1)z[r].m(p,null);n(m,g),n(b,g),e.refs.editor=b,n(w,g),n(x,g),e.refs.raw=x},p:function(t,n){var i=n.actionBtns;if(t.actionBtns){for(var o=0;o<i.length;o+=1)z[o]?z[o].p(t,n,i,i[o],o):(z[o]=M(n,i,i[o],o,e),z[o].c(),z[o].m(p,null));for(;o<z.length;o+=1)z[o].u(),z[o].d();z.length=i.length}t.height&&(u(b,"height",n.height),u(x,"height",n.height))},u:function(){o(g);for(var t=0;t<z.length;t+=1)z[t].u()},d:function(){r(z),a(b,"input",h),a(b,"mouseup",d),a(b,"keyup",f),a(b,"paste",v),e.refs.editor===b&&(e.refs.editor=null),e.refs.raw===x&&(e.refs.raw=null)}}}function M(t,e,n,r,c){var h,u,d,f,v=n.icon;return{c:function(){h=s("button"),this.h()},h:function(){h.className=u="cl-button "+(n.active?"active":""),h.title=d=n.title,h.disabled=f=n.disabled,l(h,"click",z),h._svelte={component:c,actionBtns:e,action_index:r}},m:function(t,e){i(h,t,e),h.innerHTML=v},p:function(t,e,n,i,o){t.actionBtns&&u!==(u="cl-button "+(i.active?"active":""))&&(h.className=u),t.actionBtns&&d!==(d=i.title)&&(h.title=d),t.actionBtns&&f!==(f=i.disabled)&&(h.disabled=f),h._svelte.actionBtns=n,h._svelte.action_index=o,t.actionBtns&&v!==(v=i.icon)&&(h.innerHTML=v)},u:function(){h.innerHTML="",o(h)},d:function(){a(h,"click",z)}}}function z(t){var e=this._svelte.component,n=this._svelte.actionBtns[this._svelte.action_index];e.btnClicked(n)}function H(t){p(this,t),this.refs={},this._state=e(b(),t.data),document.getElementById("svelte-4231003605-style")||x();var n=w.bind(this);t._root?this._root._oncreate.push(n):this._oncreate=[n],this._fragment=y(this._state,this),t.target&&(this._fragment.c(),this._fragment.m(t.target,t.anchor||null),m(this._oncreate))}var k={},B=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;document.execCommand(t,!1,e)},L=function t(e,n){if(n=n||(e&&e.tagName?[e.tagName]:[]),!e||!e.parentNode)return n;var i=(e=e.parentNode).tagName;return[e.style.textAlign||e.getAttribute("align"),e.style.color||"FONT"===i&&"forecolor",e.style.backgroundColor&&"backcolor"].filter(function(t){return t}).forEach(function(t){return n.push(t)}),"DIV"===i?n:(n.push(i),t(e,n).filter(function(t){return null!=t}))},C=function(t){var e=document.getSelection();if(k.range=null,e.rangeCount){var n=k.range=e.getRangeAt(0),i=document.createRange(),o=void 0;i.selectNodeContents(t),i.setEnd(n.startContainer,n.startOffset),o=(i+"").length,k.metaRange={start:o,end:o+(n+"").length}}},j=function(t){var e=k.metaRange,n=k.range,i=document.getSelection(),o=void 0;if(n){if(e&&e.start!==e.end){var r=0,s=[t],c=void 0,l=!1,a=!1;for(o=document.createRange();!a&&(c=s.pop());)if(3===c.nodeType){var h=r+c.length;!l&&e.start>=r&&e.start<=h&&(o.setStart(c,e.start-r),l=!0),l&&e.end>=r&&e.end<=h&&(o.setEnd(c,e.end-r),a=!0),r=h}else for(var u=c.childNodes,d=u.length;d>0;)d-=1,s.push(u[d])}i.removeAllRanges(),i.addRange(o||n)}},N=function(t){var e=t.replace(/\r?\n|\r/g," ").match(/<!--StartFragment-->(.*?)<!--EndFragment-->/),n=e&&e[1]||"";return n=n.replace(/(class=(")?Mso[a-zA-Z]+(")?)/g," ").replace(/<!--(.*?)-->/g,"").replace(new RegExp("<(/)*(meta|link|span|\\?xml:|st1:|o:|font)(.*?)>","gi"),"").replace(/<!\[if !supportLists\]>(.*?)<!\[endif\]>/gi,"").replace(/style="[^"]*"/gi,"").replace(/style='[^']*'/gi,"").replace(/&nbsp;/gi," "),["style","script","applet","embed","noframes","noscript"].forEach(function(t){n=n.replace(new RegExp("<"+t+".*?"+t+"(.*?)>","gi"),"")}),n},R=function(t){for(var e=document.createDocumentFragment();t.firstChild;){var n=t.removeChild(t.firstChild);e.appendChild(n)}t.parentNode.replaceChild(e,t)},E=function t(e){Array.from(e).forEach(function(e){["h1","h2","p","div","blockquote"].some(function(t){return t===e.tagName.toLowerCase()})&&(e.children.length&&t(e.children),R(e))})},O=function(t){return Object.keys(t).map(function(e){return t[e]})},S=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(e&&e.length){var n={};return e.forEach(function(e){"string"==typeof e?n[e]=t[e]:t[e.name]?n[e.name]=Object.assign(t[e.name],e):n[e.name]=e}),n}return t},T=!0,V={viewHtml:{icon:'<svg id="trumbowyg-view-html" viewBox="0 0 72 72" width="17px" height="100%"><path fill="none" stroke="currentColor" stroke-width="8" stroke-miterlimit="10" d="M26.9 17.9L9 36.2 26.9 54M45 54l17.9-18.3L45 17.9"></path></svg>',title:"View HTML",result:function(){var t=this,e=this.get("actionObj");T=!T,this.refs.editor.style.display=T?"block":"none",this.refs.raw.style.display=T?"none":"block",T?this.refs.editor.innerHTML=this.refs.raw.value:this.refs.raw.value=this.refs.editor.innerHTML,setTimeout(function(){Object.keys(e).forEach(function(t){return e[t].disabled=!T}),e.viewHtml.disabled=!1,e.viewHtml.active=!T,t.set({actionBtns:O(e),actionObj:e})})}},undo:{icon:'<svg id="trumbowyg-undo" viewBox="0 0 72 72" width="17px" height="100%"><path d="M61.2 51.2c0-5.1-2.1-9.7-5.4-13.1-3.3-3.3-8-5.4-13.1-5.4H26.1v-12L10.8 36l15.3 15.3V39.1h16.7c3.3 0 6.4 1.3 8.5 3.5 2.2 2.2 3.5 5.2 3.5 8.5h6.4z"></path></svg>',title:"Undo",result:function(){return B("undo")}},redo:{icon:'<svg id="trumbowyg-redo" viewBox="0 0 72 72" width="17px" height="100%"><path d="M10.8 51.2c0-5.1 2.1-9.7 5.4-13.1 3.3-3.3 8-5.4 13.1-5.4H46v-12L61.3 36 45.9 51.3V39.1H29.3c-3.3 0-6.4 1.3-8.5 3.5-2.2 2.2-3.5 5.2-3.5 8.5h-6.5z"></path></svg>',title:"Redo",result:function(){return B("redo")}},b:{icon:"<b>B</b>",title:"Bold",result:function(){return B("bold")}},i:{icon:"<i>I</i>",title:"Italic",result:function(){return B("italic")}},u:{icon:"<u>U</u>",title:"Underline",result:function(){return B("underline")}},strike:{icon:"<strike>S</strike>",title:"Strike-through",result:function(){return B("strikeThrough")}},h1:{icon:"<b>H<sub>1</sub></b>",title:"Heading 1",result:function(){return B("formatBlock","<H1>")}},h2:{icon:"<b>H<sub>2</sub></b>",title:"Heading 2",result:function(){return B("formatBlock","<H2>")}},p:{icon:"&#182;",title:"Paragraph",result:function(){return B("formatBlock","<P>")}},blockquote:{icon:"&#8220; &#8221;",title:"Quote",result:function(){return B("formatBlock","<BLOCKQUOTE>")}},ol:{icon:'<svg id="trumbowyg-ordered-list" viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM27 32h36v8H27zM11.8 15.8V22h1.8v-7.8h-1.5l-2.1 1 .3 1.3zM12.1 38.5l.7-.6c1.1-1 2.1-2.1 2.1-3.4 0-1.4-1-2.4-2.7-2.4-1.1 0-2 .4-2.6.8l.5 1.3c.4-.3 1-.6 1.7-.6.9 0 1.3.5 1.3 1.1 0 .9-.9 1.8-2.6 3.3l-1 .9V40H15v-1.5h-2.9zM13.3 53.9c1-.4 1.4-1 1.4-1.8 0-1.1-.9-1.9-2.6-1.9-1 0-1.9.3-2.4.6l.4 1.3c.3-.2 1-.5 1.6-.5.8 0 1.2.3 1.2.8 0 .7-.8.9-1.4.9h-.7v1.3h.7c.8 0 1.6.3 1.6 1.1 0 .6-.5 1-1.4 1-.7 0-1.5-.3-1.8-.5l-.4 1.4c.5.3 1.3.6 2.3.6 2 0 3.2-1 3.2-2.4 0-1.1-.8-1.8-1.7-1.9z"></path></svg>',title:"Ordered List",result:function(){return B("insertOrderedList")}},ul:{icon:'<svg id="trumbowyg-unordered-list" viewBox="0 0 72 72" width="17px" height="100%"><path d="M27 14h36v8H27zM27 50h36v8H27zM9 50h9v8H9zM9 32h9v8H9zM9 14h9v8H9zM27 32h36v8H27z"></path></svg>',title:"Unordered List",result:function(){return B("insertUnorderedList")}},line:{icon:"&#8213;",title:"Horizontal Line",result:function(){return B("insertHorizontalRule")}},left:{icon:'<svg id="trumbowyg-justify-left" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h36v8H9z"></path></svg>',title:"Justify left",result:function(){return B("justifyLeft")}},right:{icon:'<svg id="trumbowyg-justify-right" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM27 32h36v8H27z"></path></svg>',title:"Justify right",result:function(){return B("justifyRight")}},center:{icon:'<svg id="trumbowyg-justify-center" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM18 32h36v8H18z"></path></svg>',title:"Justify center",result:function(){return B("justifyCenter")}},justify:{icon:'<svg id="trumbowyg-justify-full" viewBox="0 0 72 72" width="17px" height="100%"><path d="M9 14h54v8H9zM9 50h54v8H9zM9 32h54v8H9z"></path></svg>',title:"Justify full",result:function(){return B("justifyFull")}},a:{icon:'<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>',title:"Insert link",result:function(){var t=this.get("actionObj");if(t.a.active){var e=window.getSelection(),n=document.createRange();n.selectNodeContents(document.getSelection().focusNode),e.removeAllRanges(),e.addRange(n),B("unlink"),t.a.title="Insert link",t.a.icon='<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M31.1 48.9l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9L15 50.4c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L11 41.8c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7c2.5-2.6 3.1-6.7 1.5-10l-5.9 5.9zM38.7 22.5l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2L42 38c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1c0 .1 0 .1 0 0z"></path><path d="M44.2 30.5c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.3-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.9 40.6c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM49.9 55.4h-8.5v-5h8.5v-8.9h5.2v8.9h8.5v5h-8.5v8.9h-5.2v-8.9z"></path></svg>'}else{var i=window.prompt("Enter the link URL");i&&(B("createLink",i),t.a.title="Unlink",t.a.icon='<svg viewBox="0 0 72 72" width="17px" height="100%"><path d="M30.9 49.1l-6.7 6.7c-.8.8-1.6.9-2.1.9s-1.4-.1-2.1-.9l-5.2-5.2c-1.1-1.1-1.1-3.1 0-4.2l6.1-6.1.2-.2 6.5-6.5c-1.2-.6-2.5-.9-3.8-.9-2.3 0-4.6.9-6.3 2.6L10.8 42c-3.5 3.5-3.5 9.2 0 12.7l5.2 5.2c1.7 1.7 4 2.6 6.3 2.6s4.6-.9 6.3-2.6l6.7-6.7C38 50.5 38.6 46.3 37 43l-6.1 6.1zM38.5 22.7l6.7-6.7c.8-.8 1.6-.9 2.1-.9s1.4.1 2.1.9l5.2 5.2c1.1 1.1 1.1 3.1 0 4.2l-6.1 6.1-.2.2-6.5 6.5c1.2.6 2.5.9 3.8.9 2.3 0 4.6-.9 6.3-2.6l6.7-6.7c3.5-3.5 3.5-9.2 0-12.7l-5.2-5.2c-1.7-1.7-4-2.6-6.3-2.6s-4.6.9-6.3 2.6l-6.7 6.7c-2.7 2.7-3.3 6.9-1.7 10.2l6.1-6.1z"></path><path d="M44.1 30.7c.2-.2.4-.6.4-.9 0-.3-.1-.6-.4-.9l-2.3-2.3c-.2-.2-.6-.4-.9-.4-.3 0-.6.1-.9.4L25.8 40.8c-.2.2-.4.6-.4.9 0 .3.1.6.4.9l2.3 2.3c.2.2.6.4.9.4.3 0 .6-.1.9-.4l14.2-14.2zM41.3 55.8v-5h22.2v5H41.3z"></path></svg>')}this.set({actionBtns:O(t),actionObj:t})}},image:{icon:'<svg id="trumbowyg-insert-image" viewBox="0 0 72 72" width="17px" height="100%"><path d="M64 17v38H8V17h56m8-8H0v54h72V9z"></path><path d="M17.5 22C15 22 13 24 13 26.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zM16 50h27L29.5 32zM36 36.2l8.9-8.5L60.2 50H45.9S35.6 35.9 36 36.2z"></path></svg>',title:"Image",result:function(){var t=window.prompt("Enter the image URL");t&&B("insertImage",t)}},forecolor:{icon:'<svg id="trumbowyg-fore-color" viewBox="0 0 72 72" width="17px" height="100%"><path d="M32 15h7.8L56 57.1h-7.9l-4-11.1H27.4l-4 11.1h-7.6L32 15zm-2.5 25.4h12.9L36 22.3h-.2l-6.3 18.1z"></path></svg>',title:"Text color",result:function(){var t=window.prompt("enter color");B("foreColor",t)}},backcolor:{icon:'<svg id="trumbowyg-back-color" viewBox="0 0 72 72" width="17px" height="100%"><path d="M36.5 22.3l-6.3 18.1H43l-6.3-18.1z"></path><path d="M9 8.9v54.2h54.1V8.9H9zm39.9 48.2L45 46H28.2l-3.9 11.1h-7.6L32.8 15h7.8l16.2 42.1h-7.9z"></path></svg>',title:"Background color",result:function(){var t=window.prompt("enter background color");B("backColor",t)}},removeFromat:{icon:'<svg id="trumbowyg-removeformat" viewBox="0 0 72 72" width="17px" height="100%"><path d="M58.2 54.6L52 48.5l3.6-3.6 6.1 6.1 6.4-6.4 3.8 3.8-6.4 6.4 6.1 6.1-3.6 3.6-6.1-6.1-6.4 6.4-3.7-3.8 6.4-6.4zM21.7 52.1H50V57H21.7zM18.8 15.2h34.1v6.4H39.5v24.2h-7.4V21.5H18.8v-6.3z"></path></svg>',title:"Remove format",result:function(){var t=window.getSelection();if(!t.toString().length){E(this.refs.editor.children);var e=document.createRange();e.selectNodeContents(this.refs.editor),t.removeAllRanges(),t.addRange(e)}B("removeFormat"),t.removeAllRanges()}}};return e(H.prototype,{btnClicked:function(t){C(this.refs.editor),j(this.refs.editor),t.result.call(this),this.handleButtonStatus()},handleButtonStatus:function(){var t=L(document.getSelection().focusNode),e=this.get("actionObj");Object.keys(e).forEach(function(t){return e[t].active=!1}),t.forEach(function(t){return(e[t.toLowerCase()]||{}).active=!0}),this.set({actionBtns:O(e),actionObj:e})},onPaste:function(t){t.preventDefault(),B("insertHTML",N(t.clipboardData.getData("text/html")))},onChange:function(t){this.fire("onChange",t)}},{destroy:f,get:function(t){return t?this._state[t]:this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var i=0;i<n.length;i+=1)n[i].call(this,e)},observe:function(t,e,n){var i=n&&n.defer?this._observers.post:this._observers.pre;return(i[t]||(i[t]=[])).push(e),n&&!1===n.init||(e.__calling=!0,e.call(this,this._state[t]),e.__calling=!1),{cancel:function(){var n=i[t].indexOf(e);~n&&i[t].splice(n,1)}}},on:function(t,e){if("teardown"===t)return this.on("destroy",e);var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(e({},t)),this._root._lock||(this._root._lock=!0,m(this._root._beforecreate),m(this._root._oncreate),m(this._root._aftercreate),this._root._lock=!1)},teardown:f,_recompute:t,_set:function(t){var n=this._state,i={},o=!1;for(var r in t)v(t[r],n[r])&&(i[r]=o=!0);o&&(this._state=e({},n,t),this._recompute(i,this._state),this._bind&&this._bind(i,this._state),g(this,this._observers.pre,i,this._state,n),this._fragment.p(i,this._state),g(this,this._observers.post,i,this._state,n))},_mount:function(t,e){this._fragment.m(t,e)},_unmount:function(){this._fragment.u()}}),H});
//# sourceMappingURL=index.js.map
