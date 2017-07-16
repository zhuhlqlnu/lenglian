function dateRender(val){
	return new Date(val*1000).toLocaleString();
}

function timeRender(val){
	val = val / 60;
	return parseInt(val/60) + ':' + val%60;
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var limit = 20;
	var mapwin;
	var marker;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var targetTree = new Ext.tree.TreePanel({
		autoScroll : true,
		split : true,
		region : 'center',
		animate : false,
		border : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if (node.attributes.target) {
					var key = node.attributes.target.target_id;
					showTargetInfo(key);
					getClickTargetPoint(key);
				} else {
					return false;
				}
			},
			checkchange : function(node, checked) {
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
			}
		}
	});

	function getClickTargetPoint(target_id) {
		disableButton_();
		loadMask.msg = "查询中，请稍后 ...";
		loadMask.show();
		Zion.db.getJSON("axiom_analyze_target_point.target_id.select",
				[target_id], function(data) {
					target_store.loadData(data);
					loadMask.hide();
				});
	}
	
	function getCheckedTarget() {
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target && node.attributes.checked) {
				var key = node.attributes.target.target_id;
				if (!checkedTargetMap[key]) {
					checkedTargetMap[key] = key;
					checkedTarget.push(key);	
				}
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
							checkedNode(child);
						});
			}
		}
		checkedNode(targetTree.getRootNode());
		return checkedTarget;
	}

	function showTargetInfo(target_id) {
		Zion.db.getJSON('monitor.realtime.target', [target_id], function(data) {
					if (data && data.r) {
						var target = data.r[0];
						targetInfo.setSource({
									'目标序号' : target[0],
									'目标名称' : target[1],
									'终端类型' : target[2],
									'终端序号' : target[3],
									'终端编号' : target[4],
									'通讯地址' : target[5]
								});
					}
				});
	}

	var targetInfo = new Ext.grid.PropertyGrid({
				title : '属性信息',
				collapsible : true,
				region : 'south',
				autoHeight : true,
				selModel : new Ext.grid.RowSelectionModel({
							singleSelect : true
						}),
				source : {
					'目标序号' : '',
					'目标名称' : '',
					'终端类型' : '',
					'终端序号' : '',
					'终端编号' : '',
					'通讯地址' : ''
				},
				viewConfig : {
					forceFit : true,
					scrollOffset : 2
				},
				listeners : {
					beforeedit : function() {
						return false;
					}
				}
			});
	targetInfo.store.sortInfo = null;
	targetInfo.getColumnModel().config[0].sortable = false;

	var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.data.ArrayStore({
		root : 'r',
		fields : ['point_id', 'type', 'point_name', 'x', 'y', 'info',
			'corp_id', 'create_date', 'user_id', 'memo'
		]
	});

	var grid = new Ext.grid.GridPanel({
				// margins : '5 0 0 0',
				title : '漏巡点列表',
				flex : 1,
				region : 'center',
				store : store,
				sm : sm,
				enableColumnHide : false,
				loadMask : {msg : '查询中...'},
				columns : [
				    sm, 
				    new Ext.grid.RowNumberer({header : '序号',width : 35}), 
				    //{id : 'point_id',header : "point_id",width : 10,sortable : true,dataIndex : 'speed_id',hidden : true},
				    {header : '漏巡点名称',width : 130,sortable : true,dataIndex : 'point_name'}, 
				    //{header : "corp_id",width : 10,sortable : true,dataIndex : 'corp_id',hidden : true}, 
				    //{header : "user_id",width : 10,sortable : true,dataIndex : 'user_id',hidden : true}, 
				    {header : "创建时间",width : 150,sortable : true,dataIndex : 'create_date',renderer:dateRender}, 
				    {header : "备注",width : 130,sortable : true,dataIndex : 'memo'}
				],
				viewConfig : {
					 autoFill : true,
					 forceFit : true
				},
				tbar : [{
							text : '刷新',
							icon : Ext.zion.image_base+'/refresh.gif',
							tooltip : '刷新记录',
							handler : function() {
								Zion.db.getJSON("axiom_analyze_point.select", null, function(data) {
									store.loadData(data);
								});
								disableButton();
							},
							scope : this
						}, '-', {
							id : 'bindButton',
							text : '绑定',
							icon : Ext.zion.image_base+'/binding.png',
							tooltip : '终端绑定漏巡点',
							handler : bindData,
							disabled : true,
							scope : this
						}, '-', {
							id : 'mapButton',
							text : '地图',
							icon : Ext.zion.image_base+'/map.png',
							tooltip : '显示漏巡点',
							handler : function() {
								var sm_ = grid.selModel.getSelections();
								show_map(sm_);
							},
							disabled : true,
							scope : this
						}, '-',{
							xtype : 'textfield',
							width : 150,
							name : 'term',
							id : 'term',
							emptyText:'漏巡点名称'
						},{
							id : 'selectButton',
							text : '查询',
							icon : Ext.zion.image_base+'/select.gif',
							tooltip : '查询漏巡点',
							handler : function() {
								select_bind_data();
							},
							scope : this
						}]
			});

	sm.on('rowselect', function() {
				if (grid.selModel.getSelections().length == 1) {
					Ext.getCmp('mapButton').enable();
				} else {
					Ext.getCmp('mapButton').disable();
				}
				if (grid.selModel.getSelections().length != 0) {
					Ext.getCmp('bindButton').enable();
				} else {
					Ext.getCmp('bindButton').disable();
				}
			});
	sm.on('rowdeselect', function() {
				if (grid.selModel.getSelections().length == 1) {
					Ext.getCmp('mapButton').enable();
				} else {
					Ext.getCmp('mapButton').disable();
				}
				if (grid.selModel.getSelections().length != 0) {
					Ext.getCmp('bindButton').enable();
				} else {
					Ext.getCmp('bindButton').disable();
				}
			});

	function disableButton() {
		Ext.getCmp('bindButton').disable();
		Ext.getCmp('mapButton').disable();
	}

	function bindData() {
		var checkedTarget = getCheckedTarget();
		if (checkedTarget.length <= 0) {
			Ext.Msg.alert('提示', '请选择终端!');
			return;
		}
		win_show();
	}
	function win_show(record) {
		formPanel = new Ext.form.FormPanel({
					labelWidth : 90,
					frame : true,
					bodyStyle : 'padding:5px 5px 0',
					layout : 'form',
					defaultType : 'textfield',
					defaults : {width : 150},
					items : [new Ext.form.ComboBox({
								name : 'alarm_type',
								store : new Ext.data.SimpleStore({
									fields : ['id', 'name'],
									data : [[0, '进漏巡区域报警'], [1, '出漏巡区域报警'],[2, '进漏巡区域触发报警'],[3, '出漏巡区域触发报警']]
								}),
								editable : false,
								mode : 'local',
								triggerAction : 'all',
								fieldLabel : '报警类型',
								displayField : 'name',
								valueField : 'id',
								value : 0,
								maxHeight : 200,
								id : 'alarm_type'
							}),{
								fieldLabel : '漏巡点范围(米)',
								name:'range',
								id:'range',
								xtype: 'numberfield',
								emptyText:'填写数字'
							}, new Ext.form.TimeField({
								name : 'start_time',
								fieldLabel : '报警开始时间',
								format : 'H:i',
								value : '08:00',
								increment : 1,
								editable: false,
								id : 'start_time'
							}), new Ext.form.TimeField({
								name : 'end_time',
								fieldLabel : '报警结束时间',
								format : 'H:i',
								value : '18:00',
								editable: false,
								increment : 1,
								id : 'end_time'
							}), {
						xtype : 'textarea',
						fieldLabel : '备注',
						name : 'memo',
						id : 'memo'
					}]
				});

		var win = new Ext.Window({
			title : '漏巡点报警设置',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			id: 'bind_win',
			width : 300,
			items : [formPanel],
			buttons : [{
						text : '保存',
						id : 'save',
						handler : function() {
							if(Ext.getCmp('range').getValue().length <= 0){
								Ext.Msg.alert('提示','请输入漏巡点范围!');
								return;
							}
							var sm_ = grid.selModel.getSelections();
							if (sm_.length > 0) {
								Ext.Msg.confirm('绑定确认', '你是否确认绑定选中的记录？',
										function(btn) {
											if (btn == 'yes') {
												loadMask.msg = "绑定中，请稍后 ...";
												loadMask.show();
												var checkedTarget = getCheckedTarget();
												deleteNext(checkedTarget);
											}
										})
							}
						}
					}, {
						text : '取消',
						handler : function() {
							win.close();
						}
					}]
		});
		win.show();
	}
	
	 var deleteNext = function(target_ids_){
    	if(target_ids_.length > 0){
    		Ext.zion.db.getJSON("axiom_analyze_target_point.target_id.delete", [target_ids_.pop()],function(data) {
    			deleteNext(target_ids_);
			});
    	}else{
    		var ids = [];
			var checkedTarget = getCheckedTarget();
			var sm_ = grid.selModel.getSelections();
			var alarm_type = Ext.getCmp('alarm_type').getValue();
			var range = Ext.getCmp('range').getValue();
			var start_time = Ext.getCmp('start_time').getRawValue();
			var end_time = Ext.getCmp('end_time').getRawValue();
			var memo = Ext.getCmp('memo').getValue();
			for ( var i = 0; i < sm_.length; i += 1) {
				var member = sm_[i].data;
				if (member) {
					for(var j = 0;j < checkedTarget.length ; j +=1){
						ids.push({p:member.point_id,t:checkedTarget[j], at:alarm_type,
						r:range, st:start_time
							, et:end_time, m:memo});
					}
				}
			}
			if (ids.length > 0) {
				insertNext(ids);
			}
    	}
    }
    
    var insertNext = function(ids){
    	if(ids.length > 0){
    		Ext.zion.db.getJSON("axiom_seq_analyze_t_point_id.select", null,function(data) {
				if (data.r != 0 && data.r) {
					var params = [];
		    		var id = ids.pop();
		    		params.push(data.r[0][0]);
		    		params.push(id.p);
		    		params.push(id.t);
		    		params.push(id.r);
		    		params.push(id.at);
		    		params.push(time_to_utc(id.st));
		    		params.push(time_to_utc(id.et));
		    		params.push(parseInt(new Date().getTime()/1000));
		    		params.push(id.m);
		    		Ext.zion.db.getJSON("axiom_analyze_target_point.insert", params,function(data) {
						insertNext(ids);
					});
				}
			});
    	}else{
    		Ext.Msg.alert("提示", "绑定成功");
    		var bind_win_ = Ext.getCmp('bind_win');
    		if(bind_win_){
    			bind_win_.close();
    		}
    		loadMask.hide();
    	}
    }
    
     function time_to_utc(time){
    	var time_arr = time.split(':');
    	if(time_arr.length == 2){
    		if(time_arr[0].substring(0,1) == 0){
    			time_arr[0] = time_arr[0].substring(1,2);
    		}
    		return (parseInt(time_arr[0])*60 + parseInt(time_arr[1]))*60;
    	}
    	return 0;
    }

	var target_sm = new Ext.grid.CheckboxSelectionModel({});
	target_sm.on('rowselect', function() {
		if (target_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton_').enable();
		} else {
			Ext.getCmp('mapButton_').disable();
		}
		if (target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
	target_sm.on('rowdeselect', function() {
		if (target_grid.selModel.getSelections().length == 1) {
			Ext.getCmp('mapButton_').enable();
		} else {
			Ext.getCmp('mapButton_').disable();
		}
		if (target_grid.selModel.getSelections().length != 0) {
			Ext.getCmp('deleteButton_').enable();
		} else {
			Ext.getCmp('deleteButton_').disable();
		}
	});
	var	target_store = new Ext.data.ArrayStore({
		root : 'r',
		fields : [
		    'target_point_id','name', 'point_id', 
		    'target_id', 'range', 'is_alarm','alarm_type', 
		    'start_time', 'end_time','corp_id','user_id', 
		    'create_date', 'memo','x','y','type'
		]
	});
	var target_grid = new Ext.grid.GridPanel({
				// margins : '5 0 0 0',
				// heigth : 300,
				title : '监控目标已绑定漏巡点列表',
				flex : 1,
				region : 'south',
				store : target_store,
				sm : target_sm,
				enableColumnHide : false,
				loadMask : {msg : '查询中...'},
				columns : [
				    target_sm, 
				    new Ext.grid.RowNumberer({header : '序号',width : 35}), 
				    //{id : 'target_point_id',header : "target_point_id",width : 10,sortable : true,dataIndex : 'target_point_id',hidden : true}, 
				    {header : '标注名称',width : 130,sortable : true,dataIndex : 'name'}, 
				    //{header : "point_id",width : 10,sortable : true,dataIndex : 'point_id',hidden : true}, 
				    //{header : "target_id",width : 10,sortable : true,dataIndex : 'target_id',hidden : true}, 
				    {header : "范围(米)",width : 130,sortable : true,dataIndex : 'range'}, 
				    {header : "报警类型",width : 130,sortable : true,dataIndex : 'alarm_type',renderer:function(val){
				        if(val == 0){return '进漏巡区域报警';}else if(val == 1){return '出漏巡区域报警';}else if(val == 2){return '进漏巡区域触发报警';}else if(val == 3){return '出漏巡区域触发报警';}else{return '未知';}}
					}, 
					{header : "报警开始时间",width : 130,sortable : true,dataIndex : 'start_time',renderer:timeRender}, {header : "报警结束时间",width : 130,sortable : true,dataIndex : 'end_time',renderer:timeRender}, 
					//{header : "corp_id",width : 10,sortable : true,dataIndex : 'corp_id',hidden : true}, 
					//{header : "user_id",width : 10,sortable : true,dataIndex : 'user_id',hidden : true}, 
					{header : "创建时间",width : 170,sortable : true,dataIndex : 'create_date',renderer:dateRender}, 
					{header : "备注",width : 130,sortable : true,dataIndex : 'memo'}
				],
				viewConfig : {
				// autoFill : true,
				// forceFit : true
				},
				tbar : [{
							text : '删除',
							id : 'deleteButton_',
							icon : Ext.zion.image_base+'/delete.gif',
							tooltip : '删除记录',
							scope : this,
							handler: deleteData,
							disabled : true
						}, '-'/*, {
							text : '刷新',
							icon : Ext.zion.image_base+'/refresh.gif',
							tooltip : '刷新记录',
							handler : function() {
								target_grid.target_store.reload();
								// disableButton();
							},
							scope : this
						}, '-', {
							id : 'bindButton_',
							text : '绑定',
							icon : Ext.zion.image_base+'/refresh.gif',
							tooltip : '终端绑定路线',
							// handler : bindData,
							disabled : true,
							scope : this
						}, '-' */,{
							text : '地图',
							id:'mapButton_',
							disabled : true,
							icon : Ext.zion.image_base+'/map.png',
							tooltip : '显示漏巡点',
							handler : function() {
								var sm = target_grid.selModel.getSelections();
								show_map_target(sm);
							},
							scope : this
						}]
			});

	function deleteData(){
		var sm = target_grid.getSelectionModel().getSelections();
		if (sm.length > 0) {
			Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
				if (btn == 'yes') {
					var params = [];
					for ( var i = 0; i < sm.length; i += 1) {
						var member = sm[i].data;
						if (member) {
							params.push({id:member.target_point_id,index:sm[i],tid:member.target_id});
						}
					}
					var deleteNext = function(params) {
						if (params.length > 0) {
							var param = params.pop();
							target_store.remove(param.index);
							Ext.zion.db.getJSON("axiom_analyze_target_point.target_point_id.delete", [ param.tid , param.id ], function(data) {
								deleteNext(params);
							});
						} else {
							Ext.Msg.alert("提示", "删除成功");
							disabled();
						}
					};
					deleteNext(params);
				}
			})
		}
	}
	function select_bind_data(){
		var term = Ext.getCmp("term").getValue();
		store.filter("point_name",term,true,true);
	}
	function disabled(){
		Ext.getCmp('mapButton_').disable();
		Ext.getCmp('deleteButton_').disable();
	}
	var mapwin = new Ext.Window({
		layout : 'fit',
		closeAction : 'hide',
	//	closable : true,
		width : 400,
		height : 400,
		items : {
			layout : 'fit',
			contentEl : 'map_canvas',
			width : 600,
			height : 500,
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
		}
	});
	/**标注列表window 地图**/	
	function show_map(sm_) {
		mapwin.show();
		map.clearOverlays();
		var g_x = grid.getSelectionModel().getSelected().data.x;
		var g_y = grid.getSelectionModel().getSelected().data.y;
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(16, 16);
		targetIcon.iconAnchor = new GPoint(8, 8);
		targetIcon.image = "../point/images/"+grid.getSelectionModel().getSelected().data.type+".gif";
		var markerOptions = {
			icon : targetIcon,
			clickable : true
		}
		var point = new GLatLng(g_y , g_x);
		marker = new GMarker(point, markerOptions);
		map.setCenter(point , 13);
		map.addOverlay(marker);
		setDefaultMapUI(map);
	}
	/**监控目标已绑定标注列表window 地图**/	
	function show_map_target(sm_){
		mapwin.show();
		map.clearOverlays();
		var g_x = target_grid.getSelectionModel().getSelected().data.x;
		var g_y = target_grid.getSelectionModel().getSelected().data.y;
		var range = target_grid.getSelectionModel().getSelected().data.range;
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(16,16);
		targetIcon.iconAnchor = new GPoint(8, 8);
		targetIcon.image = "../point/images/"+target_grid.getSelectionModel().getSelected().data.type+".gif";
		var markerOptions = {
			icon : targetIcon,
			clickable : true
		}
		var point = new GLatLng(g_y , g_x);
		marker = new GMarker(point, markerOptions);
		map.setCenter(point, 16);
		map.addOverlay(marker);
		drawCircle(g_y,g_x,range/1000,'#FF0000',3,0.5,'#ffff00',0.5);
		setDefaultMapUI(map);
	}
	var map = new GMap2(document.getElementById("map_canvas"),M_DEFAULT_MAP_OPTIONS);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
	
	/** 地图半径画圆**/
	function drawCircle(lat, lng, radius, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity) {
	    var d2r = Math.PI / 180;
	    var r2d = 180 / Math.PI;
	    var Clat = radius * 0.009;  // Convert statute miles into degrees latitude
	    var Clng = Clat / Math.cos(lat * d2r);
	    var Cpoints = [];
	    // 计算圆周上33个点的经纬度，若需要圆滑些，可以增加圆周的点数
	    for (var i = 0; i < 33; i++) {
	        var theta = Math.PI * (i / 16);
	        Cy = lat + (Clat * Math.sin(theta));
	        Cx = lng + (Clng * Math.cos(theta));
	        var P = new GPoint(Cx, Cy);
	        Cpoints.push(P);
	    }
	    strokeColor = strokeColor || "#0055ff";   // 边框颜色，默认"#0055ff"
	    strokeWidth = strokeWidth || 1;           // 边框宽度，默认1px
	    strokeOpacity = strokeOpacity || 1;       // 边框透明度，默认不透明
	    fillColor = fillColor || strokeColor;     // 填充颜色，默认同边框颜色
	    fillOpacity = fillOpacity || 0.1;         // 填充透明度，默认0.1
	    var polygon = new GPolygon(Cpoints, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity);
	    map.addOverlay(polygon);
	}
	
	function disableButton_() {
		Ext.getCmp('mapButton_').disable();
		Ext.getCmp('deleteButton_').disable();
	}
	
	var viewport = new Ext.Viewport({
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			margins : '5 0 0 0',
			title : '监控目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [targetTree, targetInfo]
		}, {
			margins : '5 0 0 0',
			//title : '监控目标列表',
			region : 'center',
			//collapsible : true,
			//split : true,
			//width : 200,
			layout : 'vbox',
			layoutConfig : {
				align : 'stretch',
				pack : 'start'
			},
			items : [grid, target_grid]
		}]
	});
	
	Ext.zion.tree.loadTargetTree(function(tree) {
		Zion.db.getJSON("axiom_analyze_point.select", null, function(data) {
			store.loadData(data);
		});
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	}, true);

});
