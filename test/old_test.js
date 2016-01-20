function f(i,s){
	console.log('number: ' + (i+1) );
	console.log('string: ' + (s+1) );
}

var arr = [Number,String];

f_o = schemy(arr, f)

f_u = schemy(arr, f, {
	ordered : false
})

f_obj = schemy(arr, f, {
	new : true,
	object : true
})

f_o(1,'hi');
f_o(1,2);
f_o('hi',1);
f_o('hi','there');

f_u(1,'hi');
f_u(1,2);
f_u('hi',1);
f_u('hi','there');

f_obj({
	i : 1,
	s : 'hi'
});

f_obj({
	s : 'hi'
});

f_obj({
	i : 1,
});

f_obj({
	s : 1,
	i : 'hi'
});
f_obj({});
f_obj();
