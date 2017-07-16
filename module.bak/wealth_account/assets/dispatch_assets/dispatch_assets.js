Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var is_approve = false;
			var fields = [ 'id', 'assets_number', 'kind_type', 'assets_name',
					'root_value', 'reason', 'dispatch_date', 'from_unit',
					'to_unit', 'from_keeper', 'to_keeper', 'from_duty',
					'to_duty', 'approve', 'version' ];
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wealth_account.assets.dispatch_assets.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "wealth_account.assets.dispatch_assets.select", '所有' ],
					["wealth_account.assets.dispatch_assets.assets_name.select",
							'资产名称' ],
					[ "wealth_account.assets.dispatch_assets.kind_type.select",
							'规格型号' ] ];
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
								if (objv == "wealth_account.assets.dispatch_assets.select") {
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
						title : '资产调拨列表',
						store : store,
						sm : sm,
						columns : [ sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true
						}, {
							header : "资产编号",
							dataIndex : 'assets_number',
							sortable : true
						}, {
							header : "规格类型",
							dataIndex : 'kind_type',
							sortable : true
						}, {
							header : "资产名称",
							dataIndex : 'assets_name',
							sortable : true
						}, {
							header : "原值",
							dataIndex : 'root_value',
							sortable : true
						}, {
							header : "资产调拨原因",
							dataIndex : 'reason',
							sortable : true
						}, {
							header : "调拨日期",
							dataIndex : 'dispatch_date',
							sortable : true
						}, {
							header : " 调出单位",
							dataIndex : 'from_unit',
							sortable : true
						}, {
							header : " 调入单位",
							dataIndex : 'to_unit',
							sortable : true
						}, {
							header : "调出单位保管人",
							dataIndex : 'from_keeper',
							sortable : true
						}, {
							header : "调入单位保管人",
							dataIndex : 'to_keeper',
							sortable : true
						}, {
							header : "调出单位负责人",
							dataIndex : 'from_duty',
							sortable : true
						}, {
							header : "调入单位负责人",
							dataIndex : 'to_duty',
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
										dispatch_assets_add = true;
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
										if(!$('#term').val()){
											Ext.Msg
												.alert(
													"下载报表",
													"<a href='"
															+ Zion.report
																	.getURL('wealth_account.assets.dispatch_assets.select')
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

			// ----------审批资产表单---------
			function win_show() {
				var dispatch_date = new Ext.form.DateField( {
					fieldLabel : '调拨日期',
					name : 'dispatch_date',
					altFormats : 'Y-m-d',
					format : 'Y-m-d',
					editable : false,
					allowBlank : false,
					blankText : '不能为空',
					anchor : '90%'
				})
				formPanel = new Ext.form.FormPanel( {
					autoHeight : true,
					items : [ {
						layout : 'column',
						items : [ {
							columnWidth : .48,
							layout : 'form',
							defaultType : 'textfield',
							defaults : {
								width : 180
							},
							items : [ {
								fieldLabel : '资产编号',
								name : 'assets_number',
								allowBlank : false,
								blankText : '不能为空',
								maxLength : 16,
								anchor : '90%'
							}, {
								fieldLabel : '规格类型',
								name : 'kind_type',
								maxLength : 16,
								allowBlank : false,
								blankText : '不能为空',
								anchor : '90%'
							}, {
								fieldLabel : '资产名称',
								name : 'assets_name',
								maxLength : 32,
								allowBlank : false,
								blankText : '不能为空',
								anchor : '90%'
							}, {
								fieldLabel : '原值',
								name : 'root_value',
								maxLength : 12,
								regex : /^\d+(\.\d+)?$/,
								regexText : '须填写数字',
								anchor : '90%'
							}, {
								fieldLabel : '资产调拨原因',
								name : 'reason',
								maxLength : 512,
								xtype : 'textarea',
								anchor : '90%'
							}, dispatch_date ]
						}, {
							columnWidth : .48,
							layout : 'form',
							labelWidth : 95,
							defaultType : 'textfield',
							defaults : {
								width : 180
							},
							items : [ {
								fieldLabel : '调出单位',
								name : 'from_unit',
								maxLength : 32,
								anchor : '90%'
							}, {
								fieldLabel : '调入单位',
								name : 'to_unit',
								maxLength : 32,
								anchor : '90%'
							}, {
								fieldLabel : '调出单位保管人',
								name : 'from_keeper',
								maxLength : 12,
								anchor : '90%'
							}, {
								fieldLabel : '调入单位保管人',
								name : 'to_keeper',
								maxLength : 12,
								anchor : '90%'
							}, {
								fieldLabel : '调出单位负责人',
								name : 'from_duty',
								maxLength : 12,
								anchor : '90%'
							}, {
								fieldLabel : '调入单位负责人',
								name : 'to_duty',
								maxLength : 12,
								anchor : '90%'
							}, {
								fieldLabel : '序号',
								name : 'id',
								hidden : true,
								hideLabel : true
							}, {
								fieldLabel : '审批',
								name : 'approve',
								hideLabel : true,
								hidden : true,
								value : 0,
								anchor : '90%'
							}, {
								fieldLabel : '版本',
								name : 'version',
								hideLabel : true,
								hidden : true,
								anchor : '90%'
							} ]
						} ]
					} ]
				})
				win = new Ext.Window( {
					title : '资产调拨录入',
					closable : true,
					autoWidth : false,
					width : 640,
					items : [ formPanel ],
					buttons : [
							{
								id : 'save',
								text : '保存',
								handler : function() {
									if (dispatch_assets_add) {
										add_dispatch_assets(
												formPanel.getForm(), win);
									} else {
										update_dispatch_assets(formPanel
												.getForm(), win)
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
			function add_dispatch_assets(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = Ext.zion.form.getParams(formPanel, [
						'assets_number', 'kind_type', 'assets_name',
						'root_value', 'reason', 'dispatch_date', 'from_unit',
						'to_unit', 'from_keeper', 'to_keeper', 'from_duty',
						'to_duty' ]);
				Ext.zion.db.getJSON(
						"wealth_account.assets.dispatch_assets.insert", params,
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
			function update_dispatch_assets(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}

				var params = Ext.zion.form.getParams(formPanel, [
						'assets_number', 'kind_type', 'assets_name',
						'root_value', 'reason', 'dispatch_date', 'from_unit',
						'to_unit', 'from_keeper', 'to_keeper', 'from_duty',
						'to_duty', 'id', 'version' ]);
				Ext.zion.db.getJSON(
						"wealth_account.assets.dispatch_assets.update", params,
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
				dispatch_assets_add = false;
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
							"wealth_account.assets.dispatch_assets.delete",
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