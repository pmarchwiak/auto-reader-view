var buttons = require('sdk/ui/button/action');
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var ss = require("sdk/simple-storage");
var tabs = require("sdk/tabs");

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

function handleClick(state) {
  var curBadge = button.state(tabs.activeTab).badge;
  console.log("Button clicked. Current badge: " + curBadge);
  if (curBadge == "+") {
    storeDomain(tabs.activeTab.url);
    setEnabledButtonState(button, tabs.activeTab);
  }
  else if (curBadge == "-") {
    removeDomain(tabs.activeTab.url);
    setDisabledButtonState(button, tabs.activeTab);
  }

  newBadge = button.state(tabs.activeTab).badge;
  console.log("New badge: " + newBadge);
}

tabs.on('load', function(tab) {
  if (tab.url && isDomainMatch(tab.url)) {
    console.log("Auto reader enabled for " + tab.url);
    setEnabledButtonState(button, tab);

    var newUrl = 'about:reader?url=' + tab.url;
    console.log("Setting new url to " + newUrl);
    tab.url = newUrl;
  }
});

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

function isDomainMatch(url) {
  initStorage();
  var domain = domainFromUrl(url);
  return ss.storage.domains.indexOf(domain) != -1;
}

function domainFromUrl(url) {
  if (url.startsWith("about:reader?url=")) {
    return null;
  }
  var r = /:\/\/(.[^/]+)/;
  var matches = url.match(r);
  if (matches && matches.length >= 2) {
    return matches[1];
  }
  return null;
}

function storeDomain(url) {
  initStorage();
  var domain = domainFromUrl(url);

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
