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
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
	var grid = new Ext.grid.GridPanel( {
		title:'目标列表',
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'target_id',
			width : 50,
			sortable : true
		}, {
			header : "目标名称",
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
		}],
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

	sm.on('rowdeselect', function() {
		query_target_store.removeAll();
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_phone').enable();
		} else {
			Ext.getCmp('add_phone').disable();
		}
	})
	
	sm.on('rowselect', function() {
		var sm_select = grid.getSelectionModel().getSelected();
		var target_id = sm_select.data.target_id;
		query_target_grid.store.constructor({
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_sms_query_target.select/['+target_id+']'
			}),
			root : "r",
			fields : query_target_fields
		});
		query_target_grid.store.load();
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('add_phone').enable();
		} else {
			Ext.getCmp('add_phone').disable();
		}
	})
	
	
	var query_target_fields = ['phone_number','target_id','target_name','memo'];
	var query_target_store = new Ext.data.SimpleStore( {
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_sms_query_target.select'
		}),
		root : "r",
		fields : query_target_fields
	});
	var query_target_sm = new Ext.grid.CheckboxSelectionModel();
	query_target_sm.on('rowdeselect', function() {
		if (query_target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('delete_phone').enable();
		} else {
			Ext.getCmp('delete_phone').disable();
		}
	})
	
	query_target_sm.on('rowselect', function() {
		if (query_target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('delete_phone').enable();
		} else {
			Ext.getCmp('delete_phone').disable();
		}
	})
	
	var query_target_grid = new Ext.grid.GridPanel( {
		title:'短信查询',
		height:200,
		split:true,
		region : 'south',
		store : query_target_store,
		sm : query_target_sm,
		columns : [ query_target_sm, {
			header : "手机号码",
			dataIndex : 'phone_number',
			width : 50,
			sortable : true
		}, {
			header : "目标名称",
			dataIndex : 'target_name',
			width : 50,
			sortable : true
		},{
			header : "备注",
			dataIndex : 'memo',
			width : 50,
			sortable : true
		}],
		tbar :[{
			text : '添加手机号码',
			tooltip : '添加手机号码',
			id:'add_phone',
			disabled:true,
			icon : Ext.zion.image_base+'/add.gif',
			handler:function(){
				var sm_select = grid.getSelectionModel().getSelected();
				if(!sm_select){
					Ext.Msg.alert('提示','请选择目标');
				}else{
					phone_window_show();
				}
			}
		},{
			text : '删除手机号码',
			tooltip : '删除手机号码',
			id:'delete_phone',
			disabled:true,
			icon : Ext.zion.image_base+'/delete.gif',
			handler:function(){
				deleteForm();
			}
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	
	function appendCorpNode(corp_list, node, index) {
		var nodeAdd = {};
		nodeAdd.text = corp_list[index][2];
		nodeAdd.expanded = true;
		nodeAdd.corp = {
			corp_id : corp_list[index][0],
			selectCorpId : corp_list[index][1],
			order_by : corp_list[index][3],
			group_id : corp_list[index][4]
		};

		node.children.push(nodeAdd);
		if (corp_list[index].children) {
			nodeAdd.children = [];
			for ( var i = 0; i < corp_list[index].children.length; i++) {
				appendCorpNode(corp_list, nodeAdd, corp_list[index].children[i]);
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
			for ( var j = 0; j < corp_list.length; j++) {
				if (corp_list[j][0] == corp_list[i][1]) {
					if (!corp_list[j].children) {
						corp_list[j].children = [];
					}
					corp_list[j].children.push(i);
					corp_list[i].child = true;
				}
			}
		}

		for ( var i = 0; i < corp_list.length; i++) {
			if (!corp_list[i].child) {
				appendCorpNode(corp_list, tree, i);
			}
		}

		return tree;
	}
	
	function phone_window_show(){
		formPanel = new Ext.form.FormPanel({
			height:160,
			width:380,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : '手机号码',
				name : 'phone_number',
				id : 'phone_number',
				maxLength:11,
				allowBlank : false,
				blankText : '不能为空'
			},{
				fieldLabel : '备注',
				name : 'memo',
				id : 'memo',
				xtype:'textarea'
			},{
				name:'target_id',
				id : 'target_id',
				hidden : true,
				hideLabel : true
			}]
		})
		var phone_window = new Ext.Window({
			title:'手机订阅',
			closable : true,
			closeAction : 'close',
			items:[formPanel],
			buttons : [{
				text : '保存',
				handler : function(){
					add_query_target(formPanel.getForm(),phone_window)
				}
			}, {
				text : '关闭',
				handler : function() {
					formPanel.form.reset();
					phone_window.close();
				}
			}]
		})
		phone_window.show();
	}

	function add_query_target(formPanel,phone_window){
		if (formPanel.isValid() == false) {
			return false;
		}else{
			var sm_select = grid.getSelectionModel().getSelected();
			var target_id = sm_select.data.target_id;
			var phone_number = Ext.getCmp('phone_number').getValue();
			var memo = Ext.getCmp('memo').getValue(); 
			var params = [phone_number,target_id,memo];
			Zion.db.getJSON('axiom_sms_query_target.count.select',[phone_number,target_id],function(data){
				if(!data.f){
					if(data.r[0][0] == 1){
						Ext.Msg.alert('提示','该目标手机号码绑定重复');
						phone_window.close();
					}else{
						Zion.db.getJSON('axiom_sms_query_target.insert',params,function(data){
							if(!data.f){
								Ext.Msg.alert('提示','数据添加成功');
								query_target_grid.store.constructor({
									proxy : new Ext.data.ScriptTagProxy({
										url : ZionSetting.db.url + '/' + Zion.token
												+ '/axiom_sms_query_target.select/['+target_id+']'
									}),
									root : "r",
									fields : query_target_fields
								});
								query_target_grid.store.load();
								phone_window.close();
							}else{
								Ext.Msg.alert('提示','数据添加错误');
								phone_window.close();
							}
						})
					}
				}else{
					Ext.Msg.alert('提示','数据查询错误');
					phone_window.close();
				}
			})
			
		}
	}
	var id = [];
	function deleteForm() {
		var sm = query_target_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							id.push({phone_number:member.phone_number,target_id:member.target_id});
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
			var params_value = id.pop();
			var params = [];
			params.push(params_value.phone_number);
			params.push(params_value.target_id);
			Ext.zion.db.getJSON("axiom_sms_query_target.delete", params,
				function(data) {
					if (!data.r) {
						Ext.Msg.alert("提示", "数据删除失败");
					} else {
						if (data.r != 0 || data.r != null) {
							Ext.Msg.alert("提示", "数据删除成功");
							Ext.getCmp('delete_phone').disable();
						} else {
							Ext.Msg.alert("提示", "数据删除失败");
						}
						deleNext();
					}
				});
		} else {
			query_target_grid.store.reload();
		}
	}
	
	function loadCorpTree(callback, scope) {
		Zion.db.getJSON('tree.user_corp', null, function(data) {
			if ((data) && (data.r)) {
				if (callback) {
					callback.call(scope || window, createCorpTree(data.r));
				}

			}
		});
	}

	// ==============tree=================
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
	
	// ==============获得客户信息==============

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;

		loadCorpTree(function(tree) {
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
			items : [ {
				layout : 'border',
			  	border : false,
			  	items:[{region : 'center',
			  		layout : 'fit',   
			  		items:[grid]},query_target_grid
			  	]
			} ]
		} ]
	});

})