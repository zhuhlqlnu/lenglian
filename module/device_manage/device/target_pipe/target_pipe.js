Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var selectCorpId;

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "device_manage.device.target_pipe.select"
		},
		root : "r",
		fields : [ 'user_id', 'user_name', 'login_name', 'terminal_id', 'terminal_sn' ]
	});
	var sm = new Ext.grid.CheckboxSelectionModel();

	var id = [];

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "用户序号",
			dataIndex : 'user_id',
			sortable : true
		}, {
			header : "用户名称",
			dataIndex : 'user_name',
			sortable : true
		}, {
			header : "登录名",
			dataIndex : 'login_name',
			sortable : true
		}, {
			header : "终端序号",
			dataIndex : 'terminal_id',
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'terminal_sn',
			sortable : true
		} ],
		tbar : [ {
			id : 'newButton',
			text : '新增',
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '新增记录',
			handler : function() {
				showDialog();
			},
			scope : this
		}, {
			id : 'editButton',
			text : '修改',
			icon : Ext.zion.image_base + '/update.gif',
			tooltip : '修改记录',
			disabled : true,
			handler : function() {
				showDialog(sm.getSelected());
			}
		}, {
			text : '删除',
			id : 'deleteButton',
			icon : Ext.zion.image_base + '/delete.gif',
			tooltip : '删除记录',
			handler : function() {
				deleteData();
			},
			scope : this,
			disabled : true
		}, {
			text : '刷新',
			icon : Ext.zion.image_base + '/refresh.gif',
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

		var user_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ {
				name : 'user_id'
			}, {
				name : 'user_name'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token + '/device_manage.device.target_pipe.bind.user/['+selectCorpId+']'
			})
		});

		var user_combo = new Ext.form.ComboBox( {
			fieldLabel : '用户名称',
			hiddenName : 'user_id',
			valueField : 'user_id',
			store : user_store,
			displayField : 'user_name',
			editable : false,
			triggerAction : 'all',
			emptyText : '请选用户...'
		});

		var terminal_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ {
				name : 'terminal_id'
			}, {
				name : 'terminal_sn'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token + '/device_manage.device.target_pipe.bind.terminal/['+selectCorpId+']'
			})
		});

		var terminal_combo = new Ext.form.ComboBox( {
			fieldLabel : '终端编号',
			hiddenName : 'terminal_id',
			valueField : 'terminal_id',
			store : terminal_store,
			displayField : 'terminal_sn',
			editable : false,
			triggerAction : 'all',
			emptyText : '请选择终端编号...'
		});

		if (record) {
			terminal_store.loadData( {
				'r' : [ [ record.data.terminal_id, record.data.terminal_sn ] ]
			});

			user_store.loadData( {
				'r' : [ [ record.data.user_id, record.data.user_name ] ]
			});

			user_combo.disable();
		}

		var formPanel = new Ext.form.FormPanel( {
			labelWidth : 65,
			frame : true,
			bodyStyle : 'padding:5px 5px 0',
			items : [ {
				layout : 'form',
				defaultType : 'textfield',
				items : [ user_combo, terminal_combo ]
			} ]
		});

		var win = new Ext.Window( {
			title : '手机终端绑定',
			width:380,
			autoWidth:false,
			closable : true,
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
			var params = Ext.zion.form.getParams(formPanel.form, [ 'terminal_id', 'user_id' ]);
			Ext.zion.db.getJSON("device_manage.device.target_pipe.bind.update", params, function(data) {
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
			var params = Ext.zion.form.getParams(formPanel.form, [ 'user_id', 'terminal_id' ]);
			Ext.zion.db.getJSON("device_manage.device.target_pipe.bind.insert", params, function(data) {
				if (data.r == 1) {
					Ext.Msg.alert("提示", "数据添加成功");
					win.close();
					grid.store.reload();
					disableButton();
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
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
						id.push(member.user_id);
					}
					var deleteNext = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("device_manage.device.target_pipe.bind.delete", [ id.pop() ], function(data) {
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

		var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				store.constructor( {
					db : {
						alias : "device_manage.device.target_pipe.select",
						params : [ selectCorpId ]
					},
					root : "r",
					fields : [ 'user_id', 'user_name', 'login_name', 'terminal_id', 'terminal_sn' ]
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
				disableButton();
				grid.store.removeAll();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		
		store.constructor( {
			db : {
				alias : "device_manage.device.target_pipe.select",
				params : [ selectCorpId ]
			},
			root : "r",
			fields : [ 'user_id', 'user_name', 'login_name', 'terminal_id', 'terminal_sn' ]
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		loadMask.hide();
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			width:250,
			split:true,
			region : 'center',
			layout : 'fit',
	    	title:'终端绑定列表',
			items :[grid]
		}]
	});

});