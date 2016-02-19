var buttons = require('sdk/ui/button/action');
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var tabs = require("sdk/tabs");

var aboutReaderPrefix = "about:reader?url=";

var button = buttons.ActionButton({
  id: "auto-reader-view-link",
  label: "Always open in Reader View",
  icon: {
    "16": "./miu-book-icon-16.png",
    "32": "./miu-book-icon-32.png",
    "64": "./miu-book-icon-64.png"
  },
  onClick: handleClick,
  badge: "+",
  badgeColor: "green"
});

var tabPast = new Set();

function handleClick(state) {
  var curBadge = button.state(tabs.activeTab).badge;
  console.log("Button clicked. Current badge: " + curBadge);
  if (curBadge == "+") {
    addDomain(tabs.activeTab.url);
    setEnabledButtonState(button, tabs.activeTab);
    redirectToReaderView(tabs.activeTab);
  }
  else if (curBadge == "-") {
    removeDomain(tabs.activeTab.url);
    setDisabledButtonState(button, tabs.activeTab);
  }

  newBadge = button.state(tabs.activeTab).badge;
  console.log("New badge: " + newBadge);
}

tabs.on('load', function(tab) {
  console.log("tab load: " + tab.url);
  if (tab.url && isDomainEnabled(tab.url)) {
    console.log("Auto reader enabled for " + tab.url);
    setEnabledButtonState(button, tab);
    redirectToReaderView(tab);
  }
});

function redirectToReaderView(tab) {
  console.log("Tab past: " + setToString(tabPast));
  var origUrl = tab.url;
  if (!origUrl.startsWith(aboutReaderPrefix) &&
    tabPast.has(aboutReaderPrefix + origUrl)) {
    // User wants to exit reader view temporarily
    // so don't do a redirect.
    console.log("Was already in Reader View, exit");
    tabPast.delete(aboutReaderPrefix + origUrl);
  }
  else if (origUrl.startsWith(aboutReaderPrefix)) {
    // do nothing
  }
  else {
    var newUrl = aboutReaderPrefix + tab.url;
    console.log("Setting new url to " + newUrl);
    tab.url = newUrl;
  }
  tabPast.add(tab.url);
  console.log("New tab past: " + setToString(tabPast));
}

function setToString(s) {
  return JSON.stringify([...tabPast]);
}

function urlWithoutReader(url) {
  if (url.startsWith(aboutReaderPrefix)) {
    return url.substring(aboutReaderPrefix.length);
  }
  return url;
}

function setEnabledButtonState(button, tab) {
  button.state(tabs.activeTab, {
    "label" : "Remove from Auto Reader",
    "badge" : "-",
    "badgeColor" : "red"
  });
}

function setDisabledButtonState(button, tab) {
  button.state(tabs.activeTab, {
    "label" : "Add to Auto Reader",
    "badge" : "+",
    "badgeColor" : "green"
  });
}

function isDomainEnabled(url) {
  initStorage();
  var domain = domainFromUrl(url);
  return ss.storage.domains.indexOf(domain) != -1;
}

function domainFromUrl(url) {
  if (url.startsWith(aboutReaderPrefix)) {
    url = urlWithoutReader(url);
  }
  var r = /:\/\/(.[^/]+)/;
  var matches = url.match(r);
  if (matches && matches.length >= 2) {
    return matches[1];
  }
  return null;
}

function addDomain(url) {
  initStorage();
  var domain = domainFromUrl(url);
  console.log("Adding domain " + domain);
  ss.storage.domains.push(domain);
  console.log("Stored domains:");
  console.log(ss.storage.domains);
}

function removeDomain(url) {
  initStorage();
  var domain = domainFromUrl(url);
  console.log("Removing domain " + domain);
  var i = ss.storage.domains.indexOf(domain);
  delete ss.storage.domains[i];
  console.log(ss.storage.domains);
}

function initStorage() {
  if (!ss.storage.domains) {
    ss.storage.domains = [];
  }
}
// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
// function dummy(text, callback) {
//   callback(text);
// }
//
// exports.dummy = dummy;
