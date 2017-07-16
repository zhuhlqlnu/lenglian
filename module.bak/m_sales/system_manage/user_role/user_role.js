Ext.onReady(function() {

	Ext.QuickTips.init();
	var formPanel;
	var add_user = false;
	var checkeding = false;
	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});

	loadMask.show();

	var sm = new Ext.grid.CheckboxSelectionModel( {
		singleSelect : true
	});
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			selectUserId = grid.getSelectionModel().getSelected().data.user_id;
			var corp_id = grid.getSelectionModel().getSelected().data.corp_id;
			var status = grid.getSelectionModel().getSelected().data.status;
			Zion.db.getJSON('management.user_role.user_role.select', [ selectUserId ], function(data) {
				if (!data.f) {
					checkedRole(data.r);
				}
			});

			if (Zion.user.corp_id == corp_id && status == 1) {
				role_tree.disable();
			} else {
				role_tree.enable();
			}
		} else {
			checkedRole( []);
			role_tree.disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			selectUserId = grid.getSelectionModel().getSelected().data.user_id;
			var corp_id = grid.getSelectionModel().getSelected().data.corp_id;
			var status = grid.getSelectionModel().getSelected().data.status;
			Zion.db.getJSON('management.user_role.user_role.select', [ selectUserId ], function(data) {
				if (!data.f) {
					checkedRole(data.r);
				}
			});
			if (Zion.user.corp_id == corp_id && status == 1) {
				role_tree.disable();
			} else {
				role_tree.enable();
			}
		} else {
			checkedRole( []);
			role_tree.disable();
		}
	})
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "axiom_user.select"
		},
		root : "r",
		fields : [ 'user_id', 'login_name', 'password', 'user_name', 'telephone', 'fax', 'email', 'address', 'status', 'corp_id', 'enable', 'reg_date', 'reg_user_id', 'memo' ]

	});
	var id = []; // 编号
		var grid = new Ext.grid.GridPanel( {
			title : '集团用户',
			store : store,
			sm : sm,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'user_id',
				sortable : true
			}, {
				header : "用户名称",
				dataIndex : 'user_name',
				sortable : true
			}, {
				header : "登陆名",
				dataIndex : 'login_name',
				sortable : true
			}, {
				header : "密码",
				dataIndex : 'password',
				sortable : true,
				renderer : function(password, cellmeta, record) {
					if (Zion.user.corp_id == record.data["corp_id"] && record.data["status"] == 1) {
						return "*********";
					} else {
						return password;
					}
				}
			}, {
				header : "管理员?",
				dataIndex : 'status',
				sortable : true,
				renderer : function(status) {
					return status == 0 ? "否" : "是";
				}
			}, {
				header : "生效?",
				dataIndex : 'enable',
				sortable : true,
				renderer : function(enable) {
					return enable == 0 ? "否" : "是";
				}
			}, {
				header : "注册时间",
				dataIndex : 'reg_date',
				sortable : true
			}, {
				header : "电话",
				dataIndex : 'telephone',
				sortable : true
			}, {
				header : "传真",
				dataIndex : 'fax',
				sortable : true
			}, {
				header : "email地址",
				dataIndex : 'email',
				sortable : true
			}, {
				header : "地址",
				dataIndex : 'address',
				sortable : true
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			} ],
			/*
			 * tbar : [ '请根据', { xtype : 'textfield', width : 150, id : 'term' }, {
			 * text : '查询', tooltip : '查询', icon :
			 * Ext.zion.image_base+'/select.gif' } ],
			 */

			bbar : new Ext.PagingToolbar( {
				store : store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			})
		});

		// ==============corp_tree=================

		function deleteCorpRole(role_id) {
			if (grid.getSelectionModel().getSelected().data.user_id) {
				Zion.db.getJSON('management.user_role.user_role.delete', [ grid.getSelectionModel().getSelected().data.user_id, role_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		function insertCorpRole(role_id) {
			if (grid.getSelectionModel().getSelected().data.user_id) {
				Zion.db.getJSON('management.user_role.user_role.insert', [ grid.getSelectionModel().getSelected().data.user_id, role_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		// ==============role_tree=================
		// role_id,corp_id,role_name
		function appendRoleNode(role_list, node, index) {
			var nodeAdd = {};
			nodeAdd.text = role_list[index][2];
			nodeAdd.checked = false;
			nodeAdd.expanded = true;
			nodeAdd.role = {
				role_id : role_list[index][0],
				corp_id : role_list[index][1],
				role_name : role_list[index][2]
			};

			node.children.push(nodeAdd);
			if (role_list[index].children) {
				nodeAdd.children = [];
				for ( var i = 0; i < role_list[index].children.length; i++) {
					appendRoleNode(role_list, nodeAdd, role_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}

		function createRoleTree(role_list) {
			var tree = {
				children : []
			};

			for ( var i = 0; i < role_list.length; i++) {
				appendRoleNode(role_list, tree, i);
			}
			return tree;
		}

		var role_tree = new Ext.tree.TreePanel( {
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

					if (node.attributes.role.role_id) {
						if (checked) {
							insertCorpRole(node.attributes.role.role_id);
						} else {
							deleteCorpRole(node.attributes.role.role_id);
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

		function loadRoleTree(callback, scope) {
			Zion.db.getJSON('management.user_role.corp_role.select', [ selectCorpId ], function(data) {
				if ((data) && (data.r)) {
					if (callback) {
						callback.call(scope || window, createRoleTree(data.r));
					}
				}
			});
		}

		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			reloadRoleTree();
			store.constructor( {
				db : {
					alias : "axiom_user.select",
					params : [ Zion.user.corp_id ]
				},
				root : "r",
				fields : [ 'user_id', 'login_name', 'password', 'user_name', 'telephone', 'fax', 'email', 'address', 'status', 'corp_id', 'enable', 'reg_date', 'reg_user_id', 'memo' ]
			});
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		});

		// =========显示树和grid列表================

		var tree = new Ext.tree.TreePanel( {
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
					selectCorpId = node.attributes.corp.corp_id;
					reloadRoleTree();
					role_tree.disable();
					store.constructor( {
						db : {
							alias : "axiom_user.select",
							params : [ selectCorpId ]
						},
						root : "r",
						fields : [ 'user_id', 'login_name', 'password', 'user_name', 'telephone', 'fax', 'email', 'address', 'status', 'corp_id', 'enable', 'reg_date', 'reg_user_id', 'memo' ]
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

		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ tree, {
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
				title : '角色列表',
				items : [ role_tree ]
			} ]
		});

		function checkedRole(role) {
			var mod_map = {};
			for ( var i = 0; i < role.length; i++) {
				mod_map[role[i]] = role[i];
			}
			function checkedNode(node) {
				if (node.attributes.role && mod_map[node.attributes.role.role_id]) {
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
			checkedNode(role_tree.getRootNode());
			checkeding = false;
		}

		function reloadRoleTree() {
			loadRoleTree(function(tree) {
				role_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				role_tree.disable();
			});
		}

		Ext.zion.tree.loadCorpTree(function(corpTree) {
			tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
			tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});
	})