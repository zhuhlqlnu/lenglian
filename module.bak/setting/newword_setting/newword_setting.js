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

	function take_photo(camera_id) {
		send(getCheckedTarget(), 'take_photo', [ camera_id ]);
	}

	function stop_camera_id(camera_id) {
		send(getCheckedTarget(), 'stop_camera_id', [ camera_id ]);
	}
	
	function send_time(time_interval , time_length){
		send(getCheckedTarget(), 'time', [ time_interval , time_length ]);
	}
	
	function send_times(frequency_interval , frequency_pass){
		send(getCheckedTarget(), 'times', [ frequency_interval , frequency_pass ]);
	}
	
	function send_speed_alarm(speed_value , speed_interval){
		send(getCheckedTarget(), 'speed_alarm', [ speed_value , speed_interval ]);
	}
	
	function send_stop_speed_alarm(speed_value ){
		send(getCheckedTarget(), 'speed_alarm', [ speed_value ]);
	}
	function send_cameratimes(camera_id_, frequency_pass , frequency_interval ){
		send(getCheckedTarget(), 'take_photo', [camera_id_, frequency_pass ,frequency_interval ]);
	}
	//send.take_photo =  7E0023${terminal}${seqID}004C00${1}00000001000000000001003c03010101010102
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
			title : '[拍照]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ new Ext.form.ComboBox( {
				store : new Ext.data.SimpleStore( {
					fields : [ "id", 'name' ],
					data : [ [ '01', '摄像头1' ], [ '02', '摄像头2' ]]
				}),
				valueField : "id",
				displayField : "name",
				mode : 'local',
				forceSelection : true,
				hiddenName : 'name',
				editable : false,
				triggerAction : 'all',
				allowBlank : true,
				fieldLabel : '选择摄像头',
				name : 'name',
				listWidth : 150,
				value : '01',
				id : 'camera_id',
				width : 150
			}) ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var camera_id_ = Ext.getCmp('camera_id').getValue();
					take_photo(camera_id_);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[定次拍照]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ new Ext.form.ComboBox( {
				store : new Ext.data.SimpleStore( {
					fields : [ "id", 'name' ],
					data : [ [ '01', '摄像头1' ], [ '02', '摄像头2' ]]
				}),
				valueField : "id",
				displayField : "name",
				mode : 'local',
				forceSelection : true,
				hiddenName : 'name',
				editable : false,
				triggerAction : 'all',
				allowBlank : true,
				fieldLabel : '选择摄像头',
				name : 'name',
				listWidth : 150,
				value : '01',
				id : 'camera_id_interval',
				width : 150
			}),{
				id : 'camera_interval',
				fieldLabel : '时间间隔(秒)',
				allowBlank : false,
				value : "10",
				width : 150
			},{
				id : 'camera_pass',
				fieldLabel : '回传次数',
				allowBlank : false,
				value : "10",
				width : 150
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var frequency_interval_ = Ext.getCmp('camera_interval').getValue();
					if (frequency_interval_ == '') {
						Ext.Msg.alert('提示', '请输入时间间隔!');
						return;
					}
					var frequency_pass_ = Ext.getCmp('camera_pass').getValue();
					if (frequency_pass_ == '') {
						Ext.Msg.alert('提示', '请输入回传次数!');
						return;
					}
					var camera_id_ = Ext.getCmp('camera_id_interval').getValue();
					frequency_interval_ = (parseInt(frequency_interval_,10)).toString(16);
					frequency_pass_ = (parseInt(frequency_pass_,10)).toString(16);
					frequency_interval_ = fixdata(frequency_interval_, 4);
					frequency_pass_ = fixdata(frequency_pass_, 4);
					send_cameratimes(camera_id_,frequency_pass_,frequency_interval_);
				}
			} ]
		},{
			xtype : 'fieldset',
			title : '[停止摄像头控制]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ new Ext.form.ComboBox( {
				store : new Ext.data.SimpleStore( {
					fields : [ "id", 'name' ],
					data : [ [ '01', '摄像头1' ], [ '02', '摄像头2' ]]
				}),
				valueField : "id",
				displayField : "name",
				mode : 'local',
				forceSelection : true,
				hiddenName : 'name',
				editable : false,
				triggerAction : 'all',
				allowBlank : true,
				fieldLabel : '选择摄像头',
				name : 'name',
				listWidth : 150,
				value : '01',
				id : 'stop_camera_id',
				width : 150
			}) ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var camera_id_ = Ext.getCmp('stop_camera_id').getValue();
					stop_camera_id(camera_id_);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[定时回传间隔]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ {
				id : 'time_interval',
				fieldLabel : '时间间隔(秒)',
				allowBlank : false,
				value : "10",
				width : 150
			} ,{
				id : 'time_length',
				fieldLabel : '时间长度(分钟)',
				allowBlank : false,
				value : "10",
				width : 150
			}],
			buttons : [ {
				text : "设置",
				handler : function() {
					var time_interval_ = Ext.getCmp('time_interval').getValue();
					if (time_interval_ == '') {
						Ext.Msg.alert('提示', '请输入时间间隔!');
						return;
					}
					var time_length_ = Ext.getCmp('time_length').getValue();
					if (time_length_ == '') {
						Ext.Msg.alert('提示', '请输入时间长度!');
						return;
					}
					time_interval_ = (parseInt(time_interval_,10)).toString(16);
					time_length_ = (parseInt(time_length_,10)).toString(16);
					time_interval_ = fixdata(time_interval_, 4);
					time_length_ = fixdata(time_length_, 4);
					send_time(time_length_ , time_interval_);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[定次回传间隔]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ {
				id : 'frequency_interval',
				fieldLabel : '时间间隔(秒)',
				allowBlank : false,
				value : "10",
				width : 150
			},{
				id : 'frequency_pass',
				fieldLabel : '回传次数',
				allowBlank : false,
				value : "10",
				width : 150
			} ],
			buttons : [ {
				text : "设置",
				handler : function() {
					var frequency_interval_ = Ext.getCmp('frequency_interval').getValue();
					if (frequency_interval_ == '') {
						Ext.Msg.alert('提示', '请输入时间间隔!');
						return;
					}
					var frequency_pass_ = Ext.getCmp('frequency_pass').getValue();
					if (frequency_pass_ == '') {
						Ext.Msg.alert('提示', '请输入回传次数!');
						return;
					}
					frequency_interval_ = (parseInt(frequency_interval_,10)).toString(16);
					frequency_pass_ = (parseInt(frequency_pass_,10)).toString(16);
					frequency_interval_ = fixdata(frequency_interval_, 4);
					frequency_pass_ = fixdata(frequency_pass_, 4);
					send_times(frequency_pass_,frequency_interval_);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[设置超速报警]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			items : [ {
				id : 'speed_value',
				fieldLabel : '速度值(公里/小时)',
				allowBlank : false,
				value : "120",
				width : 150
			} ,{
				id : 'speed_interval',
				fieldLabel : '持续时间(秒)',
				allowBlank : false,
				value : "600",
				width : 150
			}],
			buttons : [ {
				text : "设置",
				handler : function() {
					var speed_value = Ext.getCmp('speed_value').getValue();
					if (speed_value == '') {
						Ext.Msg.alert('提示', '请输入速度值!');
						return;
					}
					var speed_interval = Ext.getCmp('speed_interval').getValue();
					if (speed_interval == '') {
						Ext.Msg.alert('提示', '请输入持续时间!');
						return;
					}
					speed_value = (parseInt(speed_value,10)).toString(16);
					speed_interval = (parseInt(speed_interval,10)).toString(16);
					speed_value = fixdata(speed_value, 2);
					speed_interval = fixdata(speed_interval, 2);
					
					send_speed_alarm(speed_value , speed_interval);
				}
			} ]
		}, {
			xtype : 'fieldset',
			title : '[取消超速报警]',
			buttonAlign : 'left',
			labelWidth : 120,
			defaultType : 'numberfield',
			buttons : [ {
				text : "设置",
				handler : function() {
					var val_ = (parseInt(0,10)).toString(16);
					val_ = fixdata(val_, 4);
					send_speed_alarm(val_,val_);
				}
			} ]
		} ]
	});
	
	function fixdata(data, length){
		for(var i = data.length;i < length;i += 1){
			data = "0"+data;
		}
		return data;
	}
	
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