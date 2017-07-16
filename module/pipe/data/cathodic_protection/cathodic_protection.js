Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var marker;
	var g_x;
	var g_y;
	var store_sql = "protection.axiom_target.termital_type.select";
	var fields = [ 'target_id', 'target_name', 'terminal_id', 'terminal_sn','identity','mileage','pipeline','longitude','latitude','polyline_name', 'stake', 'stake_type_id', 'bureau', 'place', 'section', 'station'];
	
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

	var bureau_value = "";
	var place_value = "";
	var section_value = "";
	var station_value = "";
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
			loadMask.hide();
			setTimeout(function(){
				corp_tree.getRootNode().childNodes[0].select();
			},0);
			
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
			targetIcon.iconSize = new GSize(26, 26);
			targetIcon.iconAnchor = new GPoint(13, 13);
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
		var stake_type_combo = new Ext.form.ComboBox({
			fieldLabel : '桩类型',
			hiddenName : 'stake_type_id',
			valueField : 'stake_type_id',
			store : new Ext.data.SimpleStore({
				fields : ['stake_type_id', 'stake_type_value'],
				data:[[1,'电流桩'],[2,'电位桩']]
			}),
			triggerAction : 'all',
			displayField : 'stake_type_value',
			mode : 'local',
			editable : false,
			value:1
		});

    	formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			labelWidth:80,
			defualts:{
				width:230
			},
			items : [ {
				fieldLabel : '经度',
				maxLength : 10,
				width:230,
				name : 'longitude',
				id:'longitude',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '纬度',
				maxLength : 10,
				allowDecimals: true,
				width:230,
				name : 'latitude',
				id:'latitude',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '管道名称',
				maxLength : 20,
				name : 'polyline_name',
				id:'polyline_name'
			},  {
				fieldLabel : '桩号',
				maxLength : 10,
				name : 'stake',
				id:'stake'
			}, stake_type_combo,{
				fieldLabel : '管道所属(局)',
				maxLength : 20,
				name : 'bureau',
				id:'bureau',
				hidden : true,
				hideLabel : true
			}, {
				fieldLabel : '管道所属(处)',
				maxLength : 20,
				name : 'place',
				id:'place',
				hidden : true,
				hideLabel : true
			}, {
				fieldLabel : '管道所属(科)',
				maxLength : 20,
				name : 'section',
				id:'section',
				hidden : true,
				hideLabel : true
			}, {
				fieldLabel : '管道所属(站)',
				maxLength : 20,
				name : 'station',
				id:'station',
				hidden : true,
				hideLabel : true
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
			autoWidth:false,
			width:380,
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
						var target_name = sm.data.target_name;
						var terminal_sn = sm.data.terminal_sn;
						var identity = sm.data.identity;
						var longitude = Ext.getCmp("longitude").getValue();
						var latitude = Ext.getCmp("latitude").getValue();
						var polyline_name = Ext.getCmp("polyline_name").getValue();
						var stake = Ext.getCmp("stake").getValue();
						var stake_type_id = stake_type_combo.getValue();
						var bureau = Ext.getCmp("bureau").getValue();
						var place = Ext.getCmp("place").getValue();
						var section = Ext.getCmp("section").getValue();
						var station = Ext.getCmp("station").getValue();
						var params = [terminal_sn, identity, longitude, latitude, target_id,polyline_name, stake, stake_type_id];
						Zion.db.getJSON('axiom_terminal_location.select',[target_id],function(data){
							if(!data.f){
								if(data.r == '' || data.r == null){
									Zion.db.getJSON('axiom_terminal_location.insert',params,function(data){
										if(data.r){
											Ext.getCmp("addButton").enable();
											Zion.db.getJSON('axiom_overlay_point.id.select',null,function(data){
												if(!data.f){
													var id = data.r[0][0];
													var point_params = [];
													point_params = [id,target_name,-1,longitude,latitude,selectCorpId,parseInt(new Date().getTime()/1000),target_id];
													Ext.zion.db.getJSON('axiom_overlay_point.insert', point_params, function(data) {
														Zion.db.getJSON('axiom_overlay_relation.insert',[id,''],function(data){
															Ext.Msg.alert('提示','目标阴极保护桩保存成功');
															win.close();
															store.reload();
															disable_button();
														});
													});
												}
											});
										}else{
											Ext.Msg.alert('提示','目标阴极保护桩保存失败');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}
									});
								}else{
									var data_value = data.r;
									var terminal_location_id = data_value[0][0];
									var terminal_identity = data_value[0][2];
									var update_params = [terminal_sn,terminal_identity,longitude,latitude,polyline_name,stake,stake_type_id,target_id,terminal_location_id];
									Zion.db.getJSON('axiom_terminal_location.update',update_params,function(data){
										if(data.r){
											Ext.Msg.alert('提示','目标阴极保护桩保存成功');
											win.close();
											store.reload();
											disable_button();
											Ext.getCmp("addButton").enable();
											Ext.zion.db.getJSON('axiom_overlay_point.by_memo.update', [target_name,longitude,latitude,""+target_id], function(data) {
											});
										}else{
											Ext.Msg.alert('提示','目标阴极保护桩保存失败');
											win.close();
											disable_button();
											Ext.getCmp("addButton").enable();
										}
									});
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
		var target_id = sm.data.target_id;
		var window_info = "";
		Zion.db.getJSON('axiom_terminal_location.ad1',[target_id],function(data){
			if(data.r){
				var ad1 = data.r[0][0];
				Zion.db.getJSON('axiom_terminal_location.select',[target_id],function(data){
					if(!data.f){
						if(data.r == "" || data.r == null){
							Ext.Msg.alert("提示","该阴保桩没有标注");
							return;
						}else{
							var data_value = data.r;
							var lat = data_value[0][4];
							var lng = data_value[0][3];
							 window_info += "<div><b>经度:</b>"+lng+"<br/><b>纬度:</b>"+lat+"<br/>";
							var polyline_name = data_value[0][9];
							if(polyline_name == null || polyline_name == ""){
								polyline_name = "";
							}else{
								window_info += "<b>管道名称:</b>"+polyline_name+"<br/>";
							}
							var stake = data_value[0][10];
							if(stake == null || stake == ""){
								stake = "";
							}else{
								window_info += "<b>桩号:</b>"+stake+"<br/>";
							}
							var stake_type = data_value[0][11];
							var stake_type_value = "";
							if(stake_type == 1){
								stake_type_value = "电流桩";
								window_info += "<b>桩类型:</b>"+stake_type_value+"<br/>";
							}else if(stake_type == 2){
								stake_type_value = "电位桩";
								window_info += "<b>桩类型:</b>"+stake_type_value+"<br/>";
							}else{
								stake_type_value = "";
							}
							if(ad1 == null){
								window_info += "";
							}else{
								window_info += "<b>电位值:</b>"+ad1+"<br/>";
							}
							var bureau = data_value[0][12];
							if(bureau == null || bureau ==""){
								bureau = "";
							}else{
								window_info += "<b>管道所属单位(局):</b>"+bureau+"<br/>";
							}
							var place = data_value[0][13];
							if(place == null || place == ""){
								place = "";
							}else{
								window_info += "<b>管道所属单位(处):</b>"+place+"<br/>";
							}
							var section = data_value[0][14];
							if(section == null || section == ""){
								section = "";
							}else{
								window_info += "<b>管道所属单位(科):</b>"+section+"<br/>";
							}
							var station = data_value[0][15];
							if(station == null || station == ""){
								station = "";
							}else{
								window_info += "<b>管道所属单位(站):</b>"+station+"<br/>";
							}
							var targetIcon = new GIcon();
							targetIcon.iconSize = new GSize(26, 26);
							targetIcon.iconAnchor = new GPoint(13, 13);
							targetIcon.image = "1.png";
				
							var markerOptions = {
								icon : targetIcon,
								clickable : true
							}
							var point = new GLatLng(lat, lng);
							marker = new GMarker(point, markerOptions);
							map.addOverlay(marker);
							map.setCenter(point);
							GEvent.addListener(marker, "click",  GEvent.callbackArgs(this, function(point,window_info){
								map.openInfoWindowHtml(point,window_info);
							}, point, window_info));
							map.openInfoWindowHtml(point,window_info);
						}
					}else{
						Ext.Msg.alert('提示','阴极保护桩查询失败');
					}
				});
			}
		});
		
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