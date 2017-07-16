	Ext.onReady(function(){
		Ext.QuickTips.init();
		var id = [];  //单位编号
		var params_search;
		var fields ;
		fields = [  'id','type_id','name','address','telphone','fax','contact','cellphone','memo' ];
		var sql_array = [];
		sql_array.push("store_supplier.select");
		sql_array.push('inventory.base_info.supplier_by_type.query');
		sql_array.push('inventory.base_info.supplier_by_name.query');
		sql_array.push('inventory.base_info.supplier_by_tel.query');
		var baseinfo_data = [[sql_array[0],'全部'],[sql_array[1],'单位类型'],[sql_array[2],'单位名称'],[sql_array[3],'单位电话']];
		var baseinfo_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','sql_name'],
			data : baseinfo_data
		});
		var select_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: baseinfo_store,
	        displayField:'sql_name',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all'
	    }); 
		select_combo.setValue(sql_array[0]);
		select_combo.on('select',function(combo,record,index){
			if(combo.getValue()==sql_array[0]){
				Ext.getCmp('term').setValue('');
				Ext.getCmp('term').disable();				
			}else{
				Ext.getCmp('term').enable();
			}
			if(combo.getValue()==sql_array[1]){
				combo_con.show();
				Ext.getCmp('term').hide();				
			}else{
				Ext.getCmp('term').show();
				combo_con.hide();
			}
		},this
		);
//==============类型查询条件=========
		//单位类型
	    var data_con=[[1,'入网单位'],[2,'非入网单位'],[0,'其他']];
	    var com_store_con = new Ext.data.SimpleStore({
			fields: [ 'con_id','con_text'],
			data : data_con
		});
	    var combo_con = new Ext.form.ComboBox({
	    	hiddenName : 'con_id',
	    	valueField: 'con_id',
	        store : com_store_con,
	        displayField:'con_text',
	        mode : 'local',
	        editable : false,
	        hidden : true,
	        allowBlank : false,
	        triggerAction: 'all',
	        emptyText:'请选择...'
	    });
//=============类型查询条件=============
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
			     //new Ext.grid.RowNumberer(),//获得行号	   
			     sm, 
	             {header: "单位编码", dataIndex: 'id', sortable: true,renderer:function(id){
			    	 return "D"+id;
	             }},  
	             {header: "单位类型",  dataIndex: 'type_id', sortable: true,renderer:transStr},
	             {header: "单位名称", dataIndex: 'name', sortable: true},  
	             {header: "单位地址",  dataIndex: 'address', sortable: true},
	             {header: "单位电话", dataIndex: 'telphone', sortable: true},  
	             {header: "传真",  dataIndex: 'fax', sortable: true},
	             {header: "联系人", dataIndex: 'contact', sortable: true},  
	             {header: "手机",  dataIndex: 'cellphone', sortable: true},
	             {header: "备注", dataIndex: 'memo', sortable: true}
	         ],  
//             renderTo:'topic-grid', 
	         tbar:[{
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:addNewForm,
	                    scope:this
					},'-',
					{
						id:'editButton',
						disabled : true,
						text:'修改',
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录',
						handler:updateForm,				
	                    scope:this
					},'-',
					{
						text:'删除',
						id : 'deleteButton',
						disabled : true,
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
		                   	disableButton();
	                   	},
	                   	scope:this
					},'-',
					{
						text : '导出报表',
						icon : Ext.zion.image_base+'/report_link.png',
						tooltip : '导出报表',
						handler : function() {
							var term = $('#term').val();
							params_search = [];
							if(select_combo.getValue()==sql_array[1]){
								params_search.push(combo_con.getValue());
							}else{
								if (!Ext.getCmp('term').disabled) {
									params_search.push(term);
								}			
							}
	
	
							Ext.Msg.alert(
											"下载报表",
											"<a href='"+ Zion.report.getURL(select_combo.getValue(),params_search)
													+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
						},
						scope : this
					}
					],
						//第二个toolbar
						listeners:{
			 				'render': function() {
								var tbar = new Ext.Toolbar({
									items:['请根据',select_combo,combo_con,{xtype: 'textfield',disabled:true, id:'term'},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
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

//===========================grid记录选择事件==========================
			sm.on('rowselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
				if(length>0){
					Ext.getCmp('deleteButton').enable();
				}else{
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
				if(length>0){
					Ext.getCmp('deleteButton').enable();
				}else{
					Ext.getCmp('deleteButton').disable();
				}
			})

		//----------form表单---------
		//单位类型
	    var data=[[1,'入网单位'],[2,'非入网单位'],[0,'其他']];
	    var com_store = new Ext.data.SimpleStore({
			fields: [ 'type_id','text'],
			data : data
		});
	    var combo = new Ext.form.ComboBox({
	    	fieldLabel: '单位类型',
	    	hiddenName : 'type_id',
	    	valueField: 'type_id',
	        store : com_store,
	        displayField:'text',
	        mode : 'local',
	        allowBlank : false,
	        editable : false,
	        triggerAction: 'all',
	        emptyText:'请选择...'
	    });
	    combo.setValue(null);
	    
		var formPanel=new Ext.form.FormPanel({
	        defaultType: 'textfield',	      
	        items: [combo,{
	                fieldLabel: '单位名称',
	                name: 'name',
					id: 'name',
//					anchor:'80%',
					maxLength : 16,
					maxLengthText : '字符长度过长',
					allowBlank: false,
					blankText:'不能为空'
	            },{
	                fieldLabel: '单位地址',
	                name: 'address',
					id: 'address',
					maxLength : 24,
					maxLengthText : '字符长度过长',
					allowBlank: false,
					blankText:'不能为空'
	            },{
	                fieldLabel: '单位电话',
	                name: 'telphone',
					id: 'telphone',
					regex:/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
					regexText:'电话号码格式不正确'
					/*	,
					regex:/^\+\d{2}\s\d{3,4}\-\d{8}$|\d{3,4}\-\d{8}$/,
					regexText:'电话号码格式不正确'*/
	            },{
	                fieldLabel: '传真',
	                name: 'fax',
					id: 'fax',
					regex:/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
					regexText:'传真格式不对'
	            },{
	                fieldLabel: '联系人',
	                name: 'contact',
					id: 'contact',
					maxLength:12,
					emptyText:'不要超过12个字符'
	            },{
	                fieldLabel: '手机',
	                name: 'cellphone',
					id: 'cellphone',
					regex:/^(1[3-9])\d{9}$/,
					regexText:'手机格式不正确'
	            },{
	                fieldLabel: '备注',
	                xtype:'textarea',
	                height:80,
	                maxLength:500,
	                name: 'memo',
					id: 'memo'
	            }]						 
			})
		//----window表单----
			win = new Ext.Window({
				title: '供应商资料',
				closable:true,
				closeAction:'hide',
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:addForm
		        },{
		            text: '取消',
					handler:function(){formPanel.form.reset();win.hide();}
		        }]
			})
		//id,type_id,name,address,telphone,fax,contact,cellphone,memo
		function addForm(){
			var type_idV = combo.getValue();
			var nameV = $("#name").val();
			var addressV = $("#address").val();
			var telphoneV = $("#telphone").val();
			var faxV = $("#fax").val();
			var contactV = $("#contact").val();
			var cellphoneV = $("#cellphone").val();
			var memoV = $("#memo").val();
			if(formPanel.getForm().isValid() == false){
				return false;
			}else{
				//修改操作
				if(win.update){
					var sm = grid.getSelectionModel().getSelected();
					var idV = sm.data.id;
					var params = [type_idV,nameV,addressV,telphoneV,faxV,contactV,cellphoneV,memoV,idV];
					Ext.zion.db.getJSON("store_supplier.update", params, function(data){
						if (data.r==1) {
							Ext.Msg.alert("提示","修改成功");
							formPanel.form.reset();
							win.hide();
						 	grid.store.reload();	
						 	disableButton();
						} else {
							Ext.Msg.alert("提示","数据修改错误");
						}
					});
					
				}else{
				//增加操作
					var sm = grid.getSelectionModel().getSelected();
					var params = [type_idV,nameV,addressV,telphoneV,faxV,contactV,cellphoneV,memoV];	
					Ext.zion.db.getJSON("store_supplier.insert", params, function(data){
						if (!data.f) {
							Ext.Msg.alert("提示","数据插入成功");
							formPanel.form.reset();
							win.hide();
						 	grid.store.reload();
						 	disableButton();
						} else {
							Ext.Msg.alert("提示","数据添加错误");
						}
					});
				}
			}
		}
//		=======================
		function addNewForm(){win.update = false; win.show();}
		//----------修改window表单---------
		function updateForm(){
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(1!=sm_num){
				 Ext.Msg.alert("修改操作", "请你选择一条记录");  
			}else{
				win.show();
				win.update = true;
				formPanel.form.loadRecord(sm);
			}
		}
	// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		var term = $('#term').val();
		params_search = [];
		if(select_combo.getValue()==sql_array[1]){
			params_search.push(combo_con.getValue());
		}else{
			if (!Ext.getCmp('term').disabled) {
				params_search.push(term);
			}			
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

		//删除 form
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
							//var username = encodeURI(grid.getSelectionModel().getSelected().data.username,'utf-8');
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
				Ext.zion.db.getJSON("store_supplier.delete", [id.pop()], function(data){
					if(data.r != 0 ){
						Ext.Msg.alert("提示","成功");	
								
					}else{
						Ext.Msg.alert("提示","失败");
					}
					deleNext();
				});
			}else{
				grid.store.reload();
				disableButton();
				//alert("to do refresh data");
			}
		}
		grid.addListener('rowdblclick',updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e ){
			updateForm();
			
		}
		
		function transStr(str){
			var reStr = '';
			if(1==str){
				reStr = '入网单位';
			}else if(2==str){
				reStr = '非入网单位';
			}else if(0==str){
				reStr = '其他';
			}
			return reStr;
			
		}

	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}

	//grid自适应
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