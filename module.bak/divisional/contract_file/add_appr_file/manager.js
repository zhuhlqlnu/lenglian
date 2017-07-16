Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var manager_data = false;
	var is_approve = false;
	var fields = [ 'id', 'file_id', 'approval_part', 'approvaler', 'file_type',
			'file_title', 'file_simple', 'approval_date', 'appraval_reason',
			'approval_memo', 'approve', 'version' ]
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "muchun.axiom_contract_approval.select"
		},
		root : "r",
		fields : fields
	});

	var select_data = [ [ "muchun.contract_approval.select", '所有' ],
			[ "muchun.contract_approval.query.file_id.select", '公文编号' ],
			[ "muchun.contract_approval.query.file_title.select", '公文题目' ] ];
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
			'select' : function(index) {
				var objv = this.getValue();
				if (objv == "muchun.contract_approval.select") {
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				} else {
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
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	var id = [];

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "公文编号",
			dataIndex : 'file_id',
			sortable : true
		}, {
			header : "申请部门",
			dataIndex : 'approval_part',
			sortable : true
		}, {
			header : "申请人",
			dataIndex : 'approvaler',
			sortable : true
		}, {
			header : "公文类型",
			dataIndex : 'file_type',
			sortable : true
		}, {
			header : "公文题目",
			dataIndex : 'file_title',
			maxLength : 16,
			sortable : true
		}, {
			header : "内容简述",
			dataIndex : 'file_simple',
			maxLength : 64,
			sortable : true
		}, {
			header : "申请时间",
			dataIndex : 'approval_date',
			sortable : true
		}, {
			header : "申请备注",
			dataIndex : 'approval_memo',
			maxLength : 512,
			sortable : true
		}, {
			header : "申请状态",
			dataIndex : 'approve',
			sortable : true,
			renderer : function(approve) {
				if (approve == 0) {
					return "审核未通过";
				} else if (approve == 1) {
					return "审核通过";
				} else {
					return "未审核";
				}
			}
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '增加数据',
			handler : function() {
				is_approve = false;
				manager_data = true;
				win_show();
			},
			scope : this
		}, '-', {
			id : 'editButton',
			text : '修改',
			disabled : true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : updateForm,
			scope : this
		}, '-', {
			text : '删除',
			id : 'deleteButton',
			disabled : true,
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
				disableButton();

			},
			scope : this
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据', select_combo, {
						xtype : 'textfield',
						width : 150,
						name : 'term',
						id : 'term',
						disabled : true
					}, {
						text : '查询',
						tooltip : '查询',
						handler : function() {
							selectForm();
						},
						icon : Ext.zion.image_base+'/select.gif'
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

	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	grid.addListener('rowdblclick', update_manager_data);
	function update_manager_data(grid, rowIndex, e) {
		manager_data = false;
		updateForm();

	}
	function win_show() {
		var data = [ [ '请示', '请示' ], [ '合同', '合同' ], [ '致函', '致函' ],
				[ '广告', '广告' ], [ '其他', '其他' ] ];
		var file_type_store = new Ext.data.SimpleStore( {
			fields : [ 'file_type', 'text' ],
			data : data
		});
		var file_type_combo = new Ext.form.ComboBox( {
			fieldLabel : '公文类型',
			valueField : 'file_type',
			id : 'file_type',
			store : file_type_store,
			displayField : 'text',
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});

		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			autoScroll : true,
			items : [ {
				name : 'id',
				id : 'id',
				hidden : true,
				hideLabel : true
			}, {
				fieldLabel : '编号',
				name : 'file_id',
				allowBlank : false,
				maxLength : 32,
				blankText : '不能为空'
			}, {
				fieldLabel : '申请部门',
				name : 'approval_part',
				allowBlank : false,
				maxLength : 32,
				blankText : '不能为空'
			}, {
				fieldLabel : '申请人',
				name : 'approvaler',
				maxLength : 8,
				allowBlank : false,
				blankText : '不能为空'
			}, file_type_combo, {
				fieldLabel : '公文标题',
				name : 'file_title',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '文件上传',
				name : 'file_path',
				id : 'file_path',
				inputType : 'file',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				xtype : 'textarea',
				fieldLabel : '内容简述',
				name : 'file_simple',
				id : 'file_simple',
				allowBlank : false,
				blankText : '不能为空'
			}, {
				xtype : 'datefield',
				fieldLabel : '申请日期',
				name : 'approval_date',
				id : 'approval_date',
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				editable : false,
				allowBlank : false,
				blankText : '不能为空'
			}
//			, {
//				fieldLabel : '申请理由',
//				name : 'appraval_reason',
//				id : 'appraval_reason',
//				allowBlank : false,
//				blankText : '不能为空'
//			}
			, {
				fieldLabel : '申请备注',
				name : 'approval_memo',
				id : 'approval_memo',
				xtype : 'textarea'
			}, {
				hidden : true,
				name : 'approve',
				value : 0
			}, {
				fieldLabel : '版本',
				hideLabel : true,
				hidden : true,
				name : 'version'
			} ]
		})

		// ----window表单----
		win = new Ext.Window( {
			title : '公文申请',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id : 'save',
				handler : function() {
					if (manager_data) {
						add_manager_Form(formPanel, win);
					} else {
						update_manager_Form(formPanel, win);
					}
				}
			}, {
				text : '取消',
				id : 'cancle',
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

	//修改操作
	function update_manager_Form(formPanel, win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			var params = getParams(formPanel, [ 'approval_part', 'approvaler',
					'file_type', 'file_title', 'file_simple', 'approval_date',
					 'approval_memo', 'approve', 'id',
					'version' ]);
			Ext.zion.db.getJSON("muchun.axiom_contract_approval.update",
					params, function(data) {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "修改成功");
//							formPanel.form.reset();
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据修改错误");
						}
					});
		}
	}
	function add_manager_Form(formPanel, win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
//	===============上传文件路径==========

			if(formPanel.form.findField('file_path').getValue().length>0){
				formPanel.getForm().enctype = 'multipart/form-data';
				var filePath = formPanel.form.findField('file_path').getValue();
				var fileType = filePath.substring(filePath.indexOf('.'),filePath.length);
				var url = 'http://www.mapprsoft.com:8005/upload/992a0d224ad046fb9d61251154bbb7ab/patrol.photo';
				var params = filePath;
				formPanel.getForm().submit({
					fileUpload : true,
					params : params,
					url : url,
					waitMsg : 'waitMsg......',
					success : function(form,action){
						Ext.Msg.alert('',action.result.msg);
						alert("VVVVVVVVVVVv");
						return null;
					},
					failure : function(form,action){
						Ext.Msg.alert('',action.result.msg);
						alert("FFFFFFFFFFf");
						return null;
					}
				})
			
			}
//	===============上传文件测试==========

			var params = Ext.zion.form.getParams(formPanel.form, [ 'file_id', 'approval_part',
					'approvaler', 'file_type', 'file_title', 'file_simple',
					'approval_date', 'approval_memo' ]);
//			alert("Params:"+params);
			Ext.zion.db.getJSON("muchun.axiom_contract_approval.insert",
					params, function(data) {
						if (!data.f ) {
							Ext.Msg.alert("提示", "数据添加成功");
//							formPanel.form.reset();
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
		}
	}
	// ----------修改window表单---------
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var approve = sm.data.approve;
		var sm_num = grid.selModel.getSelections().length;
		if (sm_num != 1) {
			Ext.Msg.alert("修改操作", "请选择一条要修改的项");
		} else {
			if (approve == 1 || approve == 0) {
				is_approve = true;
			} else {
				is_approve = false;
			}
			win_show();
			formPanel.form.loadRecord(sm);
		}
	}

	//查询
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
		disableButton();
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
				Ext.Msg.alert("删除操作", "不能删除审批后的公文");
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
			Ext.zion.db.getJSON("muchun.axiom_contract_approval.delete",
					params, function(data) {
						if (!data.r) {
							Ext.Msg.alert("删除提示", "数据删除失败");
						} else {
							if (data.r != 0 || data.r != null) {
								Ext.Msg.alert("删除提示", "数据删除成功");
								disableButton();
							} else {
								Ext.Msg.alert("删除提示", "数据删除失败");
							}
							deleNext();
						}
					});
		} else {
			grid.store.reload();
		}
	}

	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		
	}
	function getParams(form, feilds) {
		var values = form.form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
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