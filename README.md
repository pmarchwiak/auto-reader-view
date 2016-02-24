#Auto Reader View
Load Reader View automatically on chosen websites

## Usage
Firefox's Reader View feature strips away clutter from web pages for improved readabilty. In order to switch to this view, users must manually click the Reader View icon in the address bar. This can be a minor inconvenience when Reader View is consistently used for the same web sites.

This add-on allows users to automatically open Reader View for chosen websites. When the add-on button is clicked, the preference for the current domain will be changed.

For a new site, the Auto Reader View button will have a green "+" badge. When clicked, this will save the preference for that domain. Any future tabs opened for that domain will switch to Reader View automatically. Note that the Close Reader View button continues to work if the user needs to switch back to the normal view for that page.

To remove the preference for a domain, navigate to a page from that site. The Auto Reader View button will have a red "-" badge. When clicked, future tabs opened for that domain will open normally.

## Debugging
Logging for SDK add-ons is disabled by default. Set it info level by setting the `extensions.sdk.console.logLevel` Firefox preference to `info` in `about:config`. See more details at https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/console#Logging_Levels .

## Credits
All code by Patrick Marchwiak.

Icon from Miu theme by Linh Pham Thi Dieu
http://linhpham.me/
