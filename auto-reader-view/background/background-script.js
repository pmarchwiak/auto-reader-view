var currentTab;
var currentBookmark;

/*
 * Updates the browserAction icon.
 */
function updateIcon() {
  browser.browserAction.setIcon({
    // path: currentBookmark ? {
    //   19: "icons/star-filled-19.png",
    //   38: "icons/star-filled-38.png"
    // } : {
    //   19: "icons/star-empty-19.png",
    //   38: "icons/star-empty-38.png"
    // },
		path: {
			"16": "icons/miu-book-icon-16.png",
		  "32": "icons/miu-book-icon-32.png",
		  "64": "icons/miu-book-icon-64.png"
		}
    // tabId: currentTab.id
  });
  browser.browserAction.setTitle({
    // Screen readers can see the title
    title: 'Auto Reader View'
    // title: currentBookmark ? 'Unbookmark it!' : 'Bookmark it!',
    // tabId: currentTab.id
  });
	browser.browserAction.setPopup({popup: "/popup/panel.html"});
	browser.browserAction.onClicked.addListener(browserActionClicked);
}

function browserActionClicked(tab) {
	var domain = domainFromUrl(tab.url);
	isDomainEnabled(domain).then(enabled => {
	console.log("browserActionClicked");
		browser.runtime.sendMessage({
			"type": "browserActionClicked",
			"domain": domain,
			"enabled": enabled
		});
	});
}

function handleMessage(msg) {
  console.log("received message", msg);
	// if (msg.type == 'domainState') {
	// 	// return the current domain and its state
	// 	return browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})
	// 		.then(tabs => browser.tabs.get(tabs[0].id))
	// 		.then(tab => {
	// 			var domain = domainFromUrl(tab.url);
	// 			return isDomainEnabled(tab.url).then(enabled => {
	// 				return {"enabled": enabled, "domain": domain};
	// 			});
	// 		});
	// }
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

// Check storage for the domain
// @return {Promise<Boolean>}
function isDomainEnabled(url) {
  initStorage();
  var domain = domainFromUrl(url);
  return getStorage().get("enabledDomains").then(result => {
    return result.enabledDomains.indexOf(domain) >= 0;
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
updateIcon();
browser.runtime.onMessage.addListener(handleMessage);

// listen to tab URL changes
// browser.tabs.onUpdated.addListener(updatePanel);
//
// // listen to tab switching
// browser.tabs.onActivated.addListener(updatePanel);
//
// // listen for window switching
// browser.windows.onFocusChanged.addListener(updatePanel);
