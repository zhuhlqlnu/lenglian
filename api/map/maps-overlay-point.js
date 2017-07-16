(function() {	
	function OverlayPoint(map, opts) {
		OverlayPointMarker = function(latlng, opt_opts) {
			GMarker.apply(this, arguments);
			this.opts_ = opt_opts;
		}

		OverlayPointMarker.prototype = new GMarker(new GLatLng(0, 0));

		OverlayPointMarker.prototype.initialize = function(map) {
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

		OverlayPointMarker.prototype.redraw = function(force) {
			if (force) {
				GMarker.prototype.redraw.apply(this, arguments);
				var p = this.map_.fromLatLngToDivPixel(this.getLatLng());
				var z = GOverlay.getZIndex(this.getLatLng().lat());
				this.div_.style.left = (p.x - 50) + "px";
				this.div_.style.top = (p.y + this.getIcon().iconSize.height / 2) + "px";
				this.div_.style.zIndex = z;
			}
		};

		OverlayPointMarker.prototype.remove_ = function() {
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

		OverlayPointMarker.prototype.remove = function() {

		};

		OverlayPointMarker.prototype.copy = function() {
			var newMarker = new OverlayPointMarker(this.getLatLng(), this.opts_);
			return newMarker;
		};

		this.map = map;
		this.markers = {};
		this.points = {};
		this.opts = opts;
		this.icon_image_base;
 
		this.icon_size = opts.iconSize;
	 	this.icon_image_base = opts.iconImageBase;
	 	this.info_image_base = opts.infoImageBase;
	 
		if (opts.onclick) {
			this.onclick = opts.onclick;
		} else {
			this.onclick = function() {
			};
		}

		this.icon_base = new GIcon();
		this.icon_base.iconSize = new GSize(this.icon_size, this.icon_size);
		this.icon_base.iconAnchor = new GPoint(this.icon_size / 2, this.icon_size / 2);
		
		this.darwPoints();
	}

	OverlayPoint.prototype.darwPoints = function() {
		Zion.db.getJSON('axiom_overlay_point', null, function(data){
			for ( var p = 0; p < data.r.length; p++) {
				var info = data.r[p];
				this.points[info[0]] = info;
				var latlng = new GLatLng(info[4], info[3]);
				var targetIcon = new GIcon(this.icon_base);
				targetIcon.image = this.icon_image_base + "/" + info[2] + ".png";
				var text = info[1];
				var markerOptions = {
					icon : targetIcon,
					title : text,
					text : text,
					clickable : true
				};
	
				var marker = new OverlayPointMarker(latlng, markerOptions);
				GEvent.addListener(marker, "click", GEvent.callbackArgs(this, this.onclick, info[0], latlng));
	
				this.map.addOverlay(marker);
				this.markers[info[0]] = marker;
			}
		}, this);
	};


	OverlayPoint.prototype.openInfoWindow = function(key) {
		if (this.points[key]) {
			var latlng = new GLatLng(this.points[key][4], this.points[key][3]);
			Zion.db.getJSON('realtime.axiom_info_attribute_value.point.select',[key], function(data){
				var image_tabs = [];
				if(!data.f){									
					var infoHtml = "<p>名称:" + this.points[key][1]  + "</p>";
					//var imgHtml = "";
					var data_value = data.r;
					for(var i = 0; i < data_value.length; i++){
						var type = data_value[i][1];
						if(type == 'image'){
							image_tabs.push(new GInfoWindowTab(data_value[i][0] , "<img src=\"" + this.info_image_base + "/" + data_value[i][2] + ".jpg?ffadfeeffffa\" />"));
							//imgHtml += "<p>" + data_value[i][0] + "</p><p><img src=\"" + this.info_image_base + "/" + data_value[i][2] + ".jpg\" /></p>";		
						}else{
							if( data_value[i][1] ==null){
								 data_value[i][1] = "";
							}
							infoHtml += "<p>" + data_value[i][0] + ":" + data_value[i][1];
						}
					}
					//if(imgHtml != ""){
					if(image_tabs.length > 0){
						var info_tabs = [new GInfoWindowTab("信息" , infoHtml)].concat(image_tabs);
						//this.map.openInfoWindowTabsHtml(latlng, info_tabs , {maxContent: imgHtml, maxTitle: this.points[key][1], onOpenFn:function(){map.getInfoWindow().restore()}});
						this.map.openInfoWindowTabsHtml(latlng, info_tabs);
					}else{
						this.map.openInfoWindowHtml(latlng, infoHtml);
					}
				}
			} , this);
		}
	};

	OverlayPoint.prototype.moveToPoint = function(key, infoWindow) {
		if (this.points[key]) {
			var latlng = new GLatLng(this.points[key].y, this.points[key].x);
			this.map.setCenter(latlng);
			if (infoWindow) {
				this.openInfoWindow(key);
			}
		}
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.OverlayPoint = OverlayPoint;
})();
