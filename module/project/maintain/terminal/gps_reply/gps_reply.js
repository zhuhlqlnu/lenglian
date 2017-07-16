Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var gps_project = false;
	var fields = [ 'id','deal_order_id','gps_project_id','company','work_type','number_plates','wagon_id',
			'wagon_status','sim_number','sim_status','acc_status','gps_status','gps_time','detect_result','memo'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.gps_msg_reply"
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
		if (grid.selModel.getSelections().length > 0) {
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
		if (grid.selModel.getSelections().length > 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	
	var select_data = [["project.maintain.gps_msg_reply",'所有'],["xxxxxx",'工作性质（功能暂不能使用）'],["xxxxxxx",'车牌号码（功能暂不能使用）']];
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
				if(objv=="project.maintain.gps_msg_reply"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
	
	var id = []; // 编号
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
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
			header : "信息终端号",
			dataIndex : 'gps_project_id',
			sortable : true
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
		tbar : [{
					id : 'addButton',
					text : '新增',
					icon : Ext.zion.image_base+'/add.gif',
					tooltip : '添加新纪录',
					handler : function() {
						gps_project = true;
						win_show();
					},
					scope : this
				}, '-',{
					id : 'editButton',
					text : '修改',
					icon : Ext.zion.image_base+'/update.gif',
					tooltip : '修改记录',
					handler : function() {
						gps_project = false;
						update_form();
					},
					disabled : true,
					scope : this
				},'-', {
					id : 'deleteButton',
					text : '删除',
					icon : Ext.zion.image_base+'/delete.gif',
					tooltip : '删除记录',
					handler : deleteForm,
					disabled : true,
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
														.getURL('terminal.gps_reply.report')
												+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
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

	// 双击列事件
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		update_form();
	}

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------gird-form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function win_show() {

		var deal_order_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ 'id', 'company','work_type', 'number_plates' ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/project.maintain.deal_order_info'
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
				'select' : function(combo,record,index){
					Ext.getCmp('company_id').setValue(record.get('company'));
					Ext.getCmp('work_type_id').setValue(record.get('work_type'));

					gps_project_url.url = ZionSetting.db.url + '/' + Zion.token
									+ '/project.maintain.gps_project_info/['+record.get('id')+']';
					gps_project_store.load();
					gps_project_combo.setValue('');
				
				}
			}
		})
		
		var gps_project_url = {
			url : null
		}
		
		var gps_project_store = new Ext.data.SimpleStore({
						root : 'r',
						fields : [ 'id', 'number_plates','wagon_id', 'wagon_status' ],
						proxy : new Ext.data.ScriptTagProxy( {
							api : {
								read : gps_project_url
							}
						})
					});
		var gps_project_combo = new Ext.form.ComboBox({
			fieldLabel : '信息终端号',
			valueField : 'id',
			store : gps_project_store,
			hiddenName : 'gps_project_id',
			displayField : 'id',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...',
			listeners : {
				'select' : function(combo,record,index){
					Ext.getCmp('number_plates').setValue(record.get('number_plates'));
					Ext.getCmp('wagon_id').setValue(record.get('wagon_id'));
					Ext.getCmp('wagon_status').setValue(record.get('wagon_status'));
				}
			}
		})
		
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				id : 'id',
				name : 'id',
				hidden : true,
				hideLabel : true
			},deal_order_combo, {
				id : 'company_id',
				name : 'company',
				fieldLabel : '单位名称',
				readOnly : true
			}, {
				id : 'work_type_id',
				name : 'work_type',
				fieldLabel : '工作性质',
				readOnly : true
			}, gps_project_combo, {
				id : 'number_plates',
				name : 'number_plates',
				fieldLabel : '车牌号码',
				readOnly : true
			}, {
				id : 'wagon_id',
				name : 'wagon_id',
				fieldLabel : '车台ID',
				readOnly : true
			}, {
				id : 'wagon_status',
				name : 'wagon_status',
				fieldLabel : '车台类型',
				readOnly : true
			}, {
				fieldLabel : '数据卡号',
				name : 'sim_number',
				maxLength : 16
			}, {
				xtype : "radiogroup",
				layout : "column",
				fieldLabel : '数据卡状态',
				isFormField : true,
				anchor : '90%',
				items : [{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "开通",
					name : "sim_status",
					checked : true,
					inputValue : 1
				},{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "停机",
					name : "sim_status",
					inputValue : 2
				},{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "退网",
					name : "sim_status",
					inputValue : 3
				}]
			
			}, {
				xtype : "radiogroup",
				layout : "column",
				fieldLabel : 'ACC状态',
				isFormField : true,
				anchor : '90%',
				items : [{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "开通",
					name : "acc_status",
					checked : true,
					inputValue : 1
				},{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "停机",
					name : "acc_status",
					inputValue : 2
				},{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "退网",
					name : "acc_status",
					inputValue : 3
				}]
			
			}, {
				xtype : "radiogroup",
				layout : "column",
				fieldLabel : 'GPS状态',
				isFormField : true,
				anchor : '90%',
				items : [{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "开通",
					name : "gps_status",
					checked : true,
					inputValue : 1
				},{
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "停机",
					name : "gps_status",
					inputValue : 2
				} ]
			
			}, {
				xtype : 'datefield',
				id : 'gps_time_id',
				name : 'gps_time',
				fieldLabel : 'GPS时间',
				value : new Date(),
				format : 'Y-m-d'
			}, {
				fieldLabel : '检测结果',
				name :　'detect_result'
			}, {
				fieldLabel : '回复备注',
				xtype : 'textarea',
				name : 'memo',
				maxLength : 512
			}]
		})
		// ----window表单----
		var win = new Ext.Window( {
			title : '信息回复',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id:'save',
				handler : function() {
					if (formPanel.form.isValid() == false) {
						return false;
					}
					if (gps_project == true) {
						add_gps_project(formPanel.getForm(), win);
					} else {
						updagte_gps_project(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				id:'cancle',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		});
//		Ext.zion.form.disable(formPanel,['company','work_type', 'number_plates', 'wagon_id',
//			'acc_status', 'gps_status', 'gps_date', 'wagon_status']);
		win.show();
	}
	
	
//	===========新增加记录方法==========
	function add_gps_project(form,win){

		var params = Ext.zion.form.getParams(form,[ 'gps_project_id','sim_number','sim_status'
									,'acc_status','gps_status','gps_time','detect_result','memo']);
		
		params.splice(5,1,Ext.getCmp('gps_time_id').getValue().getTime()/1000);
		Ext.zion.db.getJSON('project.maintain.terminal.gps_msg_reply.insert',params,function(data){
			if(!data.f){
				Ext.Msg.alert('<b>提示</b>','数据插入成功！');
				grid.getStore().reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
				win.close();
				
			}else{
				Ext.Msg.alert('<b>警告</b>','数据插入错误！');
				return false;
			}
		
		},this);
	
	}

	// 修改操作
	function updagte_gps_project(form, win) {

		var params = Ext.zion.form.getParams(form,[ 'id','gps_project_id','sim_number','sim_status'
									,'acc_status','gps_status','gps_time','detect_result','memo']);
		
		params.splice(6,1,Ext.getCmp('gps_time_id').getValue().getTime()/1000);
		Ext.zion.db.getJSON('project.maintain.terminal.gps_msg_reply.update',params,function(data){
			if(!data.f){
				Ext.Msg.alert('<b>提示</b>','数据修改成功！');
				grid.getStore().reload();
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
				win.close();
				
			}else{
				Ext.Msg.alert('<b>警告</b>','数据修改错误！');
				return false;
			}
		
		},this);
	
	}
	// ----------修改window表单---------
	function update_form() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			win_show();
			formPanel.form.loadRecord(sm);
		}
	}
	// 查询form
	function selectForm() {
		Ext.Msg.alert('提示','功能未做！');
		return null;
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
		
	// 删除 form
	function deleteForm() {
		var list_id = [];
		var sm = grid.getSelectionModel().getSelections();
//		var sm_data = grid.getSelectionModel().getSelected();

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
					deleNext(list_id);
				}
			}
		})
		
	}
	var deleNext = function(list_id) {
		if (list_id.length > 0) {
			var params = [ list_id.pop() ];

			Ext.zion.db.getJSON("project.maintain.terminal.gps_reply.delete", params,
					function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "数据删除失败");
						} else {
							if (data.r != 0) {
								Ext.Msg.alert("提示", "数据删除成功");
							} else {
								Ext.Msg.alert("提示", "数据删除失败");
							}
							deleNext(list_id);
						}
					});
		} else {
			grid.store.reload();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
	}

	// grid自适应
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