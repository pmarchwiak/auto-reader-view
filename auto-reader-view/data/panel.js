document.getElementById("submitButton").addEventListener("click", submitClicked);

var btn = document.getElementById("submitButton");
var prompt = document.getElementById("panelPrompt");
var domain = "";

self.port.on("panelOpened", function(state) {
  console.log("panelOpened event received");
  console.log(state);
  domain = state.domain;
  if (domain) {
    if (state.enabled) {
      setEnabledState(domain, btn, prompt);
    }
    else {
      setDisabledState(domain, btn, prompt);
    }
  }
  else {
    setUnsupportedState(btn, prompt);
  }
});

function submitClicked(event) {
  var btn = event.target;
  var isEnabled = (btn.value == "Enable");

  if (isEnabled) {
    setEnabledState(domain, btn, prompt);
  }
  else {
    setDisabledState(domain, btn, prompt);
  }

  self.port.emit("domainChange", {
    domain: domain,
    enabled: isEnabled
  });
}

function setEnabledState(domain, btn, prompt) {
  btn.style.display = '';
  btn.value = "Disable";
  replacePromptText(prompt, "Pages from ", domain,
      " will automatically open in Reader View.");
}

function setDisabledState(domain, btn, prompt) {
  btn.style.display = '';
  btn.value = "Enable";
  replacePromptText(prompt, "Always open pages from ", domain, " in Reader View?")
}

function setUnsupportedState(btn, prompt) {
  btn.style.display = 'none';
  replacePromptText(prompt, "Reader View not available on this page.", "", "");
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
