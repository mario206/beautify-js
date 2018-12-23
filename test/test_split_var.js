// input #1
var a = 1,b = 2,c = 3;
// expect
var a = 1;
var b = 2;
var c = 3;



// input  #2
for(var i = 1,j = 2;i < 100;++i) {
}

// expect
var i = 1;
var j = 2;
for(;i < 100;++i) {

}


