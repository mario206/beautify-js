var util = require('util');
var types = null;
module.exports = babel => {
    types = babel.types;
    return {
        visitor1 :{
            AssignmentExpression(path) {
                if(g_option.bRenameExport) {
                    renameExport(path);
                }
            }
        },
        visitor: {
            CallExpression(path) {
                if(g_option.bRenameRequire) {
                    renameRequire(path);
                }
                if(g_option.bRenameLambda) {
                    processLabmda(path);
                }
            },
            FunctionDeclaration(path) {
                if(g_option.bRenameFunctionName) {
                    renameFunctionName(path);
                }
                if(g_option.bRenameFunctionParam) {
                    renameFunctionParam(path);
                }
            },
            VariableDeclaration(path) {
                if(g_option.bRenameLocalVariable) {
                    renameLocalVariable(path);
                }
            },
            FunctionExpression(path) {
                if(g_option.bRenameFunctionParam) {
                    renameFunctionParam(path);
                }
            },
        },
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
        if(leftName && leftName.length >= 3 && !leftName.startsWith("$")) {
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
            if(raw_name.length >= 3) {
                return;
            }
            var funName = "";
            if(path.isFunctionExpression()) {
                //FunctionExpression id == null
                if(path.parentPath.isObjectProperty()) {
                    funName = path.parentPath.node.key.name;
                }
            } else {
                funName = path.node.id.name;
            }
            var finalName = __getRenameFunctionParam(path,funName,i);
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


function renameLocalVariable(path) {
    const { declarations, kind } = path.node
    if (path.parentPath.isForStatement()) {
        return
    }
    for(var i = 0;i < declarations.length;++i) {
        var declarator = declarations[i];
        var rawName = declarator.id.name;
        if(rawName && rawName.length <= 2) {
            var line = declarator.loc.end.line;
            var newName = __getRenameVariableName(path,rawName,line);
            path.scope.rename(rawName,newName);
        }
    }
}

function __getRenameVariableName(path,rawName,line) {
    var tryCnt = 0;
    var newName = "";
    do {
        var hex = Number(tryCnt).toString(16);
        var trySubFix = (tryCnt == 0 ? "" : ("_" + hex));
        newName = "$_" + g_option.nameHash + "_" + rawName + trySubFix + "$";
        tryCnt++;
    } while(path.scope.hasBinding(newName) || g_option.renameMap[newName]);
    g_option.renameMap[newName] = true;
    return newName;
}

function __getRenameFunctionParam(path,funName,index) {
    var finalName;
    var tryCnt = 0;
    var prefix = "";
    if(funName) {
        prefix = (funName.length > 4) ? funName.substr(0,4) : funName;
    }
    do {
        var hex = Number(tryCnt).toString(16);
        finalName = util.format('$_%s_%s_in%s%s$',g_option.nameHash,prefix,(tryCnt != 0 ? ("_" + hex + "_")  : ""),index + 1);
        tryCnt++;
    } while(path.scope.hasBinding(finalName) || g_option.renameMap[finalName]);

    g_option.renameMap[finalName] = true;
    return finalName;
}

function processLabmda(path) {
    var callee = path.get("callee");
    if(callee && callee.isFunctionExpression() && !callee.node.id) {
        var statement = path;
        while(!statement.isStatement()) {
            statement = statement.parentPath;
        }
        var finalName = __getLambdaFunName(path);
        var varName = types.identifier(finalName);
        var declaration = types.variableDeclaration("var", [types.variableDeclarator(varName,callee.node)]);

        statement.insertBefore(declaration);

        callee.replaceWith(varName);
        //path.node.callee = callexp;
    }
}

function __getLambdaFunName(path) {
    var finalName;
    var tryCnt = 0;
    do {
        var hex = Number(tryCnt).toString(16);
        finalName = "_" + g_option.nameHash.toLocaleUpperCase() + (tryCnt != 0 ? ("_" + hex) : "") + "_Lambda_";
        tryCnt++;
    } while(path.scope.hasBinding(finalName) || g_option.renameMap[finalName]);
    g_option.renameMap[finalName] = true;
    return finalName;
};