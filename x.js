// Cross-browser compatibility tricks, which apply everywhere

var xBrowser = typeof chrome != 'undefined' ? chrome : browser
var xStore = typeof xBrowser.storage.sync != 'undefined' ? xBrowser.storage.sync : xBrowser.storage.local
