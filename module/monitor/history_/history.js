var map;
Ext.onReady(function() {
	Ext.QuickTips.init();
	var targetid = '';
	var polygon;
	var data_point;
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

	function showTargetInfo(target_id) {
		Zion.db.getJSON('monitor.realtime.target', [ target_id ], function(data) {
			if (data && data.r) {
				var target = data.r[0];
				targetInfo.setSource( {
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

	var targetInfo = new Ext.grid.PropertyGrid( {
		title : '属性信息',
		//collapsible : true,
		region : 'south',
		autoHeight : true,
		selModel : new Ext.grid.RowSelectionModel( {
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
	var targetTree = new Ext.tree.TreePanel( {
		// title : '人员列表',
		flex : 1,
		autoScroll : true,
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
			click : function(node) {
				if (node.attributes.target) {
					targetid = node.attributes.target.target_id;
					showInfoKey = targetid;
					Ext.getCmp("target_name").setText(node.attributes.text);
					showTargetInfo(targetid);
				}
			}
		}
	});

	var form = new Ext.form.FormPanel( {
		// flex : 2,
		width : 300,
		height : 300,
		// labelWidth: 100,
		bodyStyle : 'padding:5px 5px 0',
		buttonAlign : 'center',
		items : [ {
			fieldLabel : '开始时间',
			allowBlank : false,
			editable : false,
			id : 'startdttrack',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		}, {
			xtype : 'timefield',
			allowBlank : false,
			editable : false,
			format : 'H:i',
			id : 'starttftrack',
			width : 115,
			increment : 1,
			value : '05:00'
		}, {
			fieldLabel : '结束时间',
			allowBlank : false,
			editable : false,
			id : 'enddttrack',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		}, {
			xtype : 'timefield',
			allowBlank : false,
			editable : false,
			format : 'H:i',
			id : 'endtftrack',
			width : 115,
			increment : 1,
			value : '21:00'
		} ],
		buttons : [ {
			text : '查询',
			handler : function() {
				if (targetid.length <= 0) {
					Ext.Msg.alert('提示', '请选择终端');
					return;
				}
				loadMask.show();
				// var s = "2010-05-23 00:00:00";
				var s = Ext.getCmp('startdttrack').getRawValue() + ' ' + Ext.getCmp('starttftrack').getValue() + ':00';
				var std = new Date(Date.parse(s.replace(/-/g, "/")));
				// s = "2010-05-23 20:00:00";
				var e = Ext.getCmp('enddttrack').getRawValue() + ' ' + Ext.getCmp('endtftrack').getValue() + ':00';
				var end = new Date(Date.parse(e.replace(/-/g, "/")));
				// Zion.track.getTrack(91, std.getTime() / 1000 , end.getTime()
				// / 1000 , function(data) {
				Zion.track.getTrack(targetid, std.getTime() / 1000, end.getTime() / 1000, function(data) {
					if (data.r.length == 0) {
						Ext.Msg.alert('提示', '没有轨迹点');
						loadMask.hide();
					}else{
						loadMask.hide();
						parseTrackData(data.r);
						westPanel.layout.setActiveItem(card2);
					}
				});
			}
		} ]
	});

	var card1 = new Ext.Panel( {
		width : 300,
		layout : 'vbox',
		layoutConfig : {
			align : 'stretch',
			pack : 'start'
		},
		items : [ targetTree, targetInfo,form ]
	});

	var card2 = new Ext.Panel( {
		width : 300,
		layout : 'fit',
		items : [ {
			xtype : 'form',
			bodyStyle : 'padding:5px 10px 0',
			width : 300,
			labelWidth : 100,
			items : [ {
				xtype : 'radiogroup',
				hideLabel : true,
				items : [ {
					boxLabel : '锁定',
					name : 'roadcorrect',
					inputValue : 1,
					handler : function() {
						if (this.checked) {
							mapViewModal = true;
						}
					}
				}, {
					boxLabel : '自由视野',
					name : 'roadcorrect',
					inputValue : 2,
					checked : true,
					handler : function() {
						if (this.checked) {
							mapViewModal = false;
						}
					}
				} ]
			}, {
				id : 'intervalpointcombo',
				xtype : 'combo',
				fieldLabel : '回放间隔(点)',
				editable : false,
				width : 80,
				displayField : 'name',
				store : new Ext.data.ArrayStore( {
					fields : [ 'id', 'name' ],
					data : [ [ 1, '1X' ], [ 5, '5X' ], [ 10, '10X' ], [ 15, '15X' ], [ 20, '20X' ] ]
				}),
				displayField : 'name',
				valueField : 'id',
				typeAhead : true,
				mode : 'local',
				forceSelection : true,
				triggerAction : 'all',
				value : '1',
				selectOnFocus : true
			}, {
				xtype : 'label',
				fieldLabel : '回放速度(秒)',
				id : 'playspeedlabel',
				text : '1'
			}, new Ext.Slider( {
				id : 'playspeedslider',
				width : 214,
				increment : 1,
				minValue : 1,
				maxValue : 4,
				listeners : {
					'changecomplete' : function(slider, newValue) {
						// 改变播放速度
				var tmpplayspeedlabel = Ext.getCmp('playspeedlabel');
				if (newValue != 1) {
					tmpplayspeedlabel.setText((newValue - 1) * 5);
					// 设置播放
				refreshTime = (newValue - 1) * 5;
			} else {
				tmpplayspeedlabel.setText(1);
				// 设置播放
				refreshTime = 1;
			}
			if (currentstate == 1) {
				play();
			}
		}
	}
			}), {
				xtype : 'label',
				fieldLabel : '回放进度(点)',
				id : 'playtempolabel',
				text : '0'
			}, new Ext.Slider( {
				id : 'playtemposlider',
				width : 214,
				increment : 1,
				minValue : 1,
				maxValue : 1,
				listeners : {
					'changecomplete' : function(slider, newValue) {
						// 改变播放进度,更改'回放进度'label
				var tmpplaytempolabel = Ext.getCmp('playtempolabel');
				tmpplaytempolabel.setText(newValue);
				// 停止播放,改变按钮显示图片
				resetimgsrc();
				var tmp = Ext.getCmp('media_controls_pause');
				tmp.setIconClass('dark_pause');
				pause();
				// 画当前进度点
				drawtrackpoint(newValue - 1);
				sliderposition = newValue - 1;
			}
		}
			}), new Ext.Panel( {
				layout : 'table',
				layoutConfig : {
					columns : 9
				},
				items : [ new Ext.Button( {
					id : 'media_controls_first',
					iconCls : 'light_first',
					value : '0',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_first');
						previousTrack();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_play',
					iconCls : 'light_play',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_play');
						play();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_pause',
					iconCls : 'light_pause',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_pause');
						pause();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_stop',
					iconCls : 'light_stop',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_stop');
						stop();
					}
				}), new Ext.Spacer( {
					width : 10
				}), new Ext.Button( {
					id : 'media_controls_last',
					iconCls : 'light_last',
					handler : function() {
						resetimgsrc();
						this.setIconClass('dark_last');
						nextTrack();
					}
				}) ]
			}), {
				xtype : 'fieldset',
				title : '信息',
				labelWidth:60,
				items : [ {
					id : 'target_name',
					xtype : 'label',
					fieldLabel : '目标名称'
				}, {
					id : 'gps_time',
					xtype : 'label',
					fieldLabel : 'GPS时间'
				}, {
					id : 'recv_time',
					xtype : 'label',
					fieldLabel : '接收时间'
				}, {
					id : 'speed',
					xtype : 'label',
					fieldLabel : '速度'
				}, {
					id : 'heading',
					xtype : 'label',
					fieldLabel : '方向'
				}, {
					id : 'geocoding',
					xtype : 'label',
					fieldLabel : '位置信息'
				}, {
					id : 'terminal_status_desc',
					xtype : 'label',
					fieldLabel : '详细信息'
				} ]
			} ]
		}],
		buttons : [{
			text : '显示漏巡点',
			id:'select_point',
			handler : function() {
				Zion.db.getJSON('module.monitor.history_pipe.point_query.select', [ targetid ], function(data) {
					if(data.r&&!data.f){
						data_point = data.r;
						Ext.getCmp('select_point').disable();
						for(var i=0;i<data_point.length;i++){
							var alarm_type_content;
							var g_x=data_point[i][1];
							var g_y = data_point[i][2];
							var range = data_point[i][3];
							var type=data_point[i][4];
							var start_time = data_point[i][5];
							var end_time = data_point[i][6];
							var is_alarm= data_point[i][7];
							var alarm_type = data_point[i][8];
							var targetIcon = new GIcon();
							targetIcon.iconSize = new GSize(16, 16);
							targetIcon.iconAnchor = new GPoint(8, 8);
							targetIcon.image = "/module/pipe/management/alarm/point/images/"+type+".gif";
							
							if(alarm_type==0){
								alarm_type_content='进漏巡区域报警';
							}else if(alarm_type==1){
								alarm_type_content='出漏巡区域报警';
							}else if(alarm_type==2){
								alarm_type_content='进漏巡区域触发报警';
							}else{
								alarm_type_content='出漏巡区域触发报警';
							}
							var markerOptions = {
								target_id : targetid,
								icon : targetIcon,
								clickable : true
							}
							var point = new GLatLng(g_y , g_x);
							var marker = new GMarker(point, markerOptions);
							map.addOverlay(marker);
							playOverlays.push(marker);
							drawCircle(g_y,g_x,range/1000,'#FF0000',3,0.5,'#ffff00',0.5);					
							var pointHtml = '半径(米)：'+range+'<br/>开始时间：'+utc_to_time(start_time)+'<br/>结束时间：'+utc_to_time(end_time)+'<br/>报警类型：'+alarm_type_content;
							GEvent.addListener(marker, "click", GEvent.callbackArgs(null, function(point, pointHtml){
								map.openInfoWindowHtml(point,pointHtml);
							}, point, pointHtml));
						}
						
					}
				})
			}
		}, {
			text : '返回',
			handler : function() {
				clearPlayOverlay();
				reset_track();
				//map.clearOverlays();
				//drawPolyline();
				Ext.getCmp('select_point').enable();
				westPanel.layout.setActiveItem(card1);
			}
		}]
	});
	/** 地图半径画圆**/
	function drawCircle(lat, lng, radius, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity) {
	    var d2r = Math.PI / 180;
	    var r2d = 180 / Math.PI;
	    var Clat = radius * 0.009;  
	    var Clng = Clat / Math.cos(lat * d2r);
	    var Cpoints = [];
	    // 计算圆周上33个点的经纬度
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
	    polygon = new GPolygon(Cpoints, strokeColor, strokeWidth, strokeOpacity, fillColor, fillOpacity);
	    map.addOverlay(polygon);
	    playOverlays.push(polygon);
	}
	function utc_to_time(val){
		var time_hour = Math.floor(val/3600);
		var time_minute = Math.floor((val-time_hour*3600)/60);
		if(time_minute.toString().length % 2 == 1){
			return time_hour+':0'+time_minute;
		}else{
			return time_hour+':'+time_minute;
		}
	}
	
	var hide_point_button = new Ext.Button({
		text : '隐藏漏巡点',
		handler : function() {
		}
	})
	var westPanel = new Ext.Panel( {
		title : '目标列表',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		margins : '5 0 0 0',
		cmargins : '5 5 0 0',
		width : 300,
		activeItem : 0,
		layout : 'card',
		items : [card1, card2 ]
	});

	var viewport = new Ext.Viewport({
		layout : 'border',
		defaults : {
			border : true
		},
		items : [westPanel, {
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

	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	});

	function getCheckNode(node, arr) {
		var childnodes = node.childNodes;
		for ( var i = 0; i < childnodes.length; i++) {
			var rootnode = childnodes[i];
			if (rootnode.attributes.checked == true) {
				arr.push(rootnode.attributes.target.target_id);
			}
			if (rootnode.childNodes.length > 0) {
				getCheckNode(rootnode, arr);
			}
		}
	}

	/*function drawPolyline(data) {
		for ( var i = 0; i < data.r.length; i++) {
			var polyline = new GPolyline.fromEncoded(eval("(" + data.r[i][1] + ")"));
			map.addOverlay(polyline);
			data.r[i].push(polyline);
		}
	}

	Zion.db.getJSON("realtime.polyline.select", null, function(data) {
		drawPolyline(data);
	});*/
});