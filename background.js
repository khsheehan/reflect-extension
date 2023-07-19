chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.contextMenus.create({
  "title": 'selection',
  "contexts": ['selection'],
  id: 'selection',
});

chrome.contextMenus.onClicked.addListener((data) => {
  chrome.tabs.query({
    "active": true,
  }).then((tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      name: `tab-${data.menuItemId}`,
      data: {
        message: data.selectionText
      },
    });
  })
});

