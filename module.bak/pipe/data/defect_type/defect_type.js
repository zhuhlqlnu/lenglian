Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var defect_add_update = false;
	var defect_fields = ['id', 'name', 'memo', 'reg_user_id', 'reg_time', 'corp_id'];
	var defect_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : defect_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/pipe.management.data.pipe_defect_type.select'
		})
	});
	var defect_sm = new Ext.grid.CheckboxSelectionModel();
	
	defect_sm.on('rowselect', function() {
		if (defect_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('update_type').enable();
		} else {
			Ext.getCmp('update_type').disable();
		}
		if (defect_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('delete_type').enable();
		} else {
			Ext.getCmp('delete_type').disable();
		}
	});
	
	defect_sm.on('rowdeselect', function() {
		if (defect_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('update_type').enable();
		} else {
			Ext.getCmp('update_type').disable();
		}
		if (defect_grid.selModel.getSelections().length !=0) {
			Ext.getCmp('delete_type').enable();
		} else {
			Ext.getCmp('delete_type').disable();
		}
	});
	
	var defect_grid = new Ext.grid.GridPanel({
		sm : defect_sm,
		store : defect_store,
		columns : [defect_sm, {
			header : "类型名称",
			dataIndex : 'name',
			sortable : true
		},{
			header : "类型描述",
			dataIndex : 'memo',
			sortable : true
		},{
			header :'类型图片',
			sortable : true,
			dataIndex : 'id',
			renderer:function(id){
				return '<img src="/api/image/defect/'+id+'.png?'+Math.random()+'"></img>';
			}
		}],
		tbar:[{
			text : '添加',
			tooltip : '添加',
			id:'add_type',
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				defect_add_update = true;
				defect_window_show();
			}
		},{
			text : '修改',
			tooltip : '修改',
			id:'update_type',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			handler:function(){
				defect_add_update = false;
				var sm_select = defect_grid.getSelectionModel().getSelected();
				if(!sm_select){
					Ext.Msg.alert('提示','请选择要修改的项');
				}else{
					defect_window_show();
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
				var sm_select = defect_grid.getSelectionModel().getSelected();
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
	});
	
	function defect_window_show(){
		formPanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			fileUpload: true,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '类型名称',
				name : 'name',
				id : 'name',
				allowBlank : false,
				blankText : '不能为空'
			},{
				fieldLabel : '类型描述',
				name : 'memo',
				id : 'memo',
				xtype:'textarea'
			},{
				name:'id',
				id : 'id',
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
		var defect_window = new Ext.Window({
			width:380,
			title:'缺陷类型信息',
			closable : true,
			closeAction : 'close',
			items:[formPanel],
			buttons : [{
				text : '保存',
				handler : function(){
					add_or_update_type(formPanel.getForm(),defect_window)
				}
			}, {
				text : '关闭',
				handler : function() {
					formPanel.form.reset();
					defect_window.close();
				}
			}]
		})
		defect_window.show();
	}
	
	function add_or_update_type(formPanel,defect_window){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var name = Ext.getCmp('name').getValue();
			var memo = Ext.getCmp('memo').getValue();
			if(defect_add_update == true){
				Zion.db.getJSON('axiom_seq_defect_type_id.select',null,function(data){
					if(!data.f){
						var axiom_seq_defect_id = data.r[0][0];
						var filePath = formPanel.findField('file_path').getValue();
						var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
						var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
						var path = axiom_seq_defect_id+'.png';
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
										
										var params = [axiom_seq_defect_id,name,memo,selectCorpId];
										Zion.db.getJSON('pipe.management.data.pipe_defect_type.insert',params,function(data){
											if(!data.f){
												Ext.Msg.alert('提示','缺陷类型数据添加成功');
												disable_button();
												defect_store.reload();
												defect_window.close();
											}else{
												Ext.Msg.alert('提示','缺陷类型数据添加失败');
												disable_button();
												defect_window.close();
											}	
										})
									}else{
										Ext.Msg.alert('上传提示','上传图片错误');
									}
								}
							})
						}
					}else{
						Ext.Msg.alert('提示','缺陷类型数据添加失败');
						disable_button();
						defect_window.close();
					}
				})
			}else{
				var id =  Ext.getCmp('id').getValue();
				var filePath = formPanel.findField('file_path').getValue();
				var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
				var file_name = filePath.substring(filePath.lastIndexOf('\\')+1);
				var path = id+'.png';
				var url = '/upload/'+Ext.zion.token+'/defect_img/'+Zion.util.encodeParam([path]);
				var params = [name,memo,id];
				if(formPanel.findField('file_path').getValue().length>0){
					formPanel.submit({
						url : url,
						waitTitle: '请稍等...',
						waitMsg : '上传中......',
						success : function(form,action){
							
						},
						failure : function(form,action){
							if(action.result.r == 'ok'){
								Zion.db.getJSON('pipe.management.data.pipe_defect_type.update',params,function(data){
									if(!data.f){
										Ext.Msg.alert('提示','缺陷类型数据修改成功');
										disable_button();
										defect_store.reload();
										defect_window.close();
									}else{
										Ext.Msg.alert('提示','缺陷类型数据修改失败');
										disable_button();
										defect_window.close();
									}	
								})
							}
						}
					})
				}else{
					Zion.db.getJSON('pipe.management.data.pipe_defect_type.update',params,function(data){
						if(!data.f){
							Ext.Msg.alert('提示','缺陷类型数据修改成功');
							disable_button();
							defect_store.reload();
							defect_window.close();
						}else{
							Ext.Msg.alert('提示','缺陷类型数据修改失败');
							disable_button();
							defect_window.close();
						}	
					})
				}
			}
		}
	}
	
	var id = [];
	function delete_type(){
	var sm = defect_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.id);
						} else {
							task_store.remove(store.getAt(i));
						}
					}
					if (id.length > 0) {
						deleNext();
					}
				}
			})
		}
	}
	var deleNext = function() {
		if (id.length > 0) {
			var params = [ id.pop() ];
			Zion.db.getJSON('pipe.management.data.pipe_defect_type.delete',params,function(data){
				if(data.r){
					deleNext();
				}else{
					Ext.Msg.alert("提示", "删除失败");
				}
			})

		} else {
			defect_grid.store.reload();
			Ext.Msg.alert("提示", "删除成功");
			disable_button();
		}
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
				selectCorpId = node.attributes.corp.corp_id;
				defect_store.constructor( {
					root : 'r',
					fields : defect_fields,
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/pipe.management.data.pipe_defect_type.select/['+selectCorpId+']'
					})
				});
				defect_store.load();
				disable_button();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		
		defect_store.constructor( {
			root : 'r',
			fields : defect_fields,
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.management.data.pipe_defect_type.select/['+selectCorpId+']'
			})
		});
		defect_store.load();
	});
	
	function disable_button(){
		Ext.getCmp("delete_type").disable();
		Ext.getCmp("update_type").disable();
	}
	
	new Ext.Viewport({
		layout : 'border',
		border : false,
		items : [{
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			layout:'fit',
			title:'缺陷类型',
			region : 'center',
			split : true,
			items : [defect_grid]
		}]
	});
})