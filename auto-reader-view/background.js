var currentTab;
var currentBookmark;

/*
 * Updates the browserAction icon.
 */
function updateIcon() {
  console.log("Updating icon");
  // TODO Update icon to represent enabled state

  // browser.browserAction.setIcon({
    // path: currentBookmark ? {
    //   19: "icons/star-filled-19.png",
    //   38: "icons/star-filled-38.png"
    // } : {
    //   19: "icons/star-empty-19.png",
    //   38: "icons/star-empty-38.png"
    // },
   // tabId: currentTab.id
  // });
}

function browserActionClicked2(tab) {
  console.log("Action clicked");
	var domain = domainFromUrl(tab.url);
	isDomainEnabled(domain).then(enabled => {
	  console.log("is domain enabled responded");
		browser.runtime.sendMessage({
			"type": "browserActionClicked",
			"domain": domain,
			"enabled": enabled
		});
	});
}

function handleMessage(msg) {
  console.log("received message", msg);
	if (msg.type == 'domainState') {
		// return the current domain and its state
		return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
			.then(tabs => browser.tabs.get(tabs[0].id))
			.then(tab => {
				var domain = domainFromUrl(tab.url);
				return isDomainEnabled(tab.url).then(enabled => {
					return {"enabled": enabled, "domain": domain};
				});
			});
	}
  else if (msg.type == 'domainChange') {
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

// Check storage for the domain
// @return {Promise<Boolean>}
function isDomainEnabled(domain) {
  return initStorage().then(() => {
    return getStorage().get("enabledDomains").then(result => {
      return result.enabledDomains.indexOf(domain) >= 0;
  	});
  });
}

// Add a domain to storage
function addDomain(domain) {
  initStorage();
  console.log("Adding domain " + domain);
  getStorage().get("enabledDomains").then(domains => {
    console.log("retrieved domains", domains);
    domains.enabledDomains.push(domain);
    getStorage().set({"enabledDomains": domains.enabledDomains});
    console.log("Stored domains:");
    console.log(domains);
  });
}

// Remove a domain from storage
function removeDomain(domain) {
  initStorage();
  console.log("Removing domain " + domain);
  getStorage().get("enabledDomains").then(result => {
    var i = result.enabledDomains.indexOf(domain);
    delete result.enabledDomains[i];
    getStorage().set({"enabledDomains": result.enabledDomains});
    console.log("Updated domains:");
    console.log(result.enabledDomains);
  });
}

// Initialize storage if not already done so.
// @return {Promise}
function initStorage() {
  var store = getStorage();
  return store.get("enabledDomains").then(domains => {
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
  if (url.startsWith("about:reader?")) {
    url = decodeURIComponent(url.substr("about:reader?url=".length));
  }
  var r = /:\/\/(.[^/]+)/;
  var matches = url.match(r);
  if (matches && matches.length >= 2) {
    return matches[1];
  }
  return null;
}

function handleTabUpdate(tabId, changeInfo, tab) {
  console.log("Handling tab update", changeInfo.status);
  if (changeInfo.status === "complete") {
    var domain = domainFromUrl(tab.url);
    console.log(`Domain for updated tab ${tab.id} is ${domain}`);
    isDomainEnabled(domain).then(isEnabled => {
      if(isEnabled) {
        console.log(`Auto reader enabled for ${domain}`);
        // TODO update icon state
        tryToggleReaderView(tab);
      }
    })
  }
}

var tabPast = new Set();

function tryToggleReaderView(tab) {
  // Detect user exiting reader view temporarily, don't toggle back
  if (!tab.isInReaderMode && tabPast.has(normalToReaderUrl(tab.url))) {
    console.log("Was previously in Reader View");
    tabPast.delete(normalToReaderUrl(tab.url));
  }
  // Already in reader view
  else if (tab.isInReaderMode) {
    // do nothing
  }
  else {
    browser.tabs.toggleReaderMode(tab.id).catch(onError);
  }

  // Store the previous urls in order to detect reader view "exits"
  tabPast.add(tab.url);

  // Housekeeping to prevent unbounded memory use
  if (tabPast.size > 50) {
    // TODO use an LRU cache instead
    console.log("tabPast size is " + tabPast.size + ". Clearing entries.");
    freeCache(tabPast, 5);
  }
  console.log("New tab past: " + setToString(tabPast));
}

function freeCache(set, numToRemove) {
  // remove least recently inserted entries
  // TODO use an LRU cache instead
  var iter = tabPast.values()
  for (var i = 0; i < numToRemove; i++) {
    var val = iter.next().value;
    set.delete(val);
  }
}

// No built-in pretty printing for Set :(
function setToString(s) {
  return JSON.stringify([...tabPast]);
}

function normalToReaderUrl(url) {
  return "about:reader?url=" + encodeURIComponent(url);
}

function readerToNormalUrl(readerUrl) {
  return decodeURIComponent(readerUrl.substr("about:reader?url=".length));
}

function onError(err) {
    console.log(err);
}

console.log("background script started");
console.log("add on click");

updateIcon();
browser.runtime.onMessage.addListener(handleMessage);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(handleTabUpdate);
//
// // listen to tab switching
// browser.tabs.onActivated.addListener(updatePanel);
//
// // listen for window switching
// browser.windows.onFocusChanged.addListener(updatePanel);
