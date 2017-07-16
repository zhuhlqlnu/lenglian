Ext.onReady(function() {
	Ext.QuickTips.init();
	var approve_win;
	var apply_panel;
	var is_approval;
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "inventory.apply_approval.approval_view_wealth"
				},
				root : "r",
				fields : ['id','apply_id','project','use_unit' ,'action_time', 'user_action_time', 'apply_unit','bill_count', 'self_count', 'pay_count','other_count','out_price','memo',
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
						} ],
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
												hideLabel : true,
												hidden : true
											},{
												name : 'apply_id',
												hideLabel : true,
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
											},{
												id : 'price_id',
												fieldLabel : '单价',
												disabled : true,
												name : 'out_price'
											},{
												id : 'pay_count_id',
												fieldLabel : '结算金额',
												disabled : true,
												name : 'pay_count'
											}, {
												fieldLabel : '其他金额',
												disabled : true,
												name : 'other_count'
											}]
								}, {
									columnWidth : .48,
									layout : 'form',
									defaults : {anchor : '90%'},
									defaultType : 'textfield',
									items : [ {
												xtype : "radiogroup",
												fieldLabel : '是否同意',
												isFormField : true,
												items : [{
															columnWidth : .5,
															checked : true,
															xtype : "radio",
															boxLabel : "同意",
															name : "approvel_wealth",
															inputValue : 1
														}, {
															columnWidth : .5,
															xtype : "radio",
															boxLabel : "不同意",
															name : "approvel_wealth",
															inputValue : 0
														}]
											},{
												xtype : 'textarea',
												fieldLabel : '审批意见',
												name : 'memo_wealth'
											}]
								}]
					}]
		})

		approve_win = new Ext.Window({
					title : '出库财务审批',
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
			if (1 == sm.data.approvel_result_p || 0 == sm.data.approvel_result_p) {
				is_approval = true;
			} else {
				is_approval = false;
			}
			win_show();
			apply_panel.form.loadRecord(sm);
		}
	}
//================================
	function disableButton(){
		Ext.getCmp('editButton').disable();
	
	}
	// ================审批结果保存=============

	function svaeCheck(form, win) {
		var params_up_apply = [];
		var params_lost_apply = [];
		params_up_apply = Ext.zion.form.getParams(form.form, ['approvel_wealth','memo_wealth','id' ]);
		params_lost_apply = Ext.zion.form.getParams(form.form, ['approvel_wealth', 'apply_id' ]);
		if(params_up_apply[0]==1){
			Ext.zion.db.getJSON("inventory.apply_approval.out_approval_wealth_update", params_up_apply, function(
					data) {
					if (!data.f) {
						Ext.Msg.alert("提示", "提交成功");
						win.close();
						grid.store.reload();
					} else {
						Ext.Msg.alert("提示", "数据提交错误");
					}
			});
							
		}else{
			Ext.zion.db.getJSON("inventory.apply_approval.out_approval_wealth_update", params_up_apply, function(
					data) {
					if (!data.f) {
						Ext.zion.db.getJSON("inventory.apply_approval.lost_apply_out.update", params_lost_apply, function(
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