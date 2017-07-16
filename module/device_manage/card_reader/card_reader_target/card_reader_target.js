function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
     return dt.format('Y-m-d h:i:s');
} 
Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
	var selectCorpId;
	var card_fields =['terminal_location_id', 'terminal_sn'];
	var card_store = new Ext.data.SimpleStore( {
		root : 'r',
		fields : card_fields,
		proxy : new Ext.data.ScriptTagProxy({
			url : ZionSetting.db.url + '/' + Zion.token
					+ '/axiom_terminal_card_location.card_by_corp.select/['+selectCorpId+']'
		})
	});
	
	var type_come = new Ext.form.ComboBox({
		width:100,
		store: card_store,
		hiddenName : 'terminal_location_id',
		valueField : 'terminal_location_id',
		displayField : 'terminal_sn',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		emptyText:'默认为所有',
		value:'所有',
		listeners : {
			'select':function(){
				select_rfid_target();
			}
		}
	});
	
	card_store.load();
	card_store.on('load',function(this_, record, index){
		var ComboRecord = Ext.data.Record.create([{name: 'terminal_location_id'}, {name: 'terminal_sn'}]);
		this_.insert(0,new ComboRecord({terminal_location_id: 0,terminal_sn:'所有'}));

	});
	
	var time_data = [[5,'5秒'],[10,'10秒'],[20,'20秒'],[30,'30秒']];
	
	var time_store = new Ext.data.SimpleStore({
		fields: [ 'time_value','time'],
		data : time_data
	});
	
	var time_combo = new Ext.form.ComboBox({
		width:100,
    	hiddenName: 'time_value',
    	valueField: 'time_value',
        store: time_store,
        displayField:'time',
        mode: 'local',
        editable: false,
        triggerAction: 'all'
    }); 
	time_combo.setValue(5);
	
	var fields = ['target_name','speed','status','geocoding','gps_time','recv_time','terminal_sn'];
	var store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : 'axiom_track_rfid_card.select',
			params : [ selectCorpId ]
		},
		root : "r",
		fields : fields
	});
	
	var grid = new Ext.grid.GridPanel( {
		title:'工作状态列表',
		store : store,
		columns : [   
		new Ext.grid.RowNumberer({
			header : '序号',
			width : 35
		}),{
			header : "目标名称",
			dataIndex : 'target_name',
			width : 30,
			sortable : true
		}, {
			header : "监测点",
			dataIndex : 'terminal_sn',
			width : 30,
			sortable : true
		}, {
			header : "读卡时间",
			dataIndex : 'gps_time',
			width : 30,
			sortable : true,
			renderer:dateFormat
		}, {
			header :"状态",
			width : 20,
			dataIndex : 'status',
			sortable : true,
			renderer:function(v,c,r){
				return "正常";
			}
		}, {
			header : "位置",
			dataIndex : 'geocoding',
			width : 70,
			sortable : true
		}, {
			header : "上传时间",
			dataIndex : 'recv_time',
			width : 40,
			sortable : true,
			renderer:dateFormat
		}],
		tbar:['监测点:',type_come/*,' 刷新时间:',time_combo*/],
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
		
	function select_rfid_target(){
		var terminal_location_id = type_come.getValue();
//		var time = time_combo.getValue();
		if(terminal_location_id == 0 || terminal_location_id == "所有"){
			grid.store.constructor( {
				db : {
					alias : 'axiom_track_rfid_card.select',
					params : [selectCorpId]
				},
				root : "r",
				fields : fields
			});
		}else{
			grid.store.constructor( {
				db : {
					params : [selectCorpId,terminal_location_id],
					alias : 'axiom_track_rfid_card.attribute.by_read_id.select'
				},
				root : "r",
				fields : fields
			});
		}
		
		grid.store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		setInterval(function() {
		   card_store.reload();
		   store.reload(); 
		}, (30*1000)); 
	}
	
	function appendCorpNode(corp_list, node, index) {
		var nodeAdd = {};
		nodeAdd.text = corp_list[index][2];
		nodeAdd.expanded = true;
		nodeAdd.corp = {
			corp_id : corp_list[index][0],
			selectCorpId : corp_list[index][1],
			order_by : corp_list[index][3],
			group_id : corp_list[index][4]
		};

		node.children.push(nodeAdd);
		if (corp_list[index].children) {
			nodeAdd.children = [];
			for ( var i = 0; i < corp_list[index].children.length; i++) {
				appendCorpNode(corp_list, nodeAdd, corp_list[index].children[i]);
			}
		} else {
			nodeAdd.leaf = true;
		}
	}

	function createCorpTree(corp_list) {
		var tree = {
			children : []
		};

		for ( var i = 0; i < corp_list.length; i++) {
			for ( var j = 0; j < corp_list.length; j++) {
				if (corp_list[j][0] == corp_list[i][1]) {
					if (!corp_list[j].children) {
						corp_list[j].children = [];
					}
					corp_list[j].children.push(i);
					corp_list[i].child = true;
				}
			}
		}

		for ( var i = 0; i < corp_list.length; i++) {
			if (!corp_list[i].child) {
				appendCorpNode(corp_list, tree, i);
			}
		}

		return tree;
	}

	function loadCorpTree(callback, scope) {
		Zion.db.getJSON('tree.user_corp', null, function(data) {
			if ((data) && (data.r)) {
				if (callback) {
					callback.call(scope || window, createCorpTree(data.r));
				}
			}
		});
	}

	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		split : true,
		region : 'north',
		layout:'fit',
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				card_store.constructor( {
					root : 'r',
					fields : card_fields,
					proxy : new Ext.data.ScriptTagProxy({
						url : ZionSetting.db.url + '/' + Zion.token
								+ '/axiom_terminal_card_location.card_by_corp.select/['+selectCorpId+']'
					})
				});
				grid.store.constructor( {
					db : {
						alias : 'axiom_track_rfid_card.select',
						params : [selectCorpId]
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
				type_come.setValue("所有");
				card_store.load();
			}
		}
	});
	// ==============获得客户信息==============

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;

		loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});
		card_store.constructor({
			root : 'r',
			fields : card_fields,
			proxy : new Ext.data.ScriptTagProxy({
				url : ZionSetting.db.url + '/' + Zion.token
						+ '/axiom_terminal_card_location.card_by_corp.select/['+selectCorpId+']'
			})
		});
		card_store.load();
		store.constructor( {
			db : {
				alias : 'axiom_track_rfid_card.select',
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
	});
	
	new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [ {
			width:250,
			split : true,
			collapsible : true,
			title : '集团列表',
			region : 'west',
			layout : 'fit',
			items : [ corp_tree ]
		}, {
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		}]
	})
})