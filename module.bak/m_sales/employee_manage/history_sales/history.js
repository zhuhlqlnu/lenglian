var map;
Ext.onReady(function() {
	Ext.QuickTips.init();
	var targetid = '';
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
			value : '08:00'
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
			value : '18:00'
		} ],
		buttons : [ {
			text : '查询',
			handler : function() {
				if (targetid.length <= 0) {
					Ext.Msg.alert('提示', '请选择终端');
					return;
				}

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
					return;
				}
				parseTrackData(data.r);
				westPanel.layout.setActiveItem(card2);
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
		items : [ targetTree, form ]
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
				items : [ {
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
					id : 'terminal_status_desc',
					xtype : 'label',
					fieldLabel : '详细信息'
				} ]
			} ]
		} ],
		buttons : [ {
			text : '返回',
			handler : function() {
				reset_track();
				map.clearOverlays();
				westPanel.layout.setActiveItem(card1);
			}
		} ]
	});

	var westPanel = new Ext.Panel( {
		title : '车辆列表',
		autoScroll : true,
		collapsible : true,
		split : true,
		region : 'west',
		margins : '5 0 0 0',
		cmargins : '5 5 0 0',
		width : 300,
		activeItem : 0,
		layout : 'card',
		items : [ card1, card2 ]
	});

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ westPanel, {
			layout : 'fit',
			region : 'center',
			contentEl : 'map_canvas',
			listeners : {
				bodyresize : function(p, width, height) {
					// alert(width);
			// alert(height);
			if (width != undefined) {
				document.getElementById("map_canvas").style.width = width;
			}
			if (height != undefined) {
				document.getElementById("map_canvas").style.height = height;
			}
			if (map) {
				map.checkResize();
			}
		}
	}
		} ]
	});

	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

	loadTargetTree(function(tree) {
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

});