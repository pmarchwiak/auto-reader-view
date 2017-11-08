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

getButton().addEventListener("click", (e) => {
  console.log("submitButton clicked");
  submitClicked(e);
});

console.log("Loaded panel.js");

function submitClicked(event) {
  var btn = event.target;
  var isEnabled = (btn.value == "Enable");
  if (isEnabled) {
    setEnabledState();
  }
  else {
    setDisabledState();
  }

  browser.runtime.sendMessage({
    type: "domainChange",
    enabled: isEnabled
  });
}

function setEnabledState() {
  var btn = getButton();
  btn.style.display = '';
  btn.value = "Disable";
  var domain = "TODO";
  replacePromptText(getPrompt(), "Pages from ", domain,
      " will automatically open in Reader View.");
}

function replacePromptText(prompt, part1, domain, part2) {
  // clear out prompt text
  while (prompt.firstChild) prompt.removeChild(prompt.firstChild);

  // TODO use a library / templating here instead

  var text1 = document.createTextNode(part1);

  var b = document.createElement("b");
  var domainText = document.createTextNode(domain);
  b.appendChild(domainText);

  var text2 = document.createTextNode(part2);

  prompt.appendChild(text1);
  prompt.appendChild(b);
  prompt.appendChild(text2);
}
