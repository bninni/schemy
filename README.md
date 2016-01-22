# schemy

A module to compare a value to a type or schema.

It can get the type of a value, apply a schema to a value or automatically apply a schema to all arguments of a function.

---
<a name='top'></a>
## Contents

  1. [Installation](#Installation)
  2. [Definitions](#Definitions)
  3. [The Basics](#Basics)
    * [exists](#exists) - To see if the given value exists (i.e. is not `null` or `undefined`)
    * [type](#type) - To get the _type_ of the given value
    * [is](#is) - To see if the given value is one of the given _types_
  4. [Using a _Schema_](#Using_a_Schema)
    * [match](#match) - To check if the given value matches the given _schema_
    * [apply](#apply) - To apply a _schema_ to a value
  5. [Type Specific Properties](#Type_Specific_Properties)
    * [Object](#Object_Properties)
    * [Array](#Array_Properties)
  6. [Function Helpers](#Function_Helpers)
    * [argNames](#argNames) - To get the names of the arguments of the given function
    * [argArray](#argArray) - To get Arguments as an array
    * [class](#class) - To always create a new instance of the given function
    * [map](#map) - To map the given object or array to the given function arguments
  7. [Applying to Function Arguments](#Function_Arguments)
  8. [Templates](#Templates)
    * [Saving a Schema](#Saving_a_Schema)
    * [Saving a Validation Function](#Saving_a_Validation_Function)
  9. [Settings](#Settings)
  10. [Reference](#Reference)
    * [Schema](#Schema)
    * [Object](#Object)
  11. [License](#License)

<a name='Installation'></a>
## Installation
```
npm install schemy
```
or
```
npm install -g schemy
```

To load the module

```javascript
var Schemy = require('schemy')
```
<a name='Definitions'></a>
## Definitions

Some quick definitions before you read further:

  * **Type** - The _Type_ of a value is it's `Class` (technically, a `Function`)
    * If the value is `null` or `undefined`, then the _type_ will be `null` or `undefined`, respectively

  * **Schema** - A _Schema_ is a model to define the _type_ and other attributes a value should have
    * A _Schema_ can be represented as _Type_ or as an `Object` with certain attributes
    * [See here for all attributes a _Schema Object_ can have](#Schema)

<a name='Basics'></a>
## Basics

Get introduced to the core functionality of Schemy

---
<a name='exists'></a>
**exists( value )**

_To see if the given value exists (i.e. is not `null` or `undefined`)_

  * `value` - **(Any)** - The value to check the existance of
  
```javascript
Schemy.exists(0)         //true
Schemy.exists(false)     //true
Schemy.exists()          //false
Schemy.exists(null)      //false
Schemy.exists(undefined) //false
```

---
<a name='type'></a>
**type( value )**

_To get the type of the given value_

  * `value` - **(Any)** - The value to get the _type_ of
  
```javascript
Schemy.type(0)         //Number
Schemy.type(false)     //Boolean
Schemy.type(null)      //null
Schemy.type(undefined) //undefined
```

---
<a name='is'></a>
**is( value, type )**

_To see if the given value is one of the given types_

  * `value` - **(Any)**  - The value to check the _type_ of
  * `type`  - **(Type)** - The _type_ to compare against
    * Use an array to test if value is one of multiple _types_
    * Use a nested array to test if value is **NOT** one of multiple _types_

**Note:** An empty array represents the full set of existing _types_
  * i.e. All possible _types_ except `null` or `undefined`

```javascript
Schemy.is(0,Number)             //true
Schemy.is(0,String)             //false

Schemy.is(0,[Number,String])    //true
Schemy.is('hi',[Number,String]) //true
Schemy.is(0,[])                 //true

Schemy.is(null,null)            //true
Schemy.is(null,Object)          //false
Schemy.is(null,undefined)       //false
Schemy.is(null,[])              //false

//nested array checks if value is NOT one of the given types
Schemy.is(0,[[String]])         //true
Schemy.is('hi',[[String]])      //false

Schemy.is('hi',[[]])            //false
Schemy.is(null,[[]])            //true
```

<a name='Using_a_Schema'></a>
## Using a _Schema_

Learn different _Schema_ attributes and the purpose of each

---
<a name='match'></a>
**match( value, schema )**

_To check if the given value matches the given schema_

  * `value`  - **(Any)**    - The value to check
  * `schema` - **(Schema)** - The _schema_ to check against

The relevant _Schema Object_ properties are the following:
  * `type`   - **(Type)** _required_ - The _type(s)_ to check the value of
  
  * `only`   - **(Array)**         - Array of the values that are allowed
  
  * `not`    - **(Array)**         - Array of the values that are **NOT** allowed
  
  * `before` - **(Function)**      - Function to check validity of value **before** the built in checks
  
  * `after`  - **(Function)**      - Function to check validity of value **after** the built in checks

  
**Note:** A value will not be passed to `before` or `after` if it is an invalid _type_
  
First, simple examples using only a _type_ as the _Schema_
  
```javascript
Schemy.match(0,Number)          //true
Schemy.match(0,String)          //false
Schemy.match(0,[Number,String]) //true
```

Now let's introduce the _Schema Object_ and the _`type`_ property

```javascript
Schemy.match(0,{ type : Number })          //true
Schemy.match(0,{ type : String })          //false
Schemy.match(0,{ type : [Number,String] }) //false
```

You can also use arrays of _Schemas_

```javascript
numberSchema = { type : Number }
stringSchema = { type : String }

Schemy.match(0, [numberSchema,stringSchema])    //true
Schemy.match(true, [numberSchema,stringSchema]) //false

obj = {
  type : [numberSchema,stringSchema]
}

Schemy.match(0, obj)                            //true
Schemy.match(true, obj)                         //false
```

You can use `only` to create a list of possible matches
  
```javascript
mySchema = {
  type : Number,
  only : [1,2,3]
}

Schemy.match(true,mySchema) //false
Schemy.match(0,mySchema)    //false
Schemy.match(2,mySchema)    //true
```

Or you can use `not` to create a list of failing matches
  
```javascript
mySchema = {
  type : Number,
  not : [1,2,3]
}

Schemy.match(true,mySchema) //false
Schemy.match(0,mySchema)    //true
Schemy.match(2,mySchema)    //false
```

The `before` function will take the value and parse it before any other validation checks.

The input argument is a `Object` with two properties::
  * `value` - The value the _schema_ is checking against
  * `reject( msg )` - The function to run to reject the value
    * `msg` - **(String)** _optional_ - The error message

**Notes:**
  * You can modify the `value` by redefining the `value` property
  * `before` will not be called if the `value` is an invalid _type_

```javascript
function greaterThanZero( data ){
  if( data.value <= 0 ){
    data.reject('Number must exceed zero');
  }
}

mySchema = {
  type : Number,
  before : greaterThanZero
}

Schemy.match('hi',mySchema) //false
Schemy.match(-5,mySchema)   //false
Schemy.match(0,mySchema)    //false
Schemy.match(5,mySchema)    //true
```

The `after` function has the same functionality as the `before` function, it is simply run after all other validations.

**Note:** `after` will not be called if another validation function rejects the value

```javascript
function increment( data ){
  data.value++;
}

mySchema = {
  type : Number,
  before : increment,
  after : greaterThanZero,
}

Schemy.match('hi',mySchema) //false
Schemy.match(-5,mySchema)   //false
Schemy.match(0,mySchema)    //true
Schemy.match(5,mySchema)    //true
```

Here's a demonstration the order of validation:

`before` -> `only` -> `after`

```javascript
mySchema = {
  type : Number,
  before : increment,
  only : [1,2,3]
}

Schemy.match(0,mySchema)    //true
Schemy.match(3,mySchema)    //false

mySchema = {
  type : Number,
  only : [1,2,3],
  after : increment
}

Schemy.match(0,mySchema)    //false
Schemy.match(3,mySchema)    //true
```

---
<a name='apply'></a>
**apply( value, schema )**

_To apply a schema to a value_

  * `value`  - **(Any)**    - The value to check
  * `schema` - **(Schema)** - The _schema_ to check against

If the value matches the _schema_, it will return the original value.
If the value is rejected, it will return the replacement value.

The replacement value is determined by additional _Schema Object_ properties:
  * `default`  - **(Any)**      - The default replacement value
  
  * `generate` - **(Function)** - Function to create the replacement value
    * The input argument is the `value`

  * `new`      - **(Boolean)**  - If the replacement value should be a new instance of the `type`
    * _Default:_ `false`
    * If `type` is an array, creates a new instance of the first `Class` it finds 

  * `cast`     - **(Boolean)**  - If the replacement value should be the value cast as the `type`
    * _Default:_ `true`
    * If `type` is an array, creates a new instance of the first `Class` it finds 

  * `required` **(Boolean)** - If the value is required to match the _schema_
    * _Default:_ `true`
    * It will not complete the function if there is no valid input

  * `error` **(Boolean)** - If an error should be thrown when a value fails to match a `required` _schema_
    * _Default:_ `true`

  * `priority` **(Array)** - The order to check/use `default`, `generate`, `new`, or `cast`
    * _Default:_ `['generate','default','new','cast']`

**Note:** All _default_ values can be changed by [Modifying the Settings](#settings)


Here is an example using the default settings
  *  This uses `cast` to create the replacement value

```javascript
Schemy.apply(1,Number)            //1

//If a value is not a Number, it will create one via:
//new Number( value )

Schemy.apply('',Number)           //0
Schemy.apply('1',Number)          //1

//Remember, there is no replacing when a type is matched
Schemy.apply('1',[Number,String]) //'1'
```

A `default` value can be used instead

Since `default` has a higher `priority` than `cast` (by _default_), the `default` value will be used instead of `cast`ing.

```javascript
mySchema = {
  type : Number,
  default : 10
}

Schemy.apply(1,mySchema)   //1
Schemy.apply('1',mySchema) //10
```

If you were to change the `priority`, then it will use whichever appears first in the list:

```javascript
mySchema = {
  type : Number,
  default : 10,
  priority : ['cast','generate','default','new']
}

//cast appears before default, so it will cast
Schemy.apply(1,mySchema)   //1
Schemy.apply('1',mySchema) //1
```

You can also set `cast` to `false` to ignore it when checking `priority`

```javascript
mySchema = {
  type : Number,
  default : 10,
  cast : false,
  priority : ['cast','generate','default','new']
}

Schemy.apply(1,mySchema)   //1
Schemy.apply('1',mySchema) //10
```

You can also `generate` the replacement value.

The input argument is the value that is being checked

**Note:** The input argument might be different from the original value if it was modified in a validation function (like `before` or `after`)

```javascript
mySchema = {
  type : Number,
  generate : function( val ){
    if( Schemy.is( val, String ) ) return 1;
    else return 0;
  }
}

Schemy.apply(5,mySchema )   //5
Schemy.apply('5',mySchema ) //1
Schemy.apply([],mySchema )  //0
```

Instead of `cast`ing, you can decide to create a `new` instance instead

```javascript
//using cast:
mySchema = {
  type : Array,
  cast : true
}

Schemy.apply(5,mySchema) //[5]

//using new
mySchema = {
  type : Array,
  new : true
}
Schemy.apply(5,mySchema) //[]
```

Using `strict` will skip the finding of a replacement value.

It will return `undefined` if there is no replacement value.

```javascript
mySchema = {
  type : Array,
  strict : true
}

Schemy.apply([],mySchema) //[]
Schemy.apply(5,mySchema)  //undefined
```

If not replacement is found **and** `required` is `true`, it will throw an error

**Note:** If `error` is set to false, it will simply log the `error` to the `debug` function and still return `undefined`
  * The `debug` function can be set by [Modifying the Settings](#settings)

```javascript
mySchema = {
  type : Array,
  strict : true,
  required : true
}

Schemy.apply([],mySchema) //[]
Schemy.apply(5,mySchema)  //Throws a TypeError

mySchema.error = false

Schemy.apply(5,mySchema)  //undefined
```

Here is a more complex example

```javascript
function abs( data ){
  data.value = Math.abs(data.value);
}

function double( data ){
  data.value *= 2;
}

mySchema = {
  type : Number,
  before : abs,
  after : double,
  default : 50
}

Schemy.apply(0,mySchema)     //0
Schemy.apply(5,mySchema)     //10
Schemy.apply(-10,mySchema)   //20
Schemy.apply(null,mySchema)  //50
```

<a name='Type_Specific_Properties'></a>
## Type Specific Properties

Some _types_ come with additional properties to help you further narrow down your valid inputs

---
<a name='Object_Properties'></a>
**Object Properties**

An `Object` _Schema_ has five additional properties to provide further validation
  * `specific`        - **({Schema})**  - An object with _schemas_ mapped to each specific key
  * `every`           - **(Schema)**    - A _schema_ to be applied to every key
  * `settings`        - **(Object)**    - _Schema_ settings to apply to the `every` _schema_ or every _schema_ in `specific`
  * `removeUndefined` - **(Boolean)**   - If it should remove undefined properties
    * _Default:_ `false`
  * `removeExtra`     - **(Boolean)**   - If it should remove properties not defined in the `specific` object
    * _Default:_ `false`
  * `addMissing`      - **(Boolean)**   - If it should add properties that are defined in the `specific` object but not in the given Object
    * _Default:_ `true`

Here is a basic example using `every`

```javascript
mySchema = {
  type : Object,
  every : String,
  new : true
}

Schemy.apply(null, mySchema)        //{}
Schemy.apply({}, mySchema)          //{}
Schemy.apply({ a : 'hi'}, mySchema) //{ a : 'hi' }

//remember, 'cast' is set to 'true' by default
Schemy.apply({ a : 12 }, mySchema)  //{ a : '12' }

mySchema.every = {
  type : String
  new : true
}
Schemy.apply({ a : 12 }, mySchema)  //{ a : '' }
```

Now lets look at `specific`

```javascript
numSchema = {
  type : Number,
  default : 25
}

strSchema = {
  type : String,
  default : 'Fred'
}

objSchema = {
  type : Object,
  new : true,
  specific : {
    name : strSchema,
    age : numSchema
  }
}

Schemy.apply(null, objSchema) //{ name : 'Fred', age : 25 }
Schemy.apply({}, objSchema) //{ name : 'Fred', age : 25 }

obj = {}

obj.name = 'George'
Schemy.apply(obj, objSchema) //{ name : 'George', age : 25 }

obj.age = 50
Schemy.apply(obj, objSchema) //{ name : 'George', age : 50 }

obj.age = '50'
Schemy.apply(obj, objSchema) //{ name : 'George', age : 25 }
```

Now lets look at `removeExtra` and its purpose, continuing the above example

**Note:** Any extra properties that don't have a `specific` _schema_ are still subject to the `every` _schema_ if it exists

```javascript
obj = {
  age : 50,
  name : 'George',
  sex : 'M'
}
Schemy.apply(obj, objSchema) //{ name : 'George', age : 25, sex : 'M' }

//to make sure extra keys are removed when applying the schema:
objSchema.removeExtra = true;
Schemy.apply(obj, objSchema) //{ name : 'George', age : 25 }
```

Finally let's cover `removeUndefined` and `addMissing`

```javascript
//setting strSchema strict to true will cause it to ignore the default
strSchema.strict = true
Schemy.apply({}, objSchema) //{ name : undefined, age : 25 }

//to remove any key with undefined values from the object:
objSchema.removeUndefined = true
Schemy.apply({}, objSchema) //{ age : 25 }

//to prevent adding keys that don't exist in the input object
objSchema.addMissing = false
Schemy.apply({},objSchema) //{}
Schemy.apply({ age : 10 }, objSchema)   //{ age : 10 }

//if the key is invalid, it be corrected
Schemy.apply({ age : '12' }, objSchema) //{ age : 25 }

//but 'name' will still not be added because it is strict,
//so an invalid entry is replaced with undefined
//and removeUndefined is still true
Schemy.apply({ name : 12 }, objSchema)  //{}

//a missing key can still be added if it is required
numSchema.required = true
Schemy.apply({}, objSchema)  //{ age : 25 }
```


---
<a name='Array_Properties'></a>
**Array Properties**

<a name='Function_Helpers'></a>
## Function Helpers

Schemy includes function to assist with how you interact with Functions

All function helpers that return a new function will still work when calling with the `new` operator or when applying to a `prototype` function.

---
<a name='argNames'></a>
**argNames( func )**

_To get the names of the arguments of the given function_
  
  * `func` - **(Function)** - The function to extract names from
  
**Note:** Only works if the environment supports Function.toString()

```javascript
Schemy.argNames()  //[]

function f(){}

Schemy.argNames(f) //[]

function f( str, num ){}

Schemy.argNames(f) //['str','num']
```

---
<a name='argArray'></a>
**argArray( args )**

_To convert arguments into an array_

  * `args` - **(Arguments | Function)** - The data to convert into an array
  
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

obj = {
  0 : 'zero',
  1 : 'one',
  length : 2
}

Schemy.argArray(obj)     //['zero','one']
```

If input is a Function, it will return a new function which automatically passes the arguments as an array into the given function

```javascript
function go( val ){
  return val;
}

go( 1, 2, 3 ) //1

go = Schemy.argArray(go)

go( 1, 2, 3 ) //[1,2,3]
```
---
<a name='class'></a>
**class( func )**

_To always return a new instance of the function even if `new` isn't called_

  * `func` - **(Function)** - The function to always create a new instance of

```javascript
function myClass(name,age){
  this.name = name;
  this.age = age;
}

new myClass('joe',25) //{ name : 'joe', age : 25 }
myClass('joe',25)     //undefined

myClass = Schemy.class(myClass);

new myClass('joe',25) //{ name : 'joe', age : 25 }
myClass('joe',25)     //{ name : 'joe', age : 25 }
```
---
<a name='map'></a>
**map( data, func[, args ] )**

_To map an object to the variables of the function_

  * `data` - **(Object | Array)** - The object or array containing the values to send to the given function
  * `func` - **(Function)**       - The function which will receive the values from the given object
  * `args` - **(Array)** _optional_ - The order in which the variables should be passed to the function by name

**Note:** `args` is only necessary if the `data` is an object and `Function.toString()` is not supported

```javascript
function divide(num,den){
  return num/den;
}

obj = {
  num : 4,
  den : 10
};

Schemy.map(obj, divide);                   //0.4

Schemy.map([4,10],divide);                 //0.4

//how the 'args' should look, if used;
Schemy.map(obj, divide, ['num','den']);    //0.4

//what happens if the order is wrong:
Schemy.map(obj, divide, ['den','num']);    //2.5
```

<a name='Function_Arguments'></a>
## Applying to Function Arguments

Perhaps the most useful feature of Schemy is its ability to automatically apply a _schema_ to arguments before passing them to a function.

This eliminates the need for you to waste your time type checking, casting, and assigning default values and lets you focus on the code itself

As with the previous function helpers, a `wrap`ped function will still work when calling with the `new` operator or when applying to a `prototype` function.

---

**wrap( args, func[, props] )**

_To automatically apply a schema to the arguments before passing them to the given function_

  * `args`  - **(Schema(s))**       - The _schemas_ (mapped to each argument)
  * `func`  - **(Function)**        - The function to pass the arguments to after the _schema_ gets applied
  * `props` - **(Object)** _optional_ - Additional settings

The `props` object can contain any [_Schema_ Object](#Schema) properties
  * These properties will be automatically applied to each _schema_ in the `args`
  * These can still be overridden by each individual _schema_

The `props` object can also contain additional properties to define how the `func` is wrapped:
  * `ordered` - **(Boolean)** - If the arguments need to be given in the correct order
      * _Default:_ `true`
      * If false, it will automatically determine the order based on the _type_
  * `class` - **(Boolean)** - If `func` is a class or not
      * _Default:_ `false`
      * If true, it will always return a new `func`, regardless of if `new` is used or not
  * `array` - **(Boolean)** - If the arguments should be combined into an array before applying a _schema_ and passing to `func`
      * _Default:_ `false`
  * `object` - **(Boolean)** - If the arguments get sent to `func`
      * _Default:_ `false`


A _Schema_ defined in the `args` can contain one additional property that isn't used elsewhere:
  * `names` **([Strings])** - Array of String, Alternative names for the variable
    * Only used when `object` is `true`


But before we dig into these properties, look start with simple examples using the default settings:

**Note:** Remember, this will be using `cast` to replace invalid values

```javascript
function f( val ){
  return val;
}

f('2')   //'2'

//using an array
myFunc = Schemy.wrap([Number], f);

myFunc('2') //2

//using an object
myFunc = Schemy.wrap({ val : Number }, f);

myFunc('2') //2
```

Of course, you use any other replacement methods:

Here is how `default` works:
```javascript

mySchema = {
  type : Number,
  default : 0
}

myFunc = Schemy.wrap([mySchema], f);

myFunc(2)   //2
myFunc()    //0
myFunc('2') //0
```

Any properties defined in the `props` object will be applied to the _schemas_

```javascript
myFunc = Schemy.wrap([String], f, { new : true });

myFunc('hi') //'hi'
myFunc()     //''
myFunc(10)   //''

```

Individual _schemas_ can still override properties defined in the `props` object

```javascript
function f( a, b ){
  return a + b;
}

//this will use 'cast' instead of 'new'
mySchema = {
  type : Number,
  new : false
}

//each element in the array directly maps to each argument in the function
myFunc = Schemy.wrap([mySchema,Number], f, { new : true });

//note, new Number() produces 0

myFunc(2,2)     //4
myFunc('2',2)   //4
myFunc('2','2') //2
myFunc(2)       //2
```

The `props` object has 4 additional settings which affect how the function is treated

An `ordered` function has each input argument directly mapped to the function, as shown above

When `ordered = false`, the inputs arguments can be in any order

For each argument in the given `func`, it will use the first input argument that matches the corresponding _schema_

```javascript
function f( num, arr ){
  arr.push(num)
  return arr;
}

myFunc = Schemy.wrap([Number,Array], f, { ordered : false });

myFunc(1,[]) //[1]
myFunc([],1) //[1]

//it ignores any arguments that don't match any schemas
myFunc('hi',1,[]) //[1]

//only the first match is accepted
myFunc(1,2,[]) //[1]
myFunc(2,1,[]) //[2]

//it still works with arguments of the same type
function f( num_a, num_b, arr ){
  arr.push(num_a)
  arr.push(num_b)
  return arr;
}

myFunc(1,2,[])      //[1,2]
myFunc(1,[],'hi',2) //[1,2]
myFunc(2,1,[])      //[2,1]
```

Take a look a more intricate example:

```javascript
function f(neg,pos){
  return [neg,pos];
}

posSchema = {
  type : Number,
  before : function( data ){
    if( data.value <= 0 ) data.reject()
  }
  default : 1
}

negSchema = {
  type : Number,
  before : function( data ){
    if( data.value >= 0 ) data.reject()
  }
  default : -1
}

myFunc = Schemy.wrap([posSchema, negSchema], f, { ordered : false });

myFunc()        //[-1,  1 ]
myFunc(10)      //[-1,  10]
myFunc(-10)     //[-10, 1 ]
myFunc(-10,-10) //[-10, 1 ]
myFunc(10,-10)  //[-10, 10]
myFunc(-10,10)  //[-10, 10]

```

Setting `object : true` can be used to automatically map an object to the function

**Note:** You can use the `names` property in a _schema_ to provide alternative names from the object to pull the value from

```javascript
function f( str, num ){
  return [str, num]
}

myFunc = Schemy.wrap([String,Number], f, { object : true });

obj = {
  str : 'hi',
  num : 10
}

myFunc(obj) //['hi',10]

//Using more complex schemas:
strSchema = {
  type : String,
  names : ['string'],
  default : 'hi'
}

numSchema = {
  type : Number,
  names : ['number'],
  default : 10
}

myFunc = Schemy.wrap([strSchema,numSchema], f, { object : true });

myFunc()              //['hi',  10 ]
myFunc({str : 'bye'}) //['bye', 10 ]
myFunc({num : 'bye'}) //['hi',  10 ]
myFunc({num : 100})   //['hi',  100]
myFunc({str : 100})   //['hi',  10 ]

obj = {
  str : 'bye',
  num : 100
}

myFunc(obj)            //['bye',100]

//using the alternative names
obj = {
  string : 'bye',
  number : 100
}

myFunc(obj)            //['bye',100]

//using the wrong names
obj = {
  strr : 'bye',
  numm : 100
}

myFunc(obj)            //['hi',  10 ]
```

Setting `array : true` will convert all arguments into an array before applying the _schema_

**Note:** It will only work if the _schema_ mapped to the first argument is for an array _type_.

```javascript
function f( arr ){
  return arr;
}

myFunc = Schemy.wrap([Array],f,{array:true})

myFunc(1,2,3) //[1,2,3]
```

---
<a name='Templates'></a>
## Templates

Templates can be used to save references by name so they can be easily used again

---
<a name='Saving_a_Schema'></a>
### Saving a Schema

**save( name, schema )**

_To save a schema to be used in any of the above functions_

  * `name`   - **(String)** - The name of the _schema_
  * `schema` - **(Schema)** - The _schema_ to save

```javascript
Schemy.save('>0',{
  type : Number,
  valid : greaterThanZero
})
Schemy.match(0,'>0')            //false
Schemy.match(10,'>0')           //true
```
---
<a name='Saving_a_Validation_Function'></a>
**Saving a Validation Function**

**validation( type, name, func, schema )**

_To save a validation function to be used as a property in Schemas_

  * `type` **(Type)** - The _type(s)_ that this validation function applies to
  * `name` **(String)** - The name of this validation function
  * `func` **(Function)** - The validation function itself
  * `schema` **(Schema)** - The _schema_ to apply to the value of this setting
  
A saved validation function input argument has one additional property:
  * `setting` - The value that was associated with this property in the _schema_
  

```javascript

function f( data ){
  if( data.setting && data.value <= 0 ) data.reject('The value "' + data.value + '" is not greater than zero'); 
}

mySchema = {
  type : Boolean,
  default : false,
  strict : true
}

Schemy.validation(Number,'greaterThanZero', f, mySchema);

newSchema = {
  type : Number
}

Schemy.match(0,newSchema)  //true
Schemy.match(5,newSchema)  //true

newSchema.greaterThanZero = true;

Schemy.match(0,newSchema)  //false
Schemy.match(5,newSchema)  //true
```

<a name='Settings'></a>
## Settings

There are a number of default settings that are used when creating a _schema_.

These can be modified at will.

---

**settings( obj )**

_To update the settings_

  * `obj` - **(Object)** - The object containing the key/value pairs to update

**settings.get()**

_To get a copy of the current settings_

These are the default settings:

**Settings that Apply to a Schema :**

  * `new` - **(Boolean)** - If the replacement value should be a new instance of the _type_
    * _Default:_ `false`
    * If `type` is an array, creates a new instance of the first Constructor in the array  

  * `cast` - **(Boolean)** - If the replacement value should be the given value cast as the _type_
    * _Default:_ `true`
    * If `type` is an array, creates a new instance of the first Constructor in the array  

  * `strict` - **(Boolean)** - To ignore values of `generate`, `new`, cast`, and `default` 
    * _Default:_ `false`
    * If there is no match it will either throw an error (if `required`) or set as `undefined`

  * `required` - **(Boolean)** - If the given value is required to match the given _schema_
    * _Default:_ `true`
    * It will not complete the function if there is no valid input

  * `error` - **(Boolean)** - If an error should be thrown when a `required` value has not valid input
    * _Default:_ `true`
    * If false, it will simply not run the function
  
  * `priority` - **(Array)** - The order to check `generate`, `new`, `cast`, or `default` when creating a replacement
    * _Default:_ `['generate','default','new','cast']`
  

**Settings that Apply to a Wrapped Function :**

  * `ordered` - **(Boolean)** - If the arguments need to be given in the correct order
      * _Default:_ `true`
      * If false, it will automatically determine the order based on the _type_
  * `class` - **(Boolean)** - If `func` is a class or not
      * _Default:_ `false`
      * If true, it will always return a new `func`, regardless of if `new` is used or not
  * `array` - **(Boolean)** - If the arguments should be combined into an array before applying a _schema_ and passing to `func`
      * _Default:_ `false`
  * `object` - **(Boolean)** - If the arguments get sent to `func`
      * _Default:_ `false`

**Other Settings :**

  * `debug` - **(Function)** - The function to send the debug messages to
      * _Default:_ `console.log`
      * Setting this to anything other than function will prohibit the logging of any messages
  
```javascript
Schemy.settings({
  strict : true
})

Schemy.apply(1,String)    //undefined
Schemy.apply('hi',Number) //undefined
```

<a name='Reference'></a>
## Reference

View the various _Schema_ properties for quick reference

---
<a name='Schema'></a>
**Schema**

A **Schema Object** can have any of the following properties:

  * `type`     - **(Type)** _required_ - The _type(s)_ to check the value of
  
  * `before`   - **(Function)**      - Function to check validity of value **before** the built in checks
  
  * `after`    - **(Function)**      - Function to check validity of value **after** the built in checks
  
  * `only`     - **(Array)**         - Array of the values that are allowed
  
  * `not`      - **(Array)**         - Array of the values that are **NOT** allowed
  
  * `default`  - **(Any)**           - The default replacement value

  * `generate` - **(Function)**      - Function to create the replacement value
    * The input argument is the given `value`

  * `new`      - **(Boolean)**       - If the replacement value should be a new instance of the _type_
    * _Default:_ `false`
    * If `type` is an array, creates a new instance of the first Constructor in the array  

  * `cast`     - **(Boolean)**       - If the replacement value should be the given value cast as the _type_
    * _Default:_ `true`
    * If `type` is an array, creates a new instance of the first Constructor in the array  

  * `strict`   - **(Boolean)**       - To ignore values of `generate`, `new`, cast`, and `default` 
    * _Default:_ `false`
    * If there is no match it will either throw an error (if `required`) or set as `undefined`

  * `required` - **(Boolean)**       - If the given value is required to match the given _schema_
    * _Default:_ `true`
    * It will not complete the function if there is no valid input

  * `error`    - **(Boolean)**       - If an error should be thrown when a `required` value has not valid input
    * _Default:_ `true`
    * If false, it will simply not run the function
  
  * `priority` - **(Array)**         - The order to check `generate`, `new`, `cast`, or `default` when creating a replacement
    * _Default:_ `['generate','default','new','cast']`

---
<a name='Object'></a>
**Object**

`removeUndefined`
`removeExtra`
`addMissing`

<a name='License'></a>
## License

### MIT