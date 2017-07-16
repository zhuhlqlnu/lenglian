(function() {
	function Auth(opts) {
		if (!opts) {
			opts = ZionSetting.auth;
		}
		this.isLogin = false;
		this.auth_base = opts.url;
		this.token_anonymous = opts.token;
		this.token = opts.token_anonymous;
	}

	Auth.prototype.login = function(user, pass, callback, scope) {
		Zion.util.getJSON(ZionSetting.auth.url + '/login/' + Zion.util.encodeParam( [ user, pass ]), function(data) {
			if ((data) && (data.r)) {
				this.isLogin = true;
				window.Zion.token = data.r;
				this.token = data.r;
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

	Auth.prototype.logout = function(callback, scope) {
		Zion.util.getJSON(ZionSetting.auth.url + '/logout/' + Zion.util.encodeParam( [ this.token ]), function(data) {
			this.token = this.token_anonymous;
			window.Zion.token = this.token;
			if (callback) {
				callback.call(scope || window);
			}
		}, this);
	};

	Auth.prototype.onAuthFailed = function() {
		// alert("authFailed");
	};

	Auth.prototype.authFailed = function() {
		this.onAuthFailed();
	};

	Auth.prototype.onNetworkError = function() {
		// alert("networkError");
	};

	Auth.prototype.networkError = function() {
		this.onNetworkError();
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Auth = Auth;
	window.Zion.auth = new Auth();
})();