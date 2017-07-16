Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var reward_system_add = false;
			var fields = [ 'id', 'name', 'incentive_time', 'incentive_company',
					'incentive_content', 'memo' ]
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "reward_system.select"
				},
				root : "r",
				fields : fields
			});

			var select_data = [ [ "reward_system.select", '所有' ],
					[ "reward_system.query.name", '员工姓名' ] ];
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
						if (objv == "reward_system.select") {
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
							header : "员工姓名",
							dataIndex : 'name',
							width : 100,
							sortable : true
						}, {
							header : "奖惩时间",
							width : 100,
							dataIndex : 'incentive_time',
							sortable : true
						}, {
							header : "奖惩部门",
							width : 100,
							dataIndex : 'incentive_company',
							sortable : true
						}, {
							header : "奖惩内容",
							width : 100,
							dataIndex : 'incentive_content',
							sortable : true
						}, {
							header : "备注",
							dataIndex : 'memo',
							width : 700,
							sortable : true
						} ],
						tbar : [
								{
									id : 'addButton',
									text : '新增',
									icon : Ext.zion.image_base+'/add.gif',
									tooltip : '添加纪录',
									handler : function() {
										reward_system_add = true;
										staff_attendance_show();
									},
									scope : this
								},
								'-',
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
																		.getURL('personnel.reward_system')
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

			// ----------form表单---------
			function staff_attendance_show() {
				var reward_system_store = new Ext.data.SimpleStore( {
					root : 'r',
					fields : [ {
						name : 'address_book_id'
					}, {
						name : 'name'
					} ],
					proxy : new Ext.data.ScriptTagProxy( {
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/address_book.select_id_name'
					})
				});
				var reward_system_combo = new Ext.form.ComboBox( {
					fieldLabel : '员工姓名',
					valueField : 'name',
					store : reward_system_store,
					hiddenName : 'name',
					displayField : 'name',
					editable : false,
					allowBlank : false,
					blankText : '不能为空',
					triggerAction : 'all',
					emptyText : '请选择...'
				});

				var incentive_time = new Ext.form.DateField( {
					fieldLabel : '奖惩日期',
					name : 'incentive_time',
					altFormats : 'Y-m-d',
					format : 'Y-m-d',
					editable : false,
					allowBlank : false,
					blankText : '不能为空',
					maxValue : new Date
				})
				formPanel = new Ext.form.FormPanel( {
					defaultType : 'textfield',
					items : [ reward_system_combo, incentive_time, {
						fieldLabel : '奖惩部门',
						name : 'incentive_company',
						allowBlank : false,
						blankText : '不能为空',
						maxLength : 32
					}, {
						fieldLabel : '奖惩内容',
						allowBlank : false,
						blankText : '不能为空',
						name : 'incentive_content',
						maxLength : 54
					}, {
						fieldLabel : '备注',
						xtype : 'textarea',
						name : 'memo',
						maxLength : 512
					}, {
						fieldLabel : 'ID',
						name : 'id',
						hideLabel : true,
						hidden : true
					} ]
				})
				win = new Ext.Window( {
					title : '奖惩记录',
					closable : true,
					items : [ formPanel ],
					buttons : [ {
						text : '保存',
						handler : function() {
							if (reward_system_add) {
								add_reward_system(formPanel.getForm(), win);
							} else {
								update_reward_system(formPanel.getForm(), win)
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
			function add_reward_system(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = getParams(formPanel, [ 'name', 'incentive_time',
						'incentive_company', 'incentive_content', 'memo' ]);
				alert(params);
				Ext.zion.db.getJSON("reward_system.insert", params, function(
						data) {
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
			function update_reward_system(formPanel, win) {
				if (formPanel.isValid() == false) {
					return false;
				}
				var params = getParams(formPanel,
						[ 'name', 'incentive_time', 'incentive_company',
								'incentive_content', 'memo', 'id' ]);
				Ext.zion.db.getJSON("reward_system.update", params, function(
						data) {
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
				reward_system_add = false;
				var sm = grid.getSelectionModel().getSelected();
				staff_attendance_show();
				formPanel.form.loadRecord(sm);

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
			var deleNext = function() {
				if (id.length > 0) {
					var params = [ id.pop() ];
					Ext.zion.db.getJSON("reward_system.delete", params,
							function(data) {
								if (!data.r) {
									Ext.Msg.alert("提示", "数据删除失败");
								} else {
									if (data.r != 0 || data.r != null) {
										Ext.Msg.alert("提示", "数据删除成功");
										Ext.getCmp('editButton').disable();
										Ext.getCmp('deleteButton').disable();
									} else {
										Ext.Msg.alert("提示", "数据删除失败");
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