Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var target_add = false;
	var ord_terminal_id;
	var terminal_combo;
	var id = [];
	var group_formPanel;
	var group_win;
	var target_ids = [];
	var store_sql = "wirelessinfo_group.user_id.target_id.select";
	var fields = [ 'target_id', 'target_name' ];
	var selectCorpId;

	var group_store_sql = "wirelessinfo_group.group_id.target_id.select";
	var group_fields = [ 'target_id', 'corp_id', 'target_name' ];
	var group_selectCorpId;

	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var loadMaskCopy = new Ext.LoadMask(Ext.getBody(), {
		msg : "拷贝中，请稍后 ..."
	});

	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql
		},
		root : "r",
		fields : fields,
		listeners : {
			load : function( store, records, options_ ){
				Ext.getCmp('relegateButton').disable();
			}
		}
	});
	var sm = new Ext.grid.CheckboxSelectionModel();
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length != 0) {Ext.getCmp('relegateButton').enable();} else {Ext.getCmp('relegateButton').disable();}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length !=0) {Ext.getCmp('relegateButton').enable();} else {Ext.getCmp('relegateButton').disable();}
	});
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		loadMask:{ msg: '查询中...' },
		title: '车辆列表',
		//enableDragDrop : true,
		columns : [ sm, {header : "序号",dataIndex : 'target_id',width : 50,sortable : true}, 
			{header : "名称",dataIndex : 'target_name',width : 50,sortable : true}
			//{header : "终端编号",dataIndex : 'terminal_sn',width : 50,sortable : true}
		],
		tbar : ['名称',{xtype:'textfield',width:120,id:'target_name_sel'},
			{text : '查询',tooltip : '查询',icon : Ext.zion.image_base+'/select.gif',handler:function(){select_all();}},
			'-',{text : '清除条件',tooltip : '清除查询条件',icon : Ext.zion.image_base+'/cross.png',handler:function(){Ext.getCmp('target_name_sel').reset();}},
			'-',{text : '刷新',tooltip : '刷新记录',icon : Ext.zion.image_base+'/refresh.gif',handler:function(){
				store.load( {params : {start : 0,limit : Ext.zion.page.limit}});}
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

	store.load( {params : {start : 0,limit : Ext.zion.page.limit}});

	var group_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : group_store_sql,
			params : [ group_selectCorpId ]
		},
		root : "r",
		fields : group_fields
	});
	var group_sm = new Ext.grid.CheckboxSelectionModel();
	group_sm.on('rowselect', function() {
		if (group_grid.selModel.getSelections().length != 0) {Ext.getCmp('deleteButton').enable();} else {Ext.getCmp('deleteButton').disable();}
	});
	group_sm.on('rowdeselect', function() {
		if (group_grid.selModel.getSelections().length !=0) {Ext.getCmp('deleteButton').enable();} else {Ext.getCmp('deleteButton').disable();}
	});
	var group_grid = new Ext.grid.GridPanel( {
		title : '信息组管理的车辆列表',
		store : group_store,
		sm : group_sm,
		loadMask:{ msg: '查询中...' },
		columns : [ group_sm, {header : "序号",dataIndex : 'target_id',width : 50,sortable : true}, 
			{header : "名称",dataIndex : 'target_name',width : 50,sortable : true}
			//{header : "终端编号",dataIndex : 'terminal_sn',width : 50,sortable : true} 
		],
		tbar : [ {
					id : 'deleteButton',
					disabled : true,
					text : '删除车辆',
					icon : Ext.zion.image_base + '/delete.gif',
					tooltip : '删除记录',
					handler : delete_target,
					scope : this
				}, '-', {
					id : 'relegateButton',
					text : '拷贝车辆',
					disabled : true,
					icon : Ext.zion.image_base + '/relegate.gif',
					tooltip : '拷贝车辆到组',
					handler : copy_target_to_group,
					scope : this
				}],
		bbar : new Ext.PagingToolbar( {
			store : group_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});

	var tree = new Ext.tree.TreePanel( {
		title : '信息组列表',
		//id : 'tree_id',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		width : 200,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		tbar : [ {
			text : '新增组',
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '新增组记录',
			handler : add_group,
			scope : this
		}, '-', {
			id : 'delgroupButton',
			text : '删除组',
			disabled : true,
			icon : Ext.zion.image_base + '/delete.gif',
			tooltip : '删除组纪录',
			handler : del_group,
			scope : this
		}],
		listeners : {
			click : function(node) {
				Ext.getCmp('delgroupButton').enable();
				Ext.getCmp('deleteButton').disable();
				group_selectCorpId = node.attributes.corp.group_id;
				group_store.constructor( {
					db : {
						alias : group_store_sql,
						params : [ group_selectCorpId ]
					},
					root : "r",
					fields : group_fields
				});
				group_store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
			}
		}
	});
	function select_all(){
		var target_name_sel = Ext.getCmp('target_name_sel').getValue();
		var target_name_sel_value;
		if(target_name_sel){
			target_name_sel_value = 0;
		}else{
			target_name_sel_value = 1;
		}
		var paramsA = [ target_name_sel, target_name_sel_value ];
		grid.store.constructor( {
			db : {
				params : paramsA,
				alias : 'wirelessinfo_group.user_id.target_id.params.select'
			},
			root : "r",
			fields : fields
		});
		grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});

	}
	function delete_target(){
		var sm = group_grid.getSelectionModel().getSelections();
		if (sm.length == 0) {
			Ext.Msg.alert("删除操作", "请选择要删除的项");
		} else {
			if (sm.length > 0) {
				Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
					if (btn == 'yes') {
						target_ids = [];
						for ( var i = 0; i < sm.length; i += 1) {
							var member = sm[i].data;
							if (member) {
								target_ids.push(member.target_id);
							}
						}
						if (target_ids.length > 0) {
							target_deleNext();
						}
					}
				})
			}
		}
	}
	var target_deleNext = function() {
		if (target_ids.length > 0) {
			Ext.zion.db.getJSON("wirelessinfo_group_target.delete", [ target_ids.pop() ],function(data) {
				if(data.r){
					target_deleNext();
				}
			});
		} else {
			store.load( {params : {start : 0,limit : Ext.zion.page.limit}});
			group_store.constructor( {
				db : {
					alias : group_store_sql,
					params : [ group_selectCorpId ]
				},
				root : "r",
				fields : group_fields
			});
			group_store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
			loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				var roots = tree.getRootNode();
				for(var i = 0;i < roots ;i++){
					if(tree.getRootNode().childNodes[i].attributes.corp.group_id && tree.getRootNode().childNodes[i].attributes.corp.group_id == group_selectCorpId){
						tree.getRootNode().childNodes[i].select();
					}
				}
			});
			Ext.Msg.alert("提示", "删除成功");
			Ext.getCmp('deleteButton').disable();
		}
	}
	function copy_target_to_group(){
		if(!group_selectCorpId || group_selectCorpId == ''){
			Ext.Msg.alert("提示", "请在信息组列表中选择组!");
			return;
		}

		var sm = grid.getSelectionModel().getSelections();
		if (sm.length == 0) {
			Ext.Msg.alert("提示", "请选择拷贝的车辆!");
		} else {
			if (sm.length > 0) {
				target_ids = [];
				for ( var i = 0; i < sm.length; i += 1) {
					var member = sm[i].data;
					if (member) {
						target_ids.push(member.target_id);
					}
				}
				if (target_ids.length > 0) {
					loadMaskCopy.show();
					copy_traget();
				}
			}
		}
	}
	var copy_traget = function() {
		if (target_ids.length > 0) {
			Ext.zion.db.getJSON("wirelessinfo_group_target.insert", [ group_selectCorpId, target_ids.pop() ],function(data) {
				if(data.r == 1){
					copy_traget();
				}
			});
		} else {
			store.load( {params : {start : 0,limit : Ext.zion.page.limit}});
			group_store.constructor( {
				db : {
					alias : group_store_sql,
					params : [ group_selectCorpId ]
				},
				root : "r",
				fields : group_fields
			});
			group_store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
			loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				var roots = tree.getRootNode();
				for(var i = 0;i < roots ;i++){
					if(tree.getRootNode().childNodes[i].attributes.corp.group_id && tree.getRootNode().childNodes[i].attributes.corp.group_id == group_selectCorpId){
						tree.getRootNode().childNodes[i].select();
					}
				}
			});
			loadMaskCopy.hide();
			Ext.Msg.alert("提示", "拷贝成功");
			Ext.getCmp('deleteButton').disable();
		}
	}
	function add_group(){
		group_formPanel = new Ext.form.FormPanel({
			defaultType : 'textfield',
			labelWidth: 80,
			defaults : {
				width: 150
			},
			items : [{
				fieldLabel : '组名称',
				name : 'add_group_name',
				id:'add_group_name',
				allowBlank : false,
				blankText : '不能为空',
				maxLength : 128
			}]
		})
		group_win = new Ext.Window( {
			title : '新增组',
			closable : true,
			items : [ group_formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					add_group_form(group_formPanel.getForm(), group_win);
				}
			}, {
				text : '取消',
				handler : function() {
					group_formPanel.form.reset();
					group_win.close();
				}
			} ]
		})
		group_win.show();
	}

	function del_group(){
		Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
			if (btn == 'yes') {
				Ext.zion.db.getJSON("wirelessinfo_group.group.delete", [ group_selectCorpId ], function(data) {
					if (data.r == 1) {
						loadCorpTree(function(corpTree) {
							tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
						});
						store.load( {params : {start : 0,limit : Ext.zion.page.limit}});
						group_store.constructor( {
							db : {
								alias : group_store_sql,
								params : [ group_selectCorpId ]
							},
							root : "r",
							fields : group_fields
						});
						group_store.load( {
							params : {
								start : 0,
								limit : Ext.zion.page.limit
							}
						});
						group_selectCorpId = '';
						Ext.Msg.alert("提示", "数据删除成功");
					} else {
						Ext.Msg.alert("提示", "数据删除错误");
					}
				});
			}
		});
	}

	function add_group_form(formPanel, win){
		if (formPanel.isValid() == false) {
			return false;
		}
		var group_name = Ext.getCmp('add_group_name').getValue();
		var params = [group_name];
		Ext.zion.db.getJSON("wirelessinfo_group.group.insert", params, function(data) {
			if (data.r == 1) {
				loadCorpTree(function(corpTree) {
					tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
					//tree.getRootNode().childNodes[0].select();
				});
				Ext.getCmp('delgroupButton').disable();
				group_selectCorpId = '';
				group_win.close();
				Ext.Msg.alert("提示", "数据添加成功");
			} else {
				Ext.Msg.alert("提示", "数据添加错误");
			}
		});
	}

	new Ext.Viewport( {
			margins : '5 0 0 0',
			layout : 'border',
			layoutConfig : {
				align : 'stretch',
				pack : 'start'
			},
			items : [{
				region : 'center',
				layout : 'border',
				border : false,
				autoScroll : true,
				items : [ {
					region : 'center',
					layout : 'fit',
					items : [ grid ]
				} ]
			}, {
				region : 'south',
				height: 300,
				split : true,
				layout : 'border',
				border : false,
				autoScroll : true,
				items : [ tree, {
					region : 'center',
					layout : 'fit',
					items : [ group_grid ]
				} ]
			}]
	});

		function appendCorpNode(corp_list, node, index) {
			var nodeAdd = {};
			nodeAdd.text = corp_list[index][1]+'(车辆数：'+corp_list[index][2]+')';
			nodeAdd.expanded = true;
			nodeAdd.corp = {
				group_id : corp_list[index][0]
			};

			node.children.push(nodeAdd);
			if (corp_list[index].children) {
				nodeAdd.children = [];
				for ( var i = 0; i < corp_list[index].children.length; i++) {
					appendCorpNode(corp_list, nodeAdd,
							corp_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}

		function createCorpTree(corp_list) {
			var tree = {
				children : []
			};
			for ( var i = 0; i < corp_list.length; i++) {
				if (!corp_list[i].child) {
					appendCorpNode(corp_list, tree, i);
				}
			}

			return tree;
		}

	function loadCorpTree(callback, scope) {
			Zion.db.getJSON('wirelessinfo.wirelessinfo_target_list.select', null, function(data) {
				if ((data) && (data.r)) {
					if (callback) {
						callback.call(scope || window, createCorpTree(data.r));
					}
				}
			});
		}

	loadCorpTree(function(corpTree) {
		tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
		//tree.getRootNode().childNodes[0].select();
		loadMask.hide();
	});

})

