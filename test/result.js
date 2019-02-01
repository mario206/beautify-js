"use strict";

var _require = require("url");

var e = _require.parse;

var _require2 = require("querystring");

var r = _require2.stringify;

var _require3 = require("https");

var t = _require3.request;

var _require = require("url"),
    e = _require.parse,
    _require2 = require("querystring"),
    r = _require2.stringify,
    _require3 = require("https"),
    t = _require3.request;

exports.sendPostRequest = function (o, n) {
  return new Promise(function (i, a) {
    var s = e(o);
    var u = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": (n = r(n || {})).length,
      "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36"
    };
    var d = {
      method: "POST",
      host: s.hostname,
      port: s.port || 443,
      path: s.pathname,
      headers: u
    };
    var l = "";
    var p = t(d, function (e) {
      if (200 !== e.statusCode) return a(new Error("Connect Failed")), void 0;
      e.on("data", function (e) {
        l += e;
      }).on("end", function () {
        var e = null;

        try {
          e = JSON.parse(l);
        } catch (e) {
          return a(e), void 0;
        }

        i(e);
      });
    }).on("error", function (e) {
      a(e);
    }).setTimeout(8e3, function () {
      a(new Error("timeout"));
    });
    var s = e(o),
        u = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": (n = r(n || {})).length,
      "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36"
    },
        d = {
      method: "POST",
      host: s.hostname,
      port: s.port || 443,
      path: s.pathname,
      headers: u
    },
        l = "",
        p = t(d, function (e) {
      if (200 !== e.statusCode) return a(new Error("Connect Failed")), void 0;
      e.on("data", function (e) {
        l += e;
      }).on("end", function () {
        var e = null;

        try {
          e = JSON.parse(l);
        } catch (e) {
          return a(e), void 0;
        }

        i(e);
      });
    }).on("error", function (e) {
      a(e);
    }).setTimeout(8e3, function () {
      a(new Error("timeout"));
    });
    p.write(n), p.end();
  });
}, exports.sendGetRequest = function (o, n) {
  return new Promise(function (i, a) {
    var s = e(o);
    n = r(n || {});
    var u = {
      method: "GET",
      host: s.hostname,
      port: s.port || 443,
      path: s.pathname + "?" + n,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36"
      }
    };
    var d = "";
    var u = {
      method: "GET",
      host: s.hostname,
      port: s.port || 443,
      path: s.pathname + "?" + n,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36"
      }
    },
        d = "";
    t(u, function (e) {
      if (200 !== e.statusCode) return a(new Error("Connect Failed")), void 0;
      e.on("data", function (e) {
        d += e;
      }).on("end", function () {
        var e = null;

        try {
          e = JSON.parse(d);
        } catch (e) {
          return a(e);
        }

        i(e);
      });
    }).on("error", function (e) {
      a(e);
    }).setTimeout(8e3, function () {
      a(new Error("timeout"));
    }).end();
  });
};