Ext.onReady(function() {
	Ext.QuickTips.init();
		var deal_order_form;
		var customep_data_info = [];
		var customer_data_info_data = {};
		var deal_order_add = false;
		var list_id = [];
		var is_approve = false;
		var sql_array = [];
		var params_search ;
		var fields;
		fields = [ 'id', 'list_type', 'customer_name', 'com_telphone',
					'project_name', 'project_caption', 'deal_amount',
					'deal_basis', 'count_way', 'tariff_condition',
					'payment_money', 'payment_caption', 'payment_condition',
					'project_leader', 'work_type', 'work_content',
					'number_plates', 'vehicle_type', 'memo', 'approve',
					'comments', 'version' ];
		sql_array.push('marketing.deal_order');
		sql_array.push('marketing.deal_order_cust');
		sql_array.push('marketing.deal_order_proj');
		sql_array.push('marketing.deal_order_leader');

	var query_data = [[sql_array[0], '全部'], [sql_array[1], '客户姓名'],
			[sql_array[2], '项目名称'], [sql_array[3], '项目负责人'] ];
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
	
//===============查询combox===============	

		var store = new Ext.zion.db.ArrayStore( {
			db : {
				alias : sql_array[0]
			},
			root : "r",
			fields : fields 
		});

		
		var sm = new Ext.grid.CheckboxSelectionModel();
		var grid = new Ext.grid.GridPanel(
				{
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
							},
							{
								header : "联系电话",
								dataIndex : 'com_telphone',
								sortable : true
							},
							{
								header : "项目名称",
								dataIndex : 'project_name',
								sortable : true
							},
							{
								header : "项目说明",
								dataIndex : 'project_caption',
								sortable : true
							},
							{
								header : "受理数量",
								dataIndex : 'deal_amount',
								sortable : true
							},
							{
								header : "受理依据",
								dataIndex : 'deal_basis',
								sortable : true
							},
							{
								header : "结算方式",
								dataIndex : 'count_way',
								sortable : true
							},
							{
								header : "资费情况",
								dataIndex : 'tariff_condition',
								sortable : true
							},
							{
								header : "缴费金额",
								dataIndex : 'payment_money',
								sortable : true
							},
							{
								header : "缴费说明",
								dataIndex : 'payment_caption',
								sortable : true
							},
							{
								header : "结算情况",
								dataIndex : 'payment_condition',
								sortable : true,
								renderer : function(payment_condition) {
									var condition = payment_condition == 0 ? "未结算"
											: "已结算";
									return condition;
								}
							}, {
								header : "工程负责人",
								dataIndex : 'project_leader',
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
								header : "车牌号码",
								dataIndex : 'number_plates',
								sortable : true
							}, {
								header : "车辆类型",
								dataIndex : 'vehicle_type',
								sortable : true
							}, {
								header : "备注",
								dataIndex : 'memo',
								sortable : true
							}, {
								header : "审核状态",
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
							} ],
					tbar : [ {
						id : 'addButton',
						text : '新增',
						icon : Ext.zion.image_base+'/add.gif',
						tooltip : '添加新纪录',
						handler : function() {
							is_approve = false;
							deal_order_add = true;
							deal_order_show();
						},
						scope : this
					}, '-',// '-'给工具栏按钮之间添加'|'
							{
								id : 'editButton',
								disabled : true,
								text : '修改',
								icon : Ext.zion.image_base+'/update.gif',
								tooltip : '修改记录',
								handler : function() {
									deal_order_add = false;
									updateForm();
								},
								scope : this
							}, '-', {
								id : 'deleteButton',
								disabled : true,
								text : '删除',
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
								},
								scope : this
							} ],
					// 第二个toolbar
					listeners : {
						'render' : function() {
							var tbar = new Ext.Toolbar( {
								items : ['请根据',select_combo, {
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
					})
				});
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

		// ///////////////////////////////////////////////////////////////////////////////////
		// ----------form表单---------
		// ///////////////////////////////////////////////////////////////////////////////////
		function deal_order_show() {
			var type_data = [ [ 1, '自费' ], [ 2, '公费' ], [ 3, '代理' ] ];
			var type_store = new Ext.data.SimpleStore( {
				fields : [ 'list_type', 'text' ],
				data : type_data
			});
			var type_combo = new Ext.form.ComboBox( {
				fieldLabel : '业务性质',
				hiddenName : 'list_type',
//				width : 180,
				valueField : 'list_type',
				store : type_store,
				displayField : 'text',
				mode : 'local',
				editable : false,
				allowBlank : false,
				blankText : '不能为空',
				anchor : '90%',
				triggerAction : 'all'
			});
			var payment_condition_data = [ [ 0, '未结算' ], [ 1, '已结算' ] ];
			var payment_condition_store = new Ext.data.SimpleStore( {
				fields : [ 'payment_condition', 'text' ],
				data : payment_condition_data
			})
			var payment_condition_combox = new Ext.form.ComboBox( {
				fieldLabel : '结算情况',
				hiddenName : 'payment_condition',
				valueField : 'payment_condition',
				store : payment_condition_store,
				displayField : 'text',
				mode : 'local',
				editable : false,
				allowBlank : false,
				blankText : '不能为空',
				anchor : '90%',
				triggerAction : 'all'
			});
			var work_type_data = [ [ '新装', '新装' ], [ '移机', '移机' ],
					[ '停机', '停机' ], [ '维护', '维护' ] ];
			var work_type_store = new Ext.data.SimpleStore( {
				fields : [ 'work_type', 'text' ],
				data : work_type_data
			})
			var work_type_combox = new Ext.form.ComboBox( {
				fieldLabel : '工作性质',
				hiddenName : 'work_type',
				valueField : 'work_type',
				store : work_type_store,
				displayField : 'text',
				mode : 'local',
				allowBlank : false,
				blankText : '不能为空',
				editable : false,
				anchor : '90%',
				triggerAction : 'all'
			});

			// 客户名称
			var company_name_store = new Ext.data.SimpleStore( {
				fields : [ 'id', 'company', 'name' ],
				data : customep_data_info
			})
			var company_name_combox = new Ext.form.ComboBox( {
				fieldLabel : '客户名称',
				valueField : 'id',
				hiddenName : 'customer_name',
				store : company_name_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				allowBlank : false,
				blankText : '不能为空',
				triggerAction : 'all',
				anchor : '90%',
				listeners : {
					'select' : function(company_name_combox, record, index) {
						deal_order_form.getForm().findField("com_telphone")
								.setValue(customep_data_info[index][3]);
					}
				}
			});
			deal_order_form = new Ext.form.FormPanel( {
				autoHeight : true,
				items : [ {
					layout : 'column',
					items : [ {
						columnWidth : .48,
						layout : 'form',
						defaultType : 'textfield',
						defaults : {
							width : 180
						},
						items : [ type_combo, company_name_combox, {
							fieldLabel : '联系方式',
							disabled : true,
							name : 'com_telphone',
							allowBlank : false,
							blankText : '不能为空',
							emptyText : '根据客户名称选填...',
							anchor : '90%'
						}, {
							fieldLabel : '项目名称',
							name : 'project_name',
							allowBlank : false,
							maxLength: 16,
							blankText : '不能为空',
							anchor : '90%'
						}, {
							fieldLabel : '项目说明',
							maxLength: 54,
							name : 'project_caption',
							anchor : '90%'
						}, {
							fieldLabel : '受理数量',
							name : 'deal_amount',
							regex :/^[0-9]*[1-9][0-9]*$/, 
							regexText :'大于0的整数',
							maxLength:8,
							anchor : '90%'
						}, {
							fieldLabel : '受理依据',
							name : 'deal_basis',
							maxLength:32,
							anchor : '90%'
						}, {
							fieldLabel : '结算方式',
							maxLength:8,
							name : 'count_way',
							anchor : '90%'
						}, {
							fieldLabel : '资费情况',
							name : 'tariff_condition',
							maxLength:64,
							anchor : '90%'
						} ]
					}, {
						columnWidth : .48,
						layout : 'form',
						defaultType : 'textfield',
						defaults : {
							width : 180
						},
						items : [ {
							fieldLabel : '缴费金额',
							name : 'payment_money',
							regex :/^\d+(\.\d+)?$/, 
							regexText :'大于等于0的数',
							maxLength:16,
							anchor : '90%'
						}, {
							fieldLabel : '缴费说明',
							name : 'payment_caption',
							maxLength:32,
							anchor : '90%'
						}, payment_condition_combox, {
							fieldLabel : '工程负责人',
							name : 'project_leader',
							maxLength:6,
							allowBlank : false,
							blankText : '不能为空',
							anchor : '90%'
						}, work_type_combox, {
							fieldLabel : '工作内容',
							maxLength:512,
							name : 'work_content',
							anchor : '90%'
						}, {
							fieldLabel : '车牌号码',
							name : 'number_plates',
							anchor : '90%'
						}, {
							fieldLabel : '车辆类型',
							name : 'vehicle_type',
							anchor : '90%'
						}, {
							fieldLabel : '编号',
							name : 'id',
							hidden : true,
							hideLabel : true
						}, {
							fieldLabel : '审批',
							name : 'approve',
							hideLabel : true,
							hidden : true,
							value : 0,
							anchor : '95%'
						}, {
							fieldLabel : '审批备注',
							name : 'comments',
							hideLabel : true,
							hidden : true,
							value : '',
							anchor : '95%'
						}, {
							fieldLabel : '版本',
							name : 'version',
							hideLabel : true,
							hidden : true,
							anchor : '95%'
						} ]
					} ]
				}, {
					fieldLabel : '备注',
					xtype : 'textarea',
					name : 'memo',
					anchor : '43%'

				} ]
			})
			// ----window表单----
			var deal_order_win = new Ext.Window( {
				title : '接收信息',
				closable : true,
				autoWidth : false,
				width : 600,
				items : [ deal_order_form ],
				buttons : [
						{
							text : '保存',
							id : 'save',
							handler : function() {
								if (deal_order_add) {
									add_deal_order(deal_order_form.getForm(),
											deal_order_win);
								} else {
									deal_order_update(
											deal_order_form.getForm(),
											deal_order_win);
								}
							}
						}, {
							text : '取消',
							id : 'cancle',
							handler : function() {
								deal_order_form.form.reset();
								deal_order_win.close();
							}
						} ]
			})
			if (is_approve) {
				Ext.getCmp('save').disable();
			}
			deal_order_win.show();
		}

		function add_deal_order(deal_order_form, deal_order_win) {
			if (deal_order_form.isValid() == false) {
				return false;
			}
			var params = Ext.zion.form.getParams(deal_order_form, [ 'list_type',
					'customer_name', 'com_telphone', 'project_name',
					'project_caption', 'deal_amount', 'deal_basis',
					'count_way', 'tariff_condition', 'payment_money',
					'payment_caption', 'payment_condition', 'project_leader',
					'work_type', 'work_content', 'number_plates',
					'vehicle_type', 'memo', 'approve', 'comments' ]);
			Ext.zion.db.getJSON("deal_order.insert", params, function(data) {
				if (!data.f) {
					Ext.Msg.alert("提示", "数据添加成功");
					deal_order_win.close();
					grid.store.reload();
				} else {
					Ext.Msg.alert("提示", "数据添加失败");
				}
			});
		}

		function deal_order_update(deal_order_form, deal_order_win) {
			if (deal_order_form.isValid() == false) {
				return false;
			}
			var params = Ext.zion.form.getParams(deal_order_form, [ 'list_type',
					'customer_name', 'com_telphone', 'project_name',
					'project_caption', 'deal_amount', 'deal_basis',
					'count_way', 'tariff_condition', 'payment_money',
					'payment_caption', 'payment_condition', 'project_leader',
					'work_type', 'work_content', 'number_plates',
					'vehicle_type', 'memo', 'id', 'version' ]);
			Ext.zion.db.getJSON("deal_order.update", params, function(data) {
				if (data.r == 1) {
					Ext.Msg.alert("修改提示", "数据修改成功");
					deal_order_win.close();
					grid.store.reload();
				} else {
					Ext.Msg.alert("修改提示", "数据修改失败");
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
				if (approve == 1 || approve == 2) {
					is_approve = true;
				} else {
					is_approve = false;
				}
				deal_order_add = false;
				deal_order_show();
				deal_order_form.form.loadRecord(sm);
			}
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
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();

	}


		// 删除 form
		function deleteForm() {
			var sm = grid.getSelectionModel().getSelections();
			var sm_data = grid.getSelectionModel().getSelected();
			if(sm_data.data.approve==1||sm_data.data.approve==1){
				Ext.Msg.alert("警告","审核过的信息，不能删除！");
				return null;
			}

			if (sm.length == 0) {
				Ext.Msg.alert("删除操作", "请选择要删除的项");
			} else if (sm_data.data.approval == 1) {
				Ext.Msg.alert("提示", "已审核状态不能删除");
			} else {
				if (sm.length > 0) {
					Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
						if (btn == 'yes') {
							for ( var i = 0; i < sm.length; i += 1) {
								var member = sm[i].data;
								if (member) {
									list_id.push(member.id);
								} else {
									store.remove(store.getAt(i));
								}
							}
							if (list_id.length > 0) {
								deleNext();
							}
						}
					})
				}
			}
		}
		var deleNext = function() {
			if (list_id.length > 0) {
				var params = [ list_id.pop() ];

				Ext.zion.db.getJSON("deal_order.delete", params,
						function(data) {
							if (data.f) {
								Ext.Msg.alert("提示", "数据删除失败");
							} else {
								if (data.r != 0) {
									Ext.Msg.alert("提示", "数据删除成功");
								} else {
									Ext.Msg.alert("提示", "数据删除失败");
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