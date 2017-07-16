Ext.onReady(function() {
	Ext.QuickTips.init();
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	var selectCorpId = selectCorpId;
	var id = [];
	var formPanel;
	var target_idT;
	var user_nameT;
	var params_fields;
	var params_fields_total = null;
	var store_sql = "pipe.report_diy.report_all.by_corp.select";
	var fields = ['target_id','target_name','p_group_name','group_name','polyline','login_time','logout_time','t_count','no_finish','p_name' ];
	
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	
	var store = new Ext.data.ArrayStore({
		root : "r",
		fields : fields,
		add : true
	});
	
	var grid = new Ext.grid.GridPanel({
		flex : 4,
		store : store,
		columns : [{header : "序号",dataIndex : 'target_id',width : 50,sortable : true},
				   {header : "站库名称",dataIndex : 'p_group_name',width : 80,sortable : true},
				   {header : "巡线员",dataIndex : 'target_name',width : 60,sortable : true}, 
				   {header : "管道工/农民工",dataIndex : 'group_name',width : 100,sortable : true}, 
				  // {header : "任务名称",dataIndex : 'task_name',width : 120,sortable : true},
				   {header : "登录时间",dataIndex : 'login_time',width : 120,sortable : true},
				   {header : "下线时间",dataIndex : 'logout_time',width : 120,sortable : true} ,
				   {header : "巡检管段",dataIndex : 'polyline',width : 120,sortable : true} ,
				   {header : "巡检个数",dataIndex : 't_count',width : 120,sortable : true},
				   {header : "漏巡个数",dataIndex : 'no_finish',width :70,sortable : true},
				    {header : "漏巡名称",dataIndex : 'p_name',width : 70,sortable : true}
		],
		tbar:['<b>请选择用户后，根据</b>', '开始日期：', 
		        {
			xtype : 'datefield',
			disabled : false,
			width : 140,
			id : 'star_date',
			format : 'Y-m-d',
			value : yesterday,
			maxValue:yesterday
		}, {
			text : '查询',
			tooltip : '查询',
			icon : Ext.zion.image_base + '/select.gif',
			handler : report_one_search
		}, {
			text : '导出报表',
			icon : Ext.zion.image_base + '/report_link.png',
			tooltip : '导出报表',
			handler : function() {
				Ext.Msg.alert("下载报表","<a href='" + Zion.report.getURL(store_sql,params_fields) + "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
			},
			scope : this
		}]
	});

	// grid自适应
	new Ext.Viewport({
		layout : 'border',
		border : false,
		items : [
			{
				region : 'center',
				split : true,
				layout:'vbox',
				layoutConfig: {
					align : 'stretch',
					pack  : 'start'
				},
				items: [
					grid
				]
			}]
	});

	function report_one_search() {
		loadMask.show();
		var startTime = Ext.getCmp('star_date').getValue();
		startTime.setHours(0);startTime.setMinutes(0);startTime.setSeconds(0);
		startTime = startTime.getTime() / 1000;
		var t = target_idT;
		var s = startTime;
		var e = startTime+24*3600;
		params_fields = [s,e,s,e];
		Zion.db.getJSON("pipe.report_diy.report_all.by_corp.select", params_fields, function(data) {
			if(data.r){
				store.loadData(data);
				loadMask.hide();
			}else{
				loadMask.hide();
				Ext.Msg.alert('提示','未查到数据!');
			}
		});
	}
	report_one_search();
	loadMask.hide();
})