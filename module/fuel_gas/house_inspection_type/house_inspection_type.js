Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var inspection_type = false;
	var id = [];
	var store_sql = "fuel_gas.house_inspection_type.select";
	var fields = [ 'inspection_type_id', 'inspection_type_name', 'corp_id', 'inspection_enable','memo' ];
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
		} else {
			Ext.getCmp('deleteButton').disable();
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
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	})

	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'inspection_type_id',
			width : 50,
			sortable : true
		}, {
			header : "类型名称",
			dataIndex : 'inspection_type_name',
			width : 50,
			sortable : true
		}, {
			header : "备注",
			dataIndex : 'memo',
			width : 100,
			sortable : true
		}],
		tbar : [ {
			id : 'addButton',
			text : '新增',
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '添加新纪录',
			handler : function() {
				inspection_type = true;
				win_show();
			},
			scope : this
		},{
			id : 'editButton',
			disabled : true,
			text : '修改',
			icon : Ext.zion.image_base + '/update.gif',
			tooltip : '修改记录',
			handler : function() {
				inspection_type = false;
				win_show();
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

	function win_show() {
		formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '类型名称',
				id : 'inspection_type_name',
				name : 'inspection_type_name',
				allowBlank : false,
				blankText : '不能为空',
				maxlength:10
			},{
				fieldLabel : '备注',
				id : 'memo',
				name : 'memo',
				xtype:'textarea'
			}, {
				fieldLabel : 'inspection_type_id',
				hideLabel : true,
				id : 'inspection_type_id',
				name : 'inspection_type_id',
				hidden : true
			}]
		})
		// ----window表单----

		var win = new Ext.Window( {
			title : '类型管理',
			autoWidth : false,
			width : 380,
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function() {
					add_or_update(formPanel.getForm(), win);
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
		if(inspection_type == false){
			var sm = grid.getSelectionModel().getSelected();
			formPanel.form.loadRecord(sm);
		}
	}

	// ----------gird操作---------
	//增加true  修改  false
	function add_or_update(formPanel,win){
		if (formPanel.isValid() == false) {
			return false;
		}
		var inspection_type_id = Ext.getCmp("inspection_type_id").getValue();
		var inspection_type_name = Ext.getCmp("inspection_type_name").getValue();
		var memo = Ext.getCmp("memo").getValue();
		if(inspection_type){
			var params = [inspection_type_name,selectCorpId,memo];
			Zion.db.getJSON('fuel_gas.house_inspection_type.insert',params,function(data){
				if(data.r){
					Ext.Msg.alert("提示", "数据添加成功");
					win.close();
					grid.store.reload();
					disableButton();
				}else{
					Ext.Msg.alert("提示", "数据添加错误");
				}
			});
		}else{
			var params = [inspection_type_name,memo,inspection_type_id];
			Zion.db.getJSON('fuel_gas.house_inspection_type.update',params,function(data){
				if(data.r){
					Ext.Msg.alert("提示", "数据修改成功");
					win.close();
					grid.store.reload();
					disableButton();
				}else{
					Ext.Msg.alert("提示", "数据修改失败");
				}
			});
		}
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
								id.push(member.inspection_type_id);
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
			Ext.zion.db.getJSON("fuel_gas.house_inspection_type.delete", [ id.pop() ], function(data) {
				if (data.r && data.r != 0) {

				} else {
					Ext.Msg.alert("提示", "数据删除失败");
				}
				deleNext();
			});
		} else {
			Ext.Msg.alert("提示", "数据删除成功");
			grid.store.reload();
			disableButton();
		}
	}

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
			title:'燃气巡检类型列表',
			items : [ grid ]
		} ]
	});

})