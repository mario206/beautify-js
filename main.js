//babel核心库，用来实现核心的转换引擎
var fs = require("fs");
var babel = require('babel-core');
//可以实现类型判断，生成AST节点
var types = require('babel-types');
const isVarName = require('is-valid-var-name')
//visitor可以对特定节点进行处理

/// 允许包含字母、数字、美元符号($)和下划线，但第一个字符不允许是数字，不允许包含空格和其他标点符号著作权归作者所有。
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

var TypeDeclarator = "VariableDeclarator";
/*
将 var 拆开。
转换前
```
var a = 1,b = 2,c = 3;
```
转换后
```
var a = 1;
var b = 2;
var c = 3;
```
*/
function splitVar(path) {
    var declarations = path.node.declarations;
    if(declarations.length > 1) {
        var result = [];
        for(var k in declarations) {
            var dec = declarations[k];
            result.push(types.variableDeclaration(path.node.kind,[types.variableDeclarator(dec.id,dec.init)]));
        }
        path.replaceWithMultiple(result);
    }
}


function renameRequire(path) {
    if(path.node.callee.name == "require" && path.node.arguments.length == 1 && path.node.arguments[0].type == "StringLiteral") {
        var leftName;
        var nameSubfix = "";
        var srcName = path.node.arguments[0].value;
        if(path.parent.type == TypeDeclarator) {
            leftName = path.parent.id.name;
            /// var s = require("xx")
        } else if (path.parent.type == "AssignmentExpression") {    /// s = require("xxx")
            //leftName = path.parent.left.name;
            return; // 考虑到作用于问题，这个先不处理
        } else if(path.parent.type == "MemberExpression") {
            var curr = path.parentPath;
            while(curr && curr.type == "MemberExpression") {    // s = require("xxx").xxx.xxx
                var tname = "";
                if(curr.node.property.type == "StringLiteral") {
                    tname = curr.node.property.value;
                } else if(curr.node.property.type == "Identifier") {
                    tname = curr.node.property.name;
                } else {
                    console.error("unknown curr.node.property.type = " + curr.node.property.type);
                }
                nameSubfix += "_" + tname;
                curr = curr.parentPath;
            }
            if(curr.type != TypeDeclarator) {
                return;
            }
            leftName = curr.node.id.name;
        } else {
            return;
        }
        var tryCnt = 0;
        while(true) {
            var newName = "mod_" + srcName + nameSubfix + (tryCnt == 0 ? "" : tryCnt);
            if(path.scope.hasBinding(newName)) {
                tryCnt++;
            } else {
                newName = getValidName(newName);
                if(isVarName(newName)) {
                    path.scope.rename(leftName, newName);
                } else {
                    console.error("can't rename " + newName);
                }
                break;
            }
        }

    }
}

/*
!0  ->  true
!1  -> false
void 0 -> undefined
 */
function renameUnaryExpression(path) {
    if(path.node.operator === "!" && path.node.argument.type === "NumericLiteral") {
        var value;
        if(path.node.argument.extra.raw === "0" && path.node.argument.extra.rawValue === 0) {
            value = true;
        } else if(path.node.argument.extra.raw === "1" && path.node.argument.extra.rawValue === 1) {
            value = false;
        } else {
            console.error("unknown argument.extra.raw = " + path.node.argument.extra.raw);
            return;
        }
        path.replaceWith(types.booleanLiteral(value));
    } else if(path.node.operator === "void" && path.node.argument.type === "NumericLiteral" && path.node.argument.value == "0") {
        path.replaceWith(types.identifier("undefined"));
    }
}


var visitor = {
    VariableDeclaration: {
        enter : splitVar
    },
    CallExpression : {
        enter : renameRequire
    },
    UnaryExpression : {
        enter : renameUnaryExpression
    }
};

var file = "./test/gulp-build.js";
//var file = "./test/test1.js";


var code = fs.readFileSync(file, "utf-8");


var result = babel.transform(code, {
    plugins: [
        { visitor }
    ]
});

console.log(result.code);
fs.writeFileSync("./test/result.js",result.code);
