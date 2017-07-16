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
			//dblclick : function(node) {
			click : function(node) {
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
		db:{alias: "axiom_routealarm.select"},
		root: 'r',
		fields: [
			'route_id','route_name','points','corp_id','reg_user_id','reg_time','memo'
		]
	});

    var grid = new Ext.grid.GridPanel({
    	title: '路线列表',
    	height: 200,
        store: store,
        sm : sm,
        columns: [
        	sm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{id:'route_id',header: "route_id", width: 10, sortable: true, dataIndex: 'route_id',hidden:true},
            {header: '路线名称', width: 130, sortable: true, dataIndex: 'route_name'},
        	{header: "points", width: 10, sortable: true, dataIndex: 'points',hidden:true},
        	{header: "corp_id", width: 10, sortable: true, dataIndex: 'corp_id',hidden:true},
        	{header: "reg_user_id", width: 10, sortable: true, dataIndex: 'reg_user_id',hidden:true},
        	{header: "创建时间", width: 130, sortable: true, dataIndex: 'reg_time'},
        	{header: "备注", width: 130, sortable: true, dataIndex: 'memo'}
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
	                {text:"查看路线",icon:"",handler:function(){
	                	var tmprecord = grid.getStore().getAt(rowIndex);
	                	var tmppoints = tmprecord.get('points');
	                	var tmpareaName  = tmprecord.get('route_name');
	                	var tmpxyArr = tmppoints.split('|');
	                	if(tmpxyArr.length<=1){
	                		Ext.Msg.alert('提示','错误数据');
	                		return;
	                	}
						var points = [];
						for(var i = 0;i < tmpxyArr.length;i++){
							var tmpxy = tmpxyArr[i].split(',');
							points.push(new GLatLng(tmpxy[1],tmpxy[0]));
						}
						map.clearOverlays();
						var Polygon = new GPolyline(points,'#FF0000',3,0.5);
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
		fields: [ 'target_route_id', 'target_id', 'route_id', 'distance', 'alarm_type', 
		'start_time', 'end_time', 'reg_user_id', 'reg_time', 'memo' ,'route_name' ,'points' ]
	});

    var refgrid = new Ext.grid.GridPanel({
    	title: '终端路线报警列表',
    	height: 200,
        store: refstore,
        autoScroll: true,
        sm : refsm,
        columns: [
        	refsm,
        	new Ext.grid.RowNumberer({header:'序号',width:35}),
        	{id:'target_route_id',header: "target_route_id", width: 10, sortable: true, dataIndex: 'target_route_id',hidden:true},
        	{header: "target_id", width: 10, sortable: true, dataIndex: 'target_id',hidden:true},
        	{header: "route_id", width: 10, sortable: true, dataIndex: 'route_id',hidden:true},
        	{header: "路线名称", width: 130, sortable: true, dataIndex: 'route_name'},
        	{header: "偏移限制", width: 130, sortable: true, dataIndex: 'distance'},
        	{header: '报警类型', width: 100, sortable: true, dataIndex: 'alarm_type',renderer:function(val){
		    	if(val == 0){return '进路线报警';}else if(val == 1){return '出路线报警';}else if(val == 2){return '进路线触发报警';}else if(val == 3){return '出路线触发报警';}
		    }},
		    {header: '开始时间', width: 130, sortable: true, dataIndex: 'start_time',renderer:function(val){
		    	return val;
		    }},
            {header: '结束时间', width: 130, sortable: true, dataIndex: 'end_time'},
            {header: '创建日期', width: 130, sortable: true, dataIndex: 'reg_time'},
            {header: '备注', width: 75, sortable: true, dataIndex: 'memo',hidden:true},
            {header: 'points', width: 100, sortable: true, dataIndex: 'points',hidden:true},
            {header: 'reg_user_id', width: 75, sortable: true, dataIndex: 'reg_user_id',hidden:true}
        ],
		tbar: [{
			text : '路线列表',
			icon : '/image/module/refresh.gif',
			tooltip : '路线列表',
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
	                {text:"查看路线",icon:"",handler:function(){
	                	var tmprecord = grid.getStore().getAt(rowIndex);
	                	var tmppoints = tmprecord.get('points');
	                	var tmpareaName  = tmprecord.get('route_name');
	                	var tmpxyArr = tmppoints.split('|');
	                	if(tmpxyArr.length<=1){
	                		Ext.Msg.alert('提示','错误数据');
	                		return;
	                	}
						var points = [];
						for(var i = 0;i < tmpxyArr.length;i++){
							var tmpxy = tmpxyArr[i].split(',');
							points.push(new GLatLng(tmpxy[1],tmpxy[0]));
						}
						map.clearOverlays();
						var Polygon = new GPolyline(points,'#FF0000',3,0.5);
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
		Zion.db.getJSON("axiom_alarm_target_route.target_id.select", [tagetid], function(data) {
			refstore.loadData(data);
			areaAlarmPanel.layout.setActiveItem(refgrid);
			loadMask.hide();
		});
	}
	
	function bindData() {
		var arr = [];
		var root = targetTree.getRootNode();
		if(root.attributes.checked == true){
			if(root.attributes.target!=undefined){
				arr.push(root.attributes.target.target_id);
			}
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
			    	},{
			    		id: 'distancefrm',
			    		xtype: 'numberfield',
			    		fieldLabel: '偏移限制(米)',
			    		value: 500,
			    		width: 150,
			    		allowBlank:false
			    	},{
			    		id: 'areaAlarmTypefrm',
			    		xtype: 'combo',
			    		fieldLabel:'报警类型',
			    		editable:false, 
			    		displayField:'name',
			    		width: 150,
			    		store: new Ext.data.ArrayStore({
			    			fields: ['id', 'name'],
			    			data : [[0,'进路线报警'],[1,'出路线报警'],[2,'进路线触发报警'],[3,'出路线触发报警']]
			    		}),
			    		displayField:'name',
			    		valueField: 'id',
			    		typeAhead: true, 
			    		mode: 'local', 
			    		forceSelection: true, 
			    		triggerAction: 'all',
			    		value:'0', 
			    		selectOnFocus:true
					},{
						width: 150,
						xtype: 'timefield',
						id: 'areaAlarmStartTimefrm',
				        fieldLabel: '开始时间',
				        editable:false, 
				        format:'H:i',
				        value:'08:00',
						increment: 1
				     },{
				     	width: 150,
						xtype: 'timefield',
						id: 'areaAlarmEndTimefrm',
				        fieldLabel: '结束时间',
				        editable:false, 
				        format:'H:i',
				        value:'18:00',
						increment: 1
				     }]
	            });
	   var win = new Ext.Window( {
				title : '路线报警设置',
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
						var distance = Ext.getCmp('distancefrm').getValue();
						if(distance == ''){
							Ext.Msg.alert('提示','请输入偏移限制距离');
							return;
						}
						var flag = true;
						var alarm_type = Ext.getCmp('areaAlarmTypefrm').getValue();
						var start_time = Ext.getCmp('areaAlarmStartTimefrm').getValue();
						var end_time = Ext.getCmp('areaAlarmEndTimefrm').getValue();
						start_time = formatetime(start_time);
						end_time = formatetime(end_time);
						
						for(var j = 0;j < arr.length;j++){
							var tagetid = arr[j];
							var delparams = [];
							delparams.push(tagetid);
							Ext.zion.db.getJSON("axiom_alarm_target_route.target_id.delete", delparams, function(data) {
								
							});
						}
						var len = arr.length;
						var routeidArr = [];
						var targetidArr = [];
						for(var i = 0;i < tmpselArr.length;i++){
							for(var j = 0;j < len;j++){
								routeidArr.push(tmpselArr[i].get('route_id'));
								targetidArr.push(arr[j]);
							}
						}
						
						for(var i = 0;i < tmpselArr.length;i++){
							for(var j = 0;j < len;j++){
								Ext.zion.db.getJSON("axiom_alarm_target_route.seq.id", null, function(data) {
									
									var routeid = routeidArr.pop();
									var tagetid = targetidArr.pop();
									var insertparams = [];
									insertparams.push(data.r[0][0]);
									insertparams.push(tagetid);
									insertparams.push(Number(routeid));
									insertparams.push(Number(distance));
									insertparams.push(Number(alarm_type));
									insertparams.push(start_time);
									insertparams.push(end_time);
									
									Ext.zion.db.getJSON("axiom_alarm_target_route.insert", insertparams, function(data) {
										if (data.r == 1) {
											flag = true;
										} else {
											flag = false;
										}
									});
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
	
	function formatetime(time){
		var timeArr = time.split(':');
		if(timeArr.length == 2){
			return (Number(timeArr[0]) * 60 + Number(timeArr[1])) * 60;
		}else{
			return 0;
		}
	}
	
	function getCheckNode(node , arr){
		var childnodes = node.childNodes;
		for(var i=0;i<childnodes.length;i++){
	    	var rootnode = childnodes[i];
			if(rootnode.attributes.checked == true){
				if(rootnode.attributes.target!=undefined){
					arr.push(rootnode.attributes.target.target_id);
				}
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
						id.push(member.target_route_id);
					}
					var deleteNext = function(id) {
						if (id.length > 0) {
							Ext.zion.db.getJSON("axiom_alarm_target_route.target_route_id.delete", [ id.pop() ], function(data) {
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