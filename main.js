var beautifyJs = require("./beautifyJS");
var glob = require("glob");



function myTransformApp(root) {
    var files = glob.sync(root, {});
    files = files.filter(function (file) {
        return (file.includes("editor/") || file.includes("editor-framework/") || file.includes("dashboard/")) && !file.includes("node_modules");
    });
    console.log(files);
    for(var i = 0;i < files.length;++i) {
        try {
            beautifyJs.transformWithFile(files[i],true);
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
        beautifyJs.transformWithFile("./test/test2.js",false);
    }
}

runCode(true);


/*transformCode("/Applications/CocosCreator2.09.app/Contents/Resources/app/editor/core/gulp-build.js",true);
transformCode("/Applications/CocosCreator2.05.app/Contents/Resources/app/editor/core/gulp-build.js",true);


transformCode("/Applications/CocosCreator2.05.app/Contents/Resources/app/editor/page/build/texture-packer/packing/maxrects.js",true);
transformCode("/Applications/CocosCreator2.09.app/Contents/Resources/app/editor/page/build/texture-packer/packing/maxrects.js",true);*/


