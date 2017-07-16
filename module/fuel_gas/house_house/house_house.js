Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var add_or_update = false;
	var id = [];
	var fields = ['house_id','uptown_id','uptown_name','building_id','building_name','unit_id','unit_name','house_name','reg_date','reg_user_id','memo','owner_name','telphone','gas_name', 'left_right', 'gas_bottom', 'steel_grade','population'];
	var store_sql = "house_house.select";
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
				unit_combo.setValue("所有");
				unit_combo.disable();
				var uptown_id = record.data["uptown_id"];
				if(uptown_id == 0){
					building_combo.disable();
					unit_combo.disable();
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					building_combo.enable();
					var alias = 'house_house.by_uptown_id.select';
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
				unit_combo.setValue("所有");
				var uptown_id = uptown_combo.getValue();
				var building_id = record.data["building_id"];
				if(uptown_id == 0){
					unit_combo.disable();
					var alias = store_sql;
					var params = selectCorpId;
				}else{
					if(building_id == 0){
						var alias = 'house_house.by_uptown_building_id.select';
						var params = uptown_id;
						unit_combo.disable();
					}else{
						unit_combo.enable();
						var alias = 'house_house.by_building_id.select';
						var params = building_id;
					}
				}
				reload_store(alias,params);
			}				
		}
	});

	var unit_store = new Ext.data.SimpleStore({
		root : 'r',
		fields : ['unit_id', 'unit_name'],
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/house_unit_name.select/['+building_combo.getValue()+','+selectCorpId+']'
		})
	});

	unit_store.on('load',function(){
		var unit_all = new unit_store.recordType({
			unit_id : 0,
			unit_name:'所有'
		});
		unit_store.insert(0,unit_all);
	});

	var unit_combo = new Ext.form.ComboBox({
		disabled:true,
		hiddenName : 'unit_id',
		valueField : 'unit_id',
		store : unit_store,
		displayField : 'unit_name',
		width:130,
		editable : false,
		triggerAction : 'all',
		listeners : {
			'expand':function(this_){
				unit_store.removeAll();
				var building_id = building_combo.getValue();
				var uptown_id = uptown_combo.getValue();
				setTimeout(function(){
					if(building_id == 0 || building_id == ""){
						var unit_name_url = '/house_unit_name_all.select/['+selectCorpId+','+uptown_id+']';
					}else{
						var unit_name_url = '/house_unit_name.select/['+building_combo.getValue()+']';
					}
					unit_store.constructor({
						root : 'r',
						fields : ['unit_id', 'unit_name'],
						proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ unit_name_url
						})
					});
					unit_store.load();
				},0);
			},
			'select' : function(this_, record, index){
				var unit_id = record.data["unit_id"];
				var building_id = building_combo.getValue();
				var uptown_id = uptown_combo.getValue();
				if(unit_id == 0 || unit_id == ""){
					var alias = 'house_house.by_building_id.select';
					var params = building_id;
				}else{
					var alias = 'house_house.by_unit_id.select';
					var params = unit_id;
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
		title : '门牌列表',
		store : store,
		loadMask:'查询中...',
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'house_id',
			sortable : true,
			width: 50
		}, {
			header : "小区",
			dataIndex : 'uptown_name',
			sortable : true,
			width: 120
		}, {
			header : "楼号",
			dataIndex : 'building_name',
			sortable : true,
			width: 120
		}, {
			header : "单元",
			dataIndex : 'unit_name',
			sortable : true,
			width: 120
		}, {
			header : "门牌",
			dataIndex : 'house_name',
			sortable : true,
			width: 120
		}, {
			header : "户主",
			dataIndex : 'owner_name',
			sortable : true,
			width: 120
		}, {
			header : "联系电话",
			dataIndex : 'telphone',
			sortable : true,
			width: 120
		}, {
			header : "常驻人口",
			dataIndex : 'population',
			sortable : true,
			width: 80
		}, {
			header : "燃气表",
			dataIndex : 'gas_name',
			sortable : true,
			width: 80
		}, {
			header : "进气方式",
			dataIndex : 'left_right',
			sortable : true,
			width: 80
		}, {
			header : "表底",
			dataIndex : 'gas_bottom',
			sortable : true,
			width: 150
		}, {
			header : "钢号",
			dataIndex : 'steel_grade',
			sortable : true,
			width: 150
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
		tbar : ['小区：',uptown_combo,' 楼号：',building_combo,' 单元：',unit_combo],
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
							if(unit_combo.getValue() ==""|| unit_combo.getValue() == 0 || unit_combo.getValue() =="所有"){
								Ext.Msg.alert("提示","请选择单元");
								return;
							}
							house_house();
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
							house_house();
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

	function house_house() {
		var left_right_store = new Ext.data.SimpleStore( {
			fields : [ 'left_right'],
			data : [['左进'],['右进']]
		});
		var left_right_combo = new Ext.form.ComboBox( {
			fieldLabel : '进气方式',
			hiddenName : 'left_right',
			valueField : 'left_right',
			store : left_right_store,
			displayField : 'left_right',
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});
		
		var gas_name_store = new Ext.data.SimpleStore( {
			fields : [ 'gas_name'],
			data : [['先锋'],['贝特'],['蓝宝石']]
		});
		var gas_name_combo = new Ext.form.ComboBox( {
			fieldLabel : '燃气表',
			hiddenName : 'gas_name',
			valueField : 'gas_name',
			store : gas_name_store,
			displayField : 'gas_name',
			mode : 'local',
			editable : false,
			triggerAction : 'all'
		});

		var formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			fileUpload: true,
			items : [ {
				fieldLabel : '门牌',
				name : 'house_name',
				id : 'house_name',
				allowBlank : false,
				blankText : '不能为空'
			},{
				fieldLabel : '户主',
				name : 'owner_name',
				id : 'owner_name',
				maxLength:12,
				allowBlank : false,
				blankText : '不能为空'
			}, {
				fieldLabel : '联系电话',
				name : 'telphone',
				id : 'telphone'
			}, {
				fieldLabel : '常住人口',
				name : 'population',
				id : 'population'
			}, gas_name_combo, left_right_combo,{
				fieldLabel : '表底',
				name : 'gas_bottom',
				id : 'gas_bottom'
			}, {
				fieldLabel : '钢号',
				name : 'steel_grade',
				id : 'steel_grade'
			},{
				fieldLabel : '备注',
				xtype : 'textarea',
				name : 'memo',
				id : 'memo'
			},{
				fieldLabel : 'ID',
				name : 'house_id',
				id : 'house_id',
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
					house_process(win,formPanel);
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
	
	function house_process(win,form){
		if (form.getForm().isValid() == false) {
			return false;
		}else{
			var params = Ext.zion.form.getParams(form.form,['house_name', 'memo', 'owner_name', 'telphone', 'gas_name', 'left_right', 'gas_bottom', 'steel_grade', 'population']);
			if(add_or_update){
				var unit_id = unit_combo.getValue();
				params.unshift(unit_id);
				Zion.db.getJSON('house_house.insert',params,function(data){
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
				var house_id = Ext.getCmp("house_id").getValue();
				params.push(house_id);
				Zion.db.getJSON('house_house.update',params,function(data){
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
			Zion.db.getJSON('house_house.delete',[unit_id],function(data){
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
				unit_combo.disable();
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
		uptown_combo.setValue("所有");
		building_combo.setValue("所有");
		unit_combo.setValue("所有");
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