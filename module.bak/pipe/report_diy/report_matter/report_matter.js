Ext.onReady(function() {
	Ext.QuickTips.init();
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	
	var target_id_array = new Array();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中,请稍后 ..."
	});
	loadMask.show();
	
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
	
	var sql_list = "pipe.report_diy.report_matter.select";
	var field_list = ['report_id','target_name','task_name','start_time','end_time','to_task_point','do_task_point','no_task_point'];

	var params_list = [];
	var params_list_report = [];

		var store = new Ext.data.ArrayStore({
			root:"r",
			fields: field_list,
			add : true,
			listeners : {
				'load' : function(this_, records, opt) {
				}
			}
		});
		var grid = new Ext.grid.GridPanel({  
			loadMask : {msg : '查询中...'},
			 flex : 4,
	         store: store, 
	         columns: [  
			     {header : "开始日期",dataIndex : 'start_time',width : 150,sortable : true}, 
				   {header : "结束日期",dataIndex : 'end_time',width : 150,sortable : true},
				   {header : "巡线员",dataIndex : 'target_name',width : 150,sortable : true}, 
				   {header : "任务名称",dataIndex : 'task_name',width : 150,sortable : true}, 
				   {header : "巡检点总数",dataIndex : 'to_task_point',width : 150,sortable : true}, 
	//		           {header : "超速报警(次)",dataIndex : 'speed_count',width : 50,sortable : true},
				   {header : "到达巡检点个数",dataIndex : 'do_task_point',width : 120,sortable : true,renderer:function(v,c,r){
						var report_id = r.data["report_id"];
						var do_task_point = r.data["do_task_point"];
						if(do_task_point == 0){
							return "0";
						}
						return "<a href='#' onclick='return show_finish_point("+report_id+")'>"+do_task_point+"</a>";
				   }} ,
				   {header : "漏巡个数",dataIndex : 'no_task_point',width : 120,sortable : true,renderer:function(v,c,r){
						var report_id = r.data["report_id"];
						var no_task_point = r.data["no_task_point"];
						if(no_task_point == 0){
							return "0";
						}
						return "<a href='#' onclick='return show_no_finish_point("+report_id+")'>"+no_task_point+"</a>";
				   }}
	         ],  
	         tbar:['<b>请选择用户后，根据</b>','开始日期：',  {
					xtype : 'datefield',
					disabled : false,
					width : 140,
					id : 'star_date',
					format : 'Y-m-d',
					value : yesterday
				},'结束日期：',  {
					xtype : 'datefield',
					disabled : false,
					width : 140,
					id : 'end_date',
					format : 'Y-m-d',
					value : yesterday
				}, {
					text : '查询',
					tooltip : '查询',
					icon : Ext.zion.image_base+'/select.gif',
					handler : report_matter_search
				},{
					text : '导出报表',
					icon : Ext.zion.image_base+'/report_link.png',
					tooltip : '导出报表',
					handler : function() {
						var checkTargetV = getCheckedTarget();
						if(checkTargetV.length<=0){
							Ext.Msg.alert('<b>提示</b>','请在人员列表选择人员!');
							return false;
						}
						Ext.Msg.alert("下载报表","<a href='" + Zion.report.getURL(sql_list,params_list_report) + "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
					},
					scope : this
				}]
 		}); 

	function show_finish_point(report_id){
		var finish_point_store = new Ext.data.SimpleStore({
			fields : ['gps_time', 'name' ],
			root : 'r',
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.report_one.finish_point/['+report_id+']'
			})
		});

		finish_point_store.load();
		var finish_point_grid = new Ext.grid.GridPanel({
			store:finish_point_store,
			width:400,
			height:300,
			layout:'fit',
			columns: [new Ext.grid.RowNumberer({header:'序号',width:35}),
				{header : "时间",dataIndex : 'gps_time',width : 90,sortable : true}, 
				{header : "巡检点",dataIndex : 'name',width : 90,sortable : true} 
			],
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		});

			
		var finish_point_win = new Ext.Window({
			title : '到达巡检点',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			width : 400,
			items : [finish_point_grid],
			buttons : [{
				text : '关闭',
				handler : function() {
					finish_point_win.close();
				}
			} ]
		});
		finish_point_win.show();
	}
	window.show_finish_point = show_finish_point;

	function show_no_finish_point(report_id){
		var no_finish_point_store = new Ext.data.SimpleStore({
			fields : [ 'name' ],
			root : 'r',
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.report_one.no_finish_point/['+report_id+']'
			})
		});

		no_finish_point_store.load();
		var no_finish_point_grid = new Ext.grid.GridPanel({
			store:no_finish_point_store,
			width:400,
			height:300,
			layout:'fit',
			columns: [new Ext.grid.RowNumberer({header:'序号',width:35}),
				{header : "巡检点",dataIndex : 'name',width : 90,sortable : true} 
			],
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		});

			
		var no_finish_point_win = new Ext.Window({
			title : '漏巡巡检点',
			closable : true,
			closeAction : 'close',
			autoWidth : false,
			width : 400,
			items : [no_finish_point_grid],
			buttons : [{
				text : '关闭',
				handler : function() {
					no_finish_point_win.close();
				}
			} ]
		});
		no_finish_point_win.show();
	}
	window.show_no_finish_point = show_no_finish_point;

	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [ {
			title : '用户目标列表',
			region : 'west',
			collapsible : true,
			split : true,
			width : 200,
			layout : 'border',
			items : [ targetTree ,targetInfo]
		}, {
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
		} ]
	});

	Ext.zion.tree.loadTargetTree(function(tree) {
		targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	}, true);
	
	function report_matter_search() {
		var checkTargetV = getCheckedTarget();
		if(checkTargetV.length<=0){
			Ext.Msg.alert('<b>提示</b>','请在人员列表选择人员!');
			return false;
		}
		var startTime = Ext.getCmp('star_date').getValue();
		startTime.setHours(0);startTime.setMinutes(0);startTime.setSeconds(0);
		var endTime = Ext.getCmp('end_date').getValue();
		endTime.setHours(23);endTime.setMinutes(59);endTime.setSeconds(59);
		startTime = startTime.getTime()/1000;
		endTime = endTime.getTime()/1000;
		var t = checkTargetV.toString();
		var s = startTime;
		var e = endTime;
		params_list = [t,t,t,t,t,s,e];
		params_list_report = [t,t,t,t,t,s,e];
		loadMask.show();
		Zion.db.getJSON("pipe.report_diy.report_matter.select", params_list, function(data) {
			if(data.r){
				store.loadData(data);
				loadMask.hide();
			}else{
				Ext.Msg.alert('提示','未查到数据!');
				loadMask.hide();
			}
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
});