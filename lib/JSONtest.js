
Schemy=require('./index');
main={
	number : 1,
	message : "Howdy"
};

obj={main : main };

Object.defineProperty( main, 'obj', {value : obj });

arr = [];
arr.push(main);
arr.push(obj);

main.arr = arr;
obj.arr = arr;


main.regex = /^(.*)$/i;
main.date = new Date()
main.error = new Error()
main.typeError = new TypeError('thats a type error')
main.String = String
main.null = null
main.undefined = undefined
main.NaN = NaN
main.Infinity = Infinity

main.uInt8 = new Uint8Array( 4 )
main.uInt8[3] = 10

myClass = function( name ){ this.data = {name : name} };

main.class = myClass
main.instance = new myClass('Fred')

Object.defineProperty( main, 'data', {value : main.instance.data} );

encodedMain = Schemy.JSON.encode(main)
decodedMain = Schemy.JSON.decode( encodedMain )
