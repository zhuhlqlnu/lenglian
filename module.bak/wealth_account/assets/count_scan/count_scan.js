	Ext.onReady(function(){
		Ext.QuickTips.init();
		var limit = 20;
		var customer_form;
		var sex_combo;
		var position_combo;
		var customer_data = false;
//		var userInfo = Zion.user.getInfo();
		var user_id = '0';
		var corp_id = 1;
		var paramsA = [];
		paramsA.push(user_id);
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: "muchun.axiom_group.select",
			params:paramsA},
			root:"r",
			fields: [
			         'group_id', 'parent_id', 'group_name', 'enable', 'memo', 'order_by','create_id'
	        ]
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		var id = [];  //编号
		var grid = new Ext.grid.GridPanel({
			 title:'子集团列表',
	         store: store, 
	         sm:sm, 
	         columns: [     
			     sm, 
	             {header: "序号", dataIndex: 'group_id', sortable: true},  
	             {header: "组名称",  dataIndex: 'group_name', sortable: true},
	             {header: "是否生效", dataIndex: 'enable', sortable: true},
	             {header: "备注",  dataIndex: 'memo', sortable: true}
	         ],  
             renderTo:'group_grid', 
	         width:820,  
	         height:400,		
	         tbar:[{
						id:'addButton',
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'增加子组',					
						handler:newAddForm,
	                    scope:this
					},'-',//'-'给工具栏按钮之间添加'|'
					{
						id:'editButton',
						text:'修改',
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:updateForm,				
	                    scope:this
					},'-',
					{
						text:'删除',
						icon:Ext.zion.image_base+'/delete.gif',
						tooltip:'删除记录',
						handler: deleteForm,
						scope:this
					},'-',
					{
						text:'刷新',
						icon:Ext.zion.image_base+'/refresh.gif',
						tooltip:'刷新纪录',          
	                    handler: function(){grid.store.reload();},
	                   	scope:this
					},'-',
					{
						text:'设备组添加车辆',
						icon:Ext.zion.image_base+'/car_add.png',
						tooltip:'添加车辆',          
	                    handler: addCar,
	                   	scope:this
					}
					],
						//第二个toolbar
						listeners:{
			 				'render': function() {
								var tbar = new Ext.Toolbar({
									items:['请根据',{xtype: 'textfield',width:150,id:'term'},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif'}]
								})
							tbar.render(this.tbar);
								
							}
						},
			bbar:new Ext.PagingToolbar({
				store: store,
				pageSize: limit,
				displayInfo : true 
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			} 
 		}); 
		store.load({params:{params:paramsA,start:0,limit:limit}});	
		grid.addListener('rowdblclick',update_customer_data);
		function update_customer_data(grid, rowIndex, e ){
			customer_data = false;
			updateForm();
			
		}
		
		
		
//		================增加车辆===============
	var paramscar = [];
	paramscar.push(corp_id);
	var storeCar = new Ext.zion.db.ArrayStore({
			db:{
			alias: "muchun.axiom_target.select",
			params:paramscar
			},
			root:"r",
			fields: ['target_id', 'target_name', 'terminal_id', 'enable', 'corp_id' ]
		});
		var smR = new Ext.grid.CheckboxSelectionModel();
		
		
		 var gridCar = new Ext.grid.GridPanel({  
	         store: storeCar, 
	         sm:smR, 
	         columns: [  
			     //new Ext.grid.RowNumberer(),//获得行号	   
			     smR, 
	             {header: "车辆名字",  dataIndex: 'target_name', sortable: true},
	             {header: "终端id", dataIndex: 'terminal_id', sortable: true}

	         ],  
//             renderTo:'', 
	         width:320,  
	         height:400,		
   			bbar:new Ext.PagingToolbar({
				store: store,
				pageSize: limit,
				displayInfo : true 
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
			,
			listeners:{
			 				'beforeshow': function() {
			 				alert("GRIDPANEL:::BBBSHOW");
					//      store3.load();
							smR.selectRows([1,2],true);

							}
						}
 
 		}); 
		storeCar.load({params:{params:paramscar,start:0,limit:limit}});
//================车辆组窗口================		
		    var winCar = new Ext.Window({
//				xtype:'window',
				title: '车辆添加窗口',
				buttonAlign : 'right',
				closable:false,
				constrainHeader:true,  
				layout:'fit',
				modal: 'true', 
				width:340,
				height:450,
				items:[gridCar],
		        buttons: [{
		            text: '保存',
					handler:saveCar
		        },{
		            text: '取消',
					handler:function(){winCar.hide();}
		        }],
						listeners:{
			 				'show': function() {
			 				alert("show:::BBBSHOW");
					//      store3.load();
			 				
							smR.selectRows([1,2],true);

							}
						}
				})


//		====================权限操作====================================
			
//	winCar.on('expand', function() {
//		alert("show:::EXPANDDDDD::");
////             store3.load();
//		smR.selectRows([1,2],true);
//            gridCar.getSelectionModel().clearSelections();
//            gridCar.getSelectionModel().selectRows('1,2', true);
//            gridCar.doLayout();
//    });


//		============增加数据form================
		var formPanel=new Ext.form.FormPanel({
		    labelWidth: 75, // label settings here cascade unless overridden
	        frame:true,
	        bodyStyle:'padding:5px 5px 0',
	        defaults: {width: 230},
	        defaultType: 'textfield',
	        msgTarget: 'side',
	      
	        items: [{
//	            fieldLabel:'用户所在集团',
	            name:'create_id',
	            id:'create_id',
	            hidden:true,
	            allowBlank:false
	            
	            },{
	                fieldLabel: '分组名称',
	                name: 'group_name',
					id: 'group_name',
					allowBlank: false,
					blankText:'不能为空'
	            },{
	                fieldLabel: '是否生效',
	                name: 'enable',
					id: 'enable',
					allowBlank: false,
					blankText:'不能为空'
	            },{
	                fieldLabel: '备注',
	                name: 'memo',
					id: 'memo'
	            }]						 
			})
		
//----window表单----
			var win = new Ext.Window({
				xtype:'window',
				title: '设备分组信息',
				buttonAlign : 'right',
				closable:false,
				constrainHeader:true,  
				layout:'fit',
				modal: 'true', 
				width:400,
				height:300,
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:addForm
		        },{
		            text: '取消',
					handler:function(){formPanel.form.reset();win.hide();}
		        }]
			})

//=======================触发事件设置隐藏值========================			
			win.addListener('expand',function(p){
			alert("bSHOWWWW:::::");
			Ext.getCmp("parent_id").setValue(parent_id);
//			$("#parent_id").setVal(parent_id);
			});


//			===============增加信息表单方法===============
		function addForm(){
				Ext.getCmp("create_id").setValue(user_id);
			var create_idV = $("#create_id").val();
			var group_nameV = $("#group_name").val();
			var enableV = $("#enable").val();
			var memoV = $("#memo").val();
			var order_byV = 0;
//			User.getInfo();
			if(formPanel.getForm().isValid() == false){
				return false;
			}else{
				//修改操作
				alert("BOOLEAN::"+win.update);
				if(win.update){
					
					var sm = grid.getSelectionModel().getSelected();

					var params = [create_idV,group_nameV,enableV,memoV,order_byV];
					alert("修改数据测试"+params);
					Ext.zion.db.getJSON("muchun.axiom_corp.update", params, function(data){
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
				//增加操作
					var sm = grid.getSelectionModel().getSelected();
					var params = [parent_idV,corp_nameV,enableV,memoV,order_byV];
					alert("params::::"+params);
					Ext.zion.db.getJSON("muchun.axiom_corp.insert", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","成功");
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

//----------修改window表单---------
		function updateForm(){
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(sm_num<1){
				 Ext.Msg.alert("修改操作", "请选择要修改的项");  
			}else if(sm_num>1){
				 Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");  
			}else{
				win.show();
				win.update = true;
				formPanel.form.loadRecord(sm);
			}
		}
		
		// 删除客户信息
		var id = [];
		function deleteForm() {
			var sm = grid.getSelectionModel().getSelections();
			if (sm.length == 0) {
				Ext.Msg.alert("删除操作", "请选择要删除的项");
			} else {
				if (sm.length > 0) {
					Ext.Msg.confirm('删除确认', '你是否确认删除选中的记录？', function(btn) {
						if (btn == 'yes') {
							for ( var i = 0; i < sm.length; i += 1) {
								var member = sm[i].data;
								if (member) {
									id.push(member.id);
								} else {
									store.remove(store.getAt(i));
								}
							}
							if (id.length > 0) {
								deleNext();
							}
						}
					})
				}
			}
		}
		var deleNext = function() {
			if (id.length > 0) {
				Ext.zion.db.getJSON("customer_data.delete", [ id.pop() ], function(
						data) {
					if (data.r != 0 ||data.r != 'undefined') {
						Ext.Msg.alert("提示", "删除成功");
					} else {
						Ext.Msg.alert("提示", "删除失败");
					}
					deleNext();
				});
			} else {
				grid.store.reload();
			}
		}
		
		 show_more_win = function(){
			 var sm = grid.getSelectionModel().getSelected();
			 var id = sm.data.id;
			 var id_label = new Ext.form.Label({
				 fieldLabel : '编号',
					name : 'id'
			 })
		var show_introduction_form = new Ext.form.FormPanel({
				frame:true,
				bodyStyle:'padding:5px 5px 0',
				defaults: {width: 180},
				defaultType: 'textfield',
				items : [ {
					fieldLabel : '编号',
					readOnly:true,
					name : 'id'
				},{
					fieldLabel : '客户单位',
					readOnly:true,
					name : 'company'
				},{
					fieldLabel : '联系人',
					readOnly:true,
					name : 'contact'
				},{
					fieldLabel : '客户姓名',
					readOnly:true,
					name : 'name'
				},{
					fieldLabel : '客户职务',
					readOnly:true,
					name : 'position'
				},{
					fieldLabel : '固定电话',
					readOnly:true,
					name : 'telphone'
				} ]
			});
			var show_introduction_win = new Ext.Window( {
				xtype : 'window',
				title : '客户详细资料',
				buttonAlign : 'right',
				closable : true,
				resizable:false, 
				closeAction : 'close',
				layout : 'fit',
				modal : true,
				width : 350,
				height : 210,
				items : [show_introduction_form]
			})
			show_introduction_form.form.loadRecord(sm)
			show_introduction_win.show();
		}
		
		function newAddForm(){
			win.update = false;
			win.show();
		}
		
		function addCar(){
					var selectObj = grid.getSelectionModel();
					if(selectObj.getCount()!=1){
					Ext.Msg.alert("请选择一条记录操作！");
					return null;
					}
					winCar.show();
					
				}
		
	function saveCar(){
		alert("车辆添加");
		var selectObj = gridCar.getSelectionModel();
		var groupId = grid.getSelectionModel().getSelections()[0].data.group_id;
		var count = selectObj.getCount();
		if(count<1){
				Ext.Msg.alert("车辆没有添加");
				return null;
		}
		for(var i=0;i<count;i++){
			var role_module_str = groupId+','+selectObj.getSelections()[i].data.target_id;
			var params = [];
			params.push(groupId);
			params.push(selectObj.getSelections()[i].data.target_id);
			alert("R_ID++MO_ID:::::"+params);
					Ext.zion.db.getJSON("muchun.axiom_group_target.insert", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","修改成功");
							formPanel.form.reset();
							win.hide();
						 	grid.store.reload();	
						} else {
							Ext.Msg.alert("提示","数据修改错误");
						}
					});
			
			
		
		}
		}
		



		
		// grid自适应
		var view=new Ext.Viewport({  
			layout:'border',  
			//renderTo:'topic-grid',  
			border:false,  
			items:[{  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  
		});	 
	})