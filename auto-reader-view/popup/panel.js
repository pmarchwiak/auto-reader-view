/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error('Failed to execute beastify content script: ${error.message}');
}

function getButton() {
  return document.getElementById("submitButton");
}

function getPrompt() {
  return document.getElementById("panelPrompt");
}

function getDomainInput() {
	return document.getElementById("domainInput");
}

getButton().addEventListener("click", (e) => {
  console.log("submitButton clicked");
  submitClicked(e);
});


function submitClicked(event) {
  var btn = event.target;
  var isEnabled = (btn.value == "Enable");
	var domain = getDomainInput().value;
	updatePanelUi(domain, isEnabled);

  browser.runtime.sendMessage({
    type: "domainChange",
    enabled: isEnabled
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

browser.runtime.onMessage.addListener(handlePanelOpened);

console.log("Loaded panel.js");
browser.runtime.sendMessage({"type": "domainState"}).then(resp => {
		console.log("received resp", resp);
		var domain = resp.domain;
		var isEnabled = resp.enabled;
    updatePanelUi(resp.domain, resp.enabled)  ;
});
