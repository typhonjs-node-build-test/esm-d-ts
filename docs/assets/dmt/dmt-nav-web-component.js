function t(){}function e(t){return t()}function s(){return Object.create(null)}function n(t){t.forEach(e)}function o(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function i(t,e){t.appendChild(e)}function a(t,e,s){t.insertBefore(e,s||null)}function l(t){t.parentNode&&t.parentNode.removeChild(t)}function c(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function d(){return t=" ",document.createTextNode(t);var t}function u(t,e,s){null==s?t.removeAttribute(e):t.getAttribute(e)!==s&&t.setAttribute(e,s)}let h;function p(t){h=t}function f(t){(function(){if(!h)throw new Error("Function called outside component initialization");return h})().$$.on_mount.push(t)}const m=[],_=[];let g=[];const v=[],b=Promise.resolve();let w=!1;function y(t){g.push(t)}const $=new Set;let x=0;function k(){if(0!==x)return;const t=h;do{try{for(;x<m.length;){const t=m[x];x++,p(t),C(t.$$)}}catch(t){throw m.length=0,x=0,t}for(p(null),m.length=0,x=0;_.length;)_.pop()();for(let t=0;t<g.length;t+=1){const e=g[t];$.has(e)||($.add(e),e())}g.length=0}while(m.length);for(;v.length;)v.pop()();w=!1,$.clear(),p(t)}function C(t){if(null!==t.fragment){t.update(),n(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(y)}}const j=new Set;function S(t,e){const s=t.$$;null!==s.fragment&&(!function(t){const e=[],s=[];g.forEach((n=>-1===t.indexOf(n)?e.push(n):s.push(n))),s.forEach((t=>t())),g=e}(s.after_update),n(s.on_destroy),s.fragment&&s.fragment.d(e),s.on_destroy=s.fragment=null,s.ctx=[])}function B(t,e){-1===t.$$.dirty[0]&&(m.push(t),w||(w=!0,b.then(k)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function T(r,i,a,c,d,u,f=null,m=[-1]){const _=h;p(r);const g=r.$$={fragment:null,ctx:[],props:u,update:t,not_equal:d,bound:s(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(i.context||(_?_.$$.context:[])),callbacks:s(),dirty:m,skip_bound:!1,root:i.target||_.$$.root};f&&f(g.root);let v=!1;if(g.ctx=a?a(r,i.props||{},((t,e,...s)=>{const n=s.length?s[0]:e;return g.ctx&&d(g.ctx[t],g.ctx[t]=n)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](n),v&&B(r,t)),e})):[],g.update(),v=!0,n(g.before_update),g.fragment=!!c&&c(g.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);g.fragment&&g.fragment.l(t),t.forEach(l)}else g.fragment&&g.fragment.c();i.intro&&((b=r.$$.fragment)&&b.i&&(j.delete(b),b.i(w))),function(t,s,r){const{fragment:i,after_update:a}=t.$$;i&&i.m(s,r),y((()=>{const s=t.$$.on_mount.map(e).filter(o);t.$$.on_destroy?t.$$.on_destroy.push(...s):n(s),t.$$.on_mount=[]})),a.forEach(y)}(r,i.target,i.anchor),k()}var b,w;p(_)}class H{$$=void 0;$$set=void 0;$destroy(){S(this,1),this.$destroy=t}$on(e,s){if(!o(s))return t;const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(s),()=>{const t=n.indexOf(s);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function D(e){const s={};for(const t in e)s[t]=[n(e[t])];function n(e){return function(){return{c:t,m:function(t,s){a(t,e.cloneNode(!0),s)},d:function(t){t&&e.innerHTML&&l(e)},l:t}}}return s}function E(e){let s,n,o,r,h,p;return{c(){var t,e,i,a,l;s=c("svg"),n=c("g"),o=c("rect"),r=c("path"),h=d(),t="nav",p=document.createElement(t),p.innerHTML='<ul class="tsd-small-nested-navigation"><li><details class="tsd-index-accordion" data-key="@typhonjs-build-test/esm-d-ts"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg><a href="modules/_typhonjs_build_test_esm_d_ts.html"><span>@typhonjs-<wbr/>build-<wbr/>test/esm-<wbr/>d-<wbr/>ts</span></a></summary> <div class="tsd-accordion-details"><ul class="tsd-nested-navigation"><li><details class="tsd-index-accordion" data-key="@typhonjs-build-test/esm-d-ts.generateDTS"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg><a href="modules/_typhonjs_build_test_esm_d_ts.generateDTS.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4"></use></svg><span>generateDTS</span></a></summary> <div class="tsd-accordion-details"><ul class="tsd-nested-navigation"><li><a href="functions/_typhonjs_build_test_esm_d_ts.generateDTS.plugin.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><g id="icon-64"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-function)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><path d="M9.39 16V7.24H14.55V8.224H10.446V11.128H14.238V12.112H10.47V16H9.39Z" fill="var(--color-text)"></path></g></svg><span>plugin</span></a></li></ul></div></details></li> <li><a href="types/_typhonjs_build_test_esm_d_ts.GenerateConfig.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><g id="icon-4194304"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-type-alias)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><path d="M11.31 16V8.224H8.91V7.24H14.79V8.224H12.39V16H11.31Z" fill="var(--color-text)"></path></g></svg><span>Generate<wbr/>Config</span></a></li> <li><a href="types/_typhonjs_build_test_esm_d_ts.GeneratePluginConfig.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4194304"></use></svg><span>Generate<wbr/>Plugin<wbr/>Config</span></a></li> <li><a href="types/_typhonjs_build_test_esm_d_ts.ProcessedConfig.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4194304"></use></svg><span>Processed<wbr/>Config</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts.checkDTS.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>checkDTS</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts.generateDTS-1.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>generateDTS</span></a></li></ul></div></details></li> <li><details class="tsd-index-accordion" data-key="@typhonjs-build-test/esm-d-ts/postprocess"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg><a href="modules/_typhonjs_build_test_esm_d_ts_postprocess.html"><span>@typhonjs-<wbr/>build-<wbr/>test/esm-<wbr/>d-<wbr/>ts/postprocess</span></a></summary> <div class="tsd-accordion-details"><ul class="tsd-nested-navigation"><li><a href="classes/_typhonjs_build_test_esm_d_ts_postprocess.DependencyParser.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><g id="icon-128"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-class)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6"></rect><path d="M11.898 16.1201C11.098 16.1201 10.466 15.8961 10.002 15.4481C9.53803 15.0001 9.30603 14.3841 9.30603 13.6001V9.64012C9.30603 8.85612 9.53803 8.24012 10.002 7.79212C10.466 7.34412 11.098 7.12012 11.898 7.12012C12.682 7.12012 13.306 7.34812 13.77 7.80412C14.234 8.25212 14.466 8.86412 14.466 9.64012H13.386C13.386 9.14412 13.254 8.76412 12.99 8.50012C12.734 8.22812 12.37 8.09212 11.898 8.09212C11.426 8.09212 11.054 8.22412 10.782 8.48812C10.518 8.75212 10.386 9.13212 10.386 9.62812V13.6001C10.386 14.0961 10.518 14.4801 10.782 14.7521C11.054 15.0161 11.426 15.1481 11.898 15.1481C12.37 15.1481 12.734 15.0161 12.99 14.7521C13.254 14.4801 13.386 14.0961 13.386 13.6001H14.466C14.466 14.3761 14.234 14.9921 13.77 15.4481C13.306 15.8961 12.682 16.1201 11.898 16.1201Z" fill="var(--color-text)"></path></g></svg><span>Dependency<wbr/>Parser</span></a></li> <li><a href="classes/_typhonjs_build_test_esm_d_ts_postprocess.GraphAnalysis.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-128"></use></svg><span>Graph<wbr/>Analysis</span></a></li> <li><a href="classes/_typhonjs_build_test_esm_d_ts_postprocess.PostProcess.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-128"></use></svg><span>Post<wbr/>Process</span></a></li> <li><a href="types/_typhonjs_build_test_esm_d_ts_postprocess.DependencyGraphJSON.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4194304"></use></svg><span>Dependency<wbr/>GraphJSON</span></a></li> <li><a href="types/_typhonjs_build_test_esm_d_ts_postprocess.DependencyNodes.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4194304"></use></svg><span>Dependency<wbr/>Nodes</span></a></li> <li><a href="types/_typhonjs_build_test_esm_d_ts_postprocess.ProcessorFunction.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-4194304"></use></svg><span>Processor<wbr/>Function</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts_postprocess.processInheritDoc.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>process<wbr/>Inherit<wbr/>Doc</span></a></li></ul></div></details></li> <li><details class="tsd-index-accordion" data-key="@typhonjs-build-test/esm-d-ts/transformer"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg><a href="modules/_typhonjs_build_test_esm_d_ts_transformer.html"><span>@typhonjs-<wbr/>build-<wbr/>test/esm-<wbr/>d-<wbr/>ts/transformer</span></a></summary> <div class="tsd-accordion-details"><ul class="tsd-nested-navigation"><li><a href="functions/_typhonjs_build_test_esm_d_ts_transformer.getLeadingComments.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>get<wbr/>Leading<wbr/>Comments</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts_transformer.jsdocRemoveNodeByTags.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>jsdoc<wbr/>Remove<wbr/>Node<wbr/>By<wbr/>Tags</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts_transformer.jsdocTransformer.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>jsdoc<wbr/>Transformer</span></a></li> <li><a href="functions/_typhonjs_build_test_esm_d_ts_transformer.parseLeadingComments.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-64"></use></svg><span>parse<wbr/>Leading<wbr/>Comments</span></a></li></ul></div></details></li> <li><details class="tsd-index-accordion" data-key="@typhonjs-build-test/esm-d-ts/util"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><use href="#icon-chevronDown"></use></svg><a href="modules/_typhonjs_build_test_esm_d_ts_util.html"><span>@typhonjs-<wbr/>build-<wbr/>test/esm-<wbr/>d-<wbr/>ts/util</span></a></summary> <div class="tsd-accordion-details"><ul class="tsd-nested-navigation"><li><a href="classes/_typhonjs_build_test_esm_d_ts_util.Logger.html"><svg class="tsd-kind-icon" viewBox="0 0 24 24"><use href="#icon-128"></use></svg><span>Logger</span></a></li></ul></div></details></li></ul>',u(o,"fill","var(--color-icon-background)"),u(o,"stroke","var(--color-ts-namespace)"),u(o,"stroke-width","1.5"),u(o,"x","1"),u(o,"y","1"),u(o,"width","22"),u(o,"height","22"),u(o,"rx","6"),u(r,"d","M9.33 16V7.24H10.77L13.446 14.74C13.43 14.54 13.41 14.296 13.386 14.008C13.37 13.712 13.354 13.404 13.338 13.084C13.33 12.756 13.326 12.448 13.326 12.16V7.24H14.37V16H12.93L10.266 8.5C10.282 8.692 10.298 8.936 10.314 9.232C10.33 9.52 10.342 9.828 10.35 10.156C10.366 10.476 10.374 10.784 10.374 11.08V16H9.33Z"),u(r,"fill","var(--color-text)"),u(n,"id","icon-4"),e=s,i="display",null==(a="none")?e.style.removeProperty(i):e.style.setProperty(i,a,l?"important":""),u(p,"class","tsd-navigation")},m(t,e){a(t,s,e),i(s,n),i(n,o),i(n,r),a(t,h,e),a(t,p,e)},p:t,i:t,o:t,d(t){t&&(l(s),l(h),l(p))}}}function L(t,e,s){let n,{pageurl:o}=e;return f((()=>{if("string"==typeof n){const t=globalThis.document.querySelector('wc-dmt-nav a[href$="'+n+'"]');t&&t.classList.add("current")}else console.warn("[typedoc-theme-default-modern] Navigation WC - 'pageURL' not set in 'onMount'.");const t=import.meta.url.replace(/assets\/dmt\/dmt-nav-web-component.js/,""),e=globalThis.location.href.replace(t,""),s=(e.match(/\//)??[]).length,o=e.match(/(.*)\//),r=new Set(["classes","enums","functions","interfaces","modules","types","variables"]);if(1===s&&o){const t=new RegExp("(.*)?/","gm"),e=o[1],s=globalThis.document.querySelector('wc-dmt-nav a[href$="modules.html"]');s&&(s.href="../modules.html");const n=globalThis.document.querySelectorAll('wc-dmt-nav a[href^="'+e+'"]');for(let e=n.length;--e>=0;)n[e].href=n[e].href.replace(t,"");r.delete(e);for(const e of r){const s="../"+e+"/",n=globalThis.document.querySelectorAll('wc-dmt-nav a[href^="'+e+'"]');for(let e=n.length;--e>=0;)n[e].href=n[e].href.replace(t,s)}}})),t.$$set=t=>{"pageurl"in t&&s(0,o=t.pageurl)},t.$$.update=()=>{if(1&t.$$.dirty&&o)try{e=o,n=JSON.parse(e.replace(/\\u003c/g,"<").replace(/\\u003e/g,">").replace(/\\u0026/g,"&").replace(/\\u0027/g,"'").replace(/\\u0022/g,'"'))}catch(t){console.warn("[typedoc-theme-default-modern] Navigation WC - Failure to deserialize pageurl: ",o),console.error(t)}var e},[o]}"undefined"!=typeof window&&(window.__svelte||(window.__svelte={v:new Set})).v.add("4");new function(t){class e extends HTMLElement{constructor(){super(),this.slotcount=0;let e=t.shadow?this.attachShadow({mode:"open"}):this;if(t.href&&t.shadow){let s=document.createElement("link");s.setAttribute("href",t.href),s.setAttribute("rel","stylesheet"),e.appendChild(s)}t.shadow?(this._root=document.createElement("div"),e.appendChild(this._root)):this._root=e}static get observedAttributes(){return t.attributes||[]}connectedCallback(){let e,s=t.defaults?t.defaults:{};if(s.$$scope={},Array.from(this.attributes).forEach((t=>s[t.name]=t.value)),s.$$scope={},t.shadow){e=this.getShadowSlots();let s=t.defaults?t.defaults:{};s.$$scope={},this.observer=new MutationObserver(this.processMutations.bind(this,{root:this._root,props:s})),this.observer.observe(this,{childList:!0,subtree:!0,attributes:!1})}else e=this.getSlots();this.slotcount=Object.keys(e).length,s.$$slots=D(e),this.elem=new t.component({target:this._root,props:s})}disconnectedCallback(){this.observe&&this.observer.disconnect();try{this.elem.$destroy()}catch(t){}}unwrap(t){let e=document.createDocumentFragment();for(;t.firstChild;)e.appendChild(t.removeChild(t.firstChild));return e}getSlots(){const t=this.querySelectorAll("[slot]");let e={};return t.forEach((t=>{e[t.slot]=this.unwrap(t),this.removeChild(t)})),this.innerHTML.length&&(e.default=this.unwrap(this),this.innerHTML=""),e}getShadowSlots(){const t=this.querySelectorAll("[slot]");let e={},s=this.innerHTML.length;return t.forEach((t=>{e[t.slot]=document.createElement("slot"),e[t.slot].setAttribute("name",t.slot),s-=t.outerHTML.length})),s>0&&(e.default=document.createElement("slot")),e}processMutations({root:e,props:s},n){for(let o of n)if("childList"==o.type){let n=this.getShadowSlots();Object.keys(n).length&&(s.$$slots=D(n),this.elem.$set({$$slots:D(n)}),this.slotcount!=Object.keys(n).length&&(Array.from(this.attributes).forEach((t=>s[t.name]=t.value)),this.slotcount=Object.keys(n).length,e.innerHTML="",this.elem=new t.component({target:e,props:s})))}}attributeChangedCallback(t,e,s){this.elem&&s!=e&&this.elem.$set({[t]:s})}}window.customElements.define(t.tagname,e)}({component:class extends H{constructor(t){super(),T(this,t,L,E,r,{pageurl:0})}},tagname:"wc-dmt-nav",attributes:["pageurl"],shadow:!1});
//# sourceMappingURL=dmt-nav-web-component.js.map
