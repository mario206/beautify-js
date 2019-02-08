var types = null;
module.exports = babel => {
    types = babel.types;
    return {
        visitor: {
            CallExpression(path) {
                renameRequire(path);
            },
            AssignmentExpression(path) {
                renameExport(path);
            },
            FunctionDeclaration(path) {
                renameFunctionParam(path);
                renameFunctionName(path);
            }
        }
    }
};

const isVarName = require('is-valid-var-name');

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

function renameRequire(path) {
    if(path.node.callee.name == "require" && path.node.arguments.length == 1 && types.isStringLiteral(path.node.arguments[0])) {
        var leftName;
        var nameSubfix = "";
        var srcName = path.node.arguments[0].value;
        if(types.isVariableDeclarator(path.parent)) {
            leftName = path.parent.id.name;
            /// var s = require("xx")
        } else if (types.isAssignmentExpression(path.parent)) {    /// s = require("xxx")
            //leftName = path.parent.left.name;
            return; // 考虑到作用于问题，这个先不处理
        } else if(types.isMemberExpression(path.parent)) {
            var curr = path.parentPath;
            while(curr && types.isMemberExpression(curr)) {    // s = require("xxx").xxx.xxx
                var tname = "";
                if(types.isStringLiteral(curr.node.property)) {
                    tname = curr.node.property.value;
                } else if(types.isIdentifier(curr.node.property)) {
                    tname = curr.node.property.name;
                } else {
                    console.error("unknown curr.node.property.type = " + curr.node.property.type);
                }
                nameSubfix += "_" + tname;
                curr = curr.parentPath;
            }
            if(!types.isVariableDeclarator(curr)) {
                return;
            }
            leftName = curr.node.id.name;
        } else {
            return;
        }
        var tryCnt = 0;
        var newName;
        while(true) {
            newName = "mod_" + srcName + nameSubfix + (tryCnt == 0 ? "" : tryCnt);
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
        /* 接下来还可以对引用了module的s做重命名
            var mod_util = require("util");
            var s = mod_util.format;
         */
        var bindings = path.parentPath.scope.getBinding(newName);
        if(bindings) {
            for(var key in bindings.referencePaths) {
                var ref = bindings.referencePaths[key];
                if(ref.isIdentifier() && ref.parentPath.isMemberExpression() && ref.parentPath.parentPath.isVariableDeclarator()) {
                    var leftName = ref.parentPath.parentPath.node.id.name;
                    var memberName = ref.parentPath.node.property.name;
                    var tryCnt = 0;
                    var finalName;
                    do {
                        finalName = newName + "_" + memberName + (tryCnt == 0 ? "" : tryCnt);
                        tryCnt++;
                    } while(ref.parentPath.parentPath.scope.hasBinding(finalName));
                    ref.parentPath.parentPath.scope.rename(leftName,finalName);
                }
            }
        }

    }
}
function renameExport(path) {
    if(path.parentPath.isStatement()) {
        var left = path.get("left");
        var right= path.get("right");
        if(left.isMemberExpression() && right.isIdentifier()) {
            if(left.node.object.name == "exports") {
                var funName = left.node.property.name;
                var rightName = right.node.name;
                while(path.scope.getBinding(funName)) {
                    funName = "_" + funName;
                }
                path.scope.rename(rightName,funName);
            }
        }
    }
}


function renameFunctionParam(path) {
    var params = path.get("params");

    for(var i = 0;i < params.length;++i) {
        var param = params[i];
        if(param.isIdentifier()) {
            var raw_name = param.node.name;
            var funName = path.node.id.name;
            var prefix = "";
            if(funName.length > 0) {
                prefix = funName[0];
            }
            var finalName;
            var tryCnt = 0;
            do {
                finalName = "$" + prefix + "_" + "IN_" + (i + 1) + (tryCnt != 0 ? "_" : "") + "$";
                finalName = finalName.toLocaleUpperCase();
                tryCnt++;
            } while(path.scope.hasBinding(finalName));
            path.scope.rename(raw_name,finalName);
        } else {
            console.error("not identifier");
        }
    }
}

function renameFunctionName(path) {
    var funName = path.node.id.name;
    var newName;
    if(funName.length > 0 && funName.length < 3) {
        newName = "_" + funName + "_Fun_";
        if(!path.scope.hasBinding(newName)) {
            path.scope.rename(funName,newName);
        } else {
            console.error("has binding funname " + newName);
        }
    }
};


