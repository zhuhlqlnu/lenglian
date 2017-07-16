function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
	var selectCorpId;	
	var fields= ['target_nme','gps_time'];
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
		columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
		{
			header : "目标名称",
			dataIndex :'target_nme',
			width : 75,
			sortable : true
		},{
			header : "报警日期",
			dataIndex : 'gps_time',
			width : 75,
			sortable : true
		}],
		viewConfig : {
			autoFill : true,
			forceFit : true
		},
		tbar : ['开始时间：',{
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
					search_history();
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

	function search_history(){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
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
			
		var params = [selectCorpId,new_start_date,start_date_value,new_end_date,end_date_value];
		grid.store.constructor({
			db : {
				params : params,
				alias : 'collection_target_alarm.search'
			},
			root : "r",
			fields : fields
		});

		grid.store.load({
			params : {
				start : 0,
				limit : limit
			}
		});
		
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
				store.removeAll();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
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