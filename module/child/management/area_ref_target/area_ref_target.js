Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var reftargetid;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();


	function loadTargetTree(callback, scope) {
		function createTargetTree(corp_list, group_list, target_list, target_no_group_list) {
			var corps = [];
			var corps_map = {};
			for ( var i = 0; i < corp_list.length; i++) {
				var add = true;
				corps_map[corp_list[i][0]] = corp_list[i];
				for ( var j = 0; j < corp_list.length; j++) {
					if (corp_list[j][0] == corp_list[i][1]) {
						if (!corp_list[j].corps) {
							corp_list[j].corps = [];
						}
						corp_list[j].corps.push(corp_list[i]);
						add = false;
						break;
					}
				}
				if (add) {
					corps.push(corp_list[i]);
				}
			}

			var groups_map = {};
			for ( var i = 0; i < group_list.length; i++) {
				var add = true;
				groups_map[group_list[i][0]] = group_list[i];
				for ( var j = 0; j < group_list.length; j++) {
					if (group_list[j][0] == group_list[i][1]) {
						if (!group_list[j].groups) {
							group_list[j].groups = [];
						}
						group_list[j].groups.push(group_list[i]);
						add = false;
						break;
					}
				}
				if (add) {
					if (corps_map[group_list[i][2]]) {
						if (!corps_map[group_list[i][2]].groups) {
							corps_map[group_list[i][2]].groups = [];
						}
						corps_map[group_list[i][2]].groups.push(group_list[i]);
					} else {
						if (!corps[0].groups) {
							corps[0].groups = [];
						}
						corps[0].groups.push(group_list[i]);
					}
				}
			}

			for ( var i = 0; i < target_list.length; i++) {
				if (!groups_map[target_list[i][1]].targets) {
					groups_map[target_list[i][1]].targets = [];
				}
				groups_map[target_list[i][1]].targets.push(target_list[i]);
			}

			for ( var i = 0; i < target_no_group_list.length; i++) {
				if (!corps_map[target_no_group_list[i][1]].targets) {
					corps_map[target_no_group_list[i][1]].targets = [];
				}
				corps_map[target_no_group_list[i][1]].targets.push(target_no_group_list[i]);
			}

			function addGroup(node, group) {
				var nd = {
					text : group[3],
					checked : false,
					group : {
						group_id : group[0]
					}
				};
				node.children.push(nd);
				if (group.groups) {
					nd.children = [];
					nd.expanded = true;
					for ( var i = 0; i < group.groups.length; i++) {
						addGroup(nd, group.groups[i]);
					}
				}

				if (group.targets) {
					if (!nd.children) {
						nd.children = [];
						nd.expanded = true;
					}
					for ( var i = 0; i < group.targets.length; i++) {
						var target = group.targets[i];
						var ndTarget = {
							text : target[2],
							checked : false,
							target : {
								target_id : target[0]
							},
							leaf : true
						}
						nd.children.push(ndTarget);
					}
				} else {
					nd.leaf = true;
				}
			}

			function addCorp(node, corp) {
				var nd = {
					text : corp[2],
					checked : false,
					corp : {
						corp_id : corp[0]
					},
					expanded : true
				};
				node.children.push(nd);
				var leaf = true;

				if (corp.groups) {
					leaf = false
					nd.children = [];
					for ( var i = 0; i < corp.groups.length; i++) {
						addGroup(nd, corp.groups[i]);
					}
				}

				if (corp.targets) {
					leaf = false;
					if (!nd.children) {
						nd.children = [];
					}
					for ( var i = 0; i < corp.targets.length; i++) {
						var target = corp.targets[i];
						var ndTarget = {
							text : target[2],
							checked : false,
							target : {
								target_id : target[0]
							},
							leaf : true
						}
						nd.children.push(ndTarget);
					}
				}

				if (corp.corps) {
					leaf = false;
					if (!nd.children) {
						nd.children = [];
					}
					for ( var i = 0; i < corp.corps.length; i++) {
						addCorp(nd, corp.corps[i]);
					}
				}

				if (leaf) {
					nd.leaf = true;
				}
			}

			var tree = {
				children : []
			};

			for ( var i = 0; i < corps.length; i++) {
				addCorp(tree, corps[i]);
			}

			return tree;
		}

		Zion.db.getJSON('monitor.realtime.user_corp', null, function(data) {
			if ((data) && (data.r)) {
				var corp_list = data.r;
				Zion.db.getJSON('monitor.realtime.user_group', null, function(data) {
					if ((data) && (data.r)) {
						var group_list = data.r;
						Zion.db.getJSON('monitor.realtime.user_target', null, function(data) {
							if ((data) && (data.r)) {
								var target_list = data.r;
								Zion.db.getJSON('monitor.realtime.user_target_no_group', null, function(data) {
									if ((data) && (data.r)) {
										var target_no_group_list = data.r;
										if (callback) {
											callback.call(scope || window, createTargetTree(corp_list, group_list, target_list, target_no_group_list));
										}
									}
								});
							}
						});
					}
				});
			}
		});
	}

	var targetTree = new Ext.tree.TreePanel( {
		flex : 1,
		autoScroll: true,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			checkchange : function(node, checked) {
				node.attributes.checked = checked;
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
			},
			dblclick : function(node) {
				//alert(node.attributes.target.target_id);
				//areaAlarmPanel.layout.setActiveItem(refgrid);
				//target.moveToTarget(node.attributes.target.target_id, true);
				if (node.attributes.target) {
					loadMask.show();
					reloadRefAreaAlarm(node.attributes.target.target_id);
					reftargetid = node.attributes.target.target_id;
				}
			}
		}
	});
	
	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.zion.db.ArrayStore({
		db:{alias: "axiom_areaalarm.select"},
		root: 'r',
		fields: [
			'id','name','xy','ep_code','createdate','createman','flag','area_type'
		]
	});

    var grid = new Ext.grid.GridPanel({
    	title: '区域列表',
    	height: 200,
        store: store,
        sm : sm,
        columns: [
        	sm,
        	{id:'id',header: "id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
        	{header: "xy", width: 10, sortable: true, dataIndex: 'xy',hidden:true},
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
            {header: '区域名称', width: 200, sortable: true, dataIndex: 'name'},
            {header: '区域类型', width: 75, sortable: true, dataIndex: 'area_type',hidden:true}
        ],
        bbar: new Ext.PagingToolbar({
			store: store,
			pageSize: Ext.zion.page.limit,
			displayInfo : true 
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		tbar: [{
			text : '刷新',
			icon : '/image/module/refresh.gif',
			tooltip : '刷新记录',
			handler : function() {
				grid.store.reload();
			},
			scope : this
		},'-', {
			id : 'bindButton',
			text : '绑定',
			icon : '/image/module/refresh.gif',
			tooltip : '终端绑定区域',
			handler : bindData,
			disabled : true,
			scope : this
		}],
		listeners: {
        	rowcontextmenu: function(grid, rowIndex, e){
        		e.preventDefault();
        		var gridMenu = new Ext.menu.Menu
	            ([
	                {text:"查看区域",icon:"",handler:function(){
	                	var tmprecord = grid.getStore().getAt(rowIndex);
	                	var tmpareaPoints = tmprecord.get('xy');
	                	var tmpareaName  = tmprecord.get('name');
	                	var tmpxyArr = tmpareaPoints.split('#');
	                	if(tmpxyArr.length<=1){
	                		Ext.Msg.alert('提示','错误数据');
	                		return;
	                	}
						var points = [];
						//var bounds = [];
						var tmpxy = tmpxyArr[0].split(',');
						var x = tmpxy[0];
						var y = tmpxy[1];
						for(var i = 0;i < tmpxyArr.length;i++){
							var tmpxy = tmpxyArr[i].split(',');
							//alert(tmpxy[0]+','+tmpxy[1]);
							points.push(new GLatLng(tmpxy[1],tmpxy[0]));
							//bounds.push(new GPoint(x:tmpxy[0] , y:tmpxy[1]));
						}
						points.push(new GLatLng(y,x));
						map.clearOverlays();
						var Polygon = new GPolygon(points,'#FF0000',3,0.5,'#ffff00',0.5)
						var bounds = Polygon.getBounds();
						map.addOverlay(Polygon); 
						map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
	                }}
	            ]);
	            gridMenu.showAt(e.getPoint());
        	}
        }
    });
    
    store.load({params:{start:0,limit:Ext.zion.page.limit}});
    sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
	});
	
	var refsm = new Ext.grid.CheckboxSelectionModel({});
	var refstore = new Ext.data.ArrayStore({
		root: 'r',
		fields: [ 'id','name','xy','createdate','areaid','target_id','alarm_type','start_time','end_time' ]
	});

    var refgrid = new Ext.grid.GridPanel({
    	title: '终端区域报警列表',
    	height: 200,
        store: refstore,
        autoScroll: true,
        sm : refsm,
        columns: [
        	refsm,
        	{id:'id',header: "id", width: 10, sortable: true, dataIndex: 'id',hidden:true},
        	{header: "xy", width: 10, sortable: true, dataIndex: 'xy',hidden:true},
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
            {header: '区域名称', width: 100, sortable: true, dataIndex: 'name'},
            {header: '创建日期', width: 130, sortable: true, dataIndex: 'createdate'},
            {header: 'areaid', width: 75, sortable: true, dataIndex: 'areaid',hidden:true},
            {header: 'target_id', width: 75, sortable: true, dataIndex: 'target_id',hidden:true},
            {header: '报警类型', width: 100, sortable: true, dataIndex: 'alarm_type',renderer:function(val){
		    	if(val == 1){return '进区域';}else if(val == 0){return '出区域';}
		    }},
            {header: '开始时间', width: 130, sortable: true, dataIndex: 'start_time'},
            {header: '结束时间', width: 130, sortable: true, dataIndex: 'end_time'}
            
        ],
		tbar: [{
			text : '区域列表',
			icon : '/image/module/refresh.gif',
			tooltip : '区域列表',
			handler : function() {
				//grid.store.reload();
				disableButton();
				areaAlarmPanel.layout.setActiveItem(grid);
			},
			scope : this
		},{
			text : '删除',
			id : 'refdeleteButton',
			icon : '/image/module/delete.gif',
			tooltip : '删除记录',
			scope : this,
			disabled : true,
			handler : refdeleteData
		}],
		bbar_ : new Ext.PagingToolbar( {
			store : refstore,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		listeners: {
        	rowcontextmenu: function(grid, rowIndex, e){
        		e.preventDefault();
        		var gridMenu = new Ext.menu.Menu
	            ([
	                {text:"查看区域",icon:"",handler:function(){
	                	var tmprecord = grid.getStore().getAt(rowIndex);
	                	var tmpareaPoints = tmprecord.get('xy');
	                	//var tmpareaName  = tmprecord.get('name');
	                	var tmpxyArr = tmpareaPoints.split('#');
	                	if(tmpxyArr.length<=1){
	                		Ext.Msg.alert('提示','错误数据');
	                		return;
	                	}
						var points = [];
						//var bounds = [];
						var tmpxy = tmpxyArr[0].split(',');
						var x = tmpxy[0];
						var y = tmpxy[1];
						for(var i = 0;i < tmpxyArr.length;i++){
							var tmpxy = tmpxyArr[i].split(',');
							//alert(tmpxy[0]+','+tmpxy[1]);
							points.push(new GLatLng(tmpxy[1],tmpxy[0]));
							//bounds.push(new GPoint(x:tmpxy[0] , y:tmpxy[1]));
						}
						points.push(new GLatLng(y,x));
						map.clearOverlays();
						var Polygon = new GPolygon(points,'#FF0000',3,0.5,'#ffff00',0.5)
						var bounds = Polygon.getBounds();
						map.addOverlay(Polygon); 
						map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
	                }}
	            ]);
	            gridMenu.showAt(e.getPoint());
        	}
        }
    });
    refsm.on('rowselect', function() {
		if (refgrid.selModel.getSelections().length == 1) {
			Ext.getCmp('refdeleteButton').enable();
		} else {
			Ext.getCmp('refdeleteButton').disable();
		}
		if (refgrid.selModel.getSelections().length != 0) {
			Ext.getCmp('refdeleteButton').enable();
		} else {
			Ext.getCmp('refdeleteButton').disable();
		}
	});
	refsm.on('rowdeselect', function() {
		if (refgrid.selModel.getSelections().length == 1) {
			Ext.getCmp('refdeleteButton').enable();
		} else {
			Ext.getCmp('refdeleteButton').disable();
		}
		if (refgrid.selModel.getSelections().length != 0) {
			Ext.getCmp('refdeleteButton').enable();
		} else {
			Ext.getCmp('refdeleteButton').disable();
		}
	});
    var areaAlarmPanel = new Ext.Panel({
    	height: 200,
		activeItem: 0,
		layout:'card',
		items: [grid , refgrid]
	});
	
	var westPanel = new Ext.Panel({
		title : '人员列表',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		margins : '5 0 0 0',
		cmargins : '5 5 0 0',
		width : 300,
		layout:'vbox',
		layoutConfig: {
		    align : 'stretch',
		    pack  : 'start'
		},
		items: [
			targetTree , areaAlarmPanel
		]
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ westPanel , {
			layout : 'fit',
			region : 'center',
			contentEl : 'map_canvas',
			listeners : {
				bodyresize : function(p, width, height) {
					//alert(width);
					//alert(height);
					if(width != undefined){
						document.getElementById("map_canvas").style.width = width;
					}
					if(height != undefined){
						document.getElementById("map_canvas").style.height = height;
					}
					if (map) {
						map.checkResize();
					}
				}
			}
		}]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	});
	
	function reloadRefAreaAlarm(tagetid) {
		Zion.db.getJSON("axiom_areaalarm.ref_byid.select", [tagetid], function(data) {
			refstore.loadData(data);
			areaAlarmPanel.layout.setActiveItem(refgrid);
			loadMask.hide();
		});
	}
	
	function bindData() {
		var arr = [];
		var root = targetTree.getRootNode();
		if(root.attributes.checked == true){
			arr.push(root.attributes.target.target_id);
		}
		getCheckNode(root , arr);
		if(arr.length <= 0){
			Ext.Msg.alert('提示','请选择终端');
			return;
		}
		formPanel = new Ext.form.FormPanel({
	    	xtype: 'form',
	        labelWidth: 80,
	        labelAlign: 'left',
	        width: 250,
	        layout: 'form',
	        items: [{
				id: 'refTermAreaIdfrm',
			    xtype: 'hidden'
			},/*{
			    id: 'refTermAreaNamefrm',
			    xtype: 'label',
			    fieldLabel: '区域名称',
			    allowBlank:false
			},*/{
			    id: 'areaAlarmTypefrm',
			    xtype: 'combo',
			    fieldLabel:'报警类型',
			    editable:false, 
			    displayField:'name',
			    width: 150,
			    store: new Ext.data.ArrayStore({
			    	fields: ['id', 'name'],
			    	data : [[1,'进区域'],[0,'出区域']]
			    }),
			    	displayField:'name',
			    	valueField: 'id',
			    	typeAhead: true, 
			    	mode: 'local', 
			    	forceSelection: true, 
			    	triggerAction: 'all',
			    	value:'1', 
			    	selectOnFocus:true
				},{
					width: 150,
					xtype: 'timefield',
					id: 'areaAlarmStartTimefrm',
				    fieldLabel: '开始时间',
				    format:'H:i',
				    value:'08:00',
					increment: 1
				},{
				    width: 150,
					xtype: 'timefield',
					id: 'areaAlarmEndTimefrm',
				    fieldLabel: '结束时间',
				    format:'H:i',
				    value:'18:00',
					increment: 1
			}]
	   });
	   var win = new Ext.Window( {
				title : '区域报警设置',
				closable : true,
				closeAction : 'close',
				autoWidth : false,
				width : 500,
				items : [ formPanel ],
				buttons : [ {
					text : '保存',
					id : 'save',
					handler : function() {
						//alert(arr.length);
						var tmpselArr = sm.getSelections();
						var flag = true;
						var alarm_type = Ext.getCmp('areaAlarmTypefrm').getValue();
						var start_time = Ext.getCmp('areaAlarmStartTimefrm').getValue();
						var end_time = Ext.getCmp('areaAlarmEndTimefrm').getValue();
						
						for(var j = 0;j < arr.length;j++){
							var tagetid = arr[j];
								var delparams = [];
								delparams.push(tagetid);
								Ext.zion.db.getJSON("axiom_areaalarm.ref_by_targetid.delete", delparams, function(data) {
									//alert(data.r);
									//if (data.r.length >0 ) {
										//alert(areaid+':'+tagetid+';查询到终端已绑定该区域');
									//} else {
										//alert(areaid+':'+tagetid+';终端绑定区域');
										
									//}
								});
						}
						for(var i = 0;i < tmpselArr.length;i++){
							var areaid = tmpselArr[i].get('id');
							for(var j = 0;j < arr.length;j++){
								var tagetid = arr[j];
								var insertparams = [];
								insertparams.push(areaid);
								insertparams.push(tagetid);
								insertparams.push(alarm_type);
								insertparams.push(start_time);
								insertparams.push(end_time);
								
								Ext.zion.db.getJSON("axiom_areaalarm.ref.insert", insertparams, function(data) {
									if (data.r == 1) {
										flag = true;
									} else {
										flag = false;
									}
								});
							}
						}
						if(flag){
							Ext.Msg.alert("提示", "数据添加成功");
						}else{
							Ext.Msg.alert("提示", "数据添加错误");
						}
						win.close();
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
	
	function getCheckNode(node , arr){
		var childnodes = node.childNodes;
		for(var i=0;i<childnodes.length;i++){
	    	var rootnode = childnodes[i];
			if(rootnode.attributes.checked == true){
				arr.push(rootnode.attributes.target.target_id);
			}
	        if(rootnode.childNodes.length>0){
	        	getCheckNode(rootnode , arr);
	        }
	    }
	}
	
	function refdeleteData(){
		var sm = refgrid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var id = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.id);
					}
					var deleteNext = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("axiom_areaalarm.ref_by_id.delete", [ id.pop() ], function(data) {
								deleteNext(id);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							reloadRefAreaAlarm(reftargetid);
							disableButton();
						}
					};
					deleteNext(id);
				}
			})
		}
	}
	function disableButton() {
		Ext.getCmp('refdeleteButton').disable();
	}
});