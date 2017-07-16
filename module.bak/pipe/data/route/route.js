Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.data.ArrayStore( {
		root : "r",
		fields : [ 'pipe_id', 'pipe_name', 'pipe_polyline', 'pipe_gpolyline' ]
	});

	var sm = new Ext.grid.CheckboxSelectionModel( {
		singleSelect : true
	});

	sm.on('rowselect', function(sm, index, r) {
		var bounds = r.data.pipe_gpolyline.getBounds();
		map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
	});

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "道路编号",
			dataIndex : 'pipe_id',
			width : 50,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'pipe_name',
			width : 50,
			sortable : true
		}],
		tbar_ : [ {
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				imsi_add = true;
				win_show();
			},
			scope : this
		}, '-', {
			id : 'editButton',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : function() {
				update_goods();
			},
			scope : this
		}, '-', {
			id : 'deleteButton',
			disabled : true,
			text : '删除',
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除记录',
			handler : function() {
			},
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				disableButton();
			},
			scope : this
		} ],
		bbar_ : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		listeners : {
			rowdblclick : function() {
				var polyline =  sm.getSelected().data.pipe_gpolyline;
				var bounds = sm.getSelected().data.pipe_gpolyline.getBounds();
				map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			}
		}
	});

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
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
		}, {
			title : '道路列表',
			region : 'south',
			layout : 'fit',
			split : true,
			collapsible : true,
			height : 200,
			width : 300,
			cmargins : '5 0 0 0',
			items : [ grid ]
		} ]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}

	function reloadPipe() {
		Zion.db.getJSON("pipe.management.data.route.select", null, function(data) {
			drawPolyline(data);
			store.loadData(data);
			loadMask.hide();
		});
	}

	reloadPipe();
});