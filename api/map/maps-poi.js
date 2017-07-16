(function() {
	function POI(map, opts) {
		var POIMarker = function(latlng, opt_opts) {
			GMarker.apply(this, arguments);
			this.opts_ = opt_opts;
		}

		POIMarker.prototype = new GMarker(new GLatLng(0, 0));

		POIMarker.prototype.initialize = function(map) {
			GMarker.prototype.initialize.apply(this, arguments);
			this.div_ = document.createElement("div");
			this.div_.style.position = "absolute";
			this.div_.style.display = "block";
			this.div_.style.textAlign = "center";
			this.div_.style.width = 100 + "px";
			this.div_.innerHTML = "<span style='font-size:12px;background-color:#E6E6E6'>" + this.opts_.text + "</span>";
			this.map_ = map;
			map.getPane(G_MAP_MARKER_PANE).appendChild(this.div_);
		};

		POIMarker.prototype.redraw = function(force) {
			if (force) {
				GMarker.prototype.redraw.apply(this, arguments);
				var p = this.map_.fromLatLngToDivPixel(this.getLatLng());
				var z = GOverlay.getZIndex(this.getLatLng().lat());
				this.div_.style.left = (p.x - 50) + "px";
				this.div_.style.top = (p.y + this.getIcon().iconSize.height / 2) + "px";
				this.div_.style.zIndex = z;
			}
		};

		POIMarker.prototype.remove_ = function() {
			GEvent.clearInstanceListeners(this.div_);
			if (this.div_.outerHTML) {
				this.div_.outerHTML = "";
			}

			if (this.div_.parentNode) {
				this.div_.parentNode.removeChild(this.div_);
			}

			this.opts_ = null;
			this.div_ = null;

			GMarker.prototype.remove.apply(this, arguments);
		};

		POIMarker.prototype.remove = function() {

		};

		POIMarker.prototype.copy = function() {
			var newMarker = new POIMarker(this.getLatLng(), this.opts_);
			return newMarker;
		};

		this.opts = opts;
		this.map = map;
		this.image_base = opts.image_base + "/";

		this.icon_base = new GIcon();
		this.icon_base.iconSize = new GSize(this.opts.icon_size, this.opts.icon_size);
		this.icon_base.iconAnchor = new GPoint(this.opts.icon_size / 2, this.opts.icon_size / 2);

		if (opts.onclick) {
			this.onclick = opts.onclick;
		} else {
			this.onclick = function(key) {
				this.openInfoWindow(key);
			};
		}

		POI.prototype.openInfoWindow = function(key) {
			if (this.pois[key]) {
				var poi = this.pois[key];
				var latlng = new GLatLng(poi.y, poi.x);
				var infoHtml;
				infoHtml = "<b>名称:</b>" + poi.text;
				infoHtml += "<br/><b>类型名称:</b>" + poi.type_name;
				infoHtml += "<br/><b>信息:</b>" + poi.memo;
				Zion.db.getJSON('pipe.data.point.last_data.select',[key],function(data){
					if(data.r && data.r!=""){
						var data_value = data.r;

						if(data_value.length == 1){
							var img_id = data.r[0][0];
							var img_date = data.r[0][2];
							infoHtml += "</br><b>图片：</b><a href='#' onclick='show_win("+img_id+",\""+img_date+"\",0,0,false)'>查看</a>";
							//var image_tab = new GInfoWindowTab("设施最近图片" , "<img src=\"/uploaded/visitator/facilities/" + img_id + ".jpg\" />");
							//map.openInfoWindowTabsHtml(latlng,[new GInfoWindowTab("信息" , infoHtml), image_tab]);
						
						}else{
							var img_id = data.r[0][0];
							var img_date = data.r[0][2];
							var img_next_id = data.r[1][0];
							var img_next_date = data.r[1][2];
							infoHtml += "</br><b>图片：</b><a href='#' onclick='show_win("+img_id+",\""+img_date+"\","+img_next_id+",\""+img_next_date+"\",true)'>查看</a>";
						}
						map.openInfoWindowHtml(latlng, infoHtml);
					}else{
						map.openInfoWindowHtml(latlng, infoHtml);
					}
				});
			}
		};

		POI.prototype.clear = function() {
			for ( var e in this.markers) {
				this.map.removeOverlay(this.markers[e]);
				this.markers[e].remove_();
				this.markers[e] = null;
			}
			this.markers = {};
		};

		POI.prototype.draw = function(pois) {
			this.clear();
			this.pois = {};
			for ( var i = 0; i < pois.length; i++) {
				var poi = pois[i];
				this.pois[poi.id] = poi;
				var poiIcon = new GIcon(this.icon_base);
				var dictionary_id = poi.dictionary_id;
				if(dictionary_id == "" || dictionary_id == null){
					poiIcon.image = this.image_base + poi.type + ".png";
				}else{
					poiIcon.image = this.image_base + dictionary_id + ".png";
				}
				var markerOptions = {
					icon : poiIcon,
					title : poi.text,
					text : poi.text,
					merge : false,
					clickable : true
				};
				
				var latlng = new GLatLng(poi.y, poi.x);
				var marker = new POIMarker(latlng, markerOptions);
				this.map.addOverlay(marker);
				this.markers[poi.id] = marker;
				
				GEvent.addListener(marker, "click", GEvent.callbackArgs(this, this.onclick, poi.id, latlng));
			}
		}
	}


	function show_win(img_near_id,img_date,img_next_id,img_next_date,is_have_two){
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
			path = "<div><img width='400' height='400' src='/uploaded/visitator/facilities/"+img_near_id+".jpg'/></div><div align='center'><b>最近日期："+img_date+"</b></div>";
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
	window.Zion.POI = POI;
	window.show_win = show_win;
})();
