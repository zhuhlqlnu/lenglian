Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 编号
	var formPanel;
	var dispatch_list = false;
	var fields = ['id','work_type','work_content','company', 'address_company', 'telphone', 'contact','mobile','number_plates', 'vehicle_type','team_name', 'dispatch_memo','approve' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "dispatch_list.select"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["dispatch_list.select",'所有'],["dispatch_list.select.query.work_type",'工作性质'],["dispatch_list.select.query.contact",'联系人']];
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
				if(objv=="dispatch_list.select"){
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
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (grid.selModel.getSelections().length !=0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true,
			renderer:function(id){
				return "WXDD"+id;
			}
		},{
			header : "是否撤销",
			dataIndex : 'approve',
			sortable : true,
			renderer:function(approve){
				return approve==1?"执行":"撤销";
			}
		}, {
			header : "工作性质",
			dataIndex : 'work_type',
			sortable : true
		}, {
			header : "工作内容",
			dataIndex : 'work_content',
			sortable : true
		}, {
			header : "单位名称",
			dataIndex : 'company',
			sortable : true
		}, {
			header : "单位地址",
			dataIndex : 'address_company',
			sortable : true
		},{
			header : "联系人",
			dataIndex : 'contact',
			sortable : true
		}, {
			header : "固定电话",
			dataIndex : 'telphone',
			sortable : true
		}, {
			header : "手机号码",
			dataIndex : 'mobile',
			sortable : true
		}, {
			header : "车牌号码",
			dataIndex : 'number_plates',
			sortable : true
		}, {
			header : "目标类型",
			dataIndex : 'vehicle_type',
			sortable : true
		},{
			header : "备注",
			dataIndex : 'dispatch_memo',
			sortable : true
		} ],
		height:400,
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				dispatch_list = true;
				dispatch_list_show();
			},
			scope : this
		}, '-', {
			id : 'editButton',
			text : '修改',
			disabled:true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : function() {
				updateForm();
			},
			scope : this
		}, '-', {
			id : 'deleteButton',
			text : '撤销',
			disabled:true,
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '撤销记录',
			handler : deleteForm,
			scope : this
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
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
	})

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function dispatch_list_show() {
		var work_type_data = [ [ '新装', '新装' ], [ '移机', '移机' ],
		   					[ '停机', '停机' ], [ '维护', '维护' ] ];
		var work_type_store = new Ext.data.SimpleStore( {
			fields : [ 'work_type', 'text' ],
			data : work_type_data
		});
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
			triggerAction : 'all'
		});
		
		formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			items : [work_type_combox, {
				fieldLabel : '工作内容',
				name : 'work_content',
				allowBlank : false,
				blankText : '不能为空',
				maxLength:512
			}, {
				fieldLabel : '单位名称',
				allowBlank : false,
				blankText : '不能为空',
				name : 'company',
				maxLength:32
			}, {
				fieldLabel : '单位地址',
				name : 'address_company',
				allowBlank : false,
				blankText : '不能为空',
				maxLength:64
			}, {
				fieldLabel : '电话',
				name : 'telphone',
				maxLength:16
			}, {
				fieldLabel : '联系人',
				name : 'contact',
				maxLength:32
			}, {
				fieldLabel : '手机',
				name : 'mobile',
				maxLength:16
			}, {
				xtype : 'textarea',
				fieldLabel : '车牌号码',
				maxLength:512,
				name : 'number_plates',
				emptyText : '请输入车牌号，间隔符：“,”(英文模式)',
//				regex : /^[\u4e00-\u9fa5][a-zA-Z][a-zA-Z_0-9]{4}[a-zA-Z_0-9_\u4e00-\u9fa5]?[[,][\u4e00-\u9fa5][a-zA-Z][a-zA-Z_0-9]{4}[a-zA-Z_0-9_\u4e00-\u9fa5]?]*$/,
				regexText : '您输入的车牌号，不符合格式'
			}, {
				fieldLabel : '目标类型',
				maxLength:512,
				name : 'vehicle_type'
			}, {
				fieldLabel : '备注',
				maxLength:512,
				xtype:'textarea',
				name : 'dispatch_memo'
			}, {
				fieldLabel : 'ID',
				name : 'id',
				hideLabel : true,
				hidden : true
			}]
		})
		// ----window表单----
		win = new Ext.Window( {
			title : '派工单信息',
			closable : true,
			closeAction:'close',
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (dispatch_list) {
						add_dispatch_list(formPanel.getForm(), win);
					} else {
						update_dispatch_list(formPanel.getForm(), win)
					}
				}
			}, {
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
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
	function add_dispatch_list(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [ 'work_type', 'work_content',
		                     				'company', 'address_company', 'telphone', 'contact',
		                    				'mobile', 'number_plates', 'vehicle_type','dispatch_memo' ]);
		Ext.zion.db.getJSON("dispatch_list.insert", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
	}
	function update_dispatch_list(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel,
				[ 'work_type', 'work_content',
   				'company', 'address_company', 'telphone', 'contact',
				'mobile', 'number_plates', 'vehicle_type','dispatch_memo','id' ]);

		Ext.zion.db.getJSON("dispatch_list.update", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据修改成功");
				win.close();
				grid.store.reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			} else {
				Ext.Msg.alert("提示", "数据修改错误");
			}
		});
	}
	// ----------修改window表单---------
	function updateForm() {
		dispatch_list = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		dispatch_list_show();
		formPanel.form.loadRecord(sm);
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
		Ext.getCmp('deleteButton').disable();
	}

	// 撤销 form
	var id = [];
	function deleteForm() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('撤销确认', '你是否确认撤销选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push(member.id);
						} else {
							store.remove(store.getAt(i));
						}
					}
					if (id.length > 0) {
						deleNext();
					}
				}
			})
		}
	}
	var deleNext = function() {
		if (id.length > 0) {
			Ext.zion.db.getJSON("dispatch_list.cancell", [ id.pop() ],
					function(data) {
						if (data.r !=0 && data.r) {
							Ext.Msg.alert("提示", "撤销成功");
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						} else {
							Ext.Msg.alert("提示", "撤销失败");
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						}
						deleNext();
					});
		} else {
			grid.store.reload();
		}
	}
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
	}
	// /////////////////////////////////////////////////////////////////////////////////////////
	var approve_combo;
	var customer_data = false;
	var is_enable =false;
	var deal_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "dispatch.dispatch_deal_order.select"
		},
		root : "r",
		fields : [ 'deal_id', 'deal_list_type', 'deal_customer_name', 'deal_com_telphone',
				'deal_project_name', 'deal_project_caption', 'deal_deal_amount', 'deal_deal_basis',
				'deal_count_way', 'deal_tariff_condition', 'deal_payment_money',
				'deal_payment_caption', 'deal_payment_condition', 'deal_project_leader',
				'deal_memo', 'deal_approve', 'deal_comments','deal_version','deal_enable' ]
	});
	var deal_sm = new Ext.grid.CheckboxSelectionModel();
	
	deal_sm.on('rowselect', function() {
		if (deal_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('dealEditButton').enable();
		} else {
			Ext.getCmp('dealEditButton').disable();
		}
	})
	deal_sm.on('rowdeselect', function() {
		if (deal_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('dealEditButton').enable();
		} else {
			Ext.getCmp('dealEditButton').disable();
		}
	})
	var deal_grid = new Ext.grid.GridPanel( {
		store : deal_store,
		sm : deal_sm,
		columns : [
				sm,
				{
					header : "派工单编号",
					dataIndex : 'deal_id',
					sortable : true,
					renderer:function(deal_id){
					 return "WXPD"+deal_id;
					}
				}, {
					header : "是否撤销",
					dataIndex : 'deal_enable',
					sortable : true,
					renderer:function(deal_enable){
						return deal_enable==0?"接收":"撤销";
					}
				},{
					header : "业务性质",
					dataIndex : 'deal_list_type',
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
					dataIndex : 'deal_customer_name',
					sortable : true,
					renderer : function(customer_name) {
						return customer_data_info_data[customer_name][2] + "("
								+ customer_data_info_data[customer_name][1]
								+ ")";
					}
				}, {
					header : "联系电话",
					dataIndex : 'deal_com_telphone',
					sortable : true
				}, {
					header : "项目名称",
					dataIndex : 'deal_project_name',
					sortable : true
				}, {
					header : "项目说明",
					dataIndex : 'deal_project_caption',
					sortable : true
				}, {
					header : "受理数量",
					dataIndex : 'deal_deal_amount',
					sortable : true
				}, {
					header : "受理依据",
					dataIndex : 'deal_deal_basis',
					sortable : true
				}, {
					header : "结算方式",
					dataIndex : 'deal_count_way',
					sortable : true
				}, {
					header : "资费情况",
					dataIndex : 'deal_tariff_condition',
					sortable : true
				}, {
					header : "缴费金额",
					dataIndex : 'deal_payment_money',
					sortable : true
				}, {
					header : "缴费说明",
					dataIndex : 'deal_payment_caption',
					sortable : true
				}, {
					header : "结算情况",
					dataIndex : 'deal_payment_condition',
					sortable : true,
					renderer : function(payment_condition) {
						var condition = payment_condition == 0 ? "未结算" : "已结算";
						return condition;
					}
				}, {
					header : "工程负责人",
					dataIndex : 'deal_project_leader',
					sortable : true
				}, {
					header : "审核员备注",
					dataIndex : 'deal_memo',
					disabled:true,
					sortable : true
				}, {
					header : "审批",
					dataIndex : 'deal_approve',
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
					dataIndex : 'deal_comments',
					sortable : true
				} ],
		tbar : [ {
			id : 'dealEditButton',
			text : '撤销受理派工',
			disabled : true,
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '审核受理派工',
			handler : function() {
				update_deal_Form();
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
												.getURL('dispatch.dispatch_deal_order.report')
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			},
			scope : this
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ {
						xtype : 'textfield',
						width : 150,
						id : 'term_deal'
					}, {
						text : '查询',
						icon : Ext.zion.image_base+'/select.gif',
						handler : select_deal_order_form
					} ]
				})
			//	tbar.render(this.tbar);

			}
		},
		bbar : new Ext.PagingToolbar( {
			store : deal_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
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
		Ext.getCmp('deleteButton').disable();
	}
	// grid自适应
	var view = new Ext.Viewport( {
		layout : 'vbox',
		layoutConfig : {
			align : 'stretch',
			pack : 'start'
		},
		collapsible : true,
		split : true,
		width : 210,
		minSize : 100,
		maxSize : 250,
		items : [ {
			xtype : 'panel',
			title : '己填调度单',
			layout : 'fit',
			flex : 1,
			items : [ grid ]
		}, {
			xtype : 'panel',
			title : '受理调度单',
			layout : 'fit',
			flex : 1,
			items : [ deal_grid ]
		} ]
	});
	
})