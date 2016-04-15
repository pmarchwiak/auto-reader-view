#Auto Reader View
A Firefox add-on for loading Reader View automatically on chosen websites.

Get it here: https://addons.mozilla.org/en-US/firefox/addon/auto-reader-view/

## Usage
Firefox's Reader View feature strips away clutter from web pages for improved readabilty. In order to switch to this view, users must manually click the Reader View icon in the address bar. This can be a minor inconvenience when Reader View is consistently used for the same web sites.

This add-on allows users to automatically open Reader View for chosen websites. When the add-on button is clicked, a panel will open that allows the user to change the preference for the current domain.

To enable Auto Reader View For a new site, click the Auto Reader View button [!book icon](auto-reader-view/data/miu-book-icon-32.png) (it looks like a book) to open the panel, then click "Enable". When clicked, this will save the preference for that domain and a green checkbox will appear on the add-on button. Any future tabs opened for that domain will switch to Reader View automatically. Note that the Close Reader View button continues to work if the user needs to switch back to the normal view for that page.

To remove the preference for a domain, navigate to a page from that site. Click the Auto Reader View button to open the panel, then click "Disable".

## Issues

Please report any issues at https://github.com/pmarchwiak/auto-reader-view/issues and thank you for using this add-on!

## Debugging
Logging for SDK add-ons is disabled by default. Set it info level by setting the `extensions.sdk.console.logLevel` Firefox preference to `info` in `about:config`. See more details at https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/console#Logging_Levels .

## Credits
All code by Patrick Marchwiak.

Icon from Miu theme by Linh Pham Thi Dieu
http://linhpham.me/
