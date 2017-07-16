function timeStr(n) {
	 return new Date(n * 1000).toLocaleString();
}
var tbar_select;
var new_start_time;
var new_end_time;
Ext.onReady(function() {
	Ext.QuickTips.init();
	var formPanel;
	var special_events_add = true;
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
	
	
	/**常规报表时间**/
	select_time = function(){
		var date_day = new Date();
		var today = date_day.getDate();
		var month = date_day.getMonth()+1;
		var year = date_day.getFullYear();
		var date = year+'-'+fillstring((month).toString())+'-'+fillstring((today).toString());
		var start_time = '00:00:00';
		var end_time = '23:59:59';
		var oneminute = 60*1000;
	    var onehour   = 60*oneminute;
	    var oneday    = 24*onehour;
	    var oneweek   = 7*oneday;
		if(Ext.getCmp('yestoday').checked == true){
			var yestoday = new Date(year,date_day.getMonth(),date_day.getDate());
			yestoday.setDate(date_day.getDate()-1);
			var yestoday_month = fillstring((yestoday.getMonth()+1).toString());
			var yestoday_day =	fillstring((yestoday.getDate()).toString());
			var yestoday_year =	yestoday.getFullYear();
			var new_date = yestoday_year+'-'+yestoday_month+'-'+yestoday_day;
			new_start_time = (new Date((Date.parse((new_date+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((new_date+' '+end_time).replace(/-/g, "/")))).getTime()/1000);	
		}else if(Ext.getCmp('today').checked == true){
			new_start_time = (new Date((Date.parse((date+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((date+' '+end_time).replace(/-/g, "/")))).getTime()/1000);			
		}else if(Ext.getCmp('this_week').checked == true){
			var daytoMon = today-1;
		    if(today==0)
		    daytoMon = 6;			    
		    date_day.setTime(date_day-date_day.getDay()*oneday);
		    date = date_day.getDate();
		    month= date_day.getMonth() +1;
		    year= date_day.getYear();
		    day = date_day.getDay();					    
		    var starttime = year.toString() + "-" + fillstring(month.toString()) + "-" +				
		    fillstring(date.toString());			    
		    date_day.setTime(date_day.getTime()+6*oneday);				    
		    date = date_day.getDate();
		    month= date_day.getMonth() +1;
		    year= date_day.getYear();		    
			var endtime = year.toString() + "-" + fillstring(month.toString()) + "-" +
			fillstring(date.toString());
			new_start_time = (new Date((Date.parse((starttime+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((endtime+' '+end_time).replace(/-/g, "/")))).getTime()/1000);		
		}else if(Ext.getCmp('last_week').checked == true){
			var daytoMon = today-1;
		    if(today==0)
		    daytoMon = 6;			    
		    date_day.setTime(date_day-date_day.getDay()*oneday-7*oneday);
		    date = date_day.getDate();
		    month= date_day.getMonth() +1;
		    year= date_day.getYear();
		    day = date_day.getDay();					    
		    var starttime = year.toString() + "-" + fillstring(month.toString()) + "-" +				
		    fillstring(date.toString());			    
		    date_day.setTime(date_day.getTime()+6*oneday);				    
		    date = date_day.getDate();
		    month= date_day.getMonth() +1;
		    year= date_day.getYear();		    
			var endtime = year.toString() + "-" + fillstring(month.toString()) + "-" +
			fillstring(date.toString());
			new_start_time = (new Date((Date.parse((starttime+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((endtime+' '+end_time).replace(/-/g, "/")))).getTime()/1000);
		}else if(Ext.getCmp('this_month').checked == true){
			var dateto1 = today-1;
			date_day.setTime(date_day.getTime()-dateto1*oneday);
			date = date_day.getDate();
			month= date_day.getMonth() +1;
			year= date_day.getYear();
			day = date_day.getDay();
			var starttime = year.toString() + "-" + fillstring(month.toString()) + "-" +fillstring(date.toString());	
			date_day.setMonth(month);
			date_day.setTime(date_day.getTime()-oneday);
			date = date_day.getDate();
			month= date_day.getMonth() +1;
		    year= date_day.getYear();
			var endtime = year.toString() + "-" + fillstring(month.toString()) + "-" +fillstring(date.toString());
			new_start_time = (new Date((Date.parse((starttime+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((endtime+' '+end_time).replace(/-/g, "/")))).getTime()/1000);
		}else{
			var dateto1 = today-1;
			date_day.setTime(date_day.getTime()-dateto1*oneday);
			date = date_day.getDate();
			month= date_day.getMonth();
			year= date_day.getYear();
			day = date_day.getDay();				    
			var starttime = year.toString() + "-" + fillstring(month.toString()) + "-" +fillstring(date.toString());	
			date_day.setMonth(month);
			date_day.setTime(date_day.getTime()-oneday);
			date = date_day.getDate();
			month= date_day.getMonth()+1;
		    year= date_day.getYear();
			var endtime = year.toString() + "-" + fillstring(month.toString()) + "-" +fillstring(date.toString());
			new_start_time = (new Date((Date.parse((starttime+' '+start_time).replace(/-/g, "/")))).getTime()/1000);
			new_end_time = (new Date((Date.parse((endtime+' '+end_time).replace(/-/g, "/")))).getTime()/1000);
		}
		return new_start_time,new_end_time;
	}
     //Ext.QuickTips.init();
     //Ext.Msg.minWidth = 300;
	 var fields= ['target_name','visit_count','target_id'];
     
     var tbar2 = new Ext.Toolbar({
    	 renderTo: Ext.grid.GridPanel.tbar, 
    	 items:[{
			xtype: 'radiogroup',
			width: 300,
			//fieldLabel: 'Auto Layout',
			items: [
			    {boxLabel: '昨天', name: 'cb-auto-1',id:'yestoday'},
			    {boxLabel: '今天', name: 'cb-auto-1',id:'today', checked: true},
			    {boxLabel: '上周', name: 'cb-auto-1',id:'last_week'},
			    {boxLabel: '本周', name: 'cb-auto-1',id:'this_week'},
			    {boxLabel: '上月', name: 'cb-auto-1',id:'last_month'},
			    {boxLabel: '本月', name: 'cb-auto-1',id:'this_month'}
			] 
    	 },'-',{
			text:'查询',
			icon : Ext.zion.image_base + '/select.gif',
			handler:function(){
			//常规报表
				tbar_select=0;
				select_time();
				var alias;
				var check_target = getCheckedTarget().toString();
				if(check_target==""){
					params = [new_start_time,new_end_time];
					alias = 'm_sales.sales_manage.daily.report_manage.sales_visit.select';
				}else{
					params = [check_target,check_target,check_target,check_target,check_target,new_start_time,new_end_time];
					alias = 'm_sales.sales_manage.daily.report_manage.sales_visit.target_id.select';
				}
				grid.store.constructor({
					db : {
						params : params,
						alias : alias
					},
					root : "r",
					fields : fields
				});
				grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit,
						terminal_status:16
					}
				})
			}
		}]
     });
     
     var tbar3 = new Ext.Toolbar({
    	 renderTo: Ext.grid.GridPanel.tbar, 
    	 items:[{
				xtype:'label',
				text:'开始时间:'
			},{
				xtype:'datefield',
				id:'startDate',
				value: new Date(),
				format:'Y-m-d',
				width:100
			},{
				xtype:'timefield',
				id:'startTime',
				value:'00:00',
				width:60,
				format:'H:i'
			},'-',{
				xtype:'label',
				text:'结束时间:'
			},{
				xtype:'datefield',
				id:'endDate',
				value: new Date(),
				format:'Y-m-d',
				width:100
			},{
				xtype:'timefield',
				id:'endTime',
				value:'23:59',
				width:60,
				format:'H:i'
			},'-',{
				text:'查询',
				icon :   Ext.zion.image_base + '/select.gif',
				handler:function(){
				//自定义报表
					tbar_select=1;
					var alias;
					var params;
					var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':00';
					var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
					// s = "2010-05-23 20:00:00";
					var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
					var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
					var check_target = getCheckedTarget().toString();
					if(check_target==""){
						params = [std,end];
						alias = 'm_sales.sales_manage.daily.report_manage.sales_visit.select';
					}else{
						params = [check_target,check_target,check_target,check_target,check_target,std,end];
						alias = 'm_sales.sales_manage.daily.report_manage.sales_visit.target_id.select';
					}
					
					
					grid.store.constructor({
						db : {
							params : params,
							alias : alias
						},
						root : "r",
						fields : fields
					});
					grid.store.load({
						params : {
							start : 0,
							limit : Ext.zion.page.limit,
							terminal_status:16
						}
					})
				}
			}]
     });
    var time_start = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'00:00:00').replace(/-/g, "/")))).getTime()/1000);
	var time_end = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'23:59:59').replace(/-/g, "/")))).getTime()/1000);
	//var sm = new Ext.grid.CheckboxSelectionModel({});
 	var store = new Ext.zion.db.ArrayStore({
 		db:{
 			params:[time_start,time_end],
 			alias: "m_sales.sales_manage.daily.report_manage.sales_visit.select"
 		},
 		root: 'r',
 		fields:fields
 	});
 	
     var grid = new Ext.grid.GridPanel({
         //height: 350,
         //width: 800,
         store: store,
         autoScroll:true,
         enableColumnHide : false,
        // loadMask : {msg:'查询中...'},
         //frame: true,
         columns: [
             //sm,
             {header: '业务员名称',width: 80,sortable: true, dataIndex: 'target_name'}, 
             {header: '拜访次数',width: 80,sortable: true, dataIndex: 'visit_count'},
             {header: '操作',width: 80,sortable: true,renderer:function(target_id,c,record){
             	return '<a href="javascript:select_target('+ target_id + ');">详细信息 </a>';
             }}
         ],
         bbar: new Ext.PagingToolbar({
 			store: store,
 			pageSize: Ext.zion.page.limit,
 			displayInfo : true 
 		 }),

         tbar: [{
			 text : '常规报表',
			 handler : function(){
        	 	tbar3.hide();
        	 	tbar2.show();
         	 }
			 //iconCls:'addBtn'
		 }, {
			 xtype : "tbseparator"
		 }, {
			 text : "自定义报表",
			 handler : function(){
         	 	tbar2.hide();
         	 	tbar3.show();
          	 }
			 //iconCls : "deleteBtn"
		 }],
         //stripeRows: true,
         //autoExpandColumn: 5,
         listeners: {
             rowclick: function(trid, rowIndex, e){
                 //Ext.get('op').dom.value += '------------------------\n' +
                 //Ext.encode(store.getAt(rowIndex).data) +
                 //'\n';
             },
             render : function(){
            	 tbar2.render(this.tbar);
            	 tbar3.render(this.tbar);
            	 tbar3.hide();
             }
         }
     });
     
    // store.load({params:{start:0,limit:Ext.zion.page.limit}});

	//日期补0
	function fillstring(str){
		if(str.length==1){
			str = "0" + str;
		}
		return(str);
	}
	
	target_fields  = ['point_name','arrive_time','leave_time','interval','geocoding']
	target_store = new Ext.zion.db.ArrayStore({
 		db:{
 			params:[time_start,time_end],
 			alias: "m_sales.sales_manage.daily.report_manage.sales_visit.point.select"
 		},
 		root: 'r',
 		fields:target_fields
 	});
 	target_grid = new Ext.grid.GridPanel({
         //height: 350,
         //width: 800,
 		 title:'详细信息',
         store: target_store,
         autoScroll:true,
         enableColumnHide : false,
        // loadMask : {msg:'查询中...'},
         //frame: true,
         columns: [
             //sm,
             {header: '到访客户',width: 80,sortable: true, dataIndex: 'point_name'}, 
             {header: '到达时间',width: 80,sortable: true, dataIndex: 'arrive_time',renderer:timeStr},
             {header: '离开时间',width: 80,sortable: true, dataIndex: 'leave_time',renderer:timeStr},
             {header: '停留时间',width: 80,sortable: true, dataIndex: 'interval',renderer:interval_time},
             {header: '位置描述',width: 150,sortable: true, dataIndex: 'geocoding',renderer : function(geocoding) {
				if (geocoding == null) {
					return '';
				}
				return '<span style="display:table;width:100%;" qtip="'
						+ geocoding + '">' + geocoding + '</span>';
			 }}
         ],
         viewConfig:{
         	autoFill : true,
			forceFit : true
         },
         bbar: new Ext.PagingToolbar({
 			store: target_store,
 			pageSize: Ext.zion.page.limit,
 			displayInfo : true 
 		 })
 	});
	
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
					layout:'fit',
					items : [{layout : 'vbox',
						layoutConfig : {
							align : 'stretch',
							pack : 'start'
						},
						collapsible : true,
						split : true,
						width : 210,
						minSize : 100,
						maxSize : 250,
						items : [ {
							xtype : 'panel',
							layout : 'fit',
							flex : 1,
							items : [ grid ]
						}, {
							xtype : 'panel',
							layout : 'fit',
							flex : 1,
							items : [ target_grid ]
						} ]
					}]
				}]
			});
	function interval_time(n){
		var get_day;
		var get_hour;
		var get_min;
		var get_second;
		if(n/24/3600 <1){
			get_day = "";
		}else{
			get_day = Math.floor(n/24/3600)+'天';
		}
		
		if((n%(24*3600)/3600)<1){
			get_hour = ""
		}else{
			get_hour = Math.floor(n%(24*3600)/3600)+'小时';
		}
		if((n%3600)/60<1){
			get_min = ""
		}else{
			get_min = Math.floor((n%3600)/60)+'分';		
		}
		if(n%60 == 0){
			get_second = "";
		}else{
			get_second = n%60+'秒';
		}
		return get_day+get_hour+get_min+get_second;
	}
	
	Ext.zion.tree.loadTargetTree(function(tree) {
				targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				loadMask.hide();
			}, true);

});
function select_target(target_id){
	var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':00';
	var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
	// s = "2010-05-23 20:00:00";
	var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
	var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
	if(tbar_select==0){
		select_time();
		params = [target_id,new_start_time,new_end_time];
	}else{
		params = [target_id,std,end];
	}
	target_grid.store.constructor({
		db : {
			params : params,
			alias : 'm_sales.sales_manage.daily.report_manage.sales_visit.point.target_id.select'
		},
		root : "r",
		fields : target_fields
	});
	target_grid.store.load({
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	})

}