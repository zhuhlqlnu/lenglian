Ext.onReady(function(){
	Ext.QuickTips.init();
	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var update_button = new Ext.Button({
		text:'保存',
		width:60,
		handler:function(){
			var overtime = Ext.getCmp("overtime").getValue();
			var longtime = Ext.getCmp("longtime").getValue();
			var interval = Ext.getCmp("interval").getValue();
			var phone = Ext.getCmp("phone").getValue();
			Zion.db.getJSON('pipe.data.corp_setting.insert_or_update',[selectCorpId,overtime,longtime,interval,phone],function(data){
				if(!data.f){
					Ext.Msg.alert("提示","保存成功");
				}else{
					Ext.Msg.alert("提示","保存失败");
				}
			});
		}
	});
	
	var form = new Ext.form.FormPanel({
		autoWidth:true,
		autoHeight:false,
		height:7000,
		labelWidth:150,
		defaultType : 'textfield',
		items : [{
			fieldLabel : '离线判断时间(分)',
			name : 'overtime',
			id:'overtime',
			allowBlank:false
		},{
			fieldLabel : '长时间未回传判断时间(天)',
			name : 'longtime',
			id:'longtime',
			allowBlank:false
		},{
			fieldLabel : '定时回传间隔(秒)',
			name : 'interval',
			id:'interval',
			allowBlank:false
		},{
			fieldLabel : '紧急报警电话',
			name : 'phone',
			id:'phone',
			allowBlank:false
		},update_button]
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
				show_setting_default(selectCorpId);
			}
		}
	});

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
			corp_tree.getRootNode().childNodes[0].select();			
		});
		show_setting_default(selectCorpId);
	});

	function show_setting_default(selectCorpId){
		Zion.db.getJSON("pipe.data.corp_setting.select",[selectCorpId],function(data){
			if(data.r){
				var data_value = data.r;
				var name_value = {};
				for(var i = 0; i < data_value.length; i++){
					name_value[data_value[i][0]] = data_value[i][1];
				}
				Ext.getCmp("overtime").setValue(name_value["terminal.interval.overtime"]);
				Ext.getCmp("longtime").setValue(name_value["terminal.interval.longtime"]);
				Ext.getCmp("interval").setValue(name_value["terminal.interval"]);
				Ext.getCmp("phone").setValue(name_value["terminal.alarm.phone"]);
			}
		});
	}
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			width:250,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		},{
			region : 'center',
			layout : 'fit',
			items : [form]
		}]
	});
})