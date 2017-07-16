function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 50;
	var selectCorpId;	
	var fields= ['temperature','ad1','ad2','ad3','voltage','gps_time','recv_time'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "collection_last_track.select"
		},
		root : "r",
		fields : fields
	});
	
	var target_name_store = new Ext.data.SimpleStore({
			root : 'r',
			fields : ['target_id', 'target_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/collection_target_name.select/['+selectCorpId+']'
			})
		});

	var panel_center= new Ext.Panel({
		layout:'form',
		frame:true,
		autoScroll:true,
		autoHeight:false,
		items: {
            xtype: 'columnchart',
            store: store,
            url:'/api/ext/resources/charts.swf',
            xField: 'gps_time',
            yAxis: new Ext.chart.NumericAxis({
                displayName: 'ad1'//,
               // labelRenderer : Ext.util.Format.numberRenderer('0.0,0.0')
            }),
            tipRenderer : function(chart, record, index, series){
                if(series.yField == 'ad1'){
					if(times_combo.getValue() == 1){
						return "保护电位:"+record.data.ad1+",上传时间:"+record.data.recv_time;
					}else{		
						return "保护电位:"+Math.round((record.data.ad1)*100)/100+",采集时间:"+record.data.gps_time;
                    }
                }
            },
            chartStyle: {
                padding: 10,
                animationEnabled: true,
                font: {
                    name: 'Tahoma',
                    color: 0x444444,
                    size: 11
                },
                dataTip: {
                    padding: 5,
                    border: {
                        color: 0x99bbe8,
                        size:1
                    },
                    background: {
                        color: 0xDAE7F6,
                        alpha: .9
                    },
                    font: {
                        name: 'Tahoma',
                        color: 0x15428B,
                        size: 10,
                        bold: true
                    }
                },
                xAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xeeeeee}
                },
                yAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xdfe8f6}
                }
            },
            series: [{
                type: 'line',
                displayName: 'Page Views',
                yField: 'ad1',
                style: {
                   // image:'bar.gif',
                   //mode: 'stretch',
                    color:0x99BBE8
                }
            },{
                type:'line',
                displayName: 'Visits',
                yField: 'gps_time',
                style: {
                    color: 0x15428B
                }
            }]
        },
		bbar : new Ext.PagingToolbar({
			store : store,
			pageSize : limit,
			displayInfo : true
		})
    });

	var target_name_combo = new Ext.form.ComboBox({
		width:170,
		hiddenName : 'target_id',
		valueField : 'target_id',
		store : target_name_store,
		triggerAction : 'all',
		displayField : 'target_name',
		mode : 'local',
		editable : false,
		emptyText:'请选择...'
	});

	var times_combo = new Ext.form.ComboBox({
		width:100,
		hiddenName : 'time_id',
		valueField : 'time_id',
		store : new Ext.data.SimpleStore({
			fields : ['time_id', 'time_value'],
			data:[[1,'上传时间'],[2,'采集时间']]
		}),
		triggerAction : 'all',
		displayField : 'time_value',
		mode : 'local',
		editable : false,
		value:2,
		hidden:true
	});

	var panel = new Ext.Panel({
		autoWidth:true,
		height:200,
		tbar : [
			'名称：',
			target_name_combo,times_combo,'开始时间：',{
				name:'start_date',
				id:'start_date',
				xtype:'datefield',
				width : 100,
				editable:false,
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				value:new Date,
				maxValue:new Date,
				emptyText : '开始时间'
			},'结束时间：',{
				name:'end_date',
				id:'end_date',
				xtype:'datefield',
				editable:false,
				width : 100,
				value:new Date(),
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				emptyText : '结束时间'
			},{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					search_history();
				}
			}
		],
		items:[panel_center]
	});
	
	var time_collection_store = new Ext.data.SimpleStore( {
		proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/collection_all_track.select/['+selectCorpId+']'
			}),
		root : "r",
		fields : ["target_name","target_id",'temperature','ad1','ad2','ad3','voltage','gps_time','recv_time']
	});

	var time_collection_curve= new Ext.Panel({
		layout:'form',
		frame:true,
		autoScroll:true,
		autoHeight:false,
		items: {
            xtype: 'columnchart',
            store: time_collection_store,
            url:'/api/ext/resources/charts.swf',
            xField: 'target_name',
            yAxis: new Ext.chart.NumericAxis({
                displayName: 'ad1'//,
               // labelRenderer : Ext.util.Format.numberRenderer('0.0,0.0')
            }),
            tipRenderer : function(chart, record, index, series){
                if(series.yField == 'ad1'){
					if(times_combo.getValue() == 1){
						return "保护电位:"+record.data.ad1;
					}else{		
						return "保护电位:"+Math.round((record.data.ad1)*100)/100;
                    }
                }
            },
            chartStyle: {
                padding: 10,
                animationEnabled: true,
                font: {
                    name: 'Tahoma',
                    color: 0x444444,
                    size: 11
                },
                dataTip: {
                    padding: 5,
                    border: {
                        color: 0x99bbe8,
                        size:1
                    },
                    background: {
                        color: 0xDAE7F6,
                        alpha: .9
                    },
                    font: {
                        name: 'Tahoma',
                        color: 0x15428B,
                        size: 10,
                        bold: true
                    }
                },
                xAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xeeeeee}
                },
                yAxis: {
                    color: 0x69aBc8,
                    majorTicks: {color: 0x69aBc8, length: 4},
                    minorTicks: {color: 0x69aBc8, length: 2},
                    majorGridLines: {size: 1, color: 0xdfe8f6}
                }
            },
            series: [{
                type: 'line',
                displayName: 'Page Views',
                yField: 'ad1',
                style: {
                   // image:'bar.gif',
                   //mode: 'stretch',
                    color:0x99BBE8
                }
            },{
                type:'line',
                displayName: 'Visits',
                xField: 'target_name',
                style: {
                    color: 0x15428B
                }
            }]
        }
    });

	var time_panel = new Ext.Panel({
		autoWidth:true,
		tbar : ['时间：',{
				editable : false,
				id : 'time_d',
				width : 100,
				format : 'Y-m-d',
				xtype : 'datefield',
				value : new Date()
			}, {
				xtype : 'timefield',
				allowBlank : false,
				editable : false,
				format : 'H:i',
				id : 'time_h',
				width : 75,
				increment : 60,
				value : '09:00'
			} ,{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					show_all_time_collection_curve(selectCorpId);
				}
			}
		],
		items:[time_collection_curve]
	});
	
	var view_panel = new Ext.TabPanel ({
		activeItem : 0,
		enableTabScroll : true,
		autoScroll : true,
		items:[ {
			title:'阴保历史',
			layout:'fit',
			items :[panel]
		},{
			title:'阴保时间点',
			layout:'fit',
			items : [time_panel]
		}]  
	});
	function utc_to_timestamp(val){	
		var text_time = val.replace(/:/g, '-');
		time_str = text_time.replace(/ /g, '-');
		var time_arr = time_str.split("-");
		var time_datum = new Date(Date.UTC(time_arr[0],
				time_arr[1] - 1, time_arr[2], time_arr[3] - 8,
				time_arr[4], time_arr[5]));
		var new_time = time_datum.getTime() / 1000;
		return new_time;
	}

	function search_history(){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
		var target_name = target_name_combo.getValue();
		if(target_name == ""){
			Ext.Msg.alert('提示','名称不能为空');
			loadMask.hide();
			return;
		}
		var start_date = Ext.util.Format.date(Ext.getCmp("start_date").getValue(), 'Y-m-d H:i:s');
		var end_date = Ext.util.Format.date(Ext.getCmp("end_date").getValue(), 'Y-m-d H:i:s');
		var new_start_date = utc_to_timestamp(start_date);
		var new_end_date = utc_to_timestamp(end_date)+23*3600+3599;
		var start_date_value;
		var end_date_value;
		var target_name_value;
		if(start_date){
			start_date_value=0;
		}else{
			start_date_value=1	
		}
		if(end_date){
			end_date_value=0;
		}else{
			end_date_value=1	
		}
			
		if(target_name){
			target_name_value=0;
		}else{
			target_name_value=1;
		}
		var params = [selectCorpId,target_name,target_name_value,new_start_date,start_date_value,new_end_date,end_date_value];
		if(Math.ceil((new_end_date-new_start_date)/(3600*24))>30){
			Ext.Msg.confirm("提示","查询天数大于30天将按天平均计算，是否继续？", function(btn) {
				if(btn == 'yes'){
					store.constructor({
						db : {
							params : params,
							alias : 'collection_target_history.search_by_day.asc'
						},
						root : "r",
						fields : fields
					});
					store.load({
						params : {
							start : 0,
							limit : limit
						}
					});
				}
			});
		}else{
			if(times_combo.getValue() == 1){	
				store.constructor({
					db : {
						params : params,
						alias : 'collection_target_history.search.asc'
					},
					root : "r",
					fields : fields
				});
			}else{
				store.constructor({
					db : {
						params : params,
						alias : 'collection_target_history.search.by_gps_time.asc'
					},
					root : "r",
					fields : fields
				});
			}
			store.load({
				params : {
					start : 0,
					limit : limit
				}
			});
			store.on('load',function(){
				loadMask.hide();
			})
		}
		//if(!grid.getBottomToolbar().cursor){
			
		/*}else{
			grid.store.load({
				params : {
					start : grid.getBottomToolbar().cursor,
					limit : limit
				}
			});
		}*/
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
				load_data(selectCorpId);
				show_all_time_collection_curve(selectCorpId);
				store.removeAll();
				target_name_combo.setValue("");
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		load_data(selectCorpId);
	});
	
	function show_all_time_collection_curve(selectCorpId){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
		var time_d = Ext.util.Format.date(Ext.getCmp("time_d").getValue(), 'Y-m-d')+ ' ' + Ext.getCmp('time_h').getValue() + ':00';
		var time = new Date(Date.parse(time_d.replace(/-/g, "/")));
		var time_ = time.getTime() / 1000;
		time_collection_store.constructor( {
			proxy : new Ext.data.ScriptTagProxy({
					url : ZionSetting.db.url + '/' + Zion.token
							+ '/collection_all_track.select/['+selectCorpId+','+time_+','+selectCorpId+']'
				}),
			root : "r",
			fields : ["target_name","target_id",'temperature','ad1','ad2','ad3','voltage','gps_time','recv_time']
		});
		time_collection_store.on('load',function(){
			loadMask.hide();
		});
		time_collection_store.load();
	}
	function load_data(selectCorpId){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
		target_name_store.constructor({
			root : 'r',
			fields : ['target_id', 'target_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/collection_target_name.select/['+selectCorpId+']'
			})
		});
		target_name_store.on('load',function(){
			loadMask.hide();
		});
		target_name_store.load();
	}
		
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
			region : 'center',
			split : true,
			items : [view_panel]
		}]  
	});
});