!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.MA=n():t.MA=n()}(window,(function(){return function(t){var n={};function r(e){if(n[e])return n[e].exports;var o=n[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=n,r.d=function(t,n,e){r.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:e})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,n){if(1&n&&(t=r(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(r.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)r.d(e,o,function(n){return t[n]}.bind(null,o));return e},r.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(n,"a",n),n},r.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},r.p="",r(r.s=114)}([function(t,n,r){var e=r(1),o=r(17),i=r(33),u=r(48),c=e.Symbol,a=o("wks");t.exports=function(t){return a[t]||(a[t]=u&&c[t]||(u?c:i)("Symbol."+t))}},function(t,n,r){(function(n){var r=function(t){return t&&t.Math==Math&&t};t.exports=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof n&&n)||Function("return this")()}).call(this,r(72))},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n){var r={}.hasOwnProperty;t.exports=function(t,n){return r.call(t,n)}},function(t,n,r){var e=r(6),o=r(39),i=r(5),u=r(16),c=Object.defineProperty;n.f=e?c:function(t,n,r){if(i(t),n=u(n,!0),i(r),o)try{return c(t,n,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported");return"value"in r&&(t[n]=r.value),t}},function(t,n,r){var e=r(7);t.exports=function(t){if(!e(t))throw TypeError(String(t)+" is not an object");return t}},function(t,n,r){var e=r(2);t.exports=!e((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n,r){var e=r(6),o=r(4),i=r(15);t.exports=e?function(t,n,r){return o.f(t,n,i(1,r))}:function(t,n,r){return t[n]=r,t}},function(t,n,r){var e=r(1),o=r(21).f,i=r(8),u=r(10),c=r(32),a=r(42),f=r(35);t.exports=function(t,n){var r,s,l,p,v,g=t.target,h=t.global,y=t.stat;if(r=h?e:y?e[g]||c(g,{}):(e[g]||{}).prototype)for(s in n){if(p=n[s],l=t.noTargetGet?(v=o(r,s))&&v.value:r[s],!f(h?s:g+(y?".":"#")+s,t.forced)&&void 0!==l){if(typeof p==typeof l)continue;a(p,l)}(t.sham||l&&l.sham)&&i(p,"sham",!0),u(r,s,p,t)}}},function(t,n,r){var e=r(1),o=r(17),i=r(8),u=r(3),c=r(32),a=r(41),f=r(23),s=f.get,l=f.enforce,p=String(a).split("toString");o("inspectSource",(function(t){return a.call(t)})),(t.exports=function(t,n,r,o){var a=!!o&&!!o.unsafe,f=!!o&&!!o.enumerable,s=!!o&&!!o.noTargetGet;"function"==typeof r&&("string"!=typeof n||u(r,"name")||i(r,"name",n),l(r).source=p.join("string"==typeof n?n:"")),t!==e?(a?!s&&t[n]&&(f=!0):delete t[n],f?t[n]=r:i(t,n,r)):f?t[n]=r:c(n,r)})(Function.prototype,"toString",(function(){return"function"==typeof this&&s(this).source||a.call(this)}))},function(t,n,r){var e=r(31),o=r(13);t.exports=function(t){return e(o(t))}},function(t,n){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,n){t.exports=function(t){if(null==t)throw TypeError("Can't call method on "+t);return t}},function(t,n,r){var e=r(27),o=Math.min;t.exports=function(t){return t>0?o(e(t),9007199254740991):0}},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,r){var e=r(7);t.exports=function(t,n){if(!e(t))return t;var r,o;if(n&&"function"==typeof(r=t.toString)&&!e(o=r.call(t)))return o;if("function"==typeof(r=t.valueOf)&&!e(o=r.call(t)))return o;if(!n&&"function"==typeof(r=t.toString)&&!e(o=r.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,n,r){var e=r(22),o=r(73);(t.exports=function(t,n){return o[t]||(o[t]=void 0!==n?n:{})})("versions",[]).push({version:"3.3.5",mode:e?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,n,r){var e=r(44),o=r(34).concat("length","prototype");n.f=Object.getOwnPropertyNames||function(t){return e(t,o)}},function(t,n,r){var e=r(13);t.exports=function(t){return Object(e(t))}},function(t,n){t.exports={}},function(t,n,r){var e=r(6),o=r(38),i=r(15),u=r(11),c=r(16),a=r(3),f=r(39),s=Object.getOwnPropertyDescriptor;n.f=e?s:function(t,n){if(t=u(t),n=c(n,!0),f)try{return s(t,n)}catch(t){}if(a(t,n))return i(!o.f.call(t,n),t[n])}},function(t,n){t.exports=!1},function(t,n,r){var e,o,i,u=r(74),c=r(1),a=r(7),f=r(8),s=r(3),l=r(24),p=r(25),v=c.WeakMap;if(u){var g=new v,h=g.get,y=g.has,d=g.set;e=function(t,n){return d.call(g,t,n),n},o=function(t){return h.call(g,t)||{}},i=function(t){return y.call(g,t)}}else{var x=l("state");p[x]=!0,e=function(t,n){return f(t,x,n),n},o=function(t){return s(t,x)?t[x]:{}},i=function(t){return s(t,x)}}t.exports={set:e,get:o,has:i,enforce:function(t){return i(t)?o(t):e(t,{})},getterFor:function(t){return function(n){var r;if(!a(n)||(r=o(n)).type!==t)throw TypeError("Incompatible receiver, "+t+" required");return r}}}},function(t,n,r){var e=r(17),o=r(33),i=e("keys");t.exports=function(t){return i[t]||(i[t]=o(t))}},function(t,n){t.exports={}},function(t,n,r){var e=r(43),o=r(1),i=function(t){return"function"==typeof t?t:void 0};t.exports=function(t,n){return arguments.length<2?i(e[t])||i(o[t]):e[t]&&e[t][n]||o[t]&&o[t][n]}},function(t,n){var r=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?e:r)(t)}},function(t,n,r){var e=r(12);t.exports=Array.isArray||function(t){return"Array"==e(t)}},function(t,n,r){var e=r(5),o=r(76),i=r(34),u=r(25),c=r(77),a=r(40),f=r(24)("IE_PROTO"),s=function(){},l=function(){var t,n=a("iframe"),r=i.length;for(n.style.display="none",c.appendChild(n),n.src=String("javascript:"),(t=n.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),l=t.F;r--;)delete l.prototype[i[r]];return l()};t.exports=Object.create||function(t,n){var r;return null!==t?(s.prototype=e(t),r=new s,s.prototype=null,r[f]=t):r=l(),void 0===n?r:o(r,n)},u[f]=!0},function(t,n,r){"use strict";var e,o,i=r(37),u=RegExp.prototype.exec,c=String.prototype.replace,a=u,f=(e=/a/,o=/b*/g,u.call(e,"a"),u.call(o,"a"),0!==e.lastIndex||0!==o.lastIndex),s=void 0!==/()??/.exec("")[1];(f||s)&&(a=function(t){var n,r,e,o,a=this;return s&&(r=new RegExp("^"+a.source+"$(?!\\s)",i.call(a))),f&&(n=a.lastIndex),e=u.call(a,t),f&&e&&(a.lastIndex=a.global?e.index+e[0].length:n),s&&e&&e.length>1&&c.call(e[0],r,(function(){for(o=1;o<arguments.length-2;o++)void 0===arguments[o]&&(e[o]=void 0)})),e}),t.exports=a},function(t,n,r){var e=r(2),o=r(12),i="".split;t.exports=e((function(){return!Object("z").propertyIsEnumerable(0)}))?function(t){return"String"==o(t)?i.call(t,""):Object(t)}:Object},function(t,n,r){var e=r(1),o=r(8);t.exports=function(t,n){try{o(e,t,n)}catch(r){e[t]=n}return n}},function(t,n){var r=0,e=Math.random();t.exports=function(t){return"Symbol("+String(void 0===t?"":t)+")_"+(++r+e).toString(36)}},function(t,n){t.exports=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"]},function(t,n,r){var e=r(2),o=/#|\.prototype\./,i=function(t,n){var r=c[u(t)];return r==f||r!=a&&("function"==typeof n?e(n):!!n)},u=i.normalize=function(t){return String(t).replace(o,".").toLowerCase()},c=i.data={},a=i.NATIVE="N",f=i.POLYFILL="P";t.exports=i},function(t,n,r){var e=r(4).f,o=r(3),i=r(0)("toStringTag");t.exports=function(t,n,r){t&&!o(t=r?t:t.prototype,i)&&e(t,i,{configurable:!0,value:n})}},function(t,n,r){"use strict";var e=r(5);t.exports=function(){var t=e(this),n="";return t.global&&(n+="g"),t.ignoreCase&&(n+="i"),t.multiline&&(n+="m"),t.dotAll&&(n+="s"),t.unicode&&(n+="u"),t.sticky&&(n+="y"),n}},function(t,n,r){"use strict";var e={}.propertyIsEnumerable,o=Object.getOwnPropertyDescriptor,i=o&&!e.call({1:2},1);n.f=i?function(t){var n=o(this,t);return!!n&&n.enumerable}:e},function(t,n,r){var e=r(6),o=r(2),i=r(40);t.exports=!e&&!o((function(){return 7!=Object.defineProperty(i("div"),"a",{get:function(){return 7}}).a}))},function(t,n,r){var e=r(1),o=r(7),i=e.document,u=o(i)&&o(i.createElement);t.exports=function(t){return u?i.createElement(t):{}}},function(t,n,r){var e=r(17);t.exports=e("native-function-to-string",Function.toString)},function(t,n,r){var e=r(3),o=r(75),i=r(21),u=r(4);t.exports=function(t,n){for(var r=o(n),c=u.f,a=i.f,f=0;f<r.length;f++){var s=r[f];e(t,s)||c(t,s,a(n,s))}}},function(t,n,r){t.exports=r(1)},function(t,n,r){var e=r(3),o=r(11),i=r(45).indexOf,u=r(25);t.exports=function(t,n){var r,c=o(t),a=0,f=[];for(r in c)!e(u,r)&&e(c,r)&&f.push(r);for(;n.length>a;)e(c,r=n[a++])&&(~i(f,r)||f.push(r));return f}},function(t,n,r){var e=r(11),o=r(14),i=r(46),u=function(t){return function(n,r,u){var c,a=e(n),f=o(a.length),s=i(u,f);if(t&&r!=r){for(;f>s;)if((c=a[s++])!=c)return!0}else for(;f>s;s++)if((t||s in a)&&a[s]===r)return t||s||0;return!t&&-1}};t.exports={includes:u(!0),indexOf:u(!1)}},function(t,n,r){var e=r(27),o=Math.max,i=Math.min;t.exports=function(t,n){var r=e(t);return r<0?o(r+n,0):i(r,n)}},function(t,n){n.f=Object.getOwnPropertySymbols},function(t,n,r){var e=r(2);t.exports=!!Object.getOwnPropertySymbols&&!e((function(){return!String(Symbol())}))},function(t,n,r){var e=r(44),o=r(34);t.exports=Object.keys||function(t){return e(t,o)}},function(t,n,r){n.f=r(0)},function(t,n,r){var e=r(43),o=r(3),i=r(50),u=r(4).f;t.exports=function(t){var n=e.Symbol||(e.Symbol={});o(n,t)||u(n,t,{value:i.f(t)})}},function(t,n,r){var e=r(53);t.exports=function(t,n,r){if(e(t),void 0===n)return t;switch(r){case 0:return function(){return t.call(n)};case 1:return function(r){return t.call(n,r)};case 2:return function(r,e){return t.call(n,r,e)};case 3:return function(r,e,o){return t.call(n,r,e,o)}}return function(){return t.apply(n,arguments)}}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(String(t)+" is not a function");return t}},function(t,n,r){"use strict";var e=r(16),o=r(4),i=r(15);t.exports=function(t,n,r){var u=e(n);u in t?o.f(t,u,i(0,r)):t[u]=r}},function(t,n,r){var e=r(12),o=r(0)("toStringTag"),i="Arguments"==e(function(){return arguments}());t.exports=function(t){var n,r,u;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),o))?r:i?e(n):"Object"==(u=e(n))&&"function"==typeof n.callee?"Arguments":u}},function(t,n,r){"use strict";var e=r(11),o=r(90),i=r(20),u=r(23),c=r(57),a=u.set,f=u.getterFor("Array Iterator");t.exports=c(Array,"Array",(function(t,n){a(this,{type:"Array Iterator",target:e(t),index:0,kind:n})}),(function(){var t=f(this),n=t.target,r=t.kind,e=t.index++;return!n||e>=n.length?(t.target=void 0,{value:void 0,done:!0}):"keys"==r?{value:e,done:!1}:"values"==r?{value:n[e],done:!1}:{value:[e,n[e]],done:!1}}),"values"),i.Arguments=i.Array,o("keys"),o("values"),o("entries")},function(t,n,r){"use strict";var e=r(9),o=r(91),i=r(59),u=r(60),c=r(36),a=r(8),f=r(10),s=r(0),l=r(22),p=r(20),v=r(58),g=v.IteratorPrototype,h=v.BUGGY_SAFARI_ITERATORS,y=s("iterator"),d=function(){return this};t.exports=function(t,n,r,s,v,x,b){o(r,n,s);var m,w,S,O=function(t){if(t===v&&M)return M;if(!h&&t in I)return I[t];switch(t){case"keys":case"values":case"entries":return function(){return new r(this,t)}}return function(){return new r(this)}},j=n+" Iterator",A=!1,I=t.prototype,E=I[y]||I["@@iterator"]||v&&I[v],M=!h&&E||O(v),T="Array"==n&&I.entries||E;if(T&&(m=i(T.call(new t)),g!==Object.prototype&&m.next&&(l||i(m)===g||(u?u(m,g):"function"!=typeof m[y]&&a(m,y,d)),c(m,j,!0,!0),l&&(p[j]=d))),"values"==v&&E&&"values"!==E.name&&(A=!0,M=function(){return E.call(this)}),l&&!b||I[y]===M||a(I,y,M),p[n]=M,v)if(w={values:O("values"),keys:x?M:O("keys"),entries:O("entries")},b)for(S in w)(h||A||!(S in I))&&f(I,S,w[S]);else e({target:n,proto:!0,forced:h||A},w);return w}},function(t,n,r){"use strict";var e,o,i,u=r(59),c=r(8),a=r(3),f=r(0),s=r(22),l=f("iterator"),p=!1;[].keys&&("next"in(i=[].keys())?(o=u(u(i)))!==Object.prototype&&(e=o):p=!0),null==e&&(e={}),s||a(e,l)||c(e,l,(function(){return this})),t.exports={IteratorPrototype:e,BUGGY_SAFARI_ITERATORS:p}},function(t,n,r){var e=r(3),o=r(19),i=r(24),u=r(92),c=i("IE_PROTO"),a=Object.prototype;t.exports=u?Object.getPrototypeOf:function(t){return t=o(t),e(t,c)?t[c]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,n,r){var e=r(5),o=r(93);t.exports=Object.setPrototypeOf||("__proto__"in{}?function(){var t,n=!1,r={};try{(t=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(r,[]),n=r instanceof Array}catch(t){}return function(r,i){return e(r),o(i),n?t.call(r,i):r.__proto__=i,r}}():void 0)},function(t,n,r){"use strict";var e=r(9),o=r(31),i=r(11),u=r(62),c=[].join,a=o!=Object,f=u("join",",");e({target:"Array",proto:!0,forced:a||f},{join:function(t){return c.call(i(this),void 0===t?",":t)}})},function(t,n,r){"use strict";var e=r(2);t.exports=function(t,n){var r=[][t];return!r||!e((function(){r.call(null,n||function(){throw 1},1)}))}},function(t,n,r){var e=r(7),o=r(60);t.exports=function(t,n,r){var i,u;return o&&"function"==typeof(i=n.constructor)&&i!==r&&e(u=i.prototype)&&u!==r.prototype&&o(t,u),t}},function(t,n,r){var e=r(7),o=r(12),i=r(0)("match");t.exports=function(t){var n;return e(t)&&(void 0!==(n=t[i])?!!n:"RegExp"==o(t))}},function(t,n,r){"use strict";var e=r(9),o=r(30);e({target:"RegExp",proto:!0,forced:/./.exec!==o},{exec:o})},function(t,n,r){var e=r(27),o=r(13),i=function(t){return function(n,r){var i,u,c=String(o(n)),a=e(r),f=c.length;return a<0||a>=f?t?"":void 0:(i=c.charCodeAt(a))<55296||i>56319||a+1===f||(u=c.charCodeAt(a+1))<56320||u>57343?t?c.charAt(a):i:t?c.slice(a,a+2):u-56320+(i-55296<<10)+65536}};t.exports={codeAt:i(!1),charAt:i(!0)}},function(t,n,r){"use strict";var e=r(68),o=r(5),i=r(19),u=r(14),c=r(27),a=r(13),f=r(69),s=r(70),l=Math.max,p=Math.min,v=Math.floor,g=/\$([$&'`]|\d\d?|<[^>]*>)/g,h=/\$([$&'`]|\d\d?)/g;e("replace",2,(function(t,n,r){return[function(r,e){var o=a(this),i=null==r?void 0:r[t];return void 0!==i?i.call(r,o,e):n.call(String(o),r,e)},function(t,i){var a=r(n,t,this,i);if(a.done)return a.value;var v=o(t),g=String(this),h="function"==typeof i;h||(i=String(i));var y=v.global;if(y){var d=v.unicode;v.lastIndex=0}for(var x=[];;){var b=s(v,g);if(null===b)break;if(x.push(b),!y)break;""===String(b[0])&&(v.lastIndex=f(g,u(v.lastIndex),d))}for(var m,w="",S=0,O=0;O<x.length;O++){b=x[O];for(var j=String(b[0]),A=l(p(c(b.index),g.length),0),I=[],E=1;E<b.length;E++)I.push(void 0===(m=b[E])?m:String(m));var M=b.groups;if(h){var T=[j].concat(I,A,g);void 0!==M&&T.push(M);var P=String(i.apply(void 0,T))}else P=e(j,g,A,I,M,i);A>=S&&(w+=g.slice(S,A)+P,S=A+j.length)}return w+g.slice(S)}];function e(t,r,e,o,u,c){var a=e+t.length,f=o.length,s=h;return void 0!==u&&(u=i(u),s=g),n.call(c,s,(function(n,i){var c;switch(i.charAt(0)){case"$":return"$";case"&":return t;case"`":return r.slice(0,e);case"'":return r.slice(a);case"<":c=u[i.slice(1,-1)];break;default:var s=+i;if(0===s)return n;if(s>f){var l=v(s/10);return 0===l?n:l<=f?void 0===o[l-1]?i.charAt(1):o[l-1]+i.charAt(1):n}c=o[s-1]}return void 0===c?"":c}))}}))},function(t,n,r){"use strict";var e=r(8),o=r(10),i=r(2),u=r(0),c=r(30),a=u("species"),f=!i((function(){var t=/./;return t.exec=function(){var t=[];return t.groups={a:"7"},t},"7"!=="".replace(t,"$<a>")})),s=!i((function(){var t=/(?:)/,n=t.exec;t.exec=function(){return n.apply(this,arguments)};var r="ab".split(t);return 2!==r.length||"a"!==r[0]||"b"!==r[1]}));t.exports=function(t,n,r,l){var p=u(t),v=!i((function(){var n={};return n[p]=function(){return 7},7!=""[t](n)})),g=v&&!i((function(){var n=!1,r=/a/;return"split"===t&&((r={}).constructor={},r.constructor[a]=function(){return r},r.flags="",r[p]=/./[p]),r.exec=function(){return n=!0,null},r[p](""),!n}));if(!v||!g||"replace"===t&&!f||"split"===t&&!s){var h=/./[p],y=r(p,""[t],(function(t,n,r,e,o){return n.exec===c?v&&!o?{done:!0,value:h.call(n,r,e)}:{done:!0,value:t.call(r,n,e)}:{done:!1}})),d=y[0],x=y[1];o(String.prototype,t,d),o(RegExp.prototype,p,2==n?function(t,n){return x.call(t,this,n)}:function(t){return x.call(t,this)}),l&&e(RegExp.prototype[p],"sham",!0)}}},function(t,n,r){"use strict";var e=r(66).charAt;t.exports=function(t,n,r){return n+(r?e(t,n).length:1)}},function(t,n,r){var e=r(12),o=r(30);t.exports=function(t,n){var r=t.exec;if("function"==typeof r){var i=r.call(t,n);if("object"!=typeof i)throw TypeError("RegExp exec method returned something other than an Object or null");return i}if("RegExp"!==e(t))throw TypeError("RegExp#exec called on incompatible receiver");return o.call(t,n)}},function(t,n,r){"use strict";var e=r(9),o=r(1),i=r(22),u=r(6),c=r(48),a=r(2),f=r(3),s=r(28),l=r(7),p=r(5),v=r(19),g=r(11),h=r(16),y=r(15),d=r(29),x=r(49),b=r(18),m=r(78),w=r(47),S=r(21),O=r(4),j=r(38),A=r(8),I=r(10),E=r(17),M=r(24),T=r(25),P=r(33),N=r(0),_=r(50),R=r(51),L=r(36),F=r(23),C=r(79).forEach,k=M("hidden"),D=N("toPrimitive"),G=F.set,V=F.getterFor("Symbol"),$=Object.prototype,U=o.Symbol,q=o.JSON,z=q&&q.stringify,Y=S.f,B=O.f,H=m.f,W=j.f,J=E("symbols"),X=E("op-symbols"),K=E("string-to-symbol-registry"),Q=E("symbol-to-string-registry"),Z=E("wks"),tt=o.QObject,nt=!tt||!tt.prototype||!tt.prototype.findChild,rt=u&&a((function(){return 7!=d(B({},"a",{get:function(){return B(this,"a",{value:7}).a}})).a}))?function(t,n,r){var e=Y($,n);e&&delete $[n],B(t,n,r),e&&t!==$&&B($,n,e)}:B,et=function(t,n){var r=J[t]=d(U.prototype);return G(r,{type:"Symbol",tag:t,description:n}),u||(r.description=n),r},ot=c&&"symbol"==typeof U.iterator?function(t){return"symbol"==typeof t}:function(t){return Object(t)instanceof U},it=function(t,n,r){t===$&&it(X,n,r),p(t);var e=h(n,!0);return p(r),f(J,e)?(r.enumerable?(f(t,k)&&t[k][e]&&(t[k][e]=!1),r=d(r,{enumerable:y(0,!1)})):(f(t,k)||B(t,k,y(1,{})),t[k][e]=!0),rt(t,e,r)):B(t,e,r)},ut=function(t,n){p(t);var r=g(n),e=x(r).concat(st(r));return C(e,(function(n){u&&!ct.call(r,n)||it(t,n,r[n])})),t},ct=function(t){var n=h(t,!0),r=W.call(this,n);return!(this===$&&f(J,n)&&!f(X,n))&&(!(r||!f(this,n)||!f(J,n)||f(this,k)&&this[k][n])||r)},at=function(t,n){var r=g(t),e=h(n,!0);if(r!==$||!f(J,e)||f(X,e)){var o=Y(r,e);return!o||!f(J,e)||f(r,k)&&r[k][e]||(o.enumerable=!0),o}},ft=function(t){var n=H(g(t)),r=[];return C(n,(function(t){f(J,t)||f(T,t)||r.push(t)})),r},st=function(t){var n=t===$,r=H(n?X:g(t)),e=[];return C(r,(function(t){!f(J,t)||n&&!f($,t)||e.push(J[t])})),e};c||(I((U=function(){if(this instanceof U)throw TypeError("Symbol is not a constructor");var t=arguments.length&&void 0!==arguments[0]?String(arguments[0]):void 0,n=P(t),r=function(t){this===$&&r.call(X,t),f(this,k)&&f(this[k],n)&&(this[k][n]=!1),rt(this,n,y(1,t))};return u&&nt&&rt($,n,{configurable:!0,set:r}),et(n,t)}).prototype,"toString",(function(){return V(this).tag})),j.f=ct,O.f=it,S.f=at,b.f=m.f=ft,w.f=st,u&&(B(U.prototype,"description",{configurable:!0,get:function(){return V(this).description}}),i||I($,"propertyIsEnumerable",ct,{unsafe:!0})),_.f=function(t){return et(N(t),t)}),e({global:!0,wrap:!0,forced:!c,sham:!c},{Symbol:U}),C(x(Z),(function(t){R(t)})),e({target:"Symbol",stat:!0,forced:!c},{for:function(t){var n=String(t);if(f(K,n))return K[n];var r=U(n);return K[n]=r,Q[r]=n,r},keyFor:function(t){if(!ot(t))throw TypeError(t+" is not a symbol");if(f(Q,t))return Q[t]},useSetter:function(){nt=!0},useSimple:function(){nt=!1}}),e({target:"Object",stat:!0,forced:!c,sham:!u},{create:function(t,n){return void 0===n?d(t):ut(d(t),n)},defineProperty:it,defineProperties:ut,getOwnPropertyDescriptor:at}),e({target:"Object",stat:!0,forced:!c},{getOwnPropertyNames:ft,getOwnPropertySymbols:st}),e({target:"Object",stat:!0,forced:a((function(){w.f(1)}))},{getOwnPropertySymbols:function(t){return w.f(v(t))}}),q&&e({target:"JSON",stat:!0,forced:!c||a((function(){var t=U();return"[null]"!=z([t])||"{}"!=z({a:t})||"{}"!=z(Object(t))}))},{stringify:function(t){for(var n,r,e=[t],o=1;arguments.length>o;)e.push(arguments[o++]);if(r=n=e[1],(l(n)||void 0!==t)&&!ot(t))return s(n)||(n=function(t,n){if("function"==typeof r&&(n=r.call(this,t,n)),!ot(n))return n}),e[1]=n,z.apply(q,e)}}),U.prototype[D]||A(U.prototype,D,U.prototype.valueOf),L(U,"Symbol"),T[k]=!0},function(t,n){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,n,r){var e=r(1),o=r(32),i=e["__core-js_shared__"]||o("__core-js_shared__",{});t.exports=i},function(t,n,r){var e=r(1),o=r(41),i=e.WeakMap;t.exports="function"==typeof i&&/native code/.test(o.call(i))},function(t,n,r){var e=r(26),o=r(18),i=r(47),u=r(5);t.exports=e("Reflect","ownKeys")||function(t){var n=o.f(u(t)),r=i.f;return r?n.concat(r(t)):n}},function(t,n,r){var e=r(6),o=r(4),i=r(5),u=r(49);t.exports=e?Object.defineProperties:function(t,n){i(t);for(var r,e=u(n),c=e.length,a=0;c>a;)o.f(t,r=e[a++],n[r]);return t}},function(t,n,r){var e=r(26);t.exports=e("document","documentElement")},function(t,n,r){var e=r(11),o=r(18).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?function(t){try{return o(t)}catch(t){return u.slice()}}(t):o(e(t))}},function(t,n,r){var e=r(52),o=r(31),i=r(19),u=r(14),c=r(80),a=[].push,f=function(t){var n=1==t,r=2==t,f=3==t,s=4==t,l=6==t,p=5==t||l;return function(v,g,h,y){for(var d,x,b=i(v),m=o(b),w=e(g,h,3),S=u(m.length),O=0,j=y||c,A=n?j(v,S):r?j(v,0):void 0;S>O;O++)if((p||O in m)&&(x=w(d=m[O],O,b),t))if(n)A[O]=x;else if(x)switch(t){case 3:return!0;case 5:return d;case 6:return O;case 2:a.call(A,d)}else if(s)return!1;return l?-1:f||s?s:A}};t.exports={forEach:f(0),map:f(1),filter:f(2),some:f(3),every:f(4),find:f(5),findIndex:f(6)}},function(t,n,r){var e=r(7),o=r(28),i=r(0)("species");t.exports=function(t,n){var r;return o(t)&&("function"!=typeof(r=t.constructor)||r!==Array&&!o(r.prototype)?e(r)&&null===(r=r[i])&&(r=void 0):r=void 0),new(void 0===r?Array:r)(0===n?0:n)}},function(t,n,r){"use strict";var e=r(9),o=r(6),i=r(1),u=r(3),c=r(7),a=r(4).f,f=r(42),s=i.Symbol;if(o&&"function"==typeof s&&(!("description"in s.prototype)||void 0!==s().description)){var l={},p=function(){var t=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),n=this instanceof p?new s(t):void 0===t?s():s(t);return""===t&&(l[n]=!0),n};f(p,s);var v=p.prototype=s.prototype;v.constructor=p;var g=v.toString,h="Symbol(test)"==String(s("test")),y=/^Symbol\((.*)\)[^)]+$/;a(v,"description",{configurable:!0,get:function(){var t=c(this)?this.valueOf():this,n=g.call(t);if(u(l,t))return"";var r=h?n.slice(7,-1):n.replace(y,"$1");return""===r?void 0:r}}),e({global:!0,forced:!0},{Symbol:p})}},function(t,n,r){r(51)("iterator")},function(t,n,r){var e=r(9),o=r(84);e({target:"Array",stat:!0,forced:!r(88)((function(t){Array.from(t)}))},{from:o})},function(t,n,r){"use strict";var e=r(52),o=r(19),i=r(85),u=r(86),c=r(14),a=r(54),f=r(87);t.exports=function(t){var n,r,s,l,p,v=o(t),g="function"==typeof this?this:Array,h=arguments.length,y=h>1?arguments[1]:void 0,d=void 0!==y,x=0,b=f(v);if(d&&(y=e(y,h>2?arguments[2]:void 0,2)),null==b||g==Array&&u(b))for(r=new g(n=c(v.length));n>x;x++)a(r,x,d?y(v[x],x):v[x]);else for(p=(l=b.call(v)).next,r=new g;!(s=p.call(l)).done;x++)a(r,x,d?i(l,y,[s.value,x],!0):s.value);return r.length=x,r}},function(t,n,r){var e=r(5);t.exports=function(t,n,r,o){try{return o?n(e(r)[0],r[1]):n(r)}catch(n){var i=t.return;throw void 0!==i&&e(i.call(t)),n}}},function(t,n,r){var e=r(0),o=r(20),i=e("iterator"),u=Array.prototype;t.exports=function(t){return void 0!==t&&(o.Array===t||u[i]===t)}},function(t,n,r){var e=r(55),o=r(20),i=r(0)("iterator");t.exports=function(t){if(null!=t)return t[i]||t["@@iterator"]||o[e(t)]}},function(t,n,r){var e=r(0)("iterator"),o=!1;try{var i=0,u={next:function(){return{done:!!i++}},return:function(){o=!0}};u[e]=function(){return this},Array.from(u,(function(){throw 2}))}catch(t){}t.exports=function(t,n){if(!n&&!o)return!1;var r=!1;try{var i={};i[e]=function(){return{next:function(){return{done:r=!0}}}},t(i)}catch(t){}return r}},function(t,n,r){r(9)({target:"Array",stat:!0},{isArray:r(28)})},function(t,n,r){var e=r(0),o=r(29),i=r(8),u=e("unscopables"),c=Array.prototype;null==c[u]&&i(c,u,o(null)),t.exports=function(t){c[u][t]=!0}},function(t,n,r){"use strict";var e=r(58).IteratorPrototype,o=r(29),i=r(15),u=r(36),c=r(20),a=function(){return this};t.exports=function(t,n,r){var f=n+" Iterator";return t.prototype=o(e,{next:i(1,r)}),u(t,f,!1,!0),c[f]=a,t}},function(t,n,r){var e=r(2);t.exports=!e((function(){function t(){}return t.prototype.constructor=null,Object.getPrototypeOf(new t)!==t.prototype}))},function(t,n,r){var e=r(7);t.exports=function(t){if(!e(t)&&null!==t)throw TypeError("Can't set "+String(t)+" as a prototype");return t}},function(t,n,r){"use strict";var e=r(9),o=r(7),i=r(28),u=r(46),c=r(14),a=r(11),f=r(54),s=r(95),l=r(0)("species"),p=[].slice,v=Math.max;e({target:"Array",proto:!0,forced:!s("slice")},{slice:function(t,n){var r,e,s,g=a(this),h=c(g.length),y=u(t,h),d=u(void 0===n?h:n,h);if(i(g)&&("function"!=typeof(r=g.constructor)||r!==Array&&!i(r.prototype)?o(r)&&null===(r=r[l])&&(r=void 0):r=void 0,r===Array||void 0===r))return p.call(g,y,d);for(e=new(void 0===r?Array:r)(v(d-y,0)),s=0;y<d;y++,s++)y in g&&f(e,s,g[y]);return e.length=s,e}})},function(t,n,r){var e=r(2),o=r(0),i=r(96),u=o("species");t.exports=function(t){return i>=51||!e((function(){var n=[];return(n.constructor={})[u]=function(){return{foo:1}},1!==n[t](Boolean).foo}))}},function(t,n,r){var e,o,i=r(1),u=r(97),c=i.process,a=c&&c.versions,f=a&&a.v8;f?o=(e=f.split("."))[0]+e[1]:u&&(e=u.match(/Chrome\/(\d+)/))&&(o=e[1]),t.exports=o&&+o},function(t,n,r){var e=r(26);t.exports=e("navigator","userAgent")||""},function(t,n,r){var e=r(10),o=Date.prototype,i=o.toString,u=o.getTime;new Date(NaN)+""!="Invalid Date"&&e(o,"toString",(function(){var t=u.call(this);return t==t?i.call(this):"Invalid Date"}))},function(t,n,r){var e=r(6),o=r(4).f,i=Function.prototype,u=i.toString,c=/^\s*function ([^ (]*)/;e&&!("name"in i)&&o(i,"name",{configurable:!0,get:function(){try{return u.call(this).match(c)[1]}catch(t){return""}}})},function(t,n,r){"use strict";var e=r(6),o=r(1),i=r(35),u=r(10),c=r(3),a=r(12),f=r(63),s=r(16),l=r(2),p=r(29),v=r(18).f,g=r(21).f,h=r(4).f,y=r(101).trim,d=o.Number,x=d.prototype,b="Number"==a(p(x)),m=function(t){var n,r,e,o,i,u,c,a,f=s(t,!1);if("string"==typeof f&&f.length>2)if(43===(n=(f=y(f)).charCodeAt(0))||45===n){if(88===(r=f.charCodeAt(2))||120===r)return NaN}else if(48===n){switch(f.charCodeAt(1)){case 66:case 98:e=2,o=49;break;case 79:case 111:e=8,o=55;break;default:return+f}for(u=(i=f.slice(2)).length,c=0;c<u;c++)if((a=i.charCodeAt(c))<48||a>o)return NaN;return parseInt(i,e)}return+f};if(i("Number",!d(" 0o1")||!d("0b1")||d("+0x1"))){for(var w,S=function(t){var n=arguments.length<1?0:t,r=this;return r instanceof S&&(b?l((function(){x.valueOf.call(r)})):"Number"!=a(r))?f(new d(m(n)),r,S):m(n)},O=e?v(d):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),j=0;O.length>j;j++)c(d,w=O[j])&&!c(S,w)&&h(S,w,g(d,w));S.prototype=x,x.constructor=S,u(o,"Number",S)}},function(t,n,r){var e=r(13),o="["+r(102)+"]",i=RegExp("^"+o+o+"*"),u=RegExp(o+o+"*$"),c=function(t){return function(n){var r=String(e(n));return 1&t&&(r=r.replace(i,"")),2&t&&(r=r.replace(u,"")),r}};t.exports={start:c(1),end:c(2),trim:c(3)}},function(t,n){t.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},function(t,n,r){var e=r(10),o=r(104),i=Object.prototype;o!==i.toString&&e(i,"toString",o,{unsafe:!0})},function(t,n,r){"use strict";var e=r(55),o={};o[r(0)("toStringTag")]="z",t.exports="[object z]"!==String(o)?function(){return"[object "+e(this)+"]"}:o.toString},function(t,n,r){var e=r(6),o=r(1),i=r(35),u=r(63),c=r(4).f,a=r(18).f,f=r(64),s=r(37),l=r(10),p=r(2),v=r(106),g=r(0)("match"),h=o.RegExp,y=h.prototype,d=/a/g,x=/a/g,b=new h(d)!==d;if(e&&i("RegExp",!b||p((function(){return x[g]=!1,h(d)!=d||h(x)==x||"/a/i"!=h(d,"i")})))){for(var m=function(t,n){var r=this instanceof m,e=f(t),o=void 0===n;return!r&&e&&t.constructor===m&&o?t:u(b?new h(e&&!o?t.source:t,n):h((e=t instanceof m)?t.source:t,e&&o?s.call(t):n),r?this:y,m)},w=function(t){t in m||c(m,t,{configurable:!0,get:function(){return h[t]},set:function(n){h[t]=n}})},S=a(h),O=0;S.length>O;)w(S[O++]);y.constructor=m,m.prototype=y,l(o,"RegExp",m)}v("RegExp")},function(t,n,r){"use strict";var e=r(26),o=r(4),i=r(0),u=r(6),c=i("species");t.exports=function(t){var n=e(t),r=o.f;u&&n&&!n[c]&&r(n,c,{configurable:!0,get:function(){return this}})}},function(t,n,r){"use strict";var e=r(10),o=r(5),i=r(2),u=r(37),c=RegExp.prototype,a=c.toString,f=i((function(){return"/a/b"!=a.call({source:"a",flags:"b"})})),s="toString"!=a.name;(f||s)&&e(RegExp.prototype,"toString",(function(){var t=o(this),n=String(t.source),r=t.flags;return"/"+n+"/"+String(void 0===r&&t instanceof RegExp&&!("flags"in c)?u.call(t):r)}),{unsafe:!0})},function(t,n,r){"use strict";var e=r(66).charAt,o=r(23),i=r(57),u=o.set,c=o.getterFor("String Iterator");i(String,"String",(function(t){u(this,{type:"String Iterator",string:String(t),index:0})}),(function(){var t,n=c(this),r=n.string,o=n.index;return o>=r.length?{value:void 0,done:!0}:(t=e(r,o),n.index+=t.length,{value:t,done:!1})}))},function(t,n,r){"use strict";var e=r(68),o=r(64),i=r(5),u=r(13),c=r(110),a=r(69),f=r(14),s=r(70),l=r(30),p=r(2),v=[].push,g=Math.min,h=!p((function(){return!RegExp(4294967295,"y")}));e("split",2,(function(t,n,r){var e;return e="c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length?function(t,r){var e=String(u(this)),i=void 0===r?4294967295:r>>>0;if(0===i)return[];if(void 0===t)return[e];if(!o(t))return n.call(e,t,i);for(var c,a,f,s=[],p=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),g=0,h=new RegExp(t.source,p+"g");(c=l.call(h,e))&&!((a=h.lastIndex)>g&&(s.push(e.slice(g,c.index)),c.length>1&&c.index<e.length&&v.apply(s,c.slice(1)),f=c[0].length,g=a,s.length>=i));)h.lastIndex===c.index&&h.lastIndex++;return g===e.length?!f&&h.test("")||s.push(""):s.push(e.slice(g)),s.length>i?s.slice(0,i):s}:"0".split(void 0,0).length?function(t,r){return void 0===t&&0===r?[]:n.call(this,t,r)}:n,[function(n,r){var o=u(this),i=null==n?void 0:n[t];return void 0!==i?i.call(n,o,r):e.call(String(o),n,r)},function(t,o){var u=r(e,t,this,o,e!==n);if(u.done)return u.value;var l=i(t),p=String(this),v=c(l,RegExp),y=l.unicode,d=(l.ignoreCase?"i":"")+(l.multiline?"m":"")+(l.unicode?"u":"")+(h?"y":"g"),x=new v(h?l:"^(?:"+l.source+")",d),b=void 0===o?4294967295:o>>>0;if(0===b)return[];if(0===p.length)return null===s(x,p)?[p]:[];for(var m=0,w=0,S=[];w<p.length;){x.lastIndex=h?w:0;var O,j=s(x,h?p:p.slice(w));if(null===j||(O=g(f(x.lastIndex+(h?0:w)),p.length))===m)w=a(p,w,y);else{if(S.push(p.slice(m,w)),S.length===b)return S;for(var A=1;A<=j.length-1;A++)if(S.push(j[A]),S.length===b)return S;w=m=O}}return S.push(p.slice(m)),S}]}),!h)},function(t,n,r){var e=r(5),o=r(53),i=r(0)("species");t.exports=function(t,n){var r,u=e(t).constructor;return void 0===u||null==(r=e(u)[i])?n:o(r)}},function(t,n,r){var e=r(1),o=r(112),i=r(56),u=r(8),c=r(0),a=c("iterator"),f=c("toStringTag"),s=i.values;for(var l in o){var p=e[l],v=p&&p.prototype;if(v){if(v[a]!==s)try{u(v,a,s)}catch(t){v[a]=s}if(v[f]||u(v,f,l),o[l])for(var g in i)if(v[g]!==i[g])try{u(v,g,i[g])}catch(t){v[g]=i[g]}}}},function(t,n){t.exports={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0}},function(t,n,r){"use strict";var e=r(9),o=r(45).indexOf,i=r(62),u=[].indexOf,c=!!u&&1/[1].indexOf(1,-0)<0,a=i("indexOf");e({target:"Array",proto:!0,forced:c||a},{indexOf:function(t){return c?u.apply(this,arguments)||0:o(this,t,arguments.length>1?arguments[1]:void 0)}})},function(t,n,r){"use strict";r.r(n);r(71),r(81),r(82),r(83),r(89),r(56),r(61),r(94),r(98),r(99),r(100),r(103),r(105),r(65),r(107),r(108),r(67),r(109),r(111),r(113);function e(t){var n="8AMN6Z9EFGd23hijkHI4eJfgVrBC7DLO5stuvwWqKPSTUXYabclmnopQRxyz01";if(!t)return n;for(var r=0;r<t.length;r++){var e=+t[r],o=n.substr(e,5);n=n.replace(o,"")+o}return n}function o(t,n){var r=1*n.charAt(0);if(isNaN(r))return"";if(r=1*n.substr(1,r),isNaN(r))return"";var e,o,i=n.length,u=[],c=String(r).length+1,a=function(r){return t.indexOf(n.charAt(r))},f=t.length;if(i!==c+r)return"";for(;c<i;)o=(e=a(c++))<5?e*f+a(c):(e-5)*f*f+a(c)*f+a(c+=1),u[u.length]=String.fromCharCode(o),c++;return u.join("")}function i(t){if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(t=function(t,n){if(!t)return;if("string"==typeof t)return u(t,n);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return u(t,n)}(t))){var n=0,r=function(){};return{s:r,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var e,o,i=!0,c=!1;return{s:function(){e=t[Symbol.iterator]()},n:function(){var t=e.next();return i=t.done,t},e:function(t){c=!0,o=t},f:function(){try{i||null==e.return||e.return()}finally{if(c)throw o}}}}function u(t,n){(null==n||n>t.length)&&(n=t.length);for(var r=0,e=new Array(n);r<n;r++)e[r]=t[r];return e}window.registerTools=function(){window.Point||(window.Point=window.Le5leTopologyPoint||window.Le5leTopology.Point);var t,n=window.meta2dToolId,r=i(window.meta2dTools);try{for(r.s();!(t=r.n()).done;){var u=t.value,c=void 0;if(u.anchorsFn&&(c=new Function("node",o(e(n),u.anchorsFn))),u.drawFn){var a=o(e(n),u.drawFn);a=a.replace(new RegExp("font.color","gm"),"fontColor");window.registerTopologyNode(u.fullname,new Function("ctx","node",a),c)}}}catch(t){r.e(t)}finally{r.f()}},window.registerToolsNew=function(){var t,n=window.meta2dToolId,r={},u={},c=i(window.meta2dTools);try{for(c.s();!(t=c.n()).done;){var a=t.value,f=void 0;if(a.anchorsFn){var s=o(e(n),a.anchorsFn);s=(s=(s=(s=(s=(s=(s=(s=(s=s.split("(new Point(").join("({")).split("node.rect.x+").join("x:")).split("node.rect.y+").join("y:")).split("*node.rect.width").join("")).split("*node.rect.height").join("")).split(",0)").join("}")).split(",1)").join("}")).split(",2)").join("}")).split(",3)").join("}"),f=new Function("node",s)}if(a.drawFn){var l=o(e(n),a.drawFn);l=(l=l.split("font.color").join("textColor")).split(".rect.").join(".calculative.worldRect."),r[a.fullname]=new Function("ctx","node",l),u[a.fullname]=f}window.meta2d.registerCanvasDraw(r),window.meta2d.registerAnchors(u)}}catch(t){c.e(t)}finally{c.f()}},window.dc=o,window.mk=e,window.arcToCurves=function(t,n,r,e,o,i,u,c,a){if(!r||!e)return[];c-=t,a-=n,r=Math.abs(r),e=Math.abs(e);var f=-c/2,s=-a/2,l=Math.cos(o*Math.PI/180);o=l*f+(x=Math.sin(o*Math.PI/180))*s;var p=(f=-1*x*f+l*s)*f,v=r*r,g=e*e,h=(s=o*o)/v+p/g;1<h?(r*=Math.sqrt(h),e*=Math.sqrt(h),i=0):(h=1,i===u&&(h=-1),i=h*Math.sqrt((v*g-v*p-g*s)/(v*p+g*s))),c=l*(s=i*r*f/e)-x*(p=-1*i*e*o/r)+c/2,a=x*s+l*p+a/2,i=0<=(v=Math.atan2((f-p)/e,(o-s)/r)-Math.atan2(0,1))?v:2*Math.PI+v,o=0<=(v=Math.atan2((-f-p)/e,(-o-s)/r)-Math.atan2((f-p)/e,(o-s)/r))?v:2*Math.PI+v,0==u&&0<o?o-=2*Math.PI:0!=u&&0>o&&(o+=2*Math.PI),u=2*o/Math.PI,o/=u=Math.ceil(0>u?-1*u:u),f=8/3*Math.sin(o/4)*Math.sin(o/4)/Math.sin(o/2),s=l*r,l*=e,r*=x,e*=x;var y=Math.cos(i),d=Math.sin(i);p=-f*(s*d+e*y),v=-f*(r*d-l*y);for(var x=[],b=0;b<u;++b){i+=o,g=s*(y=Math.cos(i))-e*(d=Math.sin(i))+c,h=r*y+l*d+a;var m=-f*(s*d+e*y);y=-f*(r*d-l*y),x[d=6*b]=Number(p+t),x[d+1]=Number(v+n),x[d+2]=Number(g-m+t),x[d+3]=Number(h-y+n),x[d+4]=Number(g+t),x[d+5]=Number(h+n),p=g+m,v=h+y}return x}}])}));