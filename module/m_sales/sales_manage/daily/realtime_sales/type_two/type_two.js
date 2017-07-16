	Ext.onReady(function(){
		Ext.QuickTips.init();
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		
        function timeStr(n) {
       	 return new Date(n * 1000).toLocaleString();
        }
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
				icon : Ext.zion.image_base+'/select.gif',
				handler:function(){
				//常规报表
					
					select_time();
    				var params = [new_start_time,new_end_time];
    				type_one_search(params);
    				/*grid.store.constructor({
						db : {
							params : params,
							alias : 'sales_goods_record.type_two.select'
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
					})*/
				}
			},'-',{
			 	 text : "下载报表",
			 	 icon : Ext.zion.image_base+'/report_link.png',
				 handler : function(){
				 	select_time();
				 	var params=[new_start_time,new_end_time]
				 	Ext.Msg
						.alert(
								"下载文件",
								"<a href='"
										+ Zion.report
												.getURL('sales_goods_record.type_two.select',params)
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
					icon : Ext.zion.image_base+'/select.gif',
					handler:function(){
					//自定义报表
					var s = Ext.getCmp('startDate').getRawValue() + ' ' + Ext.getCmp('startTime').getValue() + ':59';
					var std = (new Date(Date.parse(s.replace(/-/g, "/")))).getTime()/1000;
					// s = "2010-05-23 20:00:00";
					var e = Ext.getCmp('endDate').getRawValue() + ' ' + Ext.getCmp('endTime').getValue() + ':59';
					var end = (new Date(Date.parse(e.replace(/-/g, "/")))).getTime()/1000;
					var params= [std,end];
					type_one_search(params);
					/*grid.store.constructor({
						db : {
							params : params,
							alias : 'sales_goods_record.type_two.select'
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
					})*/
					}
				},'-',{
			 	 text : "下载报表",
			 	 icon : Ext.zion.image_base+'/report_link.png',
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
												.getURL('sales_goods_record.type_two.select',params_customize)
										+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载文件</a>");
	          	 }
			 }]
         });

        var time_start = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'00:00:00').replace(/-/g, "/")))).getTime()/1000);
		var time_end = (new Date((Date.parse(((new Date().getFullYear()+'-'+(new Date().getMonth()+1)+'-'+new Date().getDate())+' '+'23:59:59').replace(/-/g, "/")))).getTime()/1000);
		
		var fields= ['goods_id','goods_sn','goods_name','goods_type','recv_time','goods_quantity','goods_saleroom'];
     	var store = new Ext.data.ArrayStore({
     		/*db:{
     			params:[time_start,time_end],
     			alias: "sales_goods_record.type_two.select"
     		},*/
     		root: 'r',
     		fields:fields
     	});
     	
         var grid = new Ext.grid.GridPanel({
             //height: 350,
             //width: 800,
        	 flex : 4,
             store: store,
             autoScroll:true,
             enableColumnHide : false,
             loadMask : {msg:'查询中...'},
             //frame: true,
             columns: [
                  new Ext.grid.RowNumberer({header:'序号',width:35}),
                 //{header: '序号',width: 40,sortable: true, dataIndex: 'goods_id'}, 
                 {header: '商品编号',width: 80,sortable: true, dataIndex: 'goods_sn'}, 
                 {header: '商品名称',width: 80,sortable: true, dataIndex: 'goods_name'}, 
                 {header: '商品类别',width: 80,sortable: true, dataIndex: 'goods_type'}, 
                 {header: "日期", width: 160, sortable: true,dataIndex: 'recv_time'}, 
                 {header: "销售数量", width: 70, sortable: true, dataIndex: 'goods_quantity'}, 
                 {header: "销售额",width: 80, sortable: true, dataIndex: 'goods_saleroom' , renderer: function(val){return "￥"+val;}}
             ],
             /*bbar: new Ext.PagingToolbar({
     			store: store,
     			pageSize: Ext.zion.page.limit,
     			displayInfo : true 
     		 }),*/
     		viewConfig : {
 				autoFill : true,
 				forceFit : true
 			},
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
        
        //store.load({params:{start:0,limit:Ext.zion.page.limit}});
     	
		var store_total = new Ext.data.ArrayStore({
	        fields: ['goods_id','goods_sn','goods_name','goods_type','recv_time','goods_quantity','goods_saleroom']
	    });
		
 		var grid_total = new Ext.grid.GridPanel({
			height : 70,
			store : store_total,
			columns : [
			     {header: '总计',width: 80,sortable: true, dataIndex: 'goods_id'}, 
                 {header: '',width: 80,sortable: true, dataIndex: 'goods_sn'}, 
                 {header: '',width: 80,sortable: true, dataIndex: 'goods_name'}, 
                 {header: '',width: 80,sortable: true, dataIndex: 'goods_type'}, 
                 //{header: '销售员',width: 80,sortable: true, dataIndex: 'user_name'}, 
                 {header: '', width: 160, sortable: true,dataIndex: 'recv_time'}, 
                 {header: "销售数量", width: 70, sortable: true, dataIndex: 'goods_quantity'}, 
                 {header: "销售额",width: 80, sortable: true, dataIndex: 'goods_saleroom'}
			],
			bbar : [],
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		});
 		
		// grid自适应
		new Ext.Viewport({  
			layout:'border',  
			border:false,  
			
			items:[ {  
				region:'center',  
				split : true,
				layout:'vbox',
				layoutConfig: {
				    align : 'stretch',
				    pack  : 'start'
				},
				items:[grid,grid_total]  
			}]  
		});	 
		//日期补0
		function fillstring(str){
			if(str.length==1){
				str = "0" + str;
			}
			return(str);
		}
		
		function type_one_search(params_list){
			loadMask.show();
			Zion.db.getJSON("sales_goods_record.type_two.select", params_list, function(data) {
				if(data.r){
					store.loadData(data);
					var result = data.r;
					var goods_quantity = 0;
					var goods_saleroom = 0;
					for(var i = 0;i < result.length;i++){
						goods_quantity += result[i][5];
						goods_saleroom += result[i][6];
					}
					store_total.loadData( [['', '', '', '', '', goods_quantity, '￥'+goods_saleroom] ]);
					loadMask.hide();
				}else{
					Ext.msg.alert('提示','未查到数据!');
				}
			});
		}
		type_one_search([time_start,time_end]);
	})