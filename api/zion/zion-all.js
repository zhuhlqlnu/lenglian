(function() {
	var base_url = "";
	var zion_base_url = "";
	
	var map_tiles_url = 'http://182.50.0.148/tiles';

	function Script(src) {
		document.write('<script src="' + src + '" type="text/javascript" charset="utf-8"></script>');
	}

	if (typeof ZionSetting === "undefined") {
		ZionSetting = {};
	}

	ZionSetting.auth = {
		url : zion_base_url + '/auth',
		token : '00000000000000000000000000000000'
	};

	ZionSetting.db = {
		url : zion_base_url + '/db'
	};

	ZionSetting.buf = {
		url : zion_base_url + '/buf'
	};

	ZionSetting.report = {
		url : zion_base_url + '/report'
	};

	ZionSetting.target = {
		image : base_url + '/api/image'
	};

	ZionSetting.configure = {
		url : zion_base_url + '/configure'
	};

	ZionSetting.track = {
		url : zion_base_url + '/track'
	};

	ZionSetting.send = {
		url : zion_base_url + '/send'
	};

	ZionSetting.push = {
		url : zion_base_url + '/push'
	};

	ZionSetting.develop = {};
	ZionSetting.develop.db = {
		url : zion_base_url + '/develop/db'
	};

	Script(base_url + '/api/jquery-1.5.1.min.js');
	Script(base_url + '/api/jquery.rotate.js');
	Script(base_url + '/api/zion/zion-auth.js');
	Script(base_url + '/api/zion/zion-util.js');
	Script(base_url + '/api/zion/zion-db.js');
	Script(base_url + '/api/zion/zion-json.js');
	Script(base_url + '/api/zion/zion-user.js');
	Script(base_url + '/api/zion/zion-report.js');
	Script(base_url + '/api/zion/zion-configure.js');
	Script(base_url + '/api/zion/zion-develop-db.js');
	Script(base_url + '/api/zion/zion-track.js');
	Script(base_url + '/api/zion/zion-send.js');
	Script(base_url + '/api/zion/zion-push.js');
})();
