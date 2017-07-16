function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
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
						+ '/collection_target_name.select'
			})
		});

	var target_name_combo = new Ext.form.ComboBox({
		width:130,
		hiddenName : 'target_id',
		valueField : 'target_id',
		store : target_name_store,
		displayField : 'target_name',
		mode : 'local',
		editable : false
	});
	target_name_store.load();
	var grid = new Ext.grid.GridPanel({
		store : store,
		autoScroll : true,
		columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),{
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
			target_name_combo,'开始时间：',{
				name:'start_date',
				id:'start_date',
				xtype:'datefield',
				width : 130,
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
				width : 130,
				value:new Date(),
				altFormats : 'Y-m-d',
				format : 'Y-m-d',
				emptyText : '结束时间'
			},{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					var target_name = target_name_combo.getValue();
					if(target_name == ""){
						Ext.Msg.alert('提示','名称不能为空');
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
						
					var params = [target_name,target_name_value,new_start_date,start_date_value,new_end_date,end_date_value];
					grid.store.constructor({
						db : {
							params : params,
							alias : 'collection_target_history.search'
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