(self.webpackChunkdapp=self.webpackChunkdapp||[]).push([[65],{23065:function(n,t,r){"use strict";r.r(t),r.d(t,{encrypt:function(){return p},decrypt:function(){return s},generateIv:function(){return d}});var e=r(88774),u=r.n(e),o=r(70677),c=function(n,t,r,e){return new(r||(r=Promise))(function(u,o){function c(n){try{a(e.next(n))}catch(t){o(t)}}function i(n){try{a(e.throw(n))}catch(t){o(t)}}function a(n){var t;n.done?u(n.value):(t=n.value,t instanceof r?t:new r(function(n){n(t)})).then(c,i)}a((e=e.apply(n,t||[])).next())})},i=window.crypto||window.msCrypto,a=i.subtle||i.webkitSubtle,f={name:"AES-GCM",length:128};if(void 0===a)throw new Error("Failed to load Subtle CryptoAPI");function p(n,t,r){return c(this,void 0,void 0,u().mark(function e(){return u().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",a.importKey("raw",t,f,!1,["encrypt"]).then(function(t){return a.encrypt(Object.assign({iv:n},f),t,r)}).then(Buffer.from));case 1:case"end":return e.stop()}},e)}))}function s(n,t,r){return c(this,void 0,void 0,u().mark(function e(){return u().wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",a.importKey("raw",t,f,!1,["decrypt"]).then(function(t){return a.decrypt(Object.assign({iv:n},f),t,r)}).then(Buffer.from));case 1:case"end":return e.stop()}},e)}))}function d(){var n=new Uint8Array(o.Sh);return i.getRandomValues(n),n}}}]);