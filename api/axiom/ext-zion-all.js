Ext.ns('Ext.zion');
Ext.ns('Ext.zion.db');

Ext.zion = {
	getToken : function() {
		var request = {
			QueryString : function(val) {
				var uri = window.location.search;
				var re = new RegExp("" + val + "=([^&?]*)", "ig");
				return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
			}
		};
		return request.QueryString("token");
	}
};

Ext.zion.db = {
	buildUrl : function(alias, params) {
		if (Ext.isEmpty(params)) {
			return ZionSetting.db.url + "/" + Zion.token + "/" + alias;
		} else {
			return ZionSetting.db.url + "/" + Zion.token + "/" + alias + "/" + encodeURIComponent(Ext.util.JSON.encode(params));
		}
	},
	getJSON : function(alias, params, callback, scope) {
		var proxy = new Ext.zion.db.ScriptTagProxy( {
			url : Ext.zion.db.buildUrl(alias, params)
		});
		var reader = {
			readRecords : function(response) {
				var result = {
					data : response,
					success : true
				};
				return result;
			}
		};
		proxy.doRequest("read", null, null, reader, function(result) {
			if (!Ext.isEmpty(callback)) {
				callback.call(scope || window, result.data, result.success);
			}
		}, this, null);
	},
	ScriptTagProxy : Ext.extend(Ext.data.ScriptTagProxy, {
		constructor : function(config) {
			Ext.zion.db.ScriptTagProxy.superclass.constructor.call(this, config);
		},
		doRequest : function(action, rs, params, reader, callback, scope, arg) {
			var p = Ext.urlEncode(Ext.apply(params, this.extraParams));

			var url = this.buildUrl(action, rs);
			if (!url) {
				throw new Ext.data.Api.Error('invalid-url', url);
			}

			if (!Ext.isEmpty(params) && !Ext.isEmpty(params.start) && !Ext.isEmpty(params.limit)) {
				var paramPage = [];

				if (!Ext.isEmpty(this.db.params)) {
					for ( var i = 0; i < this.db.params.length; i++) {
						paramPage.push(this.db.params[i]);
					}
				}
				paramPage.push(params.start + 1);
				paramPage.push(params.start + params.limit);
				url += ".page/" + encodeURIComponent(Ext.util.JSON.encode(paramPage));
			} else {
				url = Ext.urlAppend(url, p);
			}
			if (this.nocache) {
				url = Ext.urlAppend(url, '_dc=' + (new Date().getTime()));
			}
			var transId = ++Ext.data.ScriptTagProxy.TRANS_ID;
			var trans = {
				id : transId,
				action : action,
				cb : "stcCallback" + transId,
				scriptId : "stcScript" + transId,
				params : params,
				arg : arg,
				url : url,
				callback : callback,
				scope : scope,
				reader : reader
			};
			window[trans.cb] = this.createCallback(action, rs, trans);
			url += String.format("&{0}={1}", this.callbackParam, trans.cb);
			if (this.autoAbort !== false) {
				this.abort();
			}

			trans.timeoutId = this.handleFailure.defer(this.timeout, this, [ trans ]);

			var script = document.createElement("script");
			script.setAttribute("src", url);
			script.setAttribute("type", "text/javascript");
			script.setAttribute("id", trans.scriptId);
			this.head.appendChild(script);

			this.trans = trans;
		}
	}),
	ArrayStore : Ext.extend(Ext.data.ArrayStore, {
		constructor : function(config) {
			this.db = config.db;
			config = config || {};
			Ext.zion.db.ArrayStore.superclass.constructor.call(this, config);
			this.proxy = new Ext.zion.db.ScriptTagProxy( {
				url : Ext.zion.db.buildUrl(config.db.alias),
				db : {
					params : config.db.params
				}
			});
		},
		dbTotalCount : 0,
		load : function(options) {
			Ext.zion.db.getJSON(this.db.alias + ".count", this.db.params, function(result) {
				this.dbTotalCount = result.r[0][0];
				Ext.zion.db.ArrayStore.superclass.load.call(this, options);
			}, this);
		},
		getTotalCount : function() {
			return this.dbTotalCount;
		}
	})
};
Ext.zion.page = {
	limit : 20
};
Ext.zion.form = {
	getParams : function(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	},
	disable : function(form, feilds) {
		for ( var i = 0; i < feilds.length; i++) {
			form.getForm().findField(feilds[i]).disable();
		}
	}
};

Ext.form.Field.prototype.msgTarget = 'side';
Ext.form.Field.prototype.width = 230;

Ext.form.TextArea.height = 80;
Ext.apply(Ext.FormPanel.prototype, {
	labelWidth : 80,
	autoHeight : true,
	autoWidth : true,
	bodyStyle : 'padding:5px 25px 5px 5px',
	frame : true
});

Ext.apply(Ext.Window.prototype, {
	autoHeight : true,
	modal : true,
	layout : 'fit',
	//autoWidth : true,
	resizable : false,
	constrainHeader : true,
	buttonAlign : 'right'
});

Ext.form.NumberField.prototype.width = 30;

(function() {
	var show = Ext.Window.prototype.show;
	Ext.Window.prototype.show = function(animateTarget, cb, scope) {
		show.call(this, animateTarget, cb, scope);
		// alert(Ext.util.JSON.encode(this.getResizeEl()));

		// this.autoWidth = false;
		// this.syncSize();
		//this.autoWidth = true;
		//this.syncSize();
		this.autoWidth = false;
		this.setWidth(this.getResizeEl().getWidth());
		this.disable();
		this.enable();
		//alert(this.getResizeEl().dom.style.width);
		// alert(Ext.util.JSON.encode(this.getResizeEl()));
	};
})();

Ext.override(Ext.form.RadioGroup, {
	getName : function() {
		return this.items.first().name;
	},
	getValue : function() {
		var v;
		if (this.rendered) {
			this.items.each(function(item) {
				if (!item.getValue())
					return true;
				v = item.getRawValue();
				return false;
			});
		} else {
			for ( var k in this.items) {
				if (this.items[k].checked) {
					v = this.items[k].inputValue;
					break;
				}
			}
		}
		return v;
	},
	setValue : function(v) {
		if (this.rendered)
			this.items.each(function(item) {
				item.setValue(item.getRawValue() == v);
			});
		else {
			for ( var k in this.items) {
				this.items[k].checked = this.items[k].inputValue == v;
			}
		}
	}
});

Ext.override(Ext.EventObjectImpl, {
    getTarget : function(selector, maxDepth, returnEl){
        var targetElement;

        try {
            targetElement = selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : this.target;
        } catch(e) {
            targetElement = this.target;
        }

        return targetElement;
    }
});


Ext.BLANK_IMAGE_URL = "/api/ext/resources/images/default/s.gif";
Ext.zion.image_base = "/image/module";
Ext.zion.token = Ext.zion.getToken();
