function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var params_search = [-1,99999];
	var type_alias = "bc.model.alarm_stat";
	var search_params = null;

	/*状态*/
//	var target_store = new Ext.data.SimpleStore( {
//		root : 'r',
//		fields : [ 'target_id', 'target_name' ],
//		proxy : new Ext.data.ScriptTagProxy( {
//			url : ZionSetting.db.url + '/' + Zion.token
//					+ '/bc.model.alarm_stat.target_info'
//		})
//	});
//	var target_combo = new Ext.form.ComboBox({
//		fieldLabel : '派工单号',
//		valueField : 'target_id',
//		store : target_store,
//		hiddenName : 'target_id',
//		displayField : 'target_name',
//		editable : false,
////		allowBlank : false,
////		blankText : '不能为空',
//		triggerAction : 'all',
//		emptyText : '请选择...'
//	});
	
	var start_rec_time = new Ext.form.DateField({
		
	});
	
	
	/**
	 *page grid ok
	 */
	var fields = ['target_id', 'target_name', 'terminal_type_name',
			'gps_time', 'work_time', 'geocoding', 'antenna_status',
			'shell_status', 'location_status', 'acc_status', 'engine_status',
			'alarm1', 'alarm2', 'lock_status_1', 'lock_status_2',
			'lock_status_3', 'lock_status_4', 'power_voltage','address','number_plates','customer','recv_time'];
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "bc.model.alarm_stat_start"
				},
				root : "r",
				fields : fields
			});
	var sm = new Ext.grid.CheckboxSelectionModel();
	

	var grid = new Ext.grid.GridPanel({
		title:'车辆报警统计',
		id : 'grid',
		store : store,
		sm : sm,
		autoScroll : true,
		columns : [sm, {
			header : "序号",
			dataIndex : 'target_id',
			width : 40,
			sortable : true

		}, {
			header : "车辆编号",
			dataIndex : 'number_plates',
//			width : 75,
			sortable : true
		}, {
			header : "终端编号",
			dataIndex : 'target_name',
//			width : 75,
			sortable : true
		}, {
			header : "SIM卡号",
			dataIndex : 'address',
//			width :100,
			sortable : true
		}, {
			header : "机型",
			dataIndex : 'terminal_type_name',
//			width : 100,
			sortable : true
		}, {
			header : "回传时间",
			width : 150,
			dataIndex : 'recv_time',
			sortable : true,
			renderer : function(recv_time){
				if(recv_time){
					return timeStr(recv_time);
				}else{
					return "";
				}
			}	
		}
		,{
			header : "被侵入",
			width : 60,
			sortable : true,
			renderer : function(value, cellmeta, record) {
				var antenna_status;
				var shell_status;
				if (record.data['antenna_status'] == 1) {
					antenna_status = "天线断开.";
				} else if (record.data['antenna_status'] == 2) {
					antenna_status = "天线短路.";
				} else {
					antenna_status = "";
				}
				if (record.data['shell_status'] == 1) {
					shell_status = "外壳打开.";
				} else {
					shell_status = "";
				}
				var contemporary = shell_status + antenna_status;
				if (record.data['shell_status'] == 1
						|| record.data['antenna_status'] == 1
						|| record.data['antenna_status'] == 2) {
					return '<img src="/image/module/sigh.png" title="' + contemporary
							+ '"></img>';
				}
			}
		}, {
			header : "越界报警",
			width : 60,
			sortable : true,
			renderer : function() {
			}
		}, {

			header : "定位异常",
			width : 60,
			dataIndex : 'location_status',
			sortable : true,
			renderer : function(location_status) {
				if (location_status == 0) {
					return '<img src="/image/module/sigh.png" title="不定位"></img>';
				} else {
					return "";
				}
			}
		}, {
			header : "通信异常",
			width : 60,
			sortable : true,
			renderer : function() {
			}
		}, {
			header : "ACC状态",
			width : 60,
			dataIndex : 'acc_status',
			sortable : true,
			renderer : function(acc_status) {
				if (acc_status == 0) {
					return '<img src="/image/module/sigh.png" title="ACC关闭"></img>';
				} else {
					return '';
				}
			}
		}, {
			header : "发动机状态",
			width : 70,
			dataIndex : 'engine_status',
			sortable : true,
			renderer : function(engine_status) {
				if (engine_status == 1) {
					return '';
				} else if (engine_status == 0) {
					return '<img src="/image/module/sigh.png" title="未工作"></img>';
				} else {
					return '';
				}
			}
		}, {
			header : "设备报警",
			width : 60,
			sortable : true,
			renderer : function(value, cellmeta, record) {
				if(record.data['alarm1']==null){
					return "";
				}else{
					var alarm_1 = record.data['alarm1'];
					var alarm_2 = record.data['alarm2'];
	
					var alarm1;
					var alarm2;
					var alarm3;
					var alarm4;
					var alarm5;
					var alarm6;
					var alarm7;
					var alarm8;
					var alarm9;
					var alarm10;
					var alarm11;
					var alarm12;
					var alarm13;
					var alarm14;
					var alarm15;
					var alarm16;
					if ((alarm_1 & 0x01) == 0x01) {
						alarm1 = "桅杆左限位.";
					} else {
						alarm1 = "";
					}
					if ((alarm_1 & 0x02) == 0x02) {
						alarm2 = "桅杆右限位.";
					} else {
						alarm2 = "";
					}
					if ((alarm_1 & 0x04) == 0x04) {
						alarm3 = "垂直.";
					} else {
						alarm3 = "";
					}
					if ((alarm_1 & 0x08) == 0x08) {
						alarm4 = "履带伸展.";
					} else {
						alarm4 = "";
					}
					if ((alarm_1 & 0x10) == 0x10) {
						alarm5 = "履带收缩.";
					} else {
						alarm5 = "";
					}
					if ((alarm_1 & 0x20) == 0x20) {
						alarm6 = "行驶锁死.";
					} else {
						alarm6 = "";
					}
					if ((alarm_1 & 0x40) == 0x40) {
						alarm7 = "限位解除.";
					} else {
						alarm7 = "";
					}
					if ((alarm_1 & 0x80) == 0x80) {
						alarm8 = "副油箱低位报警.";
					} else {
						alarm8 = "";
					}
					if ((alarm_2 & 0x01) == 0x01) {
						alarm9 = "副油箱高位报警.";
					} else {
						alarm9 = "";
					}
					if ((alarm_2 & 0x02) == 0x02) {
						alarm10 = "副油箱虑油器报警.";
					} else {
						alarm10 = "";
					}
					if ((alarm_2 & 0x04) == 0x04) {
						alarm11 = "主卷扬限位.";
					} else {
						alarm11 = "";
					}
					if ((alarm_2 & 0x08) == 0x08) {
						alarm12 = "主卷扬限位.";
					} else {
						alarm12 = "";
					}
					if ((alarm_2 & 0x10) == 0x10) {
						alarm13 = "手柄故障.";
					} else {
						alarm13 = "";
					}
					if ((alarm_2 & 0x20) == 0x20) {
						alarm14 = "1＃压力传感器故障.";
					} else {
						alarm14 = "";
					}
					if ((alarm_2 & 0x40) == 0x40) {
						alarm15 = "2＃压力传感器故障.";
					} else {
						alarm15 = "";
					}
					if ((alarm_2 & 0x80) == 0x80) {
						alarm16 = "3＃压力传感器故障.";
					} else {
						alarm16 = "";
					}
					var alarm = alarm1 + alarm2 + alarm3 + alarm4 + alarm5 + alarm6
							+ alarm7 + alarm8 + alarm9 + alarm10 + alarm11
							+ alarm12 + alarm13 + alarm14 + alarm15 + alarm16;
					if (parseInt(record.data['alarm1'].toString(2)) != 0
							|| parseInt(record.data['alarm2'].toString(2)) != 0) {
						return '<img src="/image/module/sigh.png" title="' + alarm
								+ '"></img>';
					}
				}
			}
		}, {
			header : "锁车状态",
			width : 60,
			sortable : true,
			renderer : function(value, cellmeta, record) {
				var lock_status_1;
				var lock_status_2;
				var lock_status_3;
				var lock_status_4;
				if (record.data['lock_status_1'] == 1) {
					lock_status_1 = "第1路锁.";
				} else {
					lock_status_1 = "";
				}
				if (record.data['lock_status_2'] == 1) {
					lock_status_2 = "第2路锁.";
				} else {
					lock_status_2 = "";
				}
				if (record.data['lock_status_3'] == 1) {
					lock_status_3 = "第3路锁.";
				} else {
					lock_status_3 = "";
				}
				if (record.data['lock_status_4'] == 1) {
					lock_status_4 = "第4路锁.";
				} else {
					lock_status_4 = "";
				}
				var lock_status = lock_status_1 + lock_status_2 + lock_status_3
						+ lock_status_4;
				if (record.data['lock_status_1'] == 1
						|| record.data['lock_status_2'] == 1
						|| record.data['lock_status_3'] == 1
						|| record.data['lock_status_4'] == 1) {
					return '<img src="/image/module/sigh.png" title="' + lock_status
							+ '"></img>';
				}
			}
		}, {
			header : "断电报警",
			width : 60,
			dataIndex : 'power_voltage',
			sortable : true,
			renderer : function(power_voltage) {
				if (power_voltage == 0) {
					return '<img src="/image/module/sigh.png" title="断电"></img>';
				} else {
					return "";
				}
			}
		}],
		tbar:['车辆编号：',{
			xtype : 'textfield',
			id : 'target_id',
			name : 'target_id',
			width : 160
		
		},
			'开始时间',{
			fieldLabel : '开始时间',
			allowBlank : false,
			editable : false,
			id : 'start_rec',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		},'结束时间', {
			fieldLabel : '结束时间',
			allowBlank : false,
			editable : false,
			id : 'end_rec',
			width : 115,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		}, {
				text : '查询',
				tooltip : '查询',
				icon : Ext.zion.image_base+'/select.gif',
				handler : select_form
			}
		],
		bbar : new Ext.PagingToolbar({
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		buttonAlign : 'left',
		buttons : [{
			text : '下载文件',
			id : 'download',
			handler : function() {
				Ext.Msg.alert("下载报表",
								"<a href='"+ Zion.report.getURL(type_alias,search_params)
										+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			}
		}]

	})
	store.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	function select_form(){
		
		search_params = [];
		var target_idV = Ext.getCmp('target_id').getValue();
		if(target_idV==null||target_idV==''){
			type_alias = 'statisical.alarm_stat.search_form';
		}else{
			type_alias = 'statisical.alarm_stat.search_by_target_id';
			search_params.push(target_idV);
		}
		search_params.push(Ext.getCmp('start_rec').getValue().getTime()/1000);
		search_params.push(Ext.getCmp('end_rec').getValue().getTime()/1000);
		grid.store.constructor({
					db : {
						alias : type_alias,
						params : search_params
					},
					root : "r",
					fields : fields
				});
		grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})

		
	}	
	
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
					region : 'center',
					layout:'fit',
					items : [grid]
				}]
	}

	);
})