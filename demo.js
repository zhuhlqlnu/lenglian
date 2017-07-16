Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	
	function showMain(status,sysdate_time) {
		var module_tab = new Ext.TabPanel( {
			region : 'center',
			activeItem : 0,
			enableTabScroll : true,
			plugins : new Ext.ux.TabCloseMenu(),
			defaults : {
				autoScroll : true
			},
			items : [ {
				title : '首页',
				html : '<iframe src="main/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="no" width="100%" height="100%"></iframe>'
			} ]
		});
		var module_tree = new Ext.tree.TreePanel( {
			title : '功能列表',
			autoScroll : true,
			collapsible : true,
			split : true,
			animate : true,
			singleExpand : true,
			region : 'west',
			margins : '5 0 0 0',
			cmargins : '5 5 0 0',
			width : 175,
			minSize : 100,
			maxSize : 250,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				click : function(n) {
					if (n.leaf) {
						if ((n.attributes.single) && (n.attributes.tab)) {

						} else {
							n.attributes.tab = module_tab.add( {
								title : n.attributes.text,
								html : '<iframe src="../module/' + n.attributes.url + '/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="auto" width="100%" height="100%"></iframe>',
								closable : true,
								onDestroy : function() {
									n.attributes.tab = undefined;
								}
							});
						}
						module_tab.setActiveTab(n.attributes.tab);
					} else {
						return false;
					}
				}
			}
		});
		var viewport = new Ext.Viewport( {
			layout : 'border',
			defaults : {
				border : false
			},
			items : [ {
				html : '<iframe src="head/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="no" width="100%" height="100%"></iframe>',
				region : 'north',
				split : false,
				height : 40,
				cmargins : '5 0 0 0'
			}, module_tree, module_tab, {
				html : '<iframe src="foot/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="no" width="100%" height="100%"></iframe>',
				region : 'south',
				height : 20,
				cmargins : '5 0 0 0'
			} ]
		});

		var sysdate_time_ = sysdate_time;
		var total_sos = 0;
		var total_forwards = 0;
		function sos_target_count(){
			Zion.db.getJSON("head.pipe_patrol_sos.count",[sysdate_time_],function(data){
				if(data.r){
					var count = data.r[0][0];
					if(count > total_sos){
						Ext.Msg.alert('提示','有新的紧急报警');
					}
					total_sos = count;
					top.show_count(count);	
				}
			});
			Zion.db.getJSON('pipe_defect_forward.count',[sysdate_time_],function(data){
				if(data.r){
					var forward_count = data.r[0][0];
					if(forward_count > total_forwards){
						Ext.Msg.alert('提示','有新的缺陷转发');
					}
					total_forwards = forward_count;
					top.show_forward_count(forward_count);
				}
			});
		}
		top.sos_target_count = sos_target_count;

		function defect_forward_show(){
			if(total_forwards == 0){
				return;
			}
			var store = new Ext.data.SimpleStore({
				fields :  ['corp_name','id','name','reg_date','corp_id'],
				root : 'r',
				proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/index.pipe_defect_forward.select/['+sysdate_time_+']'
						})
			});
			var grid = new Ext.grid.GridPanel({
				store : store,
				height : 200,
				width: 500,
				autoScroll : true,
				columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
				{
					header : "转发集团",
					dataIndex :'corp_name',
					width : 100,
					sortable : true
				},{
					header : "转发编号",
					dataIndex :'id',
					width : 100,
					sortable : true
				},{
					header : "转发类型",
					dataIndex :'name',
					width : 120,
					sortable : true
				},{
					header : "转发时间",
					dataIndex : 'reg_date',
					width : 120,
					sortable : true
				}]
			});
			store.load();
			var win = new Ext.Window({
				title:'转发提示',
				height : 200,
				autoWidth:false,
				width: 500,
				items:[grid],
				buttons : [ {
					id : 'select',
					text : '关闭',
					handler : function() {
						win.close();
					}
				}]
			});
			win.show();
		}
		top.defect_forward_show = defect_forward_show;

		function sos_target_show(){
			if(total_sos == 0){
				return;
			}
			var store = new Ext.data.SimpleStore({
				fields :  ['target_id','target_name','gps_time','recv_time'],
				root : 'r',
				proxy : new Ext.data.ScriptTagProxy({
							url : ZionSetting.db.url + '/' + Zion.token
									+ '/monitor.realtime_pipe.sos.select/['+sysdate_time_+']'
						})
			});
			var grid = new Ext.grid.GridPanel({
				store : store,
				height : 200,
				width: 500,
				autoScroll : true,
				columns : [new Ext.grid.RowNumberer({header:'序号',width:35}),
				{
					header : "目标名称",
					dataIndex :'target_name',
					width : 100,
					sortable : true
				},{
					header : "采集时间",
					dataIndex :'gps_time',
					width : 120,
					sortable : true
				},{
					header : "上传时间",
					dataIndex : 'recv_time',
					width : 120,
					sortable : true
				}]
			});
			store.load();
			var win = new Ext.Window({
				title:'紧急报警提示',
				height : 200,
				autoWidth:false,
				width: 500,
				items:[grid],
				buttons : [ {
					id : 'select',
					text : '关闭',
					handler : function() {
						win.close();
					}
				}]
			});
			win.show();
		}
		top.sos_target_show = sos_target_show;
		setInterval(function(){
			sos_target_count();
		},10000);
		Ext.zion.tree.loadModuleTree(function(tree) {
			Zion.db.getJSON('axiom_custom_module.count.select',null,function(data){
				if(data.r){
					if(data.r[0][0] != 0){
						if(status == 1){
							Zion.db.getJSON('axiom_custom_module_admin.select',null,function(data){
								var modlue_list = data.r;
								load_module_tree(modlue_list);
							});
						}else{
							Zion.db.getJSON('axiom_custom_module.select',null,function(data){
								var modlue_list = data.r;
								load_module_tree(modlue_list);
							});
						}
					}else{
						module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
					}
				}else{
					module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				}
			});
			loadMask.hide();
		});
		function load_module_tree(custom_module_list){
			 module_tree.setRootNode(new Ext.tree.AsyncTreeNode(Ext.zion.tree.custom_module(custom_module_list)));
		}
	}
	
	function utc_to_timestamp(val){	
		var dt = new Date.parseDate(val, 'U');
		return dt.format('Y-m-d H:i:s');
	}

	if(Zion.token){
		Zion.user.getInfo(function(data) {
			if (data) {
				document.title = Zion.user.system_name;
				var status = Zion.user.status;
				showMain(status);
			}
		});
		return;
	}

	function login() {
		if($("#username").val() == ""){
			Ext.Msg.alert("提示","用户名不能为空");
			return;
		}
		if($("#password").val() == ""){
			Ext.Msg.alert("提示","密码不能为空");
			return;
		}
		
		Zion.auth.login($("#username").val(), $("#password").val(), function(t) {
			if (t) {
				Zion.user.getInfo(function(data) {
					if (data) {
						$("#login_div").remove();
						loadMask.show();
						document.title = Zion.user.system_name;
						var status = Zion.user.status;
						Zion.db.getJSON('login_sysdate.select',null,function(data){
							sysdate_time = data.r[0][0];
							showMain(status,sysdate_time);
						});
					}
				});
			} else {
				loadMask.hide();
				Ext.Msg.alert('提示', '用户或者密码错误');
			}
		});
		
	}
	

	$("#login").click(login);

  $(document).keydown(function(event){
	if(event.keyCode==13){
		login();
		return false;
      }
  });
	
	$("#reset").click(function(){
		$("#username").val("");
		$("#password").val("");
	});
	
	$("#username").focus();

	window.login = login;
	
});

function unload() {
	if (Zion.auth.isLogin) {
		Zion.auth.logout();
	}
}

function beforeunload() {
	if (Zion.auth.isLogin) {
		return Zion.user.system_name;
	} else {
		return;
	}
}
