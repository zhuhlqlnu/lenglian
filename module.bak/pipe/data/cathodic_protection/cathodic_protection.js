Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var marker;
	var g_x;
	var g_y;
	var store_sql = "protection.axiom_target.termital_type.select";
	var fields = [ 'target_id', 'target_name', 'terminal_id', 'terminal_sn','identity','mileage','pipeline','longitude','latitude'];

	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql,
			params : [ selectCorpId ]
		},
		root : "r",
		fields : fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
	
	sm.on('rowselect', function() {
		
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('addButton').enable();
		} else {
			Ext.getCmp('addButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('selectButton').enable();
		} else {
			Ext.getCmp('selectButton').disable();
		}
	})

	sm.on('rowdeselect', function() {
		map.clearOverlays();
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('addButton').enable();
		} else {
			Ext.getCmp('addButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('selectButton').enable();
		} else {
			Ext.getCmp('selectButton').disable();
		}
	})
	var grid = new Ext.grid.GridPanel( {
		title:'目标组列表',
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'target_id',
			width : 70,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'target_name',
			width : 100,
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 100,
			sortable : true
		}],
		tbar:[{
			id : 'addButton',
			text : '标注',
			disabled:true,
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '标注阴极保护桩',
			handler : function() {
				Ext.getCmp("addButton").disable();
				draw_point();
			},
			scope : this
		},{
			id : 'selectButton',
			text : '查看',
			disabled:true,
			icon : Ext.zion.image_base + '/select.gif',
			tooltip : '查看阴极保护桩',
			handler : function() {
				show_point();
			},
			scope : this
		}],
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})/*,
		viewConfig : {
			autoFill : true,
			forceFit : true
		}*/
	});

	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		split : true,
		region : 'north',
		layout:'fit',
		height:300,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				store.constructor( {
					db : {
						alias : store_sql,
						params : [ selectCorpId ]
					},
					root : "r",
					fields : fields
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
				disable_button();
				map.clearOverlays();
			}
		}
	});
	// ==============获得客户信息==============

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;

		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});

		store.constructor( {
			db : {
				alias : store_sql,
				params : [ Zion.user.corp_id ]
			},
			root : "r",
			fields : fields
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	});
	
	function draw_point(){
		map.closeInfoWindow();
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		g_x = null;
		g_y = null;
		e_click = GEvent.addListener(map, "click", function(marker_, latlng_, overlaylatlng_) {
			var latlng = null;
			if(latlng_){
				latlng = latlng_;
			}else if(overlaylatlng_){
				latlng = overlaylatlng_;
			}
			g_x = latlng.lng();
			g_y = latlng.lat();
			g_x = parseInt(g_x*1000000)/1000000;
			g_y = parseInt(g_y*1000000)/1000000;
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(20, 34);
			targetIcon.iconAnchor = new GPoint(10, 34);
			targetIcon.image = "1.png";

			var markerOptions = {
				icon : targetIcon,
				clickable : true
			}
			var point = new GLatLng(g_y, g_x);
			marker = new GMarker(point, markerOptions);
			map.addOverlay(marker);
			show_window();
			var sm = grid.getSelectionModel().getSelected();
			formPanel.form.loadRecord(sm);
			Ext.getCmp('longitude').setValue(g_x);
			Ext.getCmp('latitude').setValue(g_y);
			removeListener();
        });
    }
	
    function show_window(){
    	formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			labelWidth:80,
			items : [ {
				fieldLabel : '经度',
				maxLength : 10,
				width:230,
				name : 'longitude',
				id:'longitude'
			}, {
				fieldLabel : '纬度',
				maxLength : 10,
				allowDecimals: true,
				width:230,
				name : 'latitude',
				id:'latitude'
			},{
				fieldLabel : '里程(公里)',
				name : 'mileage',
				maxLength : 12,
				id:'mileage'
			}, {
				fieldLabel : '管道(公里)',
				maxLength : 12,
				name : 'pipeline',
				id:'pipeline'
			},{
				fieldLabel : 'terminal_location_id',
				maxLength : 12,
				allowDecimals: true,
				hidden : true,
				hideLabel : true,
				name : 'terminal_location_id'
			}]
		})
		var win = new Ext.Window( {
			title : '阴极保护桩',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id : 'save',
				text : '保存',
				handler : function() {
					if(formPanel.getForm().isValid() == false){
						return;
					}else{
						var sm = grid.getSelectionModel().getSelected();
						var target_id = sm.data.target_id;
						var terminal_sn = sm.data.terminal_sn;
						var identity = sm.data.identity;
						var mileage = Ext.getCmp('mileage').getValue();
						var pipeline = Ext.getCmp('pipeline').getValue();
						var longitude = Ext.getCmp('longitude').getValue();
						var latitude = Ext.getCmp('latitude').getValue();
						var params = [terminal_sn,identity,longitude,latitude,target_id,mileage,pipeline];
						Zion.db.getJSON('axiom_terminal_location.select',[terminal_sn],function(data){
							if(!data.f){
								if(data.r == '' || data.r == null){
									Zion.db.getJSON('axiom_terminal_location.insert',params,function(data){
										if(data.r){
											Ext.Msg.alert('提示','目标阴极保护桩保存成功');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}else{
											Ext.Msg.alert('提示','目标阴极保护桩保存失败');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}
									})
								}else{
									var data_value = data.r;
									var terminal_location_id = data_value[0][0];
									var terminal_sn = data_value[0][1];
									var terminal_identity = data_value[0][2];
									var update_params = [terminal_identity,terminal_sn,latitude,longitude,mileage,pipeline,terminal_location_id];
									Zion.db.getJSON('axiom_terminal_location.update',update_params,function(data){
										if(data.r){
											Ext.Msg.alert('提示','目标阴极保护桩保存成功');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}else{
											Ext.Msg.alert('提示','目标阴极保护桩保存失败');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}
									})
								}
							}else{
								Ext.Msg.alert('提示','目标阴极保护桩保存失败');
								disable_button();
							}
						})
					}
				}
			}, {
				text : '取消',
				id : 'cancel',
				handler : function() {
					Ext.getCmp("addButton").enable();
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		win.show();
    }
    function disable_button(){
    	Ext.getCmp('selectButton').disable();
    	Ext.getCmp('addButton').disable();
		grid.store.reload();
    }
    function removeListener(){
		if(e_click){
			GEvent.removeListener(e_click);
			e_click = null;
		}
	}
	
	function show_point(){
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		var sm = grid.getSelectionModel().getSelected();
		var terminal_sn = sm.data.terminal_sn;
		Zion.db.getJSON('axiom_terminal_location.select',[terminal_sn],function(data){
			if(!data.f){
				if(data.r == "" || data.r == null){
					return;
				}else{
					var data_value = data.r;
					var lat = data_value[0][4];
					var lng = data_value[0][3];
					var mileage = data_value[0][9];
					var pipeline = data_value[0][10];
					var targetIcon = new GIcon();
					targetIcon.iconSize = new GSize(20, 34);
					targetIcon.iconAnchor = new GPoint(10, 34);
					targetIcon.image = "1.png";
		
					var markerOptions = {
						icon : targetIcon,
						clickable : true
					}
					var point = new GLatLng(lat, lng);
					marker = new GMarker(point, markerOptions);
					map.addOverlay(marker);
					map.setCenter(point);
					var window_info = "<div><b>经度：</b>"+lng+"<br/><b>纬度：</b>"+lat+"<br/><b>里程(公里)：</b>"+mileage+"<br/><b>管线(公里)：</b>"+pipeline+"</div>";
					GEvent.addListener(marker, "click",  GEvent.callbackArgs(this, function(point,window_info){
						map.openInfoWindowHtml(point,window_info);
					}, point, window_info));
					map.openInfoWindowHtml(point,window_info);
				}
			}else{
				Ext.Msg.alert('提示','阴极保护桩查询失败');
			}
		})
	}
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(38.718465,116.099052), 4);
	
	var panel = new Ext.Panel({
		layout : 'border',
		border : false,
		items : [ corp_tree, {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		}]
	})
	// grid自适应
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [  {
			width:200,
			split:true,
			collapsible : true,
			title : '集团列表',
			region : 'west',
			layout : 'fit',
			items : [ 
				panel
			]
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

})