	Ext.onReady(function(){
		Ext.QuickTips.init();
		 //Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
        
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
		fields= ['track_id','recv_time','target_id','target_name','latitude','longitude','event','terminal_status','event_desc','event_photo','geocoding','event_name'];
         function qtips(val){
        	 if(val == null){
        		 return '';
        	 }
        	 //<img src="upload/patrol/photo/' + val + '.jpg">
             return '<span style="display:table;width:100%;" qtip=\'<img src="upload/patrol/photo/'+val+'.jpg">\'>' + val + '.jpg</span>'
         }
         
         function tips(val){
             //if (typeof val == 'object') {
                // return '<span style="display:table;width:100%;" title="' + val.tips + '">' + val.text + '</span>'
             //}
            // return val
        	 if(val == null){
        		 return '';
        	 }
        	return '<span style="display:table;width:100%;" title="' + val + '">' + val + '</span>';
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
				icon : '../images/search.png',
				handler:function(){
				//常规报表
					
					select_time();
    				var params = [new_start_time,new_end_time];
    				grid.store.constructor({
						db : {
							params : params,
							alias : 'axiom_track_patrol.recv_time.select'
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
				 	var params=[new_start_time,new_end_time]
				 	Ext.Msg
						.alert(
								"下载文件",
								"<a href='"
										+ Zion.report
												.getURL('axiom_track_patrol.recv_time.select',params)
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
					icon : '../images/search.png',
					handler:function(){
					//自定义报表
					var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':59';
					var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
					// s = "2010-05-23 20:00:00";
					var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
					var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
					var params= [std,end];
					grid.store.constructor({
						db : {
							params : params,
							alias : 'axiom_track_patrol.recv_time.select'
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
					var params_customize=[std,end];
					Ext.Msg
						.alert(
								"下载文件",
								"<a href='"
										+ Zion.report
												.getURL('axiom_track_patrol.recv_time.select',params_customize)
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
     			alias: "axiom_track_patrol.select"
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
                 {header: '事件编号',width: 80,sortable: true, dataIndex: 'track_id'}, 
                 { header: "图片",width: 50, sortable: true,renderer: function(event_photo){
                	 if(!event_photo){
                		 return "";
                	 }else{
                		 return "<a href=# onclick='show_win("+event_photo+")'>"+event_photo+".jpg</a>";
                	 }
                 }, dataIndex: 'event_photo'}, 
                 {header: "上报时间", width: 160, sortable: true,renderer: timeStr, dataIndex: 'recv_time'}, 
               //  {header: "车辆序号", width: 60, sortable: true, dataIndex: 'target_id'}, 
                 {header: "发送人员", width: 70, sortable: true, dataIndex: 'target_name'}, 
                 {header: "纬度",width: 80, sortable: true, dataIndex: 'latitude' },
              // {header: "图标", width: 75, sortable: true, renderer: icon,dataIndex: 'icon'},
                 {header: "经度",width: 70,sortable: true, dataIndex: 'longitude'}, 
                 { header: "事件类型",width: 75, sortable: true, dataIndex: 'event_name'}, 
                 //{ header: "类型说明",width: 75, sortable: true, dataIndex: 'tips'}, 
               //  { header: "查看状态",width: 75, sortable: true, dataIndex: 'terminal_status'}, 
                 //{ header: "查看人",width: 75, sortable: true, dataIndex: 'tips'}, 
                 //{ header: "查看时间",width: 75, sortable: true, dataIndex: 'tips'}, 
                 //{ header: "处理人",width: 75, sortable: true, dataIndex: 'tips'}, 
                 //{ header: "处理时间",width: 75, sortable: true, dataIndex: 'tips'}, 
                 { header: "事件说明",width: 220, sortable: true, dataIndex: 'event_desc',renderer: tips}, 
                 //{ header: "处理意见",width: 75, sortable: true, dataIndex: 'tips'}, 
                 { header: "位置描述",width: 360, sortable: true, dataIndex: 'geocoding',renderer: tips}
     			
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
         
         store.load({params:{start:0,limit:Ext.zion.page.limit,terminal_status:16}});
     	
        
         show_win = function(event_photo){
        	 var panel = new Ext.Panel({
        		 height:200,
            	 width:200,
            	 html:'<span><img width=300 height=300 src="upload/patrol/photo/'+event_photo+'.jpg"/></span>'
        	 })
        	 var new_win = new Ext.Window({
        		 xtype:'window',
        		 title: '图片',
        		 autoWidth:true,
        		 autoHeight:true,
        		 html:'<span style="display:table;width:100%;"><img src="upload/patrol/photo/'+event_photo+'.jpg"/></span>'
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

		// grid自适应
		new Ext.Viewport({  
			layout:'border',  
			border:false,  
			
			items:[ {  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  
		});	 
		//日期补0
		function fillstring(str){
			if(str.length==1){
				str = "0" + str;
			}
			return(str);
		}
	})