function handleMessage(msg) {
  console.log("received message", msg);
  if (msg.type == 'domainChange') {

    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      .then(tabs => browser.tabs.get(tabs[0].id))
      .then(tab => {
        var domain = domainFromUrl(tab.url);
        if (msg.enabled) {
          addDomain(domain);
          // setEnabledButtonState(button, tabs.activeTab);
          // if (!uu.isUrlHomePage(tabs.activeTab.url)) {
            // redirectToReaderView(tabs.activeTab);
          // }
          browser.tabs.toggleReaderMode();
        }
        else {
          removeDomain(data.domain);
          setDisabledButtonState(button, tabs.activeTab);
        }
      });
    // var gettingCurrent = browser.tabs.getCurrent();

    // gettingCurrent.then(onGot, onError);
    // gettingCurrent.then((tabInfo) => {
    //   var domain = tabInfo.url;
    //   if (msg.enabled) {
    //     addDomain(domain);
    //     // setEnabledButtonState(button, tabs.activeTab);
    //     // if (!uu.isUrlHomePage(tabs.activeTab.url)) {
    //       // redirectToReaderView(tabs.activeTab);
    //     // }
    //     browser.tabs.toggleReaderMode();
    //   }
    //   else {
    //     removeDomain(data.domain);
    //     setDisabledButtonState(button, tabs.activeTab);
    //   }
    // },
    // onError);
  }
}

function onGot(tabInfo) {
  console.log(tabInfo);
}

function onError(error) {
  console.log("Error: ${error}");
}

// Check storage for the domain
function isDomainEnabled(url, trueCallback, falseCallback) {
  initStorage();
  var domain = domainFromUrl(url);
  getStorage().get("enabledDomains").then(result => {
    if (result.enabledDomains.indexOf(domain) >= 0) {
      trueCallback();
    }
    else {
      falseCallback();
    }
  });
}

// Add a domain to storage
function addDomain(domain) {
  initStorage();
  console.log("Adding domain " + domain);
  getStorage().get("enabledDomains").then(domains => {
    console.log("retrieved domains", domains);
    domains.enabledDomains.push(domain);
    getStorage().set({"enabledDomains": domains});
    console.log("Stored domains:");
    console.log(domains);
  });
}

// Remove a domain from storage
function removeDomain(domain) {
  initStorage();
  console.log("Removing domain " + domain);
  getStorage().get("enabledDomains").then(domains => {
    var i = domains.indexOf(domain);
    delete domains[i];
    getStorage().set({"enabledDomains": domains});
    console.log("Updated domains:");
    console.log(domains);
  });
}

// Initialize storage if not already done so.
function initStorage() {
  var store = getStorage();
  store.get("enabledDomains").then(domains => {
    if (isObjectEmpty(domains)) {
      console.log("Found domains, but null");
      store.set({"enabledDomains": new Array()});
    }
  });
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getStorage() {
  return browser.storage.local;
}

// Extract domain from a url
function domainFromUrl(url) {
  var r = /:\/\/(.[^/]+)/;
  var matches = url.match(r);
  if (matches && matches.length >= 2) {
    return matches[1];
  }
  return null;
}

console.log("background script started");
browser.runtime.onMessage.addListener(handleMessage);
