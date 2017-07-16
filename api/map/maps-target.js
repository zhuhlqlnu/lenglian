(function() {
	function Target(map, moveUpdate, intervalUpdate, opts) {
		TargetMarker = function(latlng, opt_opts) {
			GMarker.apply(this, arguments);
			this.opts_ = opt_opts;
		}

		TargetMarker.prototype = new GMarker(new GLatLng(0, 0));

		TargetMarker.prototype.initialize = function(map) {
			GMarker.prototype.initialize.apply(this, arguments);
			this.div_ = document.createElement("div");
			this.div_.style.position = "absolute";
			this.div_.style.display = "block";
			this.div_.style.textAlign = "center";
			if (this.opts_.merge == true) {
				this.div_.title = this.opts_.title;
				this.div_.style.width = 60 + "px";
				this.div_.innerHTML = "<span style='font-size:12px;background-color:none'>" + this.opts_.text + "</span>";
			} else {
				this.div_.style.width = 100 + "px";
				this.div_.innerHTML = "<span style='font-size:12px;background-color:#E6E6E6'>" + this.opts_.text + "</span>";
			}
			this.map_ = map;
			map.getPane(G_MAP_MARKER_PANE).appendChild(this.div_);

			if (this.opts_.flash) {
				this.img_d = document.createElement("img");
				this.img_d.src = this.opts_.imageBase + "d/0.png";
				this.img_d.style.position = "absolute";
				this.img_step = 0;
				var this_ = this;
				this.img_interval = setInterval(function() {
					this_.img_step++;
					if (this_.img_step >= this_.opts_.flashFrame) {
						this_.img_d.parentNode.removeChild(this_.img_d);
						this_.img_d = null;
						clearInterval(this_.img_interval);
						this_.img_interval = null;
					} else {
						this_.img_d.src = this_.opts_.imageBase + "d/" + this_.img_step + ".png";
					}
				}, 200);
				map.getPane(G_MAP_MARKER_PANE).appendChild(this.img_d);
			}
		};

		TargetMarker.prototype.redraw = function(force) {
			if (force) {
				GMarker.prototype.redraw.apply(this, arguments);
				var p = this.map_.fromLatLngToDivPixel(this.getLatLng());
				var z = GOverlay.getZIndex(this.getLatLng().lat());

				if (this.opts_.merge == true) {
					this.div_.style.left = (p.x - 30) + "px";
					this.div_.style.top = (p.y - 7) + "px";
				} else {
					this.div_.style.left = (p.x - 50) + "px";
					this.div_.style.top = (p.y + this.getIcon().iconSize.height / 2) + "px";
				}

				if (this.img_d) {
					this.img_d.style.left = (p.x - this.opts_.flashSize / 2) + "px";
					this.img_d.style.top = (p.y - this.opts_.flashSize / 2) + "px";
					this.img_d.style.zIndex = z - 1;
				}
				this.div_.style.zIndex = z;
			}
		};

		TargetMarker.prototype.remove_ = function() {
			GEvent.clearInstanceListeners(this.div_);
			if (this.div_.outerHTML) {
				this.div_.outerHTML = "";
			}

			if (this.div_.parentNode) {
				this.div_.parentNode.removeChild(this.div_);
			}

			if (this.img_interval) {
				clearInterval(this.img_interval);
				this.img_interval = null;
			}

			if (this.img_d) {
				this.img_d.parentNode.removeChild(this.img_d);
				this.img_d = null;
			}

			this.opts_ = null;
			this.div_ = null;

			GMarker.prototype.remove.apply(this, arguments);
		};

		TargetMarker.prototype.remove = function() {

		};

		TargetMarker.prototype.copy = function() {
			var newMarker = new TargetMarker(this.getLatLng(), this.opts_);
			return newMarker;
		};

		this.merge_zoom = 12;
		this.interval_time = 10000;
		this.check_error_time = 50000;
		this.map = map;
		this.markers = {};
		this.check_error = null;
		this.interval = null;
		this.targets = {};
		this.tracks = {};
		this.openedInfoWindow = false;
		this.openedInfoKey = null;

		this.icon_size = 26;
		this.icon_head = true;
		this.merge_size = 44;
		this.flash_size = 56;
		this.flash_frame = 3;
		this.icon_type = "target";
		this.opts = opts;

		if (opts) {
			if (opts.iconSize) {
				this.icon_size = opts.iconSize;
			}

			if (opts.iconHead == false) {
				this.icon_head = opts.iconHead;
			}

			if (opts.mergeSize) {
				this.merge_size = opts.mergeSize;
			}

			if (opts.iconType) {
				this.icon_type = opts.iconType;
			}

			if (opts.flashSize) {
				this.flash_size = opts.flashSize;
			}

			if (opts.flashFrame) {
				this.flash_frame = opts.flashFrame;
			}
		}

		if (opts.onclick) {
			this.onclick = opts.onclick;
		} else {
			this.onclick = function() {
			};
		}
		if (opts.onupdated) {
			this.onupdated = opts.onupdated;
		} else {
			this.onupdated = function() {
			};
		}
		
		if(opts.get_target_icon){
			this.get_target_icon = opts.get_target_icon;
		}else{
			this.get_target_icon = function(this_, track){
				return this_.image_base + ((this_.icon_head) ? ((track.s & 0x0f) + "/" + parseInt(track.h / 10)) : (track.s & 0x0f)) + ".png";
			};
		}

		this.image_base = ZionSetting.target.image + "/" + this.icon_type + "/" + this.icon_size + "/";
		this.buf_base = function() {
			return ZionSetting.buf.url + "/" + Zion.token + "/" + opts.application;
		};

		this.icon_base = new GIcon();
		this.icon_base.iconSize = new GSize(this.icon_size, this.icon_size);
		this.icon_base.iconAnchor = new GPoint(this.icon_size / 2, this.icon_size / 2);

		this.merge_base = new GIcon();
		this.merge_base.iconSize = new GSize(this.merge_size, this.merge_size);
		this.merge_base.iconAnchor = new GPoint(this.merge_size / 2, this.merge_size / 2);

		this.moveUpdate(moveUpdate);
		this.intervalUpdate(intervalUpdate);

		if (moveUpdate || intervalUpdate) {
			this.update();
		}
	}

	Target.prototype.setOptions = function(opts) {
		this.opts = opts;
	};

	Target.prototype.findTargets = function(name, callback) {
		var result = [];
		for ( var e in this.targets) {
			if (this.targets[e].n.toUpperCase().indexOf(name.toUpperCase()) >= 0) {
				result.push(this.targets[e]);
			}
		}
		callback(result);
	};

	Target.prototype.getTargets = function(callback) {
		var this_ = this;
		var uri = this.buf_base() + ".targets?callback=?";
		$.getJSON(uri, function(data, textStatus) {
			if ((data == null) || data.f) {
				this_.authFailed();
				return;
			}
			data.r.sort(function(a, b) {
				return (a.n < b.n) ? -1 : 1;
			});

			this_.targets = {};
			for ( var e in data.r) {
				this_.targets[data.r[e].k] = data.r[e];
			}
			callback(data.r);
		});
	};

	Target.prototype.closeInfoWindow = function() {
		if (this.openedInfoWindow) {
			this.map.closeInfoWindow();
			this.openedInfoWindow = false;
		}
	};

	Target.prototype.openInfoWindow = function(key) {
		if (this.tracks[key]) {
			var latlng = new GLatLng(this.tracks[key].y, this.tracks[key].x);
			var infoHtml = "<b>名称:</b>" + this.tracks[key].n;
			infoHtml += ("<br/><b>时间:</b>" + (new Date(this.tracks[key].t * 1000)).toLocaleString()) + "(最后更新)";
			infoHtml += ("<br/><b>经度:</b>" + latlng.lng() + "(度)");
			infoHtml += ("<br/><b>纬度:</b>" + latlng.lat() + "(度)");
			infoHtml += ("<br/><b>方向:</b>" + this.tracks[key].h + "(度)");
			infoHtml += ("<br/><b>速度:</b>" + this.tracks[key].p + "(公里/小时)");
			if (this.tracks[key].alt) {
				infoHtml += ("<br/><b>高程:</b>" + this.tracks[key].alt + "(米)");
			}
			infoHtml += ("<br/><b>状态:</b>" + [ "正常", "休眠", "警告", "报警" ][this.tracks[key].s & 0x0f]);
			if (this.tracks[key].temp) {
				infoHtml += ("<br/><b>温度:</b>" + this.tracks[key].temp + "(度)");
			}
			if (this.tracks[key].pd) {
				infoHtml += ("<br/><b>位置:</b>" + this.tracks[key].pd);
			}
			
			infoHtml += ("<br/><b>详细信息:</b>" + this.tracks[key].tsd);
			
			var options = {
				onCloseFn : GEvent.callback(this, function() {
					this.openedInfoWindow = false;
				}),
				onOpenFn : GEvent.callback(this, function() {
					this.openedInfoWindow = true;
				})
			};
			var map = this.map;
			this.openedInfoWindow = true;
			this.openedInfoKey = key;
			if(this.tracks[key].ti == "data.collection"){
				var memo = ""+key;
				Zion.db.getJSON('pipe.data.point.last_data.by_memo.select',[memo],function(data){
					if(data.r){
						if(data.r == "" || data.r == null){
							//infoHtml += "</br><b>图片：</b><a href='#' onclick='show_location_win("+key+")'>查看</a>";
							var image_tab = new GInfoWindowTab("图片" , "<div><img style='width:150px; ' src=\"/uploaded/collection/" + key + ".jpg\" /></div>");
						}else{
							var data_value = data.r;
							if(data_value.length == 1){
								var img_id = data.r[0][0];
								var img_date = data.r[0][2];
								//infoHtml += "</br><b>图片：</b><a href='#' onclick='show_location_win("+img_id+",\""+img_date+"\",0,0,false)'>查看</a>";
								var image_tab = new GInfoWindowTab("图片" , "<table border=0 cellspacing=0 cellpadding=0>"+
								"<tr><td><img style='width:150px; ' src=\"/uploaded/collection/" + key + ".jpg\" /></td><td width='10'></td><td><img width='150' src='/uploaded/visitator/facilities/"+img_id+".jpg'/></td></tr>"+
								"<tr><td><div align='center'><b>原始图片</b></div></td><td width='10'></td><td><div align='center'><b>最近日期："+img_date+"</b></div></td> </tr>"+
								"</table>");
							}else{
								var img_id = data.r[0][0];
								var img_date = data.r[0][2];
								var img_next_id = data.r[1][0];
								var img_next_date = data.r[1][2];
								//infoHtml += "</br><b>图片：</b><a href='#' onclick='show_location_win("+img_id+",\""+img_date+"\","+img_next_id+",\""+img_next_date+"\",true)'>查看</a>";
								var image_tab = new GInfoWindowTab("图片" , "<table border=0 cellspacing=0 cellpadding=0>"+
								"<tr><td><img width='150' src='/uploaded/visitator/facilities/"+img_next_id+".jpg'/></td><td width='10'></td><td><img width='150' src='/uploaded/visitator/facilities/"+img_id+".jpg'/></td></tr>"+
								"<tr><td><div align='center'><b>比较日期："+img_next_date+"</b></div></td><td width='10'></td><td><div align='center'><b>最近日期："+img_date+"</b></div></td> </tr>"+
								"</table>");
							}
						}	
					}
					
					map.openInfoWindowTabsHtml(latlng,[new GInfoWindowTab("信息" , infoHtml), image_tab]);
				});
				
			}else{
				this.map.openInfoWindowHtml(latlng, infoHtml, options);
			}

		} else {
			if (this.openedInfoWindow) {
				this.map.closeInfoWindow();
				this.openedInfoWindow = false;
			}
		}
	};

	Target.prototype.moveToTarget = function(key, infoWindow) {
		if (this.tracks[key]) {
			var latlng = new GLatLng(this.tracks[key].y, this.tracks[key].x);
			if (this.map.getZoom() >= this.merge_zoom) {
				this.map.setCenter(latlng);
			} else {
				this.map.setCenter(latlng, this.merge_zoom);
			}
			if (infoWindow) {
				this.openInfoWindow(key);
			}
		} else {
			var this_ = this;
			var uri = this.buf_base() + ".target/[" + key + "]?callback=?";
			$.getJSON(uri, function(data, textStatus) {
				if ((data == null) || data.f) {
					this_.authFailed();
					return;
				}
				if (data.r.v) {
					var latlng = new GLatLng(data.r.v.y, data.r.v.x);
					if (this_.map.getZoom() >= this_.merge_zoom) {
						this_.map.setCenter(latlng);
					} else {
						this_.map.setCenter(latlng, this_.merge_zoom);
					}
					this_.tracks[data.r.v.k] = data.r.v;
					if (infoWindow) {
						this_.openInfoWindow(key);
					}
				}
			});
		}
	};

	Target.prototype.moveUpdate = function(b) {
		if (this.moveend_event) {
			GEvent.removeListener(this.moveend_event);
			this.moveend_event = null;
		}

		if (b) {
			this.moveend_event = GEvent.addListener(this.map, "moveend", GEvent.callback(this, this.update));
		}
	};

	Target.prototype.intervalUpdate = function(b) {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}

		if (this.dragstart_event) {
			GEvent.removeListener(this.dragstart_event);
			this.dragstart_event = null;
		}

		if (b) {
			this.interval = setInterval(GEvent.callbackArgs(this, this.update, true), this.interval_time);
			this.dragstart_event = GEvent.addListener(this.map, "move", GEvent.callback(this, this.restartIntervalUpdate));
		}
	};

	Target.prototype.restartIntervalUpdate = function() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = setInterval(GEvent.callbackArgs(this, this.update, true), this.interval_time);
		}
	};

	Target.prototype.clear = function() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = setInterval(GEvent.callbackArgs(this, this.update, true), this.interval_time);
		}

		if (this.check_error) {
			clearTimeout(this.check_error);
			this.check_error = null;
		}

		for ( var e in this.markers) {
			this.map.removeOverlay(this.markers[e]);
			this.markers[e].remove_();
			this.markers[e] = null;
		}
		this.markers = {};
	};

	Target.prototype.authFailed = function() {
		this.moveUpdate(false);
		this.intervalUpdate(false);
		Zion.auth.authFailed();
	};

	Target.prototype.networkError = function() {
		this.moveUpdate(false);
		this.intervalUpdate(false);
		Zion.auth.networkError();
	};

	Target.prototype.stop = function() {
		this.clear();
		this.moveUpdate(false);
		this.intervalUpdate(false);
	};

	Target.prototype.getName = function(key) {
		if (this.targets[key]) {
			return this.targets[key].n;
		} else {
			return key;
		}
	};

	Target.prototype.update = function(auto) {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = setInterval(GEvent.callbackArgs(this, this.update, true), this.interval_time);
		}

		if (this.check_error == null) {
			this.check_error = setTimeout(GEvent.callback(this, this.networkError), this.check_error_time);
		}

		var map = this.map;
		var this_ = this;

		var bounds = map.getBounds();
		var uri;
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		var proj = map.getCurrentMapType().getProjection();
		var geo_point = new GLatLng(map.getCenter().lat(), 0);
		var map_point = proj.fromLatLngToPixel(geo_point, map.getZoom());
		map_point.x += 40;
		var geo_point = proj.fromPixelToLatLng(map_point, map.getZoom());
		var dx = geo_point.lng();
		var dy = dx;

		if (map.getZoom() < this.merge_zoom) {
			if (sw.lng() > ne.lng()) {
				uri = this.buf_base() + ".merge2/[" + sw.lng() + ";-180,180;" + ne.lng() + "," + sw.lat() + ";" + sw.lat() + "," + ne.lat() + ";" + ne.lat();
			} else {
				uri = this.buf_base() + ".merge/[" + sw.lng() + "," + ne.lng() + "," + sw.lat() + "," + ne.lat();
			}
			uri += ("," + dx + "," + dy + "]");
			$.getJSON(uri + "?callback=?", function(data, textStatus) {
				if ((data == null) || data.f) {
					this_.authFailed();
					return;
				}
				var old_tracks = this_.tracks;
				this_.tracks = {};
				this_.clear();

				for ( var p = 0; p < data.r.length; p++) {
					this_.tracks[data.r[p].b.k] = data.r[p].b;
					var latlng = new GLatLng(data.r[p].b.y, data.r[p].b.x);
					var targetIcon;
					var markerOptions;
					var marker;
					if (data.r[p].c == undefined) {
						var targetIcon = new GIcon(this_.icon_base);
						targetIcon.image = this_.get_target_icon(this_, data.r[p].b);
						var text = data.r[p].b.n;
						var markerOptions = {
							icon : targetIcon,
							title : text,
							text : text,
							merge : false,
							clickable : true
						};
						if (auto) {
							markerOptions.flash = ((!old_tracks) || (!old_tracks[data.r[p].b.k]) || (old_tracks[data.r[p].b.k].t < data.r[p].b.t))
						} else {
							markerOptions.flash = ((old_tracks) && (old_tracks[data.r[p].b.k]) && (old_tracks[data.r[p].b.k].t < data.r[p].b.t))
						}

						if (markerOptions.flash) {
							markerOptions.imageBase = this_.image_base;
							markerOptions.flashFrame = this_.flash_frame;
							markerOptions.flashSize = this_.flash_size;
						}

						marker = new TargetMarker(latlng, markerOptions);

						GEvent.addListener(marker, "click", GEvent.callbackArgs(this_, this_.onclick, data.r[p].b.k, latlng));
					} else {
						var targetIcon = new GIcon(this_.merge_base);
						targetIcon.image = this_.image_base + "m/" + data.r[p].c.toString().length + ".png";
						var title = "";
						if (data.r[p].c > (data.r[p].m.length + 1)) {
							title += (data.r[p].c + "|");
						}
						title += this_.getName(data.r[p].b.k);
						for ( var i = 0; i < data.r[p].m.length; i++) {
							title += ("," + this_.getName(data.r[p].m[i]));
						}
						if (data.r[p].c > (data.r[p].m.length + 1)) {
							title += ",...";
						}
						var markerOptions = {
							icon : targetIcon,
							text : data.r[p].c,
							merge : true,
							title : title,
							clickable : false
						};
						marker = new TargetMarker(latlng, markerOptions);
					}
					map.addOverlay(marker);
					this_.markers[data.r[p].b.k] = marker;
				}
				if (this_.openedInfoWindow) {
					this_.openInfoWindow(this_.openedInfoKey);
				}
				old_tracks = null;
				this_.onupdated(this_);
			});
		} else {
			if (sw.lng() > ne.lng()) {
				uri = this_.buf_base() + ".rect2/[" + sw.lng() + ";-180,180;" + ne.lng() + "," + sw.lat() + ";" + sw.lat() + "," + ne.lat() + ";" + ne.lat() + "]";
			} else {
				uri = this_.buf_base() + ".rect/[" + sw.lng() + "," + ne.lng() + "," + sw.lat() + "," + ne.lat() + "]";
			}
			$.getJSON(uri + "?callback=?", function(data, textStatus) {
				if ((data == null) || data.f) {
					this_.authFailed();
					return;
				}
				var old_tracks = this_.tracks;
				this_.tracks = {};
				this_.clear();
				for ( var p = 0; p < data.r.length; p++) {
					this_.tracks[data.r[p].k] = data.r[p];
					var latlng = new GLatLng(data.r[p].y, data.r[p].x);
					var targetIcon = new GIcon(this_.icon_base);
					targetIcon.image = this_.get_target_icon(this_, data.r[p]);
					var text = data.r[p].n;
					var markerOptions = {
						icon : targetIcon,
						title : text,
						text : text,
						clickable : true
					};
					if (auto) {
						markerOptions.flash = ((!old_tracks) || (!old_tracks[data.r[p].k]) || (old_tracks[data.r[p].k].t < data.r[p].t))
					} else {
						markerOptions.flash = ((old_tracks) && (old_tracks[data.r[p].k]) && (old_tracks[data.r[p].k].t < data.r[p].t))
					}

					if (markerOptions.flash) {
						markerOptions.imageBase = this_.image_base;
						markerOptions.flashFrame = this_.flash_frame;
						markerOptions.flashSize = this_.flash_size;
					}

					var marker = new TargetMarker(latlng, markerOptions);
					GEvent.addListener(marker, "click", GEvent.callbackArgs(this_, this_.onclick, data.r[p].k, latlng));

					map.addOverlay(marker);
					this_.markers[data.r[p].k] = marker;
				}
				if (this_.openedInfoWindow) {
					this_.openInfoWindow(this_.openedInfoKey);
				}
				old_tracks = null;
				this_.onupdated(this_);
			});
		}
	};
	
	function show_location_win(img_near_id,img_date,img_next_id,img_next_date,is_have_two){
		var path;
		var width;
		if(is_have_two){
			width = 823;
			path = "<table border=0 cellspacing=0 cellpadding=0>"+
			"<tr><td><img width='400' height='400' src='/uploaded/visitator/facilities/"+img_next_id+".jpg'/></td><td width='10'></td><td><img width='400' height='400' src='/uploaded/visitator/facilities/"+img_near_id+".jpg'/></td></tr>"+
			"<tr><td><div align='center'><b>比较日期："+img_next_date+"</b></div></td><td width='10'></td><td><div align='center'><b>最近日期："+img_date+"</b></div></td> </tr>"+
			"</table>";
		}else{
			width = 400;
			if(img_date == undefined){
				path = "<div><img style='width:100%; height:100%;' src=\"/uploaded/collection/" + img_near_id + ".jpg\" /></div>";
			}else{
				path = "<div><img width='400' height='400'src='/uploaded/visitator/facilities/"+img_near_id+".jpg'/></div><div align='center'><b>最近日期："+img_date+"</b></div>";
			}
		}
		var panel = new Ext.Panel({
			 html:path
		 })
		var win  = new Ext.Window({
			 xtype:'window',
			 id:'window',
			 title: '图片',
			 width:width,
			 buttonAlign : 'right',
			 closable:true,
			 constrainHeader:true,  
			 layout:'fit',
			/* html:'<span><img width=200 height=200 src="images/11.jpg"/></span>'+
				 '<div><div align="center"><input type="button" value="点击查看原图" onclick="show_original(win)"></div></div>'*/
			 items:[panel],
			 buttons : [ {
				id : 'select',
				text : '关闭',
				handler : function() {
					Ext.getCmp('window').close();
				}
			}]
		 }) 
		 win.show();
	}

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Target = Target;
	window.show_location_win = show_location_win;
})();
