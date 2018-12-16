"use strict";

function _asyncToGenerator(fn) {
    return function () {
        var gen = fn.apply(this, arguments);
        return new Promise(function (resolve, reject) {
            function step(key, arg) {
                try {
                    var info = gen[key](arg);
                    var value = info.value;
                } catch (error) {
                    reject(error);
                    return;
                }
                if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function (value) {
                        step("next", value);
                    }, function (err) {
                        step("throw", err);
                    });
                }
            }

            return step("next");
        });
    };
}

var mod_fire_path = require("fire-path");

var mod_fire_url = require("fire-url");

var mod_fire_fs = require("fire-fs");

var mod_util = require("util");

var s = mod_util.format;
var r = mod_util.promisify;

var mod_electron_ipcMain = require("electron").ipcMain;

var mod_globby = require("globby");

var mod_gulp_Gulp = require("gulp").Gulp;

var mod_gulp_rename = require("gulp-rename");

var mod_gulp_util = require("gulp-util");

var mod_event_stream = require("event-stream");

var mod_stream_combiner2 = require("stream-combiner2");

var mod_gulp_sequence = require("gulp-sequence");

var mod_gulp_rev_all = require("gulp-rev-all");

var mod_gulp_rev_delete_original = require("gulp-rev-delete-original");

var mod_del = require("del");

var b = (require("async"), require("lodash"));

var mod_winston = require("winston");

var mod_crypto = require("crypto");

var mod_compiler = require("./compiler");

var mod_native_utils = require("./native-utils");

var mod_sharebuild_platforms = require("../share/build-platforms");

var mod_build_results = require("./build-results");

var k = "build-platform_";
var S = "db://";
var q = "window._CCSettings";
var x = 5;


function O(t) {
    return mod_event_stream.through(function (i) {
        if (".html" === mod_fire_path.extname(i.path)) {
            mod_winston.normal("Generating html from " + i.path);
            var s = t.webOrientation;
            "auto" === s && (s = "");

            var _n = Editor.url("app://node_modules/vConsole/dist/vconsole.min.js");

            var _o = '<script src="' + mod_fire_path.basename(_n) + '"></script>';

            var r = {
                file: i,
                project: t.projectName || mod_fire_path.basename(t.project),
                previewWidth: t.previewWidth,
                previewHeight: t.previewHeight,
                orientation: s,
                webDebugger: t.embedWebDebugger ? _o : ""
            };
            i.contents = new Buffer(mod_gulp_util.template(i.contents, r));
        } else if ("main.js" === mod_fire_path.basename(i.path)) {
            mod_winston.normal("Generating main.js from " + i.path);

            var _e = i.contents.toString();

            var _s = "";

            t.includeAnySDK && (_s = "    \n    if (cc.sys.isNative && cc.sys.isMobile) {\n        jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);\n    }\n"), _e = _e.replace(/<Inject anysdk scripts>/g, _s);
            var _o2 = "qqplay" === t.platform;
            if (_o2 && t.qqplay && t.qqplay.REMOTE_SERVER_ROOT) {
                var _i = 'qqPlayDownloader.REMOTE_SERVER_ROOT = "' + t.qqplay.REMOTE_SERVER_ROOT + '"';
                _e = _e.replace(/qqPlayDownloader.REMOTE_SERVER_ROOT = ""/g, _i);
            }

            var _a = "wechatgame-subcontext" === t.platform;

            var _c = "wechatgame" === t.platform || _a;

            r = {
                file: i,
                renderMode: t.renderMode,
                isWeChatGame: _c,
                isWeChatSubdomain: _a,
                isQQPlay: _o2,
                engineCode: "",
                projectCode: ""
            };
            if (_o2) {
                var n = t.debug;
                r.engineCode = n ? "'GameRes://cocos2d-js.js'" : "'GameRes://cocos2d-js-min.js'", r.projectCode = n ? "'GameRes://src/project.dev.js'" : "'GameRes://src/project.js'";
            }
            i.contents = new Buffer(mod_gulp_util.template(_e, r));
        }
        this.emit("data", i);
    });
}

function R(e, t) {
    var i = JSON.stringify(e, null, t ? 4 : 0).replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/gm, "$1:");
    return i = t ? q + " = " + i + ";\n" : q + "=" + i + ";";
}

function M(e, i) {
    var s = e.customSettings;
    var r = e.debug;
    var n = Object.create(null);
    var o = !e.preview;
    var a = Editor.assetdb;
    var c = Editor.assets;
    var l = Editor.Utils.UuidUtils.compressUuid;


    function u(e, i, s, r) {
        if (!e) return console.error("can not get url to build: " + i), null;
        if (!e.startsWith(S)) return console.error("unknown url to build: " + e), null;
        var n = Editor.assetdb.isSubAssetByUuid(i);
        if (n) {
            var o = mod_fire_url.dirname(e);
            var a = mod_fire_url.extname(o);

            a && (o = o.slice(0, -a.length)), e = o;
        }
        var c = e.indexOf("/", S.length);
        if (c < 0) return console.error("no mount to build: " + e), null;
        var l = e.slice(S.length, c);
        if (!l) return console.error("unknown mount to build: " + e), null;
        var u = e.slice(c + 1);
        return u ? ("audio-clip" === s && (r || (r = Editor.assetdb.loadMetaByUuid(i)), r && "1" === r.downloadMode && (u += "?useDom=1")), { mountPoint: l, relative: u, uuid: i, isSubAsset: n }) : (console.error("unknown relative to build: " + e), null);
    }

    console.time("queryAssets"), function (e, t) {
        var i = mod_sharebuild_platforms[s.platform].isNative;
        if (e) {
            for (r = [], n = 0, o = e.length, undefined; n < o; n++) {
                var r;
                var n;
                var o;
                var l = e[n];
                var d = a.uuidToUrl(l);
                var p = a.assetInfoByUuid(l);

                if (p) {
                    var m = p.type;
                    if (m) {
                        var f = u(d, l, m);
                        if (!f) continue;
                        var g = c[m];
                        f.ctor = g || cc.RawAsset, r.push(f);
                    } else console.error("Can not get asset type of " + l);
                } else console.error("Can not get asset info of " + l);
            }
            a.queryMetas("db://**/*", "javascript", function (e, s) {
                var n;
                n = i ? function (e) {
                    return e.isPlugin && e.loadPluginInNative;
                } : function (e) {
                    return e.isPlugin && e.loadPluginInWeb;
                };
                var o = s.filter(n).map(function (e) {
                    return e.uuid;
                });
                t(null, r, o);
            });
        } else console.time("queryMetas"), a.queryMetas("db://**/*", "", function (e, s) {
            console.timeEnd("queryMetas");
            for (r = [], n = [], o = 0, l = s.length, undefined; o < l; o++) {
                var r;
                var n;
                var o;
                var l;
                var d = s[o];
                var p = d.assetType();

                if ("folder" !== p) {
                    "javascript" === p && d.isPlugin && (i ? d.loadPluginInNative && n.push(d.uuid) : d.loadPluginInWeb && n.push(d.uuid));
                    var m = d.uuid;
                    var f = u(a.uuidToUrl(m), m, p, d);

                    if (f && f.relative.startsWith("resources/")) {
                        var g = c[p];
                        f.ctor = g || cc.RawAsset, r.push(f);
                    }
                }
            }
            t(e, r, n);
        });
    }(e.uuidList, function (t, c, u) {
        if (console.timeEnd("queryAssets"), t) return i(t);
        console.time("writeAssets"), function (e, t) {
            var i;
            var s = cc.RawAsset;
            var n = e.rawAssets = { assets: {} };

            r || (i = e.assetTypes = []);
            var a = {};
            t = b.sortBy(t, "relative");
            for (c = Object.create(null), u = 0, d = t.length, undefined; u < d; u++) {
                var c;
                var u;
                var d;
                var p = t[u];
                var m = p.mountPoint;

                if (!p.ctor || s.isRawAssetType(p.ctor)) {
                    Editor.error("Not support to build RawAsset since 1.10, refactor to normal Asset please. Path: '" + p.relative + "'");
                    continue;
                }
                if (!p.relative.startsWith("resources/")) continue;
                if (p.isSubAsset && cc.js.isChildClassOf(p.ctor, cc.SpriteFrame)) {
                    var f;
                    var g = p.relative;

                    if (g in c) f = c[g];else {
                        (function () {
                            var e = g + ".";
                            f = t.some(function (t) {
                                var i = t.relative;
                                return (i === g || i.startsWith(e)) && !t.isSubAsset && t.ctor === cc.SpriteAtlas;
                            }), c[g] = f;
                        })();
                    }
                    if (f) continue;
                }
                var j = n[m];
                j || (j = n[m] = {});
                var h;

                var v = cc.js._getClassId(p.ctor, false);

                if (!r) {
                    var w = a[v];
                    undefined === w && (i.push(v), w = i.length - 1, a[v] = w), v = w;
                }
                var y = p.relative.slice("resources/".length);
                h = p.isSubAsset ? [y, v, 1] : [y, v];
                var _e2 = p.uuid;
                o && (_e2 = l(_e2, true)), j[_e2] = h;
            }
        }(s, c), console.timeEnd("writeAssets"), function (e, t) {
            for (i = [], s = 0, undefined; s < t.length; s++) {
                var i;
                var s;
                var r = t[s];
                var o = a.uuidToUrl(r);

                o = o.slice(S.length), n[o] = r, i.push(o);
            }
            i.sort(), i.length > 0 && (e.jsList = i);
        }(s, u), e.sceneList.length > 0 && (s.launchScene = Editor.assetdb.uuidToUrl(e.sceneList[0])), function (e, t) {
            t = t.map(function (e) {
                var t = Editor.assetdb.uuidToUrl(e);
                return t ? (o && (e = l(e, true)), { url: t, uuid: e }) : (Editor.warn("Can not get url of scene " + e + ", it maybe deleted."), null);
            }).filter(Boolean), e.scenes = t;
        }(s, e.sceneList), s.packedAssets = function (e) {
            if (o && e) {
                var t = {};
                for (var i in e) {
                    var s = e[i];
                    t[i] = s.map(function (e) {
                        return l(e, true);
                    });
                }
                e = t;
            }
            return e;
        }(e.packedAssets) || {}, s.md5AssetsMap = {}, s.orientation = e.webOrientation, r && (s.debug = true), s.subpackages = e.subpackages, s.server = e.server, (!("stringify" in e) || e.stringify) && (s = R(s, r)), i(null, s, n);
    });
}

exports.startWithArgs = function (t, S) {
    var ie = function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/regeneratorRuntime.mark(function _callee(t) {
            var i;
            var s;
            var n;
            var a;
            var c;
            var l;
            var u;

            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            i = Editor.Utils.UuidUtils.getUuidFromLibPath, s = Editor.Utils.UuidUtils.compressUuid, n = [];
                            _context.next = 3;
                            return r(mod_globby)(t, { nodir: true });

                        case 3:
                            a = _context.sent;
                            c = 0;

                        case 5:
                            if (!(c < a.length)) {
                                _context.next = 11;
                                break;
                            }

                            l = a[c], u = i(mod_fire_path.relative(V, l));
                            u ? n.push(s(u, true), te(l).hash) : Editor.warn('Can not resolve uuid for path "' + l + '", skip the MD5 process on it.');

                        case 8:
                            ++c;
                            _context.next = 5;
                            break;

                        case 11:
                            return _context.abrupt("return", n);

                        case 12:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function ie(_x) {
            return _ref.apply(this, arguments);
        };
    }();

    function A(e) {
        C.isRunning ? C.stop(e) : Editor.error(e);
    }

    var _;

    var C = new mod_gulp_Gulp();
    var T = mod_gulp_sequence.use(C);
    var U = t.project;
    var D = t.projectName || mod_fire_path.basename(U);
    var $ = t.platform;
    var B = t.actualPlatform;
    var L = !!t.nativeRenderer;
    var W = "wechatgame-subcontext" === $;
    var F = "wechatgame" === $ || W;
    var N = !!t.debug;
    var P = t.sourceMaps;
    var I = "qqplay" === t.platform;

    if (W) {
        var _i2 = mod_fire_path.dirname(t.dest);
        t.dest = mod_fire_path.join(_i2, D);
    }
    I ? _ = t.qqplay.orientation : "auto" === (_ = t.webOrientation) && (_ = "");
    var J = t.debugBuildWorker;
    var G = mod_sharebuild_platforms[$].isNative;
    var V = t.dest;

    if (Editor.log("Building " + U), Editor.log("Destination " + V), mod_fire_path.normalize(V) === mod_fire_path.normalize(U)) return S(new Error("Can not export project at project folder."));
    if (mod_fire_path.contains(Editor.App.path, V)) return S(new Error("Can not export project to fireball app folder."));
    var H = {
        tmplBase: mod_fire_path.resolve(Editor.url("unpack://static"), "build-templates"),
        jsCacheDir: Editor.url("unpack://engine/bin/.cache/" + $)
    };
    var z = undefined;
    var Q;
    Object.assign(H, {
        template_shares: mod_fire_path.join(H.tmplBase, "shares/**/*"),
        template_web_desktop: mod_fire_path.join(H.tmplBase, N ? "web-desktop/template-dev/**/*" : "web-desktop/template/**/*"),
        template_web_mobile: mod_fire_path.join(H.tmplBase, N ? "web-mobile/template-dev/**/*" : "web-mobile/template/**/*"),
        bundledScript: mod_fire_path.join(V, "src", N ? "project.dev.js" : "project.js"),
        src: mod_fire_path.join(V, "src"),
        res: mod_fire_path.join(V, "res"),
        settings: mod_fire_path.join(V, "src/settings.js"),
        jsCache: mod_fire_path.join(H.jsCacheDir, N ? G ? "cocos2d-jsb.js" : "cocos2d-js.js" : G ? "cocos2d-jsb-min.js" : "cocos2d-js-min.js"),
        jsCacheExcludes: mod_fire_path.join(H.jsCacheDir, N ? ".excludes" : ".excludes-min"),
        webDebuggerSrc: Editor.url("app://node_modules/vconsole/dist/vconsole.min.js"),
        template_instant_games: mod_fire_path.join(H.tmplBase, "fb-instant-games/**/*"),
        quickScripts: mod_fire_path.join(U, "temp/quick-scripts"),
        destQuickScripts: mod_fire_path.join(V, "scripts")
    }), C.task("compile", function (e) {
        Editor.Ipc.sendToMain("builder:state-changed", "compile", 0.1);
        var t = {
            project: U,
            platform: $,
            actualPlatform: B,
            destRoot: V,
            dest: H.bundledScript,
            debug: N,
            sourceMaps: P
        };
        mod_compiler._runTask(t, function (t, i) {
            t ? A(t) : (z = i, e());
        });
    }), C.task("build-assets", ["compile"], function (e) {
        var i;
        Editor.log("Start building assets"), Editor.Ipc.sendToMain("builder:state-changed", "spawn-worker", 0.3), Q = new mod_build_results();

        function s(t, s) {
            if (i && !J) {
                var r = i;
                i = null, r.nativeWin.destroy();
            }
            C.isRunning ? e(new Error(s)) : Editor.error(s);
        }

        mod_electron_ipcMain.once("app:build-project-abort", s), mod_winston.normal("Start spawn build-worker");
        var r = false;
        Editor.App.spawnWorker("app://editor/page/build/build-worker", function (o, a) {
            var c;
            mod_winston.normal("Finish spawn build-worker"), i = o, r || (r = true, a.once("closed", function () {
                c || (mod_electron_ipcMain.removeListener("app:build-project-abort", s), Editor.log("Finish building assets"), e());
            })), mod_winston.normal("Start init build-worker"), Editor.Ipc.sendToMain("builder:state-changed", "init-worker", 0.32), i.send("app:init-build-worker", $, N, function (e) {
                function s() {
                    !i || J || (i.close(), i = null);
                }

                e ? (A(e), c = true, s()) : i && (mod_winston.normal("Finish init build-worker"), mod_winston.normal("Start build-assets in worker"), Editor.Ipc.sendToMain("builder:state-changed", "build-assets", 0.65), i.send("app:build-assets", H.res, $, N, b.pick(t, "scenes", "inlineSpriteFrames", "mergeStartScene", "optimizeHotUpdate", "wechatgame"), function (e, t, i) {
                    e ? (A(e), c = true) : t && (Q._buildAssets = t, Q._packedAssets = i), mod_winston.normal("Finish build-assets in worker"), s();
                }, -1));
            }, -1);
        }, J, true);
    });
    var K = null;
    var X = null;

    C.task("build-settings", ["build-assets"], function (e) {
        var i = Editor.Profile.load("profile://project/project.json");
        var s = {
            stringify: false,
            customSettings: {
                platform: $,
                groupList: i.data["group-list"],
                collisionMatrix: i.data["collision-matrix"]
            },
            sceneList: t.scenes,
            uuidList: Q.getAssetUuids(),
            packedAssets: Q._packedAssets,
            webOrientation: _,
            debug: N,
            subpackages: z
        };
        "android-instant" === t.platform && (s.server = t["android-instant"].REMOTE_SERVER_ROOT), M(s, function (t, i, s) {
            t ? A(t) : (K = i, X = s, e());
        });
    });
    var Z = null;

    function Y(e, i) {
        var s = [H.template_shares, e];
        return C.src(s).pipe(O(t)).pipe(C.dest(V)).on("end", i);
    }

    C.task("compress-settings", function () {
        if (N) return;
        var e = {};
        (function () {
            var t = K.uuids = [];
            var i = {};


            function s(s) {
                var r = (i[s] || 0) + 1;
                i[s] = r, r >= 2 && !(s in e) && (e[s] = t.length, t.push(s));
            }

            var r = K.rawAssets;
            for (var _e3 in r) {
                var _t = r[_e3];
                for (var _e4 in _t) {
                    s(_e4);
                }
            }
            var n = K.scenes;
            for (var _e5 = 0; _e5 < n.length; ++_e5) {
                s(n[_e5].uuid);
            }
            var o = K.packedAssets;
            for (var _e6 in o) {
                o[_e6].forEach(s);
            }
            var a = K.md5AssetsMap;
            for (var _e7 in a) {
                var _t2 = a[_e7];
                for (var _e8 = 0; _e8 < _t2.length; _e8 += 2) {
                    s(_t2[_e8]);
                }
            }
        })();
        var i = K.rawAssets;
        var s = K.rawAssets = {};

        for (var _t3 in i) {
            var _n2 = i[_t3];

            var _o3 = s[_t3] = {};

            for (var _t4 in _n2) {
                var r = _n2[_t4];
                var _i3 = e[_t4];
                undefined !== _i3 && (_t4 = _i3), _o3[_t4] = r;
            }
        }
        var n = K.scenes;
        for (var _t5 = 0; _t5 < n.length; ++_t5) {
            var _i4 = n[_t5];
            var _s2 = e[_i4.uuid];

            undefined !== _s2 && (_i4.uuid = _s2);
        }
        var o = K.packedAssets;
        for (var _t6 in o) {
            var _i5 = o[_t6];
            for (var _t7 = 0; _t7 < _i5.length; ++_t7) {
                var _s3 = e[_i5[_t7]];
                undefined !== _s3 && (_i5[_t7] = _s3);
            }
        }
        if (t.md5Cache) {
            var _t8 = K.md5AssetsMap;
            for (var _i6 in _t8) {
                var _s4 = _t8[_i6];
                for (var _t9 = 0; _t9 < _s4.length; _t9 += 2) {
                    var _i7 = e[_s4[_t9]];
                    undefined !== _i7 && (_s4[_t9] = _i7);
                }
            }
            Z = function Z(e) {
                var t = e.uuids;
                var i = e.md5AssetsMap;

                for (var s in i) {
                    for (r = i[s], n = 0, undefined; n < r.length; n += 2) {
                        var r;
                        var n;

                        "number" == typeof r[n] && (r[n] = t[r[n]]);
                    }
                }
            };
        }
    }), C.task("build-web-desktop-template", function (e) {
        Y(H.template_web_desktop, e);
    }), C.task("build-web-mobile-template", function (e) {
        Y(H.template_web_mobile, e);
    }), C.task("build-fb-instant-games-template", function (e) {
        Y(H.template_instant_games, e);
    }), C.task("build-plugin-scripts", ["build-settings"], function () {
        Editor.log("Start building plugin scripts");
        var t = Editor.assetdb;
        var i = [];

        var _loop = function _loop() {
            r = X[s];
            var c = t.uuidToFspath(r);
            n = mod_fire_path.dirname(mod_fire_path.join(H.src, s));
            console.log("start gulpping " + c + " to " + n);
            o = C.src(c);
            if (!N) {
                a = Editor.require("unpack://engine/gulp/util/utils").uglify;
                o = o.pipe(a("build", { jsb: G, debug: N, wechatgame: F, qqplay: I })), mod_stream_combiner2.obj([o]).on("error", function (e) {
                    A(e.message);
                });
            }
            o = o.pipe(C.dest(n)).on("end", function () {
                console.log("finish gulpping", c);
            }), i.push(o);
        };

        for (var s in X) {
            var r;
            var n;
            var o;
            var a;

            _loop();
        }
        return i.length > 0 ? mod_event_stream.merge(i).on("end", function () {
            Editor.log("Finish building plugin scripts");
        }) : null;
    }), C.task("copy-main-js", function () {
        return C.src([mod_fire_path.join(H.tmplBase, "shares/main.js")]).pipe(O(t)).pipe(C.dest(V));
    }), C.task("import-script-statically", function (t) {
        var s;
        var r = mod_fire_path.join(V, "main.js");
        var n = mod_fire_fs.readFileSync(r, "utf8");

        if (I && K.jsList && K.jsList.length > 0) {
            s = "\n// plugin script code\n";
            var o = H.src;
            if (K.jsList.map(function (t) {
                var i = mod_fire_path.relative(V, mod_fire_path.resolve(o, t));
                Editor.isWin32 && (i = i.replace(/\\/g, "/")), s += "BK.Script.loadlib('GameRes://" + i + "'); \n";
            }), s = n.replace("<Inject plugin code>", s), K.jsList = undefined, s === n) return t("Inject plugin code failure for qqplay"), undefined;
        } else s = n.replace("<Inject plugin code>", "");
        mod_fire_fs.writeFileSync(r, s), t();
    }), C.task("copy-build-template", function (s) {
        Editor.Ipc.sendToMain("builder:state-changed", "copy-build-templates", 0.98);
        var r = mod_fire_path.basename(t.dest);
        var n = mod_fire_path.join(t.project, "build-templates");

        if (!mod_fire_fs.existsSync(n)) return s();
        var a = mod_fire_path.join(n, r, "**");
        mod_globby(a, function (r, o) {
            (o = o.map(function (t) {
                return mod_fire_path.resolve(t);
            })).forEach(function (s) {
                var r = mod_fire_path.relative(n, s);
                var o = mod_fire_path.join(t.buildPath, r);

                mod_fire_fs.ensureDirSync(mod_fire_path.dirname(o)), mod_fire_fs.copySync(s, o);
            }), s && s(r);
        });
    }), C.task("build-common", ["compile", "build-assets", "build-settings", "build-plugin-scripts"]);
    var ee = require(Editor.url("unpack://engine/gulp/tasks/engine"));

    function te(t) {
        var s = mod_fire_path.basename(t);
        var r = mod_fire_path.dirname(t);
        var n = mod_fire_path.join(r, s);

        var o = mod_fire_fs.readFileSync(n);
        var a = mod_crypto.createHash("md5").update(o).digest("hex");
        a = a.slice(0, x);
        var c;
        var u = mod_fire_path.basename(r);

        if (Editor.Utils.UuidUtils.isUuid(u)) {
            var d = r + "." + a;
            c = mod_fire_path.join(d, s);
            try {
                mod_fire_fs.renameSync(r, d);
            } catch (e) {
                mod_gulp_util.log("\x1B[31m[MD5 ASSETS] write file error: " + e.message + "\x1B[0m");
            }
        } else {
            var p = s.lastIndexOf(".");
            var m = ~p ? s.slice(0, p) + "." + a + s.slice(p) : s + "." + a;

            c = mod_fire_path.join(r, m);
            try {
                mod_fire_fs.renameSync(n, c);
            } catch (e) {
                mod_gulp_util.log("\x1B[31m[MD5 ASSETS] write file error: " + e.message + "\x1B[0m");
            }
        }
        return { hash: a, path: c };
    }

    C.task("build-cocos2d", function (s) {
        Editor.Ipc.sendToAll("builder:state-changed", "cut-engine", 0);
        var r = G ? mod_fire_path.join(V, "src") : V;
        mod_fire_fs.ensureDirSync(H.jsCacheDir), t.excludedModules = t.excludedModules ? t.excludedModules.sort() : [];
        var n = false;
        if (mod_fire_fs.existsSync(H.jsCacheExcludes)) {
            var _e9 = mod_fire_fs.readJSONSync(H.jsCacheExcludes);
            _e9.excludes && _e9.version && (n = Editor.versions.cocos2d === _e9.version && L === _e9.nativeRenderer && _e9.excludes.toString() === t.excludedModules.toString() && _e9.sourceMaps === t.sourceMaps);
        }

        function o() {
            var e = [H.jsCache];
            P && e.push(H.jsCache + ".map");
            var t = C.src(e);
            return G && (t = t.pipe(mod_gulp_rename("cocos2d-jsb.js"))), t = t.pipe(C.dest(r));
        }

        if (n && mod_fire_fs.existsSync(H.jsCache)) return o().on("end", s), undefined;
        var a = [];

        var l = require(Editor.url("unpack://engine/modules.json"));

        l && l.length > 0 && (t.excludedModules && t.excludedModules.forEach(function (t) {
            l.some(function (i) {
                if (i.name === t) return i.entries && i.entries.forEach(function (t) {
                    a.push(mod_fire_path.join(Editor.url("unpack://engine"), t));
                }), true;
            });
        }), "wechatgame-subcontext" === $ && l.forEach(function (t) {
            ("WebGL Renderer" === t.name || t.dependencies && -1 !== t.dependencies.indexOf("WebGL Renderer")) && t.entries && t.entries.forEach(function (t) {
                a.push(mod_fire_path.join(Editor.url("unpack://engine"), t));
            });
        }), console.log("Exclude modules: " + a)), function (e, i, s) {
            ee[N ? G ? "buildJsb" : "buildCocosJs" : G ? "buildJsbMin" : "buildCocosJsMin"](Editor.url("unpack://engine/index.js"), i, e, {
                wechatgame: F,
                qqplay: I,
                runtime: "runtime" === B || "vivo-runtime" === B || "oppo-runtime" === B,
                nativeRenderer: L,
                wechatgameSub: W
            }, s, t.sourceMaps);
        }(a, H.jsCache, function () {
            o().on("end", function () {
                mod_fire_fs.writeFileSync(H.jsCacheExcludes, JSON.stringify({
                    excludes: t.excludedModules,
                    version: Editor.versions.cocos2d,
                    nativeRenderer: L,
                    sourceMaps: t.sourceMaps
                }), null, 4), s();
            });
        });
    }), C.task("copy-webDebugger", function (s) {
        var r = mod_fire_path.join(V, mod_fire_path.basename(H.webDebuggerSrc));
        t.embedWebDebugger ? mod_fire_fs.copy(H.webDebuggerSrc, r, s) : mod_del(r, { force: true }, s);
    }), C.task("revision-res-jsList", _asyncToGenerator(
    /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var i;
        var s;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!t.md5Cache) {
                            _context2.next = 9;
                            break;
                        }

                        console.time("revision");
                        _context2.next = 4;
                        return ie(mod_fire_path.join(H.res, "import", "**"));

                    case 4:
                        i = _context2.sent;
                        _context2.next = 7;
                        return ie(mod_fire_path.join(H.res, "raw-assets", "**"));

                    case 7:
                        s = _context2.sent;
                        K.md5AssetsMap = { import: i, "raw-assets": s }, function (t) {
                            if (t.jsList && t.jsList.length > 0) {
                                var i = H.src;
                                var s = t.jsList.map(function (t) {
                                    return mod_fire_path.resolve(i, t);
                                }).map(function (t) {
                                    return t = te(t).path, mod_fire_path.relative(i, t).replace(/\\/g, "/");
                                });

                                s.sort(), t.jsList = s;
                            }
                        }(K), console.timeEnd("revision");
                    case 9:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }))), C.task("save-settings", function (e) {
        var t = R(K, N);
        Z && (t += "(" + Z.toString() + ")(" + q + ");"), mod_fire_fs.writeFile(H.settings, t, e);
    }), C.task("revision-other", function (i) {
        if (t.md5Cache) {
            var s = V;
            var r = ["index.html"];

            G && (r = r.concat(["main.js", "cocos-project-template.json", "project.json"]));
            var n = [mod_fire_path.relative(s, H.bundledScript)];
            F ? (r = r.concat(["game.js", "game.json", "project.config.json", "index.js"]), n = n.concat(["game.json", "project.config.json"])) : I && (r = r.concat(["main.js", "cocos2d-js.js", "cocos2d-js-min.js", "project.dev.js", "project.js", "settings.js"])), Editor.isWin32 && (n = n.map(function (e) {
                return e.replace(/\\/g, "/");
            })), C.src(["src/*.js", "*"], { cwd: V, base: s }).pipe(mod_gulp_rev_all.revision({
                debug: true,
                hashLength: x,
                dontRenameFile: r,
                dontSearchFile: n,
                annotator: function annotator(e, t) {
                    return [{ contents: e, path: t }];
                },
                replacer: function replacer(t, i, s, r) {
                    ".map" === mod_fire_path.extname(t.path) && r.revPathOriginal + ".map" !== t.path || (t.contents = t.contents.replace(i, "$1" + s + "$3$4"));
                }
            })).pipe(mod_gulp_rev_delete_original()).pipe(C.dest(V)).on("end", i);
        } else i();
    }), C.task("finish-build", T("copy-build-template", "import-script-statically", "before-change-files", "revision-res-jsList", "compress-settings", "save-settings", "revision-other")), function () {
        var t = null;
        C.task("pack-wechatgame-subdomain", function () {
            t = function () {
                var t = Editor.require("app://editor/share/engine-extends/json-packer");
                var s = Editor.Utils.UuidUtils.compressUuid;
                var r = mod_globby.sync(mod_fire_path.join(H.res, "import/**"), { nodir: true });
                var n = new t();

                for (var _t10 = 0; _t10 < r.length; ++_t10) {
                    var _o4 = r[_t10];

                    var _a2 = mod_fire_path.extname(_o4);

                    if (".json" !== _a2) continue;

                    var _c2 = mod_fire_fs.readJsonSync(_o4);

                    var _l = s(mod_fire_path.basename(_o4, _a2), true);

                    n.add(_l, _c2), mod_del.sync(_o4, { force: true });
                }
                return n.pack();
            }(), mod_del.sync(mod_fire_path.join(V, "game.json"), { force: true }), mod_del.sync(mod_fire_path.join(V, "project.config.json"), { force: true });
            var s = mod_fire_path.join(V, "game.js");
            var r = mod_fire_fs.readFileSync(s, "utf8");
            var n = 'SUBCONTEXT_ROOT = "' + D + '"';

            r = r.replace(/SUBCONTEXT_ROOT = ""/g, n), mod_fire_fs.writeFileSync(mod_fire_path.join(V, "index.js"), r), mod_del.sync(s, { force: true });
            var a = Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js");
            var c = mod_fire_path.join(V, "libs/sub-context-adapter.js");

            mod_fire_fs.copySync(a, c);
        }), C.task("extend-settings-wechat-subdomain", function () {
            K.packedAssets = { WECHAT_SUBDOMAIN: t.indices }, K.WECHAT_SUBDOMAIN_DATA = JSON.parse(t.data), t = null;
        });
    }(), C.task("copy-wechatgame-files", function () {
        var i = Editor.url("packages://weapp-adapter/wechatgame/libs/weapp-adapter/");
        var s = [Editor.url("packages://weapp-adapter/wechatgame/**/*"), "!" + Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js")];
        return C.src(s).pipe(mod_event_stream.through(function (s) {
            var r = mod_fire_path.basename(s.path);
            var n = mod_fire_path.contains(i, s.path);

            if ("game.js" === r) {
                var o = s.contents.toString();
                var a = 'REMOTE_SERVER_ROOT = "' + t.wechatgame.REMOTE_SERVER_ROOT + '"';

                o = o.replace(/REMOTE_SERVER_ROOT = ""/g, a), s.contents = new Buffer(o);
            } else if ("game.json" === r) {
                var _e10 = JSON.parse(s.contents.toString());
                if (_e10.deviceOrientation = t.wechatgame.orientation, t.wechatgame.subContext && !W ? _e10.openDataContext = t.wechatgame.subContext : delete _e10.openDataContext, z) {
                    _e10.subpackages = [];
                    for (var _t11 in z) {
                        _e10.subpackages.push({ name: _t11, root: z[_t11].path });
                    }
                }
                s.contents = new Buffer(JSON.stringify(_e10, null, 4));
            } else if ("project.config.json" === r) {
                var _e11 = JSON.parse(s.contents.toString());
                _e11.appid = t.wechatgame.appid || "wx6ac3f5090a6b99c5", _e11.projectname = D, s.contents = new Buffer(JSON.stringify(_e11, null, 4));
            } else if (".js" === mod_fire_path.extname(r) && n) {
                var c;
                try {
                    c = require("babel-core").transform(s.contents.toString(), {
                        ast: false,
                        highlightCode: false,
                        sourceMaps: false,
                        compact: false,
                        filename: s.path,
                        presets: ["env"],
                        plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-export-extensions", "add-module-exports"]
                    });
                } catch (e) {
                    return e.stack = "Compile " + r + " error: " + e.stack, this.emit("error", e);
                }
                s.contents = new Buffer(c.code);
            }
            this.emit("data", s);
        })).pipe(C.dest(V));
    }), C.task("copy-qqplay-files", function () {
        var e = [Editor.url("packages://qqplay-adapter/qqplay/**/*")];
        return C.src(e).pipe(mod_event_stream.through(function (e) {
            this.emit("data", e);
        })).pipe(C.dest(V));
    }), C.task("before-change-files", function (e) {
        var i = require(Editor.url("app://editor/share/build-utils"));
        Editor.Builder.doCustomProcess("before-change-files", i.getCommonOptions(t), Q, e);
    }), C.task(k + "web-desktop", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-desktop-template", "finish-build")), C.task(k + "web-mobile", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-mobile-template", "finish-build")), C.task(k + "fb-instant-games", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-fb-instant-games-template", "finish-build")), C.task(k + "wechatgame", T("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "finish-build")), C.task(k + "wechatgame-subcontext", T("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "pack-wechatgame-subdomain", "extend-settings-wechat-subdomain", "finish-build")), C.task(k + "qqplay", T("build-cocos2d", "build-common", "copy-main-js", "copy-qqplay-files", "finish-build")), C.task("copy-runtime-scripts", function () {
        var t = mod_fire_path.join(V, "src");
        return C.src(mod_fire_path.join(H.tmplBase, "runtime/**/*.js")).pipe(C.dest(t));
    }), C.task("encrypt-src-js", function (s) {
        if (N || !t.encryptJs) return s(), undefined;
        var r = mod_fire_path.join(V, "src");
        var n = mod_fire_path.resolve(r, "../js backups (useful for debugging)");

        mod_fire_fs.copy(r, n, function (e) {
            e && Editor.warn("Failed to backup js files for debugging.", e), mod_native_utils.encryptJsFiles(t, s);
        });
    }), C.task("copy-jsb-adapter", function () {
        var s = Editor.url("packages://jsb-adapter/dist");
        var r = mod_fire_path.join(V, "jsb-adapter");
        var n = [];

        var o = require(Editor.url("packages://jsb-adapter/modules.json"));

        t.excludedModules.forEach(function (t) {
            o.some(function (i) {
                if (i.name === t) return i.entries.forEach(function (t) {
                    n.push(mod_fire_path.join(Editor.url("packages://jsb-adapter"), t));
                }), undefined;
            });
        }), mod_fire_fs.copySync(s, r, {
            filter: function filter(e) {
                for (var _t12 = 0; _t12 < n.length; ++_t12) {
                    if (n[_t12] === e) return false;
                }
                return true;
            }
        });
    }), C.task("copy-native-files", T("build-common", "copy-runtime-scripts", "copy-jsb-adapter", "copy-main-js", "finish-build", "encrypt-src-js")), C.task("build-cocos-native-project", function (e) {
        mod_native_utils.build(t, e);
    }), C.task("build-native-project", T("build-cocos-native-project", "build-cocos2d", "copy-native-files")), C.task(k + "android", ["build-native-project"]), C.task(k + "ios", ["build-native-project"]), C.task(k + "win32", ["build-native-project"]), C.task(k + "mac", ["build-native-project"]), C.task(k + "android-instant", ["build-native-project"]);
    var se = k + $;
    if (se in C.tasks) {
        var re;
        re = G ? [H.res + "/**/*", H.src + "/*/"] : mod_fire_path.join(V, "**/*"), Editor.log("Delete " + re), mod_del(re, { force: true }, function (e) {
            if (e) return S(e);
            C.start(se, function (e) {
                e ? S(e) : (G || Editor.Ipc.sendToMain("app:update-build-preview-path", V), S(null, Q));
            });
        });
    } else {
        var ne = [];
        for (var oe in C.tasks) {
            0 === oe.indexOf(k) && ne.push(oe.substring(k.length));
        }
        S(new Error(s("Not support %s platform, available platform currently: %s", $, ne)));
    }
}, exports.getTemplateFillPipe = O, exports.buildSettings = M;