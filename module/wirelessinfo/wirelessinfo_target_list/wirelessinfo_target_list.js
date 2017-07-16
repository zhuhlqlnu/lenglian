function dateFormat(value) {
    var dt = new Date.parseDate(value, 'U');
     return dt.format('Y年m月d日');
} 

Ext.onReady(function() {
	Ext.QuickTips.init();
	var group_id;
	function add_group_tree(group_list,node,index){
		var nodeAdd={};
		nodeAdd.text = group_list[index][1]+'(车辆数：'+group_list[index][2]+')';
		nodeAdd.expanded = true;
		nodeAdd.group_id = group_list[index][0];
		node.children.push(nodeAdd);
		if (group_list[index].children) {
			nodeAdd.children = [];
			for ( var i = 0; i < group_list[index].children.length; i++) {
				add_group_tree(group_list, nodeAdd,
						group_list[index].children[i]);
			}
		} else {
			nodeAdd.leaf = true;
		}
	}
	
	function createGroupTree(group_list) {
		var tree = {
			children : []
		};

		for ( var i = 0; i < group_list.length; i++) {
			for ( var j = 0; j < group_list.length; j++) {
				if (group_list[j][0] == group_list[i][1]) {
					if (!group_list[j].children) {
						group_list[j].children = [];
					}
					group_list[j].children.push(i);
					group_list[i].child = true;
				}
			}
		}

		for ( var i = 0; i < group_list.length; i++) {
			if (!group_list[i].child) {
				add_group_tree(group_list, tree, i);
			}
		}
		return tree;
	}
	
	var group_tree = new Ext.tree.TreePanel({
		region : 'center',
		border : false,
		animate : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click:function(node){
				var loadMask = new Ext.LoadMask(grid.el, {
					msg : "加载中，请稍后 ..."
				});
				loadMask.show();
				group_id = node.attributes.group_id;
				grid.store.constructor({
					db : {
						params : [group_id],
						alias : 'wirelessinfo.wirelessinfo_target_list.by_group_id.select'
					},
					root : "r",
					fields : fields
				});
				grid.store.load({
					params : {
						start : 0,
						limit :  Ext.zion.page.limit
					}
				})
				loadMask.hide();
			}
		}
	});
	
	function load_group_tree(callback, scope){
		Zion.db.getJSON('wirelessinfo.wirelessinfo_target_list.select',null, function(data) {
			if ((data) && (data.r)) {
				if (callback) {
					callback.call(scope || window,
							createGroupTree(data.r));
				}
			}
		});
	}
	
	load_group_tree(function(tree){
		group_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
	})
	
	var sm = new Ext.grid.CheckboxSelectionModel();
	var fields = ['release_id','release_num','content_type','start_time','end_time','play_start_time','play_end_time','text','customer_id','state','create_time','cost','info_class', 'release_type','reg_user_id','release_cost', 'path', 'ref_release_id', 'corp_id','isdelete','customer_name','hour_start_time','hour_end_time'];
	var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "wirelessinfo.wirelessinfo_publish_binding.select"
				},
				root : "r",
				fields : fields
			});
				
	var grid = new Ext.grid.GridPanel( {
		store : store,
		sm:sm,
		loadMask:{ msg: '查询中...' },
		autoScroll : true,
		columns : [ sm,{
			header : "编号",
			dataIndex : 'release_num',
			width : 50,
			sortable : true
		},{
			header : "信息类型",
			width:120,
			dataIndex:'content_type',
			sortable : true,
			renderer:function(content_type){
				if(content_type == 0){
					return "文本";
				}else if(content_type == 1){
					return "音频";
				}else{
					return "视频";
				}
			}
		},{
			header : "信息分类",
			width:120,
			dataIndex:'info_class',
			sortable : true,
			renderer:function(info_class){
				if(info_class == 0){
					return "公共信息";
				}else if(info_class == 1){
					return "政府公告";
				}else{
					return "广告";
				}
			}
		},{
			header : "起始日期",
			dataIndex : 'start_time',
			width : 120,
			sortable : true,
			renderer:dateFormat
		},{
			header : "终止日期",
			dataIndex : 'end_time',
			width : 120,
			sortable : true,
			renderer:dateFormat
		},{
			header : "起始时间",
			dataIndex : 'hour_start_time',
			width : 120,
			sortable : true
		},{
			header : "终止时间",
			dataIndex : 'hour_end_time',
			width : 120,
			sortable : true
		},{
			header : "信息内容",
			dataIndex : 'text',
			width : 120,
			sortable : true
		},{
			header : "客户名称",
			dataIndex : 'customer_name',
			width : 120,
			sortable : true
		},{
			header : "信息费用(￥)",
			dataIndex : 'release_cost',
			width : 120,
			sortable : true
		},{
			header : "创建时间",
			dataIndex : 'create_time',
			width : 150,
			sortable : true,
			renderer:function(create_time){
				return new Date(create_time * 1000).toLocaleString();
			}
		}],
		tbar:[{
			text : '停播',
			tooltip : '停播',
			icon : Ext.zion.image_base+'/delete.gif',
			handler:function(){
				delete_wirelessinfo();
			}
		}],
		bbar : new Ext.PagingToolbar( {
			store : store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			//autoFill : true,
			//forceFit : true
		}
	});
//	store.load({params : {start : 0,limit :  Ext.zion.page.limit}});
	
	function delete_wirelessinfo(){
		var release_ids = [];
		var sm = grid.getSelectionModel().getSelections();
		if(sm  == ""){
			Ext.Msg.alert('提示','请选择要停播的信息');
			return;
		}
		Ext.Msg.confirm('停播确认', '你是否确认停播选中的记录？', function(btn) {
			if (btn == 'yes') {
				for(var i = 0; i < sm.length; i ++){
					var release_id = sm[i].data.release_id;
					if(release_id){
						release_ids.push(release_id);
					}
				}
				if(release_ids.length > 0){
					updateNext(release_ids);
				}
			}
		})
	}
	
		
	/** 时间转换时间戳* */
	function utc_to_timestamp(val) {
		var text_time = val.replace(/:/g, '-');
		time_str = text_time.replace(/ /g, '-');
		var time_arr = time_str.split("-");
		var time_datum = new Date(Date.UTC(time_arr[0], time_arr[1] - 1,
				time_arr[2], time_arr[3] - 8, time_arr[4], time_arr[5]));
		var new_time = time_datum.getTime() / 1000;
		return new_time;
	}
	
	var updateNext = function(release_ids){
		if(release_ids.length>0){
			var release_id = release_ids.pop();
			Ext.zion.db.getJSON('wirelessinfo.wirelessinfo_target_list.wirelessinfo_release_target.delete',[release_id,group_id],function(data){
				if(!data.f){
					updateNext(release_ids);	
				}else{
					Ext.Msg.alert('提示','信息停播失败');
				}
			})
		}else{
			Ext.Msg.alert('提示','信息停播成功');
			grid.store.reload();
		}
	}
	var view = new Ext.Viewport( {
		layout : 'border',
		border : false,
		items : [{
			region : 'west',
			title : '车辆组列表',
			autoScroll : true,
			collapsible : true,
			split : true,
			width : 200,
			minSize : 150,
			maxSize:250,
			items : [ group_tree ]
		} ,{
			region : 'center',
			layout : 'fit',
			items : [ grid ]
		} ]
	});
})
