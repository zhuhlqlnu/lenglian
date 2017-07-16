Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var special_events_add = true;

	var loadMask = new Ext.LoadMask(Ext.getBody(), {
				msg : "加载中，请稍后 ..."
			});
	loadMask.show();
	var targetTree = new Ext.tree.TreePanel({
		autoScroll : true,
		split : true,
		region : 'center',
		animate : false,
		border : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if (node.attributes.target) {
					var key = node.attributes.target.target_id;
					showTargetInfo(key);
				} else {
					return false;
				}
			},
			checkchange : function(node, checked) {
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
								child.ui.toggleCheck(checked);
							});
				}
			}
		}
	});

	function getCheckedTarget() {
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target && node.attributes.checked) {
				var key = node.attributes.target.target_id;
				if (!checkedTargetMap[key]) {
					checkedTargetMap[key] = key;
					checkedTarget.push(key);	
				}
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
							checkedNode(child);
						});
			}
		}
		checkedNode(targetTree.getRootNode());
		return checkedTarget;
	}
	
	function showTargetInfo(target_id) {
		Zion.db.getJSON('monitor.realtime.target', [target_id], function(data) {
					if (data && data.r) {
						var target = data.r[0];
						targetInfo.setSource({
									'目标序号' : target[0],
									'目标名称' : target[1],
									'终端类型' : target[2],
									'终端序号' : target[3],
									'终端编号' : target[4],
									'通讯地址' : target[5]
								});
					}
				});
	}

	var targetInfo = new Ext.grid.PropertyGrid({
				title : '属性信息',
				collapsible : true,
				region : 'south',
				autoHeight : true,
				selModel : new Ext.grid.RowSelectionModel({
							singleSelect : true
						}),
				source : {
					'目标序号' : '',
					'目标名称' : '',
					'终端类型' : '',
					'终端序号' : '',
					'终端编号' : '',
					'通讯地址' : ''
				},
				viewConfig : {
					forceFit : true,
					scrollOffset : 2
				},
				listeners : {
					beforeedit : function() {
						return false;
					}
				}
			});
	targetInfo.store.sortInfo = null;
	targetInfo.getColumnModel().config[0].sortable = false;

	
	var select_data = [
					[ "pipe.statistics.special_events.select", '所有' ],
					[ "pipe.statistics.special_events.target_name.query.select", '监控目标' ]
					];
	var selelct_store = new Ext.data.SimpleStore( {
		fields : [ 'type', 'name' ],
		data : select_data
	});
	var select_combo = new Ext.form.ComboBox( {
		hiddenName : 'type',
		valueField : 'type',
		store : selelct_store,
		displayField : 'name',
		mode : 'local',
		width:100,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'select' : function (index){
				var objv = this.getValue();
				if(objv=="pipe.statistics.special_events.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	var sm = new Ext.grid.CheckboxSelectionModel({}); 
	var fields = ['task_id', 'content', 'target_id','target_name', 'task_date', 'create_date']
	sm.on('rowselect', function() {
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
	})
	sm.on('rowdeselect', function() {
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
	})
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "pipe.statistics.special_events.select"
				},
				root : 'r',
				fields : fields
			});

	var grid = new Ext.grid.GridPanel({
				// margins : '5 0 0 0',
				title : '特殊事件统计列表',
				flex : 1,
				region : 'center',
				store : store,
				sm : sm,
				enableColumnHide : false,

				columns : [sm, new Ext.grid.RowNumberer({
									header : '序号',
									width : 35
								}), {
							id : 'task_id',
							header : "task_id",
							sortable : true,
							dataIndex : 'task_id',
							hidden : true
						}, {
							header : '任务内容',
							width : 130,
							sortable : true,
							dataIndex : 'content'
						}, {
							header : "监控目标ID",
							width : 130,
							sortable : true,
							dataIndex : 'target_id',
							hidden : true
						}, {
							header : "监控目标",
							width : 130,
							sortable : true,
							dataIndex : 'target_name'
						}, {
							header : "任务日期",
							width : 130,
							sortable : true,
							dataIndex : 'task_date'
						}, {
							header : "创建时间",
							width : 130,
							sortable : true,
							dataIndex : 'create_date'
						}],
				tbar : [{
					id : 'addButton',
					text : '增加',
					icon : Ext.zion.image_base+'/add.gif',
					tooltip : '添加纪录',
					handler : function() {
						special_events_add = true;
						win_show();
						var field = formPanel.getForm().findField('target_id');
						field.disable();   
						field.getEl().up('.x-form-item').setDisplayed(false);
					},
					scope : this
				},'-',{
					id : 'editButton',
					text : '修改',
					disabled : true,
					icon : Ext.zion.image_base+'/update.gif',
					tooltip : '修改记录',
					handler : function() {
						updateForm();
					},
					scope : this
				},'-',{
					text : '删除',
					id : 'deleteButton',
					disabled : true,
					icon : Ext.zion.image_base+'/delete.gif',
					tooltip : '删除记录',
					handler : deleteForm,
					scope : this
				},'-',{
					text : '刷新',
					icon : Ext.zion.image_base+'/refresh.gif',
					tooltip : '刷新纪录',
					handler : function() {
						grid.store.reload();
						Ext.getCmp('editButton').disable();
						Ext.getCmp('deleteButton').disable();
					},
					scope : this
				}],
				// 第二个toolbar
				listeners : {
					'render' : function() {
						var tbar = new Ext.Toolbar( {
							items : [ '请根据', select_combo, 
							{
								xtype : 'textfield',
								width : 150,
								name : 'term',
								id : 'term',
								disabled : true
							}, {
								text : '查询',
								tooltip : '查询',
								icon : Ext.zion.image_base+'/select.gif',
								handler : selectForm
							} ]
						})
						tbar.render(this.tbar);
					}
				},
				viewConfig : {
					autoFill : true,
					forceFit : true
				},
				bbar : new Ext.PagingToolbar({
					store : store,
					pageSize : Ext.zion.page.limit,
					displayInfo : true
				})
			});
	store.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	function win_show(old_target){
		var target_store = new Ext.data.SimpleStore({
			fields : ['target_id', 'group_id', 'target_name','identity' ],
			root : 'r',
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/monitor.realtime.user_target'
			})
		});
		var target_combo = new Ext.form.ComboBox({
			store:target_store,
			fieldLabel : '车辆名称',
			hiddenName : 'target_id',
			valueField : 'target_id',
			displayField : 'target_name',
			mode : 'local',
			triggerAction : 'all',
			allowBlank : false,
			editable:false,
			blankText : '不能为空'
		})
		if(old_target){
			target_store.loadData({'r':[[old_target[0],'group_id',old_target[1],'group_id']]});
		}
		target_store.load();
		formPanel = new Ext.form.FormPanel( {
			autoHeight : true,
			width:380,
			defaultType : 'textfield',
			items:[{
				fieldLabel : 'ID',
				name : 'task_id',
				hidden : true,
				hideLabel:true
			},{
				fieldLabel : '任务内容',
				name : 'content',
				xtype:'textarea',
				allowBlank : false,
				blankText : '不能为空',
				maxLength : 54
			},{
				fieldLabel : '任务日期',
				name : 'task_date',
				xtype:'datefield',
				format:'Y-m-d',
				allowBlank : false,
				blankText : '不能为空',
				editable : false
			},target_combo,{
				fieldLabel : 'target_name',
				name : 'target_name',
				hidden : true,
				hideLabel:true
			}]
		});
		win = new Ext.Window( {
			title : '特殊事件统计',
			closable : true,
			autoWidth : false,
			width : 380,
			items : [ formPanel ],
			buttons : [ {
				id : 'save',
				text : '保存',
				handler : function() {
					if (special_events_add) {
						add_special_events(formPanel.getForm(), win);
					} else {
						update_special_events(formPanel.getForm(), win)
					}
				}
			}, {
				text : '取消',
				id : 'cancel',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		win.show();
	}
	/**增加操作**/
	function add_special_events(form, win){
		var checkedTarget = getCheckedTarget();
		if (checkedTarget.length <= 0) {
			Ext.Msg.alert('提示', '请先选择终端!');
			win.close();
			return;
		}
		if (form.isValid() == false) {
			return false;
		}
		var ids = [];
		var content = form.findField("content").getValue();
		var task_date = form.findField("task_date").getValue();
		for(var j = 0;j < checkedTarget.length ; j +=1){
			ids.push({p:content,t:checkedTarget[j], td:task_date});
		}
		if (ids.length > 0) {
			insertNext(ids);
		}
	}
	var insertNext = function(ids){
		if(ids.length > 0){
			var params=[];
			var id = ids.pop();
			params.push(id.p);
			params.push(id.t);
			params.push(parseInt(((id.td).getTime())/1000));	
			params.push(parseInt(new Date().getTime()/1000));
			Ext.zion.db.getJSON("pipe.statistics.special_events.insert", params,function(data) {
				if(data.f){
					Ext.Msg.alert('提示','数据添加有误');
				}else{
					insertNext(ids);
				}
			});
		}else{
			grid.store.reload();
			win.close();
			disabledButton();
			Ext.Msg.alert('提示','数据添加成功');
		}
	}
	/**修改操作**/
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var approve = sm.data.approve;
		var sm_num = grid.selModel.getSelections().length;
		special_events_add = false;
		var old_target_name = sm.data.target_name;
		var old_target_id = sm.data.target_id;
		var old_target = [old_target_id,old_target_name];
		win_show(old_target);
		var field = formPanel.getForm().findField('target_id');
		field.enable();   
		field.getEl().up('.x-form-item').setDisplayed(true);
		formPanel.form.loadRecord(sm);
	}
	
	function update_special_events(form, win){
		if (form.isValid() == false) {
			return false;
		}
		var task_id = form.findField("task_id").getValue();
		var target_id = form.findField('target_id').getValue();
		var content = form.findField("content").getValue();
		var task_date = parseInt(((form.findField("task_date").getValue()).getTime())/1000);
		var params = [target_id,content,task_date,task_id];
		Ext.zion.db.getJSON("pipe.statistics.special_events.update", params,function(data) {
			if(data.r && !data.f){
				Ext.Msg.alert('提示','数据修改成功');
				grid.store.reload();
				win.close();
				disabledButton();
			}else{
				Ext.Msg.alert('提示','数据修改失败');
			}
		});
	}
	function disabledButton(){
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('editButton').disable();
	}
	
	/**查询**/
	function selectForm() {
		var type = select_combo.getValue();
		var term = $('#term').val();
		var paramsA;
		if (!Ext.getCmp('term').disabled) {
			paramsA = [ term ];
		}
		grid.store.constructor( {
			db : {
				params : paramsA,
				alias : type
			},
			root : "r",
			fields : fields
		});
		grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		})
		disabledButton();
	}
	var viewport = new Ext.Viewport({
				layout : 'border',
				defaults : {
					border : true
				},
				items : [{
					margins : '5 0 0 0',
					title : '监控目标列表',
					region : 'west',
					collapsible : true,
					split : true,
					width : 200,
					layout : 'border',
					items : [targetTree, targetInfo]
				}, {
					margins : '5 0 0 0',
					//title : '监控目标列表',
					region : 'center',
					layout:'fit',
					items : [grid]
				}]
			});
	/**双击修改**/
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	
	/**删除操作**/
	var id = [];
	function deleteForm() {
		var sm_select = grid.getSelectionModel().getSelected();
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.task_id);
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
	var deleNext = function() {
		if (id.length > 0) {
			var params = [ id.pop() ];
			Ext.zion.db.getJSON("pipe.statistics.special_events.delete",params, function(data) {
				if (!data.r) {
					Ext.Msg.alert("提示", "删除失败");
				} else {
					deleNext();
				}
			});
		} else {
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
			Ext.Msg.alert("提示", "删除成功");
			grid.store.reload();
		}
	}
	
	Ext.zion.tree.loadTargetTree(function(tree) {
				targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				loadMask.hide();
			}, true);

});
