Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var staff_add = false;
			fields = [ 'id', 'company', 'name', 'nationality', 'duty',
					'duty_name', 'hours_sum', 'overtime', 'weekday',
					'holidays', 'night_before_overtime',
					'night_after_overtime', 'downtime', 'annual_vacation',
					'sick_leave', 'home_leave', 'memo' ]
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "staff_attendance.select"
				},
				root : "r",
				fields : fields
			});
			var sm = new Ext.grid.CheckboxSelectionModel();

			var select_data = [ [ "staff_attendance.select", '所有' ],
					[ "staff_attendance.query.company", '单位' ],
					[ "staff_attendance.query.name", '员工姓名' ],
					[ "staff_attendance.query.duty", '岗位（职务）' ] ];
			var selelct_store = new Ext.data.SimpleStore( {
				fields : [ 'type', 'name' ],
				data : select_data
			});
			var select_combo = new Ext.form.ComboBox( {
				fieldLabel : '工作表类型',
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
						if (objv == "staff_attendance.select") {
							Ext.getCmp('term').setValue('');
							Ext.getCmp('term').disable();
						} else {
							Ext.getCmp('term').enable();
						}
					}
				}
			});
			select_combo.setValue(select_data[0][0]);

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
			var grid = new Ext.grid.GridPanel(
					{
						store : store,
						sm : sm,
						autoScroll : true,
						columns : [ sm, {
							header : "编号",
							dataIndex : 'id',
							width : 50,
							sortable : true
						}, {
							header : "单位",
							dataIndex : 'company',
							width : 100,
							sortable : true
						}, {
							header : "姓名",
							width : 70,
							dataIndex : 'name',
							sortable : true
						}, {
							header : "民族",
							width : 70,
							dataIndex : 'nationality',
							sortable : true
						}, {
							header : "岗位（职务）",
							width : 80,
							dataIndex : 'duty',
							sortable : true
						}, {
							header : "执行工作时间制度名称",
							width : 130,
							dataIndex : 'duty_name',
							sortable : true
						}, {
							header : "工时总计",
							width : 80,
							dataIndex : 'hours_sum',
							sortable : true
						}, {
							header : "工作日加点",
							width : 80,
							dataIndex : 'overtime',
							sortable : true
						}, {
							header : "休息日",
							width : 80,
							dataIndex : 'weekday',
							sortable : true
						}, {
							header : "法定休假日",
							width : 80,
							dataIndex : 'holidays',
							sortable : true
						}, {
							header : "夜班前夜班",
							width : 80,
							dataIndex : 'night_before_overtime',
							sortable : true
						}, {
							header : "夜班后夜班",
							width : 80,
							dataIndex : 'night_after_overtime',
							sortable : true
						}, {
							header : "停工工时",
							width : 80,
							dataIndex : 'downtime',
							sortable : true
						}, {
							header : "年休假",
							width : 80,
							dataIndex : 'annual_vacation',
							sortable : true
						}, {
							header : "病假",
							width : 80,
							dataIndex : 'sick_leave',
							sortable : true
						}, {
							header : "探亲假",
							width : 80,
							dataIndex : 'home_leave',
							sortable : true
						}, {
							header : "备注",
							dataIndex : 'memo',
							sortable : true
						} ],
						tbar : [
								{
									id : 'addButton',
									text : '新增',
									icon : Ext.zion.image_base+'/add.gif',
									tooltip : '添加新纪录',
									handler : function() {
										staff_add = true;
										staff_attendance_show();
									},
									scope : this
								},
								'-',// '-'给工具栏按钮之间添加'|'
								{
									id : 'editButton',
									disabled : true,
									text : '修改',
									icon : Ext.zion.image_base+'/update.gif',
									tooltip : '修改记录',
									handler : function() {
										updateForm();
									},
									scope : this
								},
								'-',
								{
									id : 'deleteButton',
									disabled : true,
									text : '删除',
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
								},'-',
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
																		.getURL('personnel.staff_attendance')
																+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
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
						})
					});
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});

			// ///////////////////////////////////////////////////////////////////////////////////
			// ----------form表单---------
			// 单位类型
			function staff_attendance_show() {
				var staff_attendance_store = new Ext.data.SimpleStore( {
					root : 'r',
					fields : [ {
						name : 'id'
					}, {
						name : 'name'
					} ],
					proxy : new Ext.data.ScriptTagProxy( {
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/address_book.select_id_name'
					})
				});
				var staff_attendance_combo = new Ext.form.ComboBox( {
					fieldLabel : '员工姓名',
					valueField : 'name',
					store : staff_attendance_store,
					hiddenName : 'name',
					displayField : 'name',
					editable : false,
					allowBlank : false,
					blankText : '不能为空',
					triggerAction : 'all',
					anchor : '93%',
					emptyText : '请选择...'
				});

				formPanel = new Ext.form.FormPanel( {
					labelWidth : 80,
					frame : true,
					bodyStyle : 'padding:5px 5px 0',
					height : 200,
					items : [ {
						layout : 'column',
						items : [ {
							columnWidth : .48,
							layout : 'form',
							autoHeight : true,
							defaultType : 'textfield',
							items : [ {
								fieldLabel : '单位',
								name : 'company',
								allowBlank : false,
								blankText : '不能为空',
								maxLength : 32,
								anchor : '93%'
							}, staff_attendance_combo, {
								fieldLabel : '民族',
								maxLength : 32,
								name : 'nationality',
								anchor : '93%'
							}, {
								fieldLabel : '职务',
								allowBlank : false,
								maxLength : 32,
								blankText : '不能为空',
								name : 'duty',
								anchor : '93%'
							}, {
								fieldLabel : '工作时间名称',
								maxLength : 32,
								name : 'duty_name',
								allowBlank : false,
								blankText : '不能为空',
								anchor : '93%'
							}, {
								fieldLabel : '工时总计',
								name : 'hours_sum',
								maxLength : 4,
								regex :/^\d+(\.\d+)?$/,
								regexText:'输入数字',
								anchor : '93%'
							}, {
								fieldLabel : '工作日加点',
								name : 'overtime',
								maxLength : 4,
								regex :/^\d+(\.\d+)?$/,
								regexText:'输入数字',
								anchor : '93%'
							}, {
								fieldLabel : '休息日',
								name : 'weekday',
								regex :/^\d+(\.\d+)?$/,
								regexText:'输入数字',
								maxLength : 4,
								anchor : '93%'
							} ]
						}, {
							columnWidth : .48,
							layout : 'form',
							autoHeight : true,
							defaultType : 'textfield',
							items : [ {
								fieldLabel : '法定休假日',
								name : 'holidays',
								regex :/^\d+(\.\d+)?$/,
								regexText:'输入数字',
								maxLength : 4,
								anchor : '93%'
							}, {
								fieldLabel : '夜班前夜班',
								name : 'night_before_overtime',
								maxLength : 4,
								anchor : '93%'
							}, {
								fieldLabel : '夜班后夜班',
								name : 'night_after_overtime',
								maxLength : 4,
								anchor : '93%'
							}, {
								fieldLabel : '停工工时',
								regex :/^\d+(\.\d+)?$/,
								regexText:'输入数字',
								maxLength : 4,
								name : 'downtime',
								anchor : '93%'
							}, {
								fieldLabel : '年休假',
								name : 'annual_vacation',
								maxLength : 4,
								anchor : '93%'
							}, {
								fieldLabel : '病假',
								name : 'sick_leave',
								maxLength : 4,
								anchor : '93%'
							}, {
								fieldLabel : '探亲假',
								maxLength : 4,
								name : 'home_leave',
								anchor : '93%'
							}, {
								fieldLabel : 'ID',
								name : 'id',
								hideLabel : true,
								hidden : true,
								anchor : '93%'
							} ]
						} ]
					}, {
						layout : 'form',
						items : [ {
							fieldLabel : '备注',
							xtype : 'textarea',
							name : 'memo',
							anchor : '46%'
						} ]
					} ]
				})
				// ----window表单----
				win = new Ext.Window( {
					title : '员工考勤',
					closable : true,
					constrainHeader : true,
					autoWidth : false,
					autoHeight : false,
					width : 650,
					height : 370,
					items : [ formPanel ],
					buttons : [
							{
								text : '保存',
								handler : function() {
									if (staff_add) {
										add_staff_attendance(formPanel
												.getForm(), win);
									} else {
										update_staff_attemdance(formPanel
												.getForm(), win)
									}
								}
							}, {
								text : '取消',
								handler : function() {
									formPanel.form.reset();
									win.close();
								}
							} ]
				})
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
			function add_staff_attendance(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = getParams(formPanel, [ 'company', 'name',
						'nationality', 'duty', 'duty_name', 'hours_sum',
						'overtime', 'weekday', 'holidays',
						'night_before_overtime', 'night_after_overtime',
						'downtime', 'annual_vacation', 'sick_leave',
						'home_leave', 'memo' ]);
				Ext.zion.db.getJSON("staff_attendance.insert", params,
						function(data) {
							if (data.r == 1) {
								Ext.Msg.alert("提示", "数据添加成功");
								win.close();
								grid.store.reload();
								Ext.getCmp('editButton').disable();
								Ext.getCmp('deleteButton').disable();
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});
			}
			function update_staff_attemdance(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = getParams(formPanel, [ 'company', 'name',
						'nationality', 'duty', 'duty_name', 'hours_sum',
						'overtime', 'weekday', 'holidays',
						'night_before_overtime', 'night_after_overtime',
						'downtime', 'annual_vacation', 'sick_leave',
						'home_leave', 'memo', 'id' ]);
				Ext.zion.db.getJSON("staff_attendance.update", params,
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
				staff_add = false;
				var sm = grid.getSelectionModel().getSelected();
				var sm_num = grid.selModel.getSelections().length;
				if (!sm) {
					Ext.Msg.alert("修改操作", "请选择要修改的项");
				} else if (sm_num > 1) {
					Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
				} else {
					staff_attendance_show();
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
				if (sm.length == 0) {
					Ext.Msg.alert("删除操作", "请选择要删除的项");
				} else {
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
					Ext.zion.db.getJSON("staff_attendance.delete",
							[ id.pop() ], function(data) {
								if (data.r != 0) {
									Ext.Msg.alert("提示", "删除成功");
									Ext.getCmp('editButton').disable();
									Ext.getCmp('deleteButton').disable();
								} else {
									Ext.Msg.alert("提示", "删除失败");
								}
								deleNext();
							});
				} else {
					grid.store.reload();
					// alert("to do refresh data");
				}
			}
			grid.addListener('rowdblclick', updateGridRowClick);
			function updateGridRowClick(grid, rowIndex, e) {
				updateForm();
			}
			// grid自适应
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