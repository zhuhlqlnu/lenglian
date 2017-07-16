Ext.onReady(function(){
	Ext.QuickTips.init();
	 //Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	var selectCorpId;
	var new_start_time;
	var new_end_time;
	/**常规报表时间**/
	function select_time(){
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
	fields= ['id','recv_time','gps_time','longitude','latitude','name','login_name','memo','status','pdt_id'];
	
	function qtips(val){
		 if(val == null){
			 return '';
		 }
		 return '<span style="display:table;width:100%;" qtip=\'<img src="upload/patrol/photo/'+val+'.jpg">\'>' + val + '.jpg</span>'
	}
	 
	function timeStr(n) {
		return new Date(n * 1000).toLocaleString();
	}
	 
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
				select_time();
				var params = [selectCorpId,selectCorpId,selectCorpId,new_start_time,new_end_time];
				grid.store.constructor({
					db : {
						params : params,
						alias : 'pipe.statistics.defect_report.select'
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
		},'-',{
			 text : "下载报表",
			 handler : function(){
				select_time();
				var params=[selectCorpId,selectCorpId,selectCorpId,new_start_time,new_end_time]
				Ext.Msg
					.alert(
							"下载文件",
							"<a href='"
									+ Zion.report
											.getURL('pipe.statistics.defect_report.select',params)
									+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载文件</a>");
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
				var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':00';
				var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
				// s = "2010-05-23 20:00:00";
				var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
				var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
				var params= [selectCorpId,selectCorpId,selectCorpId,std,end];
				grid.store.constructor({
					db : {
						params : params,
						alias : 'pipe.statistics.defect_report.select'
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
			},'-',{
			 text : "下载报表",
			 handler : function(){
				var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':59';
				var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
				// s = "2010-05-23 20:00:00";
				var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
				var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
				var params_customize=[selectCorpId,selectCorpId,selectCorpId,std,end];
				Ext.Msg
					.alert(
							"下载文件",
							"<a href='"
									+ Zion.report
											.getURL('pipe.statistics.defect_report.select',params_customize)
									+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载文件</a>");
			 }
		 }]
	 });

	var time_start = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'00:00:00').replace(/-/g, "/")))).getTime()/1000);
	var time_end = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'23:59:59').replace(/-/g, "/")))).getTime()/1000);
	//var sm = new Ext.grid.CheckboxSelectionModel({});
	var store = new Ext.zion.db.ArrayStore({
		db:{
			params:[time_start,time_end],
			alias: "pipe.statistics.defect_report.select"
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
		 loadMask : {msg:'查询中...'},
		 //frame: true,
		 columns: [
			 //sm,
			 {header: '缺陷编号',width: 80,sortable: true, dataIndex: 'id'}, 
			 { header: "图片",width: 50, sortable: true,dataIndex: 'id',renderer: function(v,c,r){
				 var id = r.data["id"];
				 if(!id){
					 return "";
				 }else{
					 return "<a href=# onclick='show_win("+id+",false)'>"+id+".jpg</a>";
				 }
			 }, dataIndex: 'event_photo'}, 
			 {header: "上报时间", width: 160, sortable: true,renderer: timeStr, dataIndex: 'recv_time'}, 
			 {header: "发送人员", width: 70, sortable: true, dataIndex: 'login_name'}, 
			 {header: "纬度",width: 80, sortable: true, dataIndex: 'latitude' },
			 {header: "经度",width: 70,sortable: true, dataIndex: 'longitude'},
			 { 
				header: "查看地图",width: 100, sortable: true, dataIndex: 'pdt_id',renderer: function(v,c,r){
					var latitude = r.data["latitude"];
					var longitude = r.data["longitude"];
					var pdt_id = r.data["pdt_id"];
					return "<a href='#' onclick='return show_map("+latitude+","+longitude+","+pdt_id+")'>查看</a>";
				 }
				
			 },
			 { header: "缺陷类型",width: 75, sortable: true, dataIndex: 'name'}, 
			 { header: "处理状态",width: 75, sortable: true, dataIndex: 'status',renderer:function(v,c,r){
				var status = r.data["status"];
				var id = r.data["id"];
				if(status == 1){ 
					return "未处理"
				}else if(status == 2){
					return '<a href=# onclick="show_process('+id+')">处理中</a>';
				}else if(status == 3){
					return '<a href=# onclick="show_process('+id+')">已处理</a>';
				}else{
					return '';
				}}
			 }, 
			 { header: "缺陷说明",width: 220, sortable: true, dataIndex: 'memo',renderer: function(memo){
				if(memo == null){
					return '';
				}
				return '<span style="display:table;width:100%;" title="' + memo + '">' + memo + '</span>';
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
				store.removeAll();
				tbar3.hide();
				tbar2.show();
			 }
			 //iconCls:'addBtn'
		 }, {
			 xtype : "tbseparator"
		 }, {
			 text : "自定义报表",
			 handler : function(){
				store.removeAll();
				tbar2.hide();
				tbar3.show();
			 }
			 //iconCls : "deleteBtn"
		 }],
		 listeners: {
			 render : function(){
				 tbar2.render(this.tbar);
				 tbar3.render(this.tbar);
				 tbar3.hide();
			 }
		 }
	 });
	
	 function show_map(latitude,longitude,pdt_id){
		var map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
		map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
		var mapwin = new Ext.Window({
			layout : 'fit',
			closeAction : 'hide',
		//	closable : true,
			width : 640,
			autoHeight:false,
			height : 480,
			items : {
				layout : 'fit',
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
			}
		});
		map.clearOverlays();
		mapwin.show();
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(26, 26);
		targetIcon.iconAnchor = new GPoint(13, 13);
		targetIcon.image = "/api/image/defect/"+pdt_id+".png";
		var markerOptions = {
			icon : targetIcon,
			clickable : false
		}
		var point = new GLatLng(latitude,longitude);
		marker = new GMarker(point, markerOptions);
		map.setCenter(point , 13);
		map.addOverlay(marker);
		setDefaultMapUI(map);
	 }
	
	window.show_map = show_map;
//         store.load({params:{start:0,limit:Ext.zion.page.limit,terminal_status:16}});
	show_process = function(id) {
		var process_store = new Ext.data.SimpleStore( {
			root : 'r',
			fields : ['id', 'type', 'reg_date', 'memo', 'defect_id','user_name', 'reg_user_id', 'way','corp_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/pipe.management.data.pipe_defect_process.select/['+id+']'
			})
		});
		
		var process_grid = new Ext.grid.GridPanel({
			height:350,
			width:550,
			layout:'fit',
			store : process_store,
			autoScroll : true,
			enableColumnHide : false,
			loadMask : {
				msg : '查询中...'
			},
			// frame: true,
			columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
			{
				header : "类型",
				width : 75,
				sortable : true,
				dataIndex : 'type',
				renderer:function(type){
					if(type==1){
						return "已处理";
					}else if(type == 2){
						return "转发";
					}else if(type == 3){
						return "生成任务";
					}else if(type == 4){
						return "误报";
					}else if(type == 5){
						return "进程";
					}else{
						return "";
					}
				}
			},{
				header : "图片",
				width : 50,
				sortable : true,
				dataIndex : 'id',
				renderer : function(v, c, r) {
					var id = r.data["id"];
					var way = r.data["way"];
					var type = r.data["type"];
					if (way == 1) {
						return "";
					} else {
						return "<a href=# onclick='show_win("
								+ id + ",true)'>" + id + ".jpg</a>";
					}
				},
				dataIndex : 'event_photo'
			}, {
				header : "处理时间",
				width : 160,
				sortable : true,
				dataIndex : 'reg_date'
			}, {
				header : "处理人员",
				width : 90,
				sortable : true,
				dataIndex : 'user_name'
			}, {
				header : "处理说明",
				width : 400,
				sortable : true,
				dataIndex : 'memo',
				renderer : function(val,c,r){
					var type = r.data["type"];
					var corp_name = r.data["corp_name"];
					if(val == null){
						return '';
					}
					if(type == 2){
						return "由"+corp_name+"转发";
					}else{
						return '<span style="display:table;width:100%;" title="' + val + '">' + val + '</span>';
					}
				}
			}]
		});
		process_store.load();
		
		var process_win = new Ext.Window({
			 title: '处理过程',
			height:350,
			width:550,
			 buttonAlign : 'center',
			 closable:true,
			 constrainHeader:true,  
			 items:[process_grid],
			 buttons : [ {
				text : '关闭',
				handler : function() {
					process_win.close();
				}
			}]
		});
		process_win.show();
	}
	
	function show_win(id,is_process){
		var path;
		if(is_process){
			path = '<span><img src="/uploaded/visitator/defect_process/'+id+'.jpg"/></span>';
		}else{
			path = '<span><img src="/uploaded/visitator/defect/'+id+'.jpg"/></span>';
		}
		var panel = new Ext.Panel({
			 height:200,
			 width:200,
			 html:path
		 })
		 var new_win = new Ext.Window({
			 xtype:'window',
			 title: '图片',
			 autoWidth:true,
			 autoHeight:true,
			 html:'<span style="display:table;width:100%;">'+path+'</span>'
		 })
		 var win  = new Ext.Window({
			 xtype:'window',
			 id:'window',
			 title: '图片',
			 height:350,
			 width:300,
			 buttonAlign : 'center',
			 closable:true,
			 constrainHeader:true,  
			 layout:'fit',
			/* html:'<span><img width=200 height=200 src="images/11.jpg"/></span>'+
				 '<div><div align="center"><input type="button" value="点击查看原图" onclick="show_original(win)"></div></div>'*/
			 items:[panel],
			 buttons : [ {
				id : 'select',
				text : '点击查看原图',
				handler : function() {
					Ext.getCmp('window').close();
					new_win.show();
				}
			}]
		 })
		 
		 win.show();
	 }
	 
	 var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				if(new_start_time !=undefined ){
					time_start = new_start_time;
					time_end = new_end_time;
				}
				store.constructor( {
					db:{
						params:[selectCorpId,selectCorpId,selectCorpId,time_start,time_end],
						alias: "pipe.statistics.defect_report.select"
					},
					root: 'r',
					fields:fields
				});
				store.load({params:{start:0,limit:Ext.zion.page.limit,terminal_status:16}});
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		
		store.constructor( {
			db:{
				params:[selectCorpId,selectCorpId,selectCorpId,time_start,time_end],
				alias: "pipe.statistics.defect_report.select"
			},
			root: 'r',
			fields:fields
		});
		store.load({params:{start:0,limit:Ext.zion.page.limit,terminal_status:16}});
	});

	// grid自适应
	new Ext.Viewport({  
		layout:'border',  
		border:false,  
		
		items:[ {
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			layout:'fit',
			title:'缺陷列表',
			region : 'center',
			split : true,
			items : [grid]
		}]  
	});	 
	
	//日期补0
	function fillstring(str){
		if(str.length==1){
			str = "0" + str;
		}
		return(str);
	}

	window.show_win = show_win;
})