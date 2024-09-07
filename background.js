chrome.tabs.onCreated.addListener((tab) => {
    const currentTab = tab;
    chrome.tabs.query({url: currentTab.pendingUrl}, (tabs) => {
        let tabIdToClose = undefined;
        tabs.forEach((tab) => {
            if (tab.url === currentTab.pendingUrl) {
                tabIdToClose = currentTab.id;
                chrome.tabs.update(tab.id, {active: true});
            }
        });
        if (tabIdToClose) {
            chrome.tabs.remove(tabIdToClose);
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const url = tab.url;
        chrome.tabs.query({url}, async (tabs) => {
            if (!tabs.length) {
                return;
            }
            const tab = tabs[0];
            await chrome.tabs.update(tab.id, {active: true});
            tabs.slice(1).forEach((tab) => {
                chrome.tabs.remove(tab.id);
            });
        });
    }
});
