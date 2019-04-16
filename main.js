//babel核心库，用来实现核心的转换引擎
var fs = require("fs");
var babel = require('@babel/core');
var beautifier = require("./vistors/beautifier")(babel);
var renameRequire = require("./vistors/renameRequire")(babel);
var simpleVisitor = require("./vistors/simpleVisitor")(babel);
var glob = require("glob");
var crypto = require('crypto');
var path = require("path");

g_renameMap = {};
g_currFileName = "";
g_nameHash = "";


function processCodeNtimes(code) {
    var ArrVisitors = Array.prototype.slice.call(arguments, 1);
    for(var i = 0;i < ArrVisitors.length;++i) {
        var visitors = ArrVisitors[i];
        var plguins = [];
        visitors.forEach(function (visitor) {
           plguins.push({visitor:visitor});
        });
        if(plguins.length > 0) {
            var result = babel.transform(code, {plugins: plguins});
            code = result.code;
        }
    }
    return code;
}

function transformCode(file,reWrite) {
    console.log("transformCode begin: " + file);
    var code = fs.readFileSync(file, "utf-8");
    g_currFileName = path.basename(file);
    g_nameHash = "";
    var md5Value= crypto.createHash('md5').update(g_currFileName, 'utf8').digest('hex');
    for(var i = 0;i < md5Value.length;++i) {
        if('a' <= md5Value[i] && md5Value[i] <= 'z') {
            if(g_nameHash.length < 3) {
                g_nameHash += md5Value[i];
            }
        }
    }
    if(g_nameHash.length < 3) {
        console.error("g_nameHash.leng < 3");
    }
/*    var es5Code = babel.transform(code, {
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-transform-runtime"]
    });*/
    //var ast = babel.parse(code);

    var code = processCodeNtimes(code,[
        beautifier.visitor,renameRequire.visitor1
    ],[renameRequire.visitor]);

/*    var result = babel.transform(code, {
        plugins: [
            {visitor: beautifier.visitor},
            {visitor: renameRequire.visitor}
        ],
    });
    var code = result.code;*/
/*    var es5Code = babel.transform(code, {
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-transform-runtime"]
    });*/
/*    code = es5Code.code;*/
    //console.log("transformCode end" + file);
    if(reWrite) {
        fs.writeFileSync(file,code);
    } else {
        fs.writeFileSync("./test/result.js",code);
    }
    //console.log(code)
}

function myTransformApp(root) {
    var files = glob.sync(root, {});
    files = files.filter(function (file) {
        return (file.includes("editor/") || file.includes("editor-framework/") || file.includes("dashboard/")) && !file.includes("node_modules");
    });
    console.log(files);
    for(var i = 0;i < files.length;++i) {
        try {
            transformCode(files[i],true);
        } catch(e) {
            console.error("error transform :" + files[i]);
            console.error(e);
        }
    }
}
//myTransformApp("/Users/mario/Desktop/Repository/app/**/*.js");
//transformCode("./test/gulp-build.js");


function runCode(bTest) {
    if(!bTest) {
        myTransformApp("/Applications/CocosCreator2.10.app/Contents/Resources/app/**/*.js")
    } else {
        transformCode("./test/test2.js",false);
    }
}

//runCode(false);


//transformCode("/Applications/CocosCreator2.09.app/Contents/Resources/app/editor/core/gulp-build.js",true);
//transformCode("/Applications/CocosCreator2.05.app/Contents/Resources/app/editor/core/gulp-build.js",true);

transformCode("/Applications/CocosCreator2.05.app/Contents/Resources/app/editor/page/build/texture-packer/packing/maxrects.js",true);
transformCode("/Applications/CocosCreator2.09.app/Contents/Resources/app/editor/page/build/texture-packer/packing/maxrects.js",true);

