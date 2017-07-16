Ext.onReady(function() {
	Ext.QuickTips.init();
	var approve_win;
	var apply_panel;
	var is_approval;
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "inventory.apply_approval.approval_view_leader"
				},
				root : "r",
				fields : ['id','project','use_unit' ,'action_time', 'user_action_time', 'apply_unit','bill_count', 'self_count', 'pay_count','other_count','out_price',
						 'approvel_result_p','name' ,'model','unit','supplier_id','supplier_name','approval_id','approve','approval_memo','approve_part',
						 'memo_part','approve_wealth','memo_wealth','approve_leaderp']
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
							header : '库管审批',
							dataIndex : 'approve',
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
						}, {
							header : '部门审批',
							dataIndex : 'approve_part',
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
						}, {
							header : '财务审批',
							dataIndex : 'approve_wealth',
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
											} ,{
												id : 'out_price_id',
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
												name : 'approval_id',
												hideLabel : true,
												hidden : true
											} ,{
										xtype : 'textarea',
										fieldLabel : '部门意见',
										readOnly : true,
										name : 'memo_part'
									
									},{
										xtype : 'textarea',
										fieldLabel : '财务意见',
										readOnly : true,
										name : 'memo_wealth'
									
									},{
												xtype : "radiogroup",
												fieldLabel : '是否同意',
												isFormField : true,
												items : [{
															columnWidth : .5,
															checked : true,
															xtype : "radio",
															boxLabel : "同意",
															name : "approve_leader",
															inputValue : 1
														}, {
															columnWidth : .5,
															xtype : "radio",
															boxLabel : "不同意",
															name : "approve_leader",
															inputValue : 0
														}]
											},{
												xtype : 'textarea',
												fieldLabel : '审批意见',
												name : 'memo_leader'
											}]
								}]
					}]
		})

		approve_win = new Ext.Window({
					title : '出库领导审批',
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
//		var sm_num = grid.selModel.getSelections().length;
		if(sm.data.approve_leader!=null){
			Ext.Msg.alert("提示","申请已经审批，不允许操作!");
			return false;
		}

//		if (1 != sm_num) {
//			Ext.Msg.alert("修改操作", "请选择一条记录审批");
//		} else {
			if (1 == sm.data.approvel_result || 0 == sm.data.approvel_result) {
				is_approval = true;
			} else {
				is_approval = false;
			}
			win_show();
			apply_panel.form.loadRecord(sm);
//		}
	}
//================================
	function disableButton(){
		Ext.getCmp('editButton').disable();
	
	}
	// ================审批结果保存=============

	function svaeCheck(form, win) {
		var params_up_apply = [];
		var params_up_pass = [];
		params_up_apply = Ext.zion.form.getParams(form.form, ['approve_leader','memo_leader','approval_id']);
		params_up_pass = Ext.zion.form.getParams(form.form,['approve_leader','id']);
		Ext.zion.db.getJSON("inventory.apply_approval.out_approval_leader_update", params_up_apply, function(
				data) {
			if (!data.f) {
				Ext.zion.db.getJSON("inventory.apply_approval.out_apply_pass_update", params_up_pass, function(
								data) {
							if (!data.f && data.r>0) {
								Ext.Msg.alert("提示", "提交成功");
								win.close();
								grid.store.reload();
							} else {
								Ext.Msg.alert("提示", "数据提交错误2");
							}
						});

			} else {
				Ext.Msg.alert("提示", "数据提交错误1");
			}
		});
			
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