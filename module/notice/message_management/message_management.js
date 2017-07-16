Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中,请稍后 ..."
	});
	loadMask.show();

	var sendMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "消息发送中,请稍后 ..."
	});

	var userTree = new Ext.tree.TreePanel( {
		title:'用户列表',
		autoScroll : true,
		width:200,
		collapsible : true,
		split : true,
		region : 'west',
		animate : false,
		border : false,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				if (node.attributes.user) {
					var key = node.attributes.user.user_id;
				} else {
					return false;
				}
			},
			checkchange : function(node, checked) {
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						child.ui.toggleCheck(checked);
					});
				}
			}
		}
	});

	function getCheckedTarget() {
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target && node.attributes.checked) {
				var key = node.attributes.target.target_id;
				if (!checkedTargetMap[key]) {
					checkedTargetMap[key] = key;
					checkedTarget.push(key);
				}
			}
			if (node.hasChildNodes()) {
				node.eachChild(function(child) {
					checkedNode(child);
				});
			}
		}
		checkedNode(userTree.getRootNode());
		return checkedTarget;
	}

	var massage_form = new Ext.form.FormPanel({
		height:300,
		title:'消息信息',
		region : 'center',
		buttonAlign:"left", 
		autoScroll : true,
		frame : true,
		defaults:{xtype: 'textfield'},
		items : [ {
    		id: 'title',
    		fieldLabel: '标题',
    		allowBlank : false,
			blankText : '不能为空'
    	},{
    		id: 'content',
    		fieldLabel: '内容',
    		xtype:'textarea',
    		allowBlank : false,
			blankText : '不能为空'
    	},{
			xtype : "panel",
			layout : "column",
			fieldLabel : '确认回执',
			isFormField : true,
			items : [{
				width : 150,
				checked : true,
				xtype : "radio",
				boxLabel : "是",
				name : "is_confirm",
				inputValue : 1
			}, {
				width : 50,
				xtype : "radio",
				boxLabel : "否",
				name : "is_confirm",
				inputValue : 0
			}]
		}],
		buttons: [{
        	id: 'saveModifyBut',
            text: '发送',
            handler: function(){
            	save_massage();
            }
        },{
            text: '取消',
            handler: function(){
            	massage_form.getForm().reset();
            }
        }]
	});
	
	function save_massage(){
		var title = Ext.getCmp("title").getValue();
		var content = Ext.getCmp("content").getValue();
		var is_confirm = massage_form.getForm().findField("is_confirm").getGroupValue();
		if(getCheckedTarget().length < 1){
			Ext.Msg.alert('提示','请选择要发送的用户');
			return;
		}
		if (massage_form.getForm().isValid() == false) {
			return false;
		}else{
			sendMask.show();
			var user_ids = getCheckedTarget();
			if(getCheckedTarget().length>0){
				insertNext = function(user_ids){
					if(user_ids.length>0){
						var user_id = user_ids.pop();
						Ext.zion.db.getJSON("notice.message_management.insert", [1,user_id,title,content,is_confirm], function(data) {
							if(data.r){
								insertNext(user_ids)
							}
						});
					}else {
						Ext.Msg.alert("提示", "发送成功");
						sendMask.hide();
						massage_store.reload();
						massage_form.getForm().reset();
					}
				}
				insertNext(user_ids);
			}
		}
	}
	
	var massage_store = new Ext.zion.db.ArrayStore( {
		db : {
			alias : 'notice.message_management.select'
		},
		root : "r",
		fields : ['message_id','to_user_id','login_name','title','content','send_time','recv_time','is_confirm']
	});
	
	var massage_grid = new Ext.grid.GridPanel({
		title:'消息列表',
		store : massage_store,
		columns : [
			new Ext.grid.RowNumberer({header:'序号',width:35}),	
		{
			header : "接收用户",
			dataIndex : 'login_name',
			width : 120,
			sortable : true
		},{
			header : "标题",
			dataIndex : 'title',
			width : 120,
			sortable : true
		},{
			header : "内容",
			dataIndex : 'content',
			width : 200,
			sortable : true
		}/*,{
			header : "回执确认",
			dataIndex : 'is_confirm',
			width : 100,
			sortable : true,
			renderer:function(v,c,r){
				var recv_time = r.data["recv_time"];
				var is_confirm = r.data["is_confirm"];
				if (is_confirm == 0){
					return "不要求确认"
				}else{
					if(recv_time == "" || recv_time == null){
						return "未接收";
					}else{
						return recv_time+"接收";
					}
				}
			}
		}*/,{
			header : "发送时间",
			dataIndex : 'send_time',
			width : 80,
			sortable : true
		},{
			header : "接收时间",
			dataIndex : 'recv_time',
			width : 80,
			sortable : true,
			renderer:function(recv_time){
				if(recv_time == "" || recv_time == null){
					return "未接收";
				}else{
					return recv_time+"接收";
				}
			}
		}],
		tbar: ['请根据：', {
			xtype : 'textfield',
			width : 150,
			name : 'term',
			id : 'term',
			emptyText:'输入接收用户'
		}, {
			text : '查询',
			tooltip : '查询',
			icon : Ext.zion.image_base + '/select.gif',
			handler : function(){
				select_grid();
			}
		}],
		bbar: new Ext.PagingToolbar( {
			store : massage_store,
			pageSize : Ext.zion.page.limit,
			displayInfo : true
		}),
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	});
	massage_store.load({params:{start:0,limit:Ext.zion.page.limit}});
	
	var massage_panel = new Ext.Panel({
		layout : 'border',
		defaults : {
			border : false
		},
		items:[{
			region : 'north',
			layout : 'fit',
			height:200,
			items :[massage_form]
		},{
			region : 'center',
			layout : 'fit',
			items :[massage_grid]
		}]
	});
	
	function select_grid(){
		var term = Ext.getCmp('term').getValue();
		if(term == ""){
			massage_store.constructor({
				db : {
					alias : 'notice.message_management.select'
				},
				root : "r",
				fields : ['message_id','to_user_id','login_name','title','content','send_time','recv_time','is_confirm']
			});
			massage_store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		}else{
			massage_store.constructor({
				db : {
					alias : 'notice.message_management.login_name.select',
					params:[term]
				},
				root : "r",
				fields : ['message_id','to_user_id','login_name','title','content','send_time','recv_time','is_confirm']
			});
			massage_store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});
		}
	}
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [  userTree , {
			layout : 'fit',
			region : 'center',
			items:[massage_panel]
		}]
	});

	Ext.zion.tree.loadTargetTree(function(tree) {
		userTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
		loadMask.hide();
	}, true,{"patrol":true});
});