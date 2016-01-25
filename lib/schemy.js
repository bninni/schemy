/*****
https://saucelabs.com
http://www.2ality.com/2011/08/universal-modules.html

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects

Detailed Comments	
Tests
	-test all that invoke 'setInvalid'

Readme:
	-'wrap' with 'array;true'
		-better examples using the array schema function
	-specific array schema
	-isOf, forEach
	-toJSON, fromJSON
	-copy, deepCopy, funcBody, funcName
	-isPrimitive?
	-mention how only[0] will be taken as replacement if all else fails
	-Schema class
	-Mention how creating a val = new Number(1) will mean you can't use 12 === val, but you can safely use == because you know the type of val

Replacement value should go through validation again if cast
	
Keep everything in its own module
Wrapper module
findMatch

Cloning a function just wrap the function
	-need to keep track of cloned function and the base function

When wrapping a function, also copy all of that functions properties/attributes to the new function

wrapped functions should have funcName and funcBody mapped to the original function, just like argNames

A schema can have a 'clone' attribute
-if true, (apply, ordered, sort, object) will clone the object before applying the schema

objectSchema should also be able to handle 'names' property

Schemy.defaults() or Schema.schema.defaults()
Schemy.object.defaults()
Schemy.array.defaults()
Schemy.wrap.defaults()

arraySchema:
	-finish flowchart and function
	-Be sure to finish the SettingsSchema for the 'priority' array

	
	
	

An empty object schema will not check the type at all (accepts anything)

Use additionalSchemaCheck in ordered, sort, object
-rename to nestedSchemaCheck
-Should run before 'after' function
-should this just be a prototype of the Schema object? 



Can set the 'order' of the validation functions
-saved validation functions should have another property to define if it is run on every instance of that type or just ones that include it in the schema
-need way to save a validation function for [] and {}

	
	
JSON
-can provide additional scope to find constructor objects 
 -NaN, infinity
	- include prototype if it is a function?
	- include references to all other global objects (not just functions)
	- include references to Schemy functions
		-used to JSONify wrapped functions


		
export a Class, Schemy, which create a Schema class

Schemy.prototype.match()
Schemy.prototype.apply()
Schemy.prototype.clone()
Schemy.prototype.save('name')
	-or use attribute saveAs : 'name' / ['names']
Schemy.prototype.get( middle ) -> flattens the object 
Schemy.prototype.set() -> update individual values
Schemy.prototype.harden() -> harden using the current settings so even if the settings change, it wont affect the schema
	-can use harden : true

-Can use a template : schema to clone a schema and then apply the new attributes on top

var SchemaSettings = {};
SchemaSchema = {
	type : Object,
	specific : {
		new : Boolean
	},
	removeUndefined : true,
	addMissing : false
}
function Schema( obj ){
		
	if( is(obj, Schema) ) return obj;
	
	obj = clone( apply( obj, SchemaSchema ) );
	
	stack.push(obj);
	
	this.asTemplate = function( newObj ){
		var each;
		for(each in obj) if( !(each in newObj) ) newObj[each] = obj[each];
	}
	
	this.raw = function(){
		return clone(obj);
	}
}
Schema.prototype.applyUnder = function( obj ){
	var each,
		_this = this.raw();
	for(each in _this) if( !(each in obj) ) obj[each] = _this[each];
}
	
Schema.prototype.applyOnto = function( obj ){
	var each,
		_this = this.raw();
	for( each in _this ) obj[key] = _this[key];
}
Schema.prototype.clone = function(){
	return new Schema( this.raw() );
}
Schema = createClass(Schema)
Schema.createClass = createClass;

instead of dealing with flatten or buildSchema, just always run Schemy( obj ).
-if obj is already a schema, it will just return that object

Map didn't work for RegExp??
=========================================
Improvements:

See how many times buildSchema is called when it is not necessary

Export functions:
	-isOf (to get hierarchy array of constructors?)
	
========================================		

Every function should be wrapped and the arguments be a schema
All Settings should have a schema applied to them before flattening
All Schema's should have a schema applied to them before handling
	
================================================

If size < minLength:
	if !addMissing -> return setInvalid
	else push undefined
If size > maxLength:
	if !removeExtra -> return setInvalid
	else splice

If specific schema:



================================================
Todo:

Date:
	now (for default)  -> can just do generate: Date.now
	earliest/latest
	months/days/years (what value is allowed for each)
Number:
	max, min
	add/sub/mult/div (value to auto add/sub/mult/div)
	adjust ( >max or <min will be redefined to equal max/min )
	enum (to map other values to numbers)
		-bitwise or incremental
String:
	match(regex), minLength, maxLength, length
Array:
	every (apply same schema to every element in array)
	specific (schema for each specific element in order)
	addMissing (if less than length or minLength)
	removeExtra (if more than length or max length)
	removeUndefined
	
	unique (whether all elements should be unique)
	length, minLength, maxLength
Function:
	before, after (will auto run the function before and/or after)
Error:
	throw (if the error exists, then auto throw the error)

Also check:
https://www.npmjs.com/package/json-schema-builder
https://www.npmjs.com/package/json8-schema

	

Schema property:
	- test
		-only used for unordered arguments.
		-if no test function exists, then simply match the arguments based on the order that type appears (the way it does now)
		-used to identify variables of the same type
		-input is: array of all potential objects.  user returns the one that matches
	
*****/

var argNamesMap = {
		funcs : [],
		names : []
	},
	InvalidObject = {},
	savedSchemas = {},
	validationFunctions = {},
	validationFunctionsMap = {
		types : [],
		names : []
	},
	//The default settings
	Settings = {
		debug : console.log,
		required : false,
		new : false,
		strict : false,
		cast : true,
		array : false,
		object : false,
		ordered : true,
		class : false,
		error : true,
		priority : ['generate','default','new','cast'],
	},
	SettingsSchema = {
		type : Object,
		specific : {
			debug : {
				type : Function,
				default : null
			},
			required : Boolean,
			new : Boolean,
			strict : Boolean,
			cast : Boolean,
			array : Boolean,
			object : Boolean,
			ordered : Boolean,
			class : Boolean,
			error : Boolean,
			priority : {
				type : Array
			}
		},
		settings : {
			required : false
		},
		removeExtra : true,
		removeUndefined : true,
		addMissing : false
	},
	JSONModule = new function(){
	
		var GlobalMap = new function(){
		
			var values = [];
			this.values = values;
		
			this.global = (function(){
				try{
					return window;
				}
				catch(e){
					return global;
				}
			})();
			
			this.keys = Object.getOwnPropertyNames( this.global );
						
			this.keys.forEach(function( key ){
				values.push( this.global[key] );
			});
			
		};

		/*****
		To create a new object based on the _Schemy object (if it exists)
		_Schemy should have:
			type - name of a global function
			data - data needed to recreate the function
			
		If there is anything unexpected, it will return {}
		*****/
		function fromSchemyJSON( obj ){
			
			var data, constructor,
				global = GlobalMap.global;
				
			if( !is( obj.type, String ) ) return {};
			
			constructor = global[ obj.type ];
			
			if( !is( constructor, Function ) ) return {};
			
			data = obj.data;
			
			switch( constructor ){
				case RegExp:
					return RegExp.apply( RegExp, data );
				case Function:
					if( is( data, Array ) ) return Function.apply( Function, data );
					return new Function();
			}
			
			if( !exists( data ) ) return new constructor();
			
			try{
				return new constructor( data );
			}
			catch(e){
				return new constructor();
			}
		}

		/*****
		To traverse the given object to reach the given path
		-Path is array of keys to follow
		-It will throw an error if the path doesn't point to an object
		*****/

		function goToPath( path, obj ){
			path.forEach(function( key ){
				if( !(key in obj) ) throw new Error('Path points to undefined key : ' + path )
				
				obj = obj[key];
				
				if( isPrimitive( obj ) ) throw new Error('Path points to non-object : ' + path )
				
			});
			
			return obj;
		}
		
		/*****
		To decode a value
		*****/
		function decodeValue( value, addCircular, parentObj, parentKey ){
			
			var key, newObj, _Schemy;
			
			//if value is Primitive, then return the value
			if( isPrimitive( value ) ) return value;
			
			_Schemy = value._Schemy;
			
			//if it is undefined, return undefined
			if( is( _Schemy, String ) ){
				switch( _Schemy ){
					case "undefined":
						return undefined;
					case "NaN":
						return NaN;
					case "Infinity":
						return Infinity;
					default:
						return global[_Schemy];
				}
			}
			
			//if it is a reference to another object, add to the queue
			if( is( _Schemy, Array ) ) return addCircular( parentObj, parentKey, _Schemy );
			
			if( is( _Schemy, Object ) ) newObj = fromSchemyJSON( _Schemy );
			else newObj = {};
			
			delete value._Schemy;
			
			forEach( value, function( value, key ){
				newObj[key] = decodeValue( value, addCircular, newObj, key );
			});
				
			return newObj;
		}
		
		/*****
		To initialize the decoding of a value
		*****/
		function decode( value ){
			var circular = [],
				retObj;
			
			//add the circular reference to the queue
			function addCircular( obj, key, path ){
				circular.push(function(){
					obj[key] = goToPath( path, retObj )
				});
			}
			
			retObj = decodeValue( value, addCircular );
			
			//process the circular references
			circular.forEach(function( f ){
				f();
			})
			
			return retObj;
		}

		/*****
		To create the Schemy JSON object data based off of the given value
		- type (the constructor)
		- data (data needed to recreate the object)
		*****/
		function toSchemyJSON( value ){
			var data,
				con = type(value),
				global = GlobalMap.global,
				typeName = funcName( con ),
				newObj = {
					type : typeName
				};
			
			if( value instanceof Error ){
				data = value.toString();
				//extract the error message
				if( data !== typeName ) newObj.data = data.match(/^.*Error: ([\s\S]*)/)[1];
			}
			else switch( con ){
				case Array:
					break;
				case Date:
					newObj.data = value.toISOString();
					break;
				case RegExp:
					newObj.data = value.toString().match(/^\/([\s\S]*)\/(.*)/).splice(1);
					break;
				case Function:
					newObj.data = argNames(value);
					newObj.data.push( funcBody(value) );
					break;
				default:
					newObj.data = value.toString();
			}
			
			return newObj;
		}
		
		/*****
		To encode a value
		*****/
		function encodeValue( value, path, objs, paths ){
			
			var newValue, index;
			
			//if it is undefined, return the undefined object
			if( value === undefined ) return { _Schemy : "undefined" }

			//if it is NaN, return the NaN object
			if( value !== value ) return { _Schemy : "NaN" }
			
			//if it is Infinity, return the Infinity object
			if( value === Infinity ) return { _Schemy : "Infinity" }
			
			//if value is Primitive, then return the value
			if( isPrimitive( value ) ) return value;
			
			//if its any other global value, return the key
			index = GlobalMap.values.indexOf( value );
			if( index > -1 ) return { _Schemy : GlobalMap.keys[index] }
			
			//if it is a circular reference, then create the reference object
			index = objs.indexOf( value );
			if( index > -1 ) return { _Schemy : paths[ index ] };
			
			//save the object and the path
			objs.push( value );
			paths.push( path );
			
			//encode the object
			newValue = {};
			
			forEach( value, function( value, key ){
				var newPath = path.slice();
				newPath.push(key);
				newValue[key] = encodeValue( value, newPath, objs, paths );
			});
			
			//if it is not an object, then add the _Schemy object
			if( !is(value, Object) ) newValue._Schemy = toSchemyJSON( value );
			
			return newValue;
			
		}

		/*****
		To initialize the encoding of an value
		*****/
		function encode( value ){			
			//Initialize the fromObjs and toObjs arrays
			return encodeValue( value, [], [], [] );
		}

		function toJSON( obj ){
			return JSON.stringify( encode(obj) );
		}

		function fromJSON( str ){
			return decode( JSON.parse(str) );
		}

		this.toJSON = toJSON;
		this.fromJSON = fromJSON;
		
	};

/*****
To save a Schema
*****/
function saveSchema( name, schema ){
	if( name in savedSchemas ) return false;
	savedSchemas[name] = buildSchema( schema );
	return true;
}
/*****
To get a saved schema
*****/
function getSaved( name ){
	return ( name in savedSchemas ) ? savedSchemas[name] : [];
}

/*****
To save a validation function
*****/
function saveValidation( type, name, func, schema ){
	
	function addToMap( type ){
		var i = validationFunctionsMap.types.indexOf( type );
		if( i > -1 ) return validationFunctionsMap.names[i].push(name);
		validationFunctionsMap.types.push( type );
		validationFunctionsMap.names.push( [name] );
	}
	
	if( name in validationFunctions ) return false;
	
	if( is(type,Array) ) type.forEach( addToMap );
	else addToMap( type );
	
	validationFunctions[name] = {
		func : func,
		schema : buildSchema(schema)
	}
	
	return true;
}

/*****
To get the type of the given variable

value	:	Any		:	The value to check

Will return the values constructor or null/undefined
*****/
function type( value ){
	return (exists( value ) ? value.constructor : value);
}

/*****
To see if the given variable exists

value	:	Any		:	The value to check

Will return true if the value does not equal undefined or null
*****/
function exists( value ){
	return value !== null && value !== undefined;
}

/*****
To get an array of the argument names for the given function

func	:	Function	:	The function to check

It convert the function into a string and then extracts the arguments names from the text

If the function was created using wrap or argArray, then it will return the arguments from the function it wrapped
*****/
function argNames( func ){
	var i = argNamesMap.funcs.indexOf(func);
	
	if( i > -1 ) return argNamesMap.names[i].slice();
	
	//if it is not a function, return an empty array
	if( !is(func,Function) ) return [];
	
	return func.toString().match(/^[^\(]*\(([\s\S]*?)\)/)[1].replace(/\s+/g, '').split(',');
};

/*****
Breakable forEach loop
*****/
function forEach( obj, func, _this ){
	var i,l;
	
	if( isPrimitive( obj ) || !is(func,Function) ) return;
	
	if( exists( _this ) ) func = func.bind(_this);
	
	function run(){
		if( obj.hasOwnProperty(i) ) return func( obj[i], i, obj );
		return false;
	}
	
	switch( type(obj) ){
		case Array:
			l=obj.length;
			for(i=0;i<l;i++) if( run() ) break;
			break;
		default:
			for(i in obj) if( run() ) break;
	}
}

/*****
To get the function body
*****/
function funcBody( func ){
	return func.toString().match(/\{([\s\S]*?)\}$/)[1].trim();
}

/*****
To get the function name
*****/
function funcName( func ){
	return func.toString().match(/^function ([^\s\(]*)/)[1].trim();
}

/*****
To map an object to function arguments

obj		:	Object|Array	:	Object containing the arguments you want to map to the function
func	:	Function		:	Function to map the objects to

It gets the names of the given function arguments, and then get the corresponding values from the given object and run the function using those values as the parameters

*****/
var map = wrap(
	[[Object,Array],Function,{
		type : Array,
		strict : true,
		required : false
	}],
	function that( data, func, args ){
		var args = exists(args) ? args : argNames(func),
			params = [];
			
		if( is(data,Array) ) params = data;
		else args.forEach(function(arg){
			params.push( data[arg] );
		});
		
		return run( this, that, func, params );
	},
	{
		required : true,
		ordered : false
	}
);

/*****
To see if the given variable has the given constructor(s)

value	:			Any				:	The value to check
comp	:	Function or [Functions]	:	The constructor(s) to check for (or null or undefined)

Returns true if:
	-the given value has any of the given constructor
	-the given value and given constructor are both are null or both undefined
*****/
function is( value, comp ){
	var i, l,
		value = type(value),
		comp_con = type(comp);
		
	if( arguments.length < 2 ) return false;
	
	//if the constructor is null or undefined, then see if the value is the same
	if( !comp_con ) return comp_con === value;
		
	//if the constructor is a function, then compare to the constructor of the value
	if( comp_con === Function ) return value === comp;
		
	//if the constructor is an array, then go through each
	if( comp_con === Array ){
		l = comp.length;
		if( l === 0 ) return exists(value);
		for(i=0;i<l;i++){
			if( is( comp[i], Array ) ){
				if( comp[i].length === 0 ) return !exists(value);
				return comp[i].indexOf(value) === -1;
			}
			if( value === comp[i] ) return true;
		}
	}
		
	return false;
}
	
/*****
To convert the given arguments into an array

args	:	Arguments or Function

If Arguments, it will turn them into an array
If Function, it will create a new function which automatically turns the arguments into an array and passes to the given function
*****/
function argArray( args ){
	if( !exists( args ) ) return [];
	
	if( !is( args, Function ) )	return Array.prototype.slice.apply( args );

	return mapArgNames(function that(){
		var arr = argArray( arguments );
		return run( this, that, args, [arr] );
	}, args);
}

/*****
To link the argument names from one given function to the argument names from the other given function

f_new	:	Function	:	The new function to link the argument names to
f_old	:	Function	:	The old function, which the argument names are extracted from

Use when wrapping functions using argArray or wrap
*****/
function mapArgNames(f_new,f_old){
	argNamesMap.funcs.push(f_new);
	argNamesMap.names.push( argNames(f_old) );

	return f_new;	
}

/*****
To convert a schema from an object format to an array format

obj		:	Object		:	The schemas in the form of an object
func	:	Function	:	The function that the schema applies to

It gets the names of the given functions arguments, and returns an array containing the values of the corresponding names from the given object

*****/
function convertSchema( obj, func ){
	var names = argNames(func),
		ret = [];
		
	names.forEach( function( name ){
		if( name in obj ) return ret.push( obj[name] );
		ret.push([]);
	});
		
	return ret;
}

/*****
To validate an Array
*****/
function arraySchema( arr, schema ){
	var valid = true,
		debug = Settings.debug,
		doUseDebug = is(debug,Function),
		base = flatten(Settings, schema.settings),
		doThrowError = base.error,
		doRemoveExtra = schema.removeExtra === true,
		doAddMissing = schema.addMissing !== false,
		doKeepUndefined = schema.removeUndefined !== true,
		specificSchema = schema.specific,
		everySchema = schema.every,
		length = schema.length,
		hasLength = is( length, Number ),
		minLength = hasLength ? length : schema.minLength,
		hasMinLength = is( minLength, Number ),
		maxLength = hasLength ? length : schema.maxLength,
		hasMaxLength = is( maxLength, Number ),
		size = arr.length, temp,
		subSchema, name, data;
		
	//to make sure minLength <= maxLength
	if( hasMinLength && hasMaxLength && minLength > maxLength ){
		temp = minLength;
		minLength = maxLength;
		maxLength = temp;
	}
		
	function add( value ){
		if( !is(value, undefined) || doKeepUndefined ) obj[name] = value;
		else delete obj[name];
	}
	
	function setInvalid( msg ){
		msg = is(msg,String) ? msg : '';
		if( doThrowError ) throw new TypeError( msg );
		if( doUseDebug ) debug('Error: ' + msg);
		return valid = false;
	};
	
	function handleMatch( name, schema ){
		var data = {
			value : obj[name]
		};
		
		if( findMatch( data, schema ) ) add( data.value );
		else handleReplacement( data.value, schema, add, setInvalid, 'Input argument \'' + name + '\' is invalid');
	}
	
	if( is(specificSchema,Array) ){
	
		//remove the superfluous keys or apply 'every' schema to them
		if( doRemoveExtra && hasMaxLength && size > maxLength ) arr.splice(maxLength);
		else if( exists( everySchema ) ){
			//check the schema for each key
			subSchema = buildSchema( everySchema, base );
			for( name in obj ) if( !(name in specificSchema) ) handleMatch( name, subSchema );
		}
		//check the schema for each key
		for( name in specificSchema ){
			subSchema = buildSchema( specificSchema[name], base );
			
			if( (name in obj) ) handleMatch( name, subSchema )
			else if( doAddMissing || subSchema.required ) handleReplacement( obj[name], subSchema, add, setInvalid, 'Input argument \'' + name + '\' is invalid');
		}
	}
	else if( exists( everySchema ) ){
		//check the schema for each key
		subSchema = buildSchema( everySchema, base );
		for( name in obj ) handleMatch( name, subSchema );
	}
	
	return valid;
}

/*****
To validate an object
*****/
function objectSchema( obj, schema ){
	var valid = true,
		debug = Settings.debug,
		doUseDebug = is(debug,Function),
		base = flatten(Settings, schema.settings),
		doThrowError = base.error,
		doRemoveExtra = schema.removeExtra === true,
		doAddMissing = schema.addMissing !== false,
		doKeepUndefined = schema.removeUndefined !== true,
		specificSchema = schema.specific,
		everySchema = schema.every,
		subSchema, name, data;
		
	function add( value ){
		if( !is(value, undefined) || doKeepUndefined ) obj[name] = value;
		else delete obj[name];
	}
	
	function setInvalid( msg ){
		msg = is(msg,String) ? msg : '';
		if( doThrowError ) throw new TypeError( msg );
		if( doUseDebug ) debug('Error: ' + msg);
		valid = false;
	};
	
	function handleMatch( name, schema ){
		var data = {
			value : obj[name]
		};
		
		if( findMatch( data, schema ) ) add( data.value );
		else handleReplacement( data.value, schema, add, setInvalid, 'Input argument \'' + name + '\' is invalid');
	}
	
	if( exists(specificSchema) ){
		//remove the superfluous keys or apply 'every' schema to them
		if( doRemoveExtra ){
			for( name in obj ) if( !(name in specificSchema) ) delete obj[name];
		}
		else if( exists( everySchema ) ){
			//check the schema for each key
			subSchema = buildSchema( everySchema, base );
			for( name in obj ) if( !(name in specificSchema) ) handleMatch( name, subSchema );
		}
		//check the schema for each key
		for( name in specificSchema ){
			subSchema = buildSchema( specificSchema[name], base );
			
			if( (name in obj) ) handleMatch( name, subSchema )
			else if( doAddMissing || subSchema.required ) handleReplacement( obj[name], subSchema, add, setInvalid, 'Input argument \'' + name + '\' is invalid');
		}
	}
	else if( exists( everySchema ) ){
		//check the schema for each key
		subSchema = buildSchema( everySchema, base );
		for( name in obj ) handleMatch( name, subSchema );
	}
	
	return valid;
}

/*****
To see if the given value is valid

value			:	Any			:	The value to checked
validFunction	:	Function	:	The validation function to check against (optional)

*****/
function isValid(data, schema, type){
	
	var obj = {
			value : data.value,
			reject : reject
		},
		valid = true,
		before = schema.before,
		after = schema.after,
		not = schema.not,
		only = schema.only,
		names, name, l,
		i = validationFunctionsMap.types.indexOf( type );
		
	function reject( msg ){
		valid = false;
	}
	
	function runValidCheck( func ){
		func( obj );
		if( !valid ) return true;
		data.value = obj.value;
		return false;
	}
	
	//run the before function
	if( exists(before) && runValidCheck(before) ) return false;
	
	//if the value is in the `not` array, then reject
	if( exists(not) && not.indexOf( data.value ) > -1 ) return false;
	
		//if the value is not in the `only` array, then reject
	if( exists(only) && only.indexOf( data.value ) === -1 ) return false;
	
	//run the stored validation functions
	if( i > -1 ){
		names = validationFunctionsMap.names[i];
		l = names.length;
		for(i=0;i<l;i++){
			name = names[i];
			obj.setting = apply(schema[name],validationFunctions[name].schema);
			if( runValidCheck( validationFunctions[name].func ) ) return false;
		}
		delete obj.setting;
	}
	
	//run the after function
	if( exists(after) && runValidCheck(after) ) return false;
	
	return true;
}


/*****
To check if the given value is valid
*****/
function checkValid( data, schema, type ){
	if( is(type, Object) && findMatch( data, type ) && isValid( data, schema, type) ) return true;
	else if( is( data.value, type ) && isValid( data, schema, type ) ) return true;
	return false;
}
	
/****
To check if the value matches any schema in the array
nested arrays return the opposite of the top array
****/
function checkArrayMatch( arr, nested, schema, data ){
	var i, type,
		l = arr.length;
		
	if( l === 0 ) return exists( data.value ) === nested;
	
	for( i=0;i<l;i++){
		type = arr[i];
		if( nested && is( type, Array ) ) return checkArrayMatch( type, false, schema, data );
		if( checkValid( data, schema, type ) ) return nested;
	}
	return !nested;
}

/*****
To run additional schema check functions if they exist
*****/
function additionalSchemaCheck( value, schema ){
	switch( type(value) ){
		case Object:
			return objectSchema( value, schema );
			break;
		case Array:
			break;
	}
	return true;
}
	
/*****
The match function, but the value is mutable
*****/
function findMatch( data, schema ){
	var success,
		schema = buildSchema(schema);
	
	success = checkArrayMatch( schema.type, true, schema, data );

	if( success ) success = additionalSchemaCheck( data.value, schema );
	
	return success;
}

/****
To clone
****/
function isPrimitive( value ){
	return is( value, [Number,String,Boolean,null] );
}

function newInstanceOf( value ){
	//if object or array, create new instance
	if( is( value, [Object, Array] ) ) return new value.constructor();
	
	if( is(value, Function) ) return new (Function.prototype.bind.apply( Function, [Function].concat( argNames(value) ).concat( [funcBody(value)] ) ) )
	
	//otherwise, cast the old instance as a new instance
	return new value.constructor( value );
}

function copy( fromObj, toObj ){
	var key;
	
	//if fromObj is Primitive, then return original value
	if( isPrimitive( fromObj ) ) return fromObj;
	
	//make sure the toObj is also not Primitive
	if( isPrimitive( toObj ) ) toObj = newInstanceOf( toObj );
	
	for(key in fromObj) toObj[key] = fromObj[key];
	
	return toObj;
}

function deepCopy( fromObj, toObj ){
	
	//if fromObj is Primitive, then return original value
	if( isPrimitive( fromObj ) ) return fromObj;
	
	//make sure the toObj is also not Primitive
	if( isPrimitive( toObj ) ) toObj = newInstanceOf( toObj );
	
	//Initialize the fromObjs and toObjs arrays
	return deepCopyTo( fromObj, toObj, [fromObj], [toObj] );
}

function deepCopyTo( fromObj, toObj, oldObjs, newObjs ){
	var key, value, newObj, index;
	
	for(key in fromObj){
		value = fromObj[key];
		
		//if value is Primitive, then return original value
		if( isPrimitive( value ) ) toObj[key] = value;
		else{
			//if the value was already referenced, then return the corresponding 'new object'
			index = oldObjs.indexOf( value );
			if( index > -1 ) toObj[key] = newObjs[ index ];
			else{
				//make a new object using the same constructor
				newObj = newInstanceOf( toObj );
				
				//save the value and map it to the 'new object'
				oldObjs.push( value );
				newObjs.push( newObj );
				
				//deep copy the value onto the new object
				toObj[key] = deepCopyTo( value, newObj, oldObjs, newObjs );
			}
		}
	}
	
	return toObj;
}

/*****
To apply a schema to the given variable
*****/
function apply( value, schema ){
	var schema = buildSchema( schema ),
		debug = Settings.debug,
		doUseDebug = is(debug,Function),
		doThrowError = schema.error,
		obj = {
			value : value,
		};
	
	function add( val ){		
		obj.value = val;
		//if the additional schema check failed, then return undefined
		if( !additionalSchemaCheck(val, schema) ) obj.value = undefined;
	}
	
	function setInvalid( msg ){
		msg = is(msg,String) ? msg : '';
		if( doThrowError ) throw new TypeError( msg );
		if( doUseDebug ) debug('Error: ' + msg);
		obj.value = undefined;
	}
	
	//if no match was found, try to find the replacement
	if( !findMatch( obj, schema ) ) handleReplacement( obj.value, schema, add, setInvalid, 'Unable to apply schema')
	
	return obj.value;
}
	
/*****
To see if the given value matches the given schema

value	:	Any		:	The value to checked
schema	:	Schema	:	The schema to compare against

*****/
function match( value, schema ){
	return findMatch( { value : value }, schema );
}

/*****
To go through an object and map it to the function arguments
*****/
function object(names, obj, schema, setInvalid){
	var obj = is(obj,Object) ? obj : {},
		ret = [];
	
	function add( value ){
		ret.push(value);
	}
	
	function handleMatch( name, schema ){
		var data = {
			value : obj[name]
		};
		
		if( findMatch( data, schema ) ) add( data.value );
		else handleReplacement( data.value, schema, add, setInvalid, 'Input argument \'' + name + '\' is invalid');
	}
	
	//find a match for each schema
	schema.forEach( function( schema, i ){
		var i, l, value,
			//the names are directly mapped to a schema
			name = names[i];
		
		//if the name is in the input object, then check its value
		if( name in obj ) return handleMatch( name, schema );
		
		//otherwise, see if any alternative names exist
		if( is(schema.names,Array) ){
			l = schema.names.length;
			//if an alternative name is found, then handle the match
			for(i=0;i<l;i++) if( (name = schema.names[i]) in obj ) return handleMatch( name, schema );
		}
		
		handleReplacement( undefined, schema, add, setInvalid, 'Expected input argument with name \'' + name + '\'');
		
	});
	
	return ret;
}

/*****
To sort the given argument array to best match the given schema array

args	:	Arguments
schema	:	Array of Objects	:	The schemas in the order the args need to be in

*****/
function sort( names, args, schema, setInvalid ){
	
	var arr = argArray( args ),
		ret = [];
		
	function add( value ){
		ret.push(value);
	}
		
	//find a match for each schema element
	schema.forEach( function( schema, index ){
		var i, value,
			obj = {},
			l = arr.length,
			name = names[index],
			nameStr = exists( name ) ? 'with name \'' + name + '\',' : 'at';
		
		//go through the arguments in order until a match is found
		for(i=0;i<l;i++){
			obj.value = arr[i];
			//once a match is found, save that value and remove it from the argument array
			if( findMatch( obj, schema ) ){
				add( obj.value );
				return arr.splice( i, 1 );
			}
		}
		
		handleReplacement( undefined, schema, add, setInvalid, 'Expected input argument ' + nameStr + ' Position #' + index );
	
	});
	
	return ret;
}

/*****
To validate the given argument array to match the given schema array

args	:	Arguments
schema	:	Array of Objects	:	The schemas in the order the args need to be in

*****/
function ordered( names, args, schema, setInvalid ){
	
	var arr = argArray( args ),
		ret = [];
		
	function add( value ){
		ret.push(value);
	}
	
	//find a match for each schema element
	schema.forEach( function( schema, index ){
		var value,
			obj = {},
			name = names[index],
			nameExists = exists( name ) && name !== '',
			nameStr1 = nameExists ? ' with name \'' + name + '\'' : '',
			nameStr2 = nameExists ? ' \'' + names[index] + '\'' : '';

		//if there are no more arguments, then the rest are undefined
		if( !arr.length ) return handleReplacement( undefined, schema, add, setInvalid, 'Expected input argument' + nameStr1 + ' at Position #' + index );

		//get the next argument
		obj.value = arr.splice( 0, 1 )[0];
		
		//if there is a match, then add it
		if( findMatch( obj, schema ) ) return add(obj.value);
		
		handleReplacement(obj.value, schema, add, setInvalid, 'Input argument' + nameStr2 + ' at Position #' + index + ' is invalid');
		
	});
	
	return ret;
}

/*****
To handle a replacement value
*****/
function handleReplacement( value, schema, success, setInvalid, msg ){
	
	value = replacement( value, schema );
	
	if( value === InvalidObject ){
		if( schema.required ) return setInvalid( msg );
		value = undefined;
	}
	
	success( value );
}

/*****
To create the replacement value if it doesn't match the schema
*****/
function replacement( value, schema ){
	var i, el, new_value,
		schema = buildSchema(schema),
		con = schema.type[0],
		l = schema.priority.length;
	
	function findCon( arr ){
		var i,
			l = arr.length;
		for(i=0;i<l;i++){
			con = arr[i];
			if( is( con,[Function,null,undefined] ) || (is(con, Object) && findCon( con.type )) ) return true;
		}
		
		con = undefined;
		
		return false;
	}
	
	if( schema.strict ) return InvalidObject;
	
	findCon( schema.type );
	
	//get the first type
	while( is(con, Object) ) con = con.type[0];
	
	for( i=0;i<l;i++ ){
		switch(schema.priority[i]){
			case 'new':
				if( !schema.only && schema.new ){
					new_value = exists(con) ? new con() : con;
					if( !schema.not || schema.not.indexOf(new_value) === -1 ) return new_value;
				}
				break;
			case 'cast':
				if( !schema.only && schema.cast ){
					new_value = exists(con) ? ( (con === Object) ? new con() : new con( value ) ) : con;
					if( !schema.not || schema.not.indexOf(new_value) === -1 ) return new_value;
				}
				break;
			case 'generate':
				if( 'generate' in schema ) return schema.generate( value );
				break;
			case 'default':
				if( 'default' in schema ) return schema.default;
		}
	}
	
	if( schema.only ) return schema.only[0];
	
	return InvalidObject;
}

/*****
To flatten the objects into a new object
*****/
function flatten(){
	var key,
		arr = argArray(arguments),
		ret = {};
	
	arr.forEach( function( obj ){
		for( key in obj ) ret[key] = obj[key];
	} );
	
	return ret;
}

/*****
To build a schema using the given schema array and given props
*****/
function buildSchema( arg, props ){
	var props = getBase( props ),
		returnType = [],
		type, i, l, t;
	
	while( is( arg, String ) ) arg = getSaved(arg);
		
	type = arg;
	
	if( is( arg, Object ) ){
		props = flatten( props, arg );
		type = arg.type;
	}
	
	if( !is( type, Array ) ) type = [type];
	
	l=type.length;
	for(i=0;i<l;i++){
		t = type[i];
		
		while( is( t, String ) ) t = getSaved(t);
		
		if( is( t, [Function,null,undefined] ) ) returnType.push(t);
		else if( is( t, Object ) ) returnType.push( buildSchema(t, props) );
		else if( is( t, Array ) ){
			returnType = [];
			t.forEach(function( type ){
				while( is( type, String ) ) type = getSaved(type);
				
				if( is( type, [Function,null,undefined] ) ) return returnType.push(type);
				
				if( is( type, Object ) ) return returnType.push( buildSchema(type, props) );
			});
			returnType = [ returnType ];
			break;
		}
	}
	
	return flatten( props, { type : returnType } );
}

/****
To get the base settings of the given object
****/
function getBase( obj ){
	var obj = exists( obj ) ? obj : Settings;
	
	return {
		required : obj.required,
		error : obj.error,
		strict : obj.strict,
		new : obj.new,
		cast : obj.cast,
		priority : obj.priority
	}
}

/*****
The function to build a schema from an array of schemas
*****/
function buildSchemaArray( arr, props ){
	var ret = [];
		
	arr.forEach( function(arg){
		ret.push( buildSchema( arg, props ) );
	} );
	
	return ret;
}

/*****
To wrap the given function with the given schema using the given properties.

args	:	 Array | Object	:	Schema for each argument
func	:		Function	:	Function to pass the arguments to
props	:		Object		:	Properties to use

*****/
function buildWrapper( args, func, props ){
	var settings = flatten( Settings, props ),
		f = settings.ordered ? ordered : sort,
		debug = settings.debug,
		doUseDebug = is(debug,Function),
		isObj = settings.object,
		names = argNames( func ),
		doThrowError = settings.error,
		isClass = settings.class !== false,
		isArray = settings.array,
		args = is( args, Array ) ? args : convertSchema(args, func),
		schema = buildSchemaArray( args, settings );
	
	return mapArgNames(function that(){
		var valid = true,
			setInvalid = function( msg ){
				msg = is(msg,String) ? msg : '';
				if( doThrowError ) throw new TypeError( msg );
				if( doUseDebug ) debug('Error: ' + msg);
				valid = false;
			},
			args = isObj ? object(names, arguments[0], schema, setInvalid ): f( names, (isArray ? [argArray(arguments)] : arguments), schema, setInvalid );

		if( !valid ) return;
		
		return run( this, that, func, args, isClass );
		
	}, func );
}


/*****
To either run the function or return a new instance of the given function
*****/
function run( _this, that, func, data, forceNew ){
	if( forceNew === true || _this instanceof that ) return new (Function.prototype.bind.apply( func, [func].concat(data) ) );
	return func.apply(_this, data );
}

/*****
To wrap a function in a way that it will always return a new instance
*****/
function createClass( f ){
	return mapArgNames(function that(a){
		var args = argArray(arguments);
		return run( this, that, f, args, true);
	},f);
}

/*****
To update the settings
*****/
var updateSettings = wrap([SettingsSchema],
	function( obj ){
		var key;
		for(key in obj) Settings[key] = obj[key];
		return getSettings();
	},
	{
		cast : false,
		required : true,
		error : false
	}
)

/*****
To get the settings
*****/
function getSettings(){
	var key, val,
		obj = {};
	for(key in Settings){
		val = Settings[key];
		if( is(val,Array) ) obj[key] = val.slice();
		else obj[key] = val;
	}
	return obj;
}

updateSettings.get = getSettings;

/*****
The public function, a wrapper for the buildWrapper function
*****/
function wrap(){
	
	var schema = buildSchemaArray([[Array,Object],Function,Object],
		flatten( Settings, { new : true })),
		args = sort( ['args','func','props'], arguments, schema );
		
	return buildWrapper.apply( this, args );
	
}

module.exports = {
	wrap : wrap,
	is : is,
	type : type,
	exists : exists,
	match : match,
	apply : apply,
//	isOf : isOf,
	map : map,
	argArray : argArray,
	argNames : argNames,
	save : saveSchema,
	validation : saveValidation,
	class : createClass,
	settings : updateSettings,
	copy : copy,
	deepCopy : deepCopy,
	toJSON : JSONModule.toJSON,
	fromJSON : JSONModule.fromJSON,
};
