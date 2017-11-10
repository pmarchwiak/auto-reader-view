// Track previous tab URLs
var tabPast = new Set();

/*
 * Updates the browserAction icon.
 */
function updateIcon(enabled) {
  console.log("Updating icon");
  if (enabled) {
    browser.browserAction.setBadgeText({text: "✓"});
    // browser.browserAction.setBadgeText("✓");
    browser.browserAction.setBadgeBackgroundColor({color: "green"});
  }
  else {
    browser.browserAction.setBadgeText({text: ""});
    browser.browserAction.setBadgeBackgroundColor({color: ""});
  }
}

function handleMessage(msg) {
  console.log("received message", msg);
	if (msg.type == 'domainState') {
    // Sent by the panel when it loads to determine the current domain and
		// its state.
		return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
			.then(tabs => browser.tabs.get(tabs[0].id))
			.then(tab => {
        if (isNonReaderAboutPage(tab.url)) {
          return {"valid": false};
        }
				var domain = domainFromUrl(tab.url);
        console.log(`Checking enabled status for ${domain}`);
				return isDomainEnabled(domain).then(enabled => {
          updateIcon(enabled);
					return {"enabled": enabled, "domain": domain, "valid": true};
				});
			});
	}
  else if (msg.type == 'domainChange') {
    // Sent by the panel to indicate the new state of the given domain.
    browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
      .then(tabs => browser.tabs.get(tabs[0].id))
      .then(tab => {
        if (msg.enabled) {
          addDomain(msg.domain);
          if (tab.isArticle) {
            tryToggleReaderView(tab);
          }
        }
        else {
          removeDomain(msg.domain);
          // setDisabledButtonState(button, tabs.activeTab);
        }
      });
  }
}

function handleTabSwitch() {
  return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
    .then(tabs => browser.tabs.get(tabs[0].id))
    .then(tab => {
      var domain = domainFromUrl(tab.url);
      console.log(`Checking enabled status for ${domain}`);
      return isDomainEnabled(domain).then(enabled => {
        updateIcon(enabled);
      });
    });
}


// Check storage for the domain
// @return {Promise<Boolean>}
function isDomainEnabled(domain) {
  return getStorage().get("enabledDomains").then(result => {
    console.log("Enabled domains are:", result.enabledDomains);
    isEnabled = result.enabledDomains.indexOf(domain) >= 0;
    console.log(`${domain} enabled: ${isEnabled}`);
    return isEnabled;
	});
}

// Add a domain to storage
function addDomain(domain) {
  console.log("Adding domain " + domain);
  getStorage().get("enabledDomains").then(domains => {
    console.log("retrieved domains", domains);
    if (domains.enabledDomains.indexOf(domain) === -1) {
      domains.enabledDomains.push(domain);
    }
    getStorage().set({"enabledDomains": domains.enabledDomains});
    console.log("Stored domains:", domains.enabledDomains);
  });
}

// Remove a domain from storage
function removeDomain(domain) {
  console.log("Removing domain " + domain);
  getStorage().get("enabledDomains").then(result => {
    var i = result.enabledDomains.indexOf(domain);
    delete result.enabledDomains[i];
    getStorage().set({"enabledDomains": result.enabledDomains});
    console.log("Updated domains:");
    console.log(result.enabledDomains);
  });
}

function getStorage() {
  return browser.storage.local;
}

// Initialize storage if not already done so.
// @return {Promise}
function initStorage() {
  var store = getStorage();
  return store.get("enabledDomains").then(domains => {
    if (isObjectEmpty(domains)) {
      console.log("Initializing storage");
      store.set({"enabledDomains": new Array()});
    }
    else {
      console.log("Storage already intialized");
    }
  });
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
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
  console.log(`Handling tab update for tab ${tabId} ${tab.url}, status: ${changeInfo.status}`);
  if (changeInfo.status === "complete") {
    var domain = domainFromUrl(tab.url);
    console.log(`Domain for updated tab ${tab.id} is ${domain}`);
    isDomainEnabled(domain).then(isEnabled => {
      updateIcon(isEnabled);
      if(isEnabled) {
        console.log(`Auto reader enabled for ${domain}`);
        // TODO update icon state
        tryToggleReaderView(tab);
      }
    })
  }
}

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
    console.log(`Toggling reader mode for ${tab.id} ${tab.url}`);
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

function isNonReaderAboutPage(url) {
    return url.startsWith("about:") && !url.startsWith("about:reader");
}

function isUrlHomePage(url) {
  var domain = domainFromUrl(url);
  var endOfDomainPartIdx = url.indexOf(domain) + domain.length;
  var pathPart = url.substr(endOfDomainPartIdx);

  return pathPart.length < 2; // 2 in case of trailing '/'
}

function onError(err) {
    console.log(err);
}

console.log("background script started");
console.log("add on click");

updateIcon();
initStorage().then(() => {
  // Listen to messages sent from the panel
  browser.runtime.onMessage.addListener(handleMessage);

  // Listen to tab URL changes
  browser.tabs.onUpdated.addListener(handleTabUpdate);

  // listen to tab switching
  browser.tabs.onActivated.addListener(handleTabSwitch);

  // listen for window switching
  browser.windows.onFocusChanged.addListener(handleTabSwitch);
});
