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
	var fields = ['overlay_id','overlay_name','overlay_type_id','overlay_type_name','x','y','reg_date','memo','polyline_id','polyline_name','dictionary_id'];
	var p_source;
	var p_source_value;
	var p_source_update;
	var p_source_update_value = [];
	var p_source_update_array = [];
	var part_source;
	var part_source_value;
	var part_source_update;
	var part_source_update_value = [];
	
	var attribute_fields_default = {'image':'图片','text':'','number':0,'date':new Date()};
	var dictionary_id;

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
						var color = data_value[i][7];
						var width = data_value[i][8];
						var opacity = data_value[i][9];
						var color_value;
						color_value = Zion.util.color(color);
						var points_arr = polyline.split(';');
						var points = [];
						var xy_arr = points_arr[0].split(',');
						var x = xy_arr[0];
						var y = xy_arr[1];
						
						for(var j = 0;j < points_arr.length;j ++){
							var xy_arr_ = points_arr[j].split(',');
							points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
						}
						var Polyline = new GPolyline(points,color_value,width,opacity);
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
        	{header: "类型", width: 50, sortable: true, dataIndex: 'overlay_type_id',renderer: function(v,c,r){
				var overlay_type_id = r.data["overlay_type_id"];
				var dictionary_id = r.data["dictionary_id"];
				if(dictionary_id == "" || dictionary_id == null){
					return '<img src="/api/image/poi/'+overlay_type_id+'.png?'+Math.random()+'"></img>';
				}else{
					return '<img src="/api/image/poi/'+dictionary_id+'.png?'+Math.random()+'"></img>';
				}
			}},
			{header: "经度", width: 80, sortable: true, dataIndex: 'x'},
			{header: "纬度", width: 80, sortable: true, dataIndex: 'y'},
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
					Ext.getCmp("wirte_point").enable();
					attribute_grid.setSource({});
					Ext.getCmp('saveModifyBut').setDisabled(true);
					Ext.getCmp('point_name').setValue("");
					Ext.getCmp('memo').setValue("");
					Ext.getCmp('latitude').setValue("");
					Ext.getCmp('longitude').setValue("");
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
					Ext.getCmp("wirte_point").disable();
					Ext.getCmp('saveModifyBut').setDisabled(false);
					cardPanel.layout.setActiveItem(panel);
					var sm = grid.getSelectionModel().getSelected();
					Ext.getCmp('point_name').setValue(sm.data.overlay_name);
					Ext.getCmp('memo').setValue(sm.data.memo);
					polyline_combo.setValue(sm.data.polyline_id);
					type_combo.setValue(sm.data.overlay_type_id);
					type_combo.disable();
					var overlay_id = sm.data.overlay_id;
					var type_id = sm.data.overlay_type_id;
					attribute_grid.setSource({});
					Zion.db.getJSON('axiom_overlay_point.axiom_info_attribute_value.all.select',[overlay_id,type_id,overlay_id],function(data){
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
					Ext.getCmp("longitude").setValue(modify_x);
					Ext.getCmp("latitude").setValue(modify_y);
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
			id : 'relegateButton',
			disabled : true,
			text : '迁移',
			icon : Ext.zion.image_base+'/relegate.gif',
			tooltip : '迁移管线',
			handler : function() {
				var points = [];
				var sm = grid.getSelectionModel().getSelections();
				for ( var i = 0; i < sm.length; i += 1) {
					if(sm[i].data.polyline_id == null || sm[i].data.polyline_id == ""){
						points.push(sm[i].data.overlay_id);
					}
				}
				relegatePolyline(points, function() {
					grid.store.reload();
					disableButton();
				});
			},
			scope : this
		},{
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
            		store.load({params : {start : 0, limit : Ext.zion.page.limit}});
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
									type_name:d[6],
									dictionary_id:d[7]
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
				map.setCenter(point, 16);
        	}
        }
    });
    //store.load({params : {start : 0, limit : Ext.zion.page.limit}});
    
	//设施迁移
	function relegatePolyline(points, callback, scope){
		loadMask.show();
		Ext.zion.tree.loadCorpTree(function(tree) {
			var relegateToCorp;
			var corp_tree = new Ext.tree.TreePanel( {
				autoScroll : true,
				width : 250,
				height : 250,
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(tree),
				rootVisible : false,
				listeners : {
					click : function(node) {
						relegateToCorp = node.attributes.corp.corp_id;
						if (selectCorpId == relegateToCorp) {
							button.disable();
						} else {
							button.enable();
						}
					}
				}
			});

			function relegateTargetToCorp(points, corp, callback, scope) {
				function doNext() {
					if (points.length > 0) {
						var point_id = points.pop();
						Zion.db.getJSON('pipe.management.data.pipe.axiom_overlay_point.relegate',[ corp, point_id ],function(data){
							doNext();
						});
						
					} else {
						if (callback) {
							callback.call(scope || window);
						}
					}
				}
				doNext();
			}

			var button = new Ext.Button( {
				disabled : true,
				text : '保存',
				handler : function() {
					Ext.Msg.confirm('迁移确认', '绑定管线的设施点不会迁移,你是否确认迁移选中的记录?', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							relegateTargetToCorp(points, relegateToCorp, function() {
								win.close();
								map.clearOverlays();
								if (callback) {
									loadMask.hide();
									callback.call(scope || window);
								}
							});
						}
					}, scope);
				}
			});

			var win = new Ext.Window( {
				title : '设备迁移',
				closable : true,
				items : [ corp_tree ],
				buttons : [ button, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			});
			win.show();
			loadMask.hide();
		});
	}
    
    var type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type','dictionary_id'],
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
				dictionary_id = record.get('dictionary_id');
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

	/**管线下拉框**/
	 var polyline_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['color','width','opacity','overlay_id', 'overlay_name','point_set'],
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
				var color = record.json[3];
				var width = record.json[4];
				var opacity = record.json[5];
				var color_value;
				color_value = Zion.util.color(color);
				var points_arr = polyline.split(';');
				var points = [];
				var xy_arr = points_arr[0].split(',');
				var x = xy_arr[0];
				var y = xy_arr[1];
				for(var i = 0;i < points_arr.length;i ++){
					var xy_arr_ = points_arr[i].split(',');
					points.push(new GLatLng(xy_arr_[1],xy_arr_[0]));
				}
				Polyline = new GPolyline(points,color_value,width,opacity);
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
    	height:290,
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
    	},type_combo,{
    		xtype: 'numberfield',
    		id:'longitude',
    		fieldLabel: '经度',
			decimalPrecision:6,
			listeners : {
				blur : function() {
					if(this.getValue() != "" && Ext.getCmp("latitude").getValue() !=""){
						Ext.getCmp("saveModifyBut").enable();
					}
				}
			}
    	},{
    		id: 'latitude',
    		xtype: 'numberfield',
    		fieldLabel: '纬度',
			decimalPrecision:6,
			listeners : {
				blur : function() {
					if(this.getValue() != "" && Ext.getCmp("longitude").getValue() !=""){
						Ext.getCmp("saveModifyBut").enable();
					}
				}
			}
		},
		polyline_combo
		,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '备注',
    		height: 100
    	}],
		buttons: [{
            text: '标注',
            id:'drow_point',
			width:60,
            handler: pointDraw
        },{
            text: '输入',
			width:60,
            id: 'wirte_point',
            handler: function(){
				wirte_point(); 
            }
        },{
        	id: 'saveModifyBut',
            text: '保存',
			width:60,
            disabled: true,
            handler: saveDate
        },{
            text: '返回',
			width:60,
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
    
	function wirte_point(){
		var type_wirte_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type','dictionary_id'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_info_type.point.select/['+selectCorpId+']'
			})
		});

		var type_wirte_combo = new Ext.form.ComboBox({
			fieldLabel : '类型名称',
			hiddenName : 'overlay_type_id',
			width:290,
			valueField : 'overlay_type_id',
			store : type_wirte_store,
			displayField : 'overlay_type_name',
			//mode : 'local',
			editable : false,
			triggerAction : 'all'
		});
		
		var polyline_write_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_id','overlay_name','point_set','color','width','opacity',],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/management.point.polyline.select/['+selectCorpId+']'
			})
		});
		
		var polyline_write_combo = new Ext.form.ComboBox({
			fieldLabel : '管线名称',
			hiddenName : 'overlay_id',
			valueField : 'overlay_id',
			store : polyline_write_store,
			width:290,
			displayField : 'overlay_name',
			editable : false,
			triggerAction : 'all'
		});

		var formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			width: 400,
			height: 400,
			labelWidth:65,
			items : [type_wirte_combo,polyline_write_combo, {
				fieldLabel : '格式',
				width:290,
				height:70,
				xtype : 'textarea',
				value:'设备名称1 经度1 纬度1\n设备名称2 经度2 纬度2\n...\n设备名称n 经度n 纬度n',
				disabled:true
			},{
				fieldLabel : '名称',
				width:290,
				height:250,
				xtype : 'textarea',
				name : 'point',
				id : 'point'
			}]
		})
		win = new Ext.Window( {
			width: 400,
			height: 400,
			title : '输入设备点',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function(){
					set_point(win,type_wirte_combo,polyline_write_combo);
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		})
		win.show();
	}

	function set_point(win,type_wirte_combo,polyline_write_combo){
		var loadMask = new Ext.LoadMask(win.el, {
			msg : "加载中，请稍后 ..."
		});
		loadMask.show();
		var type_id = type_wirte_combo.getValue();
		if(type_id == "" ||type_id == null){
			Ext.Msg.alert("提示","请输入类型名称");
			loadMask.hide();
			return;
		}
		var polyline_id = polyline_write_combo.getValue();
		var point_value = Ext.getCmp("point").getValue();
		point_value = point_value.replace(/\n+/g, '\n');
		if(point_value == "" ||point_value == null){
			Ext.Msg.alert("提示","请输入设备名称");
			loadMask.hide();
			return;
		}
		var point_detailed = point_value.replace(/\r\n|\r|\n/g, '\n').replace(/\n\n/g, '\n').split("\n");
		if(point_detailed.length > 0){
			insert_point(point_detailed,type_id,polyline_id,win,loadMask);
		}
	}
	function insert_point(point_detailed,type_id,polyline_id,win,loadMask){
		if(point_detailed.length > 0){
			var point_value = point_detailed.pop();
			point_value = point_value.replace(/ +|\t+|　+|,+|，+/g, ' ').replace(/ +/g, ' ').replace(/ /g, ',').replace(/\r+/g, '').split(",");
			if(point_value[0] == "" || point_value[0] == null){
				insert_point(point_detailed,type_id,polyline_id,win,loadMask);
			}else if(point_value[1] == undefined || point_value[2] == undefined){
				insert_point(point_detailed,type_id,polyline_id,win,loadMask);
			}else{
				Zion.db.getJSON('axiom_overlay_point.id.select',null,function(data){
					if(!data.f){
						var id = data.r[0][0];
						var params = [id,point_value[0],type_id,point_value[1],point_value[2],selectCorpId,parseInt(new Date().getTime()/1000),''];
						Ext.zion.db.getJSON('axiom_overlay_point.insert', params, function(data) {
							if (data.f) {
								insert_point(point_detailed,type_id,polyline_id,win,loadMask);
							} else {
								Zion.db.getJSON('axiom_overlay_relation.insert',[id,polyline_id],function(data){
									if(data.r){
										insert_point(point_detailed,type_id,polyline_id,win,loadMask);
									}
								});
							}
						});
					}
				});
			}
		}else{
			Ext.Msg.alert("提示","数据添加成功");
			grid.store.reload();
			cardPanel.layout.setActiveItem(grid_panel);
			disableButton();
			win.close();
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
							type_name:d[6],
							dictionary_id:d[7]
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
		}
	}

	var panel = new Ext.Panel({
    	layout:'border',
    	border:false,
		items: [form,attribute_grid]
    })
    
    
	sm.on('rowselect', function() {
		var sm = grid.getSelectionModel().getSelected();
		var overlay_id = sm.data.overlay_id;
		var type_id = sm.data.overlay_type_id;
		Zion.db.getJSON('axiom_overlay_point.axiom_info_attribute_value.all.select',[overlay_id,type_id,overlay_id],function(data){
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
		});
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('relegateButton').enable();
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
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
			Ext.getCmp('relegateButton').enable();
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
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
		var longitude = Ext.getCmp("longitude").getValue();
		var latitude = Ext.getCmp("latitude").getValue();
		if(!point_name){
			Ext.Msg.alert('提示','请输入设备名称!');
			loadMask.hide();
			return;
		}

		if(longitude == ""){
			Ext.Msg.alert('提示','请输入经度坐标!');
			loadMask.hide();
			return;
		}

		if(latitude == ""){
			Ext.Msg.alert('提示','请输入纬度坐标!');
			loadMask.hide();
			return;
		}

		if(type_combo.getValue() == ''){
			Ext.Msg.alert('提示','请输入类型名称!');
			loadMask.hide();
			return;
		}
		var params = [];
		var attribute_params = [];
		var polyline_id = polyline_combo.getValue();
		var memo = Ext.getCmp('memo').getValue();
		params.push(point_name);
		params.push(type_combo.getValue());
		params.push(longitude);
		params.push(latitude);
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
							Ext.Msg.alert("提示", "数据添加失败");
							loadMask.hide();
						} else {
							if (data.r == 1) {
								Zion.db.getJSON('axiom_overlay_relation.insert',[id,polyline_id],function(data){
									if(!data.f){
										if(p_source_value.length == 0){
											Ext.Msg.alert("提示", "数据添加成功");
											grid.store.reload();			
											if(Polyline){
												map.removeOverlay(Polyline);
											}
										}else{
											for(var j = 0 ; j < p_source_value.length; j++){
												attribute_params = [id,p_source_value[j][0],Ext.getCmp('propGrid').getSource()[p_source_value[j][2]]];
												Zion.db.getJSON('axiom_info_attribute_value.insert',attribute_params,function(data){
													if(!data.f){
														Ext.Msg.alert("提示", "数据添加成功");
														grid.store.reload();			
														if(Polyline){
															map.removeOverlay(Polyline);
														}
													}
												});
											}
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
												type_name:d[6],
												dictionary_id:d[7]
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
								Ext.Msg.alert("提示", "数据添加失败");
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
					Ext.Msg.alert("提示", "数据修改失败");
					loadMask.hide();
				} else {
					if (data.r == 1) {
						Zion.db.getJSON('pipe.management.axiom_overlay_relation.update',[polyline_id,modify_poi_id],function(data){
							if(data.r){
								if(data.r != "" || data.r != null){
									if(p_source_update_value.length ==0){
										Ext.Msg.alert("提示", "数据修改成功");
										loadMask.hide();
									}else{
										Zion.db.getJSON('axiom_info_attribute_value.delete',[modify_poi_id],function(data){
											if(!data.f){
												for(var i = 0; i < p_source_update_value.length; i ++){
													var params_value = Ext.getCmp('propGrid').getSource()[p_source_update_value[i][2]];
													if(params_value == undefined){
														params_value = p_source_update_value[i][1];
													}else if(params_value == "")
														params_value = " ";
													else{
														params_value = Ext.getCmp('propGrid').getSource()[p_source_update_value[i][2]];
													}
													var params_update = [modify_poi_id,p_source_update_value[i][2],params_value];
													Zion.db.getJSON('axiom_info_attribute_value.insert',params_update,function(data){
														if(!data.f && data.r == 1){
															Ext.Msg.alert("提示", "数据修改成功");
															loadMask.hide();
														}else{
															Ext.Msg.alert("提示", "数据修改失败");
															loadMask.hide();
														}
													});
												}
											}
										});	
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
										type_name:d[6],
										dictionary_id:d[7]
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
						Ext.Msg.alert("提示", "数据修改失败");
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
		if(e_click){
			GEvent.removeListener(e_click);
		}
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
			Ext.getCmp("longitude").setValue(g_x);
			Ext.getCmp("latitude").setValue(g_y);
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(16, 16);
			targetIcon.iconAnchor = new GPoint(8, 8);
			var image_ = type_combo.getValue();
			if(dictionary_id == null || dictionary_id == ""){
				targetIcon.image = "/api/image/poi/"+image_+".png?"+Math.random();
			}else{
				targetIcon.image = "/api/image/poi/"+dictionary_id+".png?"+Math.random();
			}
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
			var sm = part_grid.getSelectionModel().getSelected();
			var part_id = sm.data.part_id;
			var overlay_type_id = sm.data.overlay_type_id;
			Zion.db.getJSON('axiom_overlay_part.axiom_info_attribute_value.all.select',[part_id,overlay_type_id,part_id],function(data){
				if(!data.f){
					if(data.r == ''){
						return;
					}
					var data_value = data.r;
					var show_attribute_source = {};
					for(var i = 0;i < data_value.length; i++){
						show_attribute_source[data_value[i][0]] = data_value[i][1]?data_value[i][1]:'';
						
					}
					show_part_attribute_grid.setSource(show_attribute_source);
				}
			});
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
			show_part_attribute_grid.setSource({});
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
				 'part_id', 'part_name','overlay_type_id','overlay_type_name', 'overlay_name', 'reg_date', 'memo','dictionary_id'
			]
		});

		/**附属属性查看**/
		var show_part_attribute_grid = new Ext.grid.PropertyGrid({
			title:'属性查看',
			height:200,
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

	    part_grid = new Ext.grid.GridPanel({
	        store: part_store,
	        sm : part_sm,
	        height:200,
	        width:550,
	        region:'center',
	        split:true,
	        enableColumnHide : false,
	        columns: [
	        	part_sm,
	        	new Ext.grid.RowNumberer({header:'序号',width:35}),
	        	{header: '名称', width: 130, sortable: true, dataIndex: 'part_name'},
				{header: "类型", width: 70, sortable: true, dataIndex: 'overlay_type_id',renderer: function(v,c,r){
					var dictionary_id = r.data["dictionary_id"];
					var overlay_type_id = r.data["overlay_type_id"];
					if(dictionary_id == "" || dictionary_id == null){
						return '<img src="/api/image/poi/'+overlay_type_id+'.png?'+Math.random()+'"></img>';
					}else{
						return '<img src="/api/image/poi/'+dictionary_id+'.png?'+Math.random()+'"></img>';
					}
				}},
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
						add_update_part(overlay_id,show_part_attribute_grid);
					}
	            },'-',{ 
	            	id : 'part_edit_button',
					text: '修改',
					icon : '/image/module/update.gif',
					tooltip : '修改记录',
					disabled : true,
					handler: function(){
						update_part = false;
						add_update_part(overlay_id,show_part_attribute_grid);
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
		var part_panel = new Ext.Panel({
			height:400,
	    	width:500,
			items:[part_grid,show_part_attribute_grid]
		});
	    var window = new Ext.Window({
	    	height:400,
	    	width:500,
	    	title : '附属设施列表',
				closable : true,
				items : [ part_panel ],
				buttons : [ {
					text : '关闭',
					handler : function() {
						window.close();
					}
				} ]
	    });
	    window.show();
	}
	
	function add_update_part(overlay_id,show_part_attribute_grid){
		/**附属属性填写**/
		part_attribute_grid = new Ext.grid.PropertyGrid({
			title:'属性填写',
			region:'center',
			height:250,
			id:'part_propGrid',
			source:	{
			},
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		});
		var part_type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type','dictionary_id'],
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
			triggerAction : 'all',
			listeners : {
				'expand':function(this_){
					part_type_store.removeAll();
					setTimeout(function(){part_type_store.load();},0);
				},
				'select' : function(this_, record, index){
					Ext.getCmp('drow_point').enable();
					var overlay_type_id = record.get('overlay_type_id');
					dictionary_id = record.get('dictionary_id');
					var part_attribute_store = new Ext.data.SimpleStore({
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/axiom_info_type_attribute.type_attribute.type.search/['+overlay_type_id+','+selectCorpId+']'
						}),
						root : "r", 
						fields :  attribute_fields,
						listeners:{
							'load':  {
								fn : function(store, records,options) {
									var propGrid = Ext.getCmp('part_propGrid');
									if (propGrid) {
										part_source = {}; 
										part_source_value = [];
										for(var i = 0; i < records.length; i++){
											var attribute_type_memo = get_attribute_fields_default_value(records[i].get('attribute_type_name'));
											part_source[records[i].get('overlay_attribute_name')] =  attribute_type_memo;
											part_source_value[i] = [records[i].get('overlay_attribute_id'),records[i].get('attribute_type_name'),records[i].get('overlay_attribute_name')];
										}
										part_attribute_grid.setSource(part_source);
									}
								 } 
							}
						}
					});
					part_attribute_store.load();
				}				
			}
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
		var part_add_panel = new Ext.Panel({
			width:380,
			height:400,
			items:[part_form,part_attribute_grid]
		});

	    var part_window = new Ext.Window({
	    	width:380,
	    	title : '附属设施列表',
			closable : true,
			items : [ part_add_panel ],
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
						Zion.db.getJSON('axiom_overlay_point.id.select',null,function(data){
							if(data.r){
								var id = data.r[0][0];
								var part_attribute_params = [];
								var params = [id,part_name,type_id,overlay_id,parseInt(new Date().getTime()/1000),part_memo];
								Zion.db.getJSON('pipe.management.data.point.axiom_overlay_part.insert',params,function(data){
									if(data.r){
										for(var j = 0 ; j < part_source_value.length; j++){
												part_attribute_params = [id,part_source_value[j][0],Ext.getCmp('part_propGrid').getSource()[part_source_value[j][2]]];
												Zion.db.getJSON('axiom_info_attribute_value.insert',part_attribute_params,function(data){
													if(!data.f){
														Ext.Msg.alert("提示", "数据添加成功");
													}
												});
											}
										part_window.close();
										part_disable_button();
										show_part_attribute_grid.setSource({});
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
								Zion.db.getJSON('axiom_info_attribute_value.delete',[part_id],function(data){
									if(!data.f){
										for(var i = 0; i < part_source_update_value.length; i ++){
											var params_value = Ext.getCmp('part_propGrid').getSource()[part_source_update_value[i][2]];
											if(params_value == undefined){
												params_value = part_source_update_value[i][1];
											}else if(params_value == "")
												params_value = " ";
											else{
												params_value = Ext.getCmp('part_propGrid').getSource()[part_source_update_value[i][2]];
											}
											var params_update = [part_id,part_source_update_value[i][2],params_value];
											Zion.db.getJSON('axiom_info_attribute_value.insert',params_update,function(data){
												if(!data.f && data.r == 1){
													Ext.Msg.alert("提示", "数据修改成功");
													part_store.reload();
													show_part_attribute_grid.setSource({});
													part_window.close();
												}else{
													Ext.Msg.alert("提示", "数据修改失败");
													loadMask.hide();
												}
											});
										}
									}
								});	
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
			var part_id = part_sm.data.part_id;
			var overlay_type_id = part_sm.data.overlay_type_id;
			Zion.db.getJSON('axiom_overlay_part.axiom_info_attribute_value.all.select',[part_id,overlay_type_id,part_id],function(data){
				if(!data.f){
					if(data.r == ''){
						return;
					}
					part_attribute_grid.removeAll();
					var data_value = data.r;
					part_source_update = {};
					part_source_update_value = [];
					var part_source_update_array = [];
					for(var i = 0;i < data_value.length; i++){
						part_source_update[data_value[i][0]] = data_value[i][1]?data_value[i][1]:'';
						part_source_update_value[i] = [data_value[i][0] , data_value[i][1] ,data_value[i][2],data_value[i][3]];
						part_source_update_array.push(new Ext.grid.PropertyRecord({name:data_value[i][0],value:data_value[i][1]},data_value[i][2]));
					}
					//attribute_grid.setSource(p_source_update);
					part_attribute_grid.getStore().loadRecords({records:part_source_update_array},{},true);
				}
			})
		}
	}
	function part_disable_button(){
		Ext.getCmp('part_edit_button').disable();
		Ext.getCmp('part_del_button').disable();
	}
	
	function disableButton() {
		Ext.getCmp('relegateButton').disable();
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
											type_name:d[6],
											dictionary_id:d[7]
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
									type_name:d[6],
									dictionary_id:d[7]
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
					fields : ['overlay_type_id', 'overlay_type_name', 'memo','type','dictionary_id'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type.point.select/['+selectCorpId+']'
					})
				});
				type_store.load();
				cardPanel.layout.setActiveItem(grid_panel);
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
								type_name:d[6],
								dictionary_id:d[7]
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
		attribute_grid.setSource({});
		type_store.constructor({
			root : 'r',
			fields : ['overlay_type_id', 'overlay_type_name', 'memo','type','dictionary_id'],
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
		setTimeout(function(){
			if(map){
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
								type_name:d[6],
								dictionary_id:d[7]
							});
					}
					poiManager.draw(pois);		
				});
			}
		},0);
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
					split:true,
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

	var poiManager;
		
	poiManager = new Zion.POI(map,{image_base:'/api/image/poi',icon_size:16});
	
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
