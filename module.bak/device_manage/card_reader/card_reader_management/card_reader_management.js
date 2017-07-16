Ext.onReady(function() {
	Ext.QuickTips.init();
	
	var marker;
	var g_x;
	var g_y;
	var e_click;

	var store_sql = "axiom_target.axiom_terminal_location.select";
	var fields = [ 'target_id', 'target_name', 'terminal_id', 'terminal_sn','identity','overspeed','overweight','longitude','latitude','terminal_location_id'];
	
	var add_or_update = false;
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
	
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('selectButton').enable();
		} else {
			Ext.getCmp('selectButton').disable();
		}
		if (grid.selModel.getSelections().length ==1) {
			Ext.getCmp('addButton').enable();
		} else {
			Ext.getCmp('addButton').disable();
		}
	})

	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('selectButton').enable();
		} else {
			Ext.getCmp('selectButton').disable();
		}
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('addButton').enable();
		} else {
			Ext.getCmp('addButton').disable();
		}
		map.clearOverlays();
	})
	var grid = new Ext.grid.GridPanel( {
		title:'监测点列表',
		store : store,
		sm : sm,
		columns : [ sm, {
			header : "序号",
			dataIndex : 'target_id',
			width :30,
			sortable : true
		}, {
			header : "名称",
			dataIndex : 'terminal_sn',
			width : 40,
			sortable : true
		}, {
			header : "条件",
			width : 50,
			sortable : true,
			renderer:function(v,c,r){
				var overweight = r.data["overweight"];
				if(overweight == null || overweight == ""){
					overweight = "";
				}else{
					overweight = "重量限制："+overweight+"吨 ";
				}
				return overweight;
			}
		}],
		tbar:[{
			id : 'addButton',
			text : '标注',
			disabled:true,
			icon : Ext.zion.image_base + '/add.gif',
			tooltip : '在地图上标注监测点',
			handler : function() {
				add_or_update = true;
				add_card_reader();
			},
			scope : this
		},/*{
			id : 'updateButton',
			text : '修改',
			disabled:true,
			icon : Ext.zion.image_base + '/update.gif',
			tooltip : '修改监测点',
			handler : function() {
				add_or_update = false;
				update_card_reader();
			},
			scope : this
		},*/{
			id : 'selectButton',
			text : '查询',
			disabled:true,
			icon : Ext.zion.image_base + '/select.gif',
			tooltip : '查询监测点',
			handler : function() {
				show_point();
			},
			scope : this
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

	// ==============tree=================

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

	function loadCorpTree(callback, scope) {
		Zion.db.getJSON('tree.user_corp', null, function(data) {
			if ((data) && (data.r)) {
				if (callback) {
					callback.call(scope || window, createCorpTree(data.r));
				}

			}
		});
	}

	var corp_tree = new Ext.tree.TreePanel( {
		title : '集团列表',
		id : 'tree_id',
		autoScroll : true,
		split : true,
		region : 'north',
		layout:'fit',
		height:300,
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
				disable_button();
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
	
	function add_card_reader(){
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		g_x = null;
		g_y = null;
		e_click = GEvent.addListener(map, "click", function(marker_, latlng_, overlaylatlng_) {
			var latlng = null;
			if(latlng_){
				latlng = latlng_;
			}else if(overlaylatlng_){
				latlng = overlaylatlng_;
			}
			g_x = latlng.lng();
			g_y = latlng.lat();
			g_x = parseInt(g_x*1000000)/1000000;
			g_y = parseInt(g_y*1000000)/1000000;
			var targetIcon = new GIcon();
			targetIcon.iconSize = new GSize(20, 34);
			targetIcon.iconAnchor = new GPoint(10, 34);
			targetIcon.image = "1.png";

			var markerOptions = {
				icon : targetIcon,
				clickable : false
			}
			var point = new GLatLng(g_y, g_x);
			marker = new GMarker(point, markerOptions);
			map.addOverlay(marker);
			show_window();
			var sm = grid.getSelectionModel().getSelected();
			formPanel.form.loadRecord(sm);
			removeListener();
        });
    }
	
    function show_window(){	
    	formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			labelWidth:80,
			items : [{
				fieldLabel : '超重(吨)',
				xtype:'numberfield',
				name : 'overweight',
				id:'overweight',
				width:230,
				maxLength : 64
			},{
				fieldLabel : '限速(公里/时)',
				name : 'overspeed',
				xtype:'numberfield',
				id:'overspeed',
				hidden : true,
				hideLabel : true,
				width:230,
				maxLength : 64
			},{
				fieldLabel : 'terminal_location_id',
				maxLength : 12,
				hidden : true,
				hideLabel : true,
				id : 'terminal_location_id'
			}]
		})
		var win = new Ext.Window( {
			title : '监测点',
			closable : true,
			items : [ formPanel ],
			buttons : [ {
				id : 'save',
				text : '保存',
				handler : function() {
					if(formPanel.getForm().isValid() == false){
						return;
					}else{
						var sm = grid.getSelectionModel().getSelected();
						var terminal_sn = sm.data.terminal_sn;
						var overweight = Ext.getCmp('overweight').getValue();
						var overspeed = Ext.getCmp('overspeed').getValue();
						Zion.db.getJSON('axiom_terminal_card_location.select',[terminal_sn],function(data){
							if(!data.f){
								if(data.r == '' || data.r == null){
									var params = [terminal_sn,g_x,g_y,selectCorpId,overspeed,overweight];
									Zion.db.getJSON('card_reader.axiom_terminal_card_location.insert',params,function(data){
										if(data.r){
											Ext.Msg.alert('提示','添加成功');
											grid.store.reload();
											disable_button();
											win.close();
										}else{
											Ext.Msg.alert('提示','添加失败');
											disable_button();
											win.close();
										}
									})
								}else{
									var terminal_location_id = Ext.getCmp('terminal_location_id').getValue();
									var params = [terminal_sn,overweight,overspeed,g_x,g_y,terminal_location_id];
									Zion.db.getJSON('card_reader.axiom_terminal_card_location.update',params,function(data){
										if(data.r){
											Ext.Msg.alert('提示','修改成功');
											grid.store.reload();
											disable_button();
											win.close();
										}else{
											Ext.Msg.alert('提示','修改失败');
											disable_button();
											win.close();
										}
									})
								}
							}else{
							}
						})
					}
				}
			}, {
				text : '取消',
				id : 'cancel',
				handler : function() {
					if(marker){
						map.removeOverlay(marker);
						marker = null;
					}
					formPanel.form.reset();
					win.close();
				}
			} ]
		})
		win.show();
    }
    
    function disable_button(){
    	Ext.getCmp('addButton').disable();
    	Ext.getCmp('selectButton').disable();
    }
    
    function removeListener(){
		if(e_click){
			GEvent.removeListener(e_click);
			e_click = null;
		}
	}
	
	function update_card_reader(){
		show_point();
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		var sm = grid.getSelectionModel().getSelected();
		show_window();
		formPanel.form.loadRecord(sm);
	}
	
	function show_point(){
		if(marker){
			map.removeOverlay(marker);
			marker = null;
		}
		var sm = grid.getSelectionModel().getSelected();
		var terminal_location_id = sm.data.terminal_location_id;
		Zion.db.getJSON('axiom_target.axiom_terminal_location.select',[terminal_location_id],function(data){
			if(!data.f){
				if(data.r == "" || data.r == null){
					return;
				}else{
					var data_value = data.r;
					var lat = data_value[0][3];
					var lng = data_value[0][2];					
					var targetIcon = new GIcon();
					targetIcon.iconSize = new GSize(20, 34);
					targetIcon.iconAnchor = new GPoint(10, 34);
					targetIcon.image = "1.png";
					var markerOptions = {
						icon : targetIcon,
						clickable : false
					}
					var point = new GLatLng(lat, lng);
					marker = new GMarker(point, markerOptions);
					map.addOverlay(marker);
					map.setCenter(point);
				}
			}else{
				Ext.Msg.alert('提示','监测点查询失败');
			}
		})
	}

	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(50.702659,116.077251), 4);
	
	var panel = new Ext.Panel({
		layout : 'border',
		border : false,
		items : [ corp_tree, {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		}]
	})
	// grid自适应
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [  {
			width:250,
			split:true,
			collapsible : true,
			region : 'west',
			layout : 'fit',
			items : [ panel ]
		}, {
			layout : 'border',
			region : 'center',
			items : [ {
				layout : 'fit',
				region : 'center',
				contentEl : 'map_canvas',
				cmargins : '5 0 0 0',
				listeners : {
					bodyresize : function(p, width, height) {
						document.getElementById("map_canvas").style.width = width;
						document.getElementById("map_canvas").style.height = height;
						if (map) {
							map.checkResize();
						}
					}
				}
			} ]
		} ]
	});

})