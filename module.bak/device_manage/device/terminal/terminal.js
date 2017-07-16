	Ext.onReady(function(){
		Ext.QuickTips.init();
		var formPanel;
		var terminal_add = false;
		var old_id;
		var selectCorpId;
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中，请稍后 ..."
		});
		loadMask.show();
		// 终端
		
		var store = new Ext.zion.db.ArrayStore({
			db:{
				alias: "axiom_terminal.select"
			},
			root:"r",
			fields : [ 'terminal_id', 'terminal_sn', 'imsi_id','imsi_address', 'terminal_type_id',
					'terminal_type_name','corp_id', 'reg_user_id', 'reg_time', 'memo', 'enable','target_id' ]
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		sm.on('rowselect', function() {
			if (grid.selModel.getSelections().length == 1) {
				Ext.getCmp('editButton').enable();
			} else {
				Ext.getCmp('editButton').disable();
			}
			if (grid.selModel.getSelections().length != 0) {
				Ext.getCmp('deleteButton').enable();
			} else {
				Ext.getCmp('deleteButton').disable();
			}
			if (grid.selModel.getSelections().length !=0) {
				Ext.getCmp('relegateButton').enable();
			} else {
				Ext.getCmp('relegateButton').disable();
			}
		})
		sm.on('rowdeselect', function() {
			if (grid.selModel.getSelections().length == 1) {
				Ext.getCmp('editButton').enable();
			} else {
				Ext.getCmp('editButton').disable();
			}
			if (grid.selModel.getSelections().length !=0) {
				Ext.getCmp('deleteButton').enable();
			} else {
				Ext.getCmp('deleteButton').disable();
			}
			if (grid.selModel.getSelections().length !=0) {
				Ext.getCmp('relegateButton').enable();
			} else {
				Ext.getCmp('relegateButton').disable();
			}
		})
		var id = [];  //编号
		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [  
			     sm, 
			     {header: "序号", dataIndex: 'terminal_id', width:50, sortable: true},  
	             {header: "终端编号", dataIndex: 'terminal_sn', width:50, sortable: true},  
	             {header: "通讯卡地址", dataIndex: 'imsi_address', width:50, sortable: true},  
	             {header: "终端类型", dataIndex: 'terminal_type_name', width:50, sortable: true},
	             {header: "注册时间", dataIndex: 'reg_time', width:50, sortable: true},
	             {header: "备注", dataIndex: 'memo', width:50, sortable: true},
	             {header: "是否生效", dataIndex: 'enable', width:50, sortable: true,renderer:function(enable){
	            	 return enable==0?"不生效":"生效";
	             }}
	         ],  
	         tbar:[{
						id:'addButton',
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:function(){
	        	 			terminal_add = true;
	        	 			win_show();
	        	 		},
	                    scope:this
					},
					{
						id:'editButton',
						text:'修改',
						disabled:true,
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:function(){
							update_form();
						},				
	                    scope:this
					},
					{
						text:'删除',
						id:'deleteButton',
						disabled:true,
						icon:Ext.zion.image_base+'/delete.gif',
						tooltip:'删除记录',
						 handler: function(){
							grid.store.reload();
							delete_imsi();
						},
						scope:this
					},{
						id : 'relegateButton',
						text : '迁移',
						disabled : true,
						icon : Ext.zion.image_base + '/relegate.gif',
						tooltip : '迁移纪录',
						handler : function() {
							var terminals = [];
							var sm = grid.getSelectionModel().getSelections();
							for ( var i = 0; i < sm.length; i += 1) {
								terminals.push(sm[i].data.terminal_id);
							}
							relegateTerminal(terminals, function() {
								grid.store.reload();
								disableButton();
							});
						},
						scope : this
					},
					{
						text:'刷新',
						icon:Ext.zion.image_base+'/refresh.gif',
						tooltip:'刷新纪录',          
	                   	handler: function(){
							grid.store.reload();
							disableButton();
	                   	},
	                   	scope:this
					}
				],
				// 第二个toolbar
				listeners:{
	 				'render': function() {
						var tbar = new Ext.Toolbar({
							items:['请根据',{xtype: 'textfield',width:150,id:'term'},{text:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
						})
					//tbar.render(this.tbar);
						
					}
				},
			bbar:new Ext.PagingToolbar({
				store: store,
				pageSize: Ext.zion.page.limit,
				displayInfo : true 
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			} 
 		}); 
		
		// 双击列事件
		grid.addListener('rowdblclick',updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e ){
			update_form();
			
		}
		//按钮不可用
		function disableButton(){
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}

		// ///////////////////////////////////////////////////////////////////////////////////
		// ----------gird-form表单---------
		// ///////////////////////////////////////////////////////////////////////////////////
		function win_show(old_imsi,old_terminal_type){
			var imsi_store = new Ext.data.SimpleStore( {
				root : 'r',
				fields : [ {
					name : 'imsi_id'
				}, {
					name : 'address'
				} ],
				proxy : new Ext.data.ScriptTagProxy( {
					url : ZionSetting.db.url + '/' + Zion.token
							+ '/axiom_ismi_name.select/['+selectCorpId+']'
				})
			});
			imsi_combo = new Ext.form.ComboBox( {
				fieldLabel : '通讯卡',
				valueField : 'imsi_id',
				store : imsi_store,
				hiddenName: 'imsi_id',
				displayField : 'address',
				editable : false,
				allowBlank: true,
//				blankText:'不能为空',
				triggerAction : 'all',
				emptyText : '请选择通讯卡...'
			});
			if(old_imsi){
				imsi_store.loadData({'r':[[old_imsi[0],old_imsi[1]]]});
			}
			var terminal_type_store = new Ext.data.SimpleStore( {
				root : 'r',
				fields : [ {
					name : 'terminal_type_id'
				}, {
					name : 'name'
				} ],
				proxy : new Ext.data.ScriptTagProxy( {
					url : ZionSetting.db.url + '/' + Zion.token
							+ '/terminal_type.select'
				})
			});
			terminal_type_combo = new Ext.form.ComboBox( {
				fieldLabel : '终端类型',
				valueField : 'terminal_type_id',
				store : terminal_type_store,
				hiddenName: 'terminal_type_id',
				displayField : 'name',
				editable : false,
				allowBlank: false,
				blankText:'不能为空',
				triggerAction : 'all',
				emptyText : '请选择终端类型...'
			});
			if(old_terminal_type){
				terminal_type_store.loadData({'r':[[old_terminal_type[0],old_terminal_type[1]]]});
			}
			formPanel=new Ext.form.FormPanel({
		        defaultType: 'textfield',
		        items: [{
	                fieldLabel: '终端序列号',
	                name: 'terminal_sn',
					allowBlank: false,
					blankText:'不能为空'
	            },terminal_type_combo,imsi_combo,{
	            	fieldLabel: '备注',
	            	xtype:'textarea',
	                name: 'memo' 	
	            },{
					xtype : "radiogroup",
					layout : "column",
					fieldLabel : '是否生效',
					isFormField : true,
					anchor : '90%',
					items : [{
						columnWidth : .5,
						checked : true,
						xtype : "radio",
						boxLabel : "生效",
						name : "enable",
						inputValue : 1
					}, {
						columnWidth : .5,
						xtype : "radio",
						boxLabel : "不生效",
						name : "enable",
						inputValue : 0
					}]
				},{
	            	fieldLabel: 'ID',
	                name: 'terminal_id',
	                hideLabel:true,
	                hidden:true	
	            }]						 
			})
			// ----window表单----
			
			var win = new Ext.Window({
				title: '终端管理',
				closable:true,
				width:380,
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:function(){
		        		if(terminal_add==true){	
		        			add_terminal(formPanel.getForm(),win);
		        		}else{
		        			update_termital(formPanel.getForm(),win);
		        		}
		        	}
		        },{
		            text: '取消',
					handler:function(){win.close();}
		        }]
			});
			win.show();
		}
	
		// ----------gird操作---------

		function add_terminal(formPanel,win){
			if(formPanel.isValid() == false){
				return false;
			}
			// 增加操作
			Ext.zion.db.getJSON("axiom_seq_terminal_id.select", null,function(data) {
				if (!data.f) {
				
					var terminal_id = data.r[0][0];
					var params = Ext.zion.form.getParams(formPanel,['terminal_sn','terminal_type_id','memo','enable','imsi_id']);
					params.unshift(selectCorpId);
					params.unshift(terminal_id);
					var imsi_params = Ext.zion.form.getParams(formPanel,['imsi_id']);
					if(""==imsi_params[0]||null==imsi_params[0]){
	         			Ext.zion.db.getJSON("axiom_terminal.insert", params,function(data) {
	         				if (data.r == 1) {
	         					Ext.Msg.alert("提示","数据添加成功");
	         					win.close();
	         				 	grid.store.reload();	
	         				 	disableButton();
	         				} else {
	         					Ext.Msg.alert("提示","数据添加错误");
	         				}
	         			});	
							
						
					}else{
						imsi_params.unshift(terminal_id);
	         			Ext.zion.db.getJSON("axiom_terminal.insert", params,function(data) {
	         				if (data.r == 1) {
	         					Ext.zion.db.getJSON("device.terminal.imsi_address_terminal.update", imsi_params,function(data) {
	         						if(data.r==1){
	         							Ext.Msg.alert("提示","数据添加成功");
			         					win.close();
			         				 	grid.store.reload();	
			         				 	disableButton();
	         						}else{
	         						}
	         					})
	         				} else {
	         					Ext.Msg.alert("提示","数据添加错误");
	         				}
	         			});	
							
					}
				}
			});	
			
		}
		//修改操作
		function update_termital(formPanel, win) {
			if (formPanel.isValid() == false) {
				return false;
			}
			var params= Ext.zion.form.getParams(formPanel,['terminal_sn','terminal_type_id','memo','enable','imsi_id','terminal_id'])
			var imsi_params = Ext.zion.form.getParams(formPanel, ['terminal_id','imsi_id']);
			if(old_id){
				var old_imsi_params = ['',old_id];
				Ext.zion.db.getJSON("axiom_terminal.update", params, function(data) {
					if (!data.f) {
						Ext.zion.db.getJSON("device.terminal.axiom_imsi_address.update", old_imsi_params, function(data) {
							if(!data.f){
								Ext.zion.db.getJSON("device.terminal.axiom_imsi_address.update", imsi_params, function(data) {
									if (!data.f) {
										Ext.Msg.alert("提示", "数据修改成功");
										win.close();
									 	grid.store.reload();	
									 	disableButton();
									}else{
										Ext.Msg.alert("提示","数据修改错误3");
									}
								})
							}else{
								Ext.Msg.alert("提示","数据修改错误2");
							}
						})
					}else {
						Ext.Msg.alert("提示","数据修改错误1");
					}
				});
				
			}else if(imsi_params[1]){
				Ext.zion.db.getJSON("axiom_terminal.update", params, function(data) {
					if (!data.f) {
								Ext.zion.db.getJSON("device.terminal.axiom_imsi_address.update", imsi_params, function(data) {
									if (!data.f) {
										Ext.Msg.alert("提示", "数据修改成功");
										win.close();
									 	grid.store.reload();	
									 	disableButton();
									}else{
										Ext.Msg.alert("提示","数据修改错误");
									}
								})
					}else {
						Ext.Msg.alert("提示","数据修改错误1");
					}
				});
				
			}else{
				Ext.zion.db.getJSON("axiom_terminal.update", params, function(data) {
					if (!data.f) {
						Ext.Msg.alert("提示", "数据修改成功");
						win.close();
					 	grid.store.reload();	
					 	disableButton();
					}else {
						Ext.Msg.alert("提示","数据修改错误1");
					}
				});
								
			}
		}
		// ----------修改window表单---------
		function update_form(){
			terminal_add = false;
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(!sm){
				 Ext.Msg.alert("修改操作", "请选择要修改的项");  
			}else if(sm_num>1){
				 Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");  
			}else{
				var old_imsi = [];
				var old_terminal_type = [];
				old_id = sm.data.imsi_id;
				old_imsi.push(sm.data.imsi_id);
				old_imsi.push(sm.data.imsi_address);
				old_terminal_type.push(sm.data.terminal_type_id);
				old_terminal_type.push(sm.data.terminal_type_name);
				win_show(old_imsi,old_terminal_type);
				formPanel.form.loadRecord(sm);
			}
		}
		// 查询form
		function selectForm(){
			var unit = combox.getValue();
			var term = $('#term').val();
			store.filter(unit, term,true,false);		
		}

		// 删除 form
		function delete_imsi(){
			var sm = grid.getSelectionModel().getSelections();
			var imsi_id_p = [];
			id = [];
			if(sm.length == 0){
				Ext.Msg.alert("删除操作", "请选择要删除的项");  
			}else if(grid.getSelectionModel().getSelected().data.target_id){
				Ext.Msg.alert("删除操作", "车台正在使用，不能删除");  
			}else{
				if(sm.length>0){
					Ext.Msg.confirm('删除确认','你是否确认删除选中的记录？',function(btn){
						if (btn == 'yes') {
						 	for(var i=0;i<sm.length;i+=1){  
				                 var member = sm[i].data; 
				                 if(member) { 
				                 	imsi_id_p.push(member.imsi_id);
				                     id.push(member.terminal_id);
				                 }else{  
				                     store.remove(store.getAt(i));  
				                 }  
				             }  
							if(id.length>0){
								deleNext(imsi_id_p);
							}
						}
					})
				}
			}
		}
		var deleNext = function(imsi_id_p){
			if(id.length > 0){
				Ext.zion.db.getJSON("axiom_terminal.delete", [id.pop()], function(data){
					if(data.r != 0 ){
						Ext.zion.db.getJSON("device.terminal.imsi_address_terminal.update", ['',imsi_id_p.pop()],function(data) {
     						if(data.r==1){
     							Ext.Msg.alert("提示","删除成功");
     							disableButton();
     						}else{
     							
     						}
     					})				
					}else{
						Ext.Msg.alert("提示","删除失败");
					}
					deleNext(imsi_id_p);
				});
			}else{
				grid.store.reload();
				disableButton();
			}
		}
		
		function relegateTerminal(terminals, callback, scope) {
			loadMask.show();
			Ext.zion.tree.loadCorpTree(function(tree) {
				var relegateToCorp;
				var corp_tree = new Ext.tree.TreePanel( {
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

				function relegateTerminalToCorp(terminals, corp, callback, scope) {
					function doNext() {
						if (terminals.length > 0) {
							var terminal_id  = terminals.pop();
							Zion.db.getJSON("device_manage.device.terminal.reletage.target_terminal.select",[terminal_id],function(data){
								if(!data.f){
									if(data.r!=""){
										var target_id = data.r[0][0];
										Ext.zion.db.getJSON("device_manage.device.target.reletage", [ corp,target_id], function(data) {
											doNext();
										});
									}else{
										Ext.zion.db.getJSON("device_manage.device.terminal.reletage", [ corp,terminal_id], function(data) {
											doNext();
										});
									}
								}else{
									
								}
							})
						} else {
							if (callback) {
								callback.call(scope || window);
							}
						}
					}
					doNext();
				}

				var button = new Ext.Button( {
					disabled : true,
					text : '保存',
					handler : function() {
						Ext.Msg.confirm('迁移确认', '将同时迁移终端和通讯卡,你是否确认迁移选中的记录?', function(btn) {
							if (btn == 'yes') {
								loadMask.show();
								relegateTerminalToCorp(terminals, relegateToCorp, function() {
									win.close();
									if (callback) {
										loadMask.hide();
										callback.call(scope || window);
									}
								});
							}
						}, scope);
					}
				});

				var win = new Ext.Window( {
					title : '终端迁移',
					width:380,
					closable : true,
					items : [ corp_tree ],
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
		
		var tree = new Ext.tree.TreePanel( {
			title : '集团列表',
			id : 'tree_id',
			autoScroll : true,
			collapsible : true,
			split : true,
			region : 'west',
			width : 200,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				click : function(node) {
					disableButton();
					selectCorpId = node.attributes.corp.corp_id;
					store.constructor( {
						db : {
							alias : "axiom_terminal.select",
							params : [ selectCorpId ]
						},
						root : "r",
						fields : [ 'terminal_id', 'terminal_sn', 'imsi_id','imsi_address', 'terminal_type_id',
								'terminal_type_name','corp_id', 'reg_user_id', 'reg_time', 'memo', 'enable','target_id'  ]
					});
					store.load( {
						params : {
							start : 0,
							limit : Ext.zion.page.limit
						}
					});

				}
			}
		});
		
		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			Ext.zion.tree.loadCorpTree(function(corpTree) {
				tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
				tree.getRootNode().childNodes[0].select();
				loadMask.hide();
			});
			store.constructor( {
				db : {
					alias : "axiom_terminal.select",
					params : [ Zion.user.corp_id ]
				},
				root : "r",
				fields :[ 'terminal_id', 'terminal_sn', 'imsi_id','imsi_address', 'terminal_type_id',
							'terminal_type_name','corp_id', 'reg_user_id', 'reg_time', 'memo', 'enable','target_id'  ]
			});
			store.load({params:{start:0,limit:Ext.zion.page.limit}});
		});
		
	// grid自适应
		var view=new Ext.Viewport({  
			layout:'border',  
			border:false,  
			items:[tree,{  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  
		});	 
	})