Ext.onReady(function() {
	Ext.QuickTips.init();
	var marker;
	var e_click = null;
	var g_x;
	var g_y;
	var modify_x;
	var modify_y;
	var is_approve=false;
	var formPanel;
	var limit = 20;
	var modify_poi_id;
	var map_state = 1;//地图状态,0:初始状态;1:管线项目,显示管线.
	var attribute_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo'];
	
	var p_source;
	var p_source_value;
	var p_source_update;
	var p_source_update_value;
	var attribute_fields_default = {'image':'图片','text':'','number':0,'date':new Date()};

	function dateRender(val){
    	return new Date(val*1000).toLocaleString();
    }
    
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var sm = new Ext.grid.CheckboxSelectionModel();
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "axiom_event_point.select"
		},
		root: 'r',
		fields: [
			 'overlay_id','overlay_name','overlay_type_id','overlay_type_name','x','y','reg_date','memo'
		]
	});
	function render_type(val){
		if(val == '5'){
			return '';
		}
		return '<img src="/api/image/poi/'+val+'_event.png?'+Math.random()+'">';
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
        	{header: "类型", width: 50, sortable: true, dataIndex: 'overlay_type_id',renderer: render_type},
        	{header: "信息", width: 130, sortable: true, dataIndex: 'memo'}
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
					Ext.getCmp('point_name').reset();
					Ext.getCmp('memo').reset();
					type_combo.reset();
					type_combo.enable();
					cardPanel.layout.setActiveItem(panel);
					
				}
            },'-',{ 
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
					type_combo.setValue(sm.data.overlay_type_id);
					type_combo.disable();
					var overlay_id = sm.data.overlay_id;
					Zion.db.getJSON('axiom_event_point.axiom_event_attribute_value.update',[overlay_id],function(data){
						if(!data.f){
							if(data.r == ''){
								return;
							}
							var data_value = data.r;
							p_source_update = {};
							p_source_update_value = [];
							for(var i = 0;i < data_value.length; i++){
								p_source_update[data_value[i][0]] = data_value[i][1]?data_value[i][1]:'';
								p_source_update_value[i] = [data_value[i][0] , get_attribute_fields_default_value(data_value[i][1]) ,data_value[i][2],data_value[i][3]];
							}
							attribute_grid.setSource(p_source_update);
						}
					})
					modify_x = sm.data.x;
					modify_y = sm.data.y;
					var point = new GLatLng(modify_y , modify_x);
					map.setCenter(point, 13);
					modify_poi_id = sm.data.overlay_id;
				}
            },'-',{
				text : '删除',
				id : 'deleteButton',
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				scope : this,
				disabled : true,
				handler: deleteData
            }, '-', {
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
            		store.load({params : {start : 0, limit : limit}});
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
				var record_ = grid.getStore().getAt(rowIndex);
				var x = record_.get('x');
				var y = record_.get('y');
				var point = new GLatLng(y, x);
				map.setCenter(point, 13);
        	}
        }
    });
    store.load({params : {start : 0, limit : limit}});
    
    
    var type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/event.axiom_event_type.point.select'
			})
		});

	var type_combo = new Ext.form.ComboBox({
		fieldLabel : '类型名称',
		hiddenName : 'overlay_type_id',
		valueField : 'overlay_type_id',
		store : type_store,
		displayField : 'overlay_type_name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		allowBlank : false,
		listeners : {
			'select' : function(this_, record, index){
				var overlay_type_id = record.get('overlay_type_id');
	    		var attribute_store = new Ext.data.SimpleStore({
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/event.poi_layout.type_attribute.type.search/['+overlay_type_id+']'
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
										p_source[records[i].get('overlay_attribute_name')] = attribute_type_memo;
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
	})
	type_store.load();
	
	var attribute_store = new Ext.data.SimpleStore({
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/event.poi_layout.type_attribute.select'
		}),
		root : "r", 
		fields :  attribute_fields
	});
	
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
	
    attribute_grid.on('beforeedit',function(e){
    	if(e.value == '图片'){
    		var formPanel =  new Ext.form.FormPanel( {
				defaultType : 'textfield',
				autoScroll : true,
				fileUpload: true,
				items : [{
					xtype: 'fileuploadfield',
					//inputType:'file',
					id: 'file_path',
					emptyText: '选择上传图片',
					fieldLabel: '文件上传',
					name: 'file_path',
					blankText : '请选择上传图片',
					buttonText: '',
					regexText :'支持jpeg,jpg,gif,bmp的图片上传',
					regex:/^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w].*))(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.bmp|.BMP)$/,
					buttonCfg: {
						iconCls: 'upload-icon'
					}
				}]
    		})
    		var win  = new Ext.Window({
    			title : '上传图片',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					text : '确定',
					id : 'save',
					handler : function() {
						var filePath = formPanel.form.findField('file_path').getValue();
						var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
						var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
						var path = new Date().getTime()+fileType;
						var url = '/upload/'+Ext.zion.token+'/anyplace.user/'+Zion.util.encodeParam([path]);
						if(formPanel.form.findField('file_path').getValue().length>0){
							formPanel.getForm().submit({
								url : url,
								waitTitle: '请稍等...',
								waitMsg : '上传中......',
								success : function(data){
									if(data.r == 'ok'){
										Ext.Msg.alert('上传提示','上传图片成功');
										e.value = path;
										win.close();
									}else{
										Ext.Msg.alert('上传提示','上传图片错误');
										win.close();
									}
								},
								failure : function(form,action){
									
								}
							})
						}
					}
				}, {
					text : '取消',
					id : 'cancle',
					handler : function() {
						formPanel.form.reset();
						win.close();
					}
				} ]
    		})
    		win.show();
    	}
    });

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
    	frame:true,
    	height:210,
    	layout:'form',
    	buttonAlign: 'center',
	    bodyStyle:'padding:0px 0px 0',
		frame : true,
	    defaults: {width: 200},
	    labelWidth:75,
    	items: [{
    		id: 'point_name',
    		xtype: 'textfield',
    		fieldLabel: 'POI点名称',
    		allowBlank:false
    	},
		type_combo
		,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '信息',
    		height: 100
    	}],
		buttons: [{
            text: '标注POI点',
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
		Zion.db.getJSON('axiom_event_point.axiom_event_attribute_value.update',[overlay_id],function(data){
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
	});
	
	function saveDate(){
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
	
		
		var params = [];
		var attribute_params = [];
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
		params.push(parseInt(new Date().getTime()/1000));
        params.push(memo);
		if(is_approve){
			Zion.db.getJSON('event.axiom_event_point.id.select',null,function(data){
				if(!data.f){
					var id = data.r[0][0];
					params.unshift(id);
					Ext.zion.db.getJSON('axiom_event_point.insert', params, function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "添加失败");
						} else {
							if (data.r == 1) {
								for(var j = 0 ; j < p_source_value.length; j++){
									attribute_params = [id,p_source_value[j][0],Ext.getCmp('propGrid').getSource()[p_source_value[j][2]]];
									Zion.db.getJSON('axiom_event_attribute_value.insert',attribute_params,function(data){
										if(!data.f){
												Ext.Msg.alert("提示", "添加成功");
										}
									})
								}
								store.load({params : {start : 0, limit : limit}});
								disableButton();
								Zion.db.getJSON("axiom_event_point.axiom_event_attribute_value.select", null, function(data){
									pois = [];
									 for ( var i = 0; i < data.r.length; i++) {
										var d = data.r[i];
										pois.push({
												id:d[0],
												x:d[2],
												y:d[3],
												text:d[1],
												type:d[4],
//												info:eval("(" + d[5] + ")"),
												memo:d[5] == null ? '' : d[5]
											});
									}
									if(map.getZoom() >= 13){
										poiDrawed = true;
										poiManager.draw(pois);
									}
									cardPanel.layout.setActiveItem(grid_panel);
									show_attribute_grid.setSource({});
									if(marker){
										map.removeOverlay(marker);
										marker = null;
									}
								});
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
			Ext.zion.db.getJSON('axiom_event_point.update', params, function(data) {
				if (data.f) {
					Ext.Msg.alert("提示", "修改失败");
				} else {
					if (data.r == 1) {
						if(p_source_update_value == "" || p_source_update_value == null){
							Ext.Msg.alert("提示", "修改成功");
						}else{
							for(var i = 0; i < p_source_update_value.length; i ++){
								var params_update = [Ext.getCmp('propGrid').getSource()[p_source_update_value[i][0]],modify_poi_id,p_source_update_value[i][2]];
								Zion.db.getJSON('axiom_event_attribute_value.update',params_update,function(data){
									if(!data.f){
										Ext.Msg.alert("提示", "修改成功");
									}else{
										Ext.Msg.alert("提示", "修改失败");
									}
								})
							}
						}
						store.load({params : {start : 0, limit : limit}});
						disableButton();
						Zion.db.getJSON("axiom_event_point.axiom_event_attribute_value.select", null, function(data){
							pois = [];
							 for ( var i = 0; i < data.r.length; i++) {
								var d = data.r[i];
								pois.push({
										id:d[0],
										x:d[2],
										y:d[3],
										text:d[1],
										type:d[4],
//										info:eval("(" + d[5] + ")"),
										memo:d[5] == null ? '' : d[5]
									});
							}
							if(map.getZoom() >= 13){
								poiDrawed = true;
								poiManager.draw(pois);
							}
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
			targetIcon.image = "/api/image/event/"+image_+"_event.png?"+Math.random();

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
	
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
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
							Ext.zion.db.getJSON("axiom_event_point.delete", [overlay_id], function(data) {
								if(data.r){
									Zion.db.getJSON('axiom_event_attribute_value.delete',[overlay_id],function(data){
										if(!data.f){
											delete_poi(id);
										}else{
											Ext.Msg.alert("提示", "删除失败");
										}
									})
									
								}
							});
						}else{
							Ext.Msg.alert("提示", "删除成功");
							show_attribute_grid.setSource({});
							grid.store.reload();
							//store.load({params : {start : 0, limit : limit}});
							disableButton();
							Zion.db.getJSON("axiom_event_point.axiom_event_attribute_value.select", null, function(data){
								pois = [];
								 for ( var i = 0; i < data.r.length; i++) {
									var d = data.r[i];
									pois.push({
											id:d[0],
											x:d[2],
											y:d[3],
											text:d[1],
											type:d[4],
//											info:eval("(" + d[5] + ")"),
											memo:d[5] == null ? '' : d[5]
										});
								}
								if(map.getZoom() >= 13){
									poiDrawed = true;
									poiManager.draw(pois);
								}
							});
						}
					};
					delete_poi(id);
				}
			})
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
		title: '事件列表',
		activeItem: 0,
		layout:'card',
		margins : '5 0 0 0',
		collapsible : true,
		split : true,
		width : 300,
		region : 'west',
		items: [
			grid_panel,panel
		]
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [  cardPanel , {
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
	
	/*function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][1] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}*/
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	if(map_state == 0){
		map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
		loadMask.hide();
	}else if(map_state == 1){
		map.setCenter(new GLatLng(25.676186684959894, 119.1082763671875), 8);
	/*	Zion.db.getJSON("realtime.polyline.select", null, function(data) {
			drawPolyline(data);
			
		});*/
		loadMask.hide();
	}

	var poiManager = new Zion.POI(map,{image_base:'/api/image/event',icon_size:26});
	var pois = [];
	Zion.db.getJSON("axiom_overlay_point.axiom_overlay_attribute_value.select", null, function(data){
		 for ( var i = 0; i < data.r.length; i++) {
			var d = data.r[i];
			pois.push({
					id:d[0],
					x:d[2],
					y:d[3],
					text:d[1],
					type:d[4],
//					info:eval("(" + d[5] + ")"),
					memo:d[5] == null ? '' : d[5]
				});
		}
	});
	var poiDrawed = false;
	
	GEvent.addListener(map, "zoomend", function(oldLevel, newLevel){
		if(newLevel >= 13){
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
	
});
