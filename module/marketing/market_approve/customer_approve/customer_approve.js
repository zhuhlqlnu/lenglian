	Ext.onReady(function(){
		Ext.QuickTips.init();
		var id = [];  //编号
		var approve_radio;
		var customer_form;
		var sex_combo;
		var position_combo;
		var customer_data = false;
		var sql_array = [];
		var params_search ;
		var fields;
		fields = [  'id', 'company', 'contact', 'name', 'sex', 'political', 'position',
					'telphone', 'mobile', 'other_tel', 'qq', 'address', 'address_company',
					'favorite', 'family_mumber', 'family_condition','approve','memo' ];
		sql_array.push("marketing.approve.customer_data_approve");
		sql_array.push('marketing.approve.customer_data_approve_com');
		sql_array.push('marketing.approve.customer_data_approve_name');
		sql_array.push('marketing.approve.customer_data_approve_pos');
		var query_data = [[sql_array[0],'全部'],[sql_array[1],'客户单位'],[sql_array[2],'客户姓名'],[sql_array[3],'客户职务']];
		var query_store = new Ext.data.SimpleStore({
					fields : ['sql_str', 'sql_name'],
					data : query_data
				});
		var select_combo = new Ext.form.ComboBox({
					hiddenName : 'sql_str',
					valueField : 'sql_str',
					store : query_store,
					displayField : 'sql_name',
					emptyText : '--列表条件--',
					mode : 'local',
					editable : false,
					triggerAction : 'all'
				});
		select_combo.setValue(sql_array[0]);
		select_combo.on('select',function(combo,record,index){
			if(combo.getValue()==sql_array[0]){
				Ext.getCmp('term').disable();
				Ext.getCmp('term').setValue('');
			}else{
				Ext.getCmp('term').enable();
			}
		
		},this);
//====================查询导出=============		
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: sql_array[0]},
			root:"r",
			fields: fields
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [     
			     sm, 
	             {header: "序号", dataIndex: 'id', sortable: true},  
	             {header: "客户单位",  dataIndex: 'company', sortable: true},
	             {header: "联系人", dataIndex: 'contact', sortable: true},  
	             {header: "客户姓名",  dataIndex: 'name', sortable: true},
	             {header: "性别", dataIndex: 'sex', sortable: true,renderer:function(sex){
	            	 var r=sex == 0?"男":"女";
	            	 return r;
	             }},  
	             {header: "政治面貌",  dataIndex: 'political', sortable: true,renderer:function(political){
	            	 if(political == 1){
	            		 return "党员";
	            	 }else if(political == 2){
	            		 return "团员";
	            	 }else if(political == 3){
	            		 return "群众";
	            	 }else if(political == 4){
	            		 return "其他";
	            	 }
	             }},
	             {header: "客户职务", dataIndex: 'position', sortable: true},  
	             {header: "固定电话",  dataIndex: 'telphone', sortable: true},
	             {header: "手机号码", dataIndex: 'mobile', sortable: true},
	             {header: "其他电话",  dataIndex: 'other_tel', sortable: true},
	             {header: "qq/msn",  dataIndex: 'qq', sortable: true},
	             {header: "家庭住址",  dataIndex: 'address', sortable: true},
	             {header: "公司地址",  dataIndex: 'address_company', sortable: true},
	             {header: "兴趣爱好",  dataIndex: 'favorite', sortable: true},
	             {header: "家庭成员",  dataIndex: 'family_mumber', sortable: true},
	             {header: "家庭状况",  dataIndex: 'family_condition', sortable: true},
	             {header: "审批",  dataIndex: 'approve', sortable: true,renderer:function(approve){
	            	 var approve_info;
	            	 if(1==approve){
	            	 	approve_info = '通过';
	            	 }else if(0==approve){
	            	 	approve_info = '不通过';
	            	 }else{
	            	 	approve_info = '未审核';
	            	 }
	            	 return approve_info;
	             }},
	             {header: "备注",  dataIndex: 'memo', sortable: true}
	         ],  
	         tbar:[{
						id:'editButton',
						text:'修改审批状态',
						disabled : true,
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改审批状态',
						handler:function(){
							customer_data = false;
							updateForm();
						},	
	                    scope:this
					},'-',
					{
						text:'刷新',
						icon:Ext.zion.image_base+'/refresh.gif',
						tooltip:'刷新纪录',          
	                    handler: function(){
	                    grid.store.reload();
	                    Ext.getCmp('editButton').disable();
	                    },
	                   	scope:this
					}],
						//第二个toolbar
						listeners : {
					'render' : function() {
						var tbar = new Ext.Toolbar({
									items : ['请根据',select_combo , {
												xtype : 'textfield',
												disabled : true,
												id : 'term'
											}, {
												text : '查询',
												tooltip : '查询',
												icon : Ext.zion.image_base+'/select.gif',
												handler:selectForm
												
											}]
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
		grid.addListener('rowdblclick',update_customer_data);
		function update_customer_data(grid, rowIndex, e ){
			customer_data = false;
			updateForm();
			
		}
		
	sm.on('rowselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	})
	sm.on('rowdeselect', function() {
		if (grid.selModel.getSelections().length == 1) {
			Ext.getCmp('editButton').enable();
		} else {
			Ext.getCmp('editButton').disable();
		}
	})

		/////////////////////////////////////////////////////////////////////////////////////
		//----------form表单---------
		/////////////////////////////////////////////////////////////////////////////////////
		function customer_win(){
			
			//性别
			
			//审核
		approve_radio = new Ext.form.RadioGroup( {
			xtype : 'radiogroup',
			fieldLabel : '审核意见',
			autoHeight : true,
			allowBlank : false,
			items : [ {
				columnWidth : .5,
				checked : true,
				xtype : "radio",
				boxLabel : "通过",
				name : "approve",

				inputValue : 1
			}, {
				columnWidth : .5,
				xtype : "radio",
				boxLabel : "不通过",
				name : "approve",
				inputValue : 0
			} ],
			anchor : '90%'
		});

			customer_form = new Ext.form.FormPanel({

				labelWidth : 65,
				items : [ {
					layout : 'column',
					items : [ {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						defaults : {width : 200},
						items : [ {
							fieldLabel : '客户单位',
							disabled:true,
							name : 'company',
							anchor : '90%'
						}, {
							fieldLabel : '联系人',
							disabled:true,
							name : 'contact',
							anchor : '90%'
						},{
							fieldLabel : '客户姓名',
							disabled:true,
							name : 'name',
							anchor : '90%'
						},{
							fieldLabel : '性别',
							disabled:true,
							name : 'sex',
							anchor : '90%'
						},{
							fieldLabel : '政治面貌',
							disabled:true,
							name : 'political',
							anchor : '90%'
						},{
							fieldLabel : '客户职务',
							disabled:true,
							name : 'position',
							anchor : '90%'
						},{
							fieldLabel : '固定电话',
							disabled:true,
							name : 'telphone',
							anchor : '90%'
						},{
							fieldLabel : '手机号码',
							disabled:true,
							name : 'mobile',
							anchor : '90%'
						}, {
							fieldLabel : '其他电话',
							disabled:true,
							name : 'other_tel',
							anchor : '90%'
						}, {
							fieldLabel : 'QQ/MSN',
							disabled:true,
							name : 'qq',
							anchor : '90%'
						}]
					}, {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						defaults : {width : 200},
						items : [  {
							fieldLabel : '家庭住址',
							disabled:true,
							name : 'address',
							anchor : '90%'
						},{
							fieldLabel : '公司地址',
							disabled:true,
							name : 'address_company',
							anchor : '90%'
						},{
							fieldLabel : '兴趣爱好',
							disabled:true,
							name : 'favorite',
							anchor : '90%'
						},{
							fieldLabel : '家庭成员',
							disabled:true,
							name : 'family_mumber',
							anchor : '90%'
						},{
							fieldLabel : '家庭状况',
							disabled:true,
							name : 'family_condition',
							anchor : '90%'
						},approve_radio,
						 {
							fieldLabel : '审核意见',
							height: 60,
							xtype : 'textarea',
							name : 'memo',
							anchor : '90%'
						}]
					} ]
				}]
			})
			var customer_win = new Ext.Window( {
				title : '客户详细资料',
				closable : true,
				closeAction : 'close',
				autoWidth : false,
				width : 480,
				items : [customer_form],
				buttons: [{
				    text: '保存',
					handler:function(){
						update_goods_store(customer_form.getForm(),customer_win);
					}
				},{
				    text: '取消',
					handler:function(){customer_win.close();}
				}]
			})
			customer_win.show();
		}
		//修改客户信息
		function update_goods_store(customer_form,customer_win){
			if(customer_form.isValid() == false) {
				return false;
			}
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data.id;
			var approve = approve_radio.getValue();
			var memo = customer_form.findField("memo").getValue();
			var params = [ approve, memo,id ]
			Ext.zion.db.getJSON("customer_data_approve.update", params, function(data) {
				if(data.r ==1){
					Ext.Msg.alert("提示","修改成功");
					customer_win.close();
					grid.store.reload();
				}else{
					Ext.Msg.alert("提示","修改失败");
				}
			})
		}
		function updateForm() {
			var sm = grid.getSelectionModel().getSelected();
			var approve = sm.data.approve;
			var sm_num = grid.selModel.getSelections().length;
			if (!sm) {
				Ext.Msg.alert("修改操作", "请选择要修改的项");
			} else if (sm_num > 1) {
				Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
			} else if(approve ==1){
				Ext.Msg.alert("修改操作", "审批通过后不能修改或删除记录");
			}else {
				customer_win();
				customer_form.form.loadRecord(sm);
			}
		}
		
		
		show_more_win = function(){
			 var sm = grid.getSelectionModel().getSelected();
			 var id = sm.data.id;
			 var id_label = new Ext.form.Label({
				 fieldLabel : '序号',
					name : 'id'
			 })
			 var show_introduction_form = new Ext.form.FormPanel({
				defaultType: 'textfield',
				items : [ {
					fieldLabel : '序号',
					disabled:true,
					name : 'id'
				},{
					fieldLabel : '客户单位',
					disabled:true,
					name : 'company'
				},{
					fieldLabel : '联系人',
					disabled:true,
					name : 'contact'
				},{
					fieldLabel : '客户姓名',
					disabled:true,
					name : 'name'
				},{
					fieldLabel : '客户职务',
					disabled:true,
					name : 'position'
				},{
					fieldLabel : '固定电话',
					disabled:true,
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
		
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = Ext.getCmp('term').getValue();
		params_search = [];
		if (!Ext.getCmp('term').disabled) {
			params_search.push(term);
		}

		grid.store.constructor({
					db : {
						params : params_search,
						alias : type
					},
					root : "r",
					fields : fields
				});
		grid.store.load({
					params : {
						start : 0,
						limit : Ext.zion.page.limit
					}
				})

	}


		// grid自适应
		new Ext.Viewport({  
			layout:'border',  
			border:false,  
			items:[{  
				region:'center',  
				layout:'fit',  
				items:[grid]  
			}]  
		});	 
	})