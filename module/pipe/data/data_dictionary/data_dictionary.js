Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var type_button_update = false;
	var attribute_button_update = false;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var grid_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo','attribute_type_id'];
	var type_fields =['type_id', 'type_name','memo','system_type','user_id','reg_date'];
	var type_sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
	type_sm.on('rowselect', function() {
		var sm_select = type_grid.getSelectionModel().getSelected();
		if(!sm_select){
			Ext.Msg.alert('提示','请选择要查询的项');
		}else{
			selectForm();
		}
		if (type_grid.selModel.getSelections().length ==1) {
			Ext.getCmp('update_type').enable();
		} else {
			Ext.getCmp('update_type').disable();
		}
		if (type_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('delete_type').enable();
		} else {
			Ext.getCmp('delete_type').disable();
		}
		if (type_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('add_attribute').enable();
		} else {
			Ext.getCmp('add_attribute').disable();
		}
		if(sm_select.data.system_type == 3){
			attribute_grid.disable();
		}else{
			attribute_grid.enable();
		}
	})
	type_sm.on('rowdeselect', function() {
		store.removeAll();
		if (type_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('update_type').enable();
		} else {
			Ext.getCmp('update_type').disable();
		}
		if (type_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('delete_type').enable();
		} else {
			Ext.getCmp('delete_type').disable();
		}
		if (type_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_attribute').enable();
		} else {
			Ext.getCmp('add_attribute').disable();
		}
		if(type_grid.selModel.getSelections().length != 0){
			attribute_grid.disable();
		}else{
			attribute_grid.enable();
		}
	});
	
	var system_type_come = new Ext.form.ComboBox({
		width:100,
		store: new Ext.data.SimpleStore({
			fields : ['type_id', 'type_name'],
			data : [[0,'所有'],[1,'管线'],[2,'设施'],[3,'缺陷']]
		}),
		hiddenName : 'type_id',
		valueField : 'type_id',
		displayField : 'type_name',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		value:0,
		listeners : {
			'select' : function(v) {
				var this_ = this.getValue();
				if(this_ == 0){
					type_store.constructor({
						root : 'r',
						fields : type_fields,
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/axiom_dictionary_type.select/'
						})
					});
				}else{
					type_store.constructor({
						root : 'r',
						fields : type_fields,
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/axiom_dictionary_type.by_type.select/['+this_+']'
						})
					});
				}
				type_store.load();
			}
		}
	});
	var type_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : type_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_dictionary_type.select/'
		})
	});
	var type_grid = new Ext.grid.GridPanel({
		sm : type_sm,
		store : type_store,
		columns : [type_sm, {
			header : "名称",
			dataIndex : 'type_name',
			sortable : true
		},{
			header : "字典类型",
			dataIndex : 'system_type',
			sortable : true,
			renderer:function(system_type){
				if(system_type == 1){
					return "管线";
				}else if(system_type == 2){
					return "设施";
				}else{
					return "缺陷";
				}
			}
		},{
			header :'图标',
			sortable : true,
			dataIndex : 'type_id',
			renderer:function(v,c,r){
				var type_id = r.data["type_id"];
				var system_type = r.data["system_type"];
				if(system_type == 1 || system_type == 2){
					return '<img src="/api/image/poi/'+type_id+'.png?'+Math.random()+'"></img>';
				}else{
					return '<img src="/api/image/defect/'+type_id+'.png?'+Math.random()+'"></img>';
				}
			}
		},{
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}],
		tbar:['字典类型：',system_type_come],
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar({
					items : [{
						text : '添加',
						tooltip : '添加',
						id:'add_type',
						icon : Ext.zion.image_base+'/add.gif',
						handler:function(){
							type_button_update = true;
							type_window_show();
						}
					},{
						text : '修改',
						tooltip : '修改',
						id:'update_type',
						disabled:true,
						icon : Ext.zion.image_base+'/update.gif',
						handler:function(){
							type_button_update = false;
							var sm_select = type_grid.getSelectionModel().getSelected();
							if(!sm_select){
								Ext.Msg.alert('提示','请选择要修改的项');
							}else{
								type_window_show();
								formPanel.form.loadRecord(sm_select);
							}
						}
					},{
						text : '删除',
						tooltip : '删除',
						id:'delete_type',
						disabled:true,
						icon : Ext.zion.image_base+'/delete.gif',
						handler:function(){
							var sm_select = type_grid.getSelectionModel().getSelected();
							if(!sm_select){
								Ext.Msg.alert('提示','请选择要删除的项');
							}else{
								delete_type();
							}
						}
					}]
				})
			tbar.render(this.tbar);
			}
		},
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	//type_store.load();
	
	var store = new Ext.data.SimpleStore({
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_dictionary_attribute.type_attribute.select'
		}),
		root : "r", 
		fields :  grid_fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel();

	sm.on('rowdeselect', function() {
		if (attribute_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('delete_attribute').enable();
		} else {
			Ext.getCmp('delete_attribute').disable();
		}
		if (attribute_grid.selModel.getSelections().length ==1) {
			Ext.getCmp('update_attribute').enable();
		} else {
			Ext.getCmp('update_attribute').disable();
		}
	})
	
	sm.on('rowselect', function() {
		if (attribute_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('delete_attribute').enable();
		} else {
			Ext.getCmp('delete_attribute').disable();
		}
		if (attribute_grid.selModel.getSelections().length ==1) {
			Ext.getCmp('update_attribute').enable();
		} else {
			Ext.getCmp('update_attribute').disable();
		}
	})
	var attribute_grid = new Ext.grid.GridPanel({
		title:'字典属性',
		store : store,
		sm : sm,
		columns : [sm, /* {
			header : "属性ID",
			dataIndex : 'overlay_attribute_id',
			sortable : true
		},*/{
			header : "名称",
			dataIndex : 'overlay_attribute_name',
			sortable : true
		}/*,{
			header : "属性类型名称",
			dataIndex : 'attribute_type_name',
			sortable : true
		}*/,{
			header : "类型",
			dataIndex : 'attribute_type_memo',
			sortable : true
		},{
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}],
		tbar : [{
			text : '添加',
			tooltip : '添加',
			icon : Ext.zion.image_base+'/add.gif',
			id:'add_attribute',
			disabled:true,
			handler : function(){
				var sm_select = type_grid.getSelectionModel().getSelected();
				if(!sm_select){
					Ext.Msg.alert('提示','请选择添加的类型');
				}else{
					attribute_button_update = true;
					attribute_window_show();
				}
			}
		},{
			text : '修改',
			tooltip : '修改',
			id:'update_attribute',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			handler:function(){
				attribute_button_update = false;
				var sm = attribute_grid.getSelectionModel().getSelected();
				if(!sm){
					Ext.Msg.alert('提示','请选择要修改的项');
				}else{
					var attribute_type_id = sm.data.attribute_type_id;
					var attribute_type_memo = sm.data.attribute_type_memo;
					var attribute_type = [];
					attribute_type.push(attribute_type_id);
					attribute_type.push(attribute_type_memo);
					attribute_window_show(attribute_type);
					attribute_formpanel.form.loadRecord(sm);
				}
			}
		},{
			text : '删除',
			tooltip : '删除',
			disabled:true,
			icon : Ext.zion.image_base+'/delete.gif',
			id:'delete_attribute',
			handler : function(){
				delete_attribute();
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	
	function type_window_show(){
		var system_type_combo = new Ext.form.ComboBox({
			fieldLabel : '字典类型',
			store: new Ext.data.SimpleStore({
				fields : ['system_type', 'type_name'],
				data : [[1,'管线'],[2,'设施'],[3,'缺陷']]
			}),
			hiddenName : 'system_type',
			valueField : 'system_type',
			displayField : 'type_name',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			value:1
		});
		formPanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			fileUpload: true,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '名称',
				name : 'type_name',
				id : 'type_name',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '备注',
				name : 'memo',
				id : 'memo',
				xtype:'textarea',
				allowBlank : false,
				blankText : '不能为空'
			},system_type_combo,{
				name:'type_id',
				id : 'type_id',
				hidden : true,
				hideLabel : true
			},{
				xtype: 'fileuploadfield',
				//inputType:'file',
				id: 'file_path',
				emptyText: '选择上传图标',
				fieldLabel: '类型图标',
				name: 'file_path',
				allowBlank : false,
				blankText : '请选择上传图标',
				buttonText: '',
				regexText :'支持jpeg,jpg,gif,png的图标上传',
				regex:/^(([a-zA-Z]:)|(\\{2}\w+)\$?)(\\(\w[\w].*))(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.png|.png)$/,
				buttonCfg: {
					iconCls: 'upload-icon'
				}
			}]
		})
		var type_window = new Ext.Window({
			width:380,
			title:'类型信息',
			closable : true,
			closeAction : 'close',
			items:[formPanel],
			buttons : [{
				text : '保存',
				handler : function(){
					add_or_update_type(formPanel.getForm(),type_window,system_type_combo)
				}
			}, {
				text : '关闭',
				handler : function() {
					formPanel.form.reset();
					type_window.close();
				}
			}]
		});
		type_window.show();
	}
	
	function attribute_window_show(attribute_type){
		var attribute_type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['attribute_type_id', 'attribute_type_name', 'attribute_type_memo'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/info_attribute_type.select'
			})
		});

		var attribute_type_combo = new Ext.form.ComboBox({
			fieldLabel : '类型',
			hiddenName : 'attribute_type_id',
			valueField : 'attribute_type_id',
			store : attribute_type_store,
			displayField : 'attribute_type_memo',
			editable : false,
			triggerAction : 'all',
			allowBlank : false
		});
		if(attribute_type){
			attribute_type_store.loadData( {
				'r' : [ [ attribute_type[0], attribute_type[1] ,attribute_type[1]] ]
			});
		}

		attribute_formpanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '名称',
				name : 'overlay_attribute_name',
				id : 'overlay_attribute_name',
				allowBlank : false,
				blankText : '不能为空'
			},attribute_type_combo,{
				fieldLabel : '备注',
				name : 'memo',
				id : 'memo',
				xtype:'textarea'
			},{
				name:'overlay_attribute_id',
				id : 'overlay_attribute_id',
				hidden : true,
				hideLabel : true
			}]		
		});
		
		var attribute_window = new Ext.Window({
			title:'属性信息',
			width:380,
			closable : true,
			closeAction : 'close',
			items:[attribute_formpanel],
			buttons : [{
				text : '保存',
				handler : function(){
					add_or_update_attribute(attribute_formpanel.getForm(),attribute_window)
				}
			}, {
				text : '关闭',
				handler : function() {
					attribute_formpanel.form.reset();
					attribute_window.close();
				}
			}]
		});
		attribute_window.show();
	}
	
	function selectForm(){
		var sm_select = type_grid.getSelectionModel().getSelected();
		var id = sm_select.data.type_id;
		attribute_grid.store.constructor({
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_dictionary_type_attribute.type_attribute.type.search/['+id+']'
			}),
			root : "r",
			fields : grid_fields
		});
		attribute_grid.store.load();

	}
	
	function add_or_update_type(formPanel,type_window,system_type_combo){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var system_type = system_type_combo.getValue();
			var type_name = $.trim(Ext.getCmp('type_name').getValue());
			var memo = Ext.getCmp('memo').getValue();
			if(type_button_update == true){
				if(system_type == 1 || system_type == 2){
					var alars = 'axiom_seq_overlay_type_id.select';
				}else{
					var alars = 'axiom_seq_defect_type_id.select';
				}
				Zion.db.getJSON(alars,null,function(data){
					if(!data.f){
						var axiom_seq_type_id = data.r[0][0];
						var filePath = formPanel.findField('file_path').getValue();
						var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
						var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
						var path = axiom_seq_type_id+'.png';
						if(system_type == 1 || system_type == 2){
							var url = '/upload/'+Ext.zion.token+'/map_poi/'+Zion.util.encodeParam([path]);
						}else{
							var url = '/upload/'+Ext.zion.token+'/defect_img/'+Zion.util.encodeParam([path]);
						}
						if(formPanel.findField('file_path').getValue().length>0){
							formPanel.submit({
								url : url,
								waitTitle: '请稍等...',
								waitMsg : '上传中......',
								success : function(form,action){
									
								},
								failure : function(form,action){
									if(action.result.r == 'ok'){
										
										var params = [axiom_seq_type_id,type_name,memo,system_type];
										Zion.db.getJSON('axiom_dictionary_type.insert',params,function(data){
											if(!data.f){
												Ext.Msg.alert('提示','类型数据添加成功');
												Ext.getCmp('add_attribute').disable();
												disable_button();
												type_store.reload();
												type_window.close();
											}else{
												Ext.Msg.alert('提示','类型数据添加失败');
												Ext.getCmp('add_attribute').disable();
												disable_button();
												type_window.close();
											}	
										})
									}else{
										Ext.Msg.alert('上传提示','上传图片错误');
										Ext.getCmp('add_attribute').disable();
									}
								}
							})
						}
					}else{
						Ext.Msg.alert('提示','类型数据添加失败');
						Ext.getCmp('add_attribute').disable();
						type_window.close();
					}
				})
			}else{
				var id =  formPanel.findField('type_id').getValue();
				var filePath = formPanel.findField('file_path').getValue();
				var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
				var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
				var path = id+'.png';
				var system_type = system_type_combo.getValue();
				var sm_select = type_grid.getSelectionModel().getSelected();
				var old_system_type = sm_select.data.system_type;
				if(system_type == 1 || system_type == 2){
					var url = '/upload/'+Ext.zion.token+'/map_poi/'+Zion.util.encodeParam([path]);
				}else{
					var url = '/upload/'+Ext.zion.token+'/defect_img/'+Zion.util.encodeParam([path]);
				}
				var params = [type_name,memo,system_type,id,old_system_type];
				if(formPanel.findField('file_path').getValue().length>0){
					formPanel.submit({
						url : url,
						waitTitle: '请稍等...',
						waitMsg : '上传中......',
						success : function(form,action){
							
						},
						failure : function(form,action){
							if(action.result.r == 'ok'){
								Zion.db.getJSON('axiom_dictionary_type.update',params,function(data){
									if(!data.f){
										Ext.Msg.alert('提示','类型数据修改成功');
										disable_button();
										Ext.getCmp('add_attribute').disable();
										type_store.reload();
										Ext.getCmp('update_type').disable();
										Ext.getCmp('delete_type').disable();
										type_window.close();
									}else{
										Ext.Msg.alert('提示','类型数据修改失败');
										disable_button();
										Ext.getCmp('add_attribute').disable();
										Ext.getCmp('update_type').disable();
										Ext.getCmp('delete_type').disable();
										type_window.close();
									}	
								})
							}
						}
					})
				}else{
					
				}
			}
		}
	}
	
	function add_or_update_attribute(attribute_formpanel,attribute_window){
		if (attribute_formpanel.isValid() == false) {
			return false;
		}else{
			var overlay_attribute_name = $.trim(Ext.getCmp('overlay_attribute_name').getValue());
			var memo = Ext.getCmp("memo").getValue();
			var attribute_type_id = attribute_formpanel.findField("attribute_type_id").getValue();
			if(attribute_button_update == true){
				Zion.db.getJSON('axiom_info_attribute.info_attribute_id.select',null,function(data){
					if(!data.f){
						var overlay_attribute_id = data.r[0][0];
						var params = [overlay_attribute_id,overlay_attribute_name,memo,attribute_type_id];
						Zion.db.getJSON('axiom_dictionary_attribute.insert',params,function(data){
							if(!data.f){
								var sm_select = type_grid.getSelectionModel().getSelected();
								var type_id = sm_select.data.type_id;
								Zion.db.getJSON('axiom_info_type_attribute.insert',[type_id,overlay_attribute_id,'1','1'],function(data){
									Ext.Msg.alert('提示','属性添加成功');
									disable_button();
									attribute_grid.store.reload();
									attribute_window.close();
								})
							}else{
								Ext.Msg.alert('提示','属性添加失败');
								attribute_window.close();
							}
						})
					}else{
						Ext.Msg.alert('提示','属性添加失败');
						attribute_window.close();
					}
				})
			}else{
				var overlay_attribute_id = Ext.getCmp("overlay_attribute_id").getValue();
				var params = [overlay_attribute_name,memo,attribute_type_id,overlay_attribute_id];
				Zion.db.getJSON('axiom_dictionary_attribute.update',params,function(data){
					if(data.r){
						Ext.Msg.alert('提示','属性修改成功');
						attribute_grid.store.reload();
						disable_button();
						attribute_window.close();
					}else{
						Ext.Msg.alert('提示','属性修改失败');
						attribute_window.close();
					}
				});
			}
		}
	}
	
	function disable_button(){
		Ext.getCmp('delete_attribute').disable();
		Ext.getCmp('update_attribute').disable();
	}
	/*function select_all_attribute(){
		attribute_grid.store.constructor({
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/poi_layout.type_attribute.all.select'
			}),
			root : "r",
			fields : grid_fields
		});
		attribute_grid.store.load();
	}*/
	var id = [];
	function delete_attribute(){
		var sm = attribute_grid.getSelectionModel().getSelected();
		var sm_length = attribute_grid.selModel.getSelections();
			if (sm_length.length == 0) {
				Ext.Msg.alert("删除操作", "请选择要删除的项");
			} else {
				
				if (sm_length.length > 0) {
					Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
						if (btn == 'yes') {
							for ( var i = 0; i < sm_length.length; i += 1) {
								var member = sm_length[i].data;
								if (member) {
									id.push(member.overlay_attribute_id);
								} else {
									store.remove(store.getAt(i));
								}
							}
							if (id.length > 0) {
								deleNext();
							}
						}
					})
				}
			}
		}
		var deleNext = function() {
			if (id.length > 0) {
				var attribute_id = id.pop();
				Ext.zion.db.getJSON(
					"axiom_dictionary_attribute.delete", [attribute_id],
					function(data) {
						if (!data.r) {
							Ext.Msg.alert("删除提示", "删除失败");
						} else {
							if (data.r != 0 || (!data.f)) {
								var sm_select = type_grid.getSelectionModel().getSelected();
								var overlay_type_id = sm_select.data.overlay_type_id;
								Zion.db.getJSON('axiom_overlay_type_attribute.delete',[overlay_type_id,attribute_id],function(data){
									if(!data.f){
										Ext.Msg.alert("删除提示", "删除成功");
										disable_button();
										Ext.getCmp('delete_attribute').disable();
									}else{
										Ext.Msg.alert("删除提示", "删除失败");
									}
								})
							} else {
								Ext.Msg.alert("删除提示", "删除失败");
							}
							deleNext();
						}
					});
		} else {
			attribute_grid.store.reload();
		}
	}

	function delete_type(){
		Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
			if (btn == 'yes') {
				var sm_select = type_grid.getSelectionModel().getSelected();
				var id = sm_select.data.type_id;
				var system_type = sm_select.data.system_type;
				Zion.db.getJSON('axiom_dictionary_type.delete',[id,system_type],function(data){
					if(!data.f){
						Ext.Msg.alert('提示','类型数据删除成功');
						type_store.reload();
					}else{
						Ext.Msg.alert('提示','类型数据删除失败,该类型正在使用');
					}	
				})
			}
		})
	}

	Zion.user.getInfo(function() {
		type_store.load();
		loadMask.hide();
	});
	new Ext.Viewport({
		layout : 'border',
		border : false,
		items : [{
			region : 'center',
			layout : 'fit',
			split : true,
			items : [{
				layout : 'border',
				border : false,
				items:[{
					layout:'fit',
					region : 'west',
					width:450,
					collapsible : true,
					split : true,
					title:'字典类型',
					items : [type_grid]
				},{
					region : 'center',
					layout : 'fit',
					split : true,
					items : [attribute_grid]
				}]
			}]
		}]
	});
})