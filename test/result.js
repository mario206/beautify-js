/// 1
var rename = 1;
var $_TES_b$ = 2;
var $_TES_c$ = 3; ///2

function test() {
  if (rename) {
    console.log("1");
    bar();
    return null;
  }
} ///3


var _TES_Lambda_ = function () {
  console.log("aaa");
};

_TES_Lambda_(rename, function () {
  console.log("bbb");

  var _TES_1_Lambda_ = function () {
    console.log("ccc");
  };

  _TES_1_Lambda_(rename);
});

function rename() {}

exports.rename = rename;