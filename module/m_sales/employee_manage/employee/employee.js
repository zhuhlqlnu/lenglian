Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "pipe.management.employee.select"
		},
		root : "r",
		fields : [ 'att_id', 'att_name', 'target_id', 'target_name', 'dev_id', 'dev_sn', 'status', 'phone_number','month_salary', 'over_speed' ]
	});
	var sm = new Ext.grid.CheckboxSelectionModel();

	var id = [];

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "编号",
			dataIndex : 'att_id',
			sortable : true
		}, {
			header : "姓名",//原来的员工===现在的目标车辆===巡线员
			dataIndex : 'target_name',
			sortable : true
		}, {
			header : "手机号",
			dataIndex : 'phone_number',
			sortable : true
		}, {
			header : "月薪水",
			dataIndex : 'month_salary',
			sortable : true
		}, {
			header : "终端序列号",
			dataIndex : 'dev_sn',
			sortable : true
		}, {
			header : "速度限制(公里/小时)",
			dataIndex : 'over_speed',
			sortable : true
		}, {
			header : "是否生效",
			dataIndex : 'status',
			sortable : true,
			renderer : function(status) {
				if (status == 0) {
					return "否";
				} else if (status == 1) {
					return "是";
				}
			}
		} ],
		tbar : [ {
			id : 'newButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '新增记录',
			handler : function() {
				showDialog();
			},
			scope : this
		}, '-', {
			id : 'editButton',
			text : '修改',
			icon : Ext.zion.image_base+'/update.gif',
			tooltip : '修改记录',
			disabled : true,
			handler : function() {
				showDialog(sm.getSelected());
			}
		}, '-', {
			text : '删除',
			id : 'deleteButton',
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除记录',
			handler : function() {
				deleteData();
			},
			scope : this,
			disabled : true
		}, '-', {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新记录',
			handler : function() {
				grid.store.reload();
			},
			scope : this
		} ]

		,
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true
		}
	});

	store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});

	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

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
	grid.addListener('rowdblclick', function(grid, index, e) {
		showDialog(sm.getSelected());
	});

	function showDialog(record) {

		var target_store = new Ext.data.SimpleStore( {
			autoLoad : true,
			root : 'r',
			fields : [ {
				name : 'target_id'
			}, {
				name : 'target_name'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.employee.target.select'
			})
		});
		var target_combo = new Ext.form.ComboBox( {
			fieldLabel : '员工姓名',//原来的目标车辆
			valueField : 'target_id',
			store : target_store,
			hiddenName: 'target_id',
			displayField : 'target_name',
			allowBlank : false,
			editable : true,
			typeAhead : true,// 设置true，完成自动提示
			mode : 'local', // 设置local，combox将从本地加载数据
			triggerAction : 'all',// 触发此表单域时,查询所有
			selectOnFocus : true,
			forceSelection : true,
			emptyText : '请选择员工...'
		});
		if(record){
			target_store.loadData({'r':[[record.data.target_id,record.data.target_name]]});
		}
		var formPanel = new Ext.form.FormPanel( {
			labelWidth : 65,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			items : [ {
				layout : 'form',
				defaultType : 'textfield',
				items : [ {
					name : 'att_id',
					hideLabel : true,
					hidden : true
				},target_combo, {
					fieldLabel : '手机号',
					name : 'phone_number'
				}, {
					fieldLabel : '月薪水',
					name : 'month_salary',
					regex : /^\d{0,8}(\.\d{0,2})?$/,
					regexText : '输入数字,最多两位小数!'
				}, {
					fieldLabel : '终端编号',
					name : 'dev_id',
					hideLabel : true,
					hidden : true
				}, {
					fieldLabel : '终端序列号',
					name : 'dev_sn'
				}, {
					fieldLabel : '速度限制',
					name : 'over_speed'
				}, {
					xtype : 'radiogroup',
					fieldLabel : '是否生效',
					id : 'status',
					items : [ {
						boxLabel : '是',
						name : 'status',
						inputValue : 1,
						checked : true
					}, {
						boxLabel : '否',
						name : 'status',
						inputValue : 0
					} ]
				} ]
			} ]
		});

		var win = new Ext.Window( {
			title : '人员管理',
			closable : true,
			autoWidth : true,
			autoHeight : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				id : 'save',
				handler : function() {
					if (record) {
						updateData(formPanel, win);
					} else {
						insertData(formPanel, win);
					}
				}
			}, {
				id : 'cancle',
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		})
		win.show();
		if (record) {
			formPanel.form.loadRecord(record);
		}

	}

	function updateData(formPanel, win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			var params = Ext.zion.form.getParams(formPanel.form, [ 'target_id' ,'dev_id', 'status', 'phone_number','month_salary', 'over_speed', 'att_id' ]);
			Ext.zion.db.getJSON("pipe.management.employee.update", params, function(data) {
				if (data.r == 1) {
					Ext.Msg.alert("提示", "数据修改成功");
					win.close();
					grid.store.reload();
					disableButton();
				} else {
					Ext.Msg.alert("提示", "数据修改错误");
				}
			});
		}
	}

	function insertData(formPanel, win) {
		if (formPanel.getForm().isValid() == false) {
			return false;
		} else {
			Ext.zion.db.getJSON("pipe.management.employee.next_id", null, function(data) {
				var params = Ext.zion.form.getParams(formPanel.form, [ 'target_id' , 'dev_id', 'status', 'phone_number','month_salary', 'over_speed' ]);
				params.unshift(data.r[0][0]);
				// (att_id, att_name, dev_id, status, phone_number, over_speed)
					Ext.zion.db.getJSON("pipe.management.employee.insert", params, function(data) {
						if (data.r == 1) {
							Ext.Msg.alert("提示", "数据添加成功");
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
				});
		}
	}

	function deleteData() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var id = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.att_id);
					}
					var deleteNext = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("pipe.management.employee.delete", [ id.pop() ], function(data) {
								deleteNext(id);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							grid.store.reload();
							disableButton();
						}
					};
					deleteNext(id);
				}
			})
		}
	}

	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});

	loadMask.hide();
});