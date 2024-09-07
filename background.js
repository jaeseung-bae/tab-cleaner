chrome.tabs.onCreated.addListener(async (currentTab) => {
    const currentUrl = currentTab.url? currentTab.url : currentTab.pendingUrl;
    const tabs = await chrome.tabs.query({url: currentUrl});
    
    const existingTab = tabs.find(tab => tab.url === currentUrl);
    if (existingTab) {
        await chrome.tabs.update(existingTab.id, {active: true});
        await chrome.tabs.remove(currentTab.id);
    }
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
