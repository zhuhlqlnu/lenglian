	Ext.onReady(function(){
		Ext.QuickTips.init();
		var fields = ['id', 'type','details_info', 'memo', "work_com", "net_type"];
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: "muchun.store_tariff_list.select"},
			root:"r",
			fields: fields
		});
		
		var select_data = [["muchun.store_tariff_list.select",'所有'],["muchun.store_tariff_list.query.type",'资费类型']];
		var selelct_store =  new Ext.data.SimpleStore( {
			fields : [ 'type', 'name' ],
			data : select_data
		});
		var select_combo = new Ext.form.ComboBox( {
			hiddenName : 'type',
			valueField : 'type',
			store : selelct_store,
			displayField : 'name',
			mode : 'local',
			editable : false,
			triggerAction : 'all',
			anchor : '95%',
			listeners : {
				'select' : function (index){
					var objv = this.getValue();
					if(objv=="muchun.store_tariff_list.select"){
						Ext.getCmp('term').setValue('');
						Ext.getCmp('term').disable();
					}else{
						Ext.getCmp('term').enable();
					}
				}
			}
		});
		select_combo.setValue(select_data[0][0]);
		
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
		})
		
		var id = [];  
		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [  
			     sm, 
	             {header: "序号", dataIndex: 'id', sortable: true},  
	             {header: "运营商",  dataIndex: 'work_com', sortable: true},
	             {header: "网络类型",  dataIndex: 'net_type', sortable: true,renderer:function(strV){
	             	var returnStr = '';
	             	if(strV==1){
	             		returnStr = 'GPRS';
	             	}else if(strV==2){
	             		returnStr = 'CDMA';
	             	}else if(strV==3){
	             		returnStr = '3GEVDO';
	             	}else if(strV==4){
	             		returnStr = 'TDSCDMA';
	             	}else if(strV==5){
	             		returnStr = 'WCDMA';
	             	}
	             	return returnStr;
	             }},
	             {header: "资费详细说明",  dataIndex: 'details_info', sortable: true},
	             {header: "备注", dataIndex: 'memo', sortable: true}
	         ],  		
	         tbar:[{
						id:'addButton',
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:newAddForm,
	                    scope:this
					},'-',
					{
						id:'editButton',
						text:'修改',
						disabled:true,
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:updateForm,				
	                    scope:this
					},'-',
					{
						text:'删除',
						id : 'deleteButton',
						disabled:true,
						icon:Ext.zion.image_base+'/delete.gif',
						tooltip:'删除记录',
						 handler: deleteForm,
						scope:this
					},'-',
					{
						text:'刷新',
						icon:Ext.zion.image_base+'/refresh.gif',
						tooltip:'刷新纪录',          
	                   	handler: function(){
							grid.store.reload();
							Ext.getCmp('editButton').disable();
							Ext.getCmp('deleteButton').disable();
						},
	                   	scope:this
					}
					],
					// 第二个toolbar
					listeners:{
		 				'render': function() {
							var tbar = new Ext.Toolbar({
								items:['请根据',select_combo, {
									xtype : 'textfield',
									width : 150,
									name:'term',
									id : 'term',
									disabled:true
								},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
							})
						tbar.render(this.tbar);				
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
		store.load({params:{start:0,limit:Ext.zion.page.limit}});	
		// ///////////////////////////////////////////////////////////////////////////////////
		// ----------form表单---------
		var net_type_store = new Ext.data.SimpleStore({
			fields : ['net_type','net_type_show'],
			data : [['1','GPRS'],['2','CDMA'],['3','3GEVDO'],['4','TDSCDMA'],['5','WCDMA']]
		});
		
		var net_type_combo = new Ext.form.ComboBox( {
			fieldLabel : '网络类型',
			valueField : 'net_type',
			hiddenName : 'net_type',
			displayField : 'net_type_show',
			store : net_type_store,
			editable : false,
			allowBlank : false,
			blankText : '不能为空',
			mode : 'local',
			triggerAction : 'all',
			emptyText : '请选择...'
		})
		
		var formPanel=new Ext.form.FormPanel({
	        defaultType: 'textfield',
	        items : [{
					fieldLabel : '运营商',
					name : 'work_com',
					allowBlank: false,
					blankText:'不能为空'
				},net_type_combo,{
					fieldLabel : '资费说明',
					name : 'details_info',
					allowBlank: false,
					blankText:'不能为空'
				},{
					fieldLabel : '备注',
					name : 'memo'
				},{
					name : 'id',
					hidden : true,
					hideLabel : true
				}
			]
		})
		// ----window表单----
			var win = new Ext.Window({
				title: '资费套餐管理',
				closeAction:'close',
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:addForm
		        },{
		            text: '取消',
					handler:function(){formPanel.form.reset();win.hide();}
		        }]
			})
		
		function addForm(){
//			var details_info = formPanel.getForm().findField("details_info").getValue();
//			var memo= formPanel.getForm().findField("memo").getValue();
			if(formPanel.getForm().isValid() == false){
				return false;
			}else{
				// 修改操作
				if(win.update){
//					var sm = grid.getSelectionModel().getSelected();
//					var id = sm.data.id;
//					var params = [details_info,memo,id];
					var params = Ext.zion.form.getParams(formPanel.form,['details_info','memo','work_com','net_type','id']);
					Ext.zion.db.getJSON("muchun.store_tariff_list.update", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","修改成功");
							formPanel.form.reset();
							win.hide();
						 	grid.store.reload();	
						} else {
							Ext.Msg.alert("提示","数据修改错误");
						}
					});
					
				}else{
				// 增加操作
					var params = Ext.zion.form.getParams(formPanel.form,['details_info','memo','work_com','net_type' ]);
					Ext.zion.db.getJSON("muchun.store_tariff_list.insert", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","添加成功");
							formPanel.form.reset();
							win.hide();
						 	grid.store.reload();	
						} else {
							Ext.Msg.alert("提示","数据添加错误");
						}
					});
				}
			}
		}
		// ----------修改window表单---------
		function updateForm(){
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(!sm){
				 Ext.Msg.alert("修改操作", "请选择要修改的项");  
			}else if(sm_num>1){
				 Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");  
			}else{
				win.show();
				win.update = true;
				formPanel.form.loadRecord(sm);
			}
		}
		// 查询form
		function selectForm(){
			var type = select_combo.getValue();
			var term = $('#term').val();
			var paramsA;
			if (!Ext.getCmp('term').disabled) {
				paramsA = [ term ];
			}
			grid.store.constructor( {
				db : {
					params : paramsA,
					alias : type
				},
				root : "r",
				fields : fields
			});
			grid.store.load( {
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			})
		}

		// 删除 form
		function deleteForm(){
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
				                     id.push(member.id);
				                 }else{  
				                     store.remove(store.getAt(i));  
				                 }  
				             }  
							if(id.length>0){
								deleNext();
							}
						}
					})
				}
			}
		}
		var deleNext = function(){
			if(id.length > 0){
				Ext.zion.db.getJSON("muchun.store_tariff_list.delete", [id.pop()], function(data){
					if(data.r != 0 ){
						Ext.Msg.alert("提示","删除成功");			
					}else{
						Ext.Msg.alert("提示","删除失败");
					}
					deleNext();
				});
			}else{
				grid.store.reload();
			}
		}
		
		function newAddForm(){
			win.update = false;
			win.show();
		}
		grid.addListener('rowdblclick',updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e ){
			updateForm();
		}
		var view=new Ext.Viewport({  
			layout:'border',    
			border:false,  
			items:[{  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  
		});	 
	})