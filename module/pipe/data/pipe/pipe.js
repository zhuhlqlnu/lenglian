function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
	return dt.format('Y-m-d H:i:s');
} 
Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var polyine_add = false;
	var polyline_write = "";
	var is_polyline_write = false;
	var Polyline;
	var p_source_value =[];
	var p_source_update;
	var p_source_update_value =[];
	var p_source_update_array = [];
	var attribute_fields_default = {'image':'图片','text':'','number':0,'date':new Date()};
	var store_sql = "pipe.management.data.pipe.axiom_overlay_route.select";
	var attribute_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo'];
	var fields = [ 'overlay_id', 'overlay_name', 'overlay_type_id', 'point_set', 'corp_id', 'reg_date', 'memo','color','width','opacity','info_type_id'];
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

	var sm = new Ext.grid.CheckboxSelectionModel();
	
	sm.on('rowdeselect', function(sm, index, r) {
		show_attribute_grid.setSource({});
		map.removeOverlay(Polyline);
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if(grid.selModel.getSelections().length == 1){
			Ext.getCmp('editButton').enable();
		}else{
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('relegateButton').disable();
		}
	});
	
	sm.on('rowselect', function(sm, index, r) {
		var grid_sm = grid.getSelectionModel().getSelected();
		var overlay_id = grid_sm.data.overlay_id;
		var type_id = grid_sm.data.info_type_id;
		attribute_grid.setSource({});
		Zion.db.getJSON('pipe.data.pipe.axiom_info_attribute_value.all.update',[overlay_id,type_id,overlay_id],function(data){
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
			var polyline =  sm.getSelected().data.point_set;
			var color = sm.getSelected().data.color;
			var width = sm.getSelected().data.width;
			var opacity = sm.getSelected().data.opacity;
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
		} else {
			map.removeOverlay(Polyline);
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
		if(grid.selModel.getSelections().length == 1){
			Ext.getCmp('editButton').enable();
		}else{
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('relegateButton').disable();
		}
	});

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		region:'center',
		columns : [ sm, {
			header : "编号",
			dataIndex : 'overlay_id',
			width : 50,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'overlay_name',
			width : 120,
			sortable : true
		},{
			header : "备注",
			dataIndex : 'memo',
			width : 100,
			sortable : true
		}],
		tbar: [ {
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新管线',
			handler : function() {
				polyine_add = true;
				attribute_grid.setSource({});
				Ext.getCmp("drow_polyline").enable();
				Ext.getCmp("overlay_name").setValue("");
				type_combo.setValue("");
				type_combo.enable();
				Ext.getCmp("memo").setValue("");
				Ext.getCmp("saveModifyBut").disable();
				cardPanel.layout.setActiveItem(panel);
			},
			scope : this
		}, {
			id : 'editButton',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改管线',
			handler : function() {
				update_polyline();
				Ext.getCmp("drow_polyline").enable();
				polyine_add = false;
				Ext.getCmp("saveModifyBut").enable();
				var point = grid.getSelectionModel().getSelected().data.point_set;
				var overlay_id = grid.getSelectionModel().getSelected().data.overlay_id;
				var type_id = grid.getSelectionModel().getSelected().data.info_type_id;
				type_combo.disable();
				type_combo.setValue(type_id);
				var points_arr = point.split(';');
				is_polyline_write = true;
				if(points_arr.length < 50){
					is_polyline_write = false;
					map.clearOverlays();
					Zion.polyline.edit(map,Zion.polyline.fromString(map,point,'blue',3));
				}

				attribute_grid.setSource({});
				Zion.db.getJSON('pipe.data.pipe.axiom_info_attribute_value.all.update',[overlay_id,type_id,overlay_id],function(data){
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
				});
				cardPanel.layout.setActiveItem(panel);
			},
			scope : this
		}, {
			id : 'deleteButton',
			disabled : true,
			text : '删除',
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除管线',
			handler : function() {
				delete_polyline();
			},
			scope : this
		}, {
			id : 'relegateButton',
			disabled : true,
			text : '迁移',
			icon : Ext.zion.image_base+'/relegate.gif',
			tooltip : '迁移管线',
			handler : function() {
				var polylines = [];
				var sm = grid.getSelectionModel().getSelections();
				for ( var i = 0; i < sm.length; i += 1) {
					polylines.push(sm[i].data.overlay_id);
				}
				relegatePolyline(polylines, function() {
					grid.store.reload();
					disableButton();
				});
			},
			scope : this
		},  {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新管线',
			handler : function() {
				grid.store.reload();
				map.clearOverlays();
				disableButton();
			},
			scope : this
		} ],
		bbar: new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});
	
	var type_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['overlay_type_id', 'overlay_type_name', 'memo','type'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_info_type.pipeline.select/['+selectCorpId+']'
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
				var overlay_type_id = record.get('overlay_type_id');
	    		var attribute_store = new Ext.data.SimpleStore({
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type_attribute.pipeline_attribute.type.search/['+overlay_type_id+','+selectCorpId+']'
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

	var color_store = new Ext.data.SimpleStore({
		fields : ['color_id', 'color_value'],
		data:[[1,'蓝色'],[2,'红色'],[3,'绿色'],[4,'黄色'],[5,'橙色'],[6,'紫色'],[7,'青色']]
	});
	
	var color_combo = new Ext.form.ComboBox({
		fieldLabel : '颜色',
		hiddenName : 'color_id',
		valueField : 'color_id',
		store : color_store,
		displayField : 'color_value',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		value: 1
	});

	var form = new Ext.Panel({
    	region:'north',
    	height:250,
    	layout:'form',
    	buttonAlign: 'center',
	    bodyStyle:'padding:0px 0px 0',
		frame : true,
	    defaults: {width: 200},
	    labelWidth:65,
    	items: [{
    		id: 'overlay_name',
    		xtype: 'textfield',
    		fieldLabel: '管线名称'
    	},type_combo,color_combo,{
    		id: 'memo',
    		xtype: 'textarea',
    		fieldLabel: '备注',
    		height: 100
    	}],
		buttons: [{
            text: '标注',
			width:60,
            id: 'drow_polyline',
            handler: function(){
            	drow_polyline();
            }
        },{
            text: '输入',
			width:60,
            id: 'wirte_polyline',
            handler: function(){
				wirte_polyline(); 
            }
        },{
        	id: 'saveModifyBut',
            text: '保存',
			width:60,
            disabled: true,
            handler: function(){
            	save_polyline();
            }
        },{
            text: '返回',
            handler: function(){
				type_combo.show();
				type_combo.el.parent().parent().show(); 
				type_combo.el.up('.x-form-item').setDisplayed(true);
            	cardPanel.layout.setActiveItem(grid_panel);
				Zion.polyline.endEdit();
 				map.clearOverlays();
            }
        }]
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

	/**属性查看框**/
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
	
	var grid_panel = new Ext.Panel({
		layout:'border',
		defaults : {
			border : true
		},
		items : [  grid , show_attribute_grid]
	});
	
	var panel = new Ext.Panel({
    	layout:'border',
    	border:false,
		items: [form,attribute_grid]
    });

	var cardPanel = new Ext.Panel({
		activeItem: 0,
		layout:'card',
		width : 300,
		region : 'west',
		items: [
			grid_panel,panel
		]
	});
	
	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(38.718465,116.099052), 4);

	/*function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][2] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}*/
	
	function wirte_polyline(){
		var formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				width: 400,
				height: 400,
				labelWidth:50,
				items : [ {
					fieldLabel : '格式',
					width:300,
					height:70,
					xtype : 'textarea',
					value:'经度1 纬度1\n经度2 纬度2\n...\n经度n 纬度n',
					disabled:true
				},{
					fieldLabel : '管线',
					width:300,
					height:250,
					xtype : 'textarea',
					name : 'pipeline',
					id : 'pipeline'
				}]
			})
			win = new Ext.Window( {
				width: 400,
				height: 400,
				title : '输入管线',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					text : '确定',
					handler : function(){
						set_polyline(win);
					}
				}, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			})
			win.show();
			try{
				var points = Zion.polyline.toString(Zion.polyline.endEdit());
				if(points){
					map.clearOverlays();
					Zion.polyline.edit(map,Zion.polyline.fromString(map,points,'blue',3));
					Ext.getCmp("pipeline").setValue(points.replace(/,/g,' ').replace(/;/g,'\n'));
				}
			}catch(e){
			}

	}

	function set_polyline(win){
		map.clearOverlays();
		var polyline = Ext.getCmp("pipeline").getValue();
		try{
			polyline = polyline.replace(/ +|\t+|　+|,+|，+/g, ' ').replace(/ +/g, ' ').replace(/ /g, ',').replace(/\r+/g, '').replace(/\n+/g, '\n').replace(/\n/g, ';');
			while((polyline.slice(-1)==';') || (polyline.slice(-1)==',')){
				polyline = polyline.slice(0,polyline.length-1);
			}
			var points = polyline.split(";");
			if(points.length <= 50){
				Zion.polyline.edit(map,Zion.polyline.fromString(map,polyline,'blue',3));
				is_polyline_write = false;
			}else{
				polyline_write = polyline;
				is_polyline_write = true;
			}
		}catch(e){
			Ext.Msg.alert('提示','管道数据填写不正确');
			return;
		}
		
		Ext.getCmp("saveModifyBut").enable();
		win.close();
	}

	function drow_polyline(){
		map.clearOverlays();
		is_polyline_write = false;
		Ext.getCmp("drow_polyline").disable();
		Zion.polyline.draw(map, function(poly) {
			setTimeout(function() { 
				Zion.polyline.edit(map, poly); 
				Polygon = poly;
			},0);
			Ext.getCmp("saveModifyBut").enable();
		});
	}
    
	function save_polyline(){
		loadMask.show();
		var overlay_name = Ext.getCmp('overlay_name').getValue();
		if(overlay_name.length <= 0){
			Ext.Msg.alert('提示','请输入管线名称!');
			loadMask.hide();
			return;
		}
		var memo = Ext.getCmp('memo').getValue();
		var color = color_combo.getValue();
		var type_id = type_combo.getValue();
		if(type_id == null || type_id == ""){
			Ext.Msg.alert('提示','请输入类型名称!');
			loadMask.hide();
			return;
		}
		if(polyine_add == true){
			if(is_polyline_write == true){
				var points = polyline_write;
			}else{
				var points = Zion.polyline.toString(Zion.polyline.endEdit());
			}
			Zion.db.getJSON('axiom_overlay_point.id.select',null,function(data){
				if(data.r){
					var id = data.r[0][0];
					var params = [id,overlay_name,type_id,points,selectCorpId,memo,0,color];
					$.ajax({
						url:'/db/'+Zion.token+'/pipe.management.data.pipe.axiom_overlay_route.insert',
						type:'post',
						data:"params="+Zion.util.encodeParam(params),
						dataType :'json',
						success:function(data){
							if(data.r){
								if(p_source_value.length == 0){
									Ext.Msg.alert("提示","数据添加成功");
									cardPanel.layout.setActiveItem(grid_panel);
									grid.store.reload();
									map.clearOverlays();
								}else{
									for(var j = 0 ; j < p_source_value.length; j++){
										attribute_params = [id,p_source_value[j][0],Ext.getCmp('propGrid').getSource()[p_source_value[j][2]]];
										Zion.db.getJSON('axiom_info_attribute_value.insert',attribute_params,function(data){
											if(!data.f){
												Ext.Msg.alert("提示","数据添加成功");
												cardPanel.layout.setActiveItem(grid_panel);
												grid.store.reload();
												map.clearOverlays();
											}
										});
									}
								}
							}else{
								Ext.Msg.alert("提示","数据添加错误");
								map.clearOverlays();
								cardPanel.layout.setActiveItem(grid_panel);
							}
						}

					});
				}
				loadMask.hide();
			});
		}else{
			var overlay_id = grid.getSelectionModel().getSelected().data.overlay_id;
			var type_id = grid.getSelectionModel().getSelected().data.info_type_id;
			if(is_polyline_write == true){
				if(polyline_write == ""){
					var params = [overlay_name,selectCorpId,memo,color,type_id,overlay_id];
					var alias = 'pipe.management.pipe.axiom_overlay_route.update';
				}else{
					var points = polyline_write;
					var params =[overlay_name,points,selectCorpId,memo,color,type_id,overlay_id];
					var alias = 'pipe.management.data.pipe.axiom_overlay_route.update';
				}	
			}else{
				var points = Zion.polyline.toString(Zion.polyline.endEdit());
				var params =[overlay_name,points,selectCorpId,memo,color,type_id,overlay_id];
				var alias = 'pipe.management.data.pipe.axiom_overlay_route.update';
			}
			$.ajax({
				url:'/db/'+Zion.token+'/'+alias,
				type:'post',
				data:"params="+Zion.util.encodeParam(params),
				dataType :'json',
				success:function(data){
					if(data.r){
						if(p_source_update_value.length == 0){
							Ext.Msg.alert("提示","数据修改成功");
							disableButton();
							grid.store.reload();
							map.clearOverlays();
							cardPanel.layout.setActiveItem(grid_panel);
						}else{
							Zion.db.getJSON('axiom_info_attribute_value.delete',[overlay_id],function(data){
								if(!data.f){
									for(var i = 0; i < p_source_update_value.length; i ++){
										var value =Ext.getCmp('propGrid').getStore().data.map[p_source_update_value[i][2]].data.value;
										if(value == null){
											value = "";
										}
										var params_update = [overlay_id,p_source_update_value[i][2],value];
										Zion.db.getJSON('axiom_info_attribute_value.insert',params_update,function(data){
											if(!data.f){
												Ext.Msg.alert("提示","数据修改成功");
											}else{
												Ext.Msg.alert("提示","数据修改错误");
											}
										});
										show_attribute_grid.setSource({});
									}
									disableButton();
									grid.store.reload();
									map.clearOverlays();
									cardPanel.layout.setActiveItem(grid_panel);
								}
							});
						}
					}else{
						Ext.Msg.alert("提示","数据修改错误");
						disableButton();
						map.clearOverlays();
						cardPanel.layout.setActiveItem(grid_panel);
					}
					loadMask.hide();
				}
			});
		}

	}
	
	function update_polyline(){
		var sm = grid.getSelectionModel().getSelected();
		var overlay_id = sm.data.overlay_id;
		var overlay_name = sm.data.overlay_name;
		var memo = sm.data.memo;
		var color = sm.data.color;
		Ext.getCmp("overlay_name").setValue(overlay_name);
		Ext.getCmp("memo").setValue(memo);
		color_combo.setValue(color);
	}
	
	var id = [];
	function delete_polyline(){
		var overlay_id = grid.getSelectionModel().getSelected().data.overlay_id;
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.overlay_id);
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
			Zion.db.getJSON('pipe.management.data.pipe.axiom_overlay_route.delete',params,function(data){
				if(!data.f){
					Ext.Msg.alert("提示","数据删除成功");
					disableButton();
					show_attribute_grid.setSource({});
					map.clearOverlays();
				}else{
					Ext.Msg.alert("提示","数据删除错误");
					disableButton();
					map.clearOverlays();
				}
				deleNext();
			})
		}else{
			grid.store.reload();
		}
	}
		
	function relegatePolyline(polylines, callback, scope){
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

			function relegateTargetToCorp(polylines, corp, callback, scope) {
				function doNext() {
					if (polylines.length > 0) {
						var polyline_id = polylines.pop();
						Ext.zion.db.getJSON("pipe.management.data.pipe.axiom_overlay_route.reletage", [ corp,polyline_id ], function(data) {
							if(data.r){
								Zion.db.getJSON('pipe.management.data.pipe.axiom_overlay_point.update',[ corp, polyline_id ],function(data){
									doNext();
								})
							}
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
					Ext.Msg.confirm('迁移确认', '你是否确认迁移选中的记录?', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							relegateTargetToCorp(polylines, relegateToCorp, function() {
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
				title : '管线迁移',
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
				show_attribute_grid.setSource({});
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
								+ '/axiom_info_type.pipeline.select/['+selectCorpId+']'
					})
				});
				type_store.load();
				cardPanel.layout.setActiveItem(grid_panel);
				type_combo.reset();
			}
		}
	});
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('relegateButton').disable();
	}

	function get_attribute_fields_default_value(attribute_fields_type){
		var default_value = attribute_fields_default[attribute_fields_type];
		if(typeof(default_value)!="string"){
			return default_value;
		}else{
			return '';
		}
	}

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
						+ '/axiom_info_type.pipeline.select/['+selectCorpId+']'
			})
		});
		type_store.load();
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			region : 'center',
			layout : 'fit',
			items : [{ 
				layout : 'border',
				border : false,
				items : [{
					title : '管线列表',
					region : 'west',
					layout : 'fit',
					margins : '5 0 0 0',
					split : true,
					collapsible : true,
					height : 200,
					width : 300,
					items : [ cardPanel ]
				}, {
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
			}]
		}]
	});
});