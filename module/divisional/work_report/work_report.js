Ext.onReady(function() {
	Ext.QuickTips.init();
	var work_report_add = false;
	var report_type_combo;
	var is_approve=false;
	var fields = [ 'id', 'report_type', 'authors', 'recipient',
					'report_content', 'approve', 'memo','version' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "divisional_work_report.select"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["divisional_work_report.select",'所有'],["divisional_work_report.query.report_type.select",'工作表类型']];
	var selelct_store =  new Ext.data.SimpleStore( {
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
				var objv = this.getValue();
				if(objv=="divisional_work_report.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
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
		if (grid.selModel.getSelections().length !=0) {
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
			header : "工作表类型",
			dataIndex : 'report_type',
			width : 100,
			sortable : true
		}, {
			header : "起草人",
			width : 100,
			dataIndex : 'authors',
			sortable : true
		}, {
			header : "接受人",
			width : 100,
			dataIndex : 'recipient',
			sortable : true
		}, {
			header : "报表内容",
			width : 100,
			dataIndex : 'report_content',
			sortable : true
		}, {
			header : "审核状态",
			dataIndex : 'approve',
			width : 140,
			sortable : true,
			renderer : function(approve) {
			if(approve ==2){
				return "审核未通过";
			}else if(approve ==1){
				return "审核通过";
			}else{
				return "未审核";
			}
			}
		}, {
			header : "备注",
			dataIndex : 'memo',
			width : 700,
			sortable : true
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加纪录',
			handler : function() {
				is_approve=false;
				work_report_add = true;
				work_report_show();
			},
			scope : this
		}, '-', {
			id : 'editButton',
			text : '修改',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : function() {
				updateForm();
			},
			scope : this
		}, '-', {
			text : '删除',
			id : 'deleteButton',
			disabled:true,
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除记录',
			handler : deleteForm,
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			},
			scope : this
		} ,'-',{
			text : '导出报表',
			icon : Ext.zion.image_base+'/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				Ext.Msg
						.alert(
								"下载报表",
								"<a href='"
										+ Zion.report
												.getURL('personnel.work_report.report')
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			}
		],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据',select_combo, {
						xtype : 'textfield',
						width : 150,
						name:'term',
						id : 'term',
						disabled:true
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
	reward_system_data = {};
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	// ----------form表单---------
	function work_report_show() {
		var report_type_data = [ [ '工作周报', '工作周报' ], [ '项目报告', '项目报告' ],
				[ '其他', '其他' ] ];
		var report_type_store = new Ext.data.SimpleStore( {
			fields : [ 'report_type', 'name' ],
			data : report_type_data
		});
		report_type_combo = new Ext.form.ComboBox( {
			fieldLabel : '工作表类型',
			hiddenName : 'report_type',
			valueField : 'report_type',
			store : report_type_store,
			displayField : 'name',
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ report_type_combo, {
				fieldLabel : '起草人',
				name : 'authors',
				maxLength : 12,
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '接受人',
				allowBlank : false,
				maxLength : 12,
				blankText : '不能为空',
				name : 'recipient'
			}, {
				fieldLabel : '报表内容',
				allowBlank : false,
				blankText : '不能为空',
				xtype : 'textarea',
				maxLength : 1024,
				name : 'report_content'
			}, {
				fieldLabel : '备注',
				xtype : 'textarea',
				maxLength : 512,
				name : 'memo'
			}, {
				fieldLabel : 'ID',
				name : 'id',
				hideLabel : true,
				hidden : true
			}, {
				fieldLabel : '审核意见',
				value : '',
				hideLabel : true,
				hidden : true,
				name : 'approve_opinion'
			}, {
				fieldLabel : '审核',
				value : 0,
				name : 'approve',
				hideLabel : true,
				hidden : true
			},{
				fieldLabel : '版本',
				hideLabel : true,
				hidden : true,
				name : 'version'
			} ]
		})
		win = new Ext.Window( {
			title : '工作报表',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id:'save',
				text : '保存',
				handler : function() {
					if (work_report_add) {
						add_work_report(formPanel.getForm(), win);
					} else {
						update_work_report(formPanel.getForm(), win)
					}
				}
			}, {
				text : '取消',
				id:'cancel',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		if(is_approve){
			Ext.getCmp('save').disable();
		}
		win.show();
	}

	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}
	function add_work_report(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [ 'report_type', 'authors',
				'recipient', 'report_content', 'approve_opinion',
				'approve', 'memo' ]);
		Ext.zion.db.getJSON("divisional_work_report.insert", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("增加操作", "数据添加成功");
						win.close();
						grid.store.reload();
						Ext.getCmp('editButton').disable();
						Ext.getCmp('deleteButton').disable();
					} else {
						Ext.Msg.alert("增加操作", "数据添加错误");
					}
				});
	}
	function update_work_report(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [ 'report_type', 'authors',
				'recipient', 'report_content', 'memo', 'id','version' ]);
		Ext.zion.db.getJSON("divisional_work_report.update", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						win.close();
						grid.store.reload();
						Ext.getCmp('editButton').disable();
						Ext.getCmp('deleteButton').disable();
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
				});
	}
	// ----------修改window表单---------
	function updateForm() {
		work_report_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var approve = sm.data.approve;
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			 if(approve == 1 || approve ==2){
				 is_approve = true;
			 } else {
				 is_approve = false;
			 }
			work_report_show();
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
		if (sm.length ==0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		}else {
			var approve = sm_select.data.approve;
			if(approve ==1 || approve ==2){
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
			Ext.zion.db.getJSON("divisional_work_report.delete", params,
					function(data) {
						if (!data.r) {
							Ext.Msg.alert("删除提示", "删除失败");
						} else {
							if (data.r != 0 || data.r != null) {
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