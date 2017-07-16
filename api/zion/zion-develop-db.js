(function() {
	function DB() {

	}
	
	DB.prototype.getTables = function(datasource,username, callback, scope) {
		var url = ZionSetting.develop.db.url + "/" + Zion.token + "/info/"+Zion.util.encodeParam([datasource,username]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	DB.prototype.getTableInfo = function(datasource,username,table, callback, scope) {
		var url = ZionSetting.develop.db.url + "/" + Zion.token + "/info/" + Zion.util.encodeParam([datasource,username,table]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	DB.prototype.execSql = function(datasource,sql,parameter, callback, scope) {
		var url = ZionSetting.develop.db.url + "/" + Zion.token + "/sql/" + Zion.util.encodeParam([datasource,sql,parameter]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	DB.prototype.execDdl = function(datasource,sql, callback, scope) {
		var url = ZionSetting.develop.db.url + "/" + Zion.token + "/ddl/" + Zion.util.encodeParam([datasource,sql]);
		Zion.util.getJSON(url, callback, scope);
	};
	
	if (!window.Zion) {
		window.Zion = {};
	}
	if(!window.Zion.Develop){
		window.Zion.Develop = {};
	}
	window.Zion.Develop.DB = DB;
	if(!window.Zion.develop){
		window.Zion.develop = {};
	}
	window.Zion.develop.db = new DB();
})();