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
	updatePanelUi(domain, isEnabled);

  browser.runtime.sendMessage({
    type: "domainChange",
    enabled: isEnabled,
    "domain": domain
  });
}

function updatePanelUi(domain, isEnabled) {
	isEnabled ? setEnabledState(domain) : setDisabledState(domain);
}

function setEnabledState(domain) {
  var btn = getButton();
  btn.style.display = '';
  btn.value = "Disable";
	getDomainInput().value = domain;
  replacePromptText(getPrompt(),
		"Pages from ", domain, " will automatically open in Reader View");
}

function setDisabledState(domain) {
	var btn = getButton();
  btn.style.display = '';
  btn.value = "Enable";
	getDomainInput().value = domain;
  replacePromptText(getPrompt(),
		"Always open pages from ", domain, " in Reader View?");
}

function replacePromptText(prompt, part1, domain, part2) {
  // clear out prompt text
  while (prompt.firstChild) prompt.removeChild(prompt.firstChild);

  // TODO use a library / templating here instead

  var text1 = document.createTextNode(part1);

  var b = document.createElement("b");
  var domainText = document.createTextNode(domain);
  b.appendChild(domainText);


  prompt.appendChild(text1);
  prompt.appendChild(b);

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
		var domain = resp.domain;
		var isEnabled = resp.enabled;
    updatePanelUi(resp.domain, resp.enabled);
});
