(function() {
	function Send() {

	}

	Send.prototype.send = function(target, type, params, callback, scope) {
		var url = ZionSetting.send.url + "/" + Zion.token + "/" + target + "/" + type + "/" + Zion.util.encodeParam(params);
		Zion.util.getJSON(url, callback, scope);
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Send = Send;
	window.Zion.send = new Send();
})();