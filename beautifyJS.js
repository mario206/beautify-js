//babel核心库，用来实现核心的转换引擎
var fs = require("fs");
var babel = require('@babel/core');
var beautifier = require("./vistors/beautifier")(babel);
var renameRequire = require("./vistors/renameRequire")(babel);
var glob = require("glob");
var path = require("path");

var beautifyJS = {};
g_option = {
    renameMap : {},
    currFileName : "",
    nameHash : "",
    bRenameLambda : true,
    bRenameFunctionName : true,
    bRenameFunctionParam : true,
    bRenameLocalVariable : true,
    bRenameRequire : true,
    bRenameExport : true
};

/// 允许包含字母、数字、美元符号($)和下划线，但第一个字符不允许是数字，不允许包含空格和其他标点
function getValidName(name) {
    if(!/^[a-zA-Z_$]/.test(name)) {
        name[0] = "_";
    }
    name = name.replace(/-/g,"_");
    name = name.replace(/\./g,"");
    name = name.replace(/\//g,"");
    name = name.replace(/ /g,"");
    return name;
};

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

beautifyJS.transformWithFile = function(file,reWrite) {
    console.log("transformWithFile begin: " + file);
    var code = fs.readFileSync(file, "utf-8");
    var options = {
        code : code,
        filename : file,
    };

    this.transformCode(options);

    if(options.errCode == 0) {
        if(reWrite) {
            fs.writeFileSync(file,options.result);
        } else {
            fs.writeFileSync("./test/result.js",options.result);
        }
    }
    console.log("transformWithFile end: " + file);
};

beautifyJS.transformCode = function(options) {
    options = options || {};
    try {
        var code = options.code;
        var fileName = options.filename || "";
        console.log("transformCode begin" + fileName);

        g_option.currFileName = path.basename(fileName);
        g_option.currFileName = getValidName(g_option.currFileName).toLocaleUpperCase();
        g_option.nameHash = g_option.currFileName;
        if(g_option.nameHash.length > 3) {
            g_option.nameHash = g_option.nameHash.substr(0,3);
        }
        options.errCode = 0;

        g_option.bRenameLambda = options.bRenameLambda == undefined ? true : !!options.bRenameLambda;
        g_option.bRenameFunctionName = options.bRenameFunctionName == undefined ? true : !!options.bRenameFunctionName;
        g_option.bRenameFunctionParam = options.bRenameFunctionParam == undefined ? true : !!options.bRenameFunctionParam;
        g_option.bRenameLocalVariable = options.bRenameLocalVariable == undefined ? true : !!options.bRenameLocalVariable;
        g_option.bRenameRequire = options.bRenameRequire == undefined ? true : !!options.bRenameRequire;
        g_option.bRenameExport = options.bRenameExport == undefined ? true : !!options.bRenameExport;

        var result = processCodeNtimes(code,[
            beautifier.visitor,renameRequire.visitor1
        ],[
            renameRequire.visitor
        ]);
        options.result = result;

    } catch (e) {
        console.log("transformCode error :" + e);
        options.errCode = -1;
        options.errStr = e;
    }
    console.log("transformCode end" + fileName);
};


module.exports = beautifyJS;


