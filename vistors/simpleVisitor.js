var types = null;
module.exports = babel => {
    types = babel.types;
    return {
        visitor: {
            Identifier: {
                enter(path, state) {
                    console.log("enter : " + path);

                },
                exit(path, state) {
                    console.log("exit : " + path);
                }
            },
        }
    }
};