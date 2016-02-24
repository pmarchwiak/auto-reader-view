document.getElementById("submitButton").addEventListener("click", submitClicked);

var btn = document.getElementById("submitButton");
var prompt = document.getElementById("panelPrompt");
var domain = "";

self.port.on("panelOpened", function(state) {
  console.log("panelOpened event received");
  console.log(state);
  domain = state.domain;
  if (state.enabled) {
    setEnabledButtonState();
  }
  else {
    setDisabledButtonState();
  }
});

function submitClicked(event) {
  var btn = event.target;
  var newVal = btn.value;
  var isEnabled = (newVal == "Enable");

  if (isEnabled) {
    setEnabledButtonState();
  }
  else {
    setDisabledButtonState();
  }

  self.port.emit("domainChange", {
    domain: domain,
    enabled: isEnabled
  });
}

function setEnabledButtonState() {
  btn.value = "Disable";
  prompt.innerHTML =
     "<b>" + domain + "</b> will automatically open in Reader View.";
}

function setDisabledButtonState() {
  btn.value = "Enable";
  prompt.innerHTML =
     "Always open <b>" + domain + "</b> in Reader View?";
}
