Ext.onReady(function() {
	Ext.QuickTips.init();
	var id = []; // 编号
	var addForm = false;
	var dispatch_list = false;
	var fields = [ 'id','pgd_id', 'company', 'work_type', 'number_plates',
					'wagon_id', 'acc_status', 'gps_status', 'gps_date',
					'wagon_status', 'memo','approve','approve_memo' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.gps_project_approve.select"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["project.maintain.data.deal_order_passed",'所有'],["xxxxxxx",'派工单号（功能暂不能使用）'],["xxxxxxxx",'单位名称（功能暂不能使用）']];
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
			var gps_project_id = grid.getSelectionModel().getSelected().get('id');
			deal_grid.store.constructor({
				db : {
				alias : 'project.maintain.gps_msg_reply.search',
				params : [ gps_project_id ]
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
//			Ext.getCmp('addButton').disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
//			Ext.getCmp('addButton').enable();
		} else {
//			Ext.getCmp('addButton').disable();
		}
	})
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [ sm, {
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
		tbar : [{
			id : 'addButton',
			text : '生成完工单',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '生成完工单',
			disabled : false,
			handler : function() {
				addForm = true;
				win_show();
			},scope : this},'-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新纪录',
			handler : function() {
				grid.store.reload();
			},
			scope : this
		}],
		
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
	function win_show() {
		var deal_order_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ 'id', 'work_type', 'work_content', 'company', 'address_company', 'contact', 'telphone', 'mobile' ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/project.maintain.data.deal_order_using'
			})
		});
		var deal_order_combo = new Ext.form.ComboBox({
			fieldLabel : '派工单号',
			valueField : 'id',
			store : deal_order_store,
			hiddenName : 'deal_order_id',
			displayField : 'id',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...',
			listeners : {
				'select' : function(combo, record, index ){
					Ext.getCmp('work_type').setValue(record.get('work_type'));
					Ext.getCmp('work_content').setValue(record.get('work_content'));
					Ext.getCmp('company').setValue(record.get('company'));
					Ext.getCmp('address_company').setValue(record.get('address_company'));
					Ext.getCmp('telphone').setValue(record.get('telphone'));
					Ext.getCmp('contact').setValue(record.get('contact'));
					Ext.getCmp('mobile').setValue(record.get('mobile'));
				
				}
			}
		})

		var formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			items : [deal_order_combo, {
				fieldLabel : '工作性质',
				name : 'work_type',
				id : 'work_type',
				readOnly : true
			}, {
				fieldLabel : '工作内容',
				name : 'work_content',
				id : 'work_content',
				readOnly : true
			}, {
				fieldLabel : '单位名称',
				name : 'company',
				id : 'company',
				readOnly : true
			}, {
				fieldLabel : '单位地址',
				name : 'address_company',
				id : 'address_company',
				readOnly : true
			}, {
				fieldLabel : '单位电话',
				name : 'telphone',
				id : 'telphone',
				readOnly : true
			}, {
				fieldLabel : '联系人',
				name : 'contact',
				id : 'contact',
				readOnly : true
			}, {
				fieldLabel : '手机',
				name : 'mobile',
				id : 'mobile',
				readOnly : true
			}]
		})
		// ----window表单----
		var win = new Ext.Window( {
			title : '完工单信息',
			closable : true,
			closeAction:'close',
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (addForm) {
						add_finish_data(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		})
		win.show();
	}

	function add_finish_data(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [ 'deal_order_id' ]);
		Ext.zion.db.getJSON("project.maintain.data.finish_order.insert", params, function(
				data) {
			if (data.r == 1) {
				Ext.zion.db.getJSON("project.maintain.data.deal_order.finish_update", params, function(
						data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据添加成功");
						win.close();
						grid.store.reload();
					} else {
						Ext.Msg.alert("提示", "数据添加错误");
					}
				});
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
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
		Ext.getCmp('addButton').disable();
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
							Ext.getCmp('addButton').disable();
						} else {
							Ext.Msg.alert("提示", "撤销失败");
							Ext.getCmp('addButton').disable();
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
//	var approve_combo;
//	var customer_data = false;
//	var is_enable =false;
	var deal_info = [ 'id','deal_order_id','gps_project_id','company','work_type','number_plates','wagon_id',
			'wagon_status','sim_number','sim_status','acc_status','gps_status','gps_time','detect_result','memo'];
	var deal_store = new Ext.zion.db.ArrayStore({
		db : {
			alias : "project.maintain.gps_msg_reply.search",
			params : [-1]
		},
		root : "r",
		fields : deal_info
	});

	var deal_grid = new Ext.grid.GridPanel( {
		autoHeight : false,
		height : 360,
		autoScroll : true,
		store : deal_store,
		columns : [{
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "派工单号",
			dataIndex : 'deal_order_id',
			sortable : true,
			renderer: function(value){
				if(value!='WXDD'&&value!=null){
					return ''+value;
				}else{
					return 'null';
				}
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
			header : "车台类型",
			dataIndex : 'wagon_status',
			sortable : true
		}, {
			header : "数据卡号",
			dataIndex : 'sim_number',
			sortable : true
		}, {
			header : "数据卡状态",
			dataIndex : 'sim_status',
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
			dataIndex : 'gps_time',
			sortable : true
		}, {
			header : "检测结果",
			dataIndex : 'detect_result',
			sortable : true
		}, {
			header : "回复备注",
			dataIndex : 'memo',
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
		autoHeight : true,
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
//				Ext.getCmp('dealEditButton').disable();
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
		Ext.getCmp('addButton').disable();
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