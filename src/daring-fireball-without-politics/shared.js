(function (global) {
  const DEFAULT_KEYWORDS = ["biden", "cdc", "ketanji", "trump"];

  function normalizeKeywords(keywords) {
    return Array.from(
      new Set(
        (keywords || [])
          .map(keyword => String(keyword).trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }

  function getDefaultSettings() {
    return {
      blockedKeywords: DEFAULT_KEYWORDS.slice(),
      filteringEnabled: true,
      softHideEnabled: true
    };
  }

  function normalizeSettings(settings) {
    const defaults = getDefaultSettings();

    return {
      blockedKeywords: normalizeKeywords(settings && settings.blockedKeywords ? settings.blockedKeywords : defaults.blockedKeywords),
      filteringEnabled: settings && settings.filteringEnabled !== false,
      softHideEnabled: settings && settings.softHideEnabled !== false
    };
  }

  function getSettings(callback) {
    chrome.storage.sync.get(getDefaultSettings(), data => {
      callback(normalizeSettings(data));
    });
  }

  global.DFWP_SHARED = {
    DEFAULT_KEYWORDS,
    getDefaultSettings,
    getSettings,
    normalizeKeywords,
    normalizeSettings
  };
})(globalThis);
