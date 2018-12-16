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
                    return Promise.resolve(value).then(
                        function (value) {
                            step("next", value);
                        },
                        function (err) {
                            step("throw", err);
                        }
                    );
                }
            }

            return step("next");
        });
    };
}

var e = require("fire-path"),
    t = require("fire-url"),
    i = require("fire-fs"),
    _require = require("util"),
    s = _require.format,
    r = _require.promisify,
    n = require("electron").ipcMain,
    o = require("globby"),
    a = require("gulp").Gulp,
    c = require("gulp-rename"),
    l = require("gulp-util"),
    u = require("event-stream"),
    d = require("stream-combiner2"),
    p = require("gulp-sequence"),
    m = require("gulp-rev-all"),
    f = require("gulp-rev-delete-original"),
    g = require("del"),
    b = (require("async"), require("lodash")),
    j = require("winston"),
    h = require("crypto"),
    v = require("./compiler"),
    w = require("./native-utils"),
    y = require("../share/build-platforms"),
    E = require("./build-results"),
    k = "build-platform_",
    S = "db://",
    q = "window._CCSettings",
    x = 5;

function O(t) {
    return u.through(function (i) {
        if (".html" === e.extname(i.path)) {
            j.normal("Generating html from " + i.path);
            var s = t.webOrientation;
            "auto" === s && (s = "");
            var _n = Editor.url("app://node_modules/vConsole/dist/vconsole.min.js"),
                _o = '<script src="' + e.basename(_n) + '"></script>';
            var r = {
                file: i,
                project: t.projectName || e.basename(t.project),
                previewWidth: t.previewWidth,
                previewHeight: t.previewHeight,
                orientation: s,
                webDebugger: t.embedWebDebugger ? _o : ""
            };
            i.contents = new Buffer(l.template(i.contents, r));
        } else if ("main.js" === e.basename(i.path)) {
            j.normal("Generating main.js from " + i.path);
            var _e = i.contents.toString(),
                _s = "";
            t.includeAnySDK &&
            (_s =
                "    \n    if (cc.sys.isNative && cc.sys.isMobile) {\n        jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);\n    }\n"),
                (_e = _e.replace(/<Inject anysdk scripts>/g, _s));
            var _o2 = "qqplay" === t.platform;
            if (_o2 && t.qqplay && t.qqplay.REMOTE_SERVER_ROOT) {
                var _i =
                    'qqPlayDownloader.REMOTE_SERVER_ROOT = "' +
                    t.qqplay.REMOTE_SERVER_ROOT +
                    '"';
                _e = _e.replace(/qqPlayDownloader.REMOTE_SERVER_ROOT = ""/g, _i);
            }
            var _a = "wechatgame-subcontext" === t.platform,
                _c = "wechatgame" === t.platform || _a;
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
                (r.engineCode = n
                    ? "'GameRes://cocos2d-js.js'"
                    : "'GameRes://cocos2d-js-min.js'"),
                    (r.projectCode = n
                        ? "'GameRes://src/project.dev.js'"
                        : "'GameRes://src/project.js'");
            }
            i.contents = new Buffer(l.template(_e, r));
        }
        this.emit("data", i);
    });
}

function R(e, t) {
    var i = JSON.stringify(e, null, t ? 4 : 0).replace(
        /"([A-Za-z_$][0-9A-Za-z_$]*)":/gm,
        "$1:"
    );
    return (i = t ? q + " = " + i + ";\n" : q + "=" + i + ";");
}

function M(e, i) {
    var s = e.customSettings,
        r = e.debug,
        n = Object.create(null),
        o = !e.preview,
        a = Editor.assetdb,
        c = Editor.assets,
        l = Editor.Utils.UuidUtils.compressUuid;

    function u(e, i, s, r) {
        if (!e) return console.error("can not get url to build: " + i), null;
        if (!e.startsWith(S))
            return console.error("unknown url to build: " + e), null;
        var n = Editor.assetdb.isSubAssetByUuid(i);
        if (n) {
            var o = t.dirname(e),
                a = t.extname(o);
            a && (o = o.slice(0, -a.length)), (e = o);
        }
        var c = e.indexOf("/", S.length);
        if (c < 0) return console.error("no mount to build: " + e), null;
        var l = e.slice(S.length, c);
        if (!l) return console.error("unknown mount to build: " + e), null;
        var u = e.slice(c + 1);
        return u
            ? ("audio-clip" === s &&
            (r || (r = Editor.assetdb.loadMetaByUuid(i)),
            r && "1" === r.downloadMode && (u += "?useDom=1")),
                {mountPoint: l, relative: u, uuid: i, isSubAsset: n})
            : (console.error("unknown relative to build: " + e), null);
    }

    console.time("queryAssets"),
        (function (e, t) {
            var i = y[s.platform].isNative;
            if (e) {
                for (var r = [], n = 0, o = e.length; n < o; n++) {
                    var l = e[n],
                        d = a.uuidToUrl(l),
                        p = a.assetInfoByUuid(l);
                    if (p) {
                        var m = p.type;
                        if (m) {
                            var f = u(d, l, m);
                            if (!f) continue;
                            var g = c[m];
                            (f.ctor = g || cc.RawAsset), r.push(f);
                        } else console.error("Can not get asset type of " + l);
                    } else console.error("Can not get asset info of " + l);
                }
                a.queryMetas("db://**/*", "javascript", function (e, s) {
                    var n;
                    n = i
                        ? function (e) {
                            return e.isPlugin && e.loadPluginInNative;
                        }
                        : function (e) {
                            return e.isPlugin && e.loadPluginInWeb;
                        };
                    var o = s.filter(n).map(function (e) {
                        return e.uuid;
                    });
                    t(null, r, o);
                });
            } else
                console.time("queryMetas"),
                    a.queryMetas("db://**/*", "", function (e, s) {
                        console.timeEnd("queryMetas");
                        for (var r = [], n = [], o = 0, l = s.length; o < l; o++) {
                            var d = s[o],
                                p = d.assetType();
                            if ("folder" !== p) {
                                "javascript" === p &&
                                d.isPlugin &&
                                (i
                                    ? d.loadPluginInNative && n.push(d.uuid)
                                    : d.loadPluginInWeb && n.push(d.uuid));
                                var m = d.uuid,
                                    f = u(a.uuidToUrl(m), m, p, d);
                                if (f && f.relative.startsWith("resources/")) {
                                    var g = c[p];
                                    (f.ctor = g || cc.RawAsset), r.push(f);
                                }
                            }
                        }
                        t(e, r, n);
                    });
        })(e.uuidList, function (t, c, u) {
            if ((console.timeEnd("queryAssets"), t)) return i(t);
            console.time("writeAssets"),
                (function (e, t) {
                    var i,
                        s = cc.RawAsset,
                        n = (e.rawAssets = {assets: {}});
                    r || (i = e.assetTypes = []);
                    var a = {};
                    t = b.sortBy(t, "relative");
                    for (var c = Object.create(null), u = 0, d = t.length; u < d; u++) {
                        var p = t[u],
                            m = p.mountPoint;
                        if (!p.ctor || s.isRawAssetType(p.ctor)) {
                            Editor.error(
                                "Not support to build RawAsset since 1.10, refactor to normal Asset please. Path: '" +
                                p.relative +
                                "'"
                            );
                            continue;
                        }
                        if (!p.relative.startsWith("resources/")) continue;
                        if (p.isSubAsset && cc.js.isChildClassOf(p.ctor, cc.SpriteFrame)) {
                            var f,
                                g = p.relative;
                            if (g in c) f = c[g];
                            else {
                                (function () {
                                    var e = g + ".";
                                    (f = t.some(function (t) {
                                        var i = t.relative;
                                        return (
                                            (i === g || i.startsWith(e)) &&
                                            !t.isSubAsset &&
                                            t.ctor === cc.SpriteAtlas
                                        );
                                    })),
                                        (c[g] = f);
                                })();
                            }
                            if (f) continue;
                        }
                        var j = n[m];
                        j || (j = n[m] = {});
                        var h,
                            v = cc.js._getClassId(p.ctor, !1);
                        if (!r) {
                            var w = a[v];
                            void 0 === w && (i.push(v), (w = i.length - 1), (a[v] = w)),
                                (v = w);
                        }
                        var y = p.relative.slice("resources/".length);
                        h = p.isSubAsset ? [y, v, 1] : [y, v];
                        var _e2 = p.uuid;
                        o && (_e2 = l(_e2, !0)), (j[_e2] = h);
                    }
                })(s, c),
                console.timeEnd("writeAssets"),
                (function (e, t) {
                    for (var i = [], s = 0; s < t.length; s++) {
                        var r = t[s],
                            o = a.uuidToUrl(r);
                        (o = o.slice(S.length)), (n[o] = r), i.push(o);
                    }
                    i.sort(), i.length > 0 && (e.jsList = i);
                })(s, u),
            e.sceneList.length > 0 &&
            (s.launchScene = Editor.assetdb.uuidToUrl(e.sceneList[0])),
                (function (e, t) {
                    (t = t
                        .map(function (e) {
                            var t = Editor.assetdb.uuidToUrl(e);
                            return t
                                ? (o && (e = l(e, !0)), {url: t, uuid: e})
                                : (Editor.warn(
                                    "Can not get url of scene " + e + ", it maybe deleted."
                                ),
                                    null);
                        })
                        .filter(Boolean)),
                        (e.scenes = t);
                })(s, e.sceneList),
                (s.packedAssets =
                    (function (e) {
                        if (o && e) {
                            var t = {};
                            for (var i in e) {
                                var s = e[i];
                                t[i] = s.map(function (e) {
                                    return l(e, !0);
                                });
                            }
                            e = t;
                        }
                        return e;
                    })(e.packedAssets) || {}),
                (s.md5AssetsMap = {}),
                (s.orientation = e.webOrientation),
            r && (s.debug = !0),
                (s.subpackages = e.subpackages),
                (s.server = e.server),
            (!("stringify" in e) || e.stringify) && (s = R(s, r)),
                i(null, s, n);
        });
}

(exports.startWithArgs = function (t, S) {
    var ie = (function () {
        var _ref = _asyncToGenerator(
            /*#__PURE__*/ regeneratorRuntime.mark(function _callee(t) {
                var i, s, n, a, c, l, u;
                return regeneratorRuntime.wrap(
                    function _callee$(_context) {
                        while (1) {
                            switch ((_context.prev = _context.next)) {
                                case 0:
                                    (i = Editor.Utils.UuidUtils.getUuidFromLibPath),
                                        (s = Editor.Utils.UuidUtils.compressUuid),
                                        (n = []);
                                    _context.next = 3;
                                    return r(o)(t, {nodir: !0});

                                case 3:
                                    a = _context.sent;
                                    c = 0;

                                case 5:
                                    if (!(c < a.length)) {
                                        _context.next = 11;
                                        break;
                                    }

                                    (l = a[c]), (u = i(e.relative(V, l)));
                                    u
                                        ? n.push(s(u, !0), te(l).hash)
                                        : Editor.warn(
                                        'Can not resolve uuid for path "' +
                                        l +
                                        '", skip the MD5 process on it.'
                                        );

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
                    },
                    _callee,
                    this
                );
            })
        );

        return function ie(_x) {
            return _ref.apply(this, arguments);
        };
    })();

    function A(e) {
        C.isRunning ? C.stop(e) : Editor.error(e);
    }

    var _,
        C = new a(),
        T = p.use(C),
        U = t.project,
        D = t.projectName || e.basename(U),
        $ = t.platform,
        B = t.actualPlatform,
        L = !!t.nativeRenderer,
        W = "wechatgame-subcontext" === $,
        F = "wechatgame" === $ || W,
        N = !!t.debug,
        P = t.sourceMaps,
        I = "qqplay" === t.platform;
    if (W) {
        var _i2 = e.dirname(t.dest);
        t.dest = e.join(_i2, D);
    }
    I
        ? (_ = t.qqplay.orientation)
        : "auto" === (_ = t.webOrientation) && (_ = "");
    var J = t.debugBuildWorker,
        G = y[$].isNative,
        V = t.dest;
    if (
        (Editor.log("Building " + U),
            Editor.log("Destination " + V),
        e.normalize(V) === e.normalize(U))
    )
        return S(new Error("Can not export project at project folder."));
    if (e.contains(Editor.App.path, V))
        return S(new Error("Can not export project to fireball app folder."));
    var H = {
        tmplBase: e.resolve(Editor.url("unpack://static"), "build-templates"),
        jsCacheDir: Editor.url("unpack://engine/bin/.cache/" + $)
    };
    var z = void 0;
    var Q;
    Object.assign(H, {
        template_shares: e.join(H.tmplBase, "shares/**/*"),
        template_web_desktop: e.join(
            H.tmplBase,
            N ? "web-desktop/template-dev/**/*" : "web-desktop/template/**/*"
        ),
        template_web_mobile: e.join(
            H.tmplBase,
            N ? "web-mobile/template-dev/**/*" : "web-mobile/template/**/*"
        ),
        bundledScript: e.join(V, "src", N ? "project.dev.js" : "project.js"),
        src: e.join(V, "src"),
        res: e.join(V, "res"),
        settings: e.join(V, "src/settings.js"),
        jsCache: e.join(
            H.jsCacheDir,
            N
                ? G
                ? "cocos2d-jsb.js"
                : "cocos2d-js.js"
                : G
                ? "cocos2d-jsb-min.js"
                : "cocos2d-js-min.js"
        ),
        jsCacheExcludes: e.join(H.jsCacheDir, N ? ".excludes" : ".excludes-min"),
        webDebuggerSrc: Editor.url(
            "app://node_modules/vconsole/dist/vconsole.min.js"
        ),
        template_instant_games: e.join(H.tmplBase, "fb-instant-games/**/*"),
        quickScripts: e.join(U, "temp/quick-scripts"),
        destQuickScripts: e.join(V, "scripts")
    }),
        C.task("compile", function (e) {
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
            v._runTask(t, function (t, i) {
                t ? A(t) : ((z = i), e());
            });
        }),
        C.task("build-assets", ["compile"], function (e) {
            var i;
            Editor.log("Start building assets"),
                Editor.Ipc.sendToMain("builder:state-changed", "spawn-worker", 0.3),
                (Q = new E());

            function s(t, s) {
                if (i && !J) {
                    var r = i;
                    (i = null), r.nativeWin.destroy();
                }
                C.isRunning ? e(new Error(s)) : Editor.error(s);
            }

            n.once("app:build-project-abort", s),
                j.normal("Start spawn build-worker");
            var r = !1;
            Editor.App.spawnWorker(
                "app://editor/page/build/build-worker",
                function (o, a) {
                    var c;
                    j.normal("Finish spawn build-worker"),
                        (i = o),
                    r ||
                    ((r = !0),
                        a.once("closed", function () {
                            c ||
                            (n.removeListener("app:build-project-abort", s),
                                Editor.log("Finish building assets"),
                                e());
                        })),
                        j.normal("Start init build-worker"),
                        Editor.Ipc.sendToMain("builder:state-changed", "init-worker", 0.32),
                        i.send(
                            "app:init-build-worker",
                            $,
                            N,
                            function (e) {
                                function s() {
                                    !i || J || (i.close(), (i = null));
                                }

                                e
                                    ? (A(e), (c = !0), s())
                                    : i &&
                                    (j.normal("Finish init build-worker"),
                                        j.normal("Start build-assets in worker"),
                                        Editor.Ipc.sendToMain(
                                            "builder:state-changed",
                                            "build-assets",
                                            0.65
                                        ),
                                        i.send(
                                            "app:build-assets",
                                            H.res,
                                            $,
                                            N,
                                            b.pick(
                                                t,
                                                "scenes",
                                                "inlineSpriteFrames",
                                                "mergeStartScene",
                                                "optimizeHotUpdate",
                                                "wechatgame"
                                            ),
                                            function (e, t, i) {
                                                e
                                                    ? (A(e), (c = !0))
                                                    : t && ((Q._buildAssets = t), (Q._packedAssets = i)),
                                                    j.normal("Finish build-assets in worker"),
                                                    s();
                                            },
                                            -1
                                        ));
                            },
                            -1
                        );
                },
                J,
                !0
            );
        });
    var K = null,
        X = null;
    C.task("build-settings", ["build-assets"], function (e) {
        var i = Editor.Profile.load("profile://project/project.json");
        var s = {
            stringify: !1,
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
        "android-instant" === t.platform &&
        (s.server = t["android-instant"].REMOTE_SERVER_ROOT),
            M(s, function (t, i, s) {
                t ? A(t) : ((K = i), (X = s), e());
            });
    });
    var Z = null;

    function Y(e, i) {
        var s = [H.template_shares, e];
        return C.src(s)
            .pipe(O(t))
            .pipe(C.dest(V))
            .on("end", i);
    }

    C.task("compress-settings", function () {
        if (N) return;
        var e = {};
        (function () {
            var t = (K.uuids = []),
                i = {};

            function s(s) {
                var r = (i[s] || 0) + 1;
                (i[s] = r), r >= 2 && !(s in e) && ((e[s] = t.length), t.push(s));
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
        var i = K.rawAssets,
            s = (K.rawAssets = {});
        for (var _t3 in i) {
            var _n2 = i[_t3],
                _o3 = (s[_t3] = {});
            for (var _t4 in _n2) {
                var r = _n2[_t4];
                var _i3 = e[_t4];
                void 0 !== _i3 && (_t4 = _i3), (_o3[_t4] = r);
            }
        }
        var n = K.scenes;
        for (var _t5 = 0; _t5 < n.length; ++_t5) {
            var _i4 = n[_t5],
                _s2 = e[_i4.uuid];
            void 0 !== _s2 && (_i4.uuid = _s2);
        }
        var o = K.packedAssets;
        for (var _t6 in o) {
            var _i5 = o[_t6];
            for (var _t7 = 0; _t7 < _i5.length; ++_t7) {
                var _s3 = e[_i5[_t7]];
                void 0 !== _s3 && (_i5[_t7] = _s3);
            }
        }
        if (t.md5Cache) {
            var _t8 = K.md5AssetsMap;
            for (var _i6 in _t8) {
                var _s4 = _t8[_i6];
                for (var _t9 = 0; _t9 < _s4.length; _t9 += 2) {
                    var _i7 = e[_s4[_t9]];
                    void 0 !== _i7 && (_s4[_t9] = _i7);
                }
            }
            Z = function Z(e) {
                var t = e.uuids,
                    i = e.md5AssetsMap;
                for (var s in i) {
                    for (var r = i[s], n = 0; n < r.length; n += 2) {
                        "number" == typeof r[n] && (r[n] = t[r[n]]);
                    }
                }
            };
        }
    }),
        C.task("build-web-desktop-template", function (e) {
            Y(H.template_web_desktop, e);
        }),
        C.task("build-web-mobile-template", function (e) {
            Y(H.template_web_mobile, e);
        }),
        C.task("build-fb-instant-games-template", function (e) {
            Y(H.template_instant_games, e);
        }),
        C.task("build-plugin-scripts", ["build-settings"], function () {
            Editor.log("Start building plugin scripts");
            var t = Editor.assetdb,
                i = [];
            var _loop = function _loop() {
                r = X[s];
                var c = t.uuidToFspath(r);
                n = e.dirname(e.join(H.src, s));
                console.log("start gulpping " + c + " to " + n);
                o = C.src(c);
                if (!N) {
                    a = Editor.require("unpack://engine/gulp/util/utils").uglify;
                    (o = o.pipe(
                        a("build", {jsb: G, debug: N, wechatgame: F, qqplay: I})
                    )),
                        d.obj([o]).on("error", function (e) {
                            A(e.message);
                        });
                }
                (o = o.pipe(C.dest(n)).on("end", function () {
                    console.log("finish gulpping", c);
                })),
                    i.push(o);
            };

            for (var s in X) {
                var r;
                var n;
                var o;
                var a;

                _loop();
            }
            return i.length > 0
                ? u.merge(i).on("end", function () {
                    Editor.log("Finish building plugin scripts");
                })
                : null;
        }),
        C.task("copy-main-js", function () {
            return C.src([e.join(H.tmplBase, "shares/main.js")])
                .pipe(O(t))
                .pipe(C.dest(V));
        }),
        C.task("import-script-statically", function (t) {
            var s,
                r = e.join(V, "main.js"),
                n = i.readFileSync(r, "utf8");
            if (I && K.jsList && K.jsList.length > 0) {
                s = "\n// plugin script code\n";
                var o = H.src;
                if (
                    (K.jsList.map(function (t) {
                        var i = e.relative(V, e.resolve(o, t));
                        Editor.isWin32 && (i = i.replace(/\\/g, "/")),
                            (s += "BK.Script.loadlib('GameRes://" + i + "'); \n");
                    }),
                        (s = n.replace("<Inject plugin code>", s)),
                        (K.jsList = void 0),
                    s === n)
                )
                    return t("Inject plugin code failure for qqplay"), void 0;
            } else s = n.replace("<Inject plugin code>", "");
            i.writeFileSync(r, s), t();
        }),
        C.task("copy-build-template", function (s) {
            Editor.Ipc.sendToMain(
                "builder:state-changed",
                "copy-build-templates",
                0.98
            );
            var r = e.basename(t.dest),
                n = e.join(t.project, "build-templates");
            if (!i.existsSync(n)) return s();
            var a = e.join(n, r, "**");
            o(a, function (r, o) {
                (o = o.map(function (t) {
                    return e.resolve(t);
                })).forEach(function (s) {
                    var r = e.relative(n, s),
                        o = e.join(t.buildPath, r);
                    i.ensureDirSync(e.dirname(o)), i.copySync(s, o);
                }),
                s && s(r);
            });
        }),
        C.task("build-common", [
            "compile",
            "build-assets",
            "build-settings",
            "build-plugin-scripts"
        ]);
    var ee = require(Editor.url("unpack://engine/gulp/tasks/engine"));

    function te(t) {
        var s = e.basename(t),
            r = e.dirname(t),
            n = e.join(r, s);
        var o = i.readFileSync(n);
        var a = h
            .createHash("md5")
            .update(o)
            .digest("hex");
        a = a.slice(0, x);
        var c,
            u = e.basename(r);
        if (Editor.Utils.UuidUtils.isUuid(u)) {
            var d = r + "." + a;
            c = e.join(d, s);
            try {
                i.renameSync(r, d);
            } catch (e) {
                l.log(
                    "\x1B[31m[MD5 ASSETS] write file error: " + e.message + "\x1B[0m"
                );
            }
        } else {
            var p = s.lastIndexOf("."),
                m = ~p ? s.slice(0, p) + "." + a + s.slice(p) : s + "." + a;
            c = e.join(r, m);
            try {
                i.renameSync(n, c);
            } catch (e) {
                l.log(
                    "\x1B[31m[MD5 ASSETS] write file error: " + e.message + "\x1B[0m"
                );
            }
        }
        return {hash: a, path: c};
    }

    C.task("build-cocos2d", function (s) {
        Editor.Ipc.sendToAll("builder:state-changed", "cut-engine", 0);
        var r = G ? e.join(V, "src") : V;
        i.ensureDirSync(H.jsCacheDir),
            (t.excludedModules = t.excludedModules ? t.excludedModules.sort() : []);
        var n = !1;
        if (i.existsSync(H.jsCacheExcludes)) {
            var _e9 = i.readJSONSync(H.jsCacheExcludes);
            _e9.excludes &&
            _e9.version &&
            (n =
                Editor.versions.cocos2d === _e9.version &&
                L === _e9.nativeRenderer &&
                _e9.excludes.toString() === t.excludedModules.toString() &&
                _e9.sourceMaps === t.sourceMaps);
        }

        function o() {
            var e = [H.jsCache];
            P && e.push(H.jsCache + ".map");
            var t = C.src(e);
            return G && (t = t.pipe(c("cocos2d-jsb.js"))), (t = t.pipe(C.dest(r)));
        }

        if (n && i.existsSync(H.jsCache)) return o().on("end", s), void 0;
        var a = [],
            l = require(Editor.url("unpack://engine/modules.json"));
        l &&
        l.length > 0 &&
        (t.excludedModules &&
        t.excludedModules.forEach(function (t) {
            l.some(function (i) {
                if (i.name === t)
                    return (
                        i.entries &&
                        i.entries.forEach(function (t) {
                            a.push(e.join(Editor.url("unpack://engine"), t));
                        }),
                            !0
                    );
            });
        }),
        "wechatgame-subcontext" === $ &&
        l.forEach(function (t) {
            ("WebGL Renderer" === t.name ||
                (t.dependencies &&
                    -1 !== t.dependencies.indexOf("WebGL Renderer"))) &&
            t.entries &&
            t.entries.forEach(function (t) {
                a.push(e.join(Editor.url("unpack://engine"), t));
            });
        }),
            console.log("Exclude modules: " + a)),
            (function (e, i, s) {
                ee[
                    N
                        ? G
                        ? "buildJsb"
                        : "buildCocosJs"
                        : G
                        ? "buildJsbMin"
                        : "buildCocosJsMin"
                    ](
                    Editor.url("unpack://engine/index.js"),
                    i,
                    e,
                    {
                        wechatgame: F,
                        qqplay: I,
                        runtime:
                        "runtime" === B || "vivo-runtime" === B || "oppo-runtime" === B,
                        nativeRenderer: L,
                        wechatgameSub: W
                    },
                    s,
                    t.sourceMaps
                );
            })(a, H.jsCache, function () {
                o().on("end", function () {
                    i.writeFileSync(
                        H.jsCacheExcludes,
                        JSON.stringify({
                            excludes: t.excludedModules,
                            version: Editor.versions.cocos2d,
                            nativeRenderer: L,
                            sourceMaps: t.sourceMaps
                        }),
                        null,
                        4
                    ),
                        s();
                });
            });
    }),
        C.task("copy-webDebugger", function (s) {
            var r = e.join(V, e.basename(H.webDebuggerSrc));
            t.embedWebDebugger
                ? i.copy(H.webDebuggerSrc, r, s)
                : g(r, {force: !0}, s);
        }),
        C.task(
            "revision-res-jsList",
            _asyncToGenerator(
                /*#__PURE__*/ regeneratorRuntime.mark(function _callee2() {
                    var i, s;
                    return regeneratorRuntime.wrap(
                        function _callee2$(_context2) {
                            while (1) {
                                switch ((_context2.prev = _context2.next)) {
                                    case 0:
                                        if (!t.md5Cache) {
                                            _context2.next = 9;
                                            break;
                                        }

                                        console.time("revision");
                                        _context2.next = 4;
                                        return ie(e.join(H.res, "import", "**"));

                                    case 4:
                                        i = _context2.sent;
                                        _context2.next = 7;
                                        return ie(e.join(H.res, "raw-assets", "**"));

                                    case 7:
                                        s = _context2.sent;
                                        (K.md5AssetsMap = {import: i, "raw-assets": s}),
                                            (function (t) {
                                                if (t.jsList && t.jsList.length > 0) {
                                                    var i = H.src,
                                                        s = t.jsList
                                                            .map(function (t) {
                                                                return e.resolve(i, t);
                                                            })
                                                            .map(function (t) {
                                                                return (
                                                                    (t = te(t).path),
                                                                        e.relative(i, t).replace(/\\/g, "/")
                                                                );
                                                            });
                                                    s.sort(), (t.jsList = s);
                                                }
                                            })(K),
                                            console.timeEnd("revision");
                                    case 9:
                                    case "end":
                                        return _context2.stop();
                                }
                            }
                        },
                        _callee2,
                        this
                    );
                })
            )
        ),
        C.task("save-settings", function (e) {
            var t = R(K, N);
            Z && (t += "(" + Z.toString() + ")(" + q + ");"),
                i.writeFile(H.settings, t, e);
        }),
        C.task("revision-other", function (i) {
            if (t.md5Cache) {
                var s = V,
                    r = ["index.html"];
                G &&
                (r = r.concat([
                    "main.js",
                    "cocos-project-template.json",
                    "project.json"
                ]));
                var n = [e.relative(s, H.bundledScript)];
                F
                    ? ((r = r.concat([
                        "game.js",
                        "game.json",
                        "project.config.json",
                        "index.js"
                    ])),
                        (n = n.concat(["game.json", "project.config.json"])))
                    : I &&
                    (r = r.concat([
                        "main.js",
                        "cocos2d-js.js",
                        "cocos2d-js-min.js",
                        "project.dev.js",
                        "project.js",
                        "settings.js"
                    ])),
                Editor.isWin32 &&
                (n = n.map(function (e) {
                    return e.replace(/\\/g, "/");
                })),
                    C.src(["src/*.js", "*"], {cwd: V, base: s})
                        .pipe(
                            m.revision({
                                debug: !0,
                                hashLength: x,
                                dontRenameFile: r,
                                dontSearchFile: n,
                                annotator: function annotator(e, t) {
                                    return [{contents: e, path: t}];
                                },
                                replacer: function replacer(t, i, s, r) {
                                    (".map" === e.extname(t.path) &&
                                        r.revPathOriginal + ".map" !== t.path) ||
                                    (t.contents = t.contents.replace(i, "$1" + s + "$3$4"));
                                }
                            })
                        )
                        .pipe(f())
                        .pipe(C.dest(V))
                        .on("end", i);
            } else i();
        }),
        C.task(
            "finish-build",
            T(
                "copy-build-template",
                "import-script-statically",
                "before-change-files",
                "revision-res-jsList",
                "compress-settings",
                "save-settings",
                "revision-other"
            )
        ),
        (function () {
            var t = null;
            C.task("pack-wechatgame-subdomain", function () {
                (t = (function () {
                    var t = Editor.require(
                        "app://editor/share/engine-extends/json-packer"
                    );
                    var s = Editor.Utils.UuidUtils.compressUuid,
                        r = o.sync(e.join(H.res, "import/**"), {nodir: !0}),
                        n = new t();
                    for (var _t10 = 0; _t10 < r.length; ++_t10) {
                        var _o4 = r[_t10],
                            _a2 = e.extname(_o4);
                        if (".json" !== _a2) continue;
                        var _c2 = i.readJsonSync(_o4),
                            _l = s(e.basename(_o4, _a2), !0);
                        n.add(_l, _c2), g.sync(_o4, {force: !0});
                    }
                    return n.pack();
                })()),
                    g.sync(e.join(V, "game.json"), {force: !0}),
                    g.sync(e.join(V, "project.config.json"), {force: !0});
                var s = e.join(V, "game.js"),
                    r = i.readFileSync(s, "utf8"),
                    n = 'SUBCONTEXT_ROOT = "' + D + '"';
                (r = r.replace(/SUBCONTEXT_ROOT = ""/g, n)),
                    i.writeFileSync(e.join(V, "index.js"), r),
                    g.sync(s, {force: !0});
                var a = Editor.url(
                    "packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js"
                    ),
                    c = e.join(V, "libs/sub-context-adapter.js");
                i.copySync(a, c);
            }),
                C.task("extend-settings-wechat-subdomain", function () {
                    (K.packedAssets = {WECHAT_SUBDOMAIN: t.indices}),
                        (K.WECHAT_SUBDOMAIN_DATA = JSON.parse(t.data)),
                        (t = null);
                });
        })(),
        C.task("copy-wechatgame-files", function () {
            var i = Editor.url(
                "packages://weapp-adapter/wechatgame/libs/weapp-adapter/"
            );
            var s = [
                Editor.url("packages://weapp-adapter/wechatgame/**/*"),
                "!" +
                Editor.url(
                    "packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js"
                )
            ];
            return C.src(s)
                .pipe(
                    u.through(function (s) {
                        var r = e.basename(s.path),
                            n = e.contains(i, s.path);
                        if ("game.js" === r) {
                            var o = s.contents.toString(),
                                a =
                                    'REMOTE_SERVER_ROOT = "' +
                                    t.wechatgame.REMOTE_SERVER_ROOT +
                                    '"';
                            (o = o.replace(/REMOTE_SERVER_ROOT = ""/g, a)),
                                (s.contents = new Buffer(o));
                        } else if ("game.json" === r) {
                            var _e10 = JSON.parse(s.contents.toString());
                            if (
                                ((_e10.deviceOrientation = t.wechatgame.orientation),
                                    t.wechatgame.subContext && !W
                                        ? (_e10.openDataContext = t.wechatgame.subContext)
                                        : delete _e10.openDataContext,
                                    z)
                            ) {
                                _e10.subpackages = [];
                                for (var _t11 in z) {
                                    _e10.subpackages.push({name: _t11, root: z[_t11].path});
                                }
                            }
                            s.contents = new Buffer(JSON.stringify(_e10, null, 4));
                        } else if ("project.config.json" === r) {
                            var _e11 = JSON.parse(s.contents.toString());
                            (_e11.appid = t.wechatgame.appid || "wx6ac3f5090a6b99c5"),
                                (_e11.projectname = D),
                                (s.contents = new Buffer(JSON.stringify(_e11, null, 4)));
                        } else if (".js" === e.extname(r) && n) {
                            var c;
                            try {
                                c = require("babel-core").transform(s.contents.toString(), {
                                    ast: !1,
                                    highlightCode: !1,
                                    sourceMaps: !1,
                                    compact: !1,
                                    filename: s.path,
                                    presets: ["env"],
                                    plugins: [
                                        "transform-decorators-legacy",
                                        "transform-class-properties",
                                        "transform-export-extensions",
                                        "add-module-exports"
                                    ]
                                });
                            } catch (e) {
                                return (
                                    (e.stack = "Compile " + r + " error: " + e.stack),
                                        this.emit("error", e)
                                );
                            }
                            s.contents = new Buffer(c.code);
                        }
                        this.emit("data", s);
                    })
                )
                .pipe(C.dest(V));
        }),
        C.task("copy-qqplay-files", function () {
            var e = [Editor.url("packages://qqplay-adapter/qqplay/**/*")];
            return C.src(e)
                .pipe(
                    u.through(function (e) {
                        this.emit("data", e);
                    })
                )
                .pipe(C.dest(V));
        }),
        C.task("before-change-files", function (e) {
            var i = require(Editor.url("app://editor/share/build-utils"));
            Editor.Builder.doCustomProcess(
                "before-change-files",
                i.getCommonOptions(t),
                Q,
                e
            );
        }),
        C.task(
            k + "web-desktop",
            T(
                "build-cocos2d",
                ["build-common", "copy-webDebugger"],
                "build-web-desktop-template",
                "finish-build"
            )
        ),
        C.task(
            k + "web-mobile",
            T(
                "build-cocos2d",
                ["build-common", "copy-webDebugger"],
                "build-web-mobile-template",
                "finish-build"
            )
        ),
        C.task(
            k + "fb-instant-games",
            T(
                "build-cocos2d",
                ["build-common", "copy-webDebugger"],
                "build-fb-instant-games-template",
                "finish-build"
            )
        ),
        C.task(
            k + "wechatgame",
            T(
                "build-cocos2d",
                "build-common",
                "copy-main-js",
                "copy-wechatgame-files",
                "finish-build"
            )
        ),
        C.task(
            k + "wechatgame-subcontext",
            T(
                "build-cocos2d",
                "build-common",
                "copy-main-js",
                "copy-wechatgame-files",
                "pack-wechatgame-subdomain",
                "extend-settings-wechat-subdomain",
                "finish-build"
            )
        ),
        C.task(
            k + "qqplay",
            T(
                "build-cocos2d",
                "build-common",
                "copy-main-js",
                "copy-qqplay-files",
                "finish-build"
            )
        ),
        C.task("copy-runtime-scripts", function () {
            var t = e.join(V, "src");
            return C.src(e.join(H.tmplBase, "runtime/**/*.js")).pipe(C.dest(t));
        }),
        C.task("encrypt-src-js", function (s) {
            if (N || !t.encryptJs) return s(), void 0;
            var r = e.join(V, "src"),
                n = e.resolve(r, "../js backups (useful for debugging)");
            i.copy(r, n, function (e) {
                e && Editor.warn("Failed to backup js files for debugging.", e),
                    w.encryptJsFiles(t, s);
            });
        }),
        C.task("copy-jsb-adapter", function () {
            var s = Editor.url("packages://jsb-adapter/dist"),
                r = e.join(V, "jsb-adapter"),
                n = [],
                o = require(Editor.url("packages://jsb-adapter/modules.json"));
            t.excludedModules.forEach(function (t) {
                o.some(function (i) {
                    if (i.name === t)
                        return (
                            i.entries.forEach(function (t) {
                                n.push(e.join(Editor.url("packages://jsb-adapter"), t));
                            }),
                                void 0
                        );
                });
            }),
                i.copySync(s, r, {
                    filter: function filter(e) {
                        for (var _t12 = 0; _t12 < n.length; ++_t12) {
                            if (n[_t12] === e) return !1;
                        }
                        return !0;
                    }
                });
        }),
        C.task(
            "copy-native-files",
            T(
                "build-common",
                "copy-runtime-scripts",
                "copy-jsb-adapter",
                "copy-main-js",
                "finish-build",
                "encrypt-src-js"
            )
        ),
        C.task("build-cocos-native-project", function (e) {
            w.build(t, e);
        }),
        C.task(
            "build-native-project",
            T("build-cocos-native-project", "build-cocos2d", "copy-native-files")
        ),
        C.task(k + "android", ["build-native-project"]),
        C.task(k + "ios", ["build-native-project"]),
        C.task(k + "win32", ["build-native-project"]),
        C.task(k + "mac", ["build-native-project"]),
        C.task(k + "android-instant", ["build-native-project"]);
    var se = k + $;
    if (se in C.tasks) {
        var re;
        (re = G ? [H.res + "/**/*", H.src + "/*/"] : e.join(V, "**/*")),
            Editor.log("Delete " + re),
            g(re, {force: !0}, function (e) {
                if (e) return S(e);
                C.start(se, function (e) {
                    e
                        ? S(e)
                        : (G || Editor.Ipc.sendToMain("app:update-build-preview-path", V),
                            S(null, Q));
                });
            });
    } else {
        var ne = [];
        for (var oe in C.tasks) {
            0 === oe.indexOf(k) && ne.push(oe.substring(k.length));
        }
        S(
            new Error(
                s("Not support %s platform, available platform currently: %s", $, ne)
            )
        );
    }
}),
    (exports.getTemplateFillPipe = O),
    (exports.buildSettings = M);
