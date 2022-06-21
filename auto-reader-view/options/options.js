
function handleSaveButtonClick(e) {
  var text = document.querySelector("#domainsInput").value;
  var domainsList = text.split("\n");

  browser.runtime.getBackgroundPage().then(
    (backgroundPage) => {
      backgroundPage.saveDomainsList(domainsList);
      document.querySelector("#saveMessage").innerText = "List saved successfully."
    },
    (error) => {
      console.log("Error getting backgroundPage", error)
    }
  )

  e.preventDefault();
}

function restoreOptions() {
  // TODO refresh after a tab switch
  console.log("Reading domains");
  browser.storage.local.get("enabledDomains").then(storageObject => {
    console.log("retrieved domains", storageObject);
    var domainsString = storageObject.enabledDomains.join("\n");
    document.querySelector("#domainsInput").value = domainsString;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", handleSaveButtonClick);