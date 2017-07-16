Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var target_add = false;
	var ord_terminal_id;
	var terminal_combo;
	var id = [];
	var store_sql = "axiom_target.select";
	var fields = [ 'target_id', 'target_name', 'terminal_id', 'terminal_sn', 'enable', 'corp_id' ];

	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql,
			params : [ selectCorpId ]
		},
		root : "r",
		fields : fields
	});
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		var length = grid.selModel.getSelections().length;
		if (length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (length > 0) {
			Ext.getCmp('deleteButton').enable();
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
		}
	})
	sm.on('rowdeselect', function() {
		var length = grid.selModel.getSelections().length;
		if (length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
		if (length > 0) {
			Ext.getCmp('deleteButton').enable();
			Ext.getCmp('relegateButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
			Ext.getCmp('relegateButton').disable();
		}
	})

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'target_id',
			width : 50,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'target_name',
			width : 50,
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 50,
			sortable : true
		}, {
			header : "是否生效",
			dataIndex : 'enable',
			width : 50,
			sortable : true,
			renderer : function(str) {
				var re_str = '';
				if (1 == str) {
					re_str = '生效';
				} else {
					re_str = '不生效';
				}
				return re_str;

			}
		} ],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				target_add = true;
				win_show();
			},
			scope : this
		},// '-'给工具栏按钮之间添加'|'
				{
					id : 'editButton',
					disabled : true,
					text : '修改',
					icon : Ext.zion.image_base + '/update.gif',
					tooltip : '修改记录',
					handler : function() {
						update_form();
					},
					scope : this
				}, {
					id : 'deleteButton',
					disabled : true,
					text : '删除',
					icon : Ext.zion.image_base + '/delete.gif',
					tooltip : '删除记录',
					handler : delete_target,
					scope : this
				}, {
					id : 'relegateButton',
					text : '迁移',
					disabled : true,
					icon : Ext.zion.image_base + '/relegate.gif',
					tooltip : '迁移纪录',
					handler : function() {
						var targets = [];
						var sm = grid.getSelectionModel().getSelections();
						for ( var i = 0; i < sm.length; i += 1) {
							targets.push(sm[i].data.target_id);
						}
						relegateTarget(targets, function() {
							grid.store.reload();
							disableButton();
						});
					},
					scope : this
				}, {
					text : '刷新',
					icon : Ext.zion.image_base + '/refresh.gif',
					tooltip : '刷新纪录',
					handler : function() {
						grid.store.reload();
						disableButton();
					},
					scope : this
				} ],
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

	grid.addListener('rowdblclick', updateGridRowClick);

	function updateGridRowClick(grid, rowIndex, e) {
		update_form();
	}

	function win_show(temp_terminal) {
		var terminal_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : [ {
				name : 'terminal_id'
			}, {
				name : 'terminal_sn'
			} ],
			proxy : new Ext.data.ScriptTagProxy( {
				url : ZionSetting.db.url + '/' + Zion.token + '/axiom_terminal_sn.select/' + '[' + selectCorpId + ']'
			})
		});
		terminal_combo = new Ext.form.ComboBox( {
			fieldLabel : '终端编号',
			hiddenName : 'terminal_id',
			valueField : 'terminal_id',
			store : terminal_store,
			displayField : 'terminal_sn',
			editable : false,
			triggerAction : 'all',
			emptyText : '请选择终端编号...'
		});
		if (temp_terminal) {
			terminal_store.loadData( {
				'r' : [ [ temp_terminal[0], temp_terminal[1] ] ]
			});
		}
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '名称',
				id : 'target_name',
				name : 'target_name',
				allowBlank : false,
				blankText : '不能为空'
			}, terminal_combo, {
				xtype : "radiogroup",
				fieldLabel : '是否生效',
				isFormField : true,
				items : [ {
					columnWidth : .5,
					checked : true,
					xtype : "radio",
					boxLabel : "生效",
					name : "enable",
					inputValue : 1
				}, {
					columnWidth : .5,
					xtype : "radio",
					boxLabel : "不生效",
					name : "enable",
					inputValue : 0
				} ]
			}, {
				fieldLabel : 'target_id',
				hideLabel : true,
				id : 'target_id',
				name : 'target_id',
				hidden : true
			}, {
				fieldLabel : 'corp_id',
				hideLabel : true,
				id : 'corp_id_comp',
				name : 'corp_id',
				value : selectCorpId,
				hidden : true
			} ]
		})
		// ----window表单----

		var win = new Ext.Window( {
			title : '目标管理',
			width:380,
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					if (target_add == true) {
						add_target(formPanel.getForm(), win);
					} else {
						update_target(formPanel.getForm(), win);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
	}

	// ----------gird操作---------

	function add_target(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		// 增加操作
		var params = Ext.zion.form.getParams(formPanel, [ 'target_name', 'terminal_id', 'corp_id', 'enable' ]);
		if ('' == terminal_combo.getValue() || null == terminal_combo.getValue()) {
			Ext.zion.db.getJSON("device.targe.get_target_id.query", null, function(data) {
				if (!data.f) {
					params.unshift(data.r[0][0]);
					Ext.zion.db.getJSON("axiom_target.insert", params, function(data) {
						if (!data.f) {
							Ext.Msg.alert("提示", "添加成功");
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});

		} else {
			var params_up = []
			Ext.zion.db.getJSON("device.targe.get_target_id.query", null, function(data) {
				if (!data.f) {
					params.unshift(data.r[0][0]);
					params_up.push(data.r[0][0]);
					params_up.push(terminal_combo.getValue());
					Ext.zion.db.getJSON("axiom_target.insert", params, function(data) {
						if (data.r && data.r != 0) {
							Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
								if (data.r && data.r != 0) {
									Ext.Msg.alert("提示", "添加成功");
									win.close();
									grid.store.reload();
									disableButton();
								} else {
									Ext.Msg.alert("提示", "数据添加错误");
								}
							});
						} else {
							Ext.Msg.alert("提示", "数据添加错误");
						}
					});
				} else {
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});
		}

	}
	// 修改操作
	function update_target(formPanel, win) {
		if (formPanel.isValid() == false) {
			return false;
		}
		var params_up = [];
		var params = Ext.zion.form.getParams(formPanel, [ 'target_name', 'terminal_id', 'enable', 'target_id' ]);
		//alert(params);
		//return;
		if (ord_terminal_id != null && ord_terminal_id != '') {
			Ext.zion.db.getJSON("axiom_target.update", params, function(data) {
				if (data.r && data.r != 0) {
					Ext.zion.db.getJSON("device.targe.axiom_terminal.update", [ ord_terminal_id ], function(data) {
						if (data.r && data.r != 0) {
							params_up.push(Ext.getCmp('target_id').getValue());
							params_up.push(terminal_combo.getValue());
							Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
								if (data.r && data.r != 0) {
									Ext.Msg.alert("提示", "修改成功");
									win.close();
									grid.store.reload();
									disableButton();
								} else {
									Ext.Msg.alert("提示", "修改失败");
								}
							});
						} else {
							Ext.Msg.alert("提示", "修改失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "修改失败");
				}
			});
		} else {
			Ext.zion.db.getJSON("axiom_target.update", params, function(data) {
				if (data.r && data.r != 0) {
					params_up.push(Ext.getCmp('target_id').getValue());
					params_up.push(terminal_combo.getValue());
					Ext.zion.db.getJSON("device.targe.axiom_terminal_new.update", params_up, function(data) {
						if (data.r && data.r != 0) {
							Ext.Msg.alert("提示", "修改成功");
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示", "修改失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "修改失败");
				}
			});

		}

	}
	// ----------修改window表单---------
	function update_form() {
		target_add = false;
		var sm = grid.getSelectionModel().getSelected();
		var temp_terminal = [];
		ord_terminal_id = sm.data.terminal_id;
		temp_terminal.push(sm.data.terminal_id);
		temp_terminal.push(sm.data.terminal_sn);
		win_show(temp_terminal);
		formPanel.form.loadRecord(sm);
	}

	// 删除 form
	function delete_target() {
		var sm = grid.getSelectionModel().getSelections();
		var terminal_array = [];
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.target_id);
								terminal_array.push(member.terminal_id);
							} else {
								store.remove(store.getAt(i));
							}
						}
						if (id.length > 0) {
							deleNext(terminal_array);
						}
					}
				})
			}
		}
	}
	var deleNext = function(terminal_array) {
		if (id.length > 0) {
			Ext.zion.db.getJSON("axiom_target.delete", [ id.pop() ], function(data) {
				if (data.r && data.r != 0) {
					Ext.zion.db.getJSON("device.targe.axiom_terminal.update", [ terminal_array.pop() ], function(data) {
						if (data.r && data.r != 0) {
							Ext.Msg.alert("提示", "删除成功");
						} else {
							Ext.Msg.alert("提示", "删除失败");
						}
					});
				} else {
					Ext.Msg.alert("提示", "删除失败");
				}
				deleNext();
			});
		} else {
			grid.store.reload();
			disableButton();
		}
	}

	function relegateTarget(targets, callback, scope) {
		loadMask.show();
		Ext.zion.tree.loadCorpTree(function(tree) {
			var relegateToCorp;
			var corp_tree = new Ext.tree.TreePanel( {
				autoScroll : true,
				width : 250,
				height : 250,
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(tree),
				rootVisible : false,
				listeners : {
					click : function(node) {
						relegateToCorp = node.attributes.corp.corp_id;
						if (selectCorpId == relegateToCorp) {
							button.disable();
						} else {
							button.enable();
						}
					}
				}
			});

			function relegateTargetToCorp(targets, corp, callback, scope) {
				function doNext() {
					if (targets.length > 0) {
						Ext.zion.db.getJSON("device_manage.device.target.reletage", [ corp, targets.pop() ], function(data) {
							doNext();
						});
					} else {
						if (callback) {
							callback.call(scope || window);
						}
					}
				}
				doNext();
			}

			var button = new Ext.Button( {
				disabled : true,
				text : '保存',
				handler : function() {
					Ext.Msg.confirm('迁移确认', '将同时迁移终端和通讯卡,你是否确认迁移选中的记录?', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							relegateTargetToCorp(targets, relegateToCorp, function() {
								win.close();
								if (callback) {
									loadMask.hide();
									callback.call(scope || window);
								}
							});
						}
					}, scope);
				}
			});

			var win = new Ext.Window( {
				title : '监控目标迁移',
				width:380,
				closable : true,
				items : [ corp_tree ],
				buttons : [ button, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			});
			win.show();
			loadMask.hide();
		});

	}

	// =========集团树显示和列表================

	var corp_tree = new Ext.tree.TreePanel( {
		title : '集团列表',
		id : 'tree_id',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		width : 200,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				disableButton();
				selectCorpId = node.attributes.corp.corp_id;
				store.constructor( {
					db : {
						alias : store_sql,
						params : [ selectCorpId ]
					},
					root : "r",
					fields : fields
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});

			}
		}
	});
	// ============集团树显示和列表=======================
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('relegateButton').disable();
	}
	// ==============获得客户信息==============

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});

		store.constructor( {
			db : {
				alias : store_sql,
				params : [ Zion.user.corp_id ]
			},
			root : "r",
			fields : fields
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
	});

	// grid自适应
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ corp_tree, {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});

})