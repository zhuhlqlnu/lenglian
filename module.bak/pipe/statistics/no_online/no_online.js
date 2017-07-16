function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 100;
	var selectCorpId;	
	var fields= ['target_id','target_name','terminal_sn','address','gps_time','recv_time','desc','longitude','latitude'];
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
			dataIndex :'target_name',
			width : 100,
			sortable : true
		},{
			header : "终端编号",
			dataIndex :'terminal_sn',
			width : 120,
			sortable : true
		},{
			header : "通讯卡地址",
			dataIndex :'address',
			width : 120,
			sortable : true
		},{
			header : "最后上传时间",
			dataIndex : 'recv_time',
			width : 120,
			sortable : true
		},{
			header : "状态",
			dataIndex : 'desc',
			width : 200,
			sortable : true
		}],
		tbar : ['长时间未回传判断时间(天)：',
			{
				name:'longtime',
				id:'longtime',
				xtype:'textfield',
				width : 100,
				readOnly:true
			},
			'名称：',{
				name:'target_name',
				id:'target_name',
				xtype:'textfield',
				width : 100
			},{
	        	text:'查询',
	        	icon : Ext.zion.image_base + '/select.gif',
				handler:function(){
					search_history();
				}
			}
		]
	});

	function search_history(){
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
		var target_name = Ext.getCmp("target_name").getValue();
	
		store.filter('target_name',target_name,true,false);
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
				target_last_time_show(selectCorpId);
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		target_last_time_show(selectCorpId);
	});
	
	function target_last_time_show(selectCorpId){
		Zion.db.getJSON('pipe.statistics.no_online.axiom_corp_setting.select',[selectCorpId],function(data){
			if(data.r){
				var longtime = data.r[0][1];
				Ext.getCmp("longtime").setValue(longtime);
				var last_time = parseInt(new Date().getTime()/1000)-longtime*24*3600;
				Zion.db.getJSON('pipe.statistics.no_online.target_last',[selectCorpId,last_time],function(data){
					if(data.r){
						store.loadData(data);
					}
				})
			}else{
			
			}
		});
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
			items : [grid]
		}]  
	});
});