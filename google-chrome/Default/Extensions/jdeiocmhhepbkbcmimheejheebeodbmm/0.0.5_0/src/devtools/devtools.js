'use strict';

const $chrome = ChromeExtTools.init('devtools', window);

// CREATE PANEL
$chrome.createPanel('Resources', undefined, 'src/panel/panel.html')
    .then(panelWindow => {
        $chrome.onRequest(request => panelWindow.updatePanel(request));
    });
// .then(() => chrome.devtools.inspectedWindow.reload());
