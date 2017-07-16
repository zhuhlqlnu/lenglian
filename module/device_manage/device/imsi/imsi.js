	Ext.onReady(function(){
		Ext.QuickTips.init();
		var id = [];  //编号
		var formPanel;
		var supplier_combo;
		var supplier_name_data = {};
		var imsi_add = false;
		// 货品档案
		var selectCorpId ;
		var store_sql = "axiom_imsi.select"; 
		var fields = [ 'imsi_id', 'address', 'corp_id','terminal_id','enable', 'memo' ]; 
		var loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : "加载中，请稍后 ..."
		});
		loadMask.show();
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: store_sql,
			params : [selectCorpId]},
			root:"r",
			fields: fields 
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [  
			     sm, 
			     {header: "序号", dataIndex: 'imsi_id', width:50, sortable: true},  
	             {header: "通讯地址", dataIndex: 'address', width:50, sortable: true},  
//	             {header: "所属集团编号", dataIndex: 'corp_id', width:50, sortable: true},  
	             {header: "是否生效", dataIndex: 'enable', width:50, sortable: true,renderer:function(str){
	             	var re_str = '';
	             	if(1==str){
	             		re_str = '生效';
	             	}else{
	             		re_str = '不生效';
	             	}
	             	return re_str;
	             
	             }},
	             {header: "备注", dataIndex: 'memo', width:50, sortable: true}
	         ],  
	         tbar:[{
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:function(){
	        	 			imsi_add = true;
	        	 			win_show();
	        	 		},
	                    scope:this
					},
					{
						id : 'editButton',
						disabled : true,
						text:'修改',
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:function(){
							update_goods();
						},				
	                    scope:this
					},
					{
						id : 'deleteButton',
						disabled : true,
						text:'删除',
						icon:Ext.zion.image_base+'/delete.gif',
						tooltip:'删除记录',
						 handler: delete_imsi,
						scope:this
					},
					 {
					id : 'relegateButton',
					text : '迁移',
					disabled : true,
					icon : Ext.zion.image_base + '/relegate.gif',
					tooltip : '迁移纪录',
					handler : function() {
						var imsis = [];
						var sm = grid.getSelectionModel().getSelections();
						for ( var i = 0; i < sm.length; i += 1) {
							imsis.push(sm[i].data.imsi_id);
						}
						relegateImsi(imsis, function() {
							grid.store.reload();
							disableButton();
						});
					},
					scope : this
				},{
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
		//store.load({params:{start:0,limit:Ext.zion.page.limit}});	
		
//==============grid 选中事件==================		
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
		
	function relegateImsi(imsis, callback, scope) {
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

			function relegateImsiToCorp(imsis, corp, callback, scope) {
				function doNext() {
					if (imsis.length > 0) {
						var imsi_id  = imsis.pop();
						Zion.db.getJSON("device_manage.device.imsi.reletage.target_terminal_imsi.select",[imsi_id],function(data){
							if(!data.f){
								if(data.r!=""){
									var target_id = data.r[0][0];
									Ext.zion.db.getJSON("device_manage.device.target.reletage", [ corp,target_id], function(data) {
										doNext();
									});
								}else{
									Zion.db.getJSON('device_manage.device.imsi.reletage.terminal.select',[imsi_id],function(data){
										if(!data.f){
											if(data.r != ""){
												Ext.zion.db.getJSON("device_manage.device.terminal_imsi.reletage", [ corp,imsi_id], function(data) {
													doNext();
												});
											}else{
												Ext.zion.db.getJSON("device_manage.device.imsi.reletage.imsi", [ corp,imsi_id], function(data) {
													doNext();
												});
											}
										}else{
										
										}
									})
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
				width:380,
				text : '保存',
				handler : function() {
					Ext.Msg.confirm('迁移确认', '将同时迁移终端和通讯卡,你是否确认迁移选中的记录?', function(btn) {
						if (btn == 'yes') {
							loadMask.show();
							relegateImsiToCorp(imsis, relegateToCorp, function() {
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
				title : '通讯卡迁移',
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
		// 双击列事件
	grid.addListener('rowdblclick',updateGridRowClick);
	function updateGridRowClick(grid, rowIndex, e ){
		update_goods();
		
	}

	// ///////////////////////////////////////////////////////////////////////////////////
	// ----------gird-form表单---------
	// ///////////////////////////////////////////////////////////////////////////////////
	// 单位类型
	function win_show(){
		formPanel=new Ext.form.FormPanel({
			defaultType: 'textfield',
			items: [{
				fieldLabel: '通讯地址',
				name: 'address',
				allowBlank: false,
				blankText:'不能为空'
			},{
				xtype : "radiogroup",
				fieldLabel : '是否生效',
				isFormField : true,
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
				fieldLabel: '备注',
				xtype:'textarea',
				name: 'memo'
			},{
				fieldLabel: '通讯卡编号',
				name: 'imsi_id',
				hideLabel:true,
				hidden:true
			},{
				fieldLabel: '所属集团编号',
				name: 'corp_id',
				value : selectCorpId,
				hideLabel:true,
				hidden : true
			}]						 
		})
		// ----window表单----
		
		var win = new Ext.Window({
			title: '通讯卡管理',
			width:380,
			closable:true,
			items:[formPanel],
			buttons: [{
				text: '保存',
				handler:function(){
					if(imsi_add==true){
						add_imsi(formPanel.getForm(),win);
					}else{
						update_imsi(formPanel.getForm(),win);
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
	function add_imsi(formPanel,win){
		if(formPanel.isValid() == false){
			return false;
		}
		var address_all;
		var address = formPanel.findField('address').getValue();
		// 增加操作
		Ext.zion.db.getJSON('axiom_imsi.all_imsi_address.select',[address.replace(/(^\s*)|(\s*$)/g,"")],function(data){
			if(!data.f){
				if(data.r == 1){
					Ext.Msg.alert("提示","有相同通讯地址，请改正");
				}else{
					var params = Ext.zion.form.getParams(formPanel,['address', 'corp_id', 'enable', 'memo']);
					Ext.zion.db.getJSON("axiom_imsi.insert", params, function(data){
						if ( data.r && data.r!=0 ){
							Ext.Msg.alert("提示","添加成功");
							win.close();
							grid.store.reload();	
						} else {
							Ext.Msg.alert("提示","数据添加错误");
						}
					});	
				}
			}
		})
	}
	//修改操作
	function update_imsi(formPanel,win){
		if(formPanel.isValid() == false){
			return false;
		}
		var address = formPanel.findField('address').getValue();
		var imsi_id = formPanel.findField('imsi_id').getValue();
		Ext.zion.db.getJSON('axiom_imsi.other_imsi_address.select',[address,imsi_id],function(data){
			if(!data.f){
				if(data.r == 1){
					Ext.Msg.alert("提示","与其他通讯地址冲突，请改正");
				}else{
					var params = Ext.zion.form.getParams(formPanel,['address','enable' ,'memo','imsi_id']);
					Ext.zion.db.getJSON("axiom_imsi.update", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","修改成功");
							win.close();
							grid.store.reload();
							disableButton();
						} else {
							Ext.Msg.alert("提示","数据修改错误");
						}
					});
				}
			}
		})
	}
	// ----------修改window表单---------
	function update_goods(){
		imsi_add = false;
		var sm = grid.getSelectionModel().getSelected();
		win_show();
		formPanel.form.loadRecord(sm);
	}

	// 删除 form
	function delete_imsi(){
		var sm = grid.getSelectionModel().getSelections();
		if(sm.length == 0){
			Ext.Msg.alert("删除操作", "请选择要删除的项");  
		}else{
			if(sm.length>0){
				Ext.Msg.confirm('删除确认','你是否确认删除选中的记录？',function(btn){
					if (btn == 'yes') {
						for(var i=0;i<sm.length;i+=1){  
							 var member = sm[i].data; 
							 if(member) {  
								 if( null!=member.terminal_id){
									Ext.Msg.alert("警告","通讯卡被使用！不能被删除");
									disableButton();
									return ;
								 }
								 id.push(member.imsi_id);
							 }else{  
								 store.remove(store.getAt(i));  
							 }  
						 }  
						if(id.length>0){
							deleNext();
						}
					}else{
						disableButton();
					}
				})
			}
		}
	}
	var deleNext = function(){
		if(id.length > 0){
			Ext.zion.db.getJSON("axiom_imsi.delete", [id.pop()], function(data){
				if(data.r != 0 ){
					Ext.Msg.alert("提示","删除成功");			
				}else{
					Ext.Msg.alert("提示","删除失败");
				}
				deleNext();
			});
		}else{
			grid.store.reload();
			disableButton();
		}
	}

	// =========显示树和grid列表================

	var corp_tree = new Ext.tree.TreePanel( {
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

			}
		}
	});

	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
//		Ext.getCmp('relegateButton').disable();
	}


	// grid自适应
	new Ext.Viewport({  
		layout:'border',  
		border:false,  
		items:[ corp_tree,{  
			region:'center',  
			layout:'fit',  
			items:[grid]  
		}]  
	});	 

	Zion.user.getInfo(function() {
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
			loadMask.hide();
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
	});
})