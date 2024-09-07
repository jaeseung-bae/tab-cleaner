chrome.tabs.onCreated.addListener((tab) => {
  const currentTab = tab;
  const pendingUrl = currentTab.pendingUrl;
  chrome.tabs.query({ url: pendingUrl }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url === pendingUrl) {
        chrome.tabs.remove(currentTab.id);
        chrome.tabs.update(tab.id, { active: true });
        }
    });
  });;
});

chrome.tabs.onUpdated.addListener((_, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({}, (tabs) => {
      const tabIdByUrl = {}; // k: url, v: tabId
      tabs.forEach((tab) => {
        const url = tab.url;
        if (tabIdByUrl[url]) {
          chrome.tabs.update(tabIdByUrl[url], { active: true }, () => {
            chrome.tabs.remove(tab.id);
          });
          return;
        }
        tabIdByUrl[url] = tab.id;
      });
    });
  }
});
