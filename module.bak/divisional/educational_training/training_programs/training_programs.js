Ext.onReady(function() {
	Ext.QuickTips.init();
	var training_programs_add = false;
	var fields = [ 'id', 'name', 'train_type', 'train_content', 'train_time',
					'memo' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "training_programs.select"
		},
		root : "r",
		fields : fields
	});
	// 查询列表
		var select_data = [ [ "training_programs.select", '所有' ],
				[ "training_programs.query.name", '计划培训人' ] ];
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
					if (objv == "training_programs.select") {
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
		var grid = new Ext.grid.GridPanel( {
			store : store,
			sm : sm,
			autoScroll : true,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'id',
				width : 50,
				sortable : true
			}, {
				header : "计划培训人",
				dataIndex : 'name',
				width : 100,
				sortable : true
			}, {
				header : "培训类型",
				width : 100,
				dataIndex : 'train_type',
				sortable : true
			}, {
				header : "培训内容",
				width : 100,
				dataIndex : 'train_content',
				sortable : true
			}, {
				header : "计划培训时间",
				width : 100,
				dataIndex : 'train_time',
				sortable : true
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
					training_programs_add = true;
					training_programs_show();
				},
				scope : this
			}, '-', {
				id : 'editButton',
				disabled : true,
				text : '修改',
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				handler : function() {
					updateForm();
				},
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
													.getURL('educational_training.training_programs')
											+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			} ],
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
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		// ----------form表单---------
		function training_programs_show() {
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [ {
					fieldLabel : '计划培训人',
					name : 'name',
					allowBlank : false,
					blankText : '不能为空',
					maxLength : 16
				}, {
					fieldLabel : '培训类型',
					allowBlank : false,
					blankText : '不能为空',
					name : 'train_type',
					maxLength : 16
				}, {
					fieldLabel : '培训内容',
					allowBlank : false,
					blankText : '不能为空',
					maxLength : 50,
					name : 'train_content'
				}, {
					fieldLabel : '计划培训时间',
					maxLength : 16,
					name : 'train_time'
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
				} ]
			})
			win = new Ext.Window( {
				title : '培训计划',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					text : '保存',
					handler : function() {
						if (training_programs_add) {
							add_training_programs(formPanel.getForm(), win);
						} else {
							update_training_programs(formPanel.getForm(), win)
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
		function add_training_programs(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params = getParams(formPanel, [ 'name', 'train_type',
					'train_content', 'train_time', 'memo' ]);
			alert(params);
			Ext.zion.db.getJSON("training_programs.insert", params, function(
					data) {
				if (data.r == 1) {
					Ext.Msg.alert("提示", "添加成功");
					win.close();
					grid.store.reload();
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});
		}
		function update_training_programs(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params = getParams(formPanel, [ 'name', 'train_type',
					'train_content', 'train_time', 'memo', 'id' ]);
			Ext.zion.db.getJSON("training_programs.update", params, function(
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
			training_programs_add = false;
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if (!sm) {
				Ext.Msg.alert("修改操作", "请选择要修改的项");
			} else if (sm_num > 1) {
				Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
			} else {
				training_programs_show();
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
				var params = [ id.pop() ];
				Ext.zion.db.getJSON("training_programs.delete", params,
						function(data) {
							if (!data.r) {
								Ext.Msg.alert("提示", "删除失败");
							} else {
								if (data.r != 0 || data.r != null) {
									Ext.Msg.alert("提示", "删除成功");
									Ext.getCmp('editButton').disable();
									Ext.getCmp('deleteButton').disable();
								} else {
									Ext.Msg.alert("提示", "删除失败");
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