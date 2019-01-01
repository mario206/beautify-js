"use strict";

require("fire-fs");

require("fire-path");

var mod_electron_BrowserWindow = require("electron").BrowserWindow;

var mod_coremenu = require("./core/menu");

require("./core/external-app");

module.exports = {
  load: function load() {},
  unload: function unload() {},
  messages: {
    open: function open() {
      Editor.Panel.open("assets");
    },
    "popup-create-menu": function popupCreateMenu(o, t, n) {
      var p = mod_coremenu.getCreateTemplate();
      var s = new Editor.Menu(p, o.sender);
      t = Math.floor(t);
      n = Math.floor(n);
      s.nativeMenu.popup(mod_electron_BrowserWindow.fromWebContents(o.sender), t, n);
      s.dispose();
    },
    "popup-context-menu": function popupContextMenu(o, t, n, p, s, a, u) {
      var i = mod_coremenu.getContextTemplate(p, s, a, u);
      var d = new Editor.Menu(i, o.sender);
      t = Math.floor(t);
      n = Math.floor(n);
      d.nativeMenu.popup(mod_electron_BrowserWindow.fromWebContents(o.sender), t, n);
      d.dispose();
    }
  }
};