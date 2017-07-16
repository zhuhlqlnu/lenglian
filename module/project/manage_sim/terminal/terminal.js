Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var new_add = false;
	var fields = [ "id", "model", "class_p", "type", "price_out", "price_in", "sim_id", "user_id",
			"new_date", "enable", "is_pay", "memo", "sim_number" ];
					
//
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.manage_sim.terminal.terminal_sale.selete"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["muchun.store_sim_info.select",'所有'],["muchun.store_sim_info.query.sim_number.select",'sim卡号'],["muchun.store_sim_info.query.tel_number.select",'手机号'],["muchun.store_sim_info.query.id_addr.select",'IP地址']];
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
				if(objv=="reward_system.select"){
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
	
	var id = []; // 编号
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "终端型号",
			dataIndex : 'model',
			sortable : true
		}, {
			header : "终端类型",
			dataIndex : 'type',
			sortable : true,
			renderer : function(type) {

				if (type===1) {
					return "上网卡终端";
				} else if(type===2){
					return "数传终端";
				}else{
					return "GPS终端";
				}
			}
		},{
			header : "终端性质",
			dataIndex : 'class_p',
			sortable : true,
			renderer : function(class_p) {

				if (class_p===1) {
					return "自备";
				} else if(class_p===2){
					return "年费赠送";
				}else{
					return "采购";
				}
			}
		}, {
			header : "sim卡号",
			dataIndex : 'sim_number',
			sortable : true
		}, {
			header : "是否可用",
			dataIndex : 'enable',
			sortable : true,
			renderer : function(tel_state) {
				var state ;
				if(tel_state==0){
					state = "已经生效";
				}else if(tel_state==1){
					state = "不生效";
				}
				return state;
			}
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				new_add = true;
				win_show();
			},
			scope : this
		}, '-',// '-'给工具栏按钮之间添加'|'
				{
					id : 'editButton',
					disabled:true,
					text : '修改',
					icon : Ext.zion.image_base+'/update.gif',
					tooltip : '修改记录',
					handler : function() {
						update_form();
					},
					scope : this
				}, '-', {
					text : '删除',
					id : 'deleteButton',
					disabled:true,
					icon : Ext.zion.image_base+'/delete.gif',
					tooltip : '删除记录',
					handler : delete_target,
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

	// 双击列事件
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		update_form();
	}

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------gird-form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	function win_show(value) {
		var sim_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ 'id', 'sim_number', 'tel_number' ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/project.manage_sim.sim_info_selete'
			})
		});
		var sim_combo = new Ext.form.ComboBox({
			fieldLabel : 'sim_卡号',
			valueField : 'id',
			store : sim_store,
			hiddenName : 'sim_id',
			displayField : 'sim_number',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...'
		})
		if(value){
			sim_store.loadData({r:[[value[0],value[1],'']]});
		}
		
		var terminal_type_store = new Ext.data.SimpleStore({
			fields : ['type','show_type'],
			data : [['1','现金'],['2','刷卡'],['3','支票']]
		});
		
		var terminal_type_combo = new Ext.form.ComboBox( {
			fieldLabel : '终端类型',
			valueField : 'type',
			hiddenName : 'type',
			displayField : 'show_type',
			store : terminal_type_store,
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			mode : 'local',
			triggerAction : 'all',
			emptyText : '请选择...'
		})
		
		
		var terminal_classp_store = new Ext.data.SimpleStore({
			fields : ['class_p','classp_type'],
			data : [['1','自备'],['2','年费赠送'],['3','采购']]
		});
		
		var terminal_classp_combo = new Ext.form.ComboBox( {
			fieldLabel : '终端类型',
			valueField : 'class_p',
			hiddenName : 'class_p',
			displayField : 'classp_type',
			store : terminal_classp_store,
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			mode : 'local',
			triggerAction : 'all',
			emptyText : '请选择...'
		})
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				name : 'id',
				hidden : true,
				hideLabel : true

			}, {
				fieldLabel : '终端型号',
				name : 'model',
				allowBlank : false,
				maxLength : 24,
				blankText : '不能为空'
			},terminal_type_combo,
			terminal_classp_combo,
			sim_combo, {
				xtype : "radiogroup",
				fieldLabel : '是否生效',
				anchor : '90%',
				items : [ {
					columnWidth : .48,
					checked : true,
					xtype : "radio",
					boxLabel : "不生效",
					name : "enable",
					inputValue : 1
				}, {
					columnWidth : .48,
					xtype : "radio",
					boxLabel : "生效",
					name : "enable",
					inputValue : 0
				} ]
			}, {
				xtype : 'textarea',
				fieldLabel : '备注',
				name : 'memo',
				maxLength : 128
			}]
		})
		// ----window表单----

		var win = new Ext.Window( {
			title : 'sim卡管理',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (new_add == true) {
						add_terminalForm(formPanel.getForm(), win);
					} else {
						update_terminalForm(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.hide();
				}
			} ]
		});
		win.show();
	}
	// ////////////////////////////////////////////////////////////////////////////////////
	// ----------gird操作---------
	// ////////////////////////////////////////////////////////////////////////////////////
	function add_terminalForm(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}

		var paramsP = Ext.zion.form.getParams(formPanel,['model','class_p','type','sim_id','enable','memo']);

		Ext.zion.db.getJSON("project.manage_sim.terminal_insert", paramsP,
				function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据添加成功");
						win.hide();
						formPanel.reset();
						grid.store.reload();
						Ext.getCmp('editButton').disable();
						Ext.getCmp('deleteButton').disable();
					} else {
						Ext.Msg.alert("提示", "数据添加错误");
					}
				});
	}
	// 修改操作
	function update_terminalForm(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}

		var paramsP = Ext.zion.form.getParams(formPanel,['model','class_p','type','sim_id','enable','memo','id']);
//		alert("Params::"+paramsP);
//		return null;
		Ext.zion.db.getJSON("project.manage_sim.terminal_update", paramsP,
				function(data) {
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
	function update_form() {
		new_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			win_show([sm.data.sim_id,sm.data.sim_number]);
			formPanel.form.loadRecord(sm);
		}
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

	// 删除 form
	function delete_target() {
		var id = [];
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
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
							deleNext(id);
						}
					}
				})
			}
		}
	}
	function deleNext(id) {
		if (id.length > 0) {
			Ext.zion.db.getJSON("project.manage_sim.terminal_sale.delete",
					[ id.pop() ], function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "删除失败");
						} else {
							if (data.r != 0) {
								Ext.Msg.alert("提示", "删除成功");
							} else {
								Ext.Msg.alert("提示", "删除失败");
							}
							deleNext(id);
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