(function() {
	function DB() {

	}
	
	DB.prototype.getJSON = function(alias, params, callback, scope) {
		var url;
		if(Zion.token){
			if (params) {
				url = ZionSetting.db.url + "/" + Zion.token + "/" + alias + "/" + Zion.util.encodeParam(params);
			} else {
				url = ZionSetting.db.url + "/" + Zion.token + "/" + alias;
			}
		}else{
			if (params) {
				url = ZionSetting.db.url + "/" + alias + "/" + Zion.util.encodeParam(params);
			} else {
				url = ZionSetting.db.url + "/" + alias;
			}
		}
		Zion.util.getJSON(url, callback, scope);
	};
	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.DB = DB;
	window.Zion.db = new DB();
})();