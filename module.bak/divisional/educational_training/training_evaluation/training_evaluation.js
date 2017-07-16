Ext.onReady(function() {
	Ext.QuickTips.init();
	var training_evaluation = false;
	var fields =[ 'id', 'sequences_id','name', 'assessment_name', 'assessment_date',
					'assessment_type', 'assessment_content', 'theory_scores',
					'actual_score','document_number' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "training_evaluation.select"
		},
		root : "r",
		fields : fields
	});
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
	
	var select_data = [["training_evaluation.select",'所有'],["training_evaluation.query.name",'员工姓名'],["training_evaluation.query.assessment_name",'考核名称'],["training_evaluation.query.document_number",'证件编号']];
	var selelct_store =  new Ext.data.SimpleStore( {
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
			'select' : function (index){
				var objv = this.getValue();
				if(objv=="training_evaluation.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);

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
			header : "员工序号",
			dataIndex : 'sequences_id',
			width : 50,
			sortable : true
		},{
			header : "名字",
			dataIndex : 'name',
			width : 80,
			sortable : true
		}, {
			header : "考核名称",
			width : 100,
			dataIndex : 'assessment_name',
			sortable : true
		}, {
			header : "考核时间",
			width : 50,
			dataIndex : 'assessment_date',
			sortable : true
		}, {
			header : "考核方式",
			width : 70,
			dataIndex : 'assessment_type',
			sortable : true
		}, {
			header : "考核内容",
			dataIndex : 'assessment_content',
			sortable : true
		}, {
			header : "理论分数",
			dataIndex : 'theory_scores',
			sortable : true
		}, {
			header : "实际分数",
			dataIndex : 'actual_score',
			sortable : true
		},{
			header : "证件编号",
			dataIndex : 'document_number',
			sortable : true
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				training_evaluation = true;
				training_evaluation_show();
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
												.getURL('educational_training.training_evaluation')
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
	training_evaluation_data = [];
	Zion.db.getJSON("address_book.select_id_name", null, function(data) {
		training_evaluation_data =data.r;
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	})
	
		//////////////////////////////////////////////////////////////////////////////////////
		// ----------form表单---------
		function training_evaluation_show() {
			var payment_condition_store = new Ext.data.SimpleStore( {
				fields : [ 'sequences_id', 'name' ],
				data:training_evaluation_data
			});
			var reward_system_combo = new Ext.form.ComboBox( {
				fieldLabel : '序号',
				valueField : 'sequences_id',
				store : payment_condition_store,
				hiddenName: 'sequences_id',
				displayField : 'sequences_id',
				mode : 'local',
				editable : false,
				allowBlank : false,
				blankText : '不能为空',
				triggerAction : 'all',
				emptyText : '请选择...',
				listeners : {
					'select' : function(reward_system_combo, record, index) {
						formPanel.getForm().findField("name").setValue(training_evaluation_data[index][1]);
					}
				}
			});
			var training_time = new Ext.form.DateField( {
				fieldLabel : '考核时间',
				name : 'assessment_date',
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				editable : false,
				allowBlank : false,
				blankText : '不能为空'
			})

			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [ reward_system_combo,{
					fieldLabel : '名字',
					name : 'name',
					disabled:true,
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '考核名称',
					name : 'assessment_name',
					maxLength: 24,    
					allowBlank : false,
					blankText : '不能为空'
				},  training_time, {
					fieldLabel : '考核方式',
					maxLength: 12,
					name : 'assessment_type',
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '考核内容',
					name : 'assessment_content',
					xtype: 'textarea',
					maxLength: 512,
					allowBlank : false,
					blankText : '不能为空'
				}, {
					fieldLabel : '理论分数',
					name : 'theory_scores',
					regex :/^\d+(\.\d+)?$/,
					regexText:'输入数字',
					maxLength: 8
				}, {
					fieldLabel : '实际分数',
					name : 'actual_score',
					regex :/^\d+(\.\d+)?$/,
					regexText:'输入数字',
					maxLength: 8
				}, {
					fieldLabel : '证件编号',
					name : 'document_number',
					allowBlank : false,
					maxLength: 18,
					blankText : '不能为空'
				}, {
					fieldLabel : 'ID',
					name : 'id',
					hideLabel : true,
					hidden : true
				} ]
			})
			// ----window表单----
			win = new Ext.Window( {
				title : '培训考核',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					text : '保存',
					handler : function() {
						if (training_evaluation) {
							add_training_evaluation(formPanel.getForm(), win);
						} else {
							update_staff_reminded(formPanel.getForm(), win)
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
		function add_training_evaluation(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params = getParams(formPanel, [ 'sequences_id',
					'assessment_name', 'assessment_date', 'assessment_type',
					'assessment_content', 'theory_scores', 'actual_score','name','document_number' ]);
			alert(params);
			Ext.zion.db.getJSON("training_evaluation.insert", params, function(
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
		function update_staff_reminded(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params = getParams(formPanel,
					[ 'sequences_id', 'assessment_name', 'assessment_date',
							'assessment_type', 'assessment_content',
							'theory_scores', 'actual_score','name','document_number','id' ]);
			Ext.zion.db.getJSON("training_evaluation.update", params, function(
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
			training_evaluation = false;
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if (!sm) {
				Ext.Msg.alert("修改操作", "请选择要修改的项");
			} else if (sm_num > 1) {
				Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
			} else {
				training_evaluation_show();
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
				Ext.zion.db.getJSON("training_evaluation.delete", [ id.pop() ],
						function(data) {
							if (data.r == 1) {
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
