(function() {
	function Push(type, target, callback, scope) {
		this.isRuning = false;
		this.url = ZionSetting.push.url + "/" + Zion.token + "/";
		if (Object.prototype.toString.apply(type) === '[object Array]') {
			this.url += Zion.util.encodeParam(type);
		} else {
			this.url += type;
		}

		if (!(Object.prototype.toString.apply(target) === '[object Array]')) {
			target = [ target ];
		}

		this.url += ("/" + Zion.util.encodeParam(target));
		this.callback = callback;
		this.scope = scope;
	}

	Push.prototype.nextRequest = function() {
		var this_ = this;
		Zion.util.getJSON(this.url, function(data) {
			if (this.isRuning) {
				this.callback.call(this.scope || window, data);
				this.nextRequest();
			}
		}, this).error(function() {
			if (this_.isRuning) {
				setTimeout(function(){this_.nextRequest()}, 30000);
			}
		});
	};

	Push.prototype.start = function() {
		this.isRuning = true;
		this.nextRequest();
	}

	Push.prototype.stop = function() {
		this.isRuning = false;
	}

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Push = Push;
})();