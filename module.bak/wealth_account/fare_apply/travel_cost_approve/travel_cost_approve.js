Ext.onReady(function() {
	Ext.QuickTips.init();
	var report_type_combo;
	var is_approve=false;
	var fields = ['id', 'depart_name', 'applier', 'reason',
					'start_day', 'return_day', 'start_add', 'return_add',
				    'total','approve','version','memo'];
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "fare_apply.travel_cost_approve.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [
					[ "fare_apply.travel_cost_approve.select", '所有' ],
					[ "fare_apply.travel_cost_approve.applier.select", '申报人' ],
					[ "fare_apply.travel_cost_approve.reason.select", '出差理由' ] ];
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
				if(objv=="fare_apply.travel_cost_approve.select"){
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
			width : 50,
			sortable : true
		}, {
			header : "部门名称",
			dataIndex : 'depart_name',
			width : 100,
			sortable : true
		}, {
			header : "申报人",
			width : 100,
			dataIndex : 'applier',
			sortable : true
		}, {
			header : "出差理由",
			width : 100,
			dataIndex : 'reason',
			sortable : true
		}, {
			header : "出发日",
			width : 100,
			dataIndex : 'start_day',
			sortable : true
		}, {
			header : "返回日",
			width : 100,
			dataIndex : 'return_day',
			sortable : true
		}, {
			header : "出发地",
			dataIndex : 'start_add',
			sortable : true
		}, {
			header : "返回地",
			dataIndex : 'return_add',
			sortable : true
		}, {
			header : "合计费用（元）",
			dataIndex : 'total',
			sortable : true
		}, {
			header : "审核状态",
			dataIndex : 'approve',
			sortable : true,
			renderer:function(approve){
				if(approve==0){
					return "审核未通过";
				}else if(approve==1){
					return "审核通过";
				}else{
					return "等待审核";
				}
			}
		}, {
			header : "审核意见",
			dataIndex : 'memo',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '审核差旅费',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核差旅费',
			handler : function() {
				updateForm();
			},
			scope : this
		},'-',{
			text : '导出报表',
			icon : Ext.zion.image_base+'/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				Ext.Msg
						.alert(
								"下载报表",
								"<a href='"
										+ Zion.report
												.getURL('fare_apply.travel_cost_approve.report')
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			}],
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
		function work_report_show() {
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [  {
					fieldLabel : '部门名称',
					name : 'depart_name',
					disabled: true
				}, {
					fieldLabel : '申报人',
					name : 'applier',
					disabled: true
				}, {
					fieldLabel : '出差理由',
					name : 'reason',
					disabled: true
				}, {
					fieldLabel : '出发日',
					name : 'start_day',
					disabled: true
				}, {
					fieldLabel : '返回日',
					name : 'return_day',
					disabled: true
				}, {
					fieldLabel : '出发地',
					name : 'start_add',
					disabled: true
				}, {
					fieldLabel : '返回地',
					name : 'return_add',
					disabled: true
				}, {
					fieldLabel : '合计',
					name : 'total',
					disabled: true
				}, {
					xtype : "panel",
					layout : "column",
					fieldLabel : '是否同意',
					isFormField : true,
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
					fieldLabel : '审核意见',
					name : 'memo',
					xtype:'textarea',
					maxLength:1024
				},{
					fieldLabel : '版本',
					hideLabel : true,
					hidden : true,
					name : 'version'
				}, {
					fieldLabel : 'ID',
					name : 'id',
					hidden : true,
					hideLabel : true,
					anchor : '90%'
				} ]
			})
			win = new Ext.Window( {
				title : '差旅费审核',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					id:'save',
					text : '保存',
					handler : function() {
						update_travel_cost_approve(formPanel.getForm(), win)
					}
				}, {
					text : '取消',
					handler : function() {
						formPanel.form.reset();
						win.close();
					}
				} ]
			})
			if(is_approve){
				Ext.getCmp('save').disable();
				formPanel.getForm().findField("approve").disable();
				formPanel.getForm().findField("memo").disable();
			}
			win.show();
		}
		
		function update_travel_cost_approve(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var memo = formPanel.findField("memo").getValue();
			var approve = formPanel.findField("approve").getGroupValue();
			var id= formPanel.findField("id").getValue();
			var version = formPanel.findField("version").getValue();
			var params=[memo,approve,id,version];
			Ext.zion.db.getJSON("fare_apply.travel_cost_approve.update", params, function(
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
		// ----------修改window表单---------
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
				work_report_show();
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