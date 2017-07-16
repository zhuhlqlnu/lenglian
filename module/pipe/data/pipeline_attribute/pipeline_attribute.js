Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var type_button_update = false;
	var attribute_button_update = false;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var dictionary_add = false;
	var grid_fields =  [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo','attribute_type_id'];
	var type_fields =['overlay_type_id', 'overlay_type_name','memo','type','category','is_private','dictionary_id'];
	var type_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : type_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/pipe.data.pipeline_attribute.axiom_info_type.select'
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
		if (type_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_attribute').enable();
		} else {
			Ext.getCmp('add_attribute').disable();
		}
	})
	
	
	var type_grid = new Ext.grid.GridPanel({
		sm : type_sm,
		store : type_store,
		columns : [{
			header : "名称",
			dataIndex : 'overlay_type_name',
			sortable : true
		},{
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}],
				tbar:[{
			text : '添加',
			tooltip : '添加',
			id:'add_type',
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				type_button_update = true;
				if(type_grid.store.getTotalCount() >= 1){
					Ext.Msg.alert('提示','管线类型最多为1个');
					return;
				}
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
		},'-',{
			text : '数据字典',
			tooltip : '数据字典',
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				if(type_grid.store.getTotalCount() >= 1){
					Ext.Msg.alert('提示','管线类型最多为1个');
					return;
				}
				dictionary_add = false;
				dictionary_window_show();
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	//type_store.load();

	function dictionary_window_show(){
		var dictionary_grid_fields = [ 'overlay_attribute_id','overlay_attribute_name','memo','attribute_type_name','attribute_type_memo','attribute_type_id']
		var dictionary_store = new Ext.data.SimpleStore({
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_dictionary_attribute.type_attribute.select'
			}),
			root : "r", 
			fields : dictionary_grid_fields
		});
		var dictionary_attribute_sm = new Ext.grid.CheckboxSelectionModel();
		var dictionary_attribute_grid = new Ext.grid.GridPanel({
			title:'属性',
			store : dictionary_store,
			sm : dictionary_attribute_sm,
			columns : [dictionary_attribute_sm, {
				header : "名称",
				dataIndex : 'overlay_attribute_name',
				sortable : true
			},{
				header : "类型",
				dataIndex : 'attribute_type_memo',
				sortable : true
			},{
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			}]
		});
		
		var dictionary_type_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : ['type_id', 'type_name','memo','system_type','user_id','reg_date'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_dictionary_type.by_type.select/['+1+']'
			})
		});

		var dictionary_type_sm = new Ext.grid.RowSelectionModel({singleSelect:true});

		dictionary_type_sm.on('rowselect', function() {
			var sm_select = dictionary_type_grid.getSelectionModel().getSelected();
			if(!sm_select){
				Ext.Msg.alert('提示','请选择要查询的项');
			}else{
				var sm_select = dictionary_type_grid.getSelectionModel().getSelected();
				var id = sm_select.data.type_id;
				dictionary_attribute_grid.store.constructor({
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_dictionary_type_attribute.type_attribute.type.search/['+id+']'
					}),
					root : "r",
					fields : dictionary_grid_fields
				});
				dictionary_attribute_grid.store.load();
			}
		});
		dictionary_type_sm.on('rowdeselect', function() {
			dictionary_store.removeAll();
		});

		var dictionary_type_grid = new Ext.grid.GridPanel({
			title:'类型',
			sm : dictionary_type_sm,
			store : dictionary_type_store,
			columns : [{
				header : "名称",
				dataIndex : 'type_name',
				sortable : true,
				width:150
			},{
				header : "备注",
				dataIndex : 'memo',
				sortable : true,
				width:200
			}]
		});
		dictionary_type_store.load();
		var dictionary_panel = new Ext.Panel({
			layout : 'border',
			width:700,
			height:400,
			border : false,
			items : [{
				layout:'fit',
				region : 'west',
				width:350,
				split : true,
				items : [dictionary_type_grid]
			},{
				region : 'center',
				layout : 'fit',
				width:350,
				split : true,
				items : [dictionary_attribute_grid]
			}]
		});
		var win = new Ext.Window({
			width:700,
			height:400,
			title:'数据字典',
			closable : true,
			closeAction : 'close',
			items:[dictionary_panel],
			buttons : [{
				text : '保存',
				handler : function(){
					add_dictionary(win,dictionary_type_grid,dictionary_attribute_grid);
				}
			}, {
				text : '关闭',
				handler : function() {
					win.close();
				}
			}]
		});
		win.show();
	}
	

	function add_dictionary(win,dictionary_type_grid,dictionary_attribute_grid){
		var attribute_params = [];
		var dictionary_type_sm = dictionary_type_grid.getSelectionModel().getSelected();//数据字典类型选框
		var type_sm = type_grid.getSelectionModel().getSelected();//类型选框
		var attribute_sm = dictionary_attribute_grid.selModel.getSelections(); //数据字典属性选框

		var type_name = dictionary_type_sm.data.type_name;
		var memo = dictionary_type_sm.data.memo;
		var type_id = dictionary_type_sm.data.type_id;
		if(dictionary_add){
			var type_id = type_sm.data.overlay_type_id;
			add_attribute_dictionary(attribute_sm,attribute_params,type_id,win,dictionary_type_grid,dictionary_attribute_grid);
		}else{
			Zion.db.getJSON('axiom_seq_overlay_type_id.select',null,function(data){
				if(!data.f){
					var axiom_seq_overlay_type_id = data.r[0][0];
					var type_params = [axiom_seq_overlay_type_id,type_name,selectCorpId,memo,'pipeline','pipe',1,type_id];
					Zion.db.getJSON('axiom_info_type.insert',type_params,function(data){
						if(!data.f){
							Ext.getCmp('add_attribute').disable();
							Ext.getCmp('update_attribute').disable();
							if(attribute_sm.length != 0){
								add_attribute_dictionary(attribute_sm,attribute_params,axiom_seq_overlay_type_id,win,dictionary_type_grid,dictionary_attribute_grid);
							}else{
								type_store.reload();
								win.close();
							}
						}else{
							Ext.Msg.alert('提示','数据添加失败');
						}	
					});
				}
			});
		}
	}
	
	function add_attribute_dictionary(attribute_sm,attribute_params,axiom_seq_overlay_type_id,win,dictionary_type_grid,dictionary_attribute_grid){
		for ( var i = 0; i < attribute_sm.length; i += 1) {
			var member = attribute_sm[i].data;
			if (member) {
				attribute_params.push({attribute_name:member.overlay_attribute_name,memo:member.memo,attribute_type_id:member.attribute_type_id});
			} else {
				store.remove(store.getAt(i));
			}
		}
		if (attribute_params.length > 0) {
			insert_attribute_next(attribute_params,axiom_seq_overlay_type_id,win,dictionary_type_grid,dictionary_attribute_grid);
		}	
	}

	function insert_attribute_next(attribute_params,overlay_type_id,win,dictionary_type_grid,dictionary_attribute_grid){
		if (attribute_params.length > 0) {
			var params = attribute_params.pop();
			var attribute_id = params.attribute_id;
			var attribute_name = params.attribute_name;
			var memo = params.memo;
			var attribute_type_id = params.attribute_type_id;
			Zion.db.getJSON('axiom_info_attribute.info_attribute_id.select',null,function(data){
				if(!data.f){
					var overlay_attribute_id = data.r[0][0];
					Zion.db.getJSON('axiom_info_attribute.insert',[overlay_attribute_id,attribute_name,memo,attribute_type_id],function(data){
						if(!data.f){
							Zion.db.getJSON('axiom_info_type_attribute.insert',[overlay_type_id,overlay_attribute_id,'1','1'],function(data){
								disable_button();
								if(!dictionary_add){
									type_store.reload();
								}
								attribute_grid.store.reload();
								win.close();
							});
						}else{
							Ext.Msg.alert('提示','数据添加失败');
							disable_button();
						}
					});
				}	
			});
			insert_attribute_next(attribute_params,overlay_type_id,win,dictionary_type_grid,dictionary_attribute_grid);
		}else{
			Ext.Msg.alert('提示','数据添加成功');
		}
	}

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
			labelWidth:40,
			items : [ {
				fieldLabel : '名称',
				name : 'overlay_type_name',
				id : 'overlay_type_name',
				allowBlank : false,
				blankText : '不能为空'
			}/*,type_come*/, {
				fieldLabel : '描述',
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

	function add_or_update_type(formPanel,type_window){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var overlay_type_name = Ext.getCmp('overlay_type_name').getValue();
			//var type_id = formPanel.findField('type_id').getValue();
			//var category = formPanel.findField('category').getValue();
			var memo = Ext.getCmp('memo').getValue();
			var is_private = 0;
			if(type_button_update == true){
				Zion.db.getJSON('axiom_seq_overlay_type_id.select',null,function(data){
					if(!data.f){
						var axiom_seq_overlay_type_id = data.r[0][0];
						var params = [axiom_seq_overlay_type_id,overlay_type_name,selectCorpId,memo,'pipeline','pipe',is_private,''];
						Zion.db.getJSON('axiom_info_type.insert',params,function(data){
							if(!data.f){
								Ext.Msg.alert('提示','类型数据添加成功');
								Ext.getCmp('add_attribute').disable();
								Ext.getCmp('update_attribute').disable();
								type_store.reload();
								type_window.close();
							}else{
								Ext.Msg.alert('提示','类型数据添加失败');
								Ext.getCmp('add_attribute').disable();
								Ext.getCmp('update_attribute').disable();
								type_window.close();
							}	
						});
					}else{
						Ext.Msg.alert('提示','类型数据添加失败');
						Ext.getCmp('add_attribute').disable();
						type_window.close();
					}
				});
			}else{
				var dictionary_id = type_grid.getSelectionModel().getSelected().data.dictionary_id;
				var id =  Ext.getCmp('overlay_type_id').getValue();
				var params = [overlay_type_name,memo,is_private,dictionary_id,id];
				Zion.db.getJSON('axiom_info_type.update',params,function(data){
					if(!data.f){
						Ext.Msg.alert('提示','类型数据修改成功');
						Ext.getCmp('add_attribute').disable();
						disable_button();
						Ext.getCmp('update_type').disable();
						Ext.getCmp('delete_type').disable();
						type_store.reload();
						type_window.close();
					}else{
						Ext.Msg.alert('提示','类型数据修改失败');
						disable_button();
						Ext.getCmp('add_attribute').disable();
						Ext.getCmp('update_type').disable();
						Ext.getCmp('delete_type').disable();
						type_window.close();
					}	
				});
			}
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
						disable_button();
						Ext.getCmp('add_attribute').disable();
						Ext.getCmp('update_type').disable();
						Ext.getCmp('delete_type').disable();
						type_store.reload();
						store.removeAll();
					}else{
						Ext.Msg.alert('提示','类型数据删除失败');
						disable_button();
					}	
				})
			}
		})
	}
	
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
		title:'属性',
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
		},'-',{
			text : '数据字典',
			tooltip : '数据字典',
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				dictionary_add = true;
				var sm_select = type_grid.getSelectionModel().getSelected();
				if(!sm_select){
					Ext.Msg.alert('提示','请选择添加的类型');
					return;
				}
				dictionary_window_show();
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	
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
		})
		if(attribute_type){
			attribute_type_store.loadData( {
				'r' : [ [ attribute_type[0], attribute_type[1] ,attribute_type[1]] ]
			});
		}
		
		
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
				fieldLabel : '名称',
				name : 'overlay_attribute_name',
				id : 'overlay_attribute_name',
				allowBlank : false,
				blankText : '不能为空'
			},attribute_type_combo,/*edit_mode_combo,*/{
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
							+ '/axiom_info_type_attribute.pipeline_attribute.type.search/['+id+','+selectCorpId+']'
				}),
				root : "r",
				fields : grid_fields
			});
			attribute_grid.store.load();

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
									disable_button();
									attribute_grid.store.reload();
									attribute_window.close();
								})
							}else{
								Ext.Msg.alert('提示','属性添加失败');
								disable_button();
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
				Zion.db.getJSON('axiom_info_attribute.update',params,function(data){
					if(data.r){
						Ext.Msg.alert('提示','属性修改成功');
						attribute_grid.store.reload();
						disable_button();
						attribute_window.close();
					}else{
						Ext.Msg.alert('提示','属性修改失败');
						disable_button();
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
			Ext.Msg.alert("删除提示", "删除成功");
			attribute_grid.store.reload();
		}
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
				Ext.getCmp('update_type').disable();
				Ext.getCmp('delete_type').disable();
				selectCorpId = node.attributes.corp.corp_id;
				type_store.constructor( {
					root : 'r',
					fields : type_fields,
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/pipe.data.pipeline_attribute.axiom_info_type.select/['+selectCorpId+']'
					})
				});
				type_store.load();
				store.removeAll();
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
								+ '/pipe.data.pipeline_attribute.axiom_info_type.select/['+selectCorpId+']'
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