var _LambdFun = function () {
  console.log("aaa");
};

_LambdFun();

var _LambdFun2 = function () {
  console.log("aaa");
};

_LambdFun2(a, function () {
  console.log("bbb");

  var _LambdFun3 = function () {
    console.log("ccc");
  };

  _LambdFun3(a);
});

var _LambdFun4 = function () {};

_LambdFun4(a, b, c);

a(function () {});