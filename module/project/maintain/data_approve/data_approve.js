Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 编号
	var dispatch_list = false;
	var fields = [ 'id','deal_order_id','approve','memo','work_type',
			'work_content','company','address_company','contact' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.finish_order.select"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["project.maintain.data.deal_order_passed",'所有'],["xxxxxxx",'派工单号（功能暂不能使用）'],["xxxxxxxx",'工作类型（功能暂不能使用）']];
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
				if(objv=="project.maintain.data.deal_order_passed"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
			var deal_order_id = grid.getSelectionModel().getSelected().get('deal_order_id');
			deal_grid.store.constructor({
				db : {
				alias : 'project.maintain.data_approve.gps_project.search',
				params : [ deal_order_id ]
				},
				root : "r",
				fields : deal_info
			});
			deal_grid.store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			})

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
		title : '完工单',
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "派工单号",
			dataIndex : 'deal_order_id',
			sortable : true,
			renderer : function(value){
				return "WXPD"+value;
			}
		}, {
			header : "单位名称",
			dataIndex : 'company',
			sortable : true
		}, {
			header : "工作性质",
			dataIndex : 'work_type',
			sortable : true
		}, {
			header : "工作内容",
			dataIndex : 'work_content',
			sortable : true
		}, {
			header : "联系人",
			dataIndex : 'contact',
			sortable : true
		}, {
			header : "审批:通过/不通过",
			dataIndex : 'approve',
			sortable : true,
			width : 120,
			renderer:function(approve){
				if(approve ==2){
					return '<img src="'+Ext.zion.image_base+'/cancel.png'+'" alt="未通过"></img>';//"未通过";
				}else if(approve ==1){
					return '<img src="'+Ext.zion.image_base+'/accept.png'+'" alt="通过"></img>';//"通过";
				}else{
					return '<img src="'+Ext.zion.image_base+'/exclamation.png'+'" alt="未审核"></img>';//"未审核";
				}
			}
		}, {
			header : "审核备注",
			dataIndex : 'memo',
			sortable : true
		} ],
		tbar : [{
			id : 'editButton',
			text : '审核完工单',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核完工单',
			handler : function() {
				updateForm();
			},
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				Ext.getCmp('editButton').disable();
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
												.getURL('maintain.dispatch.report')
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

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function dispatch_list_show(data_sm) {
		
		var formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			items : [{
				fieldLabel : '工作性质',
				name : 'work_type',
				readOnly : true
				
			}, {
				fieldLabel : '工作内容',
				name : 'work_content',
				allowBlank : false,
				blankText : '不能为空',
				maxLength:512
			}, {
				fieldLabel : '单位名称',
				name : 'company',
				readOnly : true
			}, {
				fieldLabel : '单位地址',
				name : 'address_company',
				readOnly : true
			}, {
				fieldLabel : '电话',
				name : 'telphone',
				readOnly : true
			}, {
				fieldLabel : '联系人',
				name : 'contact',
				readOnly : true
			}, {
				fieldLabel : '手机',
				name : 'mobile',
				readOnly : true
			}, {
						xtype : 'radiogroup',
						fieldLabel : '审批',
						items : [ {
							boxLabel : '不通过',
							inputValue : 0,
							name : 'approve',
							checked: true
						}, {
							boxLabel : '通过',
							name : 'approve',
							inputValue : 1,
							checked: true
						}]
					}, {
				fieldLabel : '备注',
				maxLength:512,
				xtype:'textarea',
				name : 'memo'
			}, {
				fieldLabel : 'ID',
				name : 'id',
				hideLabel : true,
				hidden : true
			}]
		})
		// ----window表单----
		var win = new Ext.Window( {
			title : '会议记录',
			closable : true,
			closeAction:'close',
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					add_dispatch_list(formPanel.getForm(), win);
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		})
		win.show();
		formPanel.getForm().loadRecord(data_sm);
	}
	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}
	function add_dispatch_list(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [ 'approve', 'memo','id' ]);
		Ext.zion.db.getJSON("project.maintain.finish_order.update", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
	}
	
	// ----------修改window表单---------
	function updateForm() {
		dispatch_list = false;
		var sm = grid.getSelectionModel().getSelected();
		dispatch_list_show(sm);
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
	}


	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	// /////////////////////////////////////////////////////////////////////////////////////////
//	var approve_combo;
//	var customer_data = false;
//	var is_enable =false;
	var deal_info = ['id','pgd_id', 'company', 'work_type', 'number_plates',
					'wagon_id', 'acc_status', 'gps_status', 'gps_date',
					'wagon_status', 'memo','approve','approve_memo'];
	var deal_store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "project.maintain.data_approve.gps_project.search",
			params : [-1]
		},
		root : "r",
		fields : deal_info
	});

	var deal_grid = new Ext.grid.GridPanel( {
		autoHeight : false,
		height : 340,
		autoScroll : true,
		store : deal_store,
		columns : [{
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "派工单号",
			dataIndex : 'pgd_id',
			sortable : true,
			renderer : function(value){
				return "WXPD"+value;
			}
		}, {
			header : "单位名称",
			dataIndex : 'company',
			sortable : true
		}, {
			header : "工作性质",
			dataIndex : 'work_type',
			sortable : true
		}, {
			header : "车牌号码",
			dataIndex : 'number_plates',
			sortable : true
		}, {
			header : "车台ID",
			dataIndex : 'wagon_id',
			sortable : true
		}, {
			header : "ACC状态",
			dataIndex : 'acc_status',
			sortable : true
		}, {
			header : "GPS状态",
			dataIndex : 'gps_status',
			sortable : true
		}, {
			header : "GPS时间",
			dataIndex : 'gps_date',
			sortable : true
		}, {
			header : "车台类型",
			dataIndex : 'wagon_status',
			sortable : true
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}, {
			header : "审批:通过/不通过",
			dataIndex : 'approve',
			sortable : true,
			width : 120,
			renderer:function(approve){
				if(approve ==2){
					return '<img src="'+Ext.zion.image_base+'/cancel.png'+'" alt="未通过"></img>';//"未通过";
				}else if(approve ==1){
					return '<img src="'+Ext.zion.image_base+'/accept.png'+'" alt="通过"></img>';//"通过";
				}else{
					return '<img src="'+Ext.zion.image_base+'/exclamation.png'+'" alt="未审核"></img>';//"未审核";
				}
			}
		}, {
			header : "审核备注",
			dataIndex : 'approve_memo',
			sortable : true
		} ],
		// 第二个toolbar
		bbar : new Ext.PagingToolbar( {
			store : deal_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : false,
			forceFit : false
		}
	});
	deal_store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});

	var customep_data_info = [];
	var customer_data_info_data = {};
	Zion.db.getJSON("customer_data_info.select", null, function(data) {
		customep_data_info = data.r;
		for ( var i = 0; i < data.r.length; i++) {
			var id = data.r[i][0];
			customer_data_info_data[id] = data.r[i];
		}
			deal_store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		})
	deal_grid.addListener('rowdblclick', update_deal_order_approve);
	function update_deal_order_approve(grid, rowIndex, e) {
		update_deal_Form();
	}
	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function deal_order_show() {
		deal_order_form = new Ext.form.FormPanel( {
			items : [ {
				layout : 'column',
				items : [ {
					columnWidth : .48,
					layout : 'form',
					autoHeight : true,
					defaultType : 'textfield',
					defaults : {
						width : 180
					},
					items : [ {
						fieldLabel : '业务性质',
						disabled : true,
						name : 'deal_list_type',
						anchor : '90%'
					}, {
						fieldLabel : '客户名称',
						name : 'deal_customer_name',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '联系方式',
						disabled : true,
						name : 'deal_com_telphone',
						disabled : true,
						emptyText : '根据客户名称选填...',
						anchor : '90%'
					}, {
						fieldLabel : '项目名称',
						name : 'deal_project_name',
						disabled:true,
						anchor : '90%'
					}, {
						fieldLabel : '项目说明',
						name : 'deal_project_caption',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '受理数量',
						name : 'deal_deal_amount',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '受理依据',
						name : 'deal_deal_basis',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '结算方式',
						name : 'deal_count_way',
						disabled:true,
						anchor : '90%'
					},{
						fieldLabel : '资费情况',
						name : 'deal_tariff_condition',
						disabled : true,
						anchor : '90%'
					},{
						fieldLabel : '缴费金额',
						name : 'deal_payment_money',
						disabled : true,
						anchor : '90%'
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					autoHeight : true,
					defaultType : 'textfield',
					defaults : {
						width : 180
					},
					items : [{
						fieldLabel : '缴费说明',
						name : 'deal_payment_caption',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '结算情况',
						name : 'deal_payment_condition',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '工程负责人',
						name : 'deal_project_leader',
						disabled:true,
						anchor : '90%'
					}, {
						fieldLabel : '编号',
						name : 'deal_id',
						hidden : true,
						hideLabel : true
					}, {
						fieldLabel : '备注',
						disabled : true,
						xtype : 'textarea',
						name : 'deal_memo',
						anchor : '90%'
					}, {
						fieldLabel : '审批备注',
						id:'deal_comments',
						xtype : 'textarea',
						disabled:true,
						name : 'deal_comments',
						anchor : '90%'
					}, {
						xtype : 'radiogroup',
						fieldLabel : '是否撤销',
					// id:'deal_enable',
						items : [ {
							boxLabel : '接收',
							inputValue : 0,
							name : 'deal_enable',
							checked: true
						}, {
							boxLabel : '撤销',
							name : 'deal_enable',
							inputValue : 1
						}]
					}]
				} ]
			}]
		})
		// ----window表单----
		var deal_order_win = new Ext.Window( {
			title : '接收信息',
			closable : true,
			autoWidth : false,
			width : 600,
			closeAction : 'close',
			items : [ deal_order_form ],
			buttons : [
					{
						text : '保存',
						handler : function() {
							deal_order_update(deal_order_form.getForm(),
									deal_order_win);
						}
					}, {
						text : '取消',
						handler : function() {
							deal_order_win.close();
						}
					} ]
		})
		if(is_enable){
			Ext.getCmp('approve').disable();
			Ext.getCmp('comments').disable();
		}
		deal_order_win.show();
	}
	

	var gps_msg_Info = new Ext.grid.PropertyGrid( {
//		collapsible : true,
		region : 'south',
		autoHeight : false,
		height : 200,
		autoScroll : true,
		
		selModel : new Ext.grid.RowSelectionModel( {
			singleSelect : true
		}),
		source : {
			'车牌号码' : '',
			'车台ID' : '',
			'车台类型' : '',
			'数据卡号' : '',
			'数据卡状态' : '',
			'ACC状态' : '',
			'GPS状态' : '',
			'检测结果' : ''
		},
		viewConfig : {
			forceFit : true,
			scrollOffset : 2
		},
		listeners : {
			beforeedit : function() {
				return false;
			}
		}
	});

	
	var gridForm = new Ext.form.FormPanel({
        id: 'company-form',
        frame: true,
        labelAlign: 'left',
        autoWidth : true,
        autoHeight : false,
        layout: 'vbox', 
		layoutConfig: {
		    align : 'stretch',
		    pack  : 'start'
		},
        items: [
        	{flex:5,
        		items:{
	            layout: 'fit',
	            items: deal_grid
	            }
	         },
	           {
            	flex:3,	
            	items:{
            		layout : 'fit',
            		items : gps_msg_Info
            	}
            }
        ]
    });



	function getParams(form, feilds) {
		var values = form.getFieldValues();
		var params = [];
		for ( var i = 0; i < feilds.length; i++) {
			params.push(values[feilds[i]]);
		}
		return params;
	}
	// //////////////////////////////////////////////////////////////////////////////////////
	// 表单修改
	// //////////////////////////////////////////////////////////////////////////////////////
	function deal_order_update(deal_order_form, deal_order_win) {
		if (deal_order_form.isValid() == false) {
			return false;
		}
		var params = getParams(deal_order_form,
				[ 'deal_enable', 'deal_id' ]);
		Ext.zion.db.getJSON("project.maintain.dispatch.dispatch_deal_order.update", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("修改提示", "数据修改成功");
				deal_order_win.close();
				deal_grid.store.reload();
				Ext.getCmp('dealEditButton').disable();
			} else {
				Ext.Msg.alert("修改提示", "数据修改失败");
			}
		});
	}
	function update_deal_Form() {
		var deal_sm = deal_grid.getSelectionModel().getSelected();
		var enable = deal_grid.getSelectionModel().getSelected().data.deal_enable;
		deal_order_show();
		deal_order_form.form.loadRecord(deal_sm);
	}
	
	function select_deal_order_form(){
		var type = select_combo.getValue();
		var term = $('#term_deal').val();
		var paramsA;
		if (!Ext.getCmp('term_deal').disabled) {
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
	}
	// grid自适应
	new Ext.Viewport({
		layout:'hbox',
		layoutConfig: {
		    align : 'stretch',
		    pack  : 'start'
		},
		items: [
		    {layout : 'fit',flex:10,items : grid},
		    {layout : 'fit',flex:7,items : gridForm}
		]	
	});
	
})