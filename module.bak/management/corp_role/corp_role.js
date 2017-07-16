Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var checkeding = false;
	var expandNodes = {};
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});

	loadMask.show();
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "management.corp.select",
			params : []
		},
		root : "r",
		fields : []
	});

	var sm = new Ext.grid.CheckboxSelectionModel( {
		singleSelect : true
	});

	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			selectCorpId = grid.getSelectionModel().getSelected().data.corp_id;
			Zion.db.getJSON('management.corp_role.corp_role.edit.select',
					[ selectCorpId ], function(data) {
						if (!data.f) {
							checkedRole(data.r);
						}
					});
			role_tree.enable();
			parent_role_tree.enable();
		} else {
			checkedRole( []);
			parent_role_tree.disable();
			role_tree.disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			selectCorpId = grid.getSelectionModel().getSelected().data.corp_id;
			Zion.db.getJSON('management.corp_role.corp_role.edit.select',
					[ selectCorpId ], function(data) {
						if (!data.f) {
							checkedRole(data.r);
						}
					});
			role_tree.enable();
			parent_role_tree.enable();
		} else {
			checkedRole( []);
			parent_role_tree.disable();
			role_tree.disable();
		}
	})

	var id = []; // 编号
		var grid = new Ext.grid.GridPanel( {
			title : '子集团列表',
			store : store,
			sm : sm,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'corp_id',
				sortable : true
			}, {
				header : "集团名称",
				dataIndex : 'corp_name',
				sortable : true
			}, {
				header : "是否生效",
				dataIndex : 'enable',
				sortable : true,
				renderer : function(is_enable) {
					var reStr = '';
					if (1 == is_enable) {
						reStr = "生效";
					} else if (0 == is_enable) {
						reStr = "没有生效";
					}
					return reStr;

				}
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			} ],
			bbar : new Ext.PagingToolbar( {
				store : store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			}),
			viewConfig : {
				autoFill : true
			}
		});

		function findCorpNode(node, corpId) {
			if (node.attributes.corp.corp_id == corpId) {
				return node;
			}
			if (node.hasChildNodes()) {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var nd = findCorpNode(node.childNodes[i], corpId);
					if (nd) {
						return nd;
					}
				}
			}
		}

		function selectCorpNode(corpId) {
			var node = tree.getRootNode();
			if (node.hasChildNodes()) {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var tmp = findCorpNode(node.childNodes[i], corpId);
					if (tmp) {
						tmp.select();
					}
					return;
				}
			}
		}

		function reloadCorpTree() {
			Ext.zion.tree.loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				selectCorpNode(selectCorpId);
				loadMask.hide();
			}, this);
		}

		function newAddForm() {
			update = false;
			add_from();
		}

		function reloadChildCorp() {
			store.constructor( {
				db : {
					alias : "management.corp.select",
					params : [ selectCorpId ]
				},
				root : "r",
				fields : [ 'corp_id', 'corp_name', 'enable', 'system_name', 'system_copyright', 'memo' ]
			});
			parent_role_tree.disable();
			role_tree.disable();
			store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		}

		// =========显示树和grid列表================
		var tree = new Ext.tree.TreePanel( {
			title : '集团列表',
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
					reloadChildCorp();
					reloadRoleTree();
				},
				expandnode : function(node) {
					if (node.attributes.corp) {
						expandNodes[node.attributes.corp.corp_id] = true;
					}
				},
				collapsenode : function(node) {
					if (node.attributes.corp) {
						expandNodes[node.attributes.corp.corp_id] = false;
					}
				}
			}
		});

		// //=================================role_tree===============
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
					appendRoleNode(role_list, nodeAdd,
							role_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}

		function createRoleTree(role_list) {
			var tree = {
				children : []
			};

			/*
			for ( var i = 0; i < role_list.length; i++) {
				for ( var j = 0; j < role_list.length; j++) {
					if (role_list[j][0] == role_list[i][1]) {
						if (!role_list[j].children) {
							role_list[j].children = [];
						}
						role_list[j].children.push(i);
						role_list[i].child = true;
					}
				}
			}
			 */
			
			for ( var i = 0; i < role_list.length; i++) {
				if (!role_list[i].child) {
					appendRoleNode(role_list, tree, i);
				}
			}
			return tree;
		}

		var role_tree = new Ext.tree.TreePanel( {
			layout : 'fit',
			autoScroll : true,
			animate : false,
			disabled : true,
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
			Zion.db.getJSON('management.corp_role.corp_role.select',
					[ selectCorpId ], function(data) {
						if ((data) && (data.r)) {
							if (callback) {
								callback.call(scope || window,
										createRoleTree(data.r));
							}
						}
					});
		}

		function deleteCorpRole(role_id) {
			if (grid.getSelectionModel().getSelected().data.corp_id) {
				Zion.db.getJSON('management.corp_role.corp_role.delete', [
						grid.getSelectionModel().getSelected().data.corp_id,
						role_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		function insertCorpRole(role_id) {
			if (grid.getSelectionModel().getSelected().data.corp_id) {
				Zion.db.getJSON('management.corp_role.corp_role.insert', [
						grid.getSelectionModel().getSelected().data.corp_id,
						role_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		function checkedRole(role) {
			var mod_map = {};
			for ( var i = 0; i < role.length; i++) {
				mod_map[role[i]] = role[i];
			}
			function checkedNode(node) {
				if (node.attributes.role
						&& mod_map[node.attributes.role.role_id]) {
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
			checkedNode(parent_role_tree.getRootNode());
			checkeding = false;
		}
		// ======================parent_role_tree============================

		var parent_role_tree = new Ext.tree.TreePanel( {
			layout : 'fit',
			autoScroll : true,
			animate : false,
			disabled : true,
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

		function loadParentRoleTree(callback, scope) {
			Zion.db.getJSON('management.corp_role.parent_corp_role.select',
					[ selectCorpId ], function(data) {
						if ((data) && (data.r)) {
							if (callback) {
								callback.call(scope || window,
										createRoleTree(data.r));
							}
						}
					});
		}
		// grid自适应
		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ tree, {
				region : 'center',
				layout : 'fit',
				items : [ grid ]
			}, {
				region : 'east',
				layout : 'vbox',
				layoutConfig : {
					align : 'stretch',
					pack : 'start'
				},
				collapsible : true,
				split : true,
				width : 210,
				minSize : 100,
				maxSize : 250,
				items : [ {
					xtype : 'panel',
					title : '父集团角色',
					layout : 'fit',
					flex : 1,
					items : [ role_tree ]
				}, {
					xtype : 'panel',
					title : '管理员赋予角色',
					layout : 'fit',
					flex : 1,
					items : [ parent_role_tree ]
				} ]
			} ]
		});
		function reloadParentRoleTree() {
			loadParentRoleTree(function(tree) {
				parent_role_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			});
		}
		function reloadRoleTree() {
			loadRoleTree(function(tree) {
				role_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			});
			reloadParentRoleTree();
		}
		
		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			reloadCorpTree();
			reloadRoleTree();
			reloadChildCorp();
		});
	})