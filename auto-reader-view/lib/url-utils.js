var ABOUT_READER_PREFIX = "about:reader?url=";

// Strip reader prefix from url
function urlWithoutReader(url) {
  if (url.startsWith(ABOUT_READER_PREFIX)) {
    return url.substring(ABOUT_READER_PREFIX.length);
  }
  return url;
}

// Extract domain from a url
function domainFromUrl(url) {
  if (url.startsWith(ABOUT_READER_PREFIX)) {
    url = urlWithoutReader(url);
  }
  var r = /:\/\/(.[^/]+)/;
  var matches = url.match(r);
  if (matches && matches.length >= 2) {
    return matches[1];
  }
  return null;
}

function isUrlHomePage(url) {
  var domain = domainFromUrl(url);
  var endOfDomainPartIdx = url.indexOf(domain) + domain.length;
  var pathPart = url.substr(endOfDomainPartIdx);

  return pathPart.length < 2; // 2 in case of trailing '/'
}

exports.domainFromUrl = domainFromUrl;
exports.isUrlHomePage = isUrlHomePage;
exports.ABOUT_READER_PREFIX = ABOUT_READER_PREFIX;
