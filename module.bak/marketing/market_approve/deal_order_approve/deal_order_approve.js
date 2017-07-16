Ext.onReady(function() {
	
	Ext.QuickTips.init();
	var approve_combo;
	var customer_data = false;
	var is_approve =false;
	var customer_data = false;
	var sql_array = [];
	var params_search ;
	var fields;
	fields = [ 'id', 'list_type', 'customer_name', 'com_telphone',
				'project_name', 'project_caption', 'deal_amount', 'deal_basis',
				'count_way', 'tariff_condition', 'payment_money',
				'payment_caption', 'payment_condition', 'project_leader',
				'memo', 'approve', 'comments', 'version' ];
	sql_array.push("marketing.approve.deal_order_approve");
	sql_array.push('marketing.approve.deal_order_approve_cust');
	sql_array.push('marketing.approve.deal_order_approve_proj');
	sql_array.push('marketing.approve.deal_order_approve_leader');
		var query_data = [[sql_array[0],'全部'],[sql_array[1],'客户姓名'],[sql_array[2],'项目名称'],[sql_array[3],'项目负责人']];
		var query_store = new Ext.data.SimpleStore({
					fields : ['sql_str', 'sql_name'],
					data : query_data
				});
		var select_combo = new Ext.form.ComboBox({
					hiddenName : 'sql_str',
					valueField : 'sql_str',
					store : query_store,
					displayField : 'sql_name',
					emptyText : '--列表条件--',
					mode : 'local',
					editable : false,
					triggerAction : 'all'
				});
		select_combo.setValue(sql_array[0]);
		select_combo.on('select',function(combo,record,index){
			if(combo.getValue()==sql_array[0]){
				Ext.getCmp('term').disable();
				Ext.getCmp('term').setValue('');
			}else{
				Ext.getCmp('term').enable();
			}
		
		},this);
//====================查询导出=============		
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : sql_array[0]
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
		columns : [
				sm,
				{
					header : "序号",
					dataIndex : 'id',
					sortable : true
				},
				{
					header : "业务性质",
					dataIndex : 'list_type',
					sortable : true,
					renderer : function(list_type) {
						if (list_type == 1) {
							return "自费";
						} else if (list_type == 2) {
							return "公费";
						} else if (list_type == 3) {
							return "代理";
						} else {
							return "";
						}
					}
				},
				{
					header : "客户名称",
					dataIndex : 'customer_name',
					sortable : true
//					,
//					renderer : function(customer_name) {
//						return customer_data_info_data[customer_name][2] + "("
//								+ customer_data_info_data[customer_name][1]
//								+ ")";
//					}
				}, {
					header : "联系电话",
					dataIndex : 'com_telphone',
					sortable : true
				}, {
					header : "项目名称",
					dataIndex : 'project_name',
					sortable : true
				}, {
					header : "项目说明",
					dataIndex : 'project_caption',
					sortable : true
				}, {
					header : "受理数量",
					dataIndex : 'deal_amount',
					sortable : true
				}, {
					header : "受理依据",
					dataIndex : 'deal_basis',
					sortable : true
				}, {
					header : "结算方式",
					dataIndex : 'count_way',
					sortable : true
				}, {
					header : "资费情况",
					dataIndex : 'tariff_condition',
					sortable : true
				}, {
					header : "缴费金额",
					dataIndex : 'payment_money',
					sortable : true
				}, {
					header : "缴费说明",
					dataIndex : 'payment_caption',
					sortable : true
				}, {
					header : "结算情况",
					dataIndex : 'payment_condition',
					sortable : true,
					renderer : function(payment_condition) {
						var condition = payment_condition == 0 ? "未结算" : "已结算";
						return condition;
					}
				}, {
					header : "工程负责人",
					dataIndex : 'project_leader',
					sortable : true
				}, {
					header : "备注",
					dataIndex : 'memo',
					sortable : true
				}, {
					header : "审批",
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
				}, {
					header : "审批备注",
					dataIndex : 'comments',
					sortable : true
				} ],
		tbar : [ {
			id : 'editButton',
			text : '审核受理派工',
			disabled : true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核受理派工',
			handler : function() {
				updateForm();
			},
			scope : this
		},'-',
					{
						text:'刷新',
						icon:Ext.zion.image_base+'/refresh.gif',
						tooltip:'刷新纪录',          
	                    handler: function(){grid.store.reload();},
	                   	scope:this
					} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : ['请根据',select_combo,{
						xtype : 'textfield',
						disabled : true,
						id : 'term'
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
	var customep_data_info = [];
	var customer_data_info_data = {};
	Zion.db.getJSON("customer_data_info.select", null, function(data) {
		customep_data_info = data.r;
		for ( var i = 0; i < data.r.length; i++) {
			var id = data.r[i][0];
			customer_data_info_data[id] = data.r[i];
		}
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		})
	grid.addListener('rowdblclick', update_deal_order_approve);
	function update_deal_order_approve(grid, rowIndex, e) {
		updateForm();
	}
	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function deal_order_show() {
		deal_order_form = new Ext.form.FormPanel( {
			labelWidth : 65,
			items : [ {
				layout : 'column',
				items : [ {
					columnWidth : .48,
					layout : 'form',
					autoHeight : true,
					defaultType : 'textfield',
					defaults : {
						width : 200
					},
					items : [ {
						fieldLabel : '业务性质',
						disabled : true,
						name : 'list_type',
						anchor : '90%'
					}, {
						fieldLabel : '客户名称',
						name : 'customer_name',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '联系方式',
						disabled : true,
						name : 'com_telphone',
						disabled : true,
						emptyText : '根据客户名称选填...',
						anchor : '90%'
					}, {
						fieldLabel : '项目名称',
						name : 'project_name',
						anchor : '90%'
					}, {
						fieldLabel : '项目说明',
						name : 'project_caption',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '受理数量',
						name : 'deal_amount',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '受理依据',
						name : 'deal_basis',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '结算方式',
						name : 'count_way',
						anchor : '90%'
					},{
						fieldLabel : '资费情况',
						name : 'tariff_condition',
						disabled : true,
						anchor : '90%'
					},{
						fieldLabel : '缴费金额',
						name : 'payment_money',
						disabled : true,
						anchor : '90%'
					}]
				}, {
					columnWidth : .48,
					layout : 'form',
					autoHeight : true,
					defaultType : 'textfield',
					defaults : {
						width : 200
					},
					items : [{
						fieldLabel : '缴费说明',
						name : 'payment_caption',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '结算情况',
						name : 'payment_condition',
						disabled : true,
						anchor : '90%'
					}, {
						fieldLabel : '工程负责人',
						name : 'project_leader',
						anchor : '90%'
					}, {
						fieldLabel : '编号',
						name : 'id',
						hidden : true,
						hideLabel : true
					}, {
						fieldLabel : '备注',
						disabled : true,
						xtype : 'textarea',
						name : 'memo',
						anchor : '90%'
					}, {
						xtype : 'radiogroup',
						fieldLabel : '审核',
						id:'approve',
						anchor : '90%',
						items : [ {
							boxLabel : '通过',
							inputValue : 1,
							name : 'approve',
							checked: true
						}, {
							boxLabel : '未通过',
							name : 'approve',
							inputValue : 2
						}]
					},{
						fieldLabel : '审批备注',
						id:'comments',
						xtype : 'textarea',
						name : 'comments',
						anchor : '90%'
					},{
						fieldLabel : '版本',
						hideLabel : true,
						hidden : true,
						name : 'version'
					}  ]
				} ]
			}]
		})
		// ----window表单----
		var deal_order_win = new Ext.Window( {
			title : '接收信息',
			closable : true,
			autoWidth : false,
			width : 480,
			closeAction : 'close',
			items : [ deal_order_form ],
			buttons : [
					{
						id : 'win_save_id',
						text : '保存',
						handler : function() {
							deal_order_update(deal_order_form.getForm(),
									deal_order_win);
						}
					}, {
						text : '关闭',
						handler : function() {
							deal_order_win.close();
						}
					} ]
		})
		if(is_approve){
			Ext.getCmp('win_save_id').disable();
//			Ext.getCmp('approve').disable();
//			Ext.getCmp('comments').disable();
		}
		deal_order_win.show();
	}

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
				[ 'project_name', 'count_way', 'project_leader', 'approve',
						'comments', 'id','version' ]);
		
		Ext.zion.db.getJSON("deal_order_approve.update", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("修改提示", "修改成功");
				deal_order_win.close();
				grid.store.reload();
			} else {
				Ext.Msg.alert("修改提示", "数据修改失败");
			}
		});
	}
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var approve = grid.getSelectionModel().getSelected().data.approve;
		if( approve ==1){
			 is_approve = true;
		 } else {
			 is_approve = false;
		 }
		deal_order_show();
		deal_order_form.form.loadRecord(sm);
	}
	
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = Ext.getCmp('term').getValue();
		params_search = [];
		if (!Ext.getCmp('term').disabled) {
			params_search.push(term);
		}

		grid.store.constructor({
					db : {
						params : params_search,
						alias : type
					},
					root : "r",
					fields : fields
				});
		grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})

	}


	// /////////////////////////////////////////////////////////////////////////////////////////////
	// 表单自适应
	// /////////////////////////////////////////////////////////////////////////////////////////////
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});
})