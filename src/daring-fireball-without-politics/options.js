function showStatus(message) {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  window.setTimeout(() => {
    if (statusElement.textContent === message) {
      statusElement.textContent = "";
    }
  }, 1500);
}

function setKeywordsValue(keywords) {
  document.getElementById("keywords").value = keywords.join("\n");
}

function updateSummaries(settings) {
  const keywordCount = settings.blockedKeywords.length;
  document.getElementById("settings-summary").textContent = settings.filteringEnabled
    ? settings.softHideEnabled
      ? "Filtering is on and matching posts collapse into placeholders."
      : "Filtering is on and matching posts are fully hidden."
    : "Filtering is currently off.";
  document.getElementById("keyword-summary").textContent = `${keywordCount} blocked keyword${keywordCount === 1 ? "" : "s"} configured.`;
}

document.addEventListener("DOMContentLoaded", () => {
  const keywordsElement = document.getElementById("keywords");
  const filteringEnabledElement = document.getElementById("filteringEnabled");
  const softHideEnabledElement = document.getElementById("softHideEnabled");
  const saveButton = document.getElementById("save");
  const resetButton = document.getElementById("reset");

  DFWP_SHARED.getSettings(settings => {
    setKeywordsValue(settings.blockedKeywords);
    filteringEnabledElement.checked = settings.filteringEnabled;
    softHideEnabledElement.checked = settings.softHideEnabled;
    updateSummaries(settings);
  });

  saveButton.addEventListener("click", () => {
    const settings = {
      blockedKeywords: DFWP_SHARED.normalizeKeywords(keywordsElement.value.split("\n")),
      filteringEnabled: filteringEnabledElement.checked,
      softHideEnabled: softHideEnabledElement.checked
    };

    chrome.storage.sync.set(settings, () => {
      setKeywordsValue(settings.blockedKeywords);
      updateSummaries(settings);
      showStatus("Saved settings.");
    });
  });

  resetButton.addEventListener("click", () => {
    const defaults = DFWP_SHARED.getDefaultSettings();

    chrome.storage.sync.set(defaults, () => {
      setKeywordsValue(defaults.blockedKeywords);
      filteringEnabledElement.checked = defaults.filteringEnabled;
      softHideEnabledElement.checked = defaults.softHideEnabled;
      updateSummaries(defaults);
      showStatus("Reset to defaults.");
    });
  });

  filteringEnabledElement.addEventListener("change", () => {
    updateSummaries({
      blockedKeywords: DFWP_SHARED.normalizeKeywords(keywordsElement.value.split("\n")),
      filteringEnabled: filteringEnabledElement.checked,
      softHideEnabled: softHideEnabledElement.checked
    });
  });

  softHideEnabledElement.addEventListener("change", () => {
    updateSummaries({
      blockedKeywords: DFWP_SHARED.normalizeKeywords(keywordsElement.value.split("\n")),
      filteringEnabled: filteringEnabledElement.checked,
      softHideEnabled: softHideEnabledElement.checked
    });
  });

  keywordsElement.addEventListener("input", () => {
    updateSummaries({
      blockedKeywords: DFWP_SHARED.normalizeKeywords(keywordsElement.value.split("\n")),
      filteringEnabled: filteringEnabledElement.checked,
      softHideEnabled: softHideEnabledElement.checked
    });
  });
});
