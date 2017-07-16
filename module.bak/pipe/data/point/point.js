Ext.onReady(function() {
	Ext.QuickTips.init();
	var marker;
	var e_click = null;
	var g_x;
	var g_y;
	var modify_x;
	var modify_y;
	var is_approve=false;
	var update_part = false;
	var formPanel;
	var modify_poi_id;
	var Polyline;
	var selectCorpId;
	var map_state = 1;//地图状态,0:初始状态;1:管线项目,显示管线.
	var attribute_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo'];
	var store_sql = "pipe.management.data.point.select";
	var fields = ['overlay_id','overlay_name','overlay_type_id','overlay_type_name','x','y','reg_date','memo','polyline_id','polyline_name'];
	var p_source;
	var p_source_value;
	var p_source_update;
	var p_source_update_value;
	var attribute_fields_default = {'image':'图片','text':'','number':0,'date':new Date()};
	var p_source_update_array = [];
	function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
    
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var overlay_type = ["pipeline", "facilities", "defect"];
	var overlays = {};
	for(var i = 0; i < overlay_type.length; i++){
		overlays[overlay_type[i]] = [];
	}
	var defect_button = new Ext.Button({
		text : '管线',
		tooltip : '管线',
		enableToggle:true,
		icon : Ext.zion.image_base+'/select.gif',
		overlay_type:'pipeline'
	});
	defect_button.on('toggle', overly_button_toggle);

	var overly_buttons = [defect_button];
	
	function overly_button_toggle(button, pressed){
		if(pressed == true){
			show_overlays();
		}else{
			remove_overlays(button.overly_type);
		}
	}
	
	function show_overlays(){
		if(defect_button.pressed){
			var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
			loadMask.show();
			Zion.db.getJSON('monitor.realtime_pipe.axiom_overlay_route.select',[selectCorpId],function(data){				
				if(data.r){
					var data_value = data.r;
					for(var i = 0 ; i < data_value.length; i ++){
						var polyline =  data_value[i][3];
						var points_arr = polyline.split(';');
						var points = [];
						var xy_arr = points_arr[0].split(',');
						var x = xy_arr[0];
						var y = xy_arr[1];
						
						for(var j = 0;j < points_arr.length;j ++){
							var xy_arr_ = points_arr[j].split(',');
							points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
						}
						var Polyline = new GPolyline(points,'blue',3);
						var bounds = Polyline.getBounds();
						map.addOverlay(Polyline); 
						overlays["pipeline"].push(Polyline);
					}
					loadMask.hide();
				}else{
					
				}
			});
		}
	}

	function remove_overlays(type){
		if(type){
			for(var i = 0; i< overlays[type].length; i++){
				map.removeOverlay(overlays[type][i]);
			}
			map.closeInfoWindow();
		}else{
			for(var i = 0; i < overlay_type.length; i++){
				remove_overlays(overlay_type[i]);
			}
			map.closeInfoWindow();
		}
	}

	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : store_sql
		},
		root: 'r',
		fields: fields
	});
	function render_type(val){
		if(val == '5'){
			return '';
		}
		return '<img src="/api/image/poi/'+val+'.png?'+Math.random()+'">';
	}
    var grid = new Ext.grid.GridPanel({
        store: store,
        sm : sm,
        region:'center',
        split:true,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
        	sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{header: 'POI点名称', width: 130, sortable: true, dataIndex: 'overlay_name'},
        	{header: "管线名称", width: 130, sortable: true, dataIndex: 'polyline_name'},
        	{header: "类型", width: 50, sortable: true, dataIndex: 'overlay_type_id',renderer: render_type},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
        ],
        tbar: [
            { 
				id : 'newButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '新增记录',
				scope : this,
				handler: function(){
					is_approve = true;
					attribute_grid.setSource({});
					Ext.getCmp('saveModifyBut').setDisabled(true);
					Ext.getCmp('point_name').setValue("");
					Ext.getCmp('memo').setValue("");
					type_combo.setValue("");
					polyline_combo.setValue("");
					Ext.getCmp('drow_point').enable();
					type_combo.enable();
					cardPanel.layout.setActiveItem(panel);
				}
            },{
				text : '查看附属',
				id : 'add_part_Button',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '查看附属',
				scope : this,
				disabled : true,
				handler: function(){
					show_window();
				}
            },{ 
            	id : 'editButton',
				text: '修改',
				icon : '/image/module/update.gif',
				tooltip : '修改记录',
				disabled : true,
				handler: function(){
					is_approve = false;
					Ext.getCmp('saveModifyBut').setDisabled(false);
					cardPanel.layout.setActiveItem(panel);
					var sm = grid.getSelectionModel().getSelected();
					Ext.getCmp('point_name').setValue(sm.data.overlay_name);
					Ext.getCmp('memo').setValue(sm.data.memo);
					polyline_combo.setValue(sm.data.polyline_id);
					type_combo.setValue(sm.data.overlay_type_id);
					type_combo.disable();
					var overlay_id = sm.data.overlay_id;
					attribute_grid.setSource({});
					Zion.db.getJSON('axiom_overlay_point.axiom_info_attribute_value.update',[selectCorpId,overlay_id],function(data){
						if(!data.f){
							
							if(data.r == ''){
								return;
							}
							var data_value = data.r;
							p_source_update = {};
							p_source_update_value = [];
							for(var i = 0;i < data_value.length; i++){
								p_source_update[data_value[i][0]] = data_value[i][1]?data_value[i][1]:'';
								p_source_update_value[i] = [data_value[i][0] , data_value[i][1] ,data_value[i][2],data_value[i][3]];
								p_source_update_array.push(new Ext.grid.PropertyRecord({name:data_value[i][0],value:data_value[i][1]},data_value[i][2]));
							}
							//attribute_grid.setSource(p_source_update);
							attribute_grid.getStore().loadRecords({records:p_source_update_array},{},true);
						}
					})
					modify_x = sm.data.x;
					modify_y = sm.data.y;
					var point = new GLatLng(modify_y , modify_x);
					map.setCenter(point, 13);
					modify_poi_id = sm.data.overlay_id;
				}
            },{
				text : '删除',
				id : 'deleteButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				disabled : true,
				handler: deleteData
            },{
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
            		store.load({params : {start : 0, limit : Ext.zion.page.limit}});
					disableButton();
				},
				scope : this
			}
        ],
        bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		listeners: {
			cellclick : function( grid, rowIndex, columnIndex, e ){
				if(marker){
					map.removeOverlay(marker);
				}
				var record_ = grid.getStore().getAt(rowIndex);
				var x = record_.get('x');
				var y = record_.get('y');
				var overlay_type_id = record_.get('overlay_type_id');
				var point = new GLatLng(y, x);
				/*var targetIcon = new GIcon();
				targetIcon.iconSize = new GSize(26, 26);
				targetIcon.iconAnchor = new GPoint(13, 13);
				targetIcon.image = "/api/image/poi/"+overlay_type_id+".png";
				var markerOptions = {
					icon : targetIcon,
					clickable : false
				}
				marker = new GMarker(point, markerOptions);
				map.addOverlay(marker);*/
				map.setCenter(point, 13);
        	}
        }
    });
    //store.load({params : {start : 0, limit : Ext.zion.page.limit}});
    
    
    var type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_info_type.point.select/['+selectCorpId+']'
			})
		});

	var type_combo = new Ext.form.ComboBox({
		fieldLabel : '类型名称',
		hiddenName : 'overlay_type_id',
		valueField : 'overlay_type_id',
		store : type_store,
		displayField : 'overlay_type_name',
		//mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				type_store.removeAll();
				setTimeout(function(){type_store.load();},0);
			},
			'select' : function(this_, record, index){
				Ext.getCmp('drow_point').enable();
				var overlay_type_id = record.get('overlay_type_id');
	    		var attribute_store = new Ext.data.SimpleStore({
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type_attribute.type_attribute.type.search/['+overlay_type_id+','+selectCorpId+']'
					}),
					root : "r", 
					fields :  attribute_fields,
					listeners:{
						'load':  {
							fn : function(store, records,options) {
								var propGrid = Ext.getCmp('propGrid');
								if (propGrid) {
									p_source = {}; 
									p_source_value = [];
									for(var i = 0; i < records.length; i++){
										var attribute_type_memo = get_attribute_fields_default_value(records[i].get('attribute_type_name'));
										p_source[records[i].get('overlay_attribute_name')] =  attribute_type_memo;
										p_source_value[i] = [records[i].get('overlay_attribute_id'),records[i].get('attribute_type_name'),records[i].get('overlay_attribute_name')];
									}
							        attribute_grid.setSource(p_source);
								}
				             } 
						}
					}
				});
				attribute_store.load();
			}				
		}
	});
	//type_store.load();
	
/*	var attribute_store = new Ext.data.SimpleStore({
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/poi_layout.type_attribute.select'
		}),
		root : "r", 
		fields :  attribute_fields
	});*/
	
	/**管线下拉框**/
	 var polyline_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['overlay_id', 'overlay_name', 'point_set'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/management.point.polyline.select/['+selectCorpId+']'
		})
	});
	
    var polyline_combo = new Ext.form.ComboBox({
    	fieldLabel : '管线名称',
		hiddenName : 'overlay_id',
		valueField : 'overlay_id',
		store : polyline_store,
		displayField : 'overlay_name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				polyline_store.removeAll();
				setTimeout(function(){polyline_store.load();},0);
			},
			'select' : function(this_, record, index){
				if(Polyline){
					map.removeOverlay(Polyline);
				}
				var polyline = record.data["point_set"];
				var points_arr = polyline.split(';');
				var points = [];
				var xy_arr = points_arr[0].split(',');
				var x = xy_arr[0];
				var y = xy_arr[1];
				
				for(var i = 0;i < points_arr.length;i ++){
					var xy_arr_ = points_arr[i].split(',');
					points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
				}
				Polyline = new GPolyline(points,'blue',3);
				var bounds = Polyline.getBounds();
				map.addOverlay(Polyline);
				map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
			}
		}
    });
    
    
    /**属性框**/
	var attribute_grid = new Ext.grid.PropertyGrid({
		title:'属性填写',
		region:'center',
		id:'propGrid',
		layout:'fit',
		source:	{
        },
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});

	/**属性框**/
	var show_attribute_grid = new Ext.grid.PropertyGrid({
		title:'属性查看',
		flex:2,
		height:250,
		region:'south',
		split:true,
		layout:'fit',
		source:	{
        },
        selModel : new Ext.grid.RowSelectionModel( {
			singleSelect : true
		}),
        listeners : {
			beforeedit : function() {
				return false;
			}
		},
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	
    var form = new Ext.Panel({
    	region:'north',
    	height:250,
    	layout:'form',
    	buttonAlign: 'center',
	    bodyStyle:'padding:0px 0px 0',
		frame : true,
	    defaults: {width: 200},
	    labelWidth:75,
    	items: [{
    		id: 'point_name',
    		xtype: 'textfield',
    		fieldLabel: '设备名称'
    	},
		type_combo,polyline_combo
		,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '备注',
    		height: 100
    	}],
		buttons: [{
            text: '标注设备',
            id:'drow_point',
            handler: pointDraw
        },{
        	id: 'saveModifyBut',
            text: '保存',
            disabled: true,
            handler: saveDate
        },{
            text: '返回',
            handler: function(){
            	cardPanel.layout.setActiveItem(grid_panel);
            	if(Polyline){
					map.removeOverlay(Polyline);
				}
            	if(marker){
					map.removeOverlay(marker);
					marker = null;
				}
            }
        }]
    });
    
	var panel = new Ext.Panel({
    	layout:'border',
    	border:false,
		items: [form,attribute_grid]
    })
    
    
	sm.on('rowselect', function() {
		var sm = grid.getSelectionModel().getSelected();
		var overlay_id = sm.data.overlay_id;
		Zion.db.getJSON('axiom_overlay_point.axiom_info_attribute_value.update',[selectCorpId,overlay_id],function(data){
			if(!data.f){
				if(data.r == ''){
					return;
				}
				var data_value = data.r;
				var show_attribute_source = {};
				for(var i = 0;i < data_value.length; i++){
					show_attribute_source[data_value[i][0]] = data_value[i][1]?data_value[i][1]:'';
					
				}
				show_attribute_grid.setSource(show_attribute_source);
			}
		})
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_part_Button').enable();
		} else {
			Ext.getCmp('add_part_Button').disable();
		}
	});
	sm.on('rowdeselect', function() {
		show_attribute_grid.setSource({});
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_part_Button').enable();
		} else {
			Ext.getCmp('add_part_Button').disable();
		}
	});
	
	/**增加修改设施点**/
	function saveDate(){
		loadMask.show();
		var attribute_value;
		var attribute_id;
		var point_name = Ext.getCmp('point_name').getValue();
		if(!point_name){
			Ext.Msg.alert('提示','请输入POI点名称!');
			return;
		}
		if(type_combo.getValue() == ''){
			Ext.Msg.alert('提示','请输入类型名称!');
			return;
		}
		if(polyline_combo.getValue() == ''){
			Ext.Msg.alert('提示','请输入类型名称!');
			return;
		}
		var params = [];
		var attribute_params = [];
		var polyline_id = polyline_combo.getValue();
		var memo = Ext.getCmp('memo').getValue();
		params.push(point_name);
		params.push(type_combo.getValue());
		if(g_x){
			params.push(g_x);
			params.push(g_y);
		}else{
			params.push(modify_x);
			params.push(modify_y);
		}
		params.push(selectCorpId);
		params.push(parseInt(new Date().getTime()/1000));
        params.push(memo);
		if(is_approve){
			Zion.db.getJSON('axiom_overlay_point.id.select',null,function(data){
				if(!data.f){
					var id = data.r[0][0];
					params.unshift(id);
					Ext.zion.db.getJSON('axiom_overlay_point.insert', params, function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "添加失败");
							loadMask.hide();
						} else {
							if (data.r == 1) {
								Zion.db.getJSON('axiom_overlay_relation.insert',[id,polyline_id],function(data){
									if(!data.f){
										for(var j = 0 ; j < p_source_value.length; j++){
											attribute_params = [id,p_source_value[j][0],Ext.getCmp('propGrid').getSource()[p_source_value[j][2]]];
											Zion.db.getJSON('axiom_info_attribute_value.insert',attribute_params,function(data){
												if(!data.f){
													
													Ext.Msg.alert("提示", "添加成功");
													grid.store.reload();
													
													if(Polyline){
														map.removeOverlay(Polyline);
													}
												}
											});
										}
									}else{
									}
								});
								store.load({params : {start : 0, limit : Ext.zion.page.limit}});
								disableButton();
								map.clearOverlays();
								Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
									pois = [];
									 for ( var i = 0; i < data.r.length; i++) {
										var d = data.r[i];
										pois.push({
												id:d[0],
												x:d[2],
												y:d[3],
												text:d[1],
												type:d[4],
												memo:d[5] == null ? '' : d[5],
												type_name:d[6]
											});
									}
									poiManager.draw(pois);
									cardPanel.layout.setActiveItem(grid_panel);
									show_attribute_grid.setSource({});
									if(marker){
										map.removeOverlay(marker);
										marker = null;
									}
								});
								loadMask.hide();
							} else {
								Ext.Msg.alert("提示", "添加失败");
							}
						}
					})
				}else{
					
				}
			})
			
		}else if(!is_approve && modify_poi_id){
			params.push(modify_poi_id);
			Ext.zion.db.getJSON('axiom_overlay_point.update', params, function(data) {
				if (data.f) {
					Ext.Msg.alert("提示", "修改失败");
					loadMask.hide();
				} else {
					if (data.r == 1) {
						Zion.db.getJSON('pipe.management.axiom_overlay_relation.update',[polyline_id,modify_poi_id],function(data){
							if(data.r){
								if(data.r != "" || data.r != null){
									for(var i = 0; i < p_source_update_value.length; i ++){
										var params_update = [Ext.getCmp('propGrid').getSource()[p_source_update_value[i][2]]?Ext.getCmp('propGrid').getSource()[p_source_update_value[i][2]]:p_source_update_value[i][1],modify_poi_id,p_source_update_value[i][2]];
										Zion.db.getJSON('axiom_info_attribute_value.update',params_update,function(data){
											if(!data.f){
												map.clearOverlays();
												Ext.Msg.alert("提示", "修改成功");
												loadMask.hide();
											}else{
												Ext.Msg.alert("提示", "修改失败");
												loadMask.hide();
											}
										})
									}
									store.load({params : {start : 0, limit : Ext.zion.page.limit}});
									disableButton();
								}
							}
						})
						map.clearOverlays();
						Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
							pois = [];
							 for ( var i = 0; i < data.r.length; i++) {
								var d = data.r[i];
								pois.push({
										id:d[0],
										x:d[2],
										y:d[3],
										text:d[1],
										type:d[4],
										memo:d[5] == null ? '' : d[5],
										type_name:d[6]
									});
							}
							poiManager.draw(pois);
							
							cardPanel.layout.setActiveItem(grid_panel);
							show_attribute_grid.setSource({});
							if(marker){
								map.removeOverlay(marker);
								marker = null;
							}
						});
					} else {
						Ext.Msg.alert("提示", "修改失败");
					}
				}
			})
		}
	}
	
	function pointDraw(){
    	Ext.getCmp('saveModifyBut').setDisabled(true);
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
			var image_ = type_combo.getValue();
			targetIcon.image = "/api/image/poi/"+image_+".png?"+Math.random();

			var markerOptions = {
				icon : targetIcon,
				clickable : true
			}
			var point = new GLatLng(g_y, g_x);
			marker = new GMarker(point, markerOptions);
			map.addOverlay(marker);
            Ext.getCmp('saveModifyBut').setDisabled(false);
            removeListener();
        });
    }
    
    /**附属窗口**/
	function show_window(){
		var sm = grid.getSelectionModel().getSelected();
		var overlay_id = sm.data.overlay_id;
		part_sm = new Ext.grid.CheckboxSelectionModel();
		
		part_sm.on('rowselect', function() {
			if (part_grid.selModel.getSelections().length == 1) {
				Ext.getCmp('part_edit_button').enable();
			} else {
				Ext.getCmp('part_edit_button').disable();
			}
			if (part_grid.selModel.getSelections().length != 0) {
				Ext.getCmp('part_del_button').enable();
			} else {
				Ext.getCmp('part_del_button').disable();
			}
		});
		part_sm.on('rowdeselect', function() {
			if (part_grid.selModel.getSelections().length == 1) {
				Ext.getCmp('part_edit_button').enable();
			} else {
				Ext.getCmp('part_edit_button').disable();
			}
			if (part_grid.selModel.getSelections().length != 0) {
				Ext.getCmp('part_del_button').enable();
			} else {
				Ext.getCmp('part_del_button').disable();
			}
		});
	
		part_store = new Ext.zion.db.ArrayStore({
			db : {
				alias : "axiom_overlay_part.select",
				params:[overlay_id]
			},
			root: 'r',
			fields: [
				 'part_id', 'part_name','overlay_type_id','overlay_type_name', 'overlay_name', 'reg_date', 'memo'
			]
		});
	    part_grid = new Ext.grid.GridPanel({
	        store: part_store,
	        sm : part_sm,
	        height:400,
	        width:550,
	        region:'center',
	        split:true,
	        enableColumnHide : false,
	        columns: [
	        	part_sm,
	        	new Ext.grid.RowNumberer({header:'序号',width:35}),
	        	{header: '名称', width: 130, sortable: true, dataIndex: 'part_name'},
				{header: "类型", width: 70, sortable: true, dataIndex: 'overlay_type_id',renderer: render_type},
				{header: "附属设备名称", width: 100, sortable: true, dataIndex: 'overlay_name'},
	        	{header: "备注", width: 100, sortable: true, dataIndex: 'memo'}
	        ],
	        tbar: [
	            { 
					id : 'part_add_button',
					text : '新增',
					icon : Ext.zion.image_base+'/add.gif',
					tooltip : '新增记录',
					scope : this,
					handler: function(){
						update_part = true;
						add_update_part(overlay_id);
					}
	            },'-',{ 
	            	id : 'part_edit_button',
					text: '修改',
					icon : '/image/module/update.gif',
					tooltip : '修改记录',
					disabled : true,
					handler: function(){
						update_part = false;
						add_update_part(overlay_id);
					}
	            },'-',{
					text : '删除',
					id : 'part_del_button',
					icon : Ext.zion.image_base+'/delete.gif',
					tooltip : '删除记录',
					scope : this,
					disabled : true,
					handler: function(){
						delete_part();
					}
	            }, '-', {
					text : '刷新',
					icon : Ext.zion.image_base+'/refresh.gif',
					tooltip : '刷新记录',
					handler : function() {
	            		part_store.reload();
						part_disable_button();
					},
					scope : this
				}
	        ],
	        bbar : new Ext.PagingToolbar( {
				store : part_store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			})
	    });
	    part_store.load({params : {start : 0, limit : Ext.zion.page.limit}});
	    var window = new Ext.Window({
	    	height:400,
	    	width:500,
	    	title : '附属设施列表',
				closable : true,
				items : [ part_grid ],
				buttons : [ {
					text : '关闭',
					handler : function() {
						window.close();
					}
				} ]
	    });
	    window.show();
	}
	
	function add_update_part(overlay_id){
		var part_type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_info_type.point.select/['+selectCorpId+']'
			})
		});

		var part_type_combo = new Ext.form.ComboBox({
			fieldLabel : '类型名称',
			hiddenName : 'overlay_type_id',
			valueField : 'overlay_type_id',
			store : part_type_store,
			displayField : 'overlay_type_name',
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});
		
		part_type_store.load();
		
		var part_form = new Ext.Panel({
	    	frame:true,
	    	height:160,
	    	layout:'form',
	    	buttonAlign: 'center',
		    bodyStyle:'padding:0px 0px 0',
			frame : true,
			split:true,
		    defaults: {width: 200},
		    labelWidth:75,
	    	items: [{
	    		id: 'part_name',
	    		xtype: 'textfield',
	    		fieldLabel: '名称'
	    	},part_type_combo,{
	    		id: 'part_memo',
	    		xtype: 'textarea',
	    		fieldLabel: '信息',
	    		height: 80
	    	}]
	    });
	    var part_window = new Ext.Window({
	    	width:380,
	    	title : '附属设施列表',
			closable : true,
			items : [ part_form ],
			buttons : [{
				text : '保存',
				handler : function() {
					var part_name = Ext.getCmp("part_name").getValue();
					var type_id = part_type_combo.getValue();
					var part_memo = Ext.getCmp("part_memo").getValue();
					if(part_name == ""){
						Ext.Msg.alert("提示","附属设施名称不能为空");
						return;
					}
					
					if(type_id == ""){
						Ext.Msg.alert("提示","类型不能为空");
						return;
					}
					if(update_part == true){
						Zion.db.getJSON('pipe.management.data.point.axiom_overlay_part.id.select',null,function(data){
							if(data.r){
								var id = data.r[0][0];
								var params = [id,part_name,type_id,overlay_id,parseInt(new Date().getTime()/1000),part_memo];
								Zion.db.getJSON('pipe.management.data.point.axiom_overlay_part.insert',params,function(data){
									if(data.r){
										Ext.Msg.alert('提示','数据添加成功');
										part_window.close();
										part_disable_button();
										part_store.reload();
									}else{
										Ext.Msg.alert('提示','数据添加失败');
										part_disable_button();
										part_store.reload();
									}
								});
							}else{
							}
						});
					}else{
						var part_sm = part_grid.getSelectionModel().getSelected();
						var part_id = part_sm.data.part_id;
						var params = [part_name,part_memo,part_id];
						Zion.db.getJSON('pipe.management.data.point.axiom_overlay_part.update',params,function(data){
							if(data.r){
								Ext.Msg.alert('提示','数据修改成功');
								part_disable_button();
								part_store.reload();
								part_window.close();
							}else{
								Ext.Msg.alert('提示','数据修改失败');
								part_disable_button();
								part_store.reload();
								part_window.close();
							}
						});
					}
				}
			},{
				text : '关闭',
				handler : function() {
					part_window.close();
				}
			} ]
	    });
	    part_window.show();
	    if(update_part == true){
			Ext.getCmp("part_name").setValue("");
			part_type_combo.setValue("");
			Ext.getCmp("part_memo").setValue("");
		}else{
			var part_sm = part_grid.getSelectionModel().getSelected();
			Ext.getCmp("part_name").setValue(part_sm.data.part_name);
			part_type_combo.setValue(part_sm.data.overlay_type_name);
			part_type_combo.disable();
			Ext.getCmp("part_memo").setValue(part_sm.data.memo);
		}
	}
	function part_disable_button(){
		Ext.getCmp('part_edit_button').disable();
		Ext.getCmp('part_del_button').disable();
	}
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('add_part_Button').disable();
	}
	
	/**删除漏巡点**/
	function deleteData() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var id = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.overlay_id);
					}
					var delete_poi = function(id) {
						if (id.length > 0) {
							var overlay_id =  id.pop();
							Ext.zion.db.getJSON("axiom_overlay_point.delete", [overlay_id], function(data) {
								if(data.r){
									Zion.db.getJSON('axiom_overlay_relation.delete',[overlay_id],function(data){
										if(!data.f){
											Zion.db.getJSON('axiom_overlay_attribute_value.point.delete',[overlay_id],function(data){
												if(!data.f){
													delete_poi(id);
												}else{
													Ext.Msg.alert("提示", "删除失败");
												}
											})
										}
									})
								}
							});
						}else{
							Ext.Msg.alert("提示", "删除成功");
							show_attribute_grid.setSource({});
							grid.store.reload();

							disableButton();
							map.clearOverlays();
							Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
								pois = [];
								 for ( var i = 0; i < data.r.length; i++) {
									var d = data.r[i];
									pois.push({
											id:d[0],
											x:d[2],
											y:d[3],
											text:d[1],
											type:d[4],
											memo:d[5] == null ? '' : d[5],
											type_name:d[6]
										});
								}
								poiManager.draw(pois);
							});
						}
					};
					delete_poi(id);
				}
			})
		}
	}
	
	var id = [];
	function delete_part(){
		var sm = part_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.part_id);
						} else {
							store.remove(store.getAt(i));
						}
					}
					if (id.length > 0) {
						deleNext();
					}
				}
			});
		}
	}
	var deleNext = function() {
		if (id.length > 0) {
			var params = [ id.pop() ];
			Zion.db.getJSON('pipe.management.data.point.axiom_overlay_part.delete',params,function(data){
				if(!data.f){
					Ext.Msg.alert("提示","数据删除成功");
					part_store.reload();
					part_disable_button();
					Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
						pois = [];
						 for ( var i = 0; i < data.r.length; i++) {
							var d = data.r[i];
							pois.push({
									id:d[0],
									x:d[2],
									y:d[3],
									text:d[1],
									type:d[4],
									memo:d[5] == null ? '' : d[5],
									type_name:d[6]
								});
						}
						if(map.getZoom() >= 5){
							poiDrawed = true;
							poiManager.draw(pois);
						}
					});
				}else{
					Ext.Msg.alert("提示","数据删除失败");
					part_store.reload();
					part_disable_button();
				}
				deleNext();
			})
		}else{
			grid.store.reload();
		}
	}
	
	var grid_panel = new Ext.Panel({
		layout:'border',
		defaults : {
			border : true
		},
		items : [  grid , show_attribute_grid]
	})
	var cardPanel = new Ext.Panel({
		activeItem: 0,
		layout:'card',
		margins : '5 0 0 0',
		split : true,
		width : 300,
		region : 'west',
		items: [
			grid_panel,panel
		]
	});
	
	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				disableButton();
				selectCorpId = node.attributes.corp.corp_id;
				map.clearOverlays();
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
				type_store.constructor({
					root : 'r',
					fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type.point.select/['+selectCorpId+']'
					})
				});
				type_store.load();
				polyline_store.constructor({
					root : 'r',
					fields : ['overlay_id', 'overlay_name', 'point_set'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/management.point.polyline.select/['+selectCorpId+']'
					})
				});
				polyline_store.load();
				Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
								pois = [];
								 for ( var i = 0; i < data.r.length; i++) {
									var d = data.r[i];
									pois.push({
											id:d[0],
											x:d[2],
											y:d[3],
											text:d[1],
											type:d[4],
											memo:d[5] == null ? '' : d[5],
											type_name:d[6]
										});
								}
								poiManager.draw(pois);
								
							});
			}
		}
	});

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
			corp_tree.getRootNode().childNodes[0].select();			
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
		
		type_store.constructor({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_info_type.point.select/['+selectCorpId+']'
			})
		});
		type_store.load();
		polyline_store.constructor({
			root : 'r',
			fields : ['overlay_id', 'overlay_name', 'point_set'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/management.point.polyline.select/['+selectCorpId+']'
			})
		});
		polyline_store.load();
		Zion.db.getJSON("axiom_overlay_point.axiom_overlay_route.point.select", [selectCorpId], function(data){
			pois = [];
			 for ( var i = 0; i < data.r.length; i++) {
				var d = data.r[i];
				pois.push({
						id:d[0],
						x:d[2],
						y:d[3],
						text:d[1],
						type:d[4],
						memo:d[5] == null ? '' : d[5],
						type_name:d[6]
					});
			}
			poiManager.draw(pois);
			
		});
	});

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		}, {
			region : 'center',
			layout : 'fit',
			items : [{ 
				layout : 'border',
				border : false,
				items : [{
					region : 'west',
					layout : 'fit',
					title: '设备列表',
					collapsible : true,
					height : 200,
					width : 300,
					items : [ cardPanel ]
				}, {
					layout : 'fit',
					region : 'center',
					contentEl : 'map_canvas',
					cmargins : '5 0 0 0',
					tbar:overly_buttons,
					listeners : {
						bodyresize : function(p, width, height) {
							document.getElementById("map_canvas").style.width = width;
							document.getElementById("map_canvas").style.height = height;
							if (map) {
								map.checkResize();
							}
						}
					}
				}]
			}]
		}]
	});

	function removeListener(){
		if(e_click){
			GEvent.removeListener(e_click);
			e_click = null;
		}
	}
	
	function get_attribute_fields_default_value(attribute_fields_type){
		var default_value = attribute_fields_default[attribute_fields_type];
		if(default_value){
			return default_value;
		}else{
			return '';
		}
	}
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	if(map_state == 0){
		map.setCenter(new GLatLng(38.718465,116.099052), 4);
		loadMask.hide();
	}else if(map_state == 1){
		map.setCenter(new GLatLng(38.718465,116.099052), 4);
		loadMask.hide();
	}

	var poiManager = new Zion.POI(map,{image_base:'/api/image/poi',icon_size:26});
	var pois = [];
	
	var poiDrawed = false;
	/*
	GEvent.addListener(map, "zoomend", function(oldLevel, newLevel){
		if(newLevel >= 5){
			if(!poiDrawed){
				poiDrawed = true;
				poiManager.draw(pois);
			}
		}else{
			if(poiDrawed){
				poiDrawed = false;
				poiManager.clear();
			}
		}
	});
	*/
});
