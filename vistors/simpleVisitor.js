var types = null;

module.exports = babel => {
    var t = types = babel.types;
    return {
        visitor: {
/*            Identifier: {
                enter(path, state) {
                    console.log("enter : " + (path));

                },
                exit(path, state) {
                    console.log("exit : " + (path));
                }
            },*/
            VariableDeclaration: {
                enter(path,state) {
                    const { declarations, kind } = path.node
                    if (path.parentPath.isForStatement()) {
                        return
                    }

                    const emptyDeclarator = []
                    const nonEmptyDeclarator = declarations.filter(dec => {
                        if (dec.init) {
                            return true
                        }
                        emptyDeclarator.push(dec)
                    })

                    if (nonEmptyDeclarator.length <= 1) {
                        return
                    }
                    if (emptyDeclarator.length) {
                        path.insertBefore(t.variableDeclaration(kind, emptyDeclarator))
                    }
                    path.insertBefore(nonEmptyDeclarator.map(dec => t.variableDeclaration(kind, [dec])));
                    //path.replaceWithMultiple(nonEmptyDeclarator.map(dec => t.variableDeclaration(kind, [dec])))
                },
            }
        }
    }
};