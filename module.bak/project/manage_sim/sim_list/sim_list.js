Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var sim_list = false;
	var fields = [ 'id', 'sim_number', 'tel_number', 'tariff_type', 'id_addr',
					'tel_number2', 'tel_state', 'start_money', 'refill_money' ,
					'sim_date','is_delete','open_user','busy_type','build_add','use_part',
					'com_people','com_type','count_type','real_count','divide_ratio'];
					
//, , , , , , , , , , , , , , , , , , ,  
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "muchun.store_sim_info.select"
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
	var sim_store = [];
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'id',
			sortable : true
		}, {
			header : "sim卡号",
			dataIndex : 'sim_number',
			sortable : true
		}, {
			header : "手机号",
			dataIndex : 'tel_number',
			sortable : true
		}, {
			header : "资费类型",
			dataIndex : 'tariff_type',
			sortable : true,
			renderer : function(tariff_type) {
				for( var i = 0; i < sim_store.length; i++){
					if(tariff_type==sim_store[i][1]){
						return sim_store[i][2];
					}
				}
				return "类型不存在";
			}
		}, {
			header : "使用单位",
			dataIndex : 'use_part',
			sortable : true
		}, {
			header : "状态",
			dataIndex : 'tel_state',
			sortable : true,
			renderer : function(tel_state) {
//				var state = tel_state == 0 ? "停机" : (tel_state == 1 ? "开机" ："退网");
				var state ;
				if(tel_state==0){
					state = "停机";
				}else if(tel_state==1){
					state = "开机";
				}else {
					state = "退网";
				}
				return state;
			}
		}, {
			header : "开户费",
			dataIndex : 'start_money',
			sortable : true
		}, {
			header : "续费金额",
			dataIndex : 'refill_money',
			sortable : true
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				sim_list = true;
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
//================加载sim卡数据=================
				Ext.zion.db.getJSON("project.manage_sim.sim_list_load",null,function(data){
					if(data.r){
						sim_store = data.r;
					}else{
						Ext.Msg.alert("警告","数据加载失败！");
					}
				
				},this);
				
				

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
	function win_show(tariff_value) {
		var tariff_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ 'id', 'tariff_type', 'details_info' ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_tariff.select'
			})
		});
		var tariff_combo = new Ext.form.ComboBox( {
			fieldLabel : '资费类型',
			valueField : 'tariff_type',
			store : tariff_store,
			hiddenName : 'tariff_type',
			displayField : 'details_info',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...'
		})
		
		if(tariff_value!=null){
			tariff_store.loadData({r:[['',tariff_value[0],tariff_value[1]]]})
		}
		
		var busy_type_store = new Ext.data.SimpleStore({
			data : [[1,'GPRS数传'],[2,'GPRS办公'],[3,'GPRS之GPS应用'],[4,'CDMA数传'],[5,'CDMA办公']],
			fields : ['busy_type','show_type']
		});
		
		var busy_type_combo = new Ext.form.ComboBox({
			fieldLabel : '业务类型',
			valueField : 'busy_type',
			store : busy_type_store,
			hiddenName : 'busy_type',
			displayField : 'show_type',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			mode : 'local',
			triggerAction : 'local',
			emptyText : '请选择...'
		})
		
		var count_type_store = new Ext.data.SimpleStore({
			fields : ['count_type','show_type'],
			data : [['1','现金'],['2','刷卡'],['3','支票']]
		});
		
		var count_type_combo = new Ext.form.ComboBox( {
			fieldLabel : '结算方式',
			valueField : 'count_type',
			hiddenName : 'count_type',
			displayField : 'show_type',
			store : count_type_store,
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
				fieldLabel : 'sim卡号',
				name : 'sim_number',
				maxLength : 16,
				allowBlank : false,
				blankText : '不能为空'

			}, {
				fieldLabel : '手机号',
				name : 'tel_number',
				allowBlank : false,
				maxLength : 16,
				blankText : '不能为空'
			}, {
				fieldLabel : 'ip地址',
				allowBlank : true,
				maxLength : 16,
				name : 'id_addr'
			}, tariff_combo, {
				xtype : "radiogroup",
				fieldLabel : '状态',
				anchor : '90%',
				items : [ {
					columnWidth : .33,
					checked : true,
					xtype : "radio",
					boxLabel : "开机",
					name : "tel_state",
					inputValue : "1"
				}, {
					columnWidth : .33,
					xtype : "radio",
					boxLabel : "停机",
					name : "tel_state",
					inputValue : "0"
				}, {
					columnWidth : .33,
					xtype : "radio",
					boxLabel : "退网",
					name : "tel_state",
					inputValue : "-1"
				} ]
			}, {
				fieldLabel : '开户名',
				allowBlank : true,
				maxLength : 16,
				name : 'open_user'
			},busy_type_combo, {
				fieldLabel : '安装地点',
				allowBlank : true,
				maxLength : 16,
				name : 'build_add'
			}, {
				fieldLabel : '使用单位',
				allowBlank : true,
				maxLength : 16,
				name : 'use_part'
			}, {
				fieldLabel : '开户费',
				name : 'start_money',
				maxLength : 16
			}, {
				fieldLabel : '续费金额',
				name : 'refill_money',
				maxLength : 16
			}, {
				fieldLabel : '实际结算',
				name : 'real_count',
				maxLength : 16
			}, {
				fieldLabel : '分成比例-%',
				name : 'divide_ratio',
				regex : /^[0-9]{0,2}$/ ,
				regexText : '输入值是两位数字'
				
			},count_type_combo, {
				fieldLabel : '联系人',
				allowBlank : true,
				maxLength : 16,
				name : 'com_people'
			}, {
				fieldLabel : '联系方式',
				allowBlank : true,
				maxLength : 16,
				name : 'com_type'
			}, {
				fieldLabel : 'ID',
				name : 'id',
				hideLabel : true,
				hidden : true
			} ]
		})
		// ----window表单----

		var win = new Ext.Window( {
			title : 'sim卡管理',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (sim_list == true) {
						add_sim_list(formPanel.getForm(), win);
					} else {
						updagte_sim_list(formPanel.getForm(), win);
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
	function add_sim_list(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}

		var paramsP = Ext.zion.form.getParams(formPanel,['sim_number','tel_number','tariff_type','id_addr','tel_state',
					'start_money','refill_money','open_user','busy_type','build_add','use_part','com_people','com_type',
					'count_type','real_count','divide_ratio']);
//		alert("Params::"+paramsP);
//		return null;
		Ext.zion.db.getJSON("muchun.store_sim_info.insert", paramsP,
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
	function updagte_sim_list(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}

		var paramsP = Ext.zion.form.getParams(formPanel,['sim_number','tel_number','tariff_type','id_addr','tel_state',
					'start_money','refill_money','open_user','busy_type','build_add','use_part','com_people','com_type',
					'count_type','real_count','divide_ratio','id']);
//		alert("Params::"+paramsP);
		Ext.zion.db.getJSON("muchun.store_sim_info.update", paramsP,
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
		sim_list = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			
			for( var i = 0; i < sim_store.length; i++){
				if(sm.data.tariff_type==sim_store[i][1]){
					win_show([sim_store[i][1],sim_store[i][2]]);
				}
			}
//			win_show();
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
	var id = [];
	function delete_target() {
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
							deleNext();
						}
					}
				})
			}
		}
	}
	var deleNext = function() {
		if (id.length > 0) {
			Ext.zion.db.getJSON("muchun.store_sim_info.delete",
					[ id.pop() ], function(data) {
						if (data.f) {
							Ext.Msg.alert("提示", "删除失败");
						} else {
							if (data.r != 0) {
								Ext.Msg.alert("提示", "删除成功");
								Ext.getCmp('editButton').disable();
								Ext.getCmp('deleteButton').disable();
							} else {
								Ext.Msg.alert("提示", "删除失败");
							}
							deleNext();
						}
					});
		} else {
			grid.store.reload();
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