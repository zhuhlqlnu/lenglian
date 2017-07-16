(function() {
	function Configure() {

	}
	
	Configure.prototype.getConfigures = function(callback, scope) {
		var url = ZionSetting.configure.url + "/" + Zion.token + "/get";
		Zion.util.getJSON(url, callback, scope);
	};
	
	Configure.prototype.getProperties = function(configure, callback, scope) {
		var url = ZionSetting.configure.url + "/" + Zion.token + "/get/" + Zion.util.encodeParam([configure]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	Configure.prototype.getProperty = function(configure, property, callback, scope) {
		var url = ZionSetting.configure.url + "/" + Zion.token + "/get/" + Zion.util.encodeParam([configure, property]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	Configure.prototype.putProperty = function(configure, property, value, callback, scope) {
		var url = ZionSetting.configure.url + "/" + Zion.token + "/put/" + Zion.util.encodeParam([configure, property, value]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	Configure.prototype.removeProperty = function(configure, property, callback, scope) {
		var url = ZionSetting.configure.url + "/" + Zion.token + "/put/" + Zion.util.encodeParam([configure, property]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	if (!window.Zion) {
		window.Zion = {};
	}
	
	window.Zion.Configure = Configure;
	window.Zion.configure = new Configure();
})();