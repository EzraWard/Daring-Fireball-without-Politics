// Load saved keywords
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get({ blockedKeywords: [] }, data => {
    document.getElementById("keywords").value = data.blockedKeywords.join("\n");
  });
});

// Save keywords
document.getElementById("save").addEventListener("click", () => {
  const raw = document.getElementById("keywords").value;
  const list = raw.split("\n").map(k => k.trim()).filter(k => k.length > 0);

  chrome.storage.sync.set({ blockedKeywords: list }, () => {
    const status = document.getElementById("status");
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1500);
  });
});