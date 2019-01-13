var types = null;
module.exports = babel => {
    types = babel.types;
    return {
        visitor: {
            CallExpression(path) {
                renameRequire(path);
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


