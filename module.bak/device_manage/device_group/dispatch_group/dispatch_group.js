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
			Zion.db.getJSON('device_group.dispatch_group.user_group.select', [ selectUserId ], function(data) {
				if (!data.f) {
					checkedGroup(data.r);
				}
			});
			group_tree.enable();

		} else {
			disableGroupTree();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			selectUserId = grid.getSelectionModel().getSelected().data.user_id;
			Zion.db.getJSON('device_group.dispatch_group.user_group.select', [ selectUserId ], function(data) {
				if (!data.f) {
					checkedGroup(data.r);
				}
			});
			group_tree.enable();
		} else {
			disableGroupTree();
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
				header : "登录密码",
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
				header : "是否为集团管理员",
				dataIndex : 'status',
				sortable : true,
				renderer : function(status) {
					return status == 0 ? "否" : "是";
				}
			}, {
				header : "是否生效",
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
				header : "注册人编号",
				dataIndex : 'reg_user_id',
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

		function deleteCorpGroup(group_id) {
			if (grid.getSelectionModel().getSelected().data.user_id) {
				Zion.db.getJSON('device_group.dispatch_group.user_group.delete', [ grid.getSelectionModel().getSelected().data.user_id, group_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		function insertCorpGroup(group_id) {
			if (grid.getSelectionModel().getSelected().data.user_id) {
				Zion.db.getJSON('device_group.dispatch_group.user_group.insert', [ grid.getSelectionModel().getSelected().data.user_id, group_id ], function(data) {
					if (!data.f) {

					} else {
					}
				})
			} else {

			}
		}

		var group_tree = new Ext.tree.TreePanel( {
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

					if (node.attributes.group && node.attributes.group.group_id) {
						if (checked) {
							insertCorpGroup(node.attributes.group.group_id);
						} else {
							deleteCorpGroup(node.attributes.group.group_id);
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
		
		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			store.constructor( {
				db : {
					alias : "device_group.dispatch_group.user",
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
					disableGroupTree();
					store.constructor( {
						db : {
							alias : "device_group.dispatch_group.user",
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
				title : '目标组列表',
				items : [ group_tree ]
			} ]
		});

		function disableGroupTree(){
			group_tree.disable();
			checkedGroup([]);
		};
		
		function checkedGroup(group) {
			var mod_map = {};
			for ( var i = 0; i < group.length; i++) {
				mod_map[group[i]] = group[i];
			}
			function checkedNode(node) {
				if (node.attributes.group && mod_map[node.attributes.group.group_id]) {
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
			checkedNode(group_tree.getRootNode());
			checkeding = false;
		}

		Ext.zion.tree.loadGroupTree(function(tree) {
			group_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			disableGroupTree();
		},true);

		Ext.zion.tree.loadCorpTree(function(corpTree) {
			tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
			tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});
	})