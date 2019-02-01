//babel核心库，用来实现核心的转换引擎
var fs = require("fs");
var babel = require('@babel/core');
var beautifier = require("./vistors/beautifier")(babel);
var renameRequire = require("./vistors/renameRequire")(babel);
var simpleVisitor = require("./vistors/simpleVisitor")(babel);

var glob = require("glob");

function transformCode(file) {
    console.log("transformCode begin" + file);
    var code = fs.readFileSync(file, "utf-8");

/*    var es5Code = babel.transform(code, {
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-transform-runtime"]
    });*/
    var ast = babel.parse(code);

    var result = babel.transform(code, {
        plugins: [
            {visitor: beautifier.visitor},
            {visitor: renameRequire.visitor}
        ],
    });
    var code = result.code;
/*    var es5Code = babel.transform(code, {
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-transform-runtime"]
    });*/
/*    code = es5Code.code;*/
    fs.writeFileSync(file,code);
    //console.log("transformCode end" + file);
    //fs.writeFileSync("./test/result.js",code);
    //console.log(code)
}

function myTransformApp(root) {
    var files = glob.sync(root, {});
    files = files.filter(function (file) {
        return (file.includes("editor/") || file.includes("editor-framework/")) && !file.includes("node_modules");
    });
    console.log(files);
    for(var i = 0;i < files.length;++i) {
        try {
            transformCode(files[i]);
        } catch(e) {
            console.error("error transform :" + files[i]);
            console.error(e);
        }
    }
}
myTransformApp("/Applications/CocosCreator2.05.app/Contents/Resources/app/**/*.js")
//myTransformApp("/Users/mario/Desktop/Repository/app/**/*.js");
//transformCode("./test/gulp-build.js");
//transformCode("./test/test2.js");

