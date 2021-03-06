function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
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
		value:1
	});

	var comparison_combo = new Ext.form.ComboBox({
		width:50,
		hiddenName : 'comparison_id',
		valueField : 'comparison_id',
		store : new Ext.data.SimpleStore({
			fields : ['comparison_id', 'comparison_value'],
			data:[[1,'大于'],[2,'小于']]
		}),
		triggerAction : 'all',
		displayField : 'comparison_value',
		mode : 'local',
		editable : false,
		value:1,
		listeners :{
			select:function(this_){
				
				if(this_.getValue()==2){
					Ext.getCmp("comparison_ad1").reset();
					Ext.getCmp("comparison_ad1").emptyText = "1.25";
				}else{
					Ext.getCmp("comparison_ad1").reset();
					Ext.getCmp("comparison_ad1").emptyText = "0.85";
				}
			}
		}
	});

	var grid = new Ext.grid.GridPanel({
		store : store,
		autoScroll : true,
		columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
		{
			header : "采集时间",
			dataIndex :'gps_time',
			width : 75,
			sortable : true
		},{
			header : "上传时间",
			dataIndex : 'recv_time',
			width : 75,
			sortable : true
		},{
			header : "温度(度)",
			dataIndex : 'temperature',
			width : 75,
			sortable : true
		},{
			header : "保护电位",
			dataIndex : 'ad1',
			width : 75,
			sortable : true
		},{
			header : "交流干扰电压",
			dataIndex : 'ad2',
			width : 75,
			sortable : true,
			renderer:function(ad2){
				return "";
			}
		},/*{
			header : "AD_3",
			dataIndex : 'ad3',
			width : 45,
			sortable : true
		},*/{
			header : "电池电压(伏)",
			dataIndex : 'voltage',
			width : 90,
			sortable : true
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
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
			},'保护电位',comparison_combo,{
				name:'comparison_ad1',
				width : 60,
				id:'comparison_ad1',
				xtype:'numberfield',
				emptyText:'1.25',
				listeners:{
					blur:function(this_){
						if(comparison_combo.getValue() == 1){
							this_.emptyText = "1.25";
						}else{
							this_.emptyText = '0.85';
						}
					}
				}
			},{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					search_history();
				}
			}
		],
		bbar : new Ext.PagingToolbar({
			store : store,
			pageSize : limit,
			displayInfo : true
		}),
		listeners : {
			sortchange:function(this_,store){
				var loadMask = new Ext.LoadMask(Ext.getBody(), {
					msg : "加载中,请稍后 ..."
				});
				loadMask.show();
				limit_sort = store.direction;
				if(limit_sort == "ASC"){
					var target_name = target_name_combo.getValue();
					var comparison_ad1 = Ext.getCmp("comparison_ad1").getValue();
					if(target_name == ""){
						Ext.Msg.alert('提示','名称不能为空');
						loadMask.hide();
						return;
					}
					if(comparison_ad1 == ""){
						if(comparison_combo.getValue() == 1){
							comparison_ad1 = "1.25";
						}else{
							comparison_ad1 = "0.85";
						}
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
					
					var params = [selectCorpId,target_name,target_name_value,new_start_date,start_date_value,new_end_date,end_date_value,comparison_ad1];
					if(comparison_combo.getValue() == 1){
						if(times_combo.getValue() == 1){	
							grid.store.constructor({
								db : {
									params : params,
									alias : 'collection_target_error.search.than.asc'
								},
								root : "r",
								fields : fields
							});
						}else{
							grid.store.constructor({
								db : {
									params : params,
									alias : 'collection_target_error.search.by_gps_time.than.asc'
								},
								root : "r",
								fields : fields
							});
						}
					}else{
						if(times_combo.getValue() == 1){	
							grid.store.constructor({
								db : {
									params : params,
									alias : 'collection_target_error.search.less.asc'
								},
								root : "r",
								fields : fields
							});
						}else{
							grid.store.constructor({
								db : {
									params : params,
									alias : 'collection_target_error.search.by_gps_time.less.asc'
								},
								root : "r",
								fields : fields
							});
						}
					}
					grid.store.load({
						params : {
							start : 0,//grid.getBottomToolbar().cursor,
							limit : limit
						}
					});
					loadMask.hide();
				}else{
					search_history();
				}
			}
		}
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
		var comparison_ad1 = Ext.getCmp("comparison_ad1").getValue();
		if(target_name == ""){
			Ext.Msg.alert('提示','名称不能为空');
			loadMask.hide();
			return;
		}

		if(comparison_ad1 == ""){
			if(comparison_combo.getValue() == 1){
				comparison_ad1 = "1.25";
			}else{
				comparison_ad1 = "0.85";
			}
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
		var params = [selectCorpId,target_name,target_name_value,new_start_date,start_date_value,new_end_date,end_date_value,comparison_ad1];
		if(comparison_combo.getValue() == 1){
			if(times_combo.getValue() == 1){	
				grid.store.constructor({
					db : {
						params : params,
						alias : 'collection_target_error.search.than'
					},
					root : "r",
					fields : fields
				});
			}else{
				grid.store.constructor({
					db : {
						params : params,
						alias : 'collection_target_error.search.by_gps_time.than'
					},
					root : "r",
					fields : fields
				});
			}
		}else{
			if(times_combo.getValue() == 1){	
				grid.store.constructor({
					db : {
						params : params,
						alias : 'collection_target_error.search.less'
					},
					root : "r",
					fields : fields
				});
			}else{
				grid.store.constructor({
					db : {
						params : params,
						alias : 'collection_target_error.search.by_gps_time.less'
					},
					root : "r",
					fields : fields
				});
			}
		}
		
		//if(!grid.getBottomToolbar().cursor){
			grid.store.load({
				params : {
					start : 0,
					limit : limit
				}
			});
		/*}else{
			grid.store.load({
				params : {
					start : grid.getBottomToolbar().cursor,
					limit : limit
				}
			});
		}*/
	
		loadMask.hide();
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
				target_name_store.constructor({
					root : 'r',
					fields : ['target_id', 'target_name'],
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/collection_target_name.select/['+selectCorpId+']'
					})
				});
				target_name_store.load();
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
		target_name_store.constructor({
			root : 'r',
			fields : ['target_id', 'target_name'],
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/collection_target_name.select/['+selectCorpId+']'
			})
		});
		target_name_store.load();
	});

		
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
			items : [grid]
		}]  
	});
});