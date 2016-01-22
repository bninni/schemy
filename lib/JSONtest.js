
Schemy=require('./index');
main={};

obj={ main : main };
main.obj = obj;

arr = [];
arr.push(main);
arr.push(obj);

main.arr = arr;
obj.arr = arr;

main.func = function( name ){ console.log('Hi ' + name + '!')};
main.func.arr = arr;
main.regex = /^(.*)$/i;
main.date = new Date()
main.error = new Error()
main.typeError = new TypeError('thats a type error')
main.type = String
main.null = null
main.undefined = undefined

encodedMain = Schemy.toJSON(main)
decodedMain = Schemy.fromJSON( encodedMain )


a = []
a[4] = 5

JSON.parse(JSON.stringify(a))
Schemy.fromJSON(Schemy.toJSON(a))