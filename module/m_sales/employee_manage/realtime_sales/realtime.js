Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var targetTree = new Ext.tree.TreePanel( {
		autoScroll : true,
		split : true,
		region : 'center',
		animate : false,
		border : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if (node.attributes.target) {
					var key = node.attributes.target.target_id;
					showInfoKey = key
					target.moveToTarget(key, true);
					showTargetInfo(key);
					showTailLine(key);
				} else {
					return false;
				}
			}
		}
	});

	function showTargetInfo(target_id) {
		Zion.db.getJSON('monitor.realtime.target', [ target_id ], function(data) {
			if (data && data.r) {
				var target = data.r[0];
				targetInfo.setSource( {
					'目标序号' : target[0],
					'目标名称' : target[1],
					'终端类型' : target[2],
					'终端序号' : target[3],
					'终端编号' : target[4],
					'通讯地址' : target[5]
				});
			}
		});
	}

	var targetInfo = new Ext.grid.PropertyGrid( {
		title : '属性信息',
		collapsible : true,
		region : 'south',
		autoHeight : true,
		selModel : new Ext.grid.RowSelectionModel( {
			singleSelect : true
		}),
		source : {
			'目标序号' : '',
			'目标名称' : '',
			'终端类型' : '',
			'终端序号' : '',
			'终端编号' : '',
			'通讯地址' : ''
		},
		viewConfig : {
			forceFit : true,
			scrollOffset : 2
		},
		listeners : {
			beforeedit : function() {
				return false;
			}
		}
	});
	targetInfo.store.sortInfo = null;
	targetInfo.getColumnModel().config[0].sortable = false;

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			title : '监控目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [ targetTree, targetInfo ]
		}, {
			layout : 'border',
			region : 'center',
			items : [ {
				layout : 'fit',
				region : 'center',
				contentEl : 'map_canvas',
				cmargins : '5 0 0 0',
				listeners : {
					bodyresize : function(p, width, height) {
						document.getElementById("map_canvas").style.width = width;
						document.getElementById("map_canvas").style.height = height;
						if (map) {
							map.checkResize();
						}
					}
				}
			} ]
		} ]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	var lastTrackPolyline;
	var lastTrackKey;
	var lastTrackTime;
	var lastTrackCount = 100;
	var lastTrackPoint;
	function showTailLine(key) {
		lastTrackPoint = null;
		lastTrackKey = key;
		if (lastTrackPolyline) {
			lastTrackPolyline.remove();
			lastTrackPolyline = null;
		}
		Zion.db.getJSON("monitor.realtime.last_track_count", [ key, key, lastTrackCount ], function(data) {
			if (data.r) {
				var latlngs = [];
				for ( var i = 0; i < data.r.length; i++) {
					latlngs.push(new GLatLng(data.r[i][0], data.r[i][1]));
				}
				if (lastTrackPoint) {
					latlngs.push(lastTrackPoint);
				}
				lastTrackPolyline = new GPolyline(latlngs, "#ff0000", 3, 0.8);
				map.addOverlay(lastTrackPolyline);
			}
		});
	}

	function appendLastTrackPolyline(tracks) {
		if (tracks[lastTrackKey]) {
			lastTrackPoint = new GLatLng(tracks[lastTrackKey].y, tracks[lastTrackKey].x);
			if (lastTrackPolyline) {
				if (lastTrackTime != tracks[lastTrackKey].t) {
					if (lastTrackPolyline.getVertexCount() >= lastTrackCount) {
						lastTrackPolyline.deleteVertex(0);
					}
					lastTrackPolyline.insertVertex(lastTrackPolyline.getVertexCount(), lastTrackPoint);
				}
				lastTrackTime = tracks[lastTrackKey].t;
			}
		} else {
			lastTrackPoint = null;
		}
	}

	var opts_target = {
		iconSize : 26,
		iconHead : true,
		mergeSize : 44,
		iconType : "target",
		flashSize : 56,
		application : "axiom",
		onclick : function(key, latlng) {
			target.openInfoWindow(key);
			showTailLine(key);
		},
		onupdated : function(target) {
			appendLastTrackPolyline(target.tracks);
		}
	};

	var target = new Zion.Target(map, true, true, opts_target);

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	});
});