schemy

A `Schema` is defined as one of the following:
* `Type`
  * `Constructor` (`String`, `Object`, etc)
  * `null`
  * `undefined`
* `Schema` Object Definition (see below for details)
* Name of saved Schema
  * `String`
* An `Array` of any of the above
  * A given value can match any `Schema` in the array

  
`Schema` Object Definition:
  * `Type` (required)
  * `valid` - A custom function to determine if the given value should fail the schema or not
  * `only` - An array of the values that are allowed
  * `not` - An array of the values that are not allowed
  * `default` - The replacement value to apply if the given value fails the Schema
  * `new` - Whether the replacement value should be a new instance of the given type if the given value fails the Schema
    * If the `type` is an array, it will create a new instance of the first Constructor in the array  
  * `cast` - Whether the replacement value should be the given value cast as a new instance of the given type if the given value fails the Schema
    * If the `type` is an array, it will create a new instance of the first Constructor in the array  
  * `generate` - A function to create the replacement value  if the given value fails the Schema
    * The input is the given value
  * `required` - Whether or not the given value is required to match the given Schema
  * `error` - Whether or not to throw an error if the given value fails the Schema
  * `errorMessage` - The error message to throw if `required` fails
  
The order of which `generate`, `new`, `cast`, or `default` is called depends on the `priority` array.
  
Examples:

---

exists

To see if the given value exists
  * i.e. is not `null` or `undefined`
  
```javascript
Schemy.exists(0)         //true
Schemy.exists(false)     //true
Schemy.exists()          //false
Schemy.exists(null)      //false
Schemy.exists(undefined) //false
```

---

type

To get the type of the given value
  * If it exists, it will return the Constructor
  * otherwise, it will return the value (which will either be `null` or `undefined`)
  
```javascript
Schemy.type(0)         //Number
Schemy.type(false)     //Boolean
Schemy.type(null)      //null
Schemy.type(undefined) //undefined
```

---

is

To see if the given value is of the given type(s)

```javascript
Schemy.is(0,Number)          //true
Schemy.is(0,String)          //false
Schemy.is(0,[Number,String]) //true
Schemy.is(null,Object)       //false
Schemy.is(null,undefined)    //false
Schemy.is(null,null)         //true

//empty array is full set of existing objects
Schemy.is(0,[])     //true
Schemy.is('hi',[])  //true
Schemy.is(null,[])  //false

//nested array check if value is NOT of the given types
Schemy.is(0,[[String]])    //true (not a String)
Schemy.is('hi',[[String]]) //false (is a String)
Schemy.is(0,[[]])          //false (part of set of existing objects)
Schemy.is(null,[[]])       //true (not part of set of existing objects)

//will return false if less than two arguments
Schemy.is(0)         //false
Schemy.is()          //false
Schemy.is(undefined) //false

//will return false if the second argument is not a constructor (or null/undefined)
Schemy.is(0,0)       //false
Schemy.is('hi','hi') //false
```

---

argNames

To get the names of the arguments of the given function
  * Only works if the environment supports Function.toString()

```javascript
Schemy.argNames() //[]
Schemy.argNames(
  function(){}
)                 //[]
Schemy.argNames(
  function(a,b,c){}
)                 //['a','b','c']
```

---

argArray

To convert arguments into an array

```javascript
function go(){
  var args = Schemy.argArray( arguments );
  return args;
}

go()      //[]
go(1,2,3) //[1,2,3]
```

Only works on any enumerable object that has a length attribute and attributes that are indices
  * uses Array.prototype.slice.apply()
```javascript
Schemy.argArray()        //[]
Schemy.argArray(1234)    //[]
Schemy.argArray([1,2,3]) //[1,2,3]
Schemy.argArray('hi')    //['h','i']
Schemy.argArray({
  0 : 'zero',
  1 : 'one',
  length : 2
})                       //['zero','one']
```

If it is a function, it will return a new function where all arguments are convert into an array before hand
```javascript
function go( arr ){
  return arr;
}
go( 1, 2, 3 ) //1

go = Schemy.argArray(go)
go( 1, 2, 3 ) //[1,2,3]
```
---

map

Used to map an object to the variables of the function

```javascript
function divide(num,den){
  return num/den;
}
Schemy.map(
  {
    num : 4,
    den : 10
  },
  divide);
  
> 0.4
  
```

---

match

To see if the given value matches the given Schema

```javascript
Schemy.match(0,Number)          //true
Schemy.match(0,String)          //false
Schemy.match(0,[Number,String]) //true

//can use the Schema object
Schemy.match(0,{
  type : String
})                              //false
Schemy.match(0,{
  type : Number
})                              //true

//custom validation function
function greaterThanZero( data ){
  data.valid = data.value > 0;
}
Schemy.match('notANumber',{
  type : Number,
  valid : greaterThanZero
})                              //false
Schemy.match(0,{
  type : Number,
  valid : greaterThanZero
})                              //false
Schemy.match(10,{
  type : Number,
  valid : greaterThanZero
})                              //true

//using only and not
Schemy.match(0,{
  type : Number,
  only : [1,2,3]
})                              //false
Schemy.match(2,{
  type : Number,
  only : [1,2,3]
})                              //true
Schemy.match(0,{
  type : Number,
  not : [1,2,3]
})                              //true
Schemy.match(2,{
  type : Number,
  not : [1,2,3]
})                              //false

//using an array of schemas
Schemy.match(0,[
  {
    type : Number,
    valid : greaterThanZero
  },
  String
])                              //false 
Schemy.match('hi',[
  {
    type : Number,
    valid : greaterThanZero
  },
  {
    type : String
  }
])                              //true

//using a saved Schema
Schemy.save('>0',{
  type : Number,
  valid : greaterThanZero
})
Schemy.match(0,'>0')            //false
Schemy.match(10,'>0')           //true

//using a saved 'validation' function
Schemy.validation(Number,'greaterThanZero',
	function( data ){
		if( !data.setting ) return true;
		data.valid = data.value > 0; 
	},
	false);
	
Schemy.match(0,{
	type : Number,
	greaterThanZero : true
})                              //false
Schemy.match(10,{
	type : Number,
	greaterThanZero : true
})                              //true
```