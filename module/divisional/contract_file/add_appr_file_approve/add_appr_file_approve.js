Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var manager_data  = false;
	var is_approve =false;
	var fields = [ 'id','file_id','approval_part','approvaler','file_type',
		           'file_title','file_simple','approval_date','appraval_reason','approval_memo',
		           'approve','memo','version','is_relate' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "muchun.contract_approval.select"
		},
		root : "r",
		fields : fields
	});
	var select_data = [["muchun.contract_approval.select",'所有'],["muchun.contract_approval.query.file_id.select",'公文编号'],["muchun.contract_approval.query.file_title.select",'公文题目']];
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
				if(objv=="muchun.contract_approval.select"){
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
	var id = []; 
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "公文编号",
			dataIndex : 'file_id',
			sortable : true
		}, {
			header : "申请部门",
			dataIndex : 'approval_part',
			sortable : true
		}, {
			header : "申请人",
			dataIndex : 'approvaler',
			sortable : true
		}, {
			header : "公文类型",
			dataIndex : 'file_type',
			sortable : true
		}, {
			header : "公文题目",
			dataIndex : 'file_title',
			maxLength:16,
			sortable : true
		}, {
			header : "内容简述",
			dataIndex : 'file_simple',
			maxLength:64,
			sortable : true
		}, {
			header : "申请时间",
			dataIndex : 'approval_date',
			sortable : true
		}, {
			header : "申请理由",
			maxLength:128,
			dataIndex : 'appraval_reason',
			sortable : true
		}, {
			header : "申请备注",
			dataIndex : 'approval_memo',
			maxLength:512,
			sortable : true
		}, {
			header : "申请状态",
			dataIndex : 'approve',
			sortable : true,
			renderer : function(approve) {
				if (approve == 0) {
					return "未审核";
				} else if (approve == 1) {
					return "审核通过";
				} else {
					return "审核未通过";
				}
			}
		},{
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '审核公文',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核公文',
			handler : updateForm,
			scope : this
		},'-',{
			text : '导出报表',
			icon : Ext.zion.image_base+'/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				Ext.Msg.alert("下载报表","<a href='"+ Zion.report.getURL('contract_file.add_appr_file_approve.report')+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
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
						handler:function(){
							selectForm();
						},
						icon : Ext.zion.image_base+'/select.gif'
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
	grid.addListener('rowdblclick', update_manager_data);
	function update_manager_data(grid, rowIndex, e) {
		manager_data = false;
		updateForm();
	}
	function win_show(){
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			autoScroll : true,
			items : [ {
				name : 'id',
				id : 'id',
				hidden : true
			}, {
				fieldLabel : '编号',
				name : 'file_id',
				disabled:true
			}, {
				fieldLabel : '申请部门',
				name : 'approval_part',
				disabled:true
			}, {
				fieldLabel : '申请人',
				name : 'approvaler',
				disabled:true
			}, {
				fieldLabel : '公文类型',
				name : 'file_type',
				disabled:true
			},{
				fieldLabel : '公文标题',
				name : 'file_title',
				disabled:true
			}, {
				fieldLabel : '内容简述',
				name : 'file_simple',
				disabled:true
			}, {
				xtype : 'datefield',
				fieldLabel : '申请日期',
				name : 'approval_date',
				id : 'approval_date',
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				editable : false,
				disabled:true
			}, {
				fieldLabel : '申请理由',
				name : 'appraval_reason',
				id : 'appraval_reason',
				disabled:true
			}, {
				fieldLabel : '申请备注',
				name : 'approval_memo',
				id : 'approval_memo',
				xtype:'textarea',
				disabled:true
			},{
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
				name : 'memo',
				xtype:'textarea',
				maxLength:512
			},{
				xtype : "panel",
				layout : "column",
				fieldLabel : '是否同意审阅',
				isFormField : true,
				anchor : '90%',
				items : [{
					columnWidth : .5,
					checked : true,
					xtype : "radio",
					boxLabel : "否",
					name : "is_relate",
					inputValue : 0
				}, {
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "是",
					name : "is_relate",
					inputValue : 1
				}]
			},{
				fieldLabel : '版本',
				hideLabel : true,
				hidden : true,
				name : 'version'
			} ]
		})

		// ----window表单----
		win = new Ext.Window( {
			title : '公文审核',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id:'save',
				handler : function(){
					if(manager_data){
						add_manager_Form(formPanel,win);
					}else{
						update_manager_Form(formPanel,win);
					}
				}
			}, {
				id:'cancle',
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
			formPanel.getForm().findField("is_late").disable();
		}
	    win.show();
	}
	// 查询
	function selectForm(){
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

	// 修改操作
	function update_manager_Form(formPanel,win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data.id;
			var approve = formPanel.getForm().findField("approve").getGroupValue();
			var memo = formPanel.getForm().findField("memo").getValue();
			var version = formPanel.getForm().findField("version").getValue();
			var is_relate = formPanel.getForm().findField("is_relate").getGroupValue();
			var params=[approve,memo,is_relate,id,version];
			Ext.zion.db.getJSON(
				"muchun.contract_approval.update", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						formPanel.form.reset();
						win.close();
						grid.store.reload();
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
			});
		}
	} 
	// ----------修改window表单---------
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (sm_num != 1) {
			Ext.Msg.alert("修改操作", "请选择一条要修改的项");
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