let lastActivatedTabId = undefined;
let previousTabId = undefined;

chrome.tabs.onActivated.addListener((activeInfo) => {
    previousTabId = lastActivatedTabId;
    lastActivatedTabId = activeInfo.tabId;
});

chrome.tabs.onCreated.addListener(async (tab) => {
    const url = tab.url? tab.url : tab.pendingUrl;
    const tabs = await queryTabs(tab.url);
    closeDuplicateTab(tabs);
});

chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const tabs = await queryTabs(tab.url);
        closeAllDuplicateTabs(tabs);
    }
});

async function queryTabs(url) {
    if (!url) {
        return [];
    }
    if (await isIntendedDuplication(url)) {
        return [];
    }
    return chrome.tabs.query({url});
}

async function isIntendedDuplication(url) {
    const prevUrl = await getPreviousUrl();
    return prevUrl === url;
}

async function getPreviousUrl() {
    if (previousTabId === undefined) {
        return;
    }
    let url = await new Promise((res) => chrome.tabs.get(previousTabId, (tab) => {
        if (chrome.runtime.lastError) {
            // intended ignore
        }
        if (tab) {
            res(tab.url);
        }
    }));
    return url;
}


async function closeDuplicateTab(tabs) {
    const existingTab = tabs.find(tab => tab.url === url);
    if (existingTab) {
        await chrome.tabs.update(existingTab.id, {active: true});
        await chrome.tabs.remove(currentTab.id);
        previousTabId = undefined;
    }
}

async function closeAllDuplicateTabs(tabs) {
    if (tabs.length === 0) {
        return;
    }
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, {active: true});
    tabs.slice(1).forEach((tab) => {
        chrome.tabs.remove(tab.id);
        previousTabId = undefined;
    });
}
