Ext.onReady(function() {
	Ext.QuickTips.init();

	var lng;
	var lat;
	
	var ids;
	var ide;
	var ids_m;
	var ide_m;
	var markerg;
	var markers;
	var markere;
	var modifypipeline;
	var clickpipeline;
	var clickpipeline_id;
	var clicklinedata = [];
	var pointrowindex;
	
	function linedata(){
		this.id = 0;
		this.lng = 0;
		this.lat = 0;
	}
	
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.data.ArrayStore( {
		root : "r",
		fields : [ 'pipe_id', 'pipe_name', 'pipe_polyline', 'pipe_distance', 'pipe_gpolyline' ]
	});

	var sm = new Ext.grid.CheckboxSelectionModel( {
		singleSelect : true
	});

	var gridLine = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "管线编号",
			dataIndex : 'pipe_id',
			width : 50,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'pipe_name',
			width : 50,
			sortable : true
		}/*, {
			header : "越界距离(米)",
			dataIndex : 'pipe_distance',
			width : 50,
			sortable : true
		} */],
		tbar : [{
			id : 'editButton',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : modify_line,
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				reloadPipe();
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
			rowclick : function() {
				clickpipeline =  sm.getSelected().data.pipe_gpolyline;
				clickpipeline_id =  sm.getSelected().data.pipe_id;
				
				var bounds = clickpipeline.getBounds();
				map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			}
		}
	});

	sm.on('rowselect', function() {
		if (gridLine.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	
	sm.on('rowdeselect', function() {
		if (gridLine.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	});
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
	}
	
	function modify_line(){
		southPanel.layout.setActiveItem(gridPoint);
		if(clickpipeline){
			var count = clickpipeline.getVertexCount();
			var data = [];
			for(var i = 0;i < count;i += 1){
				var GLatLng_ = clickpipeline.getVertex(i);
				var lng_ = GLatLng_.lng();
				var lat_ = GLatLng_.lat();
				var data_ = [];
				data_.push(i);
				data_.push(lng_);
				data_.push(lat_);
				data.push(data_);
				var linedata_ = new linedata();
				linedata_.id = i;
				linedata_.lng = lng_;
				linedata_.lat = lat_;
				clicklinedata.push(linedata_);
			}
			storePoint.loadData(data, false);
		}
	}
	
	var storePoint = new Ext.data.ArrayStore( {
		autoDestroy: true,
		idIndex: 0,
		fields : [ {name: 'id'}, {name: 'longitude'}, {name: 'latitude'} ]
	});
	
	var smPoint = new Ext.grid.CheckboxSelectionModel({});
	var gridPoint = new Ext.grid.GridPanel( {
		store : storePoint,
		sm : smPoint,
		columns : [ smPoint, 
		new Ext.grid.RowNumberer({header:'序号',width:35}),
		{
			header : "经度",
			dataIndex : 'longitude',
			width : 150,
			sortable : true
		}, {
			header : "纬度",
			dataIndex : 'latitude',
			width : 150,
			sortable : true
		} ],
		tbar : [ {
			text : '返回',
			icon : Ext.zion.image_base+'/picture_go.png',
			tooltip : '返回',
			handler : function() {
				southPanel.layout.setActiveItem(gridLine);
				clearParams();
			},
			scope : this
		},{
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改',
			handler : function() {
				if((ids || ids == 0) && (ide || ids == 0)){
					if(modifypipeline){
						map.removeOverlay(modifypipeline);
					}
					var GLatLngs = [];
					var ids_ = 0;
					var ide_ = 0;
					if(ids > ide){
						ids_ = ide;
						ide_ = ids;
					}else{
						ids_ = ids;
						ide_ = ide;
					}
					ids_m = ids_;
					ide_m = ide_;
					for(var i = ids_;i <= ide_;i += 1){
						var GLatLng_ = clickpipeline.getVertex(i);
						GLatLngs.push(GLatLng_);
					}
					modifypipeline = new GPolyline(GLatLngs);
					map.addOverlay(modifypipeline);
					var bounds = modifypipeline.getBounds();
					map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
					setTimeout(function() { Zion.polyline.edit(map, modifypipeline); }, 0);
				}
			},
			scope : this
		},{
			text : '保存',
			icon : Ext.zion.image_base+'/basket_put.png',
			tooltip : '保存',
			handler : function() {
				if(modifypipeline){
					Ext.Msg.confirm('保存确认', '你是否确认保存记录？', function(btn) {
						if (btn == 'yes') {
							var points_m = Zion.polyline.toString(Zion.polyline.endEdit());
							var points_all = '';
							var ids_ = ids_m;
							var ide_ = ide_m;
							if(ids_m > ide_m){
								ids_ = ide_m;
								ide_ = ids_m;
							}
							for(var i = 0;i < ids_;i += 1){
								var linedata_ = clicklinedata[i];
								var lng_ = linedata_.lng;
								var lat_ = linedata_.lat;
								points_all += lng_ + ','  + lat_ + '|';
							}
							points_all += points_m + '|';
							for(var i = ide_+1;i < clicklinedata.length;i += 1){
								var linedata_ = clicklinedata[i];
								var lng_ = linedata_.lng;
								var lat_ = linedata_.lat;
								points_all += lng_ + ','  + lat_ + '|';
							}
							if(points_all.length > 0){
								points_all = points_all.substring(0 , points_all.length - 1);
								var points_arr = points_all.split('|');
								var points_tmp = '';
								for(var i = 0;i < points_arr.length;i += 1){
									points_tmp += points_arr[i] + '\n';
								}
								var encodePolyline = showCode(points_tmp);
								var params_ = [];
								params_.push(encodePolyline);
								params_.push(clickpipeline_id);
								var p_ = Zion.token + '/' + 'pipe_pipeline_section.update' + '/' + params_;
								Ext.Ajax.request({
									url: '/db',
									method :'POST', 
									params: { params: p_ },
									//timeout : 10000,
									success : function(request) {
										if(request.responseText){
											Ext.Msg.alert('提示', "保存成功!");
											
										}else{
											Ext.Msg.alert('提示', "保存失败!");
										}
										southPanel.layout.setActiveItem(gridLine);
										reloadPipe();
									},
									failure : function(request) {
										Ext.Msg.alert('提示', "失败!");
									}
								});
							}
							
						}
					});
				}
				
			},
			scope : this
		} ],
		view: new Ext.ux.grid.BufferView({
		    // custom row height
		    rowHeight: 18,
		    autoFill : true,
			forceFit : true,
		    // render rows as they come into viewable area.
		    scrollDelay: false
	    }),
		listeners : {
			rowclick : function() {
				var lng_ = smPoint.getSelected().data.longitude;
				var lat_ = smPoint.getSelected().data.latitude;
				if(markerg){
					map.removeOverlay(markerg);
				}
				markerg = getMarker("images/reddot.gif", lat_, lng_, 10, 10, 5, 5, true);
				map.addOverlay(markerg);
			},
			rowcontextmenu : function(grid,rowindex,e){
				e.preventDefault();
			    rightClick.showAt(e.getXY());
			    pointrowindex = rowindex;
			}
		}
	});
	
	var rightClick = new Ext.menu.Menu({
	    items: [{
	            handler: function(){
	    			ids = pointrowindex;
	    			var record = storePoint.getAt(pointrowindex);
	    			var lng_ = record.get('longitude');
	    			var lat_ = record.get('latitude');
	    			if(markers){
						map.removeOverlay(markers);
					}
					markers = getMarker("images/qidian.png", lat_, lng_, 23, 26, 13, 15, true);
					map.addOverlay(markers);
	        	},
	        	icon : 'images/qidian.png ',
	            text: '起点'
	        },
	        {
	            handler: function(){
	        		ide = pointrowindex;
		        	var record = storePoint.getAt(pointrowindex);
	    			var lng_ = record.get('longitude');
	    			var lat_ = record.get('latitude');
	    			if(markere){
						map.removeOverlay(markere);
					}
					markere = getMarker("images/zhongdian.png", lat_, lng_, 23, 26, 13, 15, true);
					map.addOverlay(markere);
	        	},
	        	icon : 'images/zhongdian.png',
	            text: '终点'
	        }
	    ]
	});
	
	function getMarker(images, lat, lng, iconSize1, iconSize2, iconAnchor1, iconAnchor2, isbounds){
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(iconSize1, iconSize2);
		targetIcon.iconAnchor = new GPoint(iconAnchor1, iconAnchor2);
		targetIcon.image = images;
		var markerOptions = {
			icon : targetIcon,
			clickable : true
		}
		var point = new GLatLng(lat , lng);
		var marker = new GMarker(point, markerOptions);
		if(isbounds){
			map.setCenter(point);
		}
		return marker;
	}
	
	var southPanel = new Ext.Panel({
		title : '管线列表',
		region : 'south',
		layout : 'card',
		activeItem: 0,
		split : true,
		collapsible : true,
		height : 200,
		//width : 300,
		cmargins : '5 0 0 0',
		items : [ gridLine, gridPoint ]
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
		}, southPanel ]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i+=1) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}

	function reloadPipe() {
		map.clearOverlays();
		clearParams();
		clickpipeline = null;
		clickpipeline_id = null;
		
		Zion.db.getJSON("pipe.management.data.pipe.select", null, function(data) {
			drawPolyline(data);
			store.loadData(data);
			loadMask.hide();
		});
	}
	function clearParams(){
		if(markerg){
			map.removeOverlay(markerg);
		}
		if(markers){
			map.removeOverlay(markers);
		}
		if(markere){
			map.removeOverlay(markere);
		}
		if(modifypipeline){
			map.removeOverlay(modifypipeline);
		}
		ids = null;
		ide = null;
		ids_m = null;
		ide_m = null;
		markerg = null;
		markers = null;
		markere = null;
		modifypipeline = null;
		pointrowindex = null;
		clicklinedata = [];
	}
	reloadPipe();
});