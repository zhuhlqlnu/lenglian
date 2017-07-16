Ext.onReady(function() {
	Ext.QuickTips.init();
	var is_approve = false;
	var fields = [ 'id', 'category', 'code', 'name', 'model', 'order_self',
			'single_count', 'root_value', 'memo', 'apply_date', 'table_maker',
			'approve', 'version','belong_part','pure_value','use_date','use_year' ]; 
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "wealth_account.assets.in_assets.select"
		},
		root : "r",
		fields : fields
	});
	var select_data = [ [ "wealth_account.assets.in_assets.select", '所有' ],
			[ "wealth_account.assets.in_assets.model.select", '规格型号' ],
			[ "wealth_account.assets.in_assets.category.select", '资产种类' ] ];
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
				if (objv == "wealth_account.assets.in_assets.select") {
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
	var id = []; // 编号
		var grid = new Ext.grid.GridPanel(
				{
					title : '帐内资产列表',
					store : store,
					sm : sm,
					columns : [ sm, {
						header : "序号",
						dataIndex : 'id',
						sortable : true
					}, {
						header : "所属单位",
						dataIndex : 'belong_part',
						sortable : true
					}, {
						header : "资产种类",
						dataIndex : 'category',
						sortable : true
					}, {
						header : "资产编码",
						dataIndex : 'code',
						sortable : true
					}, {
						header : "资产名称",
						dataIndex : 'name',
						sortable : true
					}, {
						header : "规格型号",
						dataIndex : 'model',
						sortable : true
					}, {
						header : "投产日期",
						dataIndex : 'use_date',
						sortable : true
					},{
						header : "折旧年限",
						dataIndex : 'use_year',
						sortable : true
					}, {
						header : "自编号",
						dataIndex : 'order_self',
						sortable : true
					}, {
						header : "单台数量",
						dataIndex : 'single_count',
						sortable : true
					}, {
						header : "原值",
						dataIndex : 'root_value',
						sortable : true
					}, {
						header : "净值",
						dataIndex : 'pure_value',
						sortable : true
					}, {
						header : "备注",
						dataIndex : 'memo',
						sortable : true
					}, {
						header : "日期",
						dataIndex : 'apply_date',
						sortable : true,
						renderer : Ext.util.Format.dateRenderer('Y-m-d')
					}, {
						header : "审核状态",
						width : 100,
						dataIndex : 'approve',
						sortable : true,
						renderer : function(approve) {
							if (approve == 0) {
								return "审核未通过";
							} else if (approve == 1) {
								return "审核通过";
							} else {
								return "等待审核";
							}
						}
					} ],
					tbar : [
							{
								id : 'addButton',
								text : '新增',
								icon : Ext.zion.image_base + '/add.gif',
								tooltip : '添加纪录',
								handler : function() {
									is_approve = false;
									in_assets_add = true;
									win_show();
								},
								scope : this
							},
							'-',
							{
								id : 'editButton',
								text : '修改',
								disabled : true,
								icon : Ext.zion.image_base + '/update.gif',
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
								icon : Ext.zion.image_base + '/delete.gif',
								tooltip : '删除记录',
								handler : deleteForm,
								scope : this
							},
							'-',
							{
								text : '刷新',
								icon : Ext.zion.image_base + '/refresh.gif',
								tooltip : '刷新纪录',
								handler : function() {
									grid.store.reload();
									disableButton();
								},
								scope : this
							},
							'-',
							{
								text : '导出报表',
								icon : Ext.zion.image_base + '/report_link.png',
								tooltip : '导出报表',
								handler : function() {
									if(!$('#term').val()){
										Ext.Msg
											.alert(
												"下载报表",
												"<a href='"
														+ Zion.report
																.getURL('wealth_account.assets.in_assets.select')
														+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
									}else{
										Ext.Msg
												.alert(
														"下载报表",
														"<a href='"
																+ Zion.report
																		.getURL(select_combo.getValue(), $('#term').val())
																+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
									}
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
									icon : Ext.zion.image_base + '/select.gif',
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

		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});

		// ----------审批资产表单---------
		function win_show() {
			var dateF = new Ext.form.DateField({
					format:'Y-m-d',
					fieldLabel : '投产日期',
					name : 'use_date',
					editable : false,
					allowBlank : false
			});
			
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [ {
					fieldLabel : '所属单位',
					name : 'belong_part',
					maxLength : 16,
					allowBlank : true,
					blankText : '填写单位'
				}, {
					fieldLabel : '资产种类',
					name : 'category',
					maxLength : 16,
					allowBlank : false,
					blankText : '不能为空',
					regex : /^[0-9]*$/,
					regexText : '须填写数字'
				}, {
					fieldLabel : '资产编码',
					maxLength : 10,
					blankText : '不能为空',
					regex : /^[0-9]*$/,
					regexText : '须填写数字',
					name : 'code'
				}, {
					fieldLabel : '资产名称',
					name : 'name',
					maxLength : 12,
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '规格型号',
					name : 'model',
					maxLength : 16,
					allowBlank : false,
					blankText : '不能为空'
				}, dateF , {
					fieldLabel : '折旧年限',
					name : 'use_year',
					maxLength : 12
				}, {
					fieldLabel : '自编号',
					name : 'order_self',
					maxLength : 12
				}, {
					fieldLabel : '单台数量',
					name : 'single_count',
					maxLength : 10,
					regex : /^\+?[1-9][0-9]*$/,
					regexText : '大于等于0的整数',
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '原值',
					name : 'root_value',
					maxLength : 12,
					regex : /^\d+(\.\d+)?$/,
					regexText : '须填写数字'
				}, {
					fieldLabel : '净值',
					name : 'pure_value',
					maxLength : 12,
					regex : /^\d+(\.\d+)?$/,
					regexText : '须填写数字'
				}, {
					fieldLabel : '备注',
					name : 'memo',
					xtype : 'textarea',
					mixLength : 512
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
					hidden : true
				} ]
			})
			win = new Ext.Window( {
				title : '帐内资产',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					id : 'save',
					text : '保存',
					handler : function() {
						if (in_assets_add) {
							add_in_assets(formPanel.getForm(), win);
						} else {
							update_in_assets(formPanel.getForm(), win)
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
		function add_in_assets(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params = Ext.zion.form.getParams(formPanel, [ 'category',
					'code', 'name', 'model', 'order_self', 'single_count',
					'root_value', 'memo','belong_part','pure_value','use_date','use_year' ]);
			Ext.zion.db.getJSON("wealth_account.assets.in_assets.insert",
					params, function(data) {
						if (data.r && (!data.f)) {
							Ext.Msg.alert("增加操作", "数据添加成功");
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("增加操作", "数据添加错误");
						}
					})
		}
		function update_in_assets(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}

			var params = Ext.zion.form.getParams(formPanel, [ 'category',
					'code', 'name', 'model', 'order_self', 'single_count',
					'root_value', 'memo', 'id', 'version' ]);
			Ext.zion.db.getJSON("wealth_account.assets.in_assets.update",
					params, function(data) {
						if (data.r == 1) {
							win.close();
							grid.store.reload();
							Ext.Msg.alert("提示", "数据修改成功");
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据修改错误");
						}
					})
		}
		// ----------修改window表单---------
		function updateForm() {
			in_assets_add = false;
			var sm = grid.getSelectionModel().getSelected();
			var approve = sm.data.approve;
			var sm_num = grid.selModel.getSelections().length;
			if (!sm) {
				Ext.Msg.alert("修改操作", "请选择要修改的项");
			} else if (sm_num > 1) {
				Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
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
				if (approve == 1 || approve == 0) {
					Ext.Msg.alert("删除操作", "不能删除审批后的报表");
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
				Ext.zion.db.getJSON("wealth_account.assets.in_assets.delete",
						params, function(data) {
							if (!data.r) {
								Ext.Msg.alert("删除提示", "删除失败");
							} else {
								if (data.r != 0 || (!data.f)) {
									Ext.Msg.alert("删除提示", "删除成功");
									disableButton();
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
		
		function disableButton(){
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		
		}

		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ {
				region : 'center',
				layout : 'fit',
				items : [ grid ]
			} ]
		});
	})