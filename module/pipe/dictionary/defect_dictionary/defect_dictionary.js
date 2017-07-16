Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var type_button_update = false;
	var attribute_button_update = false;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var type_fields =['type_id', 'type_name','memo','system_type','user_id','reg_date'];
	var type_sm = new Ext.grid.CheckboxSelectionModel();
	type_sm.on('rowselect', function() {
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

	})
	type_sm.on('rowdeselect', function() {
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
	});
	
	var type_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : type_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_dictionary_type.by_type.select/['+3+']'
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
			header :'图标',
			sortable : true,
			dataIndex : 'type_id',
			renderer:function(v,c,r){
				var type_id = r.data["type_id"];
				var system_type = r.data["system_type"];
				return '<img src="/api/image/defect/'+type_id+'.png?'+Math.random()+'"></img>';
			}
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
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	//type_store.load();
	
	function type_window_show(){
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
			},{
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
		});
		type_window.show();
	}
	
	
	function add_or_update_type(formPanel,type_window){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var system_type = 3;
			var type_name = $.trim(Ext.getCmp('type_name').getValue());
			var memo = Ext.getCmp('memo').getValue();
			if(type_button_update == true){
				var alars = 'axiom_seq_defect_type_id.select';
				Zion.db.getJSON(alars,null,function(data){
					if(!data.f){
						var axiom_seq_type_id = data.r[0][0];
						var filePath = formPanel.findField('file_path').getValue();
						var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
						var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
						var path = axiom_seq_type_id+'.png';
						var url = '/upload/'+Ext.zion.token+'/defect_img/'+Zion.util.encodeParam([path]);
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
												disable_button();
												type_store.reload();
												type_window.close();
											}else{
												Ext.Msg.alert('提示','类型数据添加失败');
												disable_button();
												type_window.close();
											}	
										})
									}else{
										Ext.Msg.alert('上传提示','上传图片错误');
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
				var system_type = 3;
				var sm_select = type_grid.getSelectionModel().getSelected();
				var old_system_type = sm_select.data.system_type;
				var url = '/upload/'+Ext.zion.token+'/defect_img/'+Zion.util.encodeParam([path]);
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
										type_store.reload();
										Ext.getCmp('update_type').disable();
										Ext.getCmp('delete_type').disable();
										type_window.close();
									}else{
										Ext.Msg.alert('提示','类型数据修改失败');
										disable_button();
										Ext.getCmp('update_type').disable();
										Ext.getCmp('delete_type').disable();
										type_window.close();
									}	
								})
							}
						}
					})
				}else{
					Zion.db.getJSON('axiom_dictionary_type.update',params,function(data){
						if(!data.f){
							Ext.Msg.alert('提示','类型数据修改成功');
							disable_button();
							type_store.reload();
							Ext.getCmp('update_type').disable();
							Ext.getCmp('delete_type').disable();
							type_window.close();
						}else{
							Ext.Msg.alert('提示','类型数据修改失败');
							disable_button();
							Ext.getCmp('update_type').disable();
							Ext.getCmp('delete_type').disable();
							type_window.close();
						}	
					});
				}
			}
		}
	}

	function disable_button(){
		Ext.getCmp('delete_type').disable();
		Ext.getCmp('update_type').disable();
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
	function delete_type(){
		var sm_length = type_grid.selModel.getSelections();
		if (sm_length.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm_length.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm_length.length; i += 1) {
							var member = sm_length[i].data;
							if (member) {
								id.push({id:member.type_id,type:member.system_type});
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
		function deleNext(){
			if (id.length > 0) {
				var type = id.pop();
				var type_id = type.id;
				var system_type = type.type;
				Ext.zion.db.getJSON("axiom_dictionary_type.delete", [type_id,system_type],function(data) {
					if (!data.r) {
						Ext.Msg.alert("提示", "数据删除失败");
					} else {
						if (data.r != 0 || (!data.f)) {
							disable_button();
						}else{
							Ext.Msg.alert("提示", "数据删除失败");
						}
					}
				});
				deleNext();
			} else {
				Ext.Msg.alert("提示", "类型数据删除成功");
				type_grid.store.reload();
			}
		}
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
				layout:'fit',
				title:'类型',
				items : [type_grid]
			}]
		}]
	});
})