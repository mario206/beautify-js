const $_e_3$1 = require("fire-path");

const $_t_2$1 = require("fire-url");

const $_i_6$1 = require("fire-fs");

const {
  format: s,
  promisify: r
} = require("util");

const $_n_6$1 = require("electron").ipcMain;

const $_o_6$1 = require("globby");

const $_a_4$1 = require("gulp").Gulp;

const $_c_3$1 = require("gulp-rename");

const $_l_3$1 = require("gulp-util");

const $_u$1 = require("event-stream");

const $_d_2$1 = require("stream-combiner2");

const $_p_3$1 = require("gulp-sequence");

const $_m_3$1 = require("gulp-rev-all");

const $_f_3$1 = require("gulp-rev-delete-original");

const $_g_3$1 = require("del");

const $_b$1 = (require("async"), require("lodash"));

const $_j_1$1 = require("winston");

const $_h_1$1 = require("crypto");

const $_v_1$1 = require("./compiler");

const $_w_1$1 = require("./native-utils");

const $_y_1$1 = require("../share/build-platforms");

const $_E$1 = require("./build-results");

const $_k$1 = "build-platform_";
const $_S$1 = "db://";
const $_q$1 = "window._CCSettings";
const $_x$1 = 5;

function getTemplateFillPipe($O_IN1$) {
  return $_u$1.through(function ($_IN1$) {
    if (".html" === $_e_3$1.extname($_IN1$.path)) {
      $_j_1$1.normal("Generating html from " + $_IN1$.path);
      var $_s$1 = $O_IN1$.webOrientation;

      if ("auto" === $_s$1) {
        $_s$1 = "";
      }

      const $_n$1 = Editor.url("app://node_modules/vConsole/dist/vconsole.min.js");
      const $_o$1 = `<script src="${$_e_3$1.basename($_n$1)}"><\/script>`;
      var $_r$1 = {
        file: $_IN1$,
        project: $O_IN1$.projectName || $_e_3$1.basename($O_IN1$.project),
        previewWidth: $O_IN1$.previewWidth,
        previewHeight: $O_IN1$.previewHeight,
        orientation: $_s$1,
        webDebugger: $O_IN1$.embedWebDebugger ? $_o$1 : ""
      };
      $_IN1$.contents = new Buffer($_l_3$1.template($_IN1$.contents, $_r$1));
    } else if ("main.js" === $_e_3$1.basename($_IN1$.path)) {
      $_j_1$1.normal("Generating main.js from " + $_IN1$.path);
      let $_e$1 = $_IN1$.contents.toString();
      let $_s_1$1 = "";

      if ($O_IN1$.includeAnySDK) {
        $_s_1$1 = "    \n    if (cc.sys.isNative && cc.sys.isMobile) {\n        jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);\n    }\n";
      }

      $_e$1 = $_e$1.replace(/<Inject anysdk scripts>/g, $_s_1$1);
      let $_o_1$1 = "qqplay" === $O_IN1$.platform;

      if ($_o_1$1 && $O_IN1$.qqplay && $O_IN1$.qqplay.REMOTE_SERVER_ROOT) {
        let $_i$1 = 'qqPlayDownloader.REMOTE_SERVER_ROOT = "' + $O_IN1$.qqplay.REMOTE_SERVER_ROOT + '"';
        $_e$1 = $_e$1.replace(/qqPlayDownloader.REMOTE_SERVER_ROOT = ""/g, $_i$1);
      }

      let $_a$1 = "wechatgame-subcontext" === $O_IN1$.platform;
      let $_c$1 = "wechatgame" === $O_IN1$.platform || $_a$1;
      $_r$1 = {
        file: $_IN1$,
        renderMode: $O_IN1$.renderMode,
        isWeChatGame: $_c$1,
        isWeChatSubdomain: $_a$1,
        isQQPlay: $_o_1$1,
        engineCode: "",
        projectCode: ""
      };

      if ($_o_1$1) {
        var $_n_1$1 = $O_IN1$.debug;

        if ($_n_1$1) {
          $_r$1.engineCode = "'GameRes://cocos2d-js.js'";
        } else {
          $_r$1.engineCode = "'GameRes://cocos2d-js-min.js'";
        }

        if ($_n_1$1) {
          $_r$1.projectCode = "'GameRes://src/project.dev.js'";
        } else {
          $_r$1.projectCode = "'GameRes://src/project.js'";
        }
      }

      $_IN1$.contents = new Buffer($_l_3$1.template($_e$1, $_r$1));
    }

    this.emit("data", $_IN1$);
  });
}

function _R_Fun_($R_IN1$, $R_IN2$) {
  var $_i_1$1 = JSON.stringify($R_IN1$, null, $R_IN2$ ? 4 : 0).replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/gm, "$1:");
  return $_i_1$1 = $R_IN2$ ? `${$_q$1} = ${$_i_1$1};\n` : `${$_q$1}=${$_i_1$1};`;
}

function buildSettings($M_IN1$, $M_IN2$) {
  var $_s_4$1 = $M_IN1$.customSettings;
  var $_r_2$1 = $M_IN1$.debug;
  var $_n_5$1 = Object.create(null);
  var $_o_5$1 = !$M_IN1$.preview;
  var $_a_3$1 = Editor.assetdb;
  var $_c_2$1 = Editor.assets;
  var $_l_2$1 = Editor.Utils.UuidUtils.compressUuid;

  function u($U_IN1$, $U_IN2$, $U_IN3$, $U_IN4$) {
    if (!$U_IN1$) {
      console.error("can not get url to build: " + $U_IN2$);
      return null;
    }

    if (!$U_IN1$.startsWith($_S$1)) {
      console.error("unknown url to build: " + $U_IN1$);
      return null;
    }

    var $_n_2$1 = Editor.assetdb.isSubAssetByUuid($U_IN2$);

    if ($_n_2$1) {
      var $_o_2$1 = $_t_2$1.dirname($U_IN1$);
      var $_a_1$1 = $_t_2$1.extname($_o_2$1);

      if ($_a_1$1) {
        $_o_2$1 = $_o_2$1.slice(0, -$_a_1$1.length);
      }

      $U_IN1$ = $_o_2$1;
    }

    var $_c_1$1 = $U_IN1$.indexOf("/", $_S$1.length);

    if ($_c_1$1 < 0) {
      console.error("no mount to build: " + $U_IN1$);
      return null;
    }

    var $_l$1 = $U_IN1$.slice($_S$1.length, $_c_1$1);

    if (!$_l$1) {
      console.error("unknown mount to build: " + $U_IN1$);
      return null;
    }

    var _u_Fun_ = $U_IN1$.slice($_c_1$1 + 1);

    if (_u_Fun_) {
      if ("audio-clip" === $U_IN3$) {
        if (!$U_IN4$) {
          $U_IN4$ = Editor.assetdb.loadMetaByUuid($U_IN2$);
        }

        if ($U_IN4$ && "1" === $U_IN4$.downloadMode) {
          _u_Fun_ += "?useDom=1";
        }
      }

      return {
        mountPoint: $_l$1,
        relative: _u_Fun_,
        uuid: $U_IN2$,
        isSubAsset: $_n_2$1
      };
    } else {
      console.error("unknown relative to build: " + $U_IN1$);
      return null;
    }
  }

  console.time("queryAssets");

  (function ($_IN_1_1$, $_IN2$) {
    var $_i_2$1 = $_y_1$1[$_s_4$1.platform].isNative;

    if ($_IN_1_1$) {
      for (var r = [], n = 0, o = $_IN_1_1$.length; n < o; n++) {
        var $_l_1$1 = $_IN_1_1$[n];
        var $_d$1 = $_a_3$1.uuidToUrl($_l_1$1);
        var $_p$1 = $_a_3$1.assetInfoByUuid($_l_1$1);

        if ($_p$1) {
          var $_m$1 = $_p$1.type;

          if ($_m$1) {
            var $_f$1 = u($_d$1, $_l_1$1, $_m$1);

            if (!$_f$1) {
              continue;
            }

            var $_g$1 = $_c_2$1[$_m$1];
            $_f$1.ctor = $_g$1 || cc.RawAsset;
            r.push($_f$1);
          } else {
            console.error("Can not get asset type of " + $_l_1$1);
          }
        } else {
          console.error("Can not get asset info of " + $_l_1$1);
        }
      }

      $_a_3$1.queryMetas("db://**/*", "javascript", function ($_IN_2_1$, $_IN_1_2$) {
        var $_n_3$1;

        if ($_i_2$1) {
          $_n_3$1 = e => e.isPlugin && e.loadPluginInNative;
        } else {
          $_n_3$1 = e => e.isPlugin && e.loadPluginInWeb;
        }

        var $_o_3$1 = $_IN_1_2$.filter($_n_3$1).map(e => e.uuid);
        $_IN2$(null, r, $_o_3$1);
      });
    } else {
      console.time("queryMetas");
      $_a_3$1.queryMetas("db://**/*", "", function ($_IN_3_1$, $_IN_2_2$) {
        console.timeEnd("queryMetas");

        for (var r = [], n = [], o = 0, l = $_IN_2_2$.length; o < l; o++) {
          var $_d_1$1 = $_IN_2_2$[o];
          var $_p_1$1 = $_d_1$1.assetType();

          if ("folder" !== $_p_1$1) {
            if ("javascript" === $_p_1$1 && $_d_1$1.isPlugin) {
              if ($_i_2$1) {
                if ($_d_1$1.loadPluginInNative) {
                  n.push($_d_1$1.uuid);
                }
              } else if ($_d_1$1.loadPluginInWeb) {
                n.push($_d_1$1.uuid);
              }
            }

            var $_m_1$1 = $_d_1$1.uuid;
            var $_f_1$1 = u($_a_3$1.uuidToUrl($_m_1$1), $_m_1$1, $_p_1$1, $_d_1$1);

            if ($_f_1$1 && $_f_1$1.relative.startsWith("resources/")) {
              var $_g_1$1 = $_c_2$1[$_p_1$1];
              $_f_1$1.ctor = $_g_1$1 || cc.RawAsset;
              r.push($_f_1$1);
            }
          }
        }

        $_IN2$($_IN_3_1$, r, n);
      });
    }
  })($M_IN1$.uuidList, function ($_IN_4_1$, $_IN_3_2$, $_IN3$) {
    console.timeEnd("queryAssets");

    if ($_IN_4_1$) {
      return $M_IN2$($_IN_4_1$);
    }

    console.time("writeAssets");

    (function ($_IN_5_1$, $_IN_4_2$) {
      var $_i_4$1;
      var $_s_2$1 = cc.RawAsset;
      var $_n_4$1 = $_IN_5_1$.rawAssets = {
        assets: {}
      };

      if (!$_r_2$1) {
        $_i_4$1 = $_IN_5_1$.assetTypes = [];
      }

      var $_a_2$1 = {};
      $_IN_4_2$ = $_b$1.sortBy($_IN_4_2$, "relative");

      for (var c = Object.create(null), u = 0, d = $_IN_4_2$.length; u < d; u++) {
        var $_p_2$1 = $_IN_4_2$[u];
        var $_m_2$1 = $_p_2$1.mountPoint;

        if (!$_p_2$1.ctor || $_s_2$1.isRawAssetType($_p_2$1.ctor)) {
          Editor.error(`Not support to build RawAsset since 1.10, refactor to normal Asset please. Path: '${$_p_2$1.relative}'`);
          continue;
        }

        if (!$_p_2$1.relative.startsWith("resources/")) {
          continue;
        }

        if ($_p_2$1.isSubAsset && cc.js.isChildClassOf($_p_2$1.ctor, cc.SpriteFrame)) {
          var $_f_2$1,
              $_g_2$1 = $_p_2$1.relative;

          if ($_g_2$1 in c) {
            $_f_2$1 = c[$_g_2$1];
          } else {
            let $_e_1$1 = $_g_2$1 + ".";
            $_f_2$1 = $_IN_4_2$.some(function ($_IN_6_1$) {
              var $_i_3$1 = $_IN_6_1$.relative;
              return ($_i_3$1 === $_g_2$1 || $_i_3$1.startsWith($_e_1$1)) && !$_IN_6_1$.isSubAsset && $_IN_6_1$.ctor === cc.SpriteAtlas;
            });
            c[$_g_2$1] = $_f_2$1;
          }

          if ($_f_2$1) {
            continue;
          }
        }

        var $_j$1 = $_n_4$1[$_m_2$1];

        if (!$_j$1) {
          $_j$1 = $_n_4$1[$_m_2$1] = {};
        }

        var $_h$1,
            $_v$1 = cc.js._getClassId($_p_2$1.ctor, false);

        if (!$_r_2$1) {
          var $_w$1 = $_a_2$1[$_v$1];

          if (void 0 === $_w$1) {
            $_i_4$1.push($_v$1);
            $_w$1 = $_i_4$1.length - 1;
            $_a_2$1[$_v$1] = $_w$1;
          }

          $_v$1 = $_w$1;
        }

        var $_y$1 = $_p_2$1.relative.slice("resources/".length);

        if ($_p_2$1.isSubAsset) {
          $_h$1 = [$_y$1, $_v$1, 1];
        } else {
          $_h$1 = [$_y$1, $_v$1];
        }

        let $_e_2$1 = $_p_2$1.uuid;

        if ($_o_5$1) {
          $_e_2$1 = $_l_2$1($_e_2$1, true);
        }

        $_j$1[$_e_2$1] = $_h$1;
      }
    })($_s_4$1, $_IN_3_2$);

    console.timeEnd("writeAssets");

    (function ($_IN_7_1$, $_IN_5_2$) {
      for (var i = [], s = 0; s < $_IN_5_2$.length; s++) {
        var $_r_1$1 = $_IN_5_2$[s];
        var $_o_4$1 = $_a_3$1.uuidToUrl($_r_1$1);
        $_o_4$1 = $_o_4$1.slice($_S$1.length);
        $_n_5$1[$_o_4$1] = $_r_1$1;
        i.push($_o_4$1);
      }

      i.sort();

      if (i.length > 0) {
        $_IN_7_1$.jsList = i;
      }
    })($_s_4$1, $_IN3$);

    if ($M_IN1$.sceneList.length > 0) {
      $_s_4$1.launchScene = Editor.assetdb.uuidToUrl($M_IN1$.sceneList[0]);
    }

    (function ($_IN_8_1$, $_IN_6_2$) {
      $_IN_6_2$ = $_IN_6_2$.map(e => {
        var $_t$1 = Editor.assetdb.uuidToUrl(e);

        if ($_t$1) {
          if ($_o_5$1) {
            e = $_l_2$1(e, true);
          }

          return {
            url: $_t$1,
            uuid: e
          };
        } else {
          Editor.warn(`Can not get url of scene ${e}, it maybe deleted.`);
          return null;
        }
      }).filter(Boolean);
      $_IN_8_1$.scenes = $_IN_6_2$;
    })($_s_4$1, $M_IN1$.sceneList);

    $_s_4$1.packedAssets = function ($_IN_9_1$) {
      if ($_o_5$1 && $_IN_9_1$) {
        var $_t_1$1 = {};

        for (var $_i_5$1 in $_IN_9_1$) {
          var $_s_3$1 = $_IN_9_1$[$_i_5$1];
          $_t_1$1[$_i_5$1] = $_s_3$1.map(e => $_l_2$1(e, true));
        }

        $_IN_9_1$ = $_t_1$1;
      }

      return $_IN_9_1$;
    }($M_IN1$.packedAssets) || {};

    $_s_4$1.md5AssetsMap = {};
    $_s_4$1.orientation = $M_IN1$.webOrientation;

    if ($_r_2$1) {
      $_s_4$1.debug = true;
    }

    $_s_4$1.subpackages = $M_IN1$.subpackages;
    $_s_4$1.server = $M_IN1$.server;

    if (!("stringify" in $M_IN1$) || $M_IN1$.stringify) {
      $_s_4$1 = _R_Fun_($_s_4$1, $_r_2$1);
    }

    $M_IN2$(null, $_s_4$1, $_n_5$1);
  });
}

exports.startWithArgs = function ($_IN_A_1$, $_IN_7_2$) {
  function _A_Fun_($A_IN1$) {
    if ($_C$1.isRunning) {
      $_C$1.stop($A_IN1$);
    } else {
      Editor.error($A_IN1$);
    }
  }

  var $__$1;
  var $_C$1 = new $_a_4$1();
  var $_T$1 = $_p_3$1.use($_C$1);
  var $_U$1 = $_IN_A_1$.project;
  var $_D$1 = $_IN_A_1$.projectName || $_e_3$1.basename($_U$1);
  var $_$$1 = $_IN_A_1$.platform;
  var $_B$1 = $_IN_A_1$.actualPlatform;
  var $_L$1 = !!$_IN_A_1$.nativeRenderer;
  var $_W$1 = "wechatgame-subcontext" === $_$$1;
  var $_F$1 = "wechatgame" === $_$$1 || $_W$1;
  var $_N$1 = !!$_IN_A_1$.debug;
  var $_P$1 = $_IN_A_1$.sourceMaps;
  var $_I$1 = "qqplay" === $_IN_A_1$.platform;

  if ($_W$1) {
    let $_i_7$1 = $_e_3$1.dirname($_IN_A_1$.dest);
    $_IN_A_1$.dest = $_e_3$1.join($_i_7$1, $_D$1);
  }

  if ($_I$1) {
    $__$1 = $_IN_A_1$.qqplay.orientation;
  } else if ("auto" === ($__$1 = $_IN_A_1$.webOrientation)) {
    $__$1 = "";
  }

  var $_J$1 = $_IN_A_1$.debugBuildWorker;
  var $_G$1 = $_y_1$1[$_$$1].isNative;
  var $_V$1 = $_IN_A_1$.dest;
  Editor.log("Building " + $_U$1);
  Editor.log("Destination " + $_V$1);

  if ($_e_3$1.normalize($_V$1) === $_e_3$1.normalize($_U$1)) {
    return $_IN_7_2$(new Error("Can not export project at project folder."));
  }

  if ($_e_3$1.contains(Editor.App.path, $_V$1)) {
    return $_IN_7_2$(new Error("Can not export project to fireball app folder."));
  }

  var $_H$1 = {
    tmplBase: $_e_3$1.resolve(Editor.url("unpack://static"), "build-templates"),
    jsCacheDir: Editor.url("unpack://engine/bin/.cache/" + $_$$1)
  };
  let $_z$1;
  var $_Q$1;
  Object.assign($_H$1, {
    template_shares: $_e_3$1.join($_H$1.tmplBase, "shares/**/*"),
    template_web_desktop: $_e_3$1.join($_H$1.tmplBase, $_N$1 ? "web-desktop/template-dev/**/*" : "web-desktop/template/**/*"),
    template_web_mobile: $_e_3$1.join($_H$1.tmplBase, $_N$1 ? "web-mobile/template-dev/**/*" : "web-mobile/template/**/*"),
    bundledScript: $_e_3$1.join($_V$1, "src", $_N$1 ? "project.dev.js" : "project.js"),
    src: $_e_3$1.join($_V$1, "src"),
    res: $_e_3$1.join($_V$1, "res"),
    settings: $_e_3$1.join($_V$1, "src/settings.js"),
    jsCache: $_e_3$1.join($_H$1.jsCacheDir, $_N$1 ? $_G$1 ? "cocos2d-jsb.js" : "cocos2d-js.js" : $_G$1 ? "cocos2d-jsb-min.js" : "cocos2d-js-min.js"),
    jsCacheExcludes: $_e_3$1.join($_H$1.jsCacheDir, $_N$1 ? ".excludes" : ".excludes-min"),
    webDebuggerSrc: Editor.url("app://node_modules/vconsole/dist/vconsole.min.js"),
    template_instant_games: $_e_3$1.join($_H$1.tmplBase, "fb-instant-games/**/*"),
    quickScripts: $_e_3$1.join($_U$1, "temp/quick-scripts"),
    destQuickScripts: $_e_3$1.join($_V$1, "scripts")
  });
  $_C$1.task("compile", function ($_IN_12_1$) {
    Editor.Ipc.sendToMain("builder:state-changed", "compile", .1);
    var $_t_3$1 = {
      project: $_U$1,
      platform: $_$$1,
      actualPlatform: $_B$1,
      destRoot: $_V$1,
      dest: $_H$1.bundledScript,
      debug: $_N$1,
      sourceMaps: $_P$1
    };

    $_v_1$1._runTask($_t_3$1, function ($_IN_13_1$, $_IN_B_2$) {
      if ($_IN_13_1$) {
        _A_Fun_($_IN_13_1$);
      } else {
        $_z$1 = $_IN_B_2$;
        $_IN_12_1$();
      }
    });
  });
  $_C$1.task("build-assets", ["compile"], function ($_IN_B_1$) {
    var $_i_8$1;
    Editor.log("Start building assets");
    Editor.Ipc.sendToMain("builder:state-changed", "spawn-worker", .3);
    $_Q$1 = new $_E$1();

    function _s_Fun_($S_IN1$, $S_IN2$) {
      if ($_i_8$1 && !$_J$1) {
        var $_r_3$1 = $_i_8$1;
        $_i_8$1 = null;
        $_r_3$1.nativeWin.destroy();
      }

      if ($_C$1.isRunning) {
        $_IN_B_1$(new Error($S_IN2$));
      } else {
        Editor.error($S_IN2$);
      }
    }

    $_n_6$1.once("app:build-project-abort", _s_Fun_);
    $_j_1$1.normal("Start spawn build-worker");
    var $_r_4$1 = false;
    Editor.App.spawnWorker("app://editor/page/build/build-worker", function ($_IN_C_1$, $_IN_8_2$) {
      var $_c_4$1;
      $_j_1$1.normal("Finish spawn build-worker");
      $_i_8$1 = $_IN_C_1$;

      if (!$_r_4$1) {
        $_r_4$1 = true;
        $_IN_8_2$.once("closed", function () {
          if (!$_c_4$1) {
            $_n_6$1.removeListener("app:build-project-abort", _s_Fun_);
            Editor.log("Finish building assets");
            $_IN_B_1$();
          }
        });
      }

      $_j_1$1.normal("Start init build-worker");
      Editor.Ipc.sendToMain("builder:state-changed", "init-worker", .32);
      $_i_8$1.send("app:init-build-worker", $_$$1, $_N$1, function ($_IN_D_1$) {
        function s() {
          if (!(!$_i_8$1 || $_J$1)) {
            $_i_8$1.close();
            $_i_8$1 = null;
          }
        }

        if ($_IN_D_1$) {
          _A_Fun_($_IN_D_1$);

          $_c_4$1 = true;
          s();
        } else if ($_i_8$1) {
          $_j_1$1.normal("Finish init build-worker");
          $_j_1$1.normal("Start build-assets in worker");
          Editor.Ipc.sendToMain("builder:state-changed", "build-assets", .65);
          $_i_8$1.send("app:build-assets", $_H$1.res, $_$$1, $_N$1, $_b$1.pick($_IN_A_1$, "scenes", "inlineSpriteFrames", "mergeStartScene", "optimizeHotUpdate", "wechatgame"), function ($_IN_E_1$, $_IN_9_2$, $_IN_1_3$) {
            if ($_IN_E_1$) {
              _A_Fun_($_IN_E_1$);

              $_c_4$1 = true;
            } else if ($_IN_9_2$) {
              $_Q$1._buildAssets = $_IN_9_2$;
              $_Q$1._packedAssets = $_IN_1_3$;
            }

            $_j_1$1.normal("Finish build-assets in worker");
            s();
          }, -1);
        }
      }, -1);
    }, $_J$1, true);
  });
  var $_K$1 = null;
  var $_X$1 = null;
  $_C$1.task("build-settings", ["build-assets"], function ($_IN_F_1$) {
    var $_i_9$1 = Editor.Profile.load("profile://project/project.json");
    let $_s_5$1 = {
      stringify: false,
      customSettings: {
        platform: $_$$1,
        groupList: $_i_9$1.data["group-list"],
        collisionMatrix: $_i_9$1.data["collision-matrix"]
      },
      sceneList: $_IN_A_1$.scenes,
      uuidList: $_Q$1.getAssetUuids(),
      packedAssets: $_Q$1._packedAssets,
      webOrientation: $__$1,
      debug: $_N$1,
      subpackages: $_z$1
    };

    if ("android-instant" === $_IN_A_1$.platform) {
      $_s_5$1.server = $_IN_A_1$["android-instant"].REMOTE_SERVER_ROOT;
    }

    buildSettings($_s_5$1, function ($_IN_10_1$, $_IN_A_2$, $_IN_2_3$) {
      if ($_IN_10_1$) {
        _A_Fun_($_IN_10_1$);
      } else {
        $_K$1 = $_IN_A_2$;
        $_X$1 = $_IN_2_3$;
        $_IN_F_1$();
      }
    });
  });
  let $_Z$1 = null;

  function _Y_Fun_($Y_IN1$, $Y_IN2$) {
    var $_s_6$1 = [$_H$1.template_shares, $Y_IN1$];
    return $_C$1.src($_s_6$1).pipe(getTemplateFillPipe($_IN_A_1$)).pipe($_C$1.dest($_V$1)).on("end", $Y_IN2$);
  }

  $_C$1.task("compress-settings", function () {
    if ($_N$1) {
      return;
    }

    let $_e_4$1 = {};

    (function () {
      let $_t_6$1 = $_K$1.uuids = [];
      let $_i_b$1 = {};

      function _s_Fun_($S_IN_1_1$) {
        var $_r_6$1 = ($_i_b$1[$S_IN_1_1$] || 0) + 1;
        $_i_b$1[$S_IN_1_1$] = $_r_6$1;

        if ($_r_6$1 >= 2 && !($S_IN_1_1$ in $_e_4$1)) {
          $_e_4$1[$S_IN_1_1$] = $_t_6$1.length;
          $_t_6$1.push($S_IN_1_1$);
        }
      }

      let $_r_7$1 = $_K$1.rawAssets;

      for (let $_e_5$1 in $_r_7$1) {
        let $_t_4$1 = $_r_7$1[$_e_5$1];

        for (let $_e_6$1 in $_t_4$1) _s_Fun_($_e_6$1);
      }

      let $_n_9$1 = $_K$1.scenes;

      for (let e = 0; e < $_n_9$1.length; ++e) {
        _s_Fun_($_n_9$1[e].uuid);
      }

      let $_o_8$1 = $_K$1.packedAssets;

      for (let $_e_7$1 in $_o_8$1) $_o_8$1[$_e_7$1].forEach(_s_Fun_);

      let $_a_6$1 = $_K$1.md5AssetsMap;

      for (let $_e_8$1 in $_a_6$1) {
        let $_t_5$1 = $_a_6$1[$_e_8$1];

        for (let e = 0; e < $_t_5$1.length; e += 2) {
          _s_Fun_($_t_5$1[e]);
        }
      }
    })();

    let $_i_12$1 = $_K$1.rawAssets;
    let $_s_d$1 = $_K$1.rawAssets = {};

    for (let $_t_7$1 in $_i_12$1) {
      let $_n_a$1 = $_i_12$1[$_t_7$1];
      let $_o_9$1 = $_s_d$1[$_t_7$1] = {};

      for (let $_t_8$1 in $_n_a$1) {
        var $_r_8$1 = $_n_a$1[$_t_8$1];
        let $_i_c$1 = $_e_4$1[$_t_8$1];

        if (void 0 !== $_i_c$1) {
          $_t_8$1 = $_i_c$1;
        }

        $_o_9$1[$_t_8$1] = $_r_8$1;
      }
    }

    let $_n_b$1 = $_K$1.scenes;

    for (let t = 0; t < $_n_b$1.length; ++t) {
      let $_i_d$1 = $_n_b$1[t];
      let $_s_9$1 = $_e_4$1[$_i_d$1.uuid];

      if (void 0 !== $_s_9$1) {
        $_i_d$1.uuid = $_s_9$1;
      }
    }

    let $_o_a$1 = $_K$1.packedAssets;

    for (let $_t_9$1 in $_o_a$1) {
      let $_i_e$1 = $_o_a$1[$_t_9$1];

      for (let t = 0; t < $_i_e$1.length; ++t) {
        let $_s_a$1 = $_e_4$1[$_i_e$1[t]];

        if (void 0 !== $_s_a$1) {
          $_i_e$1[t] = $_s_a$1;
        }
      }
    }

    if ($_IN_A_1$.md5Cache) {
      let $_t_a$1 = $_K$1.md5AssetsMap;

      for (let $_i_f$1 in $_t_a$1) {
        let $_s_b$1 = $_t_a$1[$_i_f$1];

        for (let t = 0; t < $_s_b$1.length; t += 2) {
          let $_i_10$1 = $_e_4$1[$_s_b$1[t]];

          if (void 0 !== $_i_10$1) {
            $_s_b$1[t] = $_i_10$1;
          }
        }
      }

      $_Z$1 = function ($_IN_14_1$) {
        var $_t_b$1 = $_IN_14_1$.uuids;
        var $_i_11$1 = $_IN_14_1$.md5AssetsMap;

        for (var $_s_c$1 in $_i_11$1) for (var r = $_i_11$1[$_s_c$1], n = 0; n < r.length; n += 2) {
          if ("number" == typeof r[n]) {
            r[n] = $_t_b$1[r[n]];
          }
        }
      };
    }
  });
  $_C$1.task("build-web-desktop-template", function ($_IN_15_1$) {
    _Y_Fun_($_H$1.template_web_desktop, $_IN_15_1$);
  });
  $_C$1.task("build-web-mobile-template", function ($_IN_16_1$) {
    _Y_Fun_($_H$1.template_web_mobile, $_IN_16_1$);
  });
  $_C$1.task("build-fb-instant-games-template", function ($_IN_17_1$) {
    _Y_Fun_($_H$1.template_instant_games, $_IN_17_1$);
  });
  $_C$1.task("build-plugin-scripts", ["build-settings"], function () {
    Editor.log("Start building plugin scripts");
    var $_t_c$1 = Editor.assetdb;
    var $_i_13$1 = [];

    for (var $_s_e$1 in $_X$1) {
      var $_r_9$1 = $_X$1[$_s_e$1];
      let $_c_6$1 = $_t_c$1.uuidToFspath($_r_9$1);
      var $_n_c$1 = $_e_3$1.dirname($_e_3$1.join($_H$1.src, $_s_e$1));
      console.log(`start gulpping ${$_c_6$1} to ${$_n_c$1}`);
      var $_o_b$1 = $_C$1.src($_c_6$1);

      if (!$_N$1) {
        var $_a_7$1 = Editor.require("unpack://engine/gulp/util/utils").uglify;

        $_o_b$1 = $_o_b$1.pipe($_a_7$1("build", {
          jsb: $_G$1,
          debug: $_N$1,
          wechatgame: $_F$1,
          qqplay: $_I$1
        }));
        $_d_2$1.obj([$_o_b$1]).on("error", function ($_IN_18_1$) {
          _A_Fun_($_IN_18_1$.message);
        });
      }

      $_o_b$1 = $_o_b$1.pipe($_C$1.dest($_n_c$1)).on("end", () => {
        console.log("finish gulpping", $_c_6$1);
      });
      $_i_13$1.push($_o_b$1);
    }

    if ($_i_13$1.length > 0) {
      return $_u$1.merge($_i_13$1).on("end", () => {
        Editor.log("Finish building plugin scripts");
      });
    } else {
      return null;
    }
  });
  $_C$1.task("copy-main-js", function () {
    return $_C$1.src([$_e_3$1.join($_H$1.tmplBase, "shares/main.js")]).pipe(getTemplateFillPipe($_IN_A_1$)).pipe($_C$1.dest($_V$1));
  });
  $_C$1.task("import-script-statically", function ($_IN_19_1$) {
    var $_s_f$1;
    var $_r_a$1 = $_e_3$1.join($_V$1, "main.js");
    var $_n_d$1 = $_i_6$1.readFileSync($_r_a$1, "utf8");

    if ($_I$1 && $_K$1.jsList && $_K$1.jsList.length > 0) {
      $_s_f$1 = "\n// plugin script code\n";
      var $_o_c$1 = $_H$1.src;
      $_K$1.jsList.map(t => {
        let $_i_14$1 = $_e_3$1.relative($_V$1, $_e_3$1.resolve($_o_c$1, t));

        if (Editor.isWin32) {
          $_i_14$1 = $_i_14$1.replace(/\\/g, "/");
        }

        $_s_f$1 += `BK.Script.loadlib('GameRes://${$_i_14$1}'); \n`;
      });
      $_s_f$1 = $_n_d$1.replace("<Inject plugin code>", $_s_f$1);
      $_K$1.jsList = void 0;

      if ($_s_f$1 === $_n_d$1) {
        $_IN_19_1$("Inject plugin code failure for qqplay");
        0;
        return;
      }
    } else {
      $_s_f$1 = $_n_d$1.replace("<Inject plugin code>", "");
    }

    $_i_6$1.writeFileSync($_r_a$1, $_s_f$1);
    $_IN_19_1$();
  });
  $_C$1.task("copy-build-template", function ($_IN_1A_1$) {
    Editor.Ipc.sendToMain("builder:state-changed", "copy-build-templates", .98);
    let $_r_c$1 = $_e_3$1.basename($_IN_A_1$.dest);
    let $_n_e$1 = $_e_3$1.join($_IN_A_1$.project, "build-templates");

    if (!$_i_6$1.existsSync($_n_e$1)) {
      return $_IN_1A_1$();
    }

    let $_a_8$1 = $_e_3$1.join($_n_e$1, $_r_c$1, "**");
    $_o_6$1($_a_8$1, (r, o) => {
      (o = o.map(t => $_e_3$1.resolve(t))).forEach(s => {
        let $_r_b$1 = $_e_3$1.relative($_n_e$1, s);
        let $_o_d$1 = $_e_3$1.join($_IN_A_1$.buildPath, $_r_b$1);
        $_i_6$1.ensureDirSync($_e_3$1.dirname($_o_d$1));
        $_i_6$1.copySync(s, $_o_d$1);
      });

      if ($_IN_1A_1$) {
        $_IN_1A_1$(r);
      }
    });
  });
  $_C$1.task("build-common", ["compile", "build-assets", "build-settings", "build-plugin-scripts"]);

  var $_ee$1 = require(Editor.url("unpack://engine/gulp/tasks/engine"));

  function _te_Fun_($T_IN1$) {
    var $_s_7$1 = $_e_3$1.basename($T_IN1$);
    var $_r_5$1 = $_e_3$1.dirname($T_IN1$);
    var $_n_7$1 = $_e_3$1.join($_r_5$1, $_s_7$1);
    const $_o_7$1 = $_i_6$1.readFileSync($_n_7$1);
    var $_a_5$1 = $_h_1$1.createHash("md5").update($_o_7$1).digest("hex");
    $_a_5$1 = $_a_5$1.slice(0, $_x$1);
    var $_c_5$1,
        $_u_1$1 = $_e_3$1.basename($_r_5$1);

    if (Editor.Utils.UuidUtils.isUuid($_u_1$1)) {
      var $_d_3$1 = $_r_5$1 + "." + $_a_5$1;
      $_c_5$1 = $_e_3$1.join($_d_3$1, $_s_7$1);

      try {
        $_i_6$1.renameSync($_r_5$1, $_d_3$1);
      } catch (e) {
        $_l_3$1.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`);
      }
    } else {
      var $_p_4$1 = $_s_7$1.lastIndexOf(".");
      var $_m_4$1 = ~$_p_4$1 ? `${$_s_7$1.slice(0, $_p_4$1)}.${$_a_5$1}${$_s_7$1.slice($_p_4$1)}` : `${$_s_7$1}.${$_a_5$1}`;
      $_c_5$1 = $_e_3$1.join($_r_5$1, $_m_4$1);

      try {
        $_i_6$1.renameSync($_n_7$1, $_c_5$1);
      } catch (e) {
        $_l_3$1.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`);
      }
    }

    return {
      hash: $_a_5$1,
      path: $_c_5$1
    };
  }

  async function _ie_Fun_($I_IN1$) {
    const $_i_a$1 = Editor.Utils.UuidUtils.getUuidFromLibPath;
    const $_s_8$1 = Editor.Utils.UuidUtils.compressUuid;
    const $_n_8$1 = [];

    for (var a = await r($_o_6$1)($I_IN1$, {
      nodir: true
    }), c = 0; c < a.length; ++c) {
      var $_l_4$1 = a[c];
      var $_u_2$1 = $_i_a$1($_e_3$1.relative($_V$1, $_l_4$1));

      if ($_u_2$1) {
        $_n_8$1.push($_s_8$1($_u_2$1, true), _te_Fun_($_l_4$1).hash);
      } else {
        Editor.warn(`Can not resolve uuid for path "${$_l_4$1}", skip the MD5 process on it.`);
      }
    }

    return $_n_8$1;
  }

  $_C$1.task("build-cocos2d", function ($_IN_1B_1$) {
    Editor.Ipc.sendToAll("builder:state-changed", "cut-engine", 0);
    var $_r_d$1 = $_G$1 ? $_e_3$1.join($_V$1, "src") : $_V$1;
    $_i_6$1.ensureDirSync($_H$1.jsCacheDir);

    if ($_IN_A_1$.excludedModules) {
      $_IN_A_1$.excludedModules = $_IN_A_1$.excludedModules.sort();
    } else {
      $_IN_A_1$.excludedModules = [];
    }

    var $_n_f$1 = false;

    if ($_i_6$1.existsSync($_H$1.jsCacheExcludes)) {
      let $_e_9$1 = $_i_6$1.readJSONSync($_H$1.jsCacheExcludes);

      if ($_e_9$1.excludes && $_e_9$1.version) {
        $_n_f$1 = Editor.versions.cocos2d === $_e_9$1.version && $_L$1 === $_e_9$1.nativeRenderer && $_e_9$1.excludes.toString() === $_IN_A_1$.excludedModules.toString() && $_e_9$1.sourceMaps === $_IN_A_1$.sourceMaps;
      }
    }

    function _o_Fun_() {
      var $_e_a$1 = [$_H$1.jsCache];

      if ($_P$1) {
        $_e_a$1.push($_H$1.jsCache + ".map");
      }

      var $_t_d$1 = $_C$1.src($_e_a$1);

      if ($_G$1) {
        $_t_d$1 = $_t_d$1.pipe($_c_3$1("cocos2d-jsb.js"));
      }

      return $_t_d$1 = $_t_d$1.pipe($_C$1.dest($_r_d$1));
    }

    if ($_n_f$1 && $_i_6$1.existsSync($_H$1.jsCache)) {
      _o_Fun_().on("end", $_IN_1B_1$);

      0;
      return;
    }

    var $_a_9$1 = [];

    var $_l_5$1 = require(Editor.url("unpack://engine/modules.json"));

    if ($_l_5$1 && $_l_5$1.length > 0) {
      if ($_IN_A_1$.excludedModules) {
        $_IN_A_1$.excludedModules.forEach(function ($_IN_1D_1$) {
          $_l_5$1.some(function ($_IN_1E_1$) {
            if ($_IN_1E_1$.name === $_IN_1D_1$) {
              if ($_IN_1E_1$.entries) {
                $_IN_1E_1$.entries.forEach(function ($_IN_1F_1$) {
                  $_a_9$1.push($_e_3$1.join(Editor.url("unpack://engine"), $_IN_1F_1$));
                });
              }

              return true;
            }
          });
        });
      }

      if ("wechatgame-subcontext" === $_$$1) {
        $_l_5$1.forEach(t => {
          if (("WebGL Renderer" === t.name || t.dependencies && -1 !== t.dependencies.indexOf("WebGL Renderer")) && t.entries) {
            t.entries.forEach(function ($_IN_20_1$) {
              $_a_9$1.push($_e_3$1.join(Editor.url("unpack://engine"), $_IN_20_1$));
            });
          }
        });
      }

      console.log("Exclude modules: " + $_a_9$1);
    }

    (function ($_IN_1C_1$, $_IN_C_2$, $_IN_3_3$) {
      $_ee$1[$_N$1 ? $_G$1 ? "buildJsb" : "buildCocosJs" : $_G$1 ? "buildJsbMin" : "buildCocosJsMin"](Editor.url("unpack://engine/index.js"), $_IN_C_2$, $_IN_1C_1$, {
        wechatgame: $_F$1,
        qqplay: $_I$1,
        runtime: "runtime" === $_B$1,
        nativeRenderer: $_L$1,
        wechatgameSub: $_W$1
      }, $_IN_3_3$, $_IN_A_1$.sourceMaps);
    })($_a_9$1, $_H$1.jsCache, function () {
      _o_Fun_().on("end", () => {
        $_i_6$1.writeFileSync($_H$1.jsCacheExcludes, JSON.stringify({
          excludes: $_IN_A_1$.excludedModules,
          version: Editor.versions.cocos2d,
          nativeRenderer: $_L$1,
          sourceMaps: $_IN_A_1$.sourceMaps
        }), null, 4);
        $_IN_1B_1$();
      });
    });
  });
  $_C$1.task("copy-webDebugger", function ($_IN_21_1$) {
    var $_r_e$1 = $_e_3$1.join($_V$1, $_e_3$1.basename($_H$1.webDebuggerSrc));

    if ($_IN_A_1$.embedWebDebugger) {
      $_i_6$1.copy($_H$1.webDebuggerSrc, $_r_e$1, $_IN_21_1$);
    } else {
      $_g_3$1($_r_e$1, {
        force: true
      }, $_IN_21_1$);
    }
  });
  $_C$1.task("revision-res-jsList", async function () {
    if ($_IN_A_1$.md5Cache) {
      console.time("revision");
      var $_i_15$1 = await _ie_Fun_($_e_3$1.join($_H$1.res, "import", "**"));
      var $_s_10$1 = await _ie_Fun_($_e_3$1.join($_H$1.res, "raw-assets", "**"));
      $_K$1.md5AssetsMap = {
        import: $_i_15$1,
        "raw-assets": $_s_10$1
      };

      (function ($_IN_22_1$) {
        if ($_IN_22_1$.jsList && $_IN_22_1$.jsList.length > 0) {
          var $_i_16$1 = $_H$1.src;
          var $_s_11$1 = $_IN_22_1$.jsList.map(t => $_e_3$1.resolve($_i_16$1, t)).map(t => (t = _te_Fun_(t).path, $_e_3$1.relative($_i_16$1, t).replace(/\\/g, "/")));
          $_s_11$1.sort();
          $_IN_22_1$.jsList = $_s_11$1;
        }
      })($_K$1);

      console.timeEnd("revision");
    }
  });
  $_C$1.task("save-settings", function ($_IN_23_1$) {
    var $_t_e$1 = _R_Fun_($_K$1, $_N$1);

    if ($_Z$1) {
      $_t_e$1 += `(${$_Z$1.toString()})(${$_q$1});`;
    }

    $_i_6$1.writeFile($_H$1.settings, $_t_e$1, $_IN_23_1$);
  });
  $_C$1.task("revision-other", function ($_IN_24_1$) {
    if ($_IN_A_1$.md5Cache) {
      var $_s_12$1 = $_V$1;
      var $_r_f$1 = ["index.html"];

      if ($_G$1) {
        $_r_f$1 = $_r_f$1.concat(["main.js", "cocos-project-template.json", "project.json"]);
      }

      var $_n_10$1 = [$_e_3$1.relative($_s_12$1, $_H$1.bundledScript)];

      if ($_F$1) {
        $_r_f$1 = $_r_f$1.concat(["game.js", "game.json", "project.config.json", "index.js"]);
        $_n_10$1 = $_n_10$1.concat(["game.json", "project.config.json"]);
      } else if ($_I$1) {
        $_r_f$1 = $_r_f$1.concat(["main.js", "cocos2d-js.js", "cocos2d-js-min.js", "project.dev.js", "project.js", "settings.js"]);
      }

      if (Editor.isWin32) {
        $_n_10$1 = $_n_10$1.map(e => e.replace(/\\/g, "/"));
      }

      $_C$1.src(["src/*.js", "*"], {
        cwd: $_V$1,
        base: $_s_12$1
      }).pipe($_m_3$1.revision({
        debug: true,
        hashLength: $_x$1,
        dontRenameFile: $_r_f$1,
        dontSearchFile: $_n_10$1,
        annotator: function ($A_IN_1_1$, $A_IN2$) {
          return [{
            contents: $A_IN_1_1$,
            path: $A_IN2$
          }];
        },
        replacer: function ($R_IN_1_1$, $R_IN_1_2$, $R_IN3$, $R_IN4$) {
          if (!(".map" === $_e_3$1.extname($R_IN_1_1$.path) && $R_IN4$.revPathOriginal + ".map" !== $R_IN_1_1$.path)) {
            $R_IN_1_1$.contents = $R_IN_1_1$.contents.replace($R_IN_1_2$, "$1" + $R_IN3$ + "$3$4");
          }
        }
      })).pipe($_f_3$1()).pipe($_C$1.dest($_V$1)).on("end", $_IN_24_1$);
    } else {
      $_IN_24_1$();
    }
  });
  $_C$1.task("finish-build", $_T$1("copy-build-template", "import-script-statically", "before-change-files", "revision-res-jsList", "compress-settings", "save-settings", "revision-other"));

  (function () {
    let $_t_f$1 = null;
    $_C$1.task("pack-wechatgame-subdomain", function () {
      $_t_f$1 = function () {
        const $_t_10$1 = Editor.require("app://editor/share/engine-extends/json-packer");

        let $_s_13$1 = Editor.Utils.UuidUtils.compressUuid;
        let $_r_10$1 = $_o_6$1.sync($_e_3$1.join($_H$1.res, "import/**"), {
          nodir: true
        });
        let $_n_11$1 = new $_t_10$1();

        for (let t = 0; t < $_r_10$1.length; ++t) {
          let $_o_e$1 = $_r_10$1[t];
          let $_a_a$1 = $_e_3$1.extname($_o_e$1);

          if (".json" !== $_a_a$1) {
            continue;
          }

          let $_c_7$1 = $_i_6$1.readJsonSync($_o_e$1);
          let $_l_6$1 = $_s_13$1($_e_3$1.basename($_o_e$1, $_a_a$1), true);
          $_n_11$1.add($_l_6$1, $_c_7$1);
          $_g_3$1.sync($_o_e$1, {
            force: true
          });
        }

        return $_n_11$1.pack();
      }();

      $_g_3$1.sync($_e_3$1.join($_V$1, "game.json"), {
        force: true
      });
      $_g_3$1.sync($_e_3$1.join($_V$1, "project.config.json"), {
        force: true
      });
      let $_s_14$1 = $_e_3$1.join($_V$1, "game.js");
      let $_r_11$1 = $_i_6$1.readFileSync($_s_14$1, "utf8");
      let $_n_12$1 = 'SUBCONTEXT_ROOT = "' + $_D$1 + '"';
      $_r_11$1 = $_r_11$1.replace(/SUBCONTEXT_ROOT = ""/g, $_n_12$1);
      $_i_6$1.writeFileSync($_e_3$1.join($_V$1, "index.js"), $_r_11$1);
      $_g_3$1.sync($_s_14$1, {
        force: true
      });
      let $_a_b$1 = Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js");
      let $_c_8$1 = $_e_3$1.join($_V$1, "libs/sub-context-adapter.js");
      $_i_6$1.copySync($_a_b$1, $_c_8$1);
    });
    $_C$1.task("extend-settings-wechat-subdomain", function () {
      $_K$1.packedAssets = {
        WECHAT_SUBDOMAIN: $_t_f$1.indices
      };
      $_K$1.WECHAT_SUBDOMAIN_DATA = JSON.parse($_t_f$1.data);
      $_t_f$1 = null;
    });
  })();

  $_C$1.task("copy-wechatgame-files", function () {
    var $_i_17$1 = Editor.url("packages://weapp-adapter/wechatgame/libs/weapp-adapter/");
    var $_s_15$1 = [Editor.url("packages://weapp-adapter/wechatgame/**/*"), "!" + Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js")];
    return $_C$1.src($_s_15$1).pipe($_u$1.through(function ($_IN_25_1$) {
      var $_r_12$1 = $_e_3$1.basename($_IN_25_1$.path);
      var $_n_13$1 = $_e_3$1.contains($_i_17$1, $_IN_25_1$.path);

      if ("game.js" === $_r_12$1) {
        var $_o_f$1 = $_IN_25_1$.contents.toString();
        var $_a_c$1 = 'REMOTE_SERVER_ROOT = "' + $_IN_A_1$.wechatgame.REMOTE_SERVER_ROOT + '"';
        $_o_f$1 = $_o_f$1.replace(/REMOTE_SERVER_ROOT = ""/g, $_a_c$1);
        $_IN_25_1$.contents = new Buffer($_o_f$1);
      } else if ("game.json" === $_r_12$1) {
        let $_e_b$1 = JSON.parse($_IN_25_1$.contents.toString());
        $_e_b$1.deviceOrientation = $_IN_A_1$.wechatgame.orientation;

        if ($_IN_A_1$.wechatgame.subContext && !$_W$1) {
          $_e_b$1.openDataContext = $_IN_A_1$.wechatgame.subContext;
        } else {
          delete $_e_b$1.openDataContext;
        }

        if ($_z$1) {
          $_e_b$1.subpackages = [];

          for (let $_t_11$1 in $_z$1) $_e_b$1.subpackages.push({
            name: $_t_11$1,
            root: $_z$1[$_t_11$1].path
          });
        }

        $_IN_25_1$.contents = new Buffer(JSON.stringify($_e_b$1, null, 4));
      } else if ("project.config.json" === $_r_12$1) {
        let $_e_c$1 = JSON.parse($_IN_25_1$.contents.toString());
        $_e_c$1.appid = $_IN_A_1$.wechatgame.appid || "wx6ac3f5090a6b99c5";
        $_e_c$1.projectname = $_D$1;
        $_IN_25_1$.contents = new Buffer(JSON.stringify($_e_c$1, null, 4));
      } else if (".js" === $_e_3$1.extname($_r_12$1) && $_n_13$1) {
        var $_c_9$1;

        try {
          $_c_9$1 = require("babel-core").transform($_IN_25_1$.contents.toString(), {
            ast: false,
            highlightCode: false,
            sourceMaps: false,
            compact: false,
            filename: $_IN_25_1$.path,
            presets: ["env"],
            plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-export-extensions", "add-module-exports"]
          });
        } catch (e) {
          e.stack = `Compile ${$_r_12$1} error: ${e.stack}`;
          return this.emit("error", e);
        }

        $_IN_25_1$.contents = new Buffer($_c_9$1.code);
      }

      this.emit("data", $_IN_25_1$);
    })).pipe($_C$1.dest($_V$1));
  });
  $_C$1.task("copy-qqplay-files", function () {
    var $_e_d$1 = [Editor.url("packages://qqplay-adapter/qqplay/**/*")];
    return $_C$1.src($_e_d$1).pipe($_u$1.through(function ($_IN_26_1$) {
      this.emit("data", $_IN_26_1$);
    })).pipe($_C$1.dest($_V$1));
  });
  $_C$1.task("before-change-files", function ($_IN_27_1$) {
    let $_i_18$1 = require(Editor.url("app://editor/share/build-utils"));

    Editor.Builder.doCustomProcess("before-change-files", $_i_18$1.getCommonOptions($_IN_A_1$), $_Q$1, $_IN_27_1$);
  });
  $_C$1.task($_k$1 + "web-desktop", $_T$1("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-desktop-template", "finish-build"));
  $_C$1.task($_k$1 + "web-mobile", $_T$1("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-mobile-template", "finish-build"));
  $_C$1.task($_k$1 + "fb-instant-games", $_T$1("build-cocos2d", ["build-common", "copy-webDebugger"], "build-fb-instant-games-template", "finish-build"));
  $_C$1.task($_k$1 + "wechatgame", $_T$1("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "finish-build"));
  $_C$1.task($_k$1 + "wechatgame-subcontext", $_T$1("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "pack-wechatgame-subdomain", "extend-settings-wechat-subdomain", "finish-build"));
  $_C$1.task($_k$1 + "qqplay", $_T$1("build-cocos2d", "build-common", "copy-main-js", "copy-qqplay-files", "finish-build"));
  $_C$1.task("copy-runtime-scripts", function () {
    var $_t_12$1 = $_e_3$1.join($_V$1, "src");
    return $_C$1.src($_e_3$1.join($_H$1.tmplBase, "runtime/**/*.js")).pipe($_C$1.dest($_t_12$1));
  });
  $_C$1.task("encrypt-src-js", function ($_IN_28_1$) {
    if ($_N$1 || !$_IN_A_1$.encryptJs) {
      $_IN_28_1$();
      0;
      return;
    }

    var $_r_13$1 = $_e_3$1.join($_V$1, "src");
    var $_n_14$1 = $_e_3$1.resolve($_r_13$1, "../js backups (useful for debugging)");
    $_i_6$1.copy($_r_13$1, $_n_14$1, e => {
      if (e) {
        Editor.warn("Failed to backup js files for debugging.", e);
      }

      $_w_1$1.encryptJsFiles($_IN_A_1$, $_IN_28_1$);
    });
  });
  $_C$1.task("copy-jsb-adapter", function () {
    let $_s_16$1 = Editor.url("packages://jsb-adapter/dist");
    let $_r_14$1 = $_e_3$1.join($_V$1, "jsb-adapter");
    let $_n_15$1 = [];

    let $_o_10$1 = require(Editor.url("packages://jsb-adapter/modules.json"));

    $_IN_A_1$.excludedModules.forEach(function ($_IN_29_1$) {
      $_o_10$1.some(function ($_IN_2A_1$) {
        if ($_IN_2A_1$.name === $_IN_29_1$) {
          $_IN_2A_1$.entries.forEach(function ($_IN_2B_1$) {
            $_n_15$1.push($_e_3$1.join(Editor.url("packages://jsb-adapter"), $_IN_2B_1$));
          });
          0;
          return;
        }
      });
    });
    $_i_6$1.copySync($_s_16$1, $_r_14$1, {
      filter: function ($F_IN1$) {
        for (let t = 0; t < $_n_15$1.length; ++t) {
          if ($_n_15$1[t] === $F_IN1$) {
            return false;
          }
        }

        return true;
      }
    });
  });
  $_C$1.task("copy-native-files", $_T$1("build-common", "copy-runtime-scripts", "copy-jsb-adapter", "copy-main-js", "finish-build", "encrypt-src-js"));
  $_C$1.task("build-cocos-native-project", function ($_IN_2C_1$) {
    $_w_1$1.build($_IN_A_1$, $_IN_2C_1$);
  });
  $_C$1.task("build-native-project", $_T$1("build-cocos-native-project", "build-cocos2d", "copy-native-files"));
  $_C$1.task($_k$1 + "android", ["build-native-project"]);
  $_C$1.task($_k$1 + "ios", ["build-native-project"]);
  $_C$1.task($_k$1 + "win32", ["build-native-project"]);
  $_C$1.task($_k$1 + "mac", ["build-native-project"]);
  $_C$1.task($_k$1 + "android-instant", ["build-native-project"]);
  var $_se$1 = $_k$1 + $_$$1;

  if ($_se$1 in $_C$1.tasks) {
    var $_re$1;

    if ($_G$1) {
      $_re$1 = [$_H$1.res + "/**/*", $_H$1.src + "/*/"];
    } else {
      $_re$1 = $_e_3$1.join($_V$1, "**/*");
    }

    Editor.log("Delete " + $_re$1);
    $_g_3$1($_re$1, {
      force: true
    }, e => {
      if (e) {
        return $_IN_7_2$(e);
      }

      $_C$1.start($_se$1, function ($_IN_11_1$) {
        if ($_IN_11_1$) {
          $_IN_7_2$($_IN_11_1$);
        } else {
          if (!$_G$1) {
            Editor.Ipc.sendToMain("app:update-build-preview-path", $_V$1);
          }

          $_IN_7_2$(null, $_Q$1);
        }
      });
    });
  } else {
    var $_ne$1 = [];

    for (var $_oe$1 in $_C$1.tasks) if (0 === $_oe$1.indexOf($_k$1)) {
      $_ne$1.push($_oe$1.substring($_k$1.length));
    }

    $_IN_7_2$(new Error(s("Not support %s platform, available platform currently: %s", $_$$1, $_ne$1)));
  }
};

exports.getTemplateFillPipe = getTemplateFillPipe;
exports.buildSettings = buildSettings;