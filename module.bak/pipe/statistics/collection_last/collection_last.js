function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
	var fields= ['target_name','temperature','ad1','ad2','ad3','voltage','gps_time','recv_time','terminal_sn','mileage','pipeline'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : "collection_last_track.select"
		},
		root : "r",
		fields : fields
	});
	
	var grid = new Ext.grid.GridPanel({
		store : store,
		autoScroll : true,
		columns : [{
			header : "名称",
			dataIndex : 'target_name',
			width : 75,
			sortable : true
		},{
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 75,
			sortable : true
		},{
			header : "温度(度)",
			dataIndex : 'temperature',
			width : 75,
			sortable : true
		},{
			header : "AD_1",
			dataIndex : 'ad1',
			width : 90,
			sortable : true
		},{
			header : "AD_2",
			dataIndex : 'ad2',
			width : 90,
			sortable : true
		},{
			header : "AD_3",
			dataIndex : 'ad3',
			width : 90,
			sortable : true
		},{
			header : "里程(公里)",
			dataIndex : 'mileage',
			width : 75,
			sortable : true
		},{
			header : "管道(公里)",
			dataIndex : 'pipeline',
			width : 75,
			sortable : true
		},{
			header : "电池电压(伏)",
			dataIndex : 'voltage',
			width : 90,
			sortable : true
		},{
			header : "传输时间",
			dataIndex : 'gps_time',
			width : 75,
			sortable : true
		},{
			header : "记录时间",
			dataIndex : 'recv_time',
			width : 75,
			sortable : true
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		tbar : [
			'名称：',
			{
				xtype : 'textfield',
				width : 120,
				name : 'target_name',
				id : 'target_name'
			},{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					var target_name = Ext.getCmp("target_name").getValue();
					var target_name_value;
					if(target_name){
						target_name_value=0;
					}else{
						target_name_value=1	
					}
						
					var params = [target_name,target_name_value];
					grid.store.constructor({
						db : {
							params : params,
							alias : 'collection_last_track.select.search'
						},
						root : "r",
						fields : fields
					});
					grid.store.load({
						params : {
							start : 0,
							limit : limit
						}
					})
				}
			}
		],
		bbar : new Ext.PagingToolbar({
			store : store,
			pageSize : limit,
			displayInfo : true
		})
	});
	store.load({
			params : {
				start : 0,
				limit : limit
			}
		});
		
	new Ext.Viewport({
		border : false,
		layout:'border',
		items : [{
					region : 'center',
					layout:'fit',
					items : grid
			}]
	});
});