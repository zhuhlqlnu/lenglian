(function() {
	function NodeDelete(point, polyline, index) {
		this.point_ = point;
		this.polyline_ = polyline;
		this.index_ = index;
	}
	NodeDelete.prototype = new GOverlay();
	NodeDelete.prototype.initialize = function(map) {
		this.div_ = document.createElement("div");

		this.div_.style.position = "absolute";
		this.div_.style.display = "block";
		this.div_.style.textAlign = "center";

		this.div_.style.width = 100 + "px";
		this.div_.innerHTML = "<span style='font-size:12px;background-color:red;cursor:pointer;'>X</span>";

		this.map_ = map;
		map.getPane(G_MAP_FLOAT_PANE).appendChild(this.div_);
		var this_ = this;
		GEvent.addDomListener(this.div_, "click", function() {
			this_.polyline_.deleteVertex(this_.index_);
		});
	}

	NodeDelete.prototype.remove = function() {
		if (this.div_.outerHTML) {
			this.div_.outerHTML = "";
		}

		if (this.div_.parentNode) {
			this.div_.parentNode.removeChild(this.div_);
		}
	}

	NodeDelete.prototype.copy = function() {
		return new NodeDelete(this.point_, this.polyline_, this.index_);
	}

	NodeDelete.prototype.setLatLng = function(latlng, index) {
		this.point_ = latlng;
		this.index_ = index;
		this.redraw(true);
	}

	NodeDelete.prototype.redraw = function(force) {
		if (!force)
			return;
		var p = this.map_.fromLatLngToDivPixel(this.point_);
		var z = GOverlay.getZIndex(this.point_.lat());

		this.div_.style.left = (p.x - 49) + "px";
		this.div_.style.top = (p.y + 8) + "px";

		this.div_.style.zIndex = z;
	}

	function Polyline() {
		this.polyline = null;
	}

	Polyline.prototype.draw = function(map, callback, scope, color, weight, opacity) {
		var poly = new GPolyline( [], color ? color : "blue", weight ? weight : 2, opacity ? opacity : 0.8, {
			clickable : true
		});
		map.addOverlay(poly);
		poly.enableDrawing();
		GEvent.addListener(poly, "endline", function() {
			callback.call(scope || window, poly);
		});
	};

	Polyline.prototype.fromString = function(map, polyline, color, weight, opacity) {
		var latlngs = [];
		var points = polyline.split(";");
		for ( var i = 0; i < points.length; i++) {
			var tmp = points[i].split(",");
			latlngs.push(new GLatLng(tmp[1], tmp[0]));
		}
		var poly = new GPolyline(latlngs, color ? color : "blue", weight ? weight : 2, opacity ? opacity : 0.8, {
			clickable : true
		});
		map.addOverlay(poly);
		return poly;
	};

	Polyline.prototype.edit = function(map, polyline) {
		this.polyline = polyline;
		polyline.enableEditing();
		var size = polyline.getVertexCount();
		this.editPoints = [];
		for ( var i = 0; i < size; i++) {
			var latlng = polyline.getVertex(i);
			this.editPoints.push(new GLatLng(latlng.lat(), latlng.lng()));
		}

		var nodeEdit = {
			polyline : polyline
		};
		this.nodeEdit = nodeEdit;
		this.nodeEdit.handle = GEvent.addListener(map, "mousemove", function(latlng) {
			var size = polyline.getVertexCount();
			var nearset = 0;
			var nearsetDist = latlng.distanceFrom(polyline.getVertex(0));
			var nsarsetNode = polyline.getVertex(0);
			for ( var i = 1; i < size; i++) {
				var tmp = latlng.distanceFrom(polyline.getVertex(i));
				if (nearsetDist > tmp) {
					nsarsetNode = polyline.getVertex(i);
					nearsetDist = tmp;
					nearset = i;
				}
			}
			var pt1 = map.fromLatLngToDivPixel(latlng);
			var pt2 = map.fromLatLngToDivPixel(nsarsetNode);
			if (((pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y)) < 25 * 25) {
				if (nodeEdit.deleteNode) {
					nodeEdit.deleteNode.setLatLng(polyline.getVertex(nearset), nearset);
				} else {
					nodeEdit.deleteNode = new NodeDelete(polyline.getVertex(nearset), nodeEdit.polyline, nearset);
					map.addOverlay(nodeEdit.deleteNode);
				}
			} else {
				if (nodeEdit.deleteNode) {
					nodeEdit.deleteNode.remove();
					nodeEdit.deleteNode = null;
				}
			}
		});
	};

	Polyline.prototype.endEdit = function() {
		if (this.nodeEdit) {
			GEvent.removeListener(this.nodeEdit.handle);
			if (this.nodeEdit.deleteNode) {
				this.nodeEdit.deleteNode.remove();
			}
			this.nodeEdit = null;
		}

		if (this.polyline) {
			this.editPoints = null;
			var poly = this.polyline;
			this.polyline = null;
			poly.disableEditing();
			return poly;
		}
	};

	Polyline.prototype.cancelEdit = function() {
		if (this.polyline && this.editPoints) {
			var size = this.polyline.getVertexCount();
			for ( var i = 0; i < size; i++) {
				this.polyline.deleteVertex(0);
			}

			size = this.editPoints.length;
			for ( var i = size - 1; i >= 0; i--) {
				this.polyline.insertVertex(0, this.editPoints[i]);
			}
		}
	};

	Polyline.prototype.toString = function(polyline) {
		var size = polyline.getVertexCount();
		var tmp = [];
		for ( var i = 0; i < size; i++) {
			var latlng = polyline.getVertex(i);
			tmp.push(latlng.lng() + "," + latlng.lat());
		}
		return tmp.join(";");
	};

	Polyline.prototype.remove = function(polyline) {
		polyline.remove();
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Polyline = Polyline;
	window.Zion.polyline = new Polyline();
})();