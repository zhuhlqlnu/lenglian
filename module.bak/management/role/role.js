Ext.onReady(function() {

	Ext.QuickTips.init();
	var formPanel;
	var selectCorpId;
	var selectRoleId;

	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});

	loadMask.show();
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
			selectRoleId = grid.getSelectionModel().getSelected().data.role_id;

			Zion.db.getJSON('management.role.role_module.select', [ selectRoleId ], function(data) {
				if (!data.f) {
					checkedModule(data.r);
				}
			});
			module_tree.enable();
		} else {
			Ext.getCmp('editButton').disable();
			checkedModule( []);
			module_tree.disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}

	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
			Ext.getCmp('editButton').enable();
			selectRoleId = grid.getSelectionModel().getSelected().data.role_id;

			Zion.db.getJSON('management.role.role_module.select', [ selectRoleId ], function(data) {
				if (!data.f) {
					checkedModule(data.r);
				}
			});
			module_tree.enable();
		} else {
			Ext.getCmp('editButton').disable();
			checkedModule( []);
			module_tree.disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "management.role.select"
		},
		root : "r",
		fields : [ 'role_id', 'role_name', 'corp_id', 'enable', 'memo' ]

	});
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		module_tree.disable();
		checkedModule( []);
	}
	var id = []; // 编号
		var grid = new Ext.grid.GridPanel( {
			title : '集团角色管理',
			store : store,
			sm : sm,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'role_id',
				sortable : true
			}, {
				header : "角色名称",
				dataIndex : 'role_name',
				sortable : true
			}, {
				header : "是否生效",
				dataIndex : 'enable',
				sortable : true,
				renderer : function(enable) {
					return enable == 0 ? "否" : "是";
				}
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			} ],
			tbar : [ {
				id : 'addButton',
				text : '新增',
				icon : Ext.zion.image_base + '/add.gif',
				tooltip : '添加新纪录',
				handler : function() {
					win_show();
				},
				scope : this
			},// '-'给工具栏按钮之间添加'|'
					{
						id : 'editButton',
						text : '修改',
						icon : Ext.zion.image_base + '/update.gif',
						tooltip : '修改记录',
						handler : updateForm,
						scope : this,
						disabled : true
					}, {
						text : '删除',
						id : 'deleteButton',
						icon : Ext.zion.image_base + '/delete.gif',
						tooltip : '删除记录',
						handler : deleteForm,
						scope : this,
						disabled : true
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
			// 第二个toolbar
			listeners : {
				'render' : function() {
					var tbar = new Ext.Toolbar( {
						items : [ '请根据', {
							xtype : 'textfield',
							width : 150,
							id : 'term'
						}, {
							text : '查询',
							tooltip : '查询',
							icon : Ext.zion.image_base + '/select.gif'
						} ]
					})
					// tbar.render(this.tbar);

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

		// ============增加数据form================
		function win_show(record) {
			formPanel = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				items : [ {
					fieldLabel : '角色名称',
					name : 'role_name',
					allowBlank : false,
					blankText : '不能为空',
					maxLength : 16
				}, {
					xtype : 'radiogroup',
					fieldLabel : '是否生效',
					id : 'enable',
					items : [ {
						boxLabel : '是',
						name : 'enable',
						inputValue : 1,
						checked : true
					}, {
						boxLabel : '否',
						name : 'enable',
						inputValue : 0
					} ]
				}, {
					fieldLabel : '备注',
					xtype : 'textarea',
					id : 'memo',
					name : 'memo'
				}, {
					fieldLabel : 'role_id',
					name : 'role_id',
					hideLabel : true,
					hidden : true
				} ]
			})
			var win = new Ext.Window( {
				title : '集团角色管理',
				closable : true,
				closeAction : 'close',
				items : [ formPanel ],
				buttons : [ {
					text : '保存',
					handler : function() {
						if (record) {
							update_role_form(formPanel.getForm(), win);
						} else {
							add_role_form(formPanel.getForm(), win);
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
		function add_role_form(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			// 增加操作
			var params = Ext.zion.form.getParams(formPanel, [ 'role_name', 'enable', 'memo' ])
			params.push(selectCorpId);
			Ext.zion.db.getJSON("management.role.insert", params, function(data) {
				if (data.f) {
					if (data.f.indexOf('PK_ROLE_NAME')) {
						Ext.Msg.alert("提示", "角色名重复,请重新输入角色名");
					} else {
						Ext.Msg.alert("提示", "数据添加错误");
					}
				} else {
					if (data.r != 0 && data.r) {
						Ext.Msg.alert("提示", "数据添加成功");
						win.close();
						grid.store.reload();
						disableButton();
					} else {
						Ext.Msg.alert("提示", "数据添加错误");
					}
				}
			});
		}
		function update_role_form(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			// 修改操作
			var params = Ext.zion.form.getParams(formPanel, [ 'role_name', 'enable', 'memo', 'role_id' ]);
			Ext.zion.db.getJSON("management.role.update", params, function(data) {
				if (data.f) {
					if (data.f.indexOf('PK_ROLE_NAME')) {
						Ext.Msg.alert("提示", "角色名重复,请重新输入角色名");
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
				} else {
					if (data.r != 0 && data.r) {
						Ext.Msg.alert("提示", "数据修改成功");
						win.close();
						grid.store.reload();
						disableButton();
					} else {
						Ext.Msg.alert("提示", "数据修改错误");
					}
				}
			});
		}
		// ----------修改window表单---------
		function updateForm() {
			var sm = grid.getSelectionModel().getSelected();
			win_show(sm);
			formPanel.form.loadRecord(sm);

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
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								id.push(member.role_id);
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
				var role_id = id.pop();
				Ext.zion.db.getJSON("management.role.delete", [ role_id ], function(data) {
					if (data.r != 0 && data.r) {
						Ext.Msg.alert("提示", "删除成功");
					} else {
						Ext.Msg.alert("提示", "删除失败");
					}
					deleNext();
				});
				Ext.zion.db.getJSON("management.role.role_module_all.delete", [ role_id ], function(data) {

				});
			} else {
				grid.store.reload();
				disableButton();
			}
		}
		grid.addListener('rowdblclick', updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e) {
			updateForm();
		}

		// =========显示树和grid列表================

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
					checkedModule( []);
					// reloadModuleTree();
			store.constructor( {
				db : {
					alias : "management.role.select",
					params : [ selectCorpId ]
				},
				root : "r",
				fields : [ 'role_id', 'role_name', 'corp_id', 'enable', 'memo' ]
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

		// module树
		function createModuleTree(module_list, path_list) {
			var tree = {
				children : []
			};
			var search = {};
			var path_name = {};
			for ( var i = 0; i < path_list.length; i++) {
				var path = path_list[i];
				path_name[path[0]] = path[1];
			}

			for ( var i = 0; i < module_list.length; i++) {
				var module = module_list[i];
				var paths = module[1].split('.');
				var node = tree;
				var path = null;
				for ( var j = 0; j < paths.length - 1; j++) {
					path = (path == null ? paths[j] : (path + "." + paths[j]));
					if (!search[path]) {
						search[path] = {
							checked : false,
							expanded : true,
							text : path_name[path] ? path_name[path] : paths[j],
							children : []
						};
						node.children.push(search[path]);
					}
					node = search[path];
				}
				node.path = path.substring(1);
				node.children.push( {
					checked : false,
					leaf : true,
					text : module[2],
					module_id : module[0]
				});
			}
			return tree;
		}

		function loadModuleTree(callback, scope) {
			var module_list = [];
			var modlue_path_list = [];
			var tree = {};
			Zion.db.getJSON('management.role.module.select', [ selectCorpId ], function(data) {
				if ((data) && (data.r)) {
					var module_list = data.r;
					Zion.db.getJSON('module_path_list', null, function(data_path) {
						if ((data_path) && (data_path.r)) {
							var modlue_path_list = data_path.r;
							var tree = createModuleTree(module_list, modlue_path_list);
							if (callback) {
								callback.call(scope || window, tree);
							}
						} else {
							if (callback) {
								callback.call(scope || window);
							}
						}
					}, this);
				} else {
					if (callback) {
						callback.call(scope || window);
					}
				}
			}, this);
		}

		var checkeding = false;

		function deleteModule(module_id) {
			Zion.db.getJSON('management.role.role_module.delete', [ selectRoleId, module_id ], function(data) {
				if (!data.f) {

				} else {
					// alert(data.f);
				}
			});

		}

		function insertModule(module_id) {
			Zion.db.getJSON('management.role.role_module.insert', [ selectRoleId, module_id ], function(data) {
				if (!data.f) {

				} else {
					// alert(data.f);
				}
			});
		}

		var module_tree = new Ext.tree.TreePanel( {
			autoScroll : true,
			animate : false,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				checkchange : function(node, checked) {
					if (checkeding) {
						return;
					}

					if (node.attributes.module_id) {
						if (checked) {
							insertModule(node.attributes.module_id);
						} else {
							deleteModule(node.attributes.module_id);
						}
					}

					node.attributes.checked = checked;
					if (node.hasChildNodes()) {
						node.eachChild(function(child) {
							child.ui.toggleCheck(checked);
						});
					}
				}
			}
		});

		function checkedModule(modules) {
			var mod_map = {};
			for ( var i = 0; i < modules.length; i++) {
				mod_map[modules[i]] = modules[i];
			}

			function checkedNode(node) {
				if (mod_map[node.attributes.module_id]) {
					node.attributes.checked = true;
					node.ui.toggleCheck(true);
				} else {
					node.attributes.checked = false;
					node.ui.toggleCheck(false);
				}
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						checkedNode(child);
					});
				}
				;
			}
			checkeding = true;
			checkedNode(module_tree.getRootNode());
			checkeding = false;
		}

		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ corp_tree, {
				region : 'center',
				layout : 'fit',
				items : [ grid ]
			}, {
				region : 'east',
				layout : 'fit',
				collapsible : true,
				split : true,
				region : 'east',
				width : 210,
				minSize : 100,
				maxSize : 250,
				title : '权限列表',
				items : [ module_tree ]
			} ]
		});

		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;

			var cropLoaded = false;
			var moduleLoaded = false;
			loadModuleTree(function(tree) {
				module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				module_tree.disable();
				moduleLoaded = true;
				if (cropLoaded && moduleLoaded) {
					loadMask.hide();
				}
			});

			Ext.zion.tree.loadCorpTree(function(tree) {
				corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				corp_tree.getRootNode().childNodes[0].select();
				cropLoaded = true;
				if (cropLoaded && moduleLoaded) {
					loadMask.hide();
				}
			});

			store.constructor( {
				db : {
					alias : "management.role.select",
					params : [ Zion.user.corp_id ]
				},
				root : "r",
				fields : [ 'role_id', 'role_name', 'corp_id', 'enable', 'memo' ]
			});
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		});
	})