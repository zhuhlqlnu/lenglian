(function() {
	function Report() {

	}
	
	Report.prototype.getURL = function(alias, params) {
		if (params) {
			return ZionSetting.report.url + "/" + Zion.token + "/" + alias + "/" + Zion.util.encodeParam(params);
		} else {
			return ZionSetting.report.url + "/" + Zion.token + "/" + alias;
		}
	};
	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Report = Report;
	window.Zion.report = new Report();
})();