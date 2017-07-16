Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 20;
	var report_type_combo;
	var is_approve=false;
	var fields = [ 'id', 'report_type', 'authors', 'recipient',
					'report_content','approve_opinion', 'approve', 'memo','version' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "work_report_approve.select"
		},
		root : "r",
		fields : fields
	});
	var select_data = [["work_report_approve.select",'所有'],["work_report_approve.query.report_type.select",'工作表类型']];
	var selelct_store =  new Ext.data.SimpleStore( {
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
				if(objv=="work_report_approve.select"){
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
			header : "编号",
			dataIndex : 'id',
			width : 50,
			sortable : true
		}, {
			header : "工作表类型",
			dataIndex : 'report_type',
			width : 100,
			sortable : true
		}, {
			header : "起草人",
			width : 100,
			dataIndex : 'authors',
			sortable : true
		}, {
			header : "接受人",
			width : 100,
			dataIndex : 'recipient',
			sortable : true
		}, {
			header : "报表内容",
			width : 350,
			dataIndex : 'report_content',
			sortable : true
		}, {
			header : "备注",
			dataIndex : 'memo',
			width : 350,
			sortable : true
		},  {
			header : "审核意见",
			width : 350,
			dataIndex : 'approve_opinion',
			sortable : true
		},  {
			header : "审核",
			width : 100,
			dataIndex : 'approve',
			sortable : true,
			renderer:function(approve){
				if(approve ==2){
					return "审核未通过";
				}else if(approve ==1){
					return "审核通过";
				}else{
					return "未审核";
				}
			}
		}],
		tbar : [{
			id : 'editButton',
			text : '审核工作报表',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核工作报表',
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
												.getURL('personnel.work_report_approve.report')
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
			pageSize : limit,
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
			limit : limit
		}
	});
	//////////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
		function work_report_show() {
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [  {
					fieldLabel : '工作表类型',
					name : 'report_type',
					disabled: true
				}, {
					fieldLabel : '起草人',
					name : 'authors',
					disabled: true
				}, {
					fieldLabel : '接受人',
					name : 'recipient',
					disabled: true
				}, {
					fieldLabel : '报表内容',
					xtype : 'textarea',
					name : 'report_content',
					disabled: true
				}, {
					fieldLabel : 'ID',
					name : 'id',
					hideLabel : true,
					hidden : true
				}, {
					fieldLabel : '备注',
					xtype : 'textarea',
					name : 'memo',
					disabled: true
				} , {
					xtype : "panel",
					layout : "column",
					fieldLabel : '是否同意',
					isFormField : true,
					anchor : '90%',
					items : [{
						columnWidth : .5,
						checked : true,
						xtype : "radio",
						boxLabel : "不同意",
						name : "approve",
						inputValue : 2
					}, {
						columnWidth : .5,
						xtype : "radio",
						boxLabel : "同意",
						name : "approve",
						inputValue : 1
					}]
				}, {
					fieldLabel : '审核意见',
					name : 'approve_opinion',
					xtype:'textarea',
					maxLength:512,
					allowBlank : false,
					blankText : '不能为空'
				},{
					fieldLabel : '版本',
					hideLabel : true,
					hidden : true,
					name : 'version'
				} ]
			})
			win = new Ext.Window( {
				title : '工作报表审核',
				closable : true,
				items : [ formPanel ],
				buttons : [ {
					id:'save',
					text : '保存',
					handler : function() {
						update_work_report(formPanel.getForm(), win)
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
				formPanel.getForm().findField("approve_opinion").disable();
			}
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
		function update_work_report(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var approve_opinion = formPanel.findField("approve_opinion").getValue();
			var approve = formPanel.findField("approve").getGroupValue();
			var id= formPanel.findField("id").getValue();
			var version = formPanel.findField("version").getValue();
			var params=[approve_opinion,approve,id,version];
			Ext.zion.db.getJSON("work_report_approve.update", params, function(
					data) {
				if (data.r == 1) {
					Ext.Msg.alert("提示", "修改成功");
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