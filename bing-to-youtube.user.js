// ==UserScript==
// @name         Bing Video to YouTube
// @namespace    https://github.com/Eggwite
// @version      1.1
// @description  Redirects Bing video embeds to YouTube and updates search links
// @author       Eggwite
// @match        https://www.bing.com/videos/search*view=detail*
// @match        https://www.bing.com/search*q=*
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    //console.log('[Bing->YouTube] Script loaded');

    function redirectDetailPage() {
        const sourceLink = document.querySelector('.source.tosurl');
        if (!sourceLink) return false;

        const dataInst = sourceLink.getAttribute('data-inst-info');
        if (!dataInst) return false;

        try {
            const info = JSON.parse(dataInst);
            if (info.url) {
                const youtubeUrl = decodeURIComponent(info.url);
                //console.log('[Bing->YouTube] Redirecting detail page to:', youtubeUrl);
                window.location.href = youtubeUrl;
                return true;
            }
        } catch (e) {
            console.error('[Bing->YouTube] JSON parse error on detail page', e);
        }
        return false;
    }

    function rewriteSearchLinks() {
        const videoLinks = document.querySelectorAll('a.mc_vtvc_link');
        videoLinks.forEach(link => {
            const vrhdata = link.querySelector('.vrhdata');
            if (!vrhdata) return;

            try {
                const info = JSON.parse(vrhdata.getAttribute('vrhm').replace(/&quot;/g, '"'));
                if (info.murl) {
                    //console.log('[Bing->YouTube] Rewriting search link to:', info.murl);
                    link.href = info.murl;
                    link.target = '_blank'; // optional: ensure it opens in new tab
                }
            } catch (e) {
                console.error('[Bing->YouTube] JSON parse error on search page', e);
            }
        });
    }

    // Immediate redirect if on detail page
    if (redirectDetailPage()) return;

    // Rewrite search links immediately
    rewriteSearchLinks();

    // Observe for dynamically loaded results
    const observer = new MutationObserver(() => rewriteSearchLinks());
    observer.observe(document.body, { childList: true, subtree: true });
})();
