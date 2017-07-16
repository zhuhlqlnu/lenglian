Ext.onReady(function() {
	Ext.QuickTips.init();
	var params_search = [-1,99999];
	var type_alias;
	var search_params = null;

	var fields = ['target_name','terminal_sn','address','name','analyze_type','start_time','end_time','week_flag','alarm_delay','alarm_times','alarm_time','geocoding'];
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "pipe.statistics.region.select"
				},
				root : "r",
				fields : fields
			});	

	var grid = new Ext.grid.GridPanel({
		title:'区域报警统计',
		id : 'grid',
		store : store,
		autoScroll : true,
		columns : [{
			header : "目标名称",
			dataIndex : 'target_name',
			width : 30,
			sortable : true

		}, {
			header : "终端号码",
			dataIndex : 'address',
			width :30,
			sortable : true
		}, {
			header : "警戒区域",
			dataIndex : 'name',
			width :30,
			sortable : true
		}, {
			header : "报警类型",
			width : 30,
			dataIndex : 'analyze_type',
			sortable : true,
			renderer:function(analyze_type){
				if(analyze_type == null || analyze_type == ""){
					return;
				}else if(analyze_type == 1){
					return "进区域报警";
				}else if(analyze_type == 2){
					return "出区域报警";
				}else if(analyze_type == 3){
					return "进区域触发报警";
				}else if(analyze_type == 4){
					return "出区域触发报警";
				}else if(analyze_type ==5){
					return "进出区域触发报警";
				}else{
					return "";
				}
			}
		}/*, {
			header : "报警开始时间",
			width : 30,
			sortable : true,
			dataIndex : 'start_time',
			renderer : timeRender
		}, {
			header : "报警结束时间",
			width : 30,
			sortable : true,
			dataIndex : 'end_time',
			renderer : timeRender
		}, {
			header:'报警周期',
			dataIndex : 'week_flag',
			width : 100,
			sortable : true,
			renderer : function(week_flag){
				var alarm1;
				var alarm2;
				var alarm3;
				var alarm4;
				var alarm5;
				var alarm6;
				var alarm7;
				if ((week_flag & 0x01) == 0x01) {
					alarm1 = "星期日.";
				} else {
					alarm1 = "";
				}
				if ((week_flag & 0x02) == 0x02) {
					alarm2 = "星期一.";
				} else {
					alarm2 = "";
				}
				if ((week_flag & 0x04) == 0x04) {
					alarm3 = "星期二.";
				} else {
					alarm3 = "";
				}
				if ((week_flag & 0x08) == 0x08) {
					alarm4 = "星期三.";
				} else {
					alarm4 = "";
				}
				if ((week_flag & 0x10) == 0x10) {
					alarm5 = "星期四.";
				} else {
					alarm5 = "";
				}
				if ((week_flag & 0x20) == 0x20) {
					alarm6 = "星期五.";
				} else {
					alarm6 = "";
				}
				if ((week_flag & 0x40) == 0x40) {
					alarm7 = "星期六.";
				} else {
					alarm7 = "";
				}
				var alarm = alarm2 + alarm3 + alarm4 + alarm5
							+ alarm6 + alarm7+alarm1 ;
				return alarm;
			}
		},  {
			header:'报警延时(秒)',
			dataIndex : 'alarm_delay',
			width : 100,
			sortable : true,
			renderer : function(alarm_delay){
				if(alarm_delay == 0){
					return "无延时";
				}else{
					return alarm_delay;
				}
			}
		},  {
			header:'报警次数',
			dataIndex : 'alarm_times',
			width : 100,
			sortable : true,
			renderer : function(alarm_times) {
				if (alarm_times == 0) {
					return "无限次数";
				} else {
					return alarm_times
				}
			}
		},*/ ,{
			header : "报警时间",
			dataIndex : 'alarm_time',
			width : 100,
			sortable : true
		},{
			header : "位置信息",
			dataIndex : 'geocoding',
			width : 100,
			sortable : true
		}],
		tbar:['目标名称：',{
			xtype : 'textfield',
			id : 'target_id',
			name : 'target_id',
			width : 160
		
		},'警戒区域：',{
			xtype : 'textfield',
			id : 'name_value',
			name : 'name_value',
			width : 160
		
		},'开始时间：',{
			fieldLabel : '开始时间',
			allowBlank : false,
			editable : false,
			id : 'startdttrack',
			width : 100,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		},{
			xtype: 'timefield',
			editable:false,
			format :'H:i',
			id: 'starttftrack',
			width: 60, 
			value: '08:00'
		},'结束时间：', {
			fieldLabel : '结束时间',
			allowBlank : false,
			editable : false,
			id : 'enddttrack',
			width : 100,
			format : 'Y-m-d',
			xtype : 'datefield',
			value : new Date()
		},{
			xtype: 'timefield',
			allowBlank :false,editable:false,
			format :'H:i', 
			id: 'endtftrack', 
			width: 60,
			increment: 1,
			value: '18:00'
		}/*,'报警类型',select_combo*/, {
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
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	store.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	function select_form(){
		type_alias = 'pipe.statistics.region.select.search_by_target_id';
		var target_id = Ext.getCmp("target_id").getValue();
		var name = Ext.getCmp("name_value").getValue();
		var name_value;
		var target_value ;
		if(target_id != ""){
			target_value = 0;
		}else{
			target_value = 1
		}
		if(name != ""){
			name_value = 0;
		}else{
			name_value = 1;
		}
		var s = Ext.getCmp('startdttrack').getRawValue()+' '+Ext.getCmp('starttftrack').getValue()+':00';
		var std = new Date(Date.parse(s.replace(/-/g,"/")));
		//s = "2010-05-23 20:00:00";
		var e = Ext.getCmp('enddttrack').getRawValue()+' '+Ext.getCmp('endtftrack').getValue()+':00';
		var end = new Date(Date.parse(e.replace(/-/g,"/")));
		search_params = [target_id,target_value,name,name_value,std.getTime() / 1000 , end.getTime() / 1000];
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
	
	 function timeRender(val){
    	var hh = parseInt(val/3600);
    	var mi = parseInt((val/3600 -  hh) * 60);
    	if(hh < 10){
    		hh = '0' + hh ;
    	}
    	if(mi < 10){
    		mi = '0' + mi;
    	}
		return  hh + ':' + mi;
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