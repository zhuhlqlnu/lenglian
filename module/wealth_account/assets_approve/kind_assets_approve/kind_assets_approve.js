Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var is_approve = false;
			var fields = [ 'id', 'assets_type', 'check_code', 'name',
					'stardard_type', 'car_card', 'produce_date',
					'produce_factory', 'root_value', 'pure_value',
					'user_company', 'part_block', 'user_sign', 'memo',
					'table_date', 'table_maker', 'approve', 'approve_memo',
					'version','amount' ];
			var store = new Ext.zion.db.ArrayStore(
					{
						db : {
							alias : "wealth_account.assets_approve.kind_assets_approve.select"
						},
						root : "r",
						fields : fields
					});
			var select_data = [
					["wealth_account.assets_approve.kind_assets_approve.select",
							'所有' ],
					["wealth_account.assets_approve.kind_assets_approve.stardard_type.select",
							'规格型号' ],
					["wealth_account.assets_approve.kind_assets_approve.name.select",
							'资产名称' ],
					["wealth_account.assets_approve.kind_assets_approve.produce_factory.select",
							'生产厂家' ],
					["wealth_account.assets_approve.kind_assets_approve.user_sign.select",
							'使用人' ],
					["wealth_account.assets_approve.kind_assets_approve.user_company.select",
							'使用单位' ] ];
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
								if (objv == "wealth_account.assets_approve.kind_assets_approve.select") {
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
			})
			sm.on('rowdeselect', function() {
				if (grid.selModel.getSelections().length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
			})

			var grid = new Ext.grid.GridPanel(
					{
						title : '实物资产列表',
						store : store,
						sm : sm,
						columns : [ sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true
						}, {
							header : "资产分类",
							dataIndex : 'assets_type',
							sortable : true
						}, {
							header : "清查编号",
							dataIndex : 'check_code',
							sortable : true
						}, {
							header : "资产名称",
							dataIndex : 'name',
							sortable : true
						}, {
							header : "规格型号",
							dataIndex : 'stardard_type',
							sortable : true
						}, {
							header : "车牌号",
							dataIndex : 'car_card',
							sortable : true
						}, {
							header : "投产时间",
							dataIndex : 'produce_date',
							sortable : true
						}, {
							header : " 生产厂家",
							dataIndex : 'produce_factory',
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
							header : "数量",
							dataIndex : 'amount',
							sortable : true
						}, {
							header : "使用单位",
							dataIndex : 'user_company',
							sortable : true
						}, {
							header : "所属区块",
							dataIndex : 'part_block',
							sortable : true
						}, {
							header : "使用人签名",
							dataIndex : 'user_sign',
							sortable : true
						}, {
							header : "备注",
							dataIndex : 'memo',
							sortable : true
						}, {
							header : "制表日期",
							dataIndex : 'table_date',
							sortable : true
						}, {
							header : "制表人",
							dataIndex : 'table_maker',
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
						}, {
							header : "审核备注",
							dataIndex : 'approve_memo',
							sortable : true
						} ],
						tbar : [
								{
									id : 'editButton',
									text : '审核实物资产',
									disabled : true,
									icon : Ext.zion.image_base + '/update.gif',
									tooltip : '审核实物资产',
									handler : function() {
										updateForm();
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
																	.getURL('wealth_account.assets_approve.kind_assets_approve.select')
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
			reward_system_data = {};
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});

			// ////////////////////////////////////////////////////////////////////////////////////
			// ----------form表单---------
			function win_show() {
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
								fieldLabel : '资产分类',
								name : 'assets_type',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '清查编号',
								name : 'check_code',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '资产名称',
								name : 'name',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '规格型号',
								name : 'stardard_type',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '车牌号',
								name : 'car_card',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '投产时间',
								name : 'produce_date',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '生产厂家',
								name : 'produce_factory',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '原值',
								name : 'root_value',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '净值',
								name : 'pure_value',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '数量',
								name : 'amount',
								disabled : true,
								anchor : '90%'
							} ]
						}, {
							columnWidth : .48,
							layout : 'form',
							defaultType : 'textfield',
							defaults : {
								width : 180
							},
							items : [ {
								fieldLabel : '所属区块',
								name : 'part_block',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '使用单位',
								name : 'user_company',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '使用人签名',
								name : 'user_sign',
								disabled : true,
								anchor : '90%'
							}, {
								fieldLabel : '备注',
								name : 'memo',
								xtype : 'textarea',
								disabled : true,
								anchor : '90%'
							}, {
								xtype : "radiogroup",
								layout : "column",
								fieldLabel : '是否同意',
								isFormField : true,
								allowBlank : false,
								blankText : '请选中一项',
								anchor : '90%',
								items : [ {
									columnWidth : .5,
									checked : true,
									xtype : "radio",
									boxLabel : "同意",
									name : "approve",
									inputValue : 1
								}, {
									columnWidth : .5,
									xtype : "radio",
									boxLabel : "不同意",
									name : "approve",
									inputValue : 0
								} ]
							}, {
								fieldLabel : '审核备注',
								xtype : 'textarea',
								maxLength : 512,
								name : 'approve_memo',
								anchor : '90%'
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
						} ]
					} ]
				})
				win = new Ext.Window( {
					title : '实物资产审核',
					closable : true,
					autoWidth : false,
					width : 640,
					items : [ formPanel ],
					buttons : [
							{
								id : 'save',
								text : '保存',
								handler : function() {
									update_office_cost_approve(formPanel
											.getForm(), win)
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
					formPanel.getForm().findField("approve").disable();
					formPanel.getForm().findField("approve_memo").disable();
				}
				win.show();
			}

			function update_office_cost_approve(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}

				var params = Ext.zion.form.getParams(formPanel,['approve_memo','approve','id','version']);
				Ext.zion.db
						.getJSON(
								"wealth_account.assets_approve.kind_assets_approve.update",
								params, function(data) {
									if (data.r == 1) {
										Ext.Msg.alert("提示", "数据修改成功");
										win.close();
										grid.store.reload();
										Ext.getCmp('editButton').disable();
									} else {
										Ext.Msg.alert("提示", "数据修改错误");
									}
								});
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
			}

			function updateForm() {
				var sm = grid.getSelectionModel().getSelected();
				var sm_num = grid.selModel.getSelections().length;
				if (!sm) {
					Ext.Msg.alert("修改操作", "请选择要修改的项");
				} else if (sm_num > 1) {
					Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
				} else {
					var approve = sm.data.approve;
					if (approve == 1||approve == 0) {
						is_approve = true;
					} else {
						is_approve = false;
					}
					win_show();
					formPanel.form.loadRecord(sm);
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