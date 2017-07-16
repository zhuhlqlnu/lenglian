Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中,请稍后 ..."
	});
	loadMask.show();

	var sendMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "指令发送中,请稍后 ..."
	});

	var targetTree = new Ext.tree.TreePanel( {
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

	function send(targets, type, params, callback, scope) {
		if (targets.length == 0) {
			Ext.Msg.alert('提示', '请选择终端');
			return;
		}
		sendMask.show();
		function doNext() {
			if (targets.length > 0) {
				Zion.send.send(targets.pop(), type, params, function(data) {
					if(data.f){
						Ext.Msg.alert("发送错误", data.f);
					}else{
						Ext.Msg.alert("提示", "指令发送成功");
					}
					doNext();
				});
			} else {
				sendMask.hide();
				if (callback) {
					callback.call(scope || window);
				}
			}
		}
		doNext();
	}

	function sendInitializeTerminal(apn, ip, port) {
		send(getCheckedTarget(), 'gprs', [ apn, ip, port ]);
	}

	function sendIntervalTime(intval) {
		send(getCheckedTarget(), 'time', [ intval ]);
	}

	function sendMode(mode) {
		send(getCheckedTarget(), 'mode', [ mode ]);
	}
	
	function sendphonenum() {
		send(getCheckedTarget(), 'smscenter', [ '1065582188901' ]);
		send(getCheckedTarget(), 'addphonenum', [ '1065582188901' ]);
		
	}
	
	function sms_ssNum( specialservicenum){
		send(getCheckedTarget(), 'addphonenum', [ specialservicenum ]);
	}

	function sms_centerNum(smscenternum){
		send(getCheckedTarget(), 'smscenter', [ smscenternum ]);
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
		collapsible : true,
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

	var setting = new Ext.Panel( {
		region : 'center',
		autoScroll : true,
		frame : true,
		bodyStyle : 'padding:5px 5px 5px 5px',
		items : [ {
			xtype : 'fieldset',
			title : '[设置初始化]',
			buttonAlign : 'left',
			labelWidth : 80,
			defaultType : 'textfield',
			items : [],
			buttons : [ {
				text : "设置",
				handler : function() {
					sendInitializeTerminal('cmnet', '58.22.104.17', '10200');
					sendMode(1);
					sendIntervalTime(10);
					sendphonenum();
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[GPS设置]',
			buttonAlign : 'left',
			labelWidth : 80,
			defaultType : 'textfield',
			items : [ {
				id : 'apn_frm',
				fieldLabel : 'APN',
				allowBlank : false,
				value : "cmnet",
				width : 150
			}, {
				id : 'ip_frm',
				fieldLabel : '地址',
				name : 'last',
				width : 150,
				value : '58.22.104.17'
			}, {
				xytpe : 'numberfiled',
				id : 'port_frm',
				fieldLabel : '端口',
				width : 150,
				value : 10200
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var tmpapn = Ext.getCmp('apn_frm').getValue();
					if (tmpapn == '') {
						Ext.Msg.alert('提示', '请输入APN!');
						return;
					}
					var tmpip = Ext.getCmp('ip_frm').getValue();
					if (tmpip == '') {
						Ext.Msg.alert('提示', '请输入地址!');
						return;
					}
					var tmpport = Ext.getCmp('port_frm').getValue();
					if (tmpport == '') {
						Ext.Msg.alert('提示', '请输入端口!');
						return;
					}
					sendInitializeTerminal(tmpapn, tmpip, tmpport);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[数据回传间隔]',
			buttonAlign : 'left',
			labelWidth : 80,
			defaultType : 'numberfield',
			items : [ {
				id : 'timeFrequency',
				fieldLabel : '时间间隔(秒)',
				allowBlank : false,
				value : "10",
				width : 150
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var tmptimeFrequency = Ext.getCmp('timeFrequency').getValue();
					if (tmptimeFrequency == '') {
						Ext.Msg.alert('提示', '请输入时间间隔!');
						return;
					}
					sendIntervalTime(tmptimeFrequency);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[模式设置]',
			buttonAlign : 'left',
			labelWidth : 80,
			items : [ new Ext.form.ComboBox( {
				store : new Ext.data.SimpleStore( {
					fields : [ "id", 'name' ],
					data : [ [ 0, '省电模式' ], [ 1, '车载模式' ], [ 2, '定时定位模式' ] ]
				}),
				valueField : "id",
				displayField : "name",
				mode : 'local',
				forceSelection : true,
				hiddenName : 'name',
				editable : false,
				triggerAction : 'all',
				allowBlank : true,
				fieldLabel : '选择模式',
				name : 'name',
				listWidth : 150,
				value : 1,
				id : 'mode_frm',
				width : 150
			}) ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var tmpmode = Ext.getCmp('mode_frm').getValue();
					sendMode(tmpmode);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[短信中心号设置]',
			buttonAlign : 'left',
			labelWidth : 80,
			defaultType : 'textfield',
			items : [ {
				id : 'smscenternum',
				fieldLabel : '短信中心号码',
				allowBlank : false,
				value : "1065582188901",
				width : 150
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var smscenternum = Ext.getCmp('smscenternum').getValue();
					if (smscenternum == '') {
						Ext.Msg.alert('提示', '请输入短信中心号码!');
						return;
					}
					sms_centerNum(smscenternum);
					
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[特服号设置]',
			buttonAlign : 'left',
			labelWidth : 80,
			defaultType : 'textfield',
			items : [{
				id : 'specialservicenum',
				fieldLabel : '特服号',
				allowBlank : false,
				width : 150
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var specialservicenum = Ext.getCmp('specialservicenum').getValue();
					if (specialservicenum == '') {
						Ext.Msg.alert('提示', '请输入特服号!');
						return;
					}
					sms_ssNum(specialservicenum);
					
				}
			} ]
		} ]
	});

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			title : '监控目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [ targetTree, targetInfo ]
		}, setting ]
	});

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	}, true);
});