(function(){
  console.log("aaa");
})();

(function(){
  console.log("aaa");
})(a,function(){
  console.log("bbb");
  (function (){
    console.log("ccc");
  })(a);
});

(function (){})(a,b,c)
a(function(){});