Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 20;
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
		title : '人员列表',
		region: 'center',
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
        tbar: [
            { 
				id : 'newButton',
				text : '新增',
				icon : '/image/module/add.gif',
				tooltip : '新增记录',
				scope : this,
				handler: function(){
					Ext.getCmp('saveModifyBut').setText('保存');
					map.clearOverlays();
					Ext.getCmp('areaNamefrm').reset();
			        Ext.getCmp('areaIdfrm').reset();
					AreaAlarmPanel.layout.setActiveItem(form);
				}
            },'-',{
				text : '删除',
				id : 'deleteButton',
				icon : '/image/module/delete.gif',
				tooltip : '删除记录',
				scope : this,
				disabled : true,
				handler: deleteData
            }, '-', {
				text : '刷新',
				icon : '/image/module/refresh.gif',
				tooltip : '刷新记录',
				handler : function() {
					/********************/
					grid.store.reload();
				},
				scope : this
			}, '-', {
				id : 'bindButton',
				text : '绑定',
				icon : '/image/module/refresh.gif',
				tooltip : '终端绑定路线',
				handler : bindData,
				disabled : true,
				scope : this
			}
        ],
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
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	});
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('bindButton').enable();
		} else {
			Ext.getCmp('bindButton').disable();
		}
		if (grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton').enable();
		} else {
			Ext.getCmp('deleteButton').disable();
		}
	});
	
    var form = new Ext.FormPanel({
    	labelWidth:100,
    	heigth: 300,
	    bodyStyle:'padding:0px 0px 0',
	    //autoScroll : true,
		//autoHeight : true,
		frame : true,
	    defaults: {width: 150},
    	items: [{
    		id: 'areaNamefrm',
    		xtype: 'textfield',
    		fieldLabel: '路线名称',
    		allowBlank:false
    	},{
    		id: 'areaPointsStatefrm',
    		xtype: 'label',
    		test: '请绘制路线'
    	}
		,{
			xtype: 'hidden',
			id: 'areaPointsfrm'
		},{
			xtype: 'hidden',
			id: 'areaIdfrm'
		}],
		buttons: [{
            text: '绘制路线',
            handler: function(){
            	mousedownListener();
            	Ext.getCmp('saveModifyBut').setDisabled(true);
            }
        },{
        	id: 'saveModifyBut',
            text: '保存',
            disabled: true,
            handler: function(){
            	var name = Ext.getCmp('areaNamefrm').getValue();
			    if(name == ''){
			    	Ext.Msg.alert("提示", "请输入路线名称");
			    	return;
			    }
			    points = Zion.polyline.toString(Zion.polyline.endEdit());
            	//alert(points);
			    if(points == ''){
			    	Ext.Msg.alert("提示", "请绘制路线");
			    	return;
			    }
			    var params = [];
			    params.push(name);
			    params.push(points);
			    Ext.getCmp('saveModifyBut').setDisabled(true);
            	Ext.getCmp('areaNamefrm').reset();
            	map.clearOverlays();
			    Ext.zion.db.getJSON("axiom_routealarm.insert", params, function(data) {
					if (data.r == 1) {
						Ext.Msg.alert("提示", "数据添加成功");
						grid.store.reload();
						disableButton();
						AreaAlarmPanel.layout.setActiveItem(grid);
					} else {
						Ext.Msg.alert("提示", "数据添加错误");
					}
				});
            }
        },{
            text: '返回',
            handler: function(){
            	AreaAlarmPanel.layout.setActiveItem(grid);
            	Ext.getCmp('saveModifyBut').setDisabled(true);
            	Ext.getCmp('areaNamefrm').reset();
            	map.clearOverlays();
            	points = '';
            }
        }]
    });
    
    var formPanel = new Ext.Panel({
    			region:'north',
    			autoScroll: true,
    			height: 185,
    			tbar : {
			    	xtype: 'toolbar',
			        items: [{
			        	xtype: 'button',
			            text: '绑定',
			            icon : '/image/module/refresh.gif',
						tooltip : '终端绑定路线',
			            handler: bindDataDb
			        },{
			        	xtype: 'button',
			            text: '返回',
			            icon : '/image/module/refresh.gif',
						tooltip : '返回',
			            handler: function(){
			            	AreaAlarmPanel.layout.setActiveItem(grid);
			            	Ext.getCmp('saveModifyBut').setDisabled(true);
			            	Ext.getCmp('areaNamefrm').reset();
			            	map.clearOverlays();
			            	points = '';
			            }
			        }]
			    },
	    		items: [{
	                xtype: 'form',
	                labelWidth: 80,
	                labelAlign: 'left',
	                width: 250,
	                layout: 'form',
	                items: [{
			    		id: 'refTermAreaIdfrm',
			    		xtype: 'hidden'
			    	},{
			    		id: 'refTermAreaNamefrm',
			    		xtype: 'label',
			    		fieldLabel: '路线名称',
			    		allowBlank:false
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
	            }]
    		});
    		
    var Panel = new Ext.Panel({
			layout: 'border',
			items: [formPanel, targetTree]
	});
	
	var AreaAlarmPanel = new Ext.Panel({
		region : 'west',
		//margins : '5 0 0 0',
		//cmargins : '5 5 0 0',
		width : 300,
		minSize: 300,
        //maxSize: 300,
		collapsible : true,
		collapseMode:'mini',
		title : '路线设置',
		activeItem: 0,
		layout:'card',
		items: [grid,form,Panel]
	});
	
	function disableButton() {
		//Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
		Ext.getCmp('bindButton').disable();
	}
	
	function bindData() {
		var tmpselArr = sm.getSelections();
		map.clearOverlays();
		Ext.getCmp('refTermAreaNamefrm').setText(tmpselArr[0].get('route_name'));
        Ext.getCmp('refTermAreaIdfrm').setValue(tmpselArr[0].get('route_id'));
        var points2 = [];
		var tmpxyArr = tmpselArr[0].get('points').split('|');
		var tmpxy = tmpxyArr[0].split(',');
		for(var i = 0;i < tmpxyArr.length;i++){
			tmpxy = tmpxyArr[i].split(',');
			points2.push(new GLatLng(tmpxy[1],tmpxy[0]));
		}
		var Polygon = new GPolyline(points2,'#FF0000',3,0.5);
		var bounds = Polygon.getBounds();
		map.addOverlay(Polygon); 
		map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
		AreaAlarmPanel.layout.setActiveItem(Panel);
	}
	
	function deleteData() {
		var sm = grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var id = [];
					var areaid = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						id.push(member.route_id);
						areaid.push(member.route_id);
					}
					var deleteRefNext = function(areaid) {
						//alert(areaid);
						if (areaid.length > 0) {
							Ext.zion.db.getJSON("axiom_alarm_target_route.delete", [ areaid.pop() ], function(data) {
								deleteRefNext(areaid);
							});
						} 
					};
					deleteRefNext(areaid);
					
					var deleteNext = function(id) {
						//alert(id);
						if (id.length > 0) {
							Ext.zion.db.getJSON("axiom_alarm_route.delete", [ id.pop() ], function(data) {
								deleteNext(id);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							grid.store.reload();
							disableButton();
						}
					};
					deleteNext(id);
				}
			})
		}
	}

	function bindDataDb() {
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
				//if (data.r.length >0 ) {
					//alert(areaid+':'+tagetid+';查询到终端已绑定该区域');
				//} else {
					//alert(areaid+':'+tagetid+';终端绑定区域');
				//}
			});
		}
		var areaid = Ext.getCmp('refTermAreaIdfrm').getValue();
		var len = arr.length;
		for(var j = 0;j < len;j++){
			Ext.zion.db.getJSON("axiom_alarm_target_route.seq.id", null, function(data) {
				var tagetid = arr.pop();
				var insertparams = [];
				insertparams.push(data.r[0][0]);
				insertparams.push(tagetid);
				insertparams.push(Number(areaid));
				insertparams.push(Number(distance));
				insertparams.push(Number(alarm_type));
				insertparams.push(start_time);
				insertparams.push(end_time);
				//alert(areaid+','+tagetid+','+alarm_type+','+start_time+','+end_time);
				Ext.zion.db.getJSON("axiom_alarm_target_route.insert", insertparams, function(data) {
					if (data.r == 1) {
						flag = true;
					} else {
						flag = false;
					}
				});
			});
		}
		if(flag){
			Ext.Msg.alert("提示", "数据添加成功");
		}else{
			Ext.Msg.alert("提示", "数据添加错误");
		}
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
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [  AreaAlarmPanel , {
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
		}]
	});

	var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
	
	loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	});
	
	/*************画路线****************/
	var points = '';
	function mousedownListener(){
		map.clearOverlays();
		points = '';
		Zion.polyline.draw(map, function(poly) {
			
			setTimeout(function() { Zion.polyline.edit(map, poly); }, 500);
			Ext.getCmp('saveModifyBut').setDisabled(false);
			
			//line = Zion.polyline.toString(Zion.polyline.endEdit());
			//alert(line);
			//setTimeout(function() { alert(Zion.polyline.toString(Zion.polyline.endEdit())); }, 1000000);
			
		});
    }
	
});
