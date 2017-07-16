(function() {
	function Util() {

	}

	Util.prototype.ns = function(ns) {
		var n = window;
		var nsArray = ns.split('.');
		for ( var i in nsArray) {
			if (!n[nsArray[i]]) {
				n[nsArray[i]] = {};
			}
			n = n[nsArray[i]];
		}
	};

	Util.prototype.getJSON = function(uri, callback, scope) {
		return $.getJSON(uri + '?callback=?', function(data) {
			callback.call(scope || window, data);
		});
	};

	var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var meta = {
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'"' : '\\"',
		'\\' : '\\\\'
	};

	function quote(string) {
		return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}
	;

	Util.prototype.queryString = function(val) {
		var uri = window.location.search;
		var re = new RegExp("" + val + "=([^&?]*)", "ig");
		return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
	};

	Util.prototype.encodeParam = function(param) {
		function encode(param){
			var partial = [];
			for ( var i = 0; i < param.length; i++) {
				var value = param[i];
				switch (typeof value) {
				case 'string':
					value = quote(value);
					break;
				case 'number':
					value = isFinite(value) ? value : 'null';
					break;
				case 'object':
					if(Object.prototype.toString.apply(value) === '[object Array]'){
						value = encode(value);
					}
					break;
				}
				partial.push(value);
			}
			return '[' + partial.join(',') + ']';
		}
		
		return encodeURIComponent(encode(param));
	};
	
	Util.prototype.color = function(val){
		var color_value;
		if(val == 1){
			color_value = 'blue';
		}else if(val == 2){
			color_value = 'red';
		}else if(val == 3){
			color_value = 'green';
		}else if(val == 4) {
			color_value = 'yellow';
		}else if(val == 5){
			color_value = '#FFCC33';
		}else if(val == 6){
			color_value = '#9933CC';
		}else{	
			color_value = '#00FF66';
		}
		return color_value;
	}
	if(!window.Zion){
		window.Zion = {};
	}
	window.Zion.Util = Util;
	window.Zion.util = new Util();
	window.Zion.token = window.Zion.util.queryString('token');
})();