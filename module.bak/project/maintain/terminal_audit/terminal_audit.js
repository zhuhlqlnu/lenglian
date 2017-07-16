Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var gps_project = false;
//	============查询条件combobox===========
	var select_data = [["project.maintain.gps_project.select",'所有'],["xxxxxxxxxx",'派工单号'],["xxxxxxxxxxxxx",'车牌号码']];
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
				if(objv=="project.maintain.gps_project.select"){
					Ext.getCmp('term').setValue('');
					Ext.getCmp('term').disable();
				}else{
					Ext.getCmp('term').enable();
				}
			
			}
		}
	});
	select_combo.setValue(select_data[0][0]);
//	============查询条件combobox===========
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "project.maintain.gps_project.select"
		},
		root : "r",
		fields : [ 'id','pgd_id', 'company', 'work_type', 'number_plates',
				'wagon_id', 'acc_status', 'gps_status', 'gps_date',
				'wagon_status', 'memo' ]
	});
	
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
		if (grid.selModel.getSelections().length != 0) {
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
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				gps_project = true;
				win_show();
			},
			scope : this
		}, '-',// '-'给工具栏按钮之间添加'|'
		{
			id : 'editButton',
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			handler : function() {
				update_form();
			},
			disabled : true,
			scope : this
		}, '-', {
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
		} ],
		// 第二个toolbar
		listeners : {
			'render' : function() {
				var tbar = new Ext.Toolbar( {
					items : [ '请根据', select_combo, {
						xtype : 'textfield',
						width : 150,
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
		var date = new Ext.form.DateField( {
			fieldLabel : 'GPS时间',
			name : 'gps_date',
			altFormats : 'Y-m-d',
			format : 'Y-m-d',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			value : new Date
		});
//==================派工单号============
		var wxpd_id_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ 'id', 'company','work_type', 'number_plates' ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/project.maintain.store_deal_order.select_pass'
			})
		});
		var wxpd_id_combo = new Ext.form.ComboBox( {
			fieldLabel : '派工单号',
			valueField : 'id',
			store : wxpd_id_store,
			hiddenName : 'pgd_id',
			displayField : 'id',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...',
			listeners : {
				'select' : function(combo,record,index){
					Ext.getCmp('work_type_id').setValue(record.get('work_type'));
					Ext.getCmp('company_id').setValue(record.get('company'));
					var temp_array = record.get('number_plates').split(',');
					car_number_data = [];
					for(var i = 0; i < temp_array.length; i++){
						car_number_data.push([temp_array[i]]);
					}

					car_number_store.loadData(car_number_data);
				
				}
			}
		})
		
		var car_number_data = [];
		
		var car_number_store = new Ext.data.SimpleStore({
			fields : ['number_plates'],
			data : car_number_data
		});
		
		var car_number_combo = new Ext.form.ComboBox( {
			fieldLabel : '车牌号码',
			valueField : 'number_plates',
			store : car_number_store,
			hiddenName : 'number_plates',
			displayField : 'number_plates',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			mode : 'local',
			emptyText : '请选择...'
		})
		
//==================派工单号============
		var work_type_data = [ [ '新装', '新装' ], [ '拆机', '拆机' ],
				[ '移机', '移机' ], [ '维护', '维护' ] ];
		var work_type_store = new Ext.data.SimpleStore( {
			fields : [ 'work_type', 'text' ],
			data : work_type_data
		});
		var work_type_combo = new Ext.form.ComboBox( {
			id : 'work_type_id',
			fieldLabel : '工作性质',
			valueField : 'work_type',
			store : work_type_store,
			hiddenName : 'work_type',
			displayField : 'text',
			mode : 'local',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...'
		});

		var acc_data = [ [ '开', '开' ], [ '关', '关' ], [ '无', '无' ] ];
		var acc_store = new Ext.data.SimpleStore( {
			fields : [ 'acc_status', 'text' ],
			data : acc_data
		});
		var acc_combo = new Ext.form.ComboBox( {
			fieldLabel : 'ACC状态',
			valueField : 'acc_status',
			store : acc_store,
			hiddenName : 'acc_status',
			displayField : 'text',
			mode : 'local',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...'
		});

		var gps_data = [ [ '定位', '定位' ], [ '不定位', '不定位' ] ];
		var gps_store = new Ext.data.SimpleStore( {
			fields : [ 'gps_status', 'text' ],
			data : gps_data
		});

		var gps_combo = new Ext.form.ComboBox( {
			fieldLabel : 'GPS状态',
			valueField : 'gps_status',
			store : gps_store,
			hiddenName : 'gps_status',
			displayField : 'text',
			mode : 'local',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...'
		});
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				name : 'id',
				id : 'id',
				hidden : true,
				hideLabel : true
			},wxpd_id_combo, {
				fieldLabel : '单位名称',
				name : 'company',
				id : 'company_id',
				readOnly : true

			},{
				fieldLabel : '工作性质',
				name : 'work_type',
				id : 'work_type_id',
				readOnly : true
			} , car_number_combo, {
				fieldLabel : '车台ID',
				allowBlank : false,
				maxLength : 16,
				name : 'wagon_id'
			}, acc_combo, gps_combo, date, {
				fieldLabel : '车台类型',
				name : 'wagon_status',
				maxLength : 512
			}, {
				fieldLabel : '备注',
				xtype : 'textarea',
				name : 'memo',
				maxLength : 512
			} ]
		})
		// ----window表单----

		var win = new Ext.Window( {
			title : '终端工作表',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (gps_project == true) {
						add_gps_project(formPanel.getForm(), win);
					} else {
						updagte_gps_project(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.close();
				}
			} ]
		});
		win.show();
	}
	// ////////////////////////////////////////////////////////////////////////////////////
	// ----------gird操作---------
	// ////////////////////////////////////////////////////////////////////////////////////
	function add_gps_project(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 增加操作
		var params = Ext.zion.form.getParams(formPanel, [ 'pgd_id', 'number_plates', 'wagon_id', 'memo',
				'acc_status', 'gps_status', 'gps_date', 'wagon_status' ])
		Ext.zion.db.getJSON("project.maintain.gps_project.insert", params,
				function(data) {
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
	// 修改操作
	function updagte_gps_project(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = Ext.zion.form.getParams(formPanel, [ 'pgd_id', 'number_plates', 'wagon_id', 'memo',
				'acc_status', 'gps_status', 'gps_date', 'wagon_status','id' ]);
		Ext.zion.db.getJSON("project.maintain.gps_project.update", params,
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
		gps_project = false;
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
		var unit = combox.getValue();
		var term = $('#term').val();
		store.filter(unit, term, true, false);
	}

	// 删除 form
	var id = [];
	function deleteForm() {
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
			Ext.zion.db.getJSON("project.maintain.gps_project.delete", [ id
					.pop() ], function(data) {
				if (data.r != 0) {
					Ext.Msg.alert("提示", "删除成功");
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				} else {
					Ext.Msg.alert("提示", "删除失败");
				}
				deleNext();
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
		}]
	});
})