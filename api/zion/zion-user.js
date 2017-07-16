(function() {
	function User() {
		this.user_id = '';
		this.user_name = '';
		this.status = '';
		this.corp_id = '';
		this.corp_name = '';
		this.system_name = '';
		this.system_copyright = '';
		this.tree = {};
	}

	User.prototype.getInfo = function(callback, scope) {
		Zion.util.getJSON(ZionSetting.db.url + '/' + Zion.token + '/user_info', function(data) {
			if ((data) && (data.r)) {
				var info = data.r[0];
				this.user_id = info[0];
				this.user_name = info[1];
				this.status = info[2];
				this.corp_id = info[3];
				this.corp_name = info[4];
				this.system_name = info[5];
				this.system_copyright = info[6];
				if (callback) {
					callback.call(scope || window, true, this);
				}
			} else {
				if (callback) {
					callback.call(scope || window, false);
				}
			}
		}, this);
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.User = User;
	window.Zion.user = new User();
})();