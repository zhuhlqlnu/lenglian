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
				if(poi.type == 2){
					infoHtml = "<b>" + poi.text + "</b>"
					infoHtml += "<br/><b>高度:</b>" + poi.info.h;
					infoHtml += "<br/><b>对应实长:</b>" + poi.info.l;
					infoHtml += "<br/><b>偏向:</b>" + poi.info.t;
				}else{
					infoHtml = "<b>名称:</b>" + poi.text;
				}
				this.map.openInfoWindowHtml(latlng, infoHtml);

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
				poiIcon.image = this.image_base + poi.type + ".png";
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
	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.POI = POI;
})();
