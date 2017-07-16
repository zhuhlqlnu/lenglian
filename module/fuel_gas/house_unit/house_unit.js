Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var add_or_update = false;
	var id = [];
	var fields = ['unit_id', 'building_id','uptown_id','uptown_name','building_name', 'unit_name', 'reg_date', 'reg_user_id', 'memo'];
	var store_sql = "house_unit.select";
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var uptown_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['uptown_id', 'uptown_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_uptown_name.select/['+selectCorpId+']'
		})
	});

	uptown_store.on('load',function(){
		var uptown_all = new uptown_store.recordType({
			uptown_id : 0,
			uptown_name:'所有'
		});
		uptown_store.insert(0,uptown_all);
	});

	var uptown_combo = new Ext.form.ComboBox({
		hiddenName : 'uptown_id',
		valueField : 'uptown_id',
		store : uptown_store,
		displayField : 'uptown_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				uptown_store.removeAll();
				setTimeout(function(){
					uptown_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				building_combo.setValue("所有");
				var uptown_id = record.data["uptown_id"];
				if(uptown_id == 0){
					building_combo.disable();
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					building_combo.enable();
					var alias = 'house_unit.by_uptown_id.select';
					var params = uptown_id;
				}
				reload_store(alias,params);
			}				
		}
	});

	var building_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['building_id', 'building_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_building_name.select/['+uptown_combo.getValue()+','+selectCorpId+']'
		})
	});

	building_store.on('load',function(){
		var building_all = new building_store.recordType({
			building_id : 0,
			building_name:'所有'
		});
		building_store.insert(0,building_all);
	});

	var building_combo = new Ext.form.ComboBox({
		disabled:true,
		hiddenName : 'building_id',
		valueField : 'building_id',
		store : building_store,
		displayField : 'building_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				building_store.removeAll();
				var uptown_id = uptown_combo.getValue();
				setTimeout(function(){
					if(uptown_id == 0 || uptown_id == ""){
						var building_name_url = '/house_building_name_all.select/['+selectCorpId+']';
					}else{
						var building_name_url = '/house_building_name.select/['+uptown_combo.getValue()+','+selectCorpId+']';
					}
					building_store.constructor({
						root : 'r',
						fields : ['building_id', 'building_name'],
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ building_name_url
						})
					});
					building_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				var uptown_id = uptown_combo.getValue();
				var building_id = record.data["building_id"];
				if(uptown_id == 0){
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					if(building_id == 0){
						var alias = 'house_unit.by_uptown_building_id.select';
						var params = uptown_id;
					}else{
						var alias = 'house_unit.by_building_id.select';
						var params = building_id;
					}
				}
				reload_store(alias,params);
			}				
		}
	});


	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : store_sql
		},
		root : "r",
		fields : fields
	});

	var sm = new Ext.grid.CheckboxSelectionModel();

	var grid = new Ext.grid.GridPanel( {
		title : '单元列表',
		store : store,
		loadMask:'查询中...',
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'unit_id',
			sortable : true,
			width: 100
		}, {
			header : "小区",
			dataIndex : 'uptown_name',
			sortable : true,
			width: 170
		}, {
			header : "楼号",
			dataIndex : 'building_name',
			sortable : true,
			width: 170
		}, {
			header : "单元",
			dataIndex : 'unit_name',
			sortable : true,
			width: 170
		}, {
			header : "创建日期",
			dataIndex : 'reg_date',
			sortable : true,
			width: 170
		}, {
			header : "备注",
			dataIndex : 'memo',
			sortable : true,
			width: 190
		} ],
		tbar : ['小区：',uptown_combo,' 楼号：',building_combo],
		listeners:{
			'render': function() {
				var tbar = new Ext.Toolbar({
					items:[{
						id : 'addButton',
						text : '新增',
						icon : Ext.zion.image_base + '/add.gif',
						tooltip : '增加',
						handler : function(){
							add_or_update = true;
							if(uptown_combo.getValue() ==""|| uptown_combo.getValue() == 0 || uptown_combo.getValue() =="所有"){
								Ext.Msg.alert("提示","请选择小区");
								return;
							}
							if(building_combo.getValue() ==""|| building_combo.getValue() == 0 || building_combo.getValue() =="所有"){
								Ext.Msg.alert("提示","请选择楼号");
								return;
							}
							house_unit();
						},
						scope : this
					},{
						id : 'editButton',
						text : '修改',
						icon : Ext.zion.image_base + '/update.gif',
						tooltip : '修改',
						disabled : true,
						handler : function(){
							add_or_update = false;
							house_unit();
						},
						scope : this
					}, {
						text : '删除',
						id : 'deleteButton',
						disabled : true,
						icon : Ext.zion.image_base + '/delete.gif',
						tooltip : '删除',
						handler : deleteForm,
						scope : this
					}, {
						text : '刷新',
						icon : Ext.zion.image_base + '/refresh.gif',
						tooltip : '刷新',
						handler : function() {
							grid.store.reload();
							uptown_store.load();
							disableButton();
						},
						scope : this
					} ]
				});
				tbar.render(this.tbar);
				
			}
		},
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
	});

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
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

	function house_unit() {
		var formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			fileUpload: true,
			items : [ {
				fieldLabel : '单元',
				name : 'unit_name',
				id : 'unit_name',
				allowBlank : false,
				blankText : '不能为空'
			},{
				fieldLabel : '备注',
				xtype : 'textarea',
				name : 'memo',
				id : 'memo'
			},{
				fieldLabel : 'ID',
				name : 'unit_id',
				id : 'unit_id',
				hideLabel : true,
				hidden : true
			} ]
		})

		// ----window表单----
		var win = new Ext.Window( {
			title : '单元信息',
			width:380,
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : function(){
					unit_process(win,formPanel.getForm());
				}
			}, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		})
		win.show();
		if(add_or_update == false){
			var sm = grid.getSelectionModel().getSelected();
			formPanel.form.loadRecord(sm);
		}
	}
	
	function unit_process(win,form){
		if (form.isValid() == false) {
			return false;
		}else{
			var building_id = building_combo.getValue();
			var unit_name = Ext.getCmp("unit_name").getValue();
			var memo = Ext.getCmp("memo").getValue();
			if(add_or_update){
				var params = [building_id,unit_name,memo];
				Zion.db.getJSON('house_unit.insert',params,function(data){
					if(data.r){
						win.close();
						grid.store.reload();
						disableButton();
						Ext.Msg.alert("提示", "数据添加成功");
					}else{
						Ext.Msg.alert("提示", "数据添加失败");
					}
				});
			}else{
				var unit_id = Ext.getCmp("unit_id").getValue();
				var params = [unit_name,memo,unit_id];
				Zion.db.getJSON('house_unit.update',params,function(data){
					if(data.r){
						win.close();
						grid.store.reload();
						disableButton();
						Ext.Msg.alert("提示", "数据修改成功");
					}else{
						Ext.Msg.alert("提示", "数据修改失败");
					}
				});
			}
		}
	}
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
								id.push(member.unit_id);
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
			var unit_id = id.pop();
			Zion.db.getJSON('house_unit.delete',[unit_id],function(data){
				if(data.r){
					Ext.Msg.alert("提示", "数据删除成功");		
				} else {
					Ext.Msg.alert("提示", "数据删除失败");
				}
				deleNext();
			});
		} else {
			disableButton();
			grid.store.reload();
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
				disableButton();
				building_combo.disable();
				selectCorpId = node.attributes.corp.corp_id;
				reload_store(store_sql,selectCorpId);
				uptown_combo.reset();
				building_combo.reset();
				uptown_store.removeAll();
				building_combo.setValue("所有");
				uptown_store.constructor({
					root : 'r',
					fields : ['uptown_id', 'uptown_name'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/house_uptown_name.select/['+selectCorpId+']'
					})
				});
				uptown_store.load();
			}
		}
	});
	function disableButton() {
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
			corp_tree.getRootNode().childNodes[0].select();			
		});
		reload_store(store_sql,selectCorpId);
		uptown_store.constructor({
			root : 'r',
			fields : ['uptown_id', 'uptown_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/house_uptown_name.select/['+selectCorpId+']'
			})
		});
		uptown_store.load();
		uptown_combo.setValue("所有")
		building_combo.setValue("所有");
	});
	
	function reload_store(alias,params){
		store.constructor( {
			db : {
				alias : alias,
				params : [ params ]
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
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			region : 'center',
			layout : 'fit',
			items : [grid]
		}]
	});
})