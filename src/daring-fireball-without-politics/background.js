// ...new file...
// background.js
// Initialize default blocked keywords on first install
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    const defaults = [
      'trump',
      'biden',
      'cdc',
      'kentaji'
    ];
    chrome.storage.sync.get({ blockedKeywords: [] }, data => {
      if (!data.blockedKeywords || data.blockedKeywords.length === 0) {
        chrome.storage.sync.set({ blockedKeywords: defaults });
      }
    });
  }
});
