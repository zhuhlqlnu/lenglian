Ext.onReady(function() {
	Ext.QuickTips.init();
	var is_approve=false;
	var fields = ['id', 'settlement_type', 'project_name', 'month',
					'settlement_amount', 'settlement_conditions',
					'settlement_leader', 'memo','table_maker','table_date',
					'approve','login_name','approve_memo','version', 'tax_count', 'pay_unit'];
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wealth_account.count_manage.clearing_approve.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "wealth_account.count_manage.clearing_approve.select", '所有' ],
					[ "wealth_account.count_manage.clearing_approve.settlement_type.select",
							'结算类型' ],
					[ "wealth_account.count_manage.clearing_approve.project_name.select",
							'项目名称' ],
					[ "wealth_account.count_manage.clearing_approve.settlement_conditions.select",
							'结算情况' ]];
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
				if(objv=="wealth_account.count_manage.clearing_approve.select"){
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
			header : " 制表人",
			dataIndex : 'table_maker',
			sortable : true
		}, {
			header : " 制表日期",
			dataIndex : 'table_date',
			sortable : true
		},{
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
			header : "审核人",
			dataIndex : 'login_name',
			sortable : true
		}, {
			header : "审核备注",
			dataIndex : 'approve_memo',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '审核资产盘盈',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核资产盘盈',
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
											.getURL('wealth_account.count_manage.clearing_approve.select')
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
	function win_show() {
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '结算类型',
				name : 'settlement_type'
			}, {
				fieldLabel : '项目名称',
				name : 'project_name'
			}, {
				fieldLabel : '付款单位',
				name : 'pay_unit'
			}, {
				fieldLabel : '月份',
				name : 'month'
			}, {
				fieldLabel : '税额',
				name : 'tax_count'
			},{
				fieldLabel : '结算金额',
				name : 'settlement_amount'
			}, {
				fieldLabel : '结算情况',
				name : 'settlement_conditions'
			}, {
				fieldLabel : '结算负责人',
				name : 'settlement_leader'
			}, {
				fieldLabel : '备注',
				xtype : 'textarea',
				name : 'memo'
			}, {
				xtype : "panel",
				layout : "column",
				fieldLabel : '是否同意',
				isFormField : true,
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
				hidden : true
			} ]
		})
		win = new Ext.Window( {
			title : '结算管理审核',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id : 'save',
				text : '保存',
				handler : function() {
					update_check_assets(formPanel.getForm(), win)
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
		Ext.zion.form.disable(formPanel,['settlement_type', 'project_name','pay_unit', 'month',
		             					'tax_count','settlement_amount', 'settlement_conditions',
		            					'settlement_leader', 'memo']);
		if (is_approve) {
			Ext.getCmp('save').disable();
			formPanel.getForm().findField("approve").disable();
			formPanel.getForm().findField("approve_memo").disable();
		}
		win.show();
	}
	
	function update_check_assets(formPanel, win) {
		
		if (formPanel.isValid() == false) {
			return false;
		}
		var approve_memo = formPanel.findField("approve_memo").getValue();
		var approve = formPanel.findField("approve").getGroupValue();
		var id= formPanel.findField("id").getValue();
		var version = formPanel.findField("version").getValue();
		var params=[approve_memo,approve,id,version];
		Ext.zion.db.getJSON("wealth_account.count_manage.clearing_approve.update", params, function(
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
			if( approve ==1){
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