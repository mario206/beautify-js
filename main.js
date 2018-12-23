//babel核心库，用来实现核心的转换引擎
var fs = require("fs");
var babel = require('babel-core');
var beautifier = require("./beautifier")(babel);
var renameRequire = require("./renameRequire")(babel);


var file = "./test/gulp-build.js";
//var file = "./test/test1.js";

var code = fs.readFileSync(file, "utf-8");

var result = babel.transform(code, {
    plugins: [
        {visitor : beautifier.visitor},
        {visitor : renameRequire.visitor}
    ],

});
fs.writeFileSync("./test/result.js",result.code);
