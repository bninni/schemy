var Schemy = require('../schemy'),
	vows = require('vows'),
	assert = require('assert');
	
vows.describe('Using \'exists\' to test existance').addBatch({
    'Testing exists:': {
        '\'\' -> True': function (topic) {
			assert.equal( Schemy.exists(''), true );
        },
        '0 -> True': function (topic) {
			assert.equal( Schemy.exists(0), true );
        },
        'false -> True': function (topic) {
			assert.equal( Schemy.exists(false), true );
        },
        '[] -> True': function (topic) {
			assert.equal( Schemy.exists([]), true );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.exists(undefined), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.exists(null), false );
        },
	}
}).run();
	
vows.describe('Using \'is\' to check the type').addBatch({
    'Testing String:': {
        topic: [String],

        '\'\' -> True': function (topic) {
			assert.equal( Schemy.is('', topic[0]), true );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> False': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing Number:': {
        topic: [Number],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> True': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), true );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> False': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing Boolean:': {
        topic: [Boolean],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> True': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), true );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> False': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing Array:': {
        topic: [Array],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> True': function (topic) {
			assert.equal( Schemy.is([], topic[0]), true );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> False': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing Object:': {
        topic: [Object],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> True': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), true );
        },
        'function(){} -> False': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing Function:': {
        topic: [Function],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> True': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), true );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing undefined:': {
        topic: [undefined],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> false': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> True': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), true );
        },
        'null -> False': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), false );
        },
    },
    'Testing null:': {
        topic: [null],

        '\'\' -> False': function (topic) {
			assert.equal( Schemy.is('', topic[0]), false );
        },
        '10 -> False': function (topic) {
			assert.equal( Schemy.is(10, topic[0]), false );
        },
        'true -> False': function (topic) {
			assert.equal( Schemy.is(true, topic[0]), false );
        },
        '[] -> False': function (topic) {
			assert.equal( Schemy.is([], topic[0]), false );
        },
        '{} -> False': function (topic) {
			assert.equal( Schemy.is({}, topic[0]), false );
        },
        'function(){} -> false': function (topic) {
			assert.equal( Schemy.is(function(){}, topic[0]), false );
        },
        'undefined -> False': function (topic) {
			assert.equal( Schemy.is(undefined, topic[0]), false );
        },
        'null -> True': function (topic) {
			assert.equal( Schemy.is(null, topic[0]), true );
        },
    },
    'Testing using Arrays:': {
        topic: '',
		
        '\'\' is a String or Number -> True': function (topic) {
			assert.equal( Schemy.is(topic, [String,Number]), true );
        },
        '\'\' is a Number or Boolean -> False': function (topic) {
			assert.equal( Schemy.is(topic, [Number,Boolean]), false );
        },
        '\'\' is not a Number or Boolean -> True': function (topic) {
			assert.equal( Schemy.is(topic, [[Number,Boolean]]), true );
        },
    },
}).run();