Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 鍗曚綅缂栧彿
	var update_sign = false;
	var supplier_name_data = {};
	var supplier_name_array = [];
	var sql_array = [];
	var params_search ;
	var fields;
	fields = ['id','project','use_unit' ,'action_time', 'user_action_time', 'apply_unit','bill_count', 'self_count', 'memo',
						 'approvel_result','goods_code','other_count','pay_count','pay_way','name' ,'model','unit','supplier_id',
						 'out_price','supplier_name','amount','goods_out_id','out_apply_id','acount' ];
	sql_array.push("inventory.out.out_apply.goods_out_apply.query");
	sql_array.push('inventory.out.out_apply.out_apply_project.query');
	sql_array.push('inventory.out.out_apply.out_apply_unit.query');
	sql_array.push('inventory.out.out_apply.out_apply_supplier.query');
	var purchase_in_data = [[sql_array[0], '全部'], [sql_array[1], '项目名称'],
			[sql_array[2], '申请部门'], [sql_array[3], '供货商名称'] ];
	var combo_store = new Ext.data.SimpleStore({
				fields : ['sql_str', 'sql_name'],
				data : purchase_in_data
			});
	var select_combo = new Ext.form.ComboBox({
				hiddenName : 'sql_str',
				valueField : 'sql_str',
				store : combo_store,
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
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : sql_array[0]
				},
				root : "r", 
				fields : fields
			});
	var sm = new Ext.grid.CheckboxSelectionModel();
	var grid = new Ext.grid.GridPanel({
				store : store,
				sm : sm,
				columns : [
						// new Ext.grid.RowNumberer(),//获得行号
						sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true,
							renderer : function(id) {
								return "S" + id;
							}
						}
						, {
							header : "项目名称",
							dataIndex : 'project',
							sortable : true

						}, {
							header : "领货单位",
							dataIndex : 'use_unit',
							sortable : true
						},{
							header : "取货时间",
							dataIndex : 'user_action_time',
							sortable : true
						},{
							header : "结算数量",
							dataIndex : 'bill_count',
							sortable : true
						},{
							header : "自用数量",
							dataIndex : 'self_count',
							sortable : true
						},{
							header : "申请部门",
							dataIndex : 'apply_unit',
							sortable : true				
						},{
							header : "供货商名称",
							dataIndex : 'supplier_name',
							sortable : true				
						},{
							header : "货品名称",
							dataIndex : 'name',
							sortable : true
						},{
							header : "规格型号",
							dataIndex : 'model',
							sortable : true
						},{
							header : "备注",
							dataIndex : 'memo',
							sortable : true
						},{
							header : "是否审核",
							dataIndex : 'approvel_result',
							sortable : true,
							renderer : function(str){
								if(null==str){
									return '未审核';
								}else if(1==str){
									return '<span style="color:green;">审批通过</span>';
								}else if(0==str){
									return '<span style="color:red;">不通过</span>';
								}
							}
						}
						],
				tbar : [{
							id : 'addButton',
							text : '新增',
							icon : Ext.zion.image_base+'/add.gif',
							tooltip : '添加新纪录',
							handler : add_form,
							scope : this
						}, '-',// '-'给工具栏按钮之间添加'|'
						{
							id : 'editButton',
							text : '修改',
							disabled : true,
							icon : Ext.zion.image_base+'/update.gif',
							tooltip : '修改记录',
							handler : updateForm,
							scope : this
						}, '-', {
							id : 'deleteButton',
							text : '删除',
							icon : Ext.zion.image_base+'/delete.gif',
							tooltip : '删除记录',
							disabled : true,
							handler : deleteForm,
							scope : this
						}, '-', {
							text : '刷新',
							icon : Ext.zion.image_base+'/refresh.gif',
							tooltip : '刷新纪录',
							handler : function() {
								grid.store.reload();
								disableButton();
							},
							scope : this
						},'-',
						{
							text : '导出报表',
							icon : Ext.zion.image_base+'/report_link.png',
							tooltip : '导出报表',
							handler : function() {
								var term = Ext.getCmp('term').getValue();
								params_search = [];
								if (!Ext.getCmp('term').disabled) {
									params_search.push(term);
								}

								Ext.Msg.alert(
												"下载报表",
												"<a href='"+ Zion.report.getURL(select_combo.getValue(),params_search)
														+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
							},
							scope : this
						}],
				// 第二个toolbar
				listeners : {
					'render' : function() {
						var tbar = new Ext.Toolbar({
									items : ['请根据', select_combo, {
												xtype : 'textfield',
												disabled : true,
												id : 'term'
											}, {
												text : '查询',
												tooltip : '查询',
												icon : Ext.zion.image_base+'/select.gif',
												handler : selectForm
											}]
								})
						tbar.render(this.tbar);
					}
				},
				bbar : new Ext.PagingToolbar({
							store : store,
							pageSize : Ext.zion.page.limit,
							displayInfo : true
						}),
				viewConfig : {
					autoFill : true,
					forceFit : true
				}
			});

	Zion.db.getJSON("supplier_store_name.select", null, function(data) {
				supplier_name_array = data.r;
				for (var i = 0; i < data.r.length; i++) {
					var id = data.r[i][0];
					supplier_name_data[id] = data.r[i];
				}
				store.load({
							params : {
//								params : ['1'],
								start : 0,
								limit : Ext.zion.page.limit
							}
						});

			});
				
//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})
			sm.on('rowdeselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})

	// ----------form表单---------
	// 单位名称

	var out_apply_id = new Ext.form.TextField({
				name : 'id',
				hidden : true,
				hideLabel : true
			});

			
	var project_name_comp = new Ext.form.TextField({
				fieldLabel : '项目名称',
				name : 'project',
				id : 'project',
				maxLength : 12,
				maxLengthText : '不要输入多于12个字符',
				allowBlank : false,
				blankText : '不能为空'
	});
	
	var user_unit_comp = new Ext.form.TextField({
				fieldLabel : '领货单位',
				name : 'use_unit',
				id : 'use_unit',
				maxLength : 12,
				maxLengthText : '不要输入多于12个字符',
				allowBlank : false,
				blankText : '不能为空'
	});
	
	var user_date_comp = new Ext.form.DateField( {
		fieldLabel : '申请领用日期',
		name : 'user_action_time',
		altFormats : 'Y-m-d',
		format : 'Y-m-d',
//		maxValue : new Date,
		editable : false,
		allowBlank : false,
		blankText : '不能为空',
		value : new Date
	})

	var apply_unit_comp = new Ext.form.TextField({
				fieldLabel : '申请部门',
				name : 'apply_unit',
				id : 'apply_unit',
				maxLength : 12,
				maxLengthText : '不要输入多于12个字符',
				allowBlank : false,
				blankText : '不能为空'
	});
	
	var com_store = new Ext.data.SimpleStore({
				root : 'r',
				fields : ['supplier_id', 'type_id', 'name'],
				proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/store_supplier.select'
						})
			});

	var company_combo = new Ext.form.ComboBox({
				fieldLabel : '供货商',
				hiddenName : 'supplier_id',
				valueField : 'supplier_id',
				store : com_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				emptyText : '...请选择...'
			});
	com_store.load();
	// =================事件触发===================
	company_combo.on('select', load_com_store, this);
//	var goods_proxy = new Ext.data.ScriptTagProxy({
//				url : ''
//			});

	var read_url = {
		url : null
	};
	// ================传参修改================
	function load_com_store(combo, record, index) {
		read_url.url = ZionSetting.db.url + '/' + Zion.token
				+ '/getStore_goods_by_supplier_id.select/'
				+ Zion.util.encodeParam([record.get("supplier_id")]);
		goods_store.load();
	}
	// 货品名称
	var goods_store = new Ext.data.SimpleStore({
				root : "r",
				fields : ['id', "goods_code", "name", "model", "unit", "note",
						"supplier_id","out_price"],

				proxy : new Ext.data.ScriptTagProxy({
							api : {
								read : read_url
							}
						})

			});

	var model_combo = new Ext.form.ComboBox({
				fieldLabel : '规格型号',
				hiddenName : 'model',
				valueField : 'model',
				store : goods_store,
				displayField : 'model',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				emptyText : '...请选择...',
				listeners : {
					'select' : function(this_, record, index){
						goods_name.setValue(record.get('name'));
						goods_unit.setValue(record.get('unit'));
						goods_price.setValue(record.get('out_price'));
						load_amount_store(record.get("model"));
//						goods_total.setValue(record.get('amount'));
					}				
				}
			});
	var amount_read_url = {
		url : null
	};
	// ================传参修改================
	function load_amount_store( varStr ) {
		amount_read_url.url = ZionSetting.db.url + '/' + Zion.token
				+ '/getAmount_by_model.select/'
				+ Zion.util.encodeParam([varStr]);
		goods_amount_store.load();
	}
	// 货品名称
	var goods_amount_store = new Ext.data.SimpleStore({
				root : "r",
				fields : ['id', "amount", "model" ],
				// proxy :goods_proxy
				proxy : new Ext.data.ScriptTagProxy({
							api : {
								read : amount_read_url
							}
						}),
				listeners : {
					'load' : function(this_,records,options){
						goods_total.setValue(records[0].get("amount"));
					
					}
				}

			});

			
	var goods_name = new Ext.form.TextField({
				fieldLabel : '货品名称',
				name : 'name',
				id : 'name',
				disabled : true,
				allowBlank : false,
				blankText : '不能为空'
	});

//	var goods_model = new Ext.form.TextField({
//		fieldLabel : '规格型号',
//		name : 'goods_model',
//		id : 'goods_model',
//		disabled : true
//	});

	var goods_unit = new Ext.form.TextField({
				fieldLabel : '计量单位',
				name : 'unit',
				disabled : true,
				id : 'unit',
				allowBlank : false,
				blankText : '不能为空'
	});
	
	var goods_price = new Ext.form.TextField({
				fieldLabel : '货品单价',
				name : 'out_price',
				readOnly : true,
				id : 'out_price_id',
				allowBlank : false,
				blankText : '不能为空'
		
	}); 
	
	var goods_total = new Ext.form.TextField({
				fieldLabel : '库存数量',
				name : 'amount',
				readOnly : true,
				id : 'amount_id',
				allowBlank : false,
				blankText : '不能为空'
		
	});

	var count_goods = new Ext.form.TextField({
				fieldLabel : '结算数量',
				name : 'bill_count',
				id : 'bill_count_id',
				emptyText : '填写数字',
				regex : /^[0-9]{0,10}$/,// 正则表达式 这里假设只允许输入数字 如果输入的不是数字 就会出现下面定义的提示信息
				regexText : '只能填写数字不多于10位',
//				allowBlank : false,
//				blankText : '不能为空',
				listeners : {
					'change' : function(this_,newV,oldV){
						if(newV!=''&&newV!=null){
							Ext.getCmp('self_count_id').disable();
						}else{
							Ext.getCmp('self_count_id').enable();
						}
					},
					'blur' : function(this_){
						Ext.getCmp('pay_count_id').setValue(goods_price.getValue()*this_.getValue());
					
					}
				}
			});

	var count_self_goods = new Ext.form.TextField({
				fieldLabel : '自用数量',
				name : 'self_count',
				id : 'self_count_id',
				emptyText : '填写数字',
				regex : /^[0-9]{0,10}$/,// 正则表达式 这里假设只允许输入数字 如果输入的不是数字 就会出现下面定义的提示信息
				regexText : '只能填写数字不多于10位',
//				allowBlank : false,
//				blankText : '不能为空',
				listeners : {
					'change' : function(this_,newV,oldV){
						if(newV!=''&&newV!=null){
							Ext.getCmp('bill_count_id').disable();
						}else{
							Ext.getCmp('bill_count_id').enable();
						}
					},
					'blur' : function(this_){
						Ext.getCmp('pay_count_id').setValue(goods_price.getValue()*this_.getValue());
					
					}
				}
			});
			
	var count_pay = new Ext.form.TextField({
			id : 'pay_count_id',
			fieldLabel : '结算金额',
			readOnly : true,
			name : 'pay_count',
			allowBlank : false
		})
		
	var temp_amount ;
	var self_sign ;
	
	var count_pay_other = new Ext.form.TextField({
			fieldLabel : '其他金额',
			emptyText : '填写数字',
			name : 'other_count',
			id : 'other_count',
			regex : /^[+,-]?[0-9]{0,9}$/,// 正则表达式 这里假设只允许输入数字 如果输入的不是数字 就会出现下面定义的提示信息
			regexText : '不要填写超过9个字符的数字',
			listeners : {
				'blur' : function(this_){
					var temp_comp ; 
					if(count_goods.getValue()!=''&&count_goods.getValue()!=null){
						temp_comp = count_goods;
						self_sign = false;
					}else if(count_self_goods.getValue()!=''&&count_self_goods.getValue()!=null){
						temp_comp = count_self_goods;
						self_sign = true;
					
					}else {
						return false;
					}
					temp_amount = temp_comp.getValue();
					var aa = parseInt(goods_price.getValue()*temp_comp.getValue());
					var ab = parseInt(this_.getValue());
					Ext.getCmp('pay_count_id').setValue(aa+ab);
				
				}
			}
		})
	
	var pay_way_record = new Ext.data.ArrayStore({
		fields : ['pay_way','pay_way_str'],
		data : [['1','现金支付'],['2','托收支付'],['3','支票支付'],['4','其他支付']]
	});

	var pay_way_comp = new Ext.form.ComboBox({
			fieldLabel : '结算方式',
			hiddenName : 'pay_way',
			valueField : 'pay_way',
			store : pay_way_record,
			displayField : 'pay_way_str',
			allowBlank : false,
			blankText : "请选择一种结算方式",
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});

	var goods_note = new Ext.form.TextArea({
				fieldLabel : '商品备注',
				name : 'memo',
				allowBlank : true,
// emptyText:'--备注填写--',
				height : 80,
				maxLength : 500
			});

	// Ext.form.Field.prototype.;
	var formPanel = new Ext.form.FormPanel({
				items : [{
						 	layout : 'column',
						 	items : [{
									columnWidth : .48,
									layout : 'form',
									defaultType : 'textfield',
									defaults : {anchor : '90%'},
									items : [out_apply_id ,project_name_comp,user_unit_comp,user_date_comp,apply_unit_comp, company_combo,
						 model_combo,goods_name,goods_unit,goods_price,goods_total ]
						 		
						 	},{
									columnWidth : .48,
									layout : 'form',
									defaultType : 'textfield',
									defaults : {anchor : '90%'},
									items : [ count_goods,count_self_goods,pay_way_comp,count_pay_other,count_pay, goods_note]
						 		
						 	}]
						 }]//goods_name,-goods_model,
			})

			// ----window表单----
	var win = new Ext.Window({
				title : '出库申请表单',
				closable : true,
				closeAction : 'hide',
				autoWidth : false,
				width : 560,
				items : [formPanel],
				buttons : [{
							text : '保存',
							id : 'save_form_but',
							handler : addForm
						}, {
							text : '关闭',
							id : 'close_form_but',
							handler : function() {
								formPanel.form.reset();
								win.hide();
							}
						}]
			})

	function addForm() {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			if(Ext.getCmp('self_count_id').getValue()!=''&&Ext.getCmp('self_count_id').getValue()!=null){
				self_sign = true;
			}else{
				self_sign = false;
			}
			if (update_sign) {
				Ext.Msg.alert("提示","修改功能暂停使用!");//********************************************************
				return null;//************************************************************************************8
				var sm = grid.getSelectionModel().getSelected();
//				var older_amount = sm.data.amount;
//				var goods_out_idV = sm.data.goods_out_id;

// 修改操作 
				var params = [];
				var goods_out_params = [];
				var sql_params ;
				if(self_sign){
					params = Ext.zion.form.getParams(formPanel.form,['project','use_unit','user_action_time','apply_unit',
						'self_count','pay_way','other_count','pay_count','model','memo','id']);
					sql_params = "inventory.out.out_apply.out_apply_self.update";
					goods_out_params = Ext.zion.form.getParams(formPanel.form,['self_count', 'model']);
				
				}else{
					params = Ext.zion.form.getParams(formPanel.form,['project','use_unit','user_action_time','apply_unit',
						'bill_count','pay_way','other_count','pay_count','model', 'memo','id']);
					sql_params = "inventory.out.out_apply.out_apply.update";
					goods_out_params = Ext.zion.form.getParams(formPanel.form,['bill_count','model']);
				}
				goods_out_params.push(goods_out_idV);
				var param_out = [];
				var param_outA = [];
				param_outA.push(parseInt(sm.data.amount));//变量修改，
				param_out.push(parseInt(goods_total.getValue())+parseInt(older_amount)-parseInt(goods_out_params[0]));
				param_out.push(model_combo.getValue());
				
				Ext.zion.db.getJSON(sql_params,params,
						function(data) {
							/**
							 * 根据结算类型，自用结算和对外结算，修改出库申请表单
							 */
							if (!data.f && data.r>0) {
								Ext.zion.db.getJSON("inventory.out.out_apply.store_purchase_out.updateA", param_outA,
										function(data) {
											/**
											 * 在库存中减掉申请数量，重新设定库存数；
											 */
											if (!data.f) {
												Ext.zion.db.getJSON("inventory.out.out_apply.store_purchase_out.updateB", param_out,
														function(data) {
															/**
															 * 在库存中减掉申请数量，重新设定库存数；
															 */
															if (!data.f) {
															Ext.zion.db.getJSON("inventory.out.update_goods_out", goods_out_params,
																	function(data) {
																	/**
																	 * 修改出库单，重新写入出库单结算数量和规格型号；
																	 */
																		if (!data.f&&data.r>0) {
																			Ext.Msg.alert("提示", "添加成功");
																			win.hide();
																			grid.store.reload();
																			formPanel.form.reset();
																			disableButton();
																		} else {
																			Ext.Msg.alert("提示", "数据添加错误");
																		}
																	});
															} else {
																Ext.Msg.alert("提示", "数据添加错误");
															}
														});
											} else {
												Ext.Msg.alert("提示", "数据添加错误");
											}
										});
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});

			} else {
// 增加操作 
				var params = [];
				var goods_out_params = [];//id, out_type, user_id, acount, model
				var sql_params ;
				if(self_sign){
					params = Ext.zion.form.getParams(formPanel.form,['project','use_unit','user_action_time','apply_unit',
						'self_count','pay_way','other_count','pay_count','model','memo']);
					sql_params = "inventory.out.out_apply.out_apply_self.insert";
					goods_out_params = Ext.zion.form.getParams(formPanel.form,['self_count','model']);
				
				}else{
					params = Ext.zion.form.getParams(formPanel.form,['project','use_unit','user_action_time','apply_unit',
						'bill_count','pay_way','other_count','pay_count','model', 'memo']);
					sql_params = "inventory.out.out_apply.out_apply.insert";
					goods_out_params = Ext.zion.form.getParams(formPanel.form,['bill_count','model']);
				}
				params.push('0');
				var param_out = [];
				param_out.push(parseInt(goods_total.getValue())-parseInt(temp_amount));
				param_out.push(model_combo.getValue());
				
				Ext.zion.db.getJSON("inventory.out.produce_apply_id",null,
						function(data) {
							/**
							 * 生产出库申请单号id
							 */
							if (!data.f) {
								var app_id = data.r[0][0];
								params.unshift(app_id);
								goods_out_params.push(app_id);
								Ext.zion.db.getJSON(sql_params, params,
										function(data) {
											/**
											 * 根据结算类型，自用结算和对外结算，生产出库申请表单
											 */
											if (!data.f) {
											Ext.zion.db.getJSON("inventory.out.out_apply.store_purchase_out.update", param_out,
													function(data) {
													/**
													 * 在库存中减掉申请数量，重新设定库存数；
													 */
//													SEQ_OUT_APPROVE_ID.Nextval
														if (!data.f) {
															Ext.zion.db.getJSON("inventory.out.out_approval_insert", [app_id], function(
																data) {
																/**
																 * 生成出库审批表：要经过：财务，部门领导，公司领导审批
																 */
																if (!data.f) {
																Ext.zion.db.getJSON("inventory.out.new_goods_out", goods_out_params, function(
																	data) {
																	if (!data.f) {
																/**
																 * 生成出库单状态是：1，把出库申请id插入
																 */
																		Ext.Msg.alert("提示", "添加成功");
																		win.hide();
																		grid.store.reload();
																		formPanel.form.reset();
																		disableButton();
																	} else {
																		Ext.Msg.alert("提示", "数据提交错误");
																	}
																});
																} else {
																	Ext.Msg.alert("提示", "数据提交错误");
																}
															});
														} else {
															Ext.Msg.alert("提示", "数据添加错误");
														}
													});
											} else {
												Ext.Msg.alert("提示", "数据添加错误");
											}
										});
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});
			}
		}
	}
	// ===============增加入库单============
	function add_form() {
		update_sign = false;
		win.show();
	}
	// ----------修改window表单---------
	function updateForm() {
		update_sign = true;
		var sm = grid.getSelectionModel().getSelected();
//		var sm_num = grid.selModel.getSelections().length;
		win.show();
		if(1==sm.data.approvel_result||2==sm.data.approvel_result){
			Ext.getCmp('save_form_but').disable();
		}else{
			Ext.getCmp('save_form_but').enable();
		}
		formPanel.form.loadRecord(sm);
//		company_combo.setValue(sm.data.supplier_id);			
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
		disableButton();

	}


	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
	
// 删除 form
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
//		if (sm.length == 0) {
//			Ext.Msg.alert("删除操作", "请选择要删除的项");
//		} else {
//			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
							if (btn == 'yes') {
								deleNext(sm);
							}
						})
//			}
//		}
	}
	var deleNext = function(params_sm) {
		if (params_sm.length > 0) {
			var temp_sm = params_sm.pop();
			Ext.zion.db.getJSON("inventory.out.out_apply.out_approval.delete", [temp_sm.data.id], function(
					data) {
				if ( data.r>0 ) {
					Ext.zion.db.getJSON("inventory.out.out_apply.goods_out_order.delete", [temp_sm.data.goods_out_id], function(
							data) {
						if ( data.r>0 ) {
							Ext.zion.db.getJSON("inventory.out.out_apply.return_goods_store", [parseInt(temp_sm.data.amount)+parseInt(temp_sm.data.acount),temp_sm.data.model], function(
									data) {
								if ( data.r>0 ) {
									Ext.zion.db.getJSON("inventory.out.out_apply.out_apply.delete", [temp_sm.data.id], function(
											data) {
										if ( data.r>0 ) {
											Ext.Msg.alert("提示", "成功");
										} else {
											Ext.Msg.alert("提示", "失败");
										}
									});
								} else {
									Ext.Msg.alert("提示", "失败");
								}
							});
						} else {
							Ext.Msg.alert("提示", "失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "失败");
				}
				deleNext(params_sm);
			});
		} else {
			grid.store.reload();
			Ext.getCmp('deleteButton').disable();
			// alert("to do refresh data");
		}
	}
//	var deleNext = function(params_id) {
//		if (params_id.length > 0) {
//			Ext.zion.db.getJSON("inventory.out.out_apply.out_apply.delete", [params_id.pop()], function(
//							data) {
//						if (data.r && (data.r!=0)) {
//							Ext.Msg.alert("提示", "成功");
//
//						} else {
//							Ext.Msg.alert("提示", "失败");
//						}
//						deleNext(params_id);
//					});
//		} else {
//			grid.store.reload();
//			Ext.getCmp('deleteButton').disable();
//			// alert("to do refresh data");
//		}
//	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	// grid自适应
	var view = new Ext.Viewport({
				layout : 'border',
				border : false,
				items : [{
							region : 'center',
							layout : 'fit',
							items : [grid]
						}]
			});
})