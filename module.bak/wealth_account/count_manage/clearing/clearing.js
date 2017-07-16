Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var is_approve = false;
			var fields = [ 'id', 'settlement_type', 'project_name', 'month',
					'settlement_amount', 'settlement_conditions',
					'settlement_leader', 'memo', 'approve','version', 'tax_count', 'pay_unit' ];
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wealth_account.count_manage.clearing.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "wealth_account.count_manage.clearing.select", '所有' ],
					[ "wealth_account.count_manage.clearing.settlement_type.select",
							'结算类型' ],
					[ "wealth_account.count_manage.clearing.project_name.select",
							'项目名称' ],
					[ "wealth_account.count_manage.clearing.settlement_conditions.select",
							'结算情况' ]];
			var selelct_store = new Ext.data.SimpleStore( {
				fields : [ 'type', 'name' ],
				data : select_data
			});
			var select_combo = new Ext.form.ComboBox(
					{
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
								if (objv == "wealth_account.count_manage.clearing.select") {
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
						store : store,
						sm : sm,
						columns : [ sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true
						}, {
							header : "结算类型",
							dataIndex : 'settlement_type',
							sortable : true
						}, {
							header : "项目名称",
							dataIndex : 'project_name',
							sortable : true
						}, {
							header : "付款单位",
							dataIndex : 'pay_unit',
							sortable : true
						}, {
							header : "月份",
							dataIndex : 'month',
							sortable : true
						}, {
							header : "税额（元）",
							dataIndex : 'tax_count',
							sortable : true
						}, {
							header : "结算金额（元）",
							dataIndex : 'settlement_amount',
							sortable : true
						}, {
							header : "结算情况",
							dataIndex : 'settlement_conditions',
							sortable : true
						}, {
							header : " 结算负责人",
							dataIndex : 'settlement_leader',
							sortable : true
						}, {
							header : " 备注",
							dataIndex : 'memo',
							sortable : true
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
										check_assets_add = true;
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
										Ext.getCmp('editButton').disable();
										Ext.getCmp('deleteButton').disable();
									},
									scope : this
								},
								'-',
								{
									text : '导出报表',
									icon : Ext.zion.image_base + '/report_link.png',
									tooltip : '导出报表',
									handler : function() {
										if (!$('#term').val()) {
											Ext.Msg
													.alert(
															"下载报表",
															"<a href='"
																	+ Zion.report
																			.getURL('wealth_account.count_manage.clearing.select')
																	+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
										} else {
											Ext.Msg
													.alert(
															"下载报表",
															"<a href='"
																	+ Zion.report
																			.getURL(
																					select_combo
																							.getValue(),
																					$(
																							'#term')
																							.val())
																	+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
										}
									},
									scope : this
								} ],
						// 第二个toolbar
						listeners : {
							'render' : function() {
								var tbar = new Ext.Toolbar(
										{
											items : [
													'请根据',
													select_combo,
													{
														xtype : 'textfield',
														width : 150,
														name : 'term',
														id : 'term',
														disabled : true
													},
													{
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

			function win_show() {
				var settlement_type_data = [ [ '普票结算', '普票结算' ],
						[ '增值税结算', '增值税结算' ], [ '托收结算', '托收结算' ] ];
				var settlement_type_store = new Ext.data.SimpleStore( {
					fields : [ 'settlement_type', 'name' ],
					data : settlement_type_data
				});
				var settlement_type_combo = new Ext.form.ComboBox( {
					fieldLabel : '结算类型',
					allowBlank : false,
					blankText : '不能为空',
					hiddenName : 'settlement_type',
					valueField : 'settlement_type',
					store : settlement_type_store,
					displayField : 'name',
					mode : 'local',
					editable : false,
					triggerAction : 'all'
				});
				var settlement_conditions_data = [ [ '未结算', '未结算' ],
						[ '已结算', '已结算' ] ];
				var settlement_conditions_store = new Ext.data.SimpleStore( {
					fields : [ 'settlement_conditions', 'name' ],
					data : settlement_conditions_data
				});
				var settlement_conditions_combo = new Ext.form.ComboBox({
					fieldLabel : '结算情况',
					allowBlank : false,
					blankText : '不能为空',
					hiddenName : 'settlement_conditions',
					valueField : 'settlement_conditions',
					store : settlement_conditions_store,
					displayField : 'name',
					mode : 'local',
					editable : false,
					triggerAction : 'all'
				});
				formPanel = new Ext.form.FormPanel( {
					defaultType : 'textfield',
					items : [ settlement_type_combo, {
						fieldLabel : '项目名称',
						name : 'project_name',
						maxLength : 12,
						allowBlank : false,
						blankText : '不能为空'
					}, {
						fieldLabel : '付款单位',
						name : 'pay_unit',
						maxLength : 12,
						allowBlank : false,
						blankText : '不能为空'
					}, {
						fieldLabel : '月份',
					 	regex : /^\d{4}-?(?:0[1-9]|1[0-2])$/,
						regexText : '日期格式不正确',
						allowBlank : false,
						maxLength : 16,
						blankText : '不能为空',
						emptyText:'月份格式：xxxx-xx',
						name : 'month'
					}, {
						fieldLabel : '税额',
						regex : /^\d+(\.\d+)?$/,
						regexText : '大于等于0的数',
						maxLength : 8,
						name : 'tax_count'
					}, {
						fieldLabel : '结算金额',
						regex : /^\d+(\.\d+)?$/,
						regexText : '大于等于0的数',
						maxLength : 8,
						name : 'settlement_amount'
					}, settlement_conditions_combo, {
						fieldLabel : '结算负责人',
						maxLength : 8,
						allowBlank : false,
						blankText : '不能为空',
						name : 'settlement_leader'
					}, {
						fieldLabel : '备注',
						maxLength : 512,
						xtype : 'textarea',
						name : 'memo'
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
					} ]
				})
				win = new Ext.Window( {
					title : '结算管理',
					closable : true,
					items : [ formPanel ],
					buttons : [ {
						id : 'save',
						text : '保存',
						handler : function() {
							if (check_assets_add) {
								add_clearing(formPanel.getForm(), win);
							} else {
								update_clearing(formPanel.getForm(), win)
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
			function add_clearing(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = Ext.zion.form.getParams(formPanel, [
						'settlement_type', 'project_name', 'month',
						'settlement_amount', 'settlement_conditions',
						'settlement_leader', 'memo','tax_count','pay_unit' ]);
			
				Ext.zion.db.getJSON(
						"wealth_account.count_manage.clearing.insert", params,
						function(data) {
							if (data.r && (!data.f)) {
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
			function update_clearing(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}

				var params = Ext.zion.form.getParams(formPanel, [ 'settlement_type', 'project_name', 'month',
				                          						'settlement_amount', 'settlement_conditions',
				                        						'settlement_leader', 'memo','tax_count','pay_unit', 'id', 'version' ]);
				Ext.zion.db.getJSON(
						"wealth_account.count_manage.clearing.update", params,
						function(data) {
							if (data.r == 1) {
								win.close();
								grid.store.reload();
								Ext.Msg.alert("修改操作", "数据修改成功");
								Ext.getCmp('editButton').disable();
								Ext.getCmp('deleteButton').disable();
							} else {
								Ext.Msg.alert("修改操作", "数据修改错误");
							}
						})
			}
			// ----------修改window表单---------
			function updateForm() {
				check_assets_add = false;
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
					Ext.zion.db.getJSON(
							"wealth_account.count_manage.clearing.delete",
							params, function(data) {
								if (!data.r) {
									Ext.Msg.alert("删除提示", "删除失败");
								} else {
									if (data.r != 0 || (!data.f)) {
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