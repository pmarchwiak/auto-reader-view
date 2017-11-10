function getButton() {
  return document.getElementById("submitButton");
}

function getPrompt() {
  return document.getElementById("panelPrompt");
}

function getDomainInput() {
	return document.getElementById("domainInput");
}

function submitClicked(event) {
  console.log("submitButton clicked");
  var btn = event.target;
  var isEnabled = (btn.value == "Enable");
	var domain = getDomainInput().value;
	updatePanelUi(true, domain, isEnabled);

  browser.runtime.sendMessage({
    type: "domainChange",
    enabled: isEnabled,
    "domain": domain
  });
}

function updatePanelUi(isValid, domain, isEnabled) {
  if (!isValid) {
    setInvalidState();
  }
  else if (isEnabled) {
	  setEnabledState(domain);
  }
  else {
    setDisabledState(domain);
  }
}

function setInvalidState() {
  var btn = getButton();
  btn.value = "Enable";
  btn.setAttribute("disabled", "");
  replacePromptText(`"about:" pages cannot be opened in Reader View`);
}

function setEnabledState(domain) {
  var btn = getButton();
  // btn.style.display = '';
  btn.value = "Disable";
  btn.removeAttribute("disabled");
	getDomainInput().value = domain;
  replacePromptText("Pages from ", domain, " will automatically open in Reader View");
}

function setDisabledState(domain) {
	var btn = getButton();
  // btn.style.display = '';
  btn.value = "Enable";
  btn.removeAttribute("disabled");
	getDomainInput().value = domain;
  replacePromptText("Always open pages from ", domain, " in Reader View?");
}

function replacePromptText(part1, domain = null, part2 = null) {
  var prompt = getPrompt();
  // clear out prompt text
  while (prompt.firstChild) prompt.removeChild(prompt.firstChild);

  // TODO use a library / templating here instead

  var text1 = document.createTextNode(part1);
  prompt.appendChild(text1);

  if (domain) {
    var b = document.createElement("b");
    var domainText = document.createTextNode(domain);
    b.appendChild(domainText);
    prompt.appendChild(b);
  }

  if (part2) {
    var text2 = document.createTextNode(part2);
    prompt.appendChild(text2);
  }
}

function handlePanelOpened(msg) {
	console.log("Received message", msg);
	if (msg.type === "browserActionClicked") {
		updatePanelUi(msg.domain, msg.isEnabled);
	}
}

console.log("Loaded panel.js");

getButton().addEventListener("click", submitClicked);
browser.runtime.onMessage.addListener(handlePanelOpened);

browser.runtime.sendMessage({"type": "domainState"}).then(resp => {
		console.log("received resp", resp);
    var domain = null;
    var isEnabled = null;
    if (resp.valid) {
      domain = resp.domain;
      isEnabled = resp.enabled;
    }
    updatePanelUi(resp.valid, resp.domain, resp.enabled);
});
