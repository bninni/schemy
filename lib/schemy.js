/*****
https://saucelabs.com
http://www.2ality.com/2011/08/universal-modules.html

Detailed Comments	
Tests
Add 'wrap' to the Readme

Make sure 'new' will work with all functions that create new functions
	-map()

Add a function to update the Settings

Using wrap, argArray, etc, on a prototype function?

Make priority a Settings (array of strings)
	-update the Schema that checks whether object is arguments or properties)
=========================================
Improvements:

Rename argArray?
	-toArray ??
	
In 'validation', should there be a schema for the data.setting value??
	-instead of the 'default'

Include an error message if 'required' fails
Option to throw error in setInvalid

'Map' should have an optional 3rd input (names)
	-should also accept an array instead of an object
	-in case the browser does not support function.toString()

If the array property is set to true, then try to match any of the arguments with the args array.
i.e. if [Number,String] then any element can be an number or string
	-if undefined, remove from array

Export functions:
	-isOf (to get hierarchy array of constructors?)
	
Quick functions to apply a schema to an array or to an object
	
========================================		

Apply Schema to all settings before flattening
	-need to add in custom schema options for Objects
	
Need to create a schema for all Schemas
	
================================================
Todo:

Date:
	now (for default)  -> can just do generate: Date.now
	earliest/latest
	months/days/years (what value is allowed for each)
Number:
	max, min
	enum (to map other values to numbers)
		-bitwise or incremental
String:
	match(regex), minLength, maxLength, length
Object:
	Schema (schema for each key)
	removeExtra (to remove any additional keys)
Array:
	All (all elements must match)
	length, minLength, maxLength
	each (schema for each element in order)
	unique (whether all elements should be unique)
Function:
	before, after (will auto run the function before and/or after)
Error:
	throw (if the error exists, then auto throw the error)

Also:
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
	savedSchemas = {
	},
	validationFunctions = {
	},
	validationFunctionsMap = {
		types : [],
		names : []
	},
	//The default settings
	Settings = {
		required : false,
		new : false,
		cast : true,
		array : false,
		object : false,
		ordered : true,
		class : false,
		priority : ['generate','default','new','cast'],
	};

/*****
To save a Schema
*****/
function save( name, schema ){
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
function validation( type, name, func, setting ){
	
	if( name in validationFunctions ) return false;
	
	function addToMap( type ){
		var i = validationFunctionsMap.types.indexOf( type );
		if( i > -1 ) return validationFunctionsMap.names[i].push(name);
		validationFunctionsMap.types.push( type );
		validationFunctionsMap.names.push( [name] );
	}
	
	if( is(type,Array) ) type.forEach( addToMap );
	else addToMap( type );
	
	validationFunctions[name] = {
		func : func,
		setting : setting
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
	
	if( i > -1 ) return argNamesMap.names[i];
	
	//if it is not a function, return an empty array
	if( !is(func,Function) ) return [];
	
	return func.toString().match(/^[^\(]*\(([\s\S]*?)\)/)[1].replace(/\s+/g, '').split(',');
};

/*****
To map an object to function arguments

obj		:	Object		:	Object containing the arguments you want to map to the function
func	:	Function	:	Function to map the objects to

It gets the names of the given function arguments, and then get the corresponding values from the given object and run the function using those values as the parameters

*****/
var map = wrap(
	[Object,Function],
	function( obj, func ){
		var args = argNames(func),
			params = [];
		
		args.forEach(function(arg){
			params.push( obj[arg] );
		});
		
		return func.apply(func, params);
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
		if( this instanceof that ) return newInstance.apply(args, [args].concat([arr]) );
		return args.call( args, arr );
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
The match function, but the value is mutable
*****/
function findMatch( data, schema ){
	var i, s,
		schema = buildSchema(schema),
		valid = schema.valid,
		type = schema.type,
		not = schema.not,
		only = schema.only,
		l = type.length;
		
	/*****
	To see if the given value is valid

	value			:	Any			:	The value to checked
	validFunction	:	Function	:	The validation function to check against (optional)

	*****/
	function isValid(){
		
		var obj = {
				value : data.value,
				valid : true
			},
			names, name, l,
			i = validationFunctionsMap.types.indexOf( s );
		
		if( i > -1 ){
			names = validationFunctionsMap.names[i];
			l = names.length;
			for(i=0;i<l;i++){
				name = names[i];
				obj.setting = name in schema ? schema[name] : validationFunctions[name].setting
				validationFunctions[name].func( obj );
				if( !obj.valid ) return false;
				data.value = obj.value;
			}
			delete obj.setting
		}
		
		if( !exists(valid) ) return true;
		
		valid( obj );
		
		if( obj.valid ) data.value = obj.value;
		
		return obj.valid;
	}
	
	function check(){
		if( is(s, Object) && findMatch( data, s ) && isValid() ) return true;
		else if( is( data.value, s ) && isValid() ) return true;
		return false;
	}
	
	if( not && not.indexOf( data.value ) > -1 ) return false;
	if( only && only.indexOf( data.value ) === -1 ) return false;
	
	if( l === 0 ) return exists( data.value );
	
	for(i=0;i<l;i++){
		s = type[i];
		if( is( s, Array ) ){
			l=s.length;
			type = s;
			if( l === 0 ) return !exists( data.value );
			for(i=0;i<l;i++){
				s = type[i];
				if( check() ) return false;
			}
			return true;
		}
		else if( check() ) return true;
	}
	return false;
}

/*****
To apply a schema to the given variable
*****/
function apply( value, schema ){
	var obj = {
		value : value,
	};
	if( findMatch( obj, schema ) ) return obj.value;
	return replacement( obj.value, schema );
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
	var obj = is(obj, Object) ? obj : {},
		ret = [];
		
	function handleMatch( value, schema ){
		var data = {
			value : obj[value]
		};
		if( findMatch( data, schema ) ) return ret.push(data.value);
		
		if( schema.required && data.value === undefined ) return setInvalid();
		
		ret.push( replacement( data.value, schema ) );
	}
		
	schema.forEach( function( schema, i ){
		var i, l,
			name = names[i];
		
		if( !(name in obj) ){
			if( 'names' in schema ){
				l = schema.names.length;
				for(i=0;i<l;i++) if( (name = schema.names[i]) in obj ) return handleMatch( name, schema );
			}
			if( schema.required ) return setInvalid();
			return ret.push( replacement( undefined, schema ) );
		}
		
		handleMatch( name, schema );
		
	});
	
	return ret;
}

/*****
To sort the given argument array to best match the given schema array

args	:	Arguments
schema	:	Array of Objects	:	The schemas in the order the args need to be in

*****/
function sort( args, schema, setInvalid ){
	
	var arr = argArray( args );
		ret = [];
		
	schema.forEach( function( schema ){
		var i,
			obj = {},
			l = arr.length;
		
		for(i=0;i<l;i++){
			obj.value = arr[i];
			if( findMatch( obj, schema ) ){
				ret.push( obj.value );
				arr.splice( i, 1 );
				return;
			}
		}
		
		if( schema.required ) return setInvalid();
		ret.push( replacement( undefined, schema ) );
	});
	
	return ret;
}

/*****
To validate the given argument array to match the given schema array

args	:	Arguments
schema	:	Array of Objects	:	The schemas in the order the args need to be in

*****/
function ordered( args, schema, setInvalid ){
	
	var arr = argArray( args );
		ret = [];
		
	schema.forEach( function( schema ){
		var obj = {};
			
		if( !arr.length ){
			if( schema.required ) return setInvalid();
			return ret.push( replacement( undefined, schema ) );
		}
		
		obj.value = arr.splice( 0, 1 )[0];
		
		if( findMatch( obj, schema ) ) return ret.push(obj.value);
		
		if( schema.required && obj.value === undefined ) return setInvalid();
		ret.push( replacement( obj.value, schema ) );
		
	});
	
	return ret;
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
					new_value = exists(con) ? new con( value ) : con;
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
	
	return undefined;
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
	var props = props || {
			required : Settings.required,
			new : Settings.new,
			cast : Settings.cast,
			priority : Settings.priority
		},
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

/*****
The function to build a schema from an array of schemas
*****/
function buildSchemaArray( arr, props ){
	var base = {
			required : props.required,
			new : props.new,
			cast : props.cast,
			priority : props.priority
		},
		ret = [];
		
	arr.forEach( function(arg){
		ret.push( buildSchema( arg, base ) );
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
		_this = 'this' in props ? props.this : func,
		f = settings.ordered ? ordered : sort,
		isObj = settings.object,
		names = argNames( func ),
		isClass = settings.class !== false,
		isArray = settings.array,
		args = is( args, Array ) ? args : convertSchema(args, func),
		schema = buildSchemaArray( args, settings );
	
	return mapArgNames(function that(){
		var valid = true,
			setInvalid = function(){ valid = false; },
			args = isObj ? object(names, arguments[0], schema, setInvalid ): f( arguments, schema, setInvalid );

		if(!valid) return;
		
		if( isArray ) args = [args];
		
		if( isClass || this instanceof that ){
			return newInstance.apply(_this, [_this].concat(args) );
		}
		return func.apply( _this, args );
	}, func );
}

/*****
To create a new instance even if new isn't used
*****/
function newInstance( f ){
	return new (Function.prototype.bind.apply(f, arguments) );
}

/*****
To wrap a function in a way that it will always return a new instance
*****/
function createClass( f ){
	return mapArgNames(function(a){
		var args = argArray(arguments);
		return newInstance.apply(f, [f].concat(args) );
	},f);
}

/*****
The public function, a wrapper for the buildWrapper function
*****/
function wrap(){
	
	var schema = buildSchemaArray([{
			type : [Array,Object],
			valid : function( data ){
				var key,
					val = data.value,
					schema = buildSchema([Array, Object, Function]);
					
				if( is(val, Array) ) return true;
				//if any of the given values are not an array, object, or function, then the object is the properties object
				for( key in val ) if( !match(val[key], schema ) ) return data.valid = false;
			}
		},Function,Object],
		flatten( Settings, { new : true })),
		args = sort( arguments, schema );
		
	return buildWrapper.apply( buildWrapper, args );
	
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
	save : save,
	validation : validation,
	class : createClass
};