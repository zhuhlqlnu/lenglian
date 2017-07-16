function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
	return dt.format('Y-m-d H:i:s');
} 

function dateFormatToDay(value) {
    var dt = new Date.parseDate(value, 'U');
	return dt.format('Y-m-d');
} 
Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var selectCorpId;
	var store_sql = 'pipe.task.task_defect.select';
	var fields =  ['id', 'start_time', 'end_time', 'reg_date', 'reg_user_id', 'login_name', 'memo','report_id','recv_time','gps_time','longitude','latitude','name','report_login_name','report_memo','status','type_id'];
	
	var store = new Ext.zion.db.ArrayStore({
		db : {
			alias : store_sql
		},
		root: 'r',
		fields : fields
	});
	
	var grid = new Ext.grid.GridPanel({
        store: store,
        enableColumnHide : false,
        loadMask : {msg:'查询中...'},
        columns: [
            {header: '缺陷编号', width: 70, sortable: true, dataIndex: 'report_id'},
        	{ header: "图片",width: 50, sortable: true,dataIndex: 'report_id',renderer: function(v,c,r){
        		var id = r.data["report_id"];
	           	if(!id){
	           		return "";
	           	}else{
	           		return "<a href=# onclick='show_win("+id+")'>"+id+".jpg</a>";
	           	}
            }},
            { header: "缺陷类型",width: 75, sortable: true, dataIndex: 'name'}, 
        	{header: "开始时间", width: 150, sortable: true, dataIndex: 'start_time', renderer: dateFormat},
        	{header: "结束时间", width: 150, sortable: true, dataIndex: 'end_time', renderer: dateFormat},
        	{header: "处理人员", width: 100, sortable: true, dataIndex: 'login_name'},
        	{header: "纬度",width: 80, sortable: true, dataIndex: 'latitude' },
        	{header: "经度",width: 70,sortable: true, dataIndex: 'longitude'}, 
			{ 
				header: "查看地图",width: 100, sortable: true, dataIndex: 'pdt_id',renderer: function(v,c,r){
					var latitude = r.data["latitude"];
					var longitude = r.data["longitude"];
					var pdt_id = r.data["type_id"];
					return "<a href='#' onclick='return show_map("+latitude+","+longitude+","+pdt_id+")'>查看</a>";
				 }
			},
        	{ header: "处理状态",width: 75, sortable: true, dataIndex: 'status',renderer:function(v,c,r){
          	var status = r.data["status"];
          	var id = r.data["id"];
          	if(status == 1){ 
          		return "未处理"
          	}else if(status == 2){
          		return "处理中";
          	}else{
          		return "已处理";
          	}}
          }, 
          { header: "缺陷说明",width: 220, sortable: true, dataIndex: 'report_memo'},
        	{header: "备注", width: 230, sortable: true, dataIndex: 'memo'}
        ],
        tbar: [ {
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新',
			handler : function() {
				store.reload();
			},
			scope : this
		} ],
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		})
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

	show_win = function(id){
		var panel = new Ext.Panel({
    		 height:200,
        	 width:200,
        	 html:'<span><img width=300 height=300 src="/uploaded/visitator/defect/'+id+'.jpg"/></span>'
    	 })
    	 var new_win = new Ext.Window({
    		 xtype:'window',
    		 title: '图片',
    		 autoWidth:true,
    		 autoHeight:true,
    		 html:'<span style="display:table;width:100%;"><img src="/uploaded/visitator/defect/'+id+'.jpg"/></span>'
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
				store.constructor( {
					db : {
						alias : store_sql,
						params : [ selectCorpId ]
					},
					root : "r",
					fields : fields
				});
				store.load( {
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				});
				grid.store.removeAll();
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
			db : {
				alias : store_sql,
				params : [ Zion.user.corp_id ]
			},
			root : "r",
			fields : fields
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		loadMask.hide();
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			width:250,
			split:true,
			region : 'center',
			layout : 'fit',
	    	title:'缺陷任务列表',
			items :[grid]
		}]
	});
	
});