(function() {
	var base_url = "";
	//var tiles_url = 'http://182.50.0.148/tiles';
	var tiles_url = 'http://202.8.157.11/tiles/';
	if (!ZionSetting) {
		ZionSetting = {};
	}

	ZionSetting.map = {
		base_url : base_url,
		tiles_url : tiles_url,
		minZoomLevel : 0,
		maxZoomLevel : 17
	};

	function Script(src) {
		document.write('<script src="' + src + '" type="text/javascript" charset="utf-8"></script>');
	}

	Script(base_url + '/api/map/maps-google.js');
	Script(base_url + '/api/map/maps-target.js');
	Script(base_url + '/api/map/maps-polyline.js');
	Script(base_url + '/api/map/maps-polygon.js');
	Script(base_url + '/api/map/maps-poi.js');
	Script(base_url + '/api/map/maps_rule.js');
	Script(base_url + '/api/map/maps-overlay-point.js');
	Script(base_url + '/api/map/PolylineEncoder.js');

})();