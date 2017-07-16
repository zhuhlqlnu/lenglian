(function() {

	function NodeDelete(point, polygon, index) {
		this.point_ = point;
		this.polygon_ = polygon;
		this.index_ = index;
	}
	NodeDelete.prototype = new GOverlay();
	NodeDelete.prototype.initialize = function(map) {
		this.div_ = document.createElement("div");

		this.div_.style.position = "absolute";
		this.div_.style.display = "block";
		this.div_.style.textAlign = "center";

		this.div_.style.width = 8 + "px";
		this.div_.innerHTML = "<span style='font-size:12px;color:red;cursor:pointer;background-color:white;'>X</span>";

		this.map_ = map;
		map.getPane(G_MAP_FLOAT_PANE).appendChild(this.div_);
		var this_ = this;
		GEvent.addDomListener(this.div_, "click", function() {
			if ((this_.polygon_.getVertexCount() - 1) == this_.index_) {
				this_.polygon_.deleteVertex(this_.index_);
				this_.polygon_.deleteVertex(0);
				var last = this_.polygon_.getVertex(this_.polygon_.getVertexCount() - 1);
				this_.polygon_.insertVertex(0, new GLatLng(last.lat(), last.lng()));
			}else{
				this_.polygon_.deleteVertex(this_.index_);
			}
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
		return new NodeDelete(this.point_, this.polygon_, this.index_);
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

		this.div_.style.left = (p.x + 10) + "px";
		this.div_.style.top = (p.y - 7) + "px";

		this.div_.style.zIndex = z;
	}

	function Polygon() {
		this.polygon = null;
	}

	Polygon.prototype.draw = function(map, callback, scope, color, weight, opacity) {
		var poly = new GPolygon( [], color ? color : "blue", weight ? weight : 2, opacity ? opacity : 0.8, {
			clickable : true
		});
		map.addOverlay(poly);
		poly.enableDrawing();
		GEvent.addListener(poly, "endline", function() {
			callback.call(scope || window, poly);
		});
	};

	Polygon.prototype.fromString = function(map, Polygon, color, weight, opacity, fillColor, fillOpacity) {
		var latlngs = [];
		var points = Polygon.split(";");
		for ( var i = 0; i < points.length; i++) {
			var tmp = points[i].split(",");
			latlngs.push(new GLatLng(tmp[1], tmp[0]));
		}
		latlngs.push(latlngs[0]);
		var poly = new GPolygon(latlngs, color ? color : "blue", weight ? weight : 2, opacity ? opacity : 0.8, {
			clickable : true
		});
		map.addOverlay(poly);
		return poly;
	};

	Polygon.prototype.edit = function(map, polygon) {
		this.polygon = polygon;
		polygon.enableEditing();
		var size = polygon.getVertexCount();
		this.editPoints = [];
		for ( var i = 0; i < size; i++) {
			var latlng = polygon.getVertex(i);
			this.editPoints.push(new GLatLng(latlng.lat(), latlng.lng()));
		}

		var nodeEdit = {
			polygon : polygon
		};
		this.nodeEdit = nodeEdit;
		this.nodeEdit.handle = GEvent.addListener(map, "mousemove", function(latlng) {
			var size = polygon.getVertexCount();
			var nearset = 1;
			var nearsetDist = latlng.distanceFrom(polygon.getVertex(1));
			var nsarsetNode = polygon.getVertex(1);
			for ( var i = 2; i < size; i++) {
				var tmp = latlng.distanceFrom(polygon.getVertex(i));
				if (nearsetDist > tmp) {
					nsarsetNode = polygon.getVertex(i);
					nearsetDist = tmp;
					nearset = i;
				}
			}

			var pt1 = map.fromLatLngToDivPixel(latlng);
			var pt2 = map.fromLatLngToDivPixel(nsarsetNode);
			if (((pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y)) < 25 * 25) {
				if (nodeEdit.deleteNode) {
					nodeEdit.deleteNode.setLatLng(polygon.getVertex(nearset), nearset);
				} else {
					nodeEdit.deleteNode = new NodeDelete(polygon.getVertex(nearset), nodeEdit.polygon, nearset);
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

	Polygon.prototype.endEdit = function() {
		if (this.nodeEdit) {
			GEvent.removeListener(this.nodeEdit.handle);
			if (this.nodeEdit.deleteNode) {
				this.nodeEdit.deleteNode.remove();
			}
			this.nodeEdit = null;
		}

		if (this.polygon) {
			this.editPoints = null;
			var poly = this.polygon;
			this.polygon = null;
			poly.disableEditing();
			return poly;
		}
	};

	Polygon.prototype.cancelEdit = function() {
		if (this.polygon && this.editPoints) {
			var size = this.polygon.getVertexCount();
			for ( var i = 0; i < size; i++) {
				this.polygon.deleteVertex(0);
			}

			size = this.editPoints.length;
			for ( var i = size - 1; i >= 0; i--) {
				this.polygon.insertVertex(0, this.editPoints[i]);
			}
		}
	};

	Polygon.prototype.toString = function(Polygon) {
		var size = Polygon.getVertexCount();
		var tmp = [];
		for ( var i = 0; i < size - 1; i++) {
			var latlng = Polygon.getVertex(i);
			tmp.push(latlng.lng() + "," + latlng.lat());
		}
		return tmp.join(";");
	};

	Polygon.prototype.remove = function(Polygon) {
		Polygon.remove();
	};

	if (!window.Zion) {
		window.Zion = {};
	}
	window.Zion.Polygon = Polygon;
	window.Zion.polygon = new Polygon();
})();