// input #1
foo(),bar(),baz();
//expect
foo();
bar();
baz();

//input #2
function test () {
    if(a) return console.log("1"),bar(),null;
}
//expect
//input #2
function test () {
    if(a) {
        console.log("1");
        bar();
        return null;
    }
}


// inout #3
function f() {
    return foo(), bar(), baz();
}
function g() {
    throw foo(), bar(), new Error();
}
// expect
function f() {
    foo();
    bar();
    return baz();
}
function g() {
    foo();
    bar();
    throw new Error();
}

//input #4
if (x = 5, y) z();
for (x = 5, i = 0; i < 5; i++) console.log(i);
for (x = 5; i < 5; i++) console.log(i);
switch (x = 5, y) {}
with (x = 5, obj);

//expect
x = 5;
if (y) z();

x = 5;
for (i = 0; i < 5; i++) console.log(i);

x = 5;
for (; i < 5; i++) console.log(i);

x = 5;
switch (y) {}

x = 5;
with (obj) {}
