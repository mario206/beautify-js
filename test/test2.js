
/// 1
var a = 1,b = 2,c = 3;
///2
function test () {
    if(a) return console.log("1"),bar(),null;
}
///3
(function(){
    console.log("aaa");
})(a,function(){
    console.log("bbb");
    (function (){
        console.log("ccc");
    })(a);
});



function a() {}
exports.rename = a;