# schemy

A module to apply a schema to a value or automatically apply the schema to the arguments of a function

A `Schema` is defined as one of the following:
* `Type`
  * `Constructor` (`String`, `Object`, etc)
  * `null`
  * `undefined`
* **Schema Object Definition** [(see here for more details)](#schema_object_definition)
* Name of saved Schema
  * `String`
* An `Array` of any of the above
  * A given value can match any `Schema` in the array

## Install
```
npm install schemy
```
or
```
npm install -g schemy
```
  
## Examples

First, load the module
```javascript
var Schemy = require('schemy')
```

---

**exists( value )**

_To see if the given value exists (i.e. is not `null` or `undefined`)

  * `value` **(Any)** - The value to check the existance of
  
```javascript
Schemy.exists(0)         //true
Schemy.exists(false)     //true
Schemy.exists()          //false
Schemy.exists(null)      //false
Schemy.exists(undefined) //false
```

---

**type( value )**

_To get the type of the given value_

  * `value` **(Any)** - The value to get the type of

_A type is defined as a Constructor Function, null, or undefined_ 
  
```javascript
Schemy.type(0)         //Number
Schemy.type(false)     //Boolean
Schemy.type(null)      //null
Schemy.type(undefined) //undefined
```

---

**is( value, type )**

_To see if the given value is of the given type(s)_
  * `value` **(Any)** - The value to check the type of
  * `type` **(Type)** - The type to compare against
    * _An array of types will check if value matches any items in the array_
	* _A nested array will check if value does **_NOT_** match any items in that array_

_An empty array represents the full set of existing types_
	
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

**argNames( func )**

_To get the names of the arguments of the given function_
  
  * `func` **(Function)** - The function to extract names from
  
_Only works if the environment supports Function.prototype.toString()_

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

**argArray( args )**

_To convert arguments into an array_

  * `args` **(Arguments | Function)** - The data to convert into an Array
  
```javascript
function go(){
  var args = Schemy.argArray( arguments );
  return args;
}

go()      //[]
go(1,2,3) //[1,2,3]
```

Technically will work on any enumerable object that has a length attribute and attributes that are indices

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

If it is a `Function`, it will return a new function which automatically passes the arguments as an array into the given function

```javascript
function go( arr ){
  return arr;
}
go( 1, 2, 3 ) //1

newGo = Schemy.argArray(go)

newGo( 1, 2, 3 ) //[1,2,3]
```
---

**map( obj, func )**

__To map an object to the variables of the function__

  * `obj` **(Object)** - The object containing the keys/values to send to the given function
  * `func` **(Function)** - The function which will receive the values from the given object

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

**match( value, schema )**

_To check if the given value matches the given schema_

  * `value` **(Any)** - The value to compare the given schema against
  * `schema` **(Schema)** - The schema to compare the given value against

The relevant **Schema Object Definition** attributes are the following:
  * `type` **(Type)** _[required]_ - The type(s) to check the value of
  * `valid` **(Function)** - Function to determine if the given value is valid or not
  * `only` **(Array)** - Array of the values that are allowed
  * `not` **(Array)** - Array of the values that are **_NOT_** allowed
  
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

//Type array can also contain Schema Objects
Schemy.match(0,[
  {
    type : Number,
    valid : greaterThanZero
  },
  {
    type : [String,Boolean]
  }
])                              //false 
Schemy.match(false,[
  {
    type : Number,
    valid : greaterThanZero
  },
  {
    type : [String,Boolean]
  }
])                              //true
```

Using `only` or `not`:  
  
```javascript
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
```
  
The `valid` function will only be run if the value matches the given type(s)
  * Input argument is an Object with two properties:
    * `value` - The value the schema is checking against
	  * _This value **_CAN_** be manipulated_
    * `valid` - Whether or not the value should match the schema
	  * _Default:_ `true`
	  * _Settings this to `false` will cause the value to not match the schema_
	  
```javascript
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
```

---

**apply( value, schema )**

_To apply a schema to a value_

  * `value` **(Any)** - The value to compare the given schema against
  * `schema` **(Schema)** - The schema to compare the given value against

_If the value matches the schema, it will return the original value.  Otherwise it will return the replacement value_
  
The relevant **Schema Object Definition** attributes are the following:
  * `default` **(Any)** - The default replacement value
  * `generate` **(Function)** - Function to create the replacement value
    * The input argument is the given `value`
  * `new` **(Boolean)** - If the replacement value should be a new instance of the given type
    * _Default:_ `false`
    * If `type` is an array, creates a new instance of the first Constructor in the array  
  * `cast` **(Boolean)** - If the replacement value should be the given value cast as the given type
    * _Default:_ `true`
	* If `type` is an array, creates a new instance of the first Constructor in the array  
  * `required` **(Boolean)** - If the given value is required to match the given Schema 
    * _Default:_ `true`
	* It will not complete the function if there is no valid input
  * `priority` - The order to check `generate`, `new`, `cast`, or `default` when creating a replacement
    * _Default:_ ['generate','default','new','cast']
  
Using cast:  

```javascript
Schemy.apply(1,Number)            //1
Schemy.apply('',Number)           //0
Schemy.apply('1',Number)          //1
Schemy.apply('1',[Number,String]) //'1'
```

Using default:

```javascript
Schemy.apply(1,{
	type : Number,
	default : 10
})                                //1
Schemy.apply('1',{
	type : Number,
	default : 10
})                                //10
```

Using generate:

```javascript
Schemy.apply('1',{
	type : Object,
	generate : function( val ){
		return {
			prev : val
		}
	}
})                                //{ prev : '1' }
Schemy.apply({},{
	type : Object,
	generate : function( val ){
		return {
			prev : val
		}
	}
})                                //{}
```

Using new:

```javascript
Schemy.apply('120',{
	type : String,
	new : true
})                                //'120'
Schemy.apply(120,{
	type : String,
	new : true
})                                //''
```

---

## Templates

### Saving a Schema

**save( name, schema )**

_To save a schema to be used in any of the above functions_

  * `name` **(String)** - The name of the schema
  * `schema` **(Schema)** - The schema to associate with the given name

```javascript
//using a saved Schema
Schemy.save('>0',{
  type : Number,
  valid : greaterThanZero
})
Schemy.match(0,'>0')            //false
Schemy.match(10,'>0')           //true
```
---

**Saving a Validation Function**

**validation( type, name, func, setting )**

_To save a validation function to be used as a property in Schemas_

  * `type` **(Type)** - The type(s) that this validation function applies to
  * `name` **(String)** - The name of this validation function
  * `func` **(Function)** - The validation function itself
  * `setting` **(Any)** - The default setting value for this property
  
A saved `valid`ation function input argument has one additional property:
    * `setting` - The value that was associated with this property in the schema
  

```javascript
//using a saved 'validation' function
Schemy.validation(Number,'greaterThanZero',
	function( data ){
		if( !data.setting ) return true;
		data.valid = data.value > 0; 
	},
	false);
	
Schemy.match(0,{
	type : Number,
})                              //true

Schemy.match(0,{
	type : Number,
	greaterThanZero : true
})                              //false

Schemy.match(10,{
	type : Number,
	greaterThanZero : true
})                              //true
```


---------
  
A **Schema Object Definition** can have any of the following properties:
<a name='schema_object_definition'></a>
  * `type` **(Type)** _[required]_ - The type(s) to check the value of
  * `valid` **(Function)** - Function to determine if the given value is valid or not
  * `only` **(Array)** - Array of the values that are allowed
  * `not` **(Array)** - Array of the values that are **_NOT_** allowed
  * `default` **(Any)** - The default replacement value
  * `generate` **(Function)** - Function to create the replacement value
    * The input argument is the given `value`
  * `new` **(Boolean)** - If the replacement value should be a new instance of the given type
    * _Default:_ `false`
    * If `type` is an array, creates a new instance of the first Constructor in the array  
  * `cast` **(Boolean)** - If the replacement value should be the given value cast as the given type
    * _Default:_ `true`
	* If `type` is an array, creates a new instance of the first Constructor in the array  
  * `required` **(Boolean)** - If the given value is required to match the given Schema 
    * _Default:_ `true`
	* It will not complete the function if there is no valid input
  * `priority` - The order to check `generate`, `new`, `cast`, or `default` when creating a replacement
    * _Default:_ ['generate','default','new','cast']
  
The order of which `generate`, `new`, `cast`, or `default` is called depends on the `priority` array.
  