Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var type_button_update = false;
	var attribute_button_update = false;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var grid_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo'];
	var type_fields =['overlay_type_id', 'overlay_type_name','memo','type','category','is_private'];
	var type_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : type_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_info_type.select'
		})
	});
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
	})
	
	
	var type_grid = new Ext.grid.GridPanel({
		sm : type_sm,
		store : type_store,
		columns : [type_sm, {
			header : "类型名称",
			dataIndex : 'overlay_type_name',
			sortable : true
		},{
			header : "类型描述",
			dataIndex : 'memo',
			sortable : true
		}/*,{
			header : "类型",
			dataIndex : 'type',
			sortable : true,
			renderer:function(type){
				if(type == 1){
					return "点";
				}else if(type == 2){
					return "线";
				}else{
					return "面";
				}
			}
		}*/,{
			header : "是否私有",
			dataIndex : 'is_private',
			sortable : true,
			renderer:function(is_private){
				if(is_private == 1){
					return "公开";
				}else{
					return "私有";
				}
			}
		},{
			header :'类型图片',
			sortable : true,
			dataIndex : 'overlay_type_id',
			renderer:function(overlay_type_id){
				return '<img src="/api/image/poi/'+overlay_type_id+'.png?'+Math.random()+'"></img>';
			}
		}],
		tbar:[/*{
			text : '查询',
			tooltip : '查询',
			id:'select_type',
			disabled:true,
			icon : Ext.zion.image_base+'/select.gif',
			handler : function(){
				
			}
		},*/{
			text : '添加类型',
			tooltip : '添加类型',
			id:'add_type',
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				type_button_update = true;
				type_window_show();
			}
		},{
			text : '修改类型',
			tooltip : '修改类型',
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
			text : '删除类型',
			tooltip : '删除类型',
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
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	//type_store.load();
	
	var store = new Ext.data.SimpleStore({
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/sql.axiom_info_type_attribute.type_attribute.select'
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
	})
	
	sm.on('rowselect', function() {
		if (attribute_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('delete_attribute').enable();
		} else {
			Ext.getCmp('delete_attribute').disable();
		}
	})
	var attribute_grid = new Ext.grid.GridPanel({
		title:'属性',
		store : store,
		sm : sm,
		columns : [sm, /* {
			header : "属性ID",
			dataIndex : 'overlay_attribute_id',
			sortable : true
		},*/{
			header : "属性名称",
			dataIndex : 'overlay_attribute_name',
			sortable : true
		},{
			header : "属性备注",
			dataIndex : 'memo',
			sortable : true
		}/*,{
			header : "属性类型名称",
			dataIndex : 'attribute_type_name',
			sortable : true
		}*/,{
			header : "属性类型备注",
			dataIndex : 'attribute_type_memo',
			sortable : true
		}],
		tbar : [{
			text : '添加该类型属性',
			tooltip : '添加该类型属性',
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
			text : '删除属性',
			tooltip : '删除属性',
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
		var type_come = new Ext.form.ComboBox({
			fieldLabel : '类型',
			store: new Ext.data.SimpleStore({
				fields : ['type_id', 'type_name'],
				data : [[1,'点']/*,[2,'线'],[3,'面']*/]
			}),
			hiddenName : 'type_id',
			valueField : 'type_id',
			displayField : 'type_name',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			value:1
		})
		formPanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			fileUpload: true,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '类型名称',
				name : 'overlay_type_name',
				id : 'overlay_type_name',
				allowBlank : false,
				blankText : '不能为空'
			}/*,type_come*/, {
				fieldLabel : '类型描述',
				name : 'memo',
				id : 'memo',
				xtype:'textarea',
				allowBlank : false,
				blankText : '不能为空'
			},{
				name:'overlay_type_id',
				id : 'overlay_type_id',
				hidden : true,
				hideLabel : true
			}/*,{
				fieldLabel : '类型所属类别',
				name:'category',
				id : 'category'
			}*/,	{
				xtype : "panel",
				layout : "column",
				fieldLabel : '是否私有',
				isFormField : true,
				anchor : '90%',
				items : [ {
					columnWidth : .5,
					checked : true,
					xtype : "radio",
					boxLabel : "私有",
					name : "is_private",
					inputValue : 0
				}, {
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "公开",
					name : "is_private",
					inputValue : 1
				} ]
			},{
				xtype: 'fileuploadfield',
				//inputType:'file',
				id: 'file_path',
				emptyText: '选择上传图标',
				fieldLabel: '类型图标',
				name: 'file_path',
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
					add_or_update_type(formPanel.getForm(),type_window)
				}
			}, {
				text : '关闭',
				handler : function() {
					formPanel.form.reset();
					type_window.close();
				}
			}]
		})
		type_window.show();
	}
	
	function attribute_window_show(){
		var attribute_type_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['attribute_type_id', 'attribute_type_name', 'attribute_type_memo'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/info_attribute_type.select'
			})
		});

		var attribute_type_combo = new Ext.form.ComboBox({
			fieldLabel : '属性类型名称',
			hiddenName : 'attribute_type_id',
			valueField : 'attribute_type_id',
			store : attribute_type_store,
			displayField : 'attribute_type_memo',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			allowBlank : false
		})
		attribute_type_store.load();
		
		var edit_mode_store = new Ext.data.SimpleStore({
			fields : ['edit_mode', 'edit_mode_name'],
			data:[[1,'管理员可修改'],[2,'用户可修改']]
		});

		var edit_mode_combo = new Ext.form.ComboBox({
			fieldLabel : '修改权限',
			hiddenName : 'edit_mode',
			valueField : 'edit_mode',
			store : edit_mode_store,
			displayField : 'edit_mode_name',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			allowBlank : false,
			value:1
		})

		attribute_formpanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '属性名称',
				name : 'overlay_attribute_name',
				id : 'overlay_attribute_name',
				allowBlank : false,
				blankText : '不能为空'
			},attribute_type_combo,/*edit_mode_combo,*/{
				fieldLabel : '属性描述',
				name : 'memo',
				id : 'memo',
				xtype:'textarea'
			},{
				name:'overlay_attribute_id',
				id : 'overlay_attribute_id',
				hidden : true,
				hideLabel : true
			}]		
		})
		
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
		})
		attribute_window.show();
	}
	
	function selectForm(){
		var sm_select = type_grid.getSelectionModel().getSelected();
		var id = sm_select.data.overlay_type_id;
    		attribute_grid.store.constructor({
				proxy : new Ext.data.ScriptTagProxy({
					url : ZionSetting.db.url + '/' + Zion.token
							+ '/axiom_info_type_attribute.type_attribute.type.search/['+id+','+selectCorpId+']'
				}),
				root : "r",
				fields : grid_fields
			});
			attribute_grid.store.load();

	}
	
	function add_or_update_type(formPanel,type_window){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var overlay_type_name = Ext.getCmp('overlay_type_name').getValue();
			//var type_id = formPanel.findField('type_id').getValue();
			//var category = formPanel.findField('category').getValue();
			var memo = Ext.getCmp('memo').getValue();
			var is_private = formPanel.findField("is_private").getGroupValue();
			if(type_button_update == true){
				Zion.db.getJSON('axiom_seq_overlay_type_id.select',null,function(data){
					if(!data.f){
						var axiom_seq_overlay_type_id = data.r[0][0];
						var filePath = formPanel.findField('file_path').getValue();
						var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
						var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
						var path = axiom_seq_overlay_type_id+'.png';
						var url = '/upload/'+Ext.zion.token+'/map_poi/'+Zion.util.encodeParam([path]);
						if(formPanel.findField('file_path').getValue().length>0){
							formPanel.submit({
								url : url,
								waitTitle: '请稍等...',
								waitMsg : '上传中......',
								success : function(form,action){
									
								},
								failure : function(form,action){
									if(action.result.r == 'ok'){
										
										var params = [axiom_seq_overlay_type_id,overlay_type_name,selectCorpId,memo,'facilities','pipe',is_private];
										Zion.db.getJSON('axiom_info_type.insert',params,function(data){
											if(!data.f){
												Ext.Msg.alert('提示','类型数据添加成功');
												Ext.getCmp('add_attribute').disable();
												type_store.reload();
												type_window.close();
											}else{
												Ext.Msg.alert('提示','类型数据添加失败');
												Ext.getCmp('add_attribute').disable();
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
				var id =  Ext.getCmp('overlay_type_id').getValue();
				var filePath = formPanel.findField('file_path').getValue();
				var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
				var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
				var path = id+'.png';
				var url = '/upload/'+Ext.zion.token+'/map_poi/'+Zion.util.encodeParam([path]);
				var params = [overlay_type_name,memo,is_private,id];
				if(formPanel.findField('file_path').getValue().length>0){
					formPanel.submit({
						url : url,
						waitTitle: '请稍等...',
						waitMsg : '上传中......',
						success : function(form,action){
							
						},
						failure : function(form,action){
							if(action.result.r == 'ok'){
								Zion.db.getJSON('axiom_info_type.update',params,function(data){
									if(!data.f){
										Ext.Msg.alert('提示','类型数据修改成功');
										Ext.getCmp('add_attribute').disable();
										type_store.reload();
										Ext.getCmp('update_type').disable();
										Ext.getCmp('delete_type').disable();
										type_window.close();
									}else{
										Ext.Msg.alert('提示','类型数据修改失败');
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
					Zion.db.getJSON('axiom_info_type.update',params,function(data){
						if(!data.f){
							Ext.Msg.alert('提示','类型数据修改成功');
							Ext.getCmp('add_attribute').disable();
							Ext.getCmp('update_type').disable();
							Ext.getCmp('delete_type').disable();
							type_store.reload();
							type_window.close();
						}else{
							Ext.Msg.alert('提示','类型数据修改失败');
							Ext.getCmp('add_attribute').disable();
							Ext.getCmp('update_type').disable();
							Ext.getCmp('delete_type').disable();
							type_window.close();
						}	
					})
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
						Zion.db.getJSON('axiom_info_attribute.insert',params,function(data){
							if(!data.f){
								var sm_select = type_grid.getSelectionModel().getSelected();
								var overlay_type_id = sm_select.data.overlay_type_id;
								Zion.db.getJSON('axiom_info_type_attribute.insert',[overlay_type_id,overlay_attribute_id,'1','1'],function(data){
									Ext.Msg.alert('提示','属性添加成功');
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
				
			}
		}
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
					"axiom_info_attribute.delete", [attribute_id],
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
				var id = sm_select.data.overlay_type_id;
				Zion.db.getJSON('axiom_info_type.delete',[id],function(data){
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
	
	var corp_tree = new Ext.tree.TreePanel( {
		title : '集团列表',
		id : 'tree_id',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		width : 200,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				Ext.getCmp('add_attribute').disable();
				Ext.getCmp('delete_attribute').disable();
				Ext.getCmp('delete_type').disable();
				Ext.getCmp('update_type').disable();
				selectCorpId = node.attributes.corp.corp_id;
				type_store.constructor( {
					root : 'r',
					fields : type_fields,
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type.select/['+selectCorpId+']'
					})
				});
				type_store.load();

			}
		}
	});

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});

		type_store.constructor( {
					root : 'r',
					fields : type_fields,
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_info_type.select/['+selectCorpId+']'
					})
				});
		type_store.load();

	});
	new Ext.Viewport({
		layout : 'border',
		border : false,
		items : [corp_tree,{
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
					title:'类型',
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