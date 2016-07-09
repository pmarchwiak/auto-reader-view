var uu = require("../lib/url-utils");

exports["test domainFromUrl"] = function(assert) {
  assert.ok(uu.domainFromUrl("http://google.com") == "google.com");
  assert.ok(uu.domainFromUrl("http://google.com/blah") == "google.com");
  assert.ok(uu.domainFromUrl("https://google.com/blah") == "google.com");
};

exports["test isUrlHomePage"] = function(assert) {
  assert.ok(uu.isUrlHomePage("http://google.com"));
  assert.ok(uu.isUrlHomePage("http://google.com/"));
  assert.ok(!uu.isUrlHomePage("http://google.com/search"));
  assert.ok(!uu.isUrlHomePage("https://google.com/search"));
};


require("sdk/test").run(exports);
