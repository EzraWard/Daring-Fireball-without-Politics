if (typeof DFWP_SHARED === "undefined") {
  importScripts("shared.js");
}

function arraysEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

chrome.runtime.onInstalled.addListener(details => {
  chrome.storage.sync.get(null, data => {
    const normalizedKeywords = DFWP_SHARED.normalizeKeywords(data.blockedKeywords);
    const migratedKeywords = DFWP_SHARED.normalizeKeywords(
      normalizedKeywords.map(keyword => (keyword === "kentaji" || keyword === "kentanji" ? "ketanji" : keyword))
    );
    const nextSettings = {};

    if (details.reason === "install" && migratedKeywords.length === 0) {
      nextSettings.blockedKeywords = DFWP_SHARED.DEFAULT_KEYWORDS.slice();
    } else if (!arraysEqual(migratedKeywords, normalizedKeywords)) {
      nextSettings.blockedKeywords = migratedKeywords;
    }

    if (typeof data.filteringEnabled !== "boolean") {
      nextSettings.filteringEnabled = true;
    }

    if (typeof data.softHideEnabled !== "boolean") {
      nextSettings.softHideEnabled = details.reason === "install";
    }

    if (Object.keys(nextSettings).length > 0) {
      chrome.storage.sync.set(nextSettings);
    }
  });
});
