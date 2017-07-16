Ext.onReady(function() {
	Ext.QuickTips.init();
	var approve_win;
	var apply_panel;
	var is_approval;
	var load_find_attribute ;
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "inventory.apply_approval.approval_view.select"
				},
				root : "r",
				fields : ['id','project','use_unit' ,'action_time', 'user_action_time', 'apply_unit','bill_count', 'self_count', 'memo',
						 'approvel_result_p','goods_code','name' ,'model','unit','supplier_id','supplier_name' ]
			});
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	var grid = new Ext.grid.GridPanel({
				store : store,
				sm : sm,
				// renderTo : 'out_approve',
				columns : [sm, {
							header : '序号',
							dataIndex : 'id',
							sortable : true
						}, {
							header : '申请项目名称',
							dataIndex : 'project',
							sortable : true
						}, {
							header : '领货单位',
							dataIndex : 'use_unit',
							sortable : true
						}, {
							header : '申请日期',
							dataIndex : 'action_time',
							sortable : true
						}, {
							header : '申请领用日期',
							dataIndex : 'user_action_time',
							sortable : true
						}, {
							header : '审批情况',
							dataIndex : 'approvel_result',
							sortable : true,
							renderer : function(approve) {
								if (approve == 1) {
									return "已审核通过";
								} else if (approve == 0) {
									return "未审核通过";
								} else {
									return "尚未审核"
								}
							}
						}],
				viewConfig : {
					autoFill : true,
					forceFit : true
				},
				tbar : [{
							id : 'editButton',
							text : '审批',
							icon : Ext.zion.image_base+'/cog_edit.png',
							tooltip : '审批表单',
							disabled : true,
							handler : checkForm,
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
						}],
				bbar : new Ext.PagingToolbar({
							store : store,
							pageSize : Ext.zion.page.limit,
							displayInfo : true
						})
			})
	store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
	grid.addListener('rowdblclick', checkForm);
//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
			});
			sm.on('rowdeselect', function() {
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
			});

	
	// ================传参修改================

	function win_show() {
	// ================ 关闭按钮 ==============

		var close_win_btn = new Ext.Button({
					text : '关闭',
					// id:'close_approval',
					hidden : false,
					handler : function() {
						approve_win.close();
					}
				});

		var save_win_btn = new Ext.Button({
					text : '保存',
					// id:'save_approval',
					hidden : false,
					handler : function() {
						if(!apply_panel.form.isValid()){
							return null;
						}
						var temp_count = Ext.getCmp('other_count').getValue();
						
						Ext.Msg.confirm('修改确认', '审批记录生产后不能修改！', function(btn) {
									if (btn == 'yes') {
										svaeCheck(apply_panel, approve_win);

									}
								})
					}
				});

		var cancel_win_btn = new Ext.Button({
					text : '取消',
					// id:'cancel_approval',
					hidden : false,
					handler : function() {
						approve_win.close();
					}
				});
				
	var read_url = {
		url : null
	};
	// ================传参修改================
	load_find_attribute = function load_com_store(record) {
		read_url.url = ZionSetting.db.url + '/' + Zion.token
				+ '/inventory.apply_approval.purchase_order_in.query.select/'
				+ Zion.util.encodeParam([record.goods_code]);
		goods_store.load();
	}
	// 货品名称
	var goods_store = new Ext.data.SimpleStore({
				root : "r",
				fields : ['amount', "order_in_id", "goods_code", "id", "price" ],
				// proxy :goods_proxy
				proxy : new Ext.data.ScriptTagProxy({
							api : {
								read : read_url
							}
						})

			});

	var order_in_comp = new Ext.form.ComboBox({
				fieldLabel : '入库单次',
				hiddenName : 'order_in_id',
				valueField : 'order_in_id',
				store : goods_store,
				displayField : 'order_in_id',
				mode : 'local',
				editable : false,
				allowBlank : false,
				blankText : "请选择入库的单号",
				triggerAction : 'all',
				emptyText : '...请选择...',
				listeners : {
					'select' : function(this_, record, index){
						Ext.getCmp('price_id').setValue(record.get('price'));
						Ext.getCmp('acount_id').setValue(record.get('amount'));
						Ext.getCmp('pay_count_id').setValue(record.get('price')*Ext.getCmp('bill_count_id').getValue());
					}				
				}
			});
	
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

		apply_panel = new Ext.form.FormPanel({
			items : [{
						layout : 'column',
						items : [{
									columnWidth : .48,
									layout : 'form',
									defaultType : 'textfield',
									defaults : {anchor : '90%'},
									items : [{
												name : 'id',
												hidden : true
											},{
												fieldLabel : '项目名称',
												name : 'project',
												disabled : true
											}, {
												fieldLabel : '领货单位',
												disabled : true,
												name : 'use_unit'
											}, {
												fieldLabel : '申请日期',
												disabled : true,
												name : 'action_time'
											}, {
												fieldLabel : '申请领用日期',
												disabled : true,
												name : 'user_action_time'
											}, {
												fieldLabel : '申请单位',
												disabled : true,
												name : 'apply_unit'
											}, {
												fieldLabel : '货品名称',
												disabled : true,
												name : 'name'
											}, {
												fieldLabel : '规格型号',
												disabled : true,
												name : 'model'
											}, {
												id : 'bill_count_id',
												fieldLabel : '结算数量',
												disabled : true,
												name : 'bill_count'
											}, {
												fieldLabel : '自用数量',
												disabled : true,
												name : 'self_count'
											}, {
												fieldLabel : '货品编码',
												disabled : true,
												name : 'goods_code'
											}]
								}, {
									columnWidth : .48,
									layout : 'form',
									defaults : {anchor : '90%'},
									defaultType : 'textfield',
									items : [ order_in_comp, {
												id : 'price_id',
												fieldLabel : '单价',
												readOnly : true,
												name : 'price'
											}, {
												id : 'acount_id',
												fieldLabel : '本批货品剩余',
												readOnly : true,
												name : 'acount'
											},pay_way_comp, {
												id : 'pay_count_id',
												fieldLabel : '结算金额',
												readOnly : true,
												name : 'pay_count'
											}, {
												fieldLabel : '其他金额',
												emptyText : '+,-加数字',
												name : 'other_count',
												id : 'other_count',
												regex : /^[+,-]?[0-9]{0,9}$/,// 正则表达式 这里假设只允许输入数字 如果输入的不是数字 就会出现下面定义的提示信息
												regexText : '不要填写超过9个字符的数字'
											}, {
												xtype : "radiogroup",
												fieldLabel : '是否同意',
												isFormField : true,
												items : [{
															columnWidth : .5,
															checked : true,
															xtype : "radio",
															boxLabel : "同意",
															name : "approvel_result",
															inputValue : 1
														}, {
															columnWidth : .5,
															xtype : "radio",
															boxLabel : "不同意",
															name : "approvel_result",
															inputValue : 0
														}]
											},{
												xtype : 'textarea',
												fieldLabel : '审批意见',
												name : 'approve_memo'
											}]
								}]
					}]
		})

		approve_win = new Ext.Window({
					title : '出库审批表',
					closable : true,
					autoWidth : false,
					width : 560,
					items : [apply_panel],
					buttons : [save_win_btn, cancel_win_btn, close_win_btn]
				})
		if (is_approval) {
			save_win_btn.disable();
			cancel_win_btn.disable();
		} else {
			close_win_btn.disable();
		}

		approve_win.show();
	}

	// function checkForm(grid, rowIndex, e) {
	function checkForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;

		if (1 != sm_num) {
			Ext.Msg.alert("修改操作", "请选择一条记录审批");
		} else {
			if (1 == sm.data.approvel_result || 0 == sm.data.approvel_result) {
				is_approval = true;
			} else {
				is_approval = false;
			}
			win_show();
			apply_panel.form.loadRecord(sm);
			load_find_attribute(sm.data);
		}
	}
//================================
	function disableButton(){
		Ext.getCmp('editButton').disable();
	
	}
	// ================审批结果保存=============

	function svaeCheck(form, win) {
		var params_up_apply = [];
		var params_up_stroe = [];
		var params_insert = [];
		var params_approval = [];
		params_up_apply = Ext.zion.form.getParams(form.form, ['approvel_result','pay_way', 'pay_count','other_count','approve_memo','id']);
		params_approval = Ext.zion.form.getParams(form.form,['id','approvel_result','approve_memo']);
		var resultV = params_up_apply[0];//Ext.zion.form.getParams(form.form,['approvel_result']);
		if(0==resultV){//
			Ext.zion.db.getJSON("inventory.in.out_apply_no.update", params_up_apply, function(
							data) {
						if (!data.f) {
							Ext.zion.db.getJSON("inventory.apply_approval.out_approval_insert", params_approval, function(
											data) {
										if (!data.f) {
											Ext.Msg.alert("提示", "提交成功");
											win.close();
											grid.store.reload();
										} else {
											Ext.Msg.alert("提示", "数据提交错误");
										}
									});
							
						} else {
							Ext.Msg.alert("提示", "数据提交错误");
						}
					});
			
		}else if(1 == resultV){
			params_up_apply.shift();
			params_up_apply.unshift(0);
			params_up_stroe = Ext.zion.form.getParams(form.form, ['bill_count','order_in_id']);
			params_insert = Ext.zion.form.getParams(form.form, ['goods_code','bill_count','id','order_in_id']);
			var temp_codeV = params_insert.shift();
			params_insert.unshift(1);
			params_insert.unshift(temp_codeV);
//			alert(params_insert);
			Ext.zion.db.getJSON("inventory.in.out_apply.update", params_up_apply, function(
							data) {
						if (!data.f) {
							Ext.Msg.alert("提示", "提交成功");
							Ext.zion.db.getJSON("inventory.in.purchase_goods.update", params_up_stroe, function(
											data) {
										if (!data.f) {
											Ext.Msg.alert("提示", "提交成功");
											Ext.zion.db.getJSON("inventory.in.purchase_out.insert", params_insert, function(
															data) {
														if (!data.f) {
															Ext.zion.db.getJSON("inventory.apply_approval.out_approval_insert", params_approval, function(
																			data) {
																		if (!data.f) {
																			Ext.Msg.alert("提示", "提交成功");
																			win.close();
																			grid.store.reload();
																		} else {
																			Ext.Msg.alert("提示", "数据提交错误");
																		}
																	});
															
														} else {
															Ext.Msg.alert("提示", "数据提交错误1");
														}
													});
											
										} else {
											Ext.Msg.alert("提示", "数据提交错误2");
										}
									});
							
						} else {
							Ext.Msg.alert("提示", "数据提交错误3");
						}
					});
			
		}

	}

	new Ext.Viewport({
				enableTabScroll : true,
				layout : "border",
				items : [{
							region : "center",
							layout : 'fit',
							items : [grid]
						}]
			})
})