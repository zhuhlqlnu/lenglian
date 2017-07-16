Ext.onReady(function(){
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中,请稍后 ..."
	});
	loadMask.show();
	var checkeding = false;
    var selectCorpId;
	var type;
	fields= ['id','recv_time','gps_time','longitude','latitude','name','login_name','memo','status','corp_id'];
     
	function tips(val){
    	 if(val == null){
    		 return '';
    	 }
    	return '<span style="display:table;width:100%;" title="' + val + '">' + val + '</span>';
	}
     
	function timeStr(n) {
		return new Date(n * 1000).toLocaleString();
	}
 
 	var store = new Ext.zion.db.ArrayStore({
 		db:{
 			alias: "pipe.statistics.defect_report_status.select"
 		},
 		root: 'r',
 		fields:fields
 	});
 	
 	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect:true});
 	sm.on('rowselect', function() {
 		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('treatment').enable();
			Ext.getCmp('forward').enable();
			Ext.getCmp('task').enable();
			Ext.getCmp('error').enable();
		} else {
			Ext.getCmp('treatment').disable();
			Ext.getCmp('forward').disable();
			Ext.getCmp('task').disable();
			Ext.getCmp('error').disable();
		}
 	});
 	
 	sm.on('rowdeselect', function() {
 		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('treatment').enable();
			Ext.getCmp('forward').enable();
			Ext.getCmp('task').enable();
			Ext.getCmp('error').enable();
		} else {
			Ext.getCmp('treatment').disable();
			Ext.getCmp('forward').disable();
			Ext.getCmp('task').disable();
			Ext.getCmp('error').disable();
		}
 	});
 	
	var grid = new Ext.grid.GridPanel({
		//height: 350,
		//width: 800,
		store: store,
		autoScroll:true,
		enableColumnHide : false,
		loadMask : {msg:'查询中...'},
		sm : sm,
		//frame: true,
		columns: [
             sm,
             {header: '缺陷编号',width: 80,sortable: true, dataIndex: 'id'}, 
             { header: "图片",width: 50, sortable: true,dataIndex: 'id',renderer: function(v,c,r){
            	 var id = r.data["id"];
            	 if(!id){
            		 return "";
            	 }else{
            		 return "<a href=# onclick='show_win("+id+")'>"+id+".jpg</a>";
            	 }
             }, dataIndex: 'event_photo'}, 
             {header: "上报时间", width: 160, sortable: true,renderer: timeStr, dataIndex: 'recv_time'}, 
             {header: "发送人员", width: 90, sortable: true, dataIndex: 'login_name'}, 
             {header: "纬度",width: 80, sortable: true, dataIndex: 'latitude' },
             {header: "经度",width: 70,sortable: true, dataIndex: 'longitude'}, 
             { header: "缺陷类型",width: 75, sortable: true, dataIndex: 'name'}, 
             { header: "处理状态",width: 75, sortable: true, dataIndex: 'status',renderer:function(status){if(status == 1){ return "未处理"}else if(status == 2){return "处理中"}else{return "已处理"}}}, 
             { header: "缺陷说明",width: 400, sortable: true, dataIndex: 'memo',renderer: tips}
         ],
         bbar: new Ext.PagingToolbar({
 			store: store,
 			pageSize: Ext.zion.page.limit,
 			displayInfo : true 
 		 }),
         tbar: [{
         	text : '处理',
			tooltip : '处理缺陷',
			id:'treatment',
			disabled:true,
			handler : function(){
				type = 1;
				show_defect_win();
			}
		},{
			text : '转发',
			tooltip : '转发缺陷',
			id:'forward',
			disabled:true,
			handler : function(){
				type = 2;
				show_corp_forword();
			}
		},{
			text : '生成任务',
			tooltip : '生成任务',
			id:'task',
			disabled:true,
			handler : function(){
				type = 3;
				show_target();
			}
		},{
			text : '误报',
			tooltip : '误报',
			id:'error',
			disabled:true,
			handler : function(){
				type = 4;
				show_defect_win();
			}
		},{
			text : '刷新',
			icon : Ext.zion.image_base+'/refresh.gif',
			tooltip : '刷新',
			handler : function(){
				store.reload();
			}
		}]
     });
             
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
   //处理、误报  
	function show_defect_win(){
     	var form = new Ext.form.FormPanel({
			width:380,
     		height:200,
     		labelWidth:50,
     		items:[{
				fieldLabel : '备注',
				xtype:'textarea',
				name : 'memo',
				id : 'memo',
				allowBlank : false,
				blankText : '不能为空'
     		}]
		});
     	var defect_win = new Ext.Window({
     		width:380,
     		height:200,
     		title:'缺陷信息',
			closable : true,
			closeAction : 'close',
			items:[form],
			buttons : [{
			text : '保存',
				handler : function(){
					add_defect_process(form.getForm(),defect_win);
				}
			}, {
				text : '关闭',
				handler : function() {
					defect_win.close();
				}
			}]
         });
         defect_win.show();
	}
	
	function add_defect_process(form,defect_win){
     	var sm = grid.getSelectionModel().getSelected();
     	var defect_id = sm.data.id;
     	if (form.isValid() == false) {
			return false;
		}else{
			Ext.Msg.confirm('确认', '是否确认处理选中的记录？', function(btn) {
				if (btn == 'yes') {
					var memo = Ext.getCmp("memo").getValue();
         			Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.insert',[type,memo,defect_id,1],function(data){
         				if(data.r){
         					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_report.update',[3,defect_id],function(data){
         						if(data.r){
         							if(type == 1){
         								Ext.Msg.alert('提示','缺陷处理成功');
         							}else{
         								Ext.Msg.alert('提示','缺陷误报处理成功');
         							}
         							store.reload();
		         					defect_win.close();
		         					disable_button();
         						}
         					});
         				}else{
         					if(type == 1){
         						Ext.Msg.alert('提示','缺陷处理失败');
         					}else{
 								Ext.Msg.alert('提示','缺陷误报处理失败');
 							}
         					defect_win.close();
         					store.reload();
         					disable_button();
         				}
         			});
				}
			});
		}
	}
	
	//转发
	function show_corp_forword(){
		var relegateToCorp;
		Ext.zion.tree.loadCorpTree(function(tree) {
			var relegateToCorp;
			var corp_forward_tree = new Ext.tree.TreePanel( {
				autoScroll : true,
				width : 250,
				height : 250,
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(tree),
				rootVisible : false,
				listeners : {
					click : function(node) {
						relegateToCorp = node.attributes.corp.corp_id;
						if (selectCorpId == relegateToCorp) {
							button.disable();
						} else {
							button.enable();
						}
					}
				}
			});

			var button = new Ext.Button( {
				disabled : true,
				text : '保存',
				handler : function() {
					Ext.Msg.confirm('确认', '是否确认处理选中的记录？', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							defect_forward(win,corp_forward_tree,relegateToCorp);
						}
					});
				}
			});

			var win = new Ext.Window( {
				title : '未处理转发',
				closable : true,
				items : [ corp_forward_tree ],
				buttons : [ button, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			});
			win.show();
			loadMask.hide();
		});
	}
	
	function defect_forward(win,corp_forward_tree,relegateToCorp){
		var ids = [];
		var sm = grid.getSelectionModel().getSelections();
     	for ( var i = 0; i < sm.length; i += 1) {
			ids.push(sm[i].data.id);
		}
     	
		var insertNext = function(ids){
			if(ids.length > 0){
				var corp_id = relegateToCorp;
				var defect_id = ids.pop();
				if(grid.getSelectionModel().getSelected().data.corp_id != selectCorpId){
					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_forward.update',[relegateToCorp,defect_id],function(data){
						if(data.r){
							Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.update',[selectCorpId,defect_id],function(data){
			     				if(data.r){
									Ext.Msg.alert('提示','转发成功');
									store.reload();
									loadMask.hide();
									disable_button();
									win.close();
			     				}
							});
						}else{
							Ext.Msg.alert('提示','转发失败');
							store.reload();
							loadMask.hide();
							disable_button();
							win.close();
						}	
					});
				}else{
					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_forward.delete',[grid.getSelectionModel().getSelected().data.corp_id,defect_id],function(data){
						Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.insert',[type,'',defect_id,1],function(data){
		     				if(data.r){
		     					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_forward.insert',[corp_id,defect_id],function(data){
									if(data.r){
										insertNext(ids);
									}else{
										Ext.Msg.alert('提示','转发失败');
										store.reload();
										loadMask.hide();
										disable_button();
										win.close();
									}
								});
		     				}else{
		     					Ext.Msg.alert('提示','转发失败');
								store.reload();
								loadMask.hide();
								disable_button();
								win.close();
		     				}
						});
					});
				}
			}else{
				Ext.Msg.alert('提示','转发成功');
				loadMask.hide();
				disable_button();
				store.reload();
				win.close();
			}				
		}
		insertNext(ids);
	}
	
	//任务
	function show_target(){
		var sm = grid.getSelectionModel().getSelected();
     	var defect_id = sm.data.id;
		targetTree = new Ext.tree.TreePanel( {
			autoScroll : true,
			split : true,
			region : 'center',
			animate : false,
			border : false,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				checkchange : function(node, checked) {
					if (checkeding) {
						return;
					}
					if (node.hasChildNodes()) {
						node.eachChild(function(child) {
							child.ui.toggleCheck(checked);
						});
					}
				}
			}
		});
		
		Ext.zion.tree.loadTargetTree(function(tree) {
			targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
		},true);
		
		task_form = new Ext.FormPanel({
	    	heigth: 100,
		    defaults: {width: 230},
		    labelWidth:75,
	    	items: [{
	    		id: 'start_time',
	    		xtype: 'datefield',
	    		fieldLabel: '开始时间',
	    		editable : false,
	    		format:'Y-m-d',
	    		allowBlank : false,
				blankText : '不能为空'
	    	},{
	    		id: 'end_time',
	    		xtype: 'datefield',
	    		fieldLabel: '结束时间',
	    		editable : false,
	    		format:'Y-m-d',
	    		allowBlank : false,
				blankText : '不能为空'
	    	},{
				fieldLabel : '备注',
				xtype:'textarea',
				name : 'task_memo',
				id : 'task_memo'
     		}]
		});
		
		panel = new Ext.Panel({
			height : 400,
			width:400,
			layout : 'border',
			defaults : {
				border : false
			},
			items:[{
				region : 'south',
				layout : 'fit',
				height : 140,
				items :[task_form]
			},{
				region : 'center',
				layout : 'fit',
				height :300,
				items :[targetTree]
			}]
		});
	
		var button = new Ext.Button( {
			text : '保存',
			handler : function() {
				add_defect_task(win,targetTree,task_form.getForm());
			}
		});
		var win = new Ext.Window( {
			height : 440,
			width:400,
			title : '未处理缺陷任务',
			closable : true,
			items : [ panel ],
			buttons : [ button, {
				text : '取消',
				handler : function() {
					win.close();
				}
			} ]
		});
		win.show();
		var loadMask = new Ext.LoadMask(win.el, {
			msg : "加载中,请稍后 ..."
		});
		loadMask.show();
	}
	
	function add_defect_task(win,targetTree,task_form){
		var sm = grid.getSelectionModel().getSelected();
     	var defect_id = sm.data.id;
     	if (task_form.isValid() == false) {
			return false;
		}else{
			Ext.Msg.confirm('确认', '是否确认对目标生成任务？', function(btn) {
				if (btn == 'yes') {
					var start_time = parseInt(Ext.getCmp("start_time").getValue().getTime()/1000);
					var end_time = parseInt(Ext.getCmp("end_time").getValue().getTime()/1000);
					var task_memo = Ext.getCmp("task_memo").getValue();
					var target_ids = getCheckedTarget();
					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_report.update',[2,defect_id],function(data){
         				if(data.r){
         					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.insert',[type,task_memo,defect_id,1],function(data){
         						if(data.r){
         							var insertNext = function(target_ids){
										if(target_ids.length > 0){
											var target_id = target_ids.pop();
											var params = [defect_id,target_id,start_time,end_time,task_memo];
											Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_task.insert',params,function(data){
												if(data.r){
													insertNext(target_ids);
												}else{
													Ext.Msg.alert('提示','任务绑定失败');
													store.reload();
													disable_button();
													win.close();
												}
											});
										}else{
											Ext.Msg.alert('提示','任务绑定成功');
											disable_button();
											store.reload();
											win.close();
										}				
									}
								insertNext(target_ids);
         						}
         					});
         				}else{
         					Ext.Msg.alert('提示','任务绑定失败');
         				}
					});
				}
			});
		}
	}
	
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
		checkedNode(targetTree.getRootNode());
		return checkedTarget;
	}

	function disable_button(){
		Ext.getCmp('treatment').disable();
		Ext.getCmp('forward').disable();
		Ext.getCmp('task').disable();
		Ext.getCmp('error').disable();
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
					db:{
		     			params:[selectCorpId,selectCorpId,selectCorpId],
		     			alias: "pipe.statistics.defect_report_status.select"
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
     			params:[selectCorpId,selectCorpId,selectCorpId],
     			alias: "pipe.statistics.defect_report_status.select"
     		},
     		root: 'r',
     		fields:fields
		});
		store.load({params:{start:0,limit:Ext.zion.page.limit}});
		loadMask.hide();
	});

	// grid自适应
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
			title:'未处理缺陷列表',
			region : 'center',
			split : true,
			items : [grid]
		}]  
	});	 
	//日期补0
	function fillstring(str){
		if(str.length==1){
			str = "0" + str;
		}
		return(str);
	}
})