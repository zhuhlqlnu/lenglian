	Ext.onReady(function(){
		Ext.QuickTips.init();
		var customer_form;
		var sex_combo;
		var position_combo;
		var customer_data = false;
		
		var sql_array = [];
		var params_search ;
		var fields;
		fields = [ 'id', 'company', 'contact', 'name', 'sex', 'political', 'position',
					'telphone', 'mobile', 'other_tel', 'qq', 'address', 'address_company',
					'favorite', 'family_mumber', 'family_condition','approve','memo' ];
		sql_array.push("marketing.customer.customer_data.select");
		sql_array.push("marketing.customer.customer_by_com.select");
		sql_array.push("marketing.customer.customer_by_name.select");
		sql_array.push("marketing.customer.customer_by_post.select");
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: sql_array[0]},
			root:"r",
			fields: fields
		});
		
		var query_data = [[sql_array[0],'全部'],[sql_array[1],'客户单位'],[sql_array[2],'客户姓名'],[sql_array[3],'客户职务']];
		var query_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','sql_name'],
			data : query_data
		});
		var select_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: query_store,
	        displayField:'sql_name',
	        emptyText:'--查询条件--',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all'
	    }); 
	    select_combo.on('select',function(combo,record,index){
	    	if(combo.getValue()==sql_array[0]){
	    		Ext.getCmp('term').setValue('');
	    		Ext.getCmp('term').disable();
	    	}else{
	    		Ext.getCmp('term').enable();
	    	}
	    	},this);
	    select_combo.setValue(sql_array[0]);
//	    ===========查询combox=================
		var sm = new Ext.grid.CheckboxSelectionModel();
		var id = [];  //编号
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
	             {header: "备注",  dataIndex: 'memo', sortable: true},
	             {header: '是否审核', dataIndex: 'approve', sortable: true,renderer:function(approve){
	            	 var approve_info;
	            	 if(1==approve){
	            	 	approve_info = '通过';
	            	 }else if(0==approve){
	            	 	approve_info = '不通过';
	            	 }else{
	            	 	approve_info = '未审核';
	            	 }
	            	 return approve_info;
	             }}
	         ],  
	         tbar:[{
						id:'addButton',
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:function(){ 
        	 				customer_data = true;
	        	 			customer_win();
	        	 		},
	                    scope:this
					},'-',//'-'给工具栏按钮之间添加'|'
					{
						id:'editButton',
						disabled : true,
						text:'修改',
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:function(){
							customer_data = false;
							updateForm();
						},				
	                    scope:this
					},'-',
					{
						id : 'deleteButton',
						disabled : true,
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
					}, '-', 
						{
					text : '导出报表',
					icon : Ext.zion.image_base+'/report_link.png',
					tooltip : '导出报表',
					handler : function() {
						Ext.Msg.alert("下载报表",
										"<a href='"+ Zion.report.getURL(select_combo.getValue(),params_search)
												+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
					},
					scope : this
				}],
						//第二个toolbar
						listeners:{
			 				'render': function() {
								var tbar = new Ext.Toolbar({
									items:['请根据',select_combo,{xtype: 'textfield',disabled : true,id:'term'},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
								})
							tbar.render(this.tbar);
								
							}
						},
			bbar:new Ext.PagingToolbar({
				store: store,
				pageSize: Ext.zion.page.limit,
				displayInfo : true 
			})
 		}); 
		store.load({params:{start:0,limit:Ext.zion.page.limit}});	
		
//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})
			sm.on('rowdeselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if (length > 0) {
					Ext.getCmp('deleteButton').enable();
				} else {
					Ext.getCmp('deleteButton').disable();
				}
			})


		grid.addListener('rowdblclick',update_customer_data);
		function update_customer_data(grid, rowIndex, e ){
			customer_data = false;
			updateForm();
			
		}
		/////////////////////////////////////////////////////////////////////////////////////
		//----------form表单---------
		/////////////////////////////////////////////////////////////////////////////////////
		function customer_win(){
		var sex_radio = new Ext.form.RadioGroup( {
			xtype : 'radiogroup',
			fieldLabel : '性别',
			autoHeight : true,
			allowBlank : false,
			items : [ {
				columnWidth : .5,
				checked : true,
				xtype : "radio",
				boxLabel : "男",
				name : "sex",

				inputValue : 0
			}, {
				columnWidth : .5,
				xtype : "radio",
				boxLabel : "女",
				name : "sex",
				inputValue : 1
			} ],
			anchor : '90%'
		});

			var political_data = [[1,'党员'],[2,'团员'],[3,'群众'],[4,'其他']]
			var political_store = new Ext.data.SimpleStore({
				fields: [ 'political','text'],
				data : political_data
			});
			political_combo = new Ext.form.ComboBox({
				fieldLabel:'政治面貌',
		    	valueField: 'political',
		    	hiddenName: 'political',
		        store: political_store,
		        displayField:'text',
		        mode: 'local',
		        editable: false,
		        triggerAction: 'all',
							anchor : '90%'
		    }); 
			
			customer_form = new Ext.form.FormPanel({
				labelWidth : 65,
//				frame : true,
//				bodyStyle : 'padding:5px 5px 0',
//				height:200,
				items : [ {
					layout : 'column',
					items : [ {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						defaults :{width : 200},
						items : [ {
							fieldLabel : '客户单位',
							name : 'company',
							allowBlank : false,
							maxLength : 16,
							blankText : '不能为空',
							anchor : '90%'
						}, {
							fieldLabel : '联系人',
							name : 'contact',
							allowBlank : false,
							maxLength : 12,
							blankText : '不能为空',
							anchor : '90%'
						},{
							fieldLabel : '客户姓名',
							name : 'name',
							allowBlank : false,
							maxLength : 12,
							blankText : '不能为空',
							anchor : '90%'
						},sex_radio,political_combo,{
							fieldLabel : '客户职务',
							allowBlank : false,
							maxLength : 12,
							blankText : '不能为空',
							name : 'position',
							anchor : '90%'
						},{
							fieldLabel : '固定电话',
							name : 'telphone',
							allowBlank : false,
							maxLength : 12,
							blankText : '不能为空',
							anchor : '90%'
						},{
							fieldLabel : '手机号码',
							name : 'mobile',
							anchor : '90%'
						},{
							fieldLabel : '其他电话',
							maxLength : 32,
							name : 'other_tel',
							anchor : '90%'
						}]
					}, {
						columnWidth : .48,
						layout : 'form',
						autoHeight : true,
						defaultType : 'textfield',
						defaults :{width : 200},
						items : [  {
							fieldLabel : 'QQ/MSN',
							name : 'qq',
							anchor : '90%'
						},{
							fieldLabel : '家庭住址',
							name : 'address',
							anchor : '90%'
						},{
							fieldLabel : '公司地址',
							name : 'address_company',
							anchor : '90%'
						},{
							fieldLabel : '兴趣爱好',
							name : 'favorite',
							anchor : '90%'
						},{
							fieldLabel : '家庭成员',
							name : 'family_mumber',
							anchor : '90%'
						},{
							fieldLabel : '家庭状况',
							name : 'family_condition',
							anchor : '90%'
						},{
							fieldLabel : '隐藏',
							name : 'approve',
							hideLabel:true,
							hidden: true,
							value:0,
							anchor : '90%'
						},{
							fieldLabel : '备注',
							xtype : 'textarea',
							name : 'memo',
							anchor : '90%'
						}]
					}]
				}]
			})
			var customer_win = new Ext.Window( {
				title : '客户详细资料',
				closable : true,
				closeAction : 'close',
				autoWidth : false,
				width : 500,
				items : [customer_form],
				buttons: [{
				    text: '保存',
					handler:function(){
						if(customer_data){
							add_customer(customer_form.getForm(),customer_win);
						}else{
							update_goods_store(customer_form.getForm(),customer_win);
						}
					}
				},{
				    text: '取消',
					handler:function(){customer_win.close();}
				}]
			})
			customer_win.show();
		}
		//添加客户信息
		function add_customer(customer_form,customer_win){
			if(customer_form.isValid() == false) {
				return false;
			}
			var params = Ext.zion.form.getParams(customer_form,['company','contact','name','sex','political','position','telphone','mobile','other_tel','qq','address',
				'address_company','favorite','family_mumber','family_condition','memo']);
			var temp_approval = params.pop();
			params.push(0);
			params.push(temp_approval);
			Ext.zion.db.getJSON("customer_data.insert", params, function(data) {
				if(data.r ==1){
					Ext.Msg.alert("提示","添加成功");
					customer_win.close();
					grid.store.reload();
				}else{
					Ext.Msg.alert("提示","添加失败");
				}
			})
			
		}
		//修改客户信息
		function update_goods_store(customer_form,customer_win){
			if(customer_form.isValid() == false) {
				return false;
			}
			var sm = grid.getSelectionModel().getSelected();
			var id = sm.data.id;
			var params = Ext.zion.form.getParams(customer_form,['company','contact','name','sex','political','position','telphone','mobile','other_tel','qq','address',
				'address_company','favorite','family_mumber','family_condition','memo']);
			params.push(id);
			Ext.zion.db.getJSON("customer_data.update", params, function(data) {
				if(data.r && data.r!=0){
					Ext.Msg.alert("提示","修改成功");
					customer_win.close();
					grid.store.reload();
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
				}else{
					Ext.Msg.alert("提示","修改失败");
				}
			})
		}
		function updateForm() {
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(1==sm.data.approve||0==sm.data.approve){
				Ext.Msg.alert("警告","该记录已经审批过了！不能做修改");
				return ;
			};
			if (1!=sm_num) {
				Ext.Msg.alert("修改操作", "请选择一条记录进行操作");
			} else {
				customer_win();
				customer_form.form.loadRecord(sm);
			}
		}
		
		// 删除客户信息
		var id = [];
		function deleteForm() {
			var sm = grid.getSelectionModel().getSelections();
			if(1==sm[0].data.approve||0==sm[0].data.approve){
				Ext.Msg.alert("警告","该记录已经审批过了！不能删除");
				return ;
			};
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
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
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