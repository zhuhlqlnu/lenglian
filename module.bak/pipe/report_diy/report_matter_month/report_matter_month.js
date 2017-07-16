Ext.onReady(function() {
	Ext.QuickTips.init();
	var target_id_array = new Array();
	var precedeMonth = new Date();
	precedeMonth.setMonth(precedeMonth.getMonth() - 1);
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
	
	var sql_list = "pipe.report_diy.report_matter_month.select";
	var field_list = [ 's_date', 'e_date', 'target_name','target_id','patrol_count','speed_count', 
			'region_count' ,'point_count','task_count','real_salary','passed','prize_count'];
	var params_list = [];
	var params_list_report = [];

		var store = new Ext.data.ArrayStore({
			root:"r",
			fields: field_list
		});

		var grid = new Ext.grid.GridPanel({  
			loadMask : {msg : '查询中...'},
			 flex : 4,
	         store: store,
	         columns: [  
			     {header: "开始日期", dataIndex: 's_date', width:50, sortable: true},  
			     {header: "结束日期", dataIndex: 'e_date', width:50, sortable: true},  
	             {header: "巡线员", dataIndex: 'target_name', width:50, sortable: true},  
//	             {header: "事件上报", dataIndex: 'patrol_count', width:50, sortable: true,hidden:true},  
	             {header: "超速报警(次)", dataIndex: 'speed_count', width:50, sortable: true},  
	             {header: "越界报警(次)", dataIndex: 'region_count', width:50, sortable: true},  
	             {header: "漏巡报警(次)", dataIndex: 'point_count', width:50, sortable: true},  
//	             {header: "特殊任务", dataIndex: 'task_count', width:50, sortable: true,hidden:true},  
	             {header: "合格率(%)", dataIndex: 'passed', width:50, sortable: true,renderer:function(value){
	             	return Math.round(value*100*100)/100 ;
	             
	             }},
	             {header: "实发工资(￥)", dataIndex: 'real_salary', width:50, sortable: true,renderer : function(value){
	             	if(value){
		             	return  value;             		
	             	}else{
	             		return 0;
	             	}
	             
	             }},
	             {header: "奖金(￥)", dataIndex: 'prize_count', width:50, sortable: true,renderer : function(value){
		             	if(value == 0){
			             	return 150;
		             	}else{
		             		return 0;
		             	}
		             
		             }}
	         ],  
	         tbar:['<b>请选择用户后，根据</b>','开始日期：',  {
					xtype : 'datefield',
					disabled : false,
					width : 140,
					id : 'star_date',
					format : 'Y-m',
					value : precedeMonth
				},'结束日期：',  {
					xtype : 'datefield',
					disabled : false,
					width : 140,
					id : 'end_date',
					format : 'Y-m',
					value : precedeMonth
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
						Ext.Msg.alert("下载报表",
										"<a href='"+ Zion.report.getURL(sql_list,params_list_report)
												+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
					},
					scope : this
				}],
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
 		}); 

		
		var store_total = new Ext.data.ArrayStore({
        fields: [
           {name: 'gps_date' },
           {name: 'target_name' },
           {name: 'patrol_count' },
           {name: 'speed_count' },
           {name: 'region_count' },
           {name: 'piont_count' },
           {name: 'task_count' },
           {name: 'passed' },
           {name: 'real_salary' },
           {name: 'prize_count' }
        ]
    });
		
		var grid_total = new Ext.grid.GridPanel({
//			flex : 4,
			height : 70,
			store : store_total,
			columns : [{
						header : "汇总",
						dataIndex : 'gps_date',
						width : 50,
						sortable : true
					}, {
						header : "巡线员",
						dataIndex : 'target_name',
						width : 50,
						sortable : true
					}, /*{
						header : "事件上报",
						dataIndex : 'patrol_count',
						width : 50,
						sortable : true
					},*/ {
						header : "超速报警(次)",
						dataIndex : 'speed_count',
						width : 50,
						sortable : true
					}, {
						header : "越界报警(次)",
						dataIndex : 'region_count',
						width : 50,
						sortable : true
					}, {
						header : "漏巡报警(次)",
						dataIndex : 'piont_count',
						width : 50,
						sortable : true
					},/* {
						header : "特殊任务",
						dataIndex : 'task_count',
						width : 50,
						sortable : true
					},*/ {
						header : "合格率(%)",
						dataIndex : 'passed',
						width : 50,
						sortable : true
					}, {
						header : "总工资(￥)",
						dataIndex : 'real_salary',
						width : 50,
						sortable : true
					}, {
						header : "总奖金(￥)",
						dataIndex : 'prize_count',
						width : 50,
						sortable : true
					}],
			bbar : [],
			viewConfig : {
				autoFill : true,
				forceFit : true
			},
			listeners : {
				'load' : function(){
					
				
				},
				'render' : function(){
				
				}
			}

			
		});

//		store_total.load();


	
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
			    grid,
			    grid_total
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
		var startTime = Ext.getCmp('star_date').getRawValue();
		var endTime = Ext.getCmp('end_date').getRawValue();
		var startTimeArr = startTime.split('-');
		startTime = new Date(startTimeArr[0], startTimeArr[1] - 1, 1);
		var endTimeArr = endTime.split('-');
		endTime = new Date(endTimeArr[0], endTimeArr[1], 0,23,59,59);

		startTime = startTime.getTime()/1000;
		endTime = endTime.getTime()/1000;
		var t = checkTargetV.toString();
		var s = startTime;
		var e = endTime;
		
		params_list = [s,e,t];
		params_list_report = [s,e,t];
		loadMask.show();
		Zion.db.getJSON("pipe.report_diy.report_matter_month.select", params_list, function(data) {
			if(data.r){
				store.loadData(data);
				var result = data.r;
				var patrol_countV = 0;
				var speed_countV = 0;
				var region_countV = 0;
				var point_countV = 0;
				var task_countV = 0;
				var pass_rateV = 0 ;
				var real_salaryV = 0;
				var prize_countV = 0;
				for(var i = 0;i < result.length;i++){
					patrol_countV += result[i][4];
					speed_countV += result[i][5];
					region_countV += result[i][6];
					point_countV += result[i][7];
					task_countV += result[i][8];
					pass_rateV += result[i][10];
					real_salaryV += result[i][9];
					if(result[i][11] == 0){
						prize_countV += 150;
					}
				}
				var avge_rateV = Math.round((pass_rateV / result.length) * 100 * 100)/100;
				real_salaryV = Math.round(real_salaryV * 100)/100;
				grid_total.store.loadData( [['<b> 汇总</b>','共'+result.length+'人',patrol_countV,speed_countV,
					region_countV,point_countV,task_countV,avge_rateV,real_salaryV,prize_countV] ]);
				
				
				loadMask.hide();
			}else{
				Ext.Msg.alert('提示','未查到数据!');
				loadMask.hide();
			}
		});

		/*
		store.constructor({
					db : {
						alias : sql_list,
						params : params_list
					},
					root : "r",
					fields : field_list
				});*
		/*store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});*/
		
		//store.load();
//		},this);

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