'use strict';

chrome.extension.onMessage.addListener(message => {
    if (message.download) {
        if (chrome.downloads && chrome.downloads.download) {
            chrome.downloads.download({url: message.download});
        }
    }
});

class ChromeExtTools {

    constructor(source, window) {
        this.source = source;
        this.window = window;
        console.log('log from ' + source);
    }

    download(url) {
        chrome.extension.sendMessage({download: url});
    }

    onRequest(callback) {
        chrome.devtools.network.onRequestFinished.addListener(callback);
    }

    onResource(callback) {
        chrome.devtools.inspectedWindow.onResourceAdded.addListener(callback);
    }

    getResources(callback) {
        return chrome.devtools.inspectedWindow.getResources(callback);
    }

    createPanel(title, icon, html) {
        const that = this;
        return new Promise(resolve =>
            chrome.devtools.panels.create(title, icon, html, panel =>
                panel.onShown.addListener(panelWindow => {
                    console.log(this.source);
                    that.panelWindow = panelWindow;
                    return resolve(panelWindow);
                })));
    }

    static init(source, window) {
        return new this(source, window);
    }
}

