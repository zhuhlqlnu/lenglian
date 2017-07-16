Ext.onReady(function() {
	Ext.QuickTips.init();
	var is_approve=false;
	var fields = ['id', 'applier', 'cost_reason', 'total', 'approve', 'approve_memo','version'];
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "fare_apply.office_cost.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "fare_apply.office_cost.select", '目标号码' ],
					[ "fare_apply.office_cost.applier.select", '用车人' ] ];
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
		editable : false,
		triggerAction : 'all',
		anchor : '95%',
		listeners : {
			'select' : function (index){
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	var sm = new Ext.grid.CheckboxSelectionModel();
	
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
	
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [ sm, {
							header : "编号",
							dataIndex : 'id',
							width : 50,
							sortable : true
						}, {
							header : "车牌号码",
							dataIndex : 'company',
							width : 100,
							sortable : true
						}, {
							header : "租车单位名称",
							width : 120,
							dataIndex : 'name',
							sortable : true
						}, {
							header : "租车单位地址",
							width : 120,
							dataIndex : 'nationality',
							sortable : true
						}, {
							header : "租车单位联系人",
							width : 100,
							dataIndex : 'duty',
							sortable : true
						}, {
							header : "租车开始时间",
							width : 100,
							dataIndex : 'duty_name',
							sortable : true
						}, {
							header : "租用截止时间",
							width : 120,
							dataIndex : 'hours_sum',
							sortable : true
						}, {
							header : "租用车型",
							width : 80,
							dataIndex : 'overtime',
							sortable : true
						}, {
							header : "租车用途",
							width : 80,
							dataIndex : 'weekday',
							sortable : true
						}],
		tbar : [{
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加纪录',
			handler : function() {
				is_approve = false;
				travel_cost_add = true;
				win_show();
			},
			scope : this
		},
		'-',
		{
			id : 'editButton',
			text : '修改',
			disabled : true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : function() {
				updateForm();
			},
			scope : this
		},
		'-',
		{
			text : '删除',
			id : 'deleteButton',
			disabled : true,
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除记录',
			handler : deleteForm,
			scope : this
		},
		'-',
		{
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			},
			scope : this
		},
		'-',
		{
			text : '导出报表',
			icon : Ext.zion.image_base+'/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				Ext.Msg
						.alert(
								"下载报表",
								"<a href='"
										+ Zion.report
												.getURL('fare_apply.office_cost.report')
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			},
			scope : this
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : ['请根据',select_combo, {
						xtype : 'textfield',
						width : 150,
						name:'term',
						id : 'term'
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
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	/*reward_system_data = {};
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});*/

	////////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	function win_show() {
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '申报人',
				name : 'applier',
				maxLength : 12,
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '费用理由',
				allowBlank : false,
				maxLength : 512,
				blankText : '不能为空',
				name : 'cost_reason'
			}, {
				fieldLabel : '费用合计',
				maxLength : 12,
				regex : /^\d+(\.\d+)?$/,
				regexText : '大于等于0的数',
				name : 'total'
			}, {
				fieldLabel : 'ID',
				maxLength : 12,
				hidden : true,
				hideLabel : true,
				name : 'id'
			}, {
				fieldLabel : '版本',
				name : 'version',
				hideLabel : true,
				hidden : true,
				anchor : '90%'
			}]
		})
		win = new Ext.Window( {
			title : '其他费用录入',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id : 'save',
				text : '保存',
				handler : function() {
					if (travel_cost_add) {
						add_office_cost(formPanel.getForm(), win);
					} else {
						update_office_cost(formPanel.getForm(), win)
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
		if (is_approve) {
			Ext.getCmp('save').disable();
		}
		win.show();
	}
	function add_office_cost(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = Ext.zion.form.getParams(formPanel, [ 'applier', 'cost_reason', 'total']);
		Ext.zion.db.getJSON("fare_apply.office_cost.insert", params,function(data) {
			if (data.r &&(!data.f)) {				
				Ext.Msg.alert("增加操作", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("增加操作", "数据添加错误");
			}
		})
	}
	function update_office_cost(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		
		var params = Ext.zion.form.getParams(formPanel, [ 'applier', 'cost_reason', 'total','id','version']);
		Ext.zion.db.getJSON("fare_apply.office_cost.update", params,function(data) {
			if (data.r == 1) {
				win.close();
				grid.store.reload();
				Ext.Msg.alert("提示", "数据修改成功");
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据修改错误");
			}
		})	
	}
	// ----------修改window表单---------
	function updateForm() {
		travel_cost_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var approve = sm.data.approve;
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			if (approve == 1 || approve == 2) {
				is_approve = true;
			} else {
				is_approve = false;
			}
			win_show();
			formPanel.form.loadRecord(sm);
		}
	}
	// 查询form
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
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

	// 删除 form
	var id = [];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		var sm_select = grid.getSelectionModel().getSelected();
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			var approve = sm_select.data.approve;
			if (approve == 1 || approve == 2) {
				Ext.Msg.alert("删除操作", "不能删除审批后的工作报表");
				return false;
			}
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.id);
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
			var params = [ id.pop() ];
			Ext.zion.db.getJSON("fare_apply.office_cost.delete",
					params, function(data) {
						if (!data.r) {
							Ext.Msg.alert("删除提示", "删除失败");
						} else {
							if (data.r != 0 ||(!data.f)) {
								Ext.Msg.alert("删除提示", "删除成功");
								Ext.getCmp('editButton').disable();
								Ext.getCmp('deleteButton').disable();
							} else {
								Ext.Msg.alert("删除提示", "删除失败");
							}
							deleNext();
						}
					});
		} else {
			grid.store.reload();
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}

	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});
})