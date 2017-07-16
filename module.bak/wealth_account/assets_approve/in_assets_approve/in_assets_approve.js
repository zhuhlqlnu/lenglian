Ext.onReady(function() {
	Ext.QuickTips.init();
	var is_approve=false;
	var fields = ['id', 'category', 'code', 'name', 'model', 'order_self',
	  			'single_count', 'root_value', 'memo', 'apply_date', 'table_maker',
				'approve','login_name','login_name','approve_memo', 
				'version','belong_part','pure_value','use_date','use_year'];
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wealth_account.assets_approve.in_assets_approve.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "wealth_account.assets_approve.in_assets_approve.select", '所有' ],
					[ "wealth_account.assets_approve.in_assets_approve.model.select", '规格型号' ],
					[ "wealth_account.assets_approve.in_assets_approve.category.select", '资产种类' ] ];
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
			'select' : function (index){
				var objv = this.getValue();
				if(objv=="wealth_account.assets_approve.in_assets_approve.select"){
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
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	})
	
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		autoScroll : true,
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
			header : "投产日期",
			dataIndex : 'use_date',
			sortable : true
		}, {
			header : "折旧年限",
			dataIndex : 'use_year',
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
		},  {
			header : "审核人",
			dataIndex : 'login_name',
			sortable : true
		},  {
			header : "审核备注",
			dataIndex : 'approve_memo',
			sortable : true
		}],
		tbar : [{
			id : 'editButton',
			text : '审核帐内资产',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核帐内资产',
			handler : function() {
				updateForm();
			},
			scope : this
		},'-',{
			text : '导出报表',
			icon : Ext.zion.image_base+'/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				if(!$('#term').val()){
					Ext.Msg
						.alert(
							"下载报表",
							"<a href='"
									+ Zion.report
											.getURL('wealth_account.assets_approve.in_assets_approve.select')
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
	reward_system_data = {};
	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});

	//////////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	function win_show(sm) {
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
					fieldLabel : '所属单位',
					name : 'belong_part'
				},{
				fieldLabel : '资产种类',
				name : 'category'
			}, {
				fieldLabel : '资产编码',
				name : 'code'
			}, {
				fieldLabel : '资产名称',
				name : 'name'
			}, {
				fieldLabel : '规格型号',
				name : 'model'
			},{
				fieldLabel : '投产日期',
				name : 'use_date'
			},{
				fieldLabel : '折旧年限',
				name : 'use_year'
			}, {
				fieldLabel : '自编号',
				name : 'order_self'
			}, {
				fieldLabel : '单台数量',
				name : 'single_count'
			}, {
				fieldLabel : '原值',
				name : 'root_value'
			},  {
				fieldLabel : '净值',
				name : 'pure_value'
			}, {
				fieldLabel : '备注',
				name : 'memo',
				xtype : 'textarea'
			}, {
				xtype : "radiogroup",
				layout : "column",
				fieldLabel : '是否同意',
				isFormField : true,
				allowBlank : false,
				blankText : "必须有选项选中",
				id : 'approve_id',
				anchor : '90%',
				items : [{
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
				}]
			}, {
				fieldLabel : '审核备注',
				xtype:'textarea',
				maxLength:512,
				id : 'approve_memo_id',
				name : 'approve_memo'
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
			}]
		})

		win = new Ext.Window( {
			title : '其他费用录入审核',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id : 'save_id',
				text : '保存',
				handler : function() {
					update_office_cost_approve(formPanel, win)
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
		Ext.zion.form.disable(formPanel,['belong_part','category', 'code', 'name', 'model','use_date','use_year', 'order_self',
		                           	  			'single_count', 'root_value','pure_value', 'memo']);
		if (is_approve) {
			Ext.getCmp('save_id').disable();
			Ext.getCmp('approve_id').disable();
			Ext.getCmp("approve_memo_id").disable();
//			formPanel.getForm().findField("approve").disable();
		}
		alert("after approve!!");
		win.show();
	}
	
	function update_office_cost_approve(formPanel, win) {
		if (formPanel.form.isValid() == false) {
			return false;
		}
//		var approve_memo = formPanel.findField("approve_memo").getValue();
//		var approve = formPanel.findField("approve").getGroupValue();
//		var id= formPanel.findField("id").getValue();
//		var version = formPanel.findField("version").getValue();
//		var params=[approve_memo,approve,id,version];
		var params = Ext.zion.form.getParams(formPanel.form,["approve_memo","approve","id","version"]);
		Ext.zion.db.getJSON("wealth_account.assets_approve.in_assets_approve.update", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据修改成功");
				win.close();
				grid.store.reload();
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
			if( approve ==1||approve ==0){
				 is_approve = true;
			 } else {
				 is_approve = false;
			 }
			win_show(sm);
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