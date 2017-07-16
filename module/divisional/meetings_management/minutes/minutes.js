Ext.onReady(function() {
	Ext.QuickTips.init();
	var store_minutes = false;
	var fields = [ 'id', 'participants', 'meeting_name', 'meeting_date','metting_content', 'memo' ];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "store_minutes.select"
		},
		root : "r",
		fields : fields
	});
	
	var select_data = [["store_minutes.select",'所有'],["store_minutes.query.meeting_name",'会议名称'],["store_minutes.query.participants","参加人"]];
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
				if(objv=="store_minutes.select"){
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
		autoScroll : true,
		columns : [ sm,{
			header : "编号",
			dataIndex : 'id',
			width : 50,
			sortable : true
		}, {
			header : "参加人",
			width : 100,
			dataIndex : 'participants',
			sortable : true
		}, {
			header : "会议名称",
			width : 50,
			dataIndex : 'meeting_name',
			sortable : true
		}, {
			header : "会议时间",
			width : 70,
			dataIndex : 'meeting_date',
			sortable : true
		}, {
			header : "会议内容",
			dataIndex : 'metting_content',
			width : 400,
			sortable : true
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true
		}],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base+'/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				store_minutes = true;
				store_minutes_show();
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
			text : '删除',
			id : 'deleteButton',
			disabled:true,
			icon : Ext.zion.image_base+'/delete.gif',
			tooltip : '删除记录',
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
												.getURL('meetings_management.minutes.report')
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			},
			scope : this
		}  ],
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
	meeting_inform_data = [];
	Zion.db.getJSON("meetings_inform_content.select", null, function(data) {
		meeting_inform_data =data.r;
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		})
	});

	/////////////////////////////////////////////////////////////////////////////////////
	// ----------form表单---------
	function store_minutes_show() {
		var meeting_inform_store = new Ext.data.SimpleStore( {
			fields : [ 'meeting_inform_id','participants','meeting_name', 'meeting_date' ],
			data:meeting_inform_data
		});
		var meeting_inform_combo = new Ext.form.ComboBox( {
			fieldLabel : '会议名称',
			valueField : 'meeting_name',
			store : meeting_inform_store,
			hiddenName: 'meeting_name',
			displayField : 'meeting_name',
			mode : 'local',
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			triggerAction : 'all',
			emptyText : '请选择...',
			listeners : {
				'select' : function(meeting_inform_combo, record, index) {
					formPanel.getForm().findField("meeting_inform_id").setValue(meeting_inform_data[index][0]);
					formPanel.getForm().findField("participants").setValue(meeting_inform_data[index][1]);
					formPanel.getForm().findField("meeting_date").setValue(meeting_inform_data[index][3]);
				}
			}
		});
		formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			items : [  meeting_inform_combo,{
				fieldLabel : '参加人',
				xtype:'textarea',
				name : 'participants',
				disabled:true,
				emptyText:'请根据会议名称选择..' 	
			}, {
				fieldLabel : '会议时间',
				name : 'meeting_date',
				disabled:true,
				emptyText:'请根据会议名称选择..'
			}, {
				fieldLabel : '会议内容',
				name : 'metting_content',
				xtype : 'textarea',
				maxLength:512
			}, {
				fieldLabel : '备注',
				xtype : 'textarea',
				maxLength:512,
				name : 'memo'
			}, {
				fieldLabel : 'ID',
				name : 'id',
				hideLabel : true,
				hidden : true
			}, {
				fieldLabel : '会议ID',
				name : 'meeting_inform_id',
				hideLabel : true,
				hidden : true
			} ]
		})
		// ----window表单----
		win = new Ext.Window( {
			title : '会议记录',
			closable : true,
			resizable : false,
			closeAction:'close',
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (store_minutes) {
						add_store_minutes(formPanel.getForm(), win);
					} else {
						update_staff_reminded(formPanel.getForm(), win)
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
	function add_store_minutes(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel, [  'participants', 'meeting_name', 'meeting_date','metting_content', 'memo','meeting_inform_id' ]);
		Ext.zion.db.getJSON("store_minutes.insert", params, function(
				data) {
			if (data.r == 1) {
				Ext.Msg.alert("提示", "数据添加成功");
				win.close();
				history.go(0);
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
	}
	function update_staff_reminded(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params = getParams(formPanel,
				[ 'participants', 'meeting_name', 'meeting_date','metting_content', 'memo', 'id' ]);
		Ext.zion.db.getJSON("store_minutes.update", params, function(
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
		store_minutes = false;
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		if (!sm) {
			Ext.Msg.alert("修改操作", "请选择要修改的项");
		} else if (sm_num > 1) {
			Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
		} else {
			store_minutes_show();
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
			Ext.zion.db.getJSON("store_minutes.delete", [ id.pop() ],
					function(data) {
						if (data.r == 1) {
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
	grid.addListener('rowdblclick', updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e) {
		updateForm();
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
