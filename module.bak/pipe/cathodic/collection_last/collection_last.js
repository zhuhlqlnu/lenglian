function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
	var selectCorpId;
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
		columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),{
			header : "名称",
			dataIndex : 'target_name',
			width : 85,
			sortable : true
		},{
			header : "终端编号",
			dataIndex : 'terminal_sn',
			width : 85,
			sortable : true
		},{
			header : "采集时间",
			dataIndex : 'gps_time',
			width : 95,
			sortable : true
		},{
			header : "上传时间",
			dataIndex : 'recv_time',
			width : 95,
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
			width : 105,
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
		}],
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
						
					var params = [selectCorpId,target_name,target_name_value];
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
				store.constructor( {
					db:{
		     			params:[selectCorpId],
		     			alias: "collection_last_track.select"
		     		},
		     		root: 'r',
		     		fields:fields
				});
				store.load({params:{start:0,limit:Ext.zion.page.limit}});
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
     			params:[selectCorpId],
     			alias: "collection_last_track.select"
     		},
     		root: 'r',
     		fields:fields
		});
		store.load({params:{start:0,limit:limit}});
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