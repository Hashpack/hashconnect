(self.webpackChunkdapp=self.webpackChunkdapp||[]).push([[15],{60015:(t,n,e)=>{"use strict";e.r(n),e.d(n,{encrypt:()=>f,decrypt:()=>p,generateIv:()=>s});var r=e(82291),o=function(){return(o=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)},u=function(t,n,e,r){return new(e||(e=Promise))(function(o,u){function i(t){try{c(r.next(t))}catch(n){u(n)}}function a(t){try{c(r.throw(t))}catch(n){u(n)}}function c(t){var n;t.done?o(t.value):(n=t.value,n instanceof e?n:new e(function(t){t(n)})).then(i,a)}c((r=r.apply(t,n||[])).next())})},i=function(t,n){var e,r,o,u,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return u={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(u[Symbol.iterator]=function(){return this}),u;function a(u){return function(a){return function(u){if(e)throw new TypeError("Generator is already executing.");for(;i;)try{if(e=1,r&&(o=2&u[0]?r.return:u[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,u[1])).done)return o;switch(r=0,o&&(u=[2&u[0],o.value]),u[0]){case 0:case 1:o=u;break;case 4:return i.label++,{value:u[1],done:!1};case 5:i.label++,r=u[1],u=[0];continue;case 7:u=i.ops.pop(),i.trys.pop();continue;default:if(!((o=(o=i.trys).length>0&&o[o.length-1])||6!==u[0]&&2!==u[0])){i=0;continue}if(3===u[0]&&(!o||u[1]>o[0]&&u[1]<o[3])){i.label=u[1];break}if(6===u[0]&&i.label<o[1]){i.label=o[1],o=u;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(u);break}o[2]&&i.ops.pop(),i.trys.pop();continue}u=n.call(t,i)}catch(a){u=[6,a],r=0}finally{e=o=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,a])}}},a=window.crypto||window.msCrypto,c=a.subtle||a.webkitSubtle,l={name:"AES-GCM",length:128};if(void 0===c)throw new Error("Failed to load Subtle CryptoAPI");function f(t,n,e){return u(this,void 0,void 0,function(){return i(this,function(r){return[2,c.importKey("raw",n,l,!1,["encrypt"]).then(function(n){return c.encrypt(o({iv:t},l),n,e)}).then(Buffer.from)]})})}function p(t,n,e){return u(this,void 0,void 0,function(){return i(this,function(r){return[2,c.importKey("raw",n,l,!1,["decrypt"]).then(function(n){return c.decrypt(o({iv:t},l),n,e)}).then(Buffer.from)]})})}function s(){var t=new Uint8Array(r.Sh);return a.getRandomValues(t),t}}}]);