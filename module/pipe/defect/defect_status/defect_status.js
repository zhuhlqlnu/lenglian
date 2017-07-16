Ext.onReady(function(){
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中,请稍后 ..."
	});
	loadMask.show();
	var checkeding = false;
	var clicked_target_id;
    var selectCorpId;
	var type;
	fields= ['id','recv_time','gps_time','longitude','latitude','name','login_name','memo','status','corp_id','pdt_id','dictionary_id'];
     
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
			 { 
				header: "查看地图",width: 100, sortable: true, dataIndex: 'pdt_id',renderer: function(v,c,r){
					var latitude = r.data["latitude"];
					var longitude = r.data["longitude"];
					var dictionary_id = r.data["dictionary_id"];
					return "<a href='#' onclick='return show_map("+latitude+","+longitude+","+dictionary_id+")'>查看</a>";
				 }
				
			 },
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
			icon : Ext.zion.image_base+'/hourglass_go.png',
			handler : function(){
				type = 1;
				show_defect_win();
			}
		},{
			text : '转发',
			tooltip : '转发缺陷',
			icon : Ext.zion.image_base+'/relegate.gif',
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
			icon : Ext.zion.image_base+'/table_multiple.png',
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
			icon : Ext.zion.image_base+'/table_error.png',
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
		mapwin.show();
		map_point(map,latitude,longitude,pdt_id);
	 }
	
	function map_point(map,latitude,longitude,pdt_id){
		map.clearOverlays();
		
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
        	 html:'<span><img width="100%" height="100%" src="/uploaded/visitator/defect/'+id+'.jpg"/></span>'
    	 })
    	 var new_win = new Ext.Window({
			 xtype:'window',
			 title: '图片',
			 modal : true, 
			 buttonAlign : 'left',
			 closable:true,
			 constrainHeader:true, 
			 autoHeight:false,
			 layout:'fit',
			 tbar:[{
				id : 'rotleft',
				width:35,
				text : '左转',
				icon:Ext.zion.image_base +'/arrow_rotate_clockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(-90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			},{
				id : 'rotright',
				width:35,
				text : '右转',
				icon:Ext.zion.image_base +'/arrow_rotate_anticlockwise.png',
				handler:function(){
					$('#rotImg').rotateRight(90);
					new_win.setWidth($("#rotImg").width()+14);
					new_win.setHeight($("#rotImg").height()+60);
				}
			}],
    		 html:'<span style="display:table;"><span><img id="rotImg" src="/uploaded/visitator/defect/'+id+'.jpg"/></span></span>'
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
		var old_corp_id;
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
						old_corp_id = selectCorpId;
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
							defect_forward(win,corp_forward_tree,relegateToCorp,old_corp_id);
						}
					});
				}
			});

			var win = new Ext.Window( {
				title : '未处理转发',
				closable : true,
				width:380,
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
	
	function defect_forward(win,corp_forward_tree,relegateToCorp,old_corp_id){
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
							Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.update',[old_corp_id,defect_id],function(data){
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
						Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.insert',[type,old_corp_id,defect_id,1],function(data){
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
		top.sm = sm;
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
				},
				click : function(node) {
					if (node.attributes.target) {
						var key = node.attributes.target.target_id;
						clicked_target_id = key;
					} else {
						return false;
					}
				}
			}
		});
		Ext.zion.tree_type.loadTargetTree(function(tree) {
			targetTree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			loadMask.hide();
		},false,{"patrol":true});
		
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
		var print_button = new Ext.Button( {
			text : '打印',
			handler : function() {
				var selectedNode = targetTree.getSelectionModel().getSelectedNode();
				if(!selectedNode){
					Ext.Msg.alert('提示','请选择目标');
					return;
				}
				if (task_form.getForm().isValid() == false) {
					return false;
				}else{
					var start_time = Ext.getCmp("start_time").getValue();
					var end_time = Ext.getCmp("end_time").getValue();
					var task_memo = Ext.getCmp("task_memo").getValue();
					
					var target = targetTree.getSelectionModel().getSelectedNode().attributes.text;
					top.start_time = Ext.util.Format.date(start_time,'Y-m-d');
					top.end_time = Ext.util.Format.date(end_time,'Y-m-d');
					top.target = target;
					top.task_memo = task_memo;
					var print_content = "<iframe frameborder='0' id='print' style='width:100%;height:100%;' scrolling='auto' src='print.htm' ></iframe>";
					show_print(print_content);
				}
			}
		});
		var win = new Ext.Window( {
			height : 440,
			width:400,
			title : '未处理缺陷任务',
			closable : true,
			items : [ panel ],
			buttons : [ print_button,button, {
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
	//打印
	function show_print(print_content){
		var win = new Ext.Window( {
			height : document.body.clientHeight,
			autoHeight:false,
			width:document.body.clientWidth,
			title : '信息打印',
			autoScroll : true,
			closable : true,
			html:print_content,
			tbar:[{
				text : '打印',
				icon : Ext.zion.image_base+'/printer.png',
				handler : function() {
					var win = document.frames('print');  
					//frames[0].focus();  
					//frames[0].print(); 
					win.focus();
					win.print(); 
				}
			}],
			buttons : [ {
				text : '取消',
				handler : function() {
					win.close();
				}
			}]
		});
		win.show();
		/*var map = new GMap2(document.getElementById("map_canvas_print"), M_DEFAULT_MAP_OPTIONS);
		map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
		map_point(map,latitude,longitude,pdt_id);*/
	}


	function add_defect_task(win,targetTree,task_form){
		var sm = grid.getSelectionModel().getSelected();
     	var defect_id = sm.data.id;
     	var selectedNode = targetTree.getSelectionModel().getSelectedNode();
		if(!selectedNode){
			Ext.Msg.alert('提示','请选择目标');
			return;
		}
     	if (task_form.isValid() == false) {
			return false;
		}else{
			Ext.Msg.confirm('确认', '是否确认对目标生成任务？', function(btn) {
				if (btn == 'yes') {
					var start_time = parseInt(Ext.getCmp("start_time").getValue().getTime()/1000);
					var end_time = parseInt(Ext.getCmp("end_time").getValue().getTime()/1000)+3600*24-1;
					var task_memo = Ext.getCmp("task_memo").getValue();
					var target_ids = getCheckedTarget();
					var target_id = target_ids.pop();
					Zion.db.getJSON('pipe.management.data.defect_status.pipe_user_terminal.select',[target_id],function(data){
						if(data.r){
							if(data.r.length == 0){
								Ext.Msg.alert("提示","该目标没用绑定用户");
							}else{
								var user_id = data.r[0][0];
								Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_report.update',[2,defect_id],function(data){
			         				if(data.r){
			         					Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_process.insert',[type,task_memo,defect_id,1],function(data){
			         						if(data.r){
												var params = [defect_id,user_id,start_time,end_time,task_memo];
												Zion.db.getJSON('pipe.management.data.defect_status.pipe_defect_task.insert',params,function(data){
													if(data.r){
														Ext.Msg.alert('提示','任务绑定成功');
														disable_button();
														store.reload();
														win.close();
													}else{
														Ext.Msg.alert('提示','任务绑定失败');
														store.reload();
														disable_button();
														win.close();
													}
												});
											}else{
												Ext.Msg.alert('提示','任务绑定失败');
												disable_button();
												store.reload();
												win.close();
			         						}
			         					});
			         				}else{
			         					Ext.Msg.alert('提示','任务绑定失败');
			         					disable_button();
										store.reload();
										win.close();
			         				}
								});
							}
						}
					});
				}
			});
		}
	}
	
	function getCheckedTarget() {
		return [clicked_target_id];
		var checkedTargetMap = {};
		var checkedTarget = [];
		function checkedNode(node) {
			if (node.attributes.target) {
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
				disable_button();
			}
		}
	});
	
	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		user_name = Zion.user.user_name;
		top.user = user_name;
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