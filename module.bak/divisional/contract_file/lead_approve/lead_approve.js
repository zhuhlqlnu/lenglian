Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var manager_data  = false;
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "leader.relate_company_file.select"
		},
		root : "r",
		fields : [ 'id','file_id','approval_part','approvaler','file_type',
		           'file_title','file_simple','approval_date','approval_memo','approve','memo','be_checker','relate_memo' ]
	});
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
			header : "审核备注",
			dataIndex : 'memo',
			sortable : true
		},{
			header : "审核人",
			dataIndex : 'be_checker',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '公文审批',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '部门公文审批',
			disabled : true,
			handler : updateForm,
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
			},
			scope : this
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据', {
						xtype : 'textfield',
						width : 150,
						id : 'term'
					}, {
						text : '查询',
						tooltip : '查询',
						icon : Ext.zion.image_base+'/select.gif'
					} ]
				})
				//tbar.render(this.tbar);

			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true
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
	
//	==============listeners event===============
	sm.on('rowselect', function() {

		if (grid.getSelectionModel().getCount() == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}

	},this)
	
	sm.on('rowdeselect', function() {

		if (grid.getSelectionModel().getCount() == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}

	})
	
	
	function win_show(){
		formPanel = new Ext.form.FormPanel( {
			labelWidth : 65,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			height:200,
			items : [ {
				layout : 'column',
				items : [ {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [ {
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
						xtype : 'textarea',
						fieldLabel : '内容简述',
						name : 'file_simple',
						disabled:true
					}, {
						fieldLabel : '申请日期',
						name : 'approval_date',
						disabled:true
					}, {
						fieldLabel : '申请备注',
						name : 'approval_memo',
						id : 'approval_memo',
						xtype:'textarea',
						disabled:true
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					defaultType : 'textfield',
					items : [ {
						fieldLabel : '部门意见',
						name : 'memo',
						xtype:'textarea',
						maxLength:512,
						disabled:true
					},{
						xtype : "radiogroup",
						layout : "column",
						fieldLabel : '是否同意',
						isFormField : true,
						anchor : '90%',
						items : [{
							columnWidth : .5,
							checked : true,
							xtype : "radio",
							boxLabel : "不同意",
							name : "approve_lead",
							inputValue : 0
						}, {
							columnWidth : .5,
							xtype : "radio",
							boxLabel : "同意",
							name : "approve_lead",
							inputValue : 1
						}]
					},{
						fieldLabel : '审批意见',
						name : 'memo_lead',
						xtype:'textarea',
						maxLength:512
					},{name:'is_send_lead',
							id : 'is_send_lead',
							value : 0,
							hidden : true,
							hideLabel : true
						}, {
							name : 'id',
							id : 'id',
							hidden : true,
							hideLabel : true
						}]
				}]
			}]
		})

		// ----window表单----
		win = new Ext.Window( {
			title : '公文审批',
			closable : true,
			autoWidth:false,
			autoHeight:false,
			width : 700,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id:'save',
				handler : function(){
					if(manager_data){
//						add_manager_Form(formPanel,win);
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
	    win.show();
	}
	

	//修改操作
	function update_manager_Form(formPanel,win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {

			var params = Ext.zion.form.getParams(formPanel.form,['approve_lead','memo_lead','is_send_lead','id']);
			alert(params);
			Ext.zion.db.getJSON(
				"muchun.relate_company_file.update", params,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据修改成功");
						formPanel.form.reset();
						win.close();
						grid.store.reload();
						Ext.getCmp('editButton').disable();
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