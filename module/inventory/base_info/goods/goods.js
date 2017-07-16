	Ext.onReady(function(){
		Ext.QuickTips.init();
		var formPanel;
		var supplier_combo;
		var params_search;
		var combo;
		var supplier_name;
		var supplier_name_data = {};
		var supplier_name_array = [];
		var goods_add = false;

		var id = [];  // 单位编号
		var part_id = [];
		var fields;
		fields = [  'id','goods_code','name','model','unit','note','amount','supplier_id','out_price' ];
		var sql_array = [];
		sql_array.push('store_goods.select');
		sql_array.push('inventory.base_info.goods_by_code');
		sql_array.push('inventory.base_info.goods_by_name');
		sql_array.push('inventory.base_info.goods_by_spplier');
		var baseinfo_data = [[sql_array[0],'全部'],[sql_array[1],'货品编码'],[sql_array[2],'货品名称'],[sql_array[3],'供货单位']];
		var baseinfo_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','text'],
			data : baseinfo_data
		});
		var select_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: baseinfo_store,
	        displayField:'text',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all',
//			anchor : '95%',
			listeners : {
				'select' : function (index){
					var objv = this.getValue();
					if(objv==sql_array[0]){
						Ext.getCmp('term').setValue('');
						Ext.getCmp('term').disable();
					}else{
						Ext.getCmp('term').enable();
					}
				
				}
			}
	    });
	    select_combo.setValue(sql_array[0]);
//		var buttonSearch = new Ext.Button();
// =============货品档案===========
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
			     {header: "序号", dataIndex: 'id', width:60, sortable: true},  
	             {header: "货品编码", dataIndex: 'goods_code', width:50, sortable: true,renderer:function(id){
			    	 return "A"+id;
	             }},  
	             {header: "货品名称", dataIndex: 'name', width:60, sortable: true},  
	             {header: "供货单位", dataIndex: 'supplier_id', width:60, sortable: true,renderer:function(id_value){
	             	 if(supplier_name_data[id_value]){
	            	 	return supplier_name_data[id_value][1];
	             	 }else{
	             	 	return "";
	             	 }
	             }},  
	             {header: "规格型号",  dataIndex: 'model', width:60, sortable: true},
	             {header: "计量单位", dataIndex: 'unit', width:60, sortable: true},
	             {header: "出库单价", dataIndex: 'out_price', width:60, sortable: true},
	             {header: "备注", dataIndex: 'note', width:300, sortable: true}
	         ],  
//             renderTo:'goods-grid', 	
	         width:820,  
	         height:400,		
	         tbar:[{
						text: '新增',
						icon:Ext.zion.image_base+'/add.gif',
						tooltip:'添加新纪录',					
						handler:add_new_goods,
	                    scope:this
					},'-',// '-'给工具栏按钮之间添加'|'
					{
	         			id : 'editButton',
	         			disabled : true,
						text:'修改',
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'修改记录添加组件',
						handler:update_goods,				
	                    scope:this
					},'-',
					{
						id : 'deleteButton',
						disabled : true,
						text:'删除',
						icon:Ext.zion.image_base+'/delete.gif',
						tooltip:'删除记录',
						 handler: delete_goods,
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
						var term = Ext.getCmp('term').getValue();
						params_search = [];
						if (!Ext.getCmp('term').disabled) {
							params_search.push(term);
						}


						Ext.Msg.alert( "下载报表",
									"<a href='"+ Zion.report.getURL(select_combo.getValue(),params_search)
											+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			}
				],
				// 第二个toolbar
				listeners:{
	 				'render': function() {
						var tbar = new Ext.Toolbar({
							items:['请根据',select_combo,{xtype: 'textfield',disabled : true,width:150,id:'term'},{text:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
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
		
		
		Zion.db.getJSON("supplier_store_name.select",null, function(data) {
			supplier_name_array = data.r;
			for ( var i = 0; i < data.r.length; i++) {
				var id = data.r[i][0];
				supplier_name_data[id] = data.r[i];
			}
			store.load({params:{start:0,limit:Ext.zion.page.limit}});	

		});
		
		// 双击列事件
		grid.addListener('rowdblclick',updateGridRowClick);

		function updateGridRowClick(grid, rowIndex, e ){
			update_goods();
		}

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


		
		// ///////////////////////////////////////////////////////////////////////////////////
		// ----------gird-form表单---------
		// ///////////////////////////////////////////////////////////////////////////////////
		// 单位类型
		function win_show(){
			var supplier_store = new Ext.data.ArrayStore( {
				fields : [ 'supplier_id','name'	],
				data : supplier_name_array
			});
			supplier_combo = new Ext.form.ComboBox( {
				fieldLabel : '供货单位',
				hiddenName : 'supplier_id',
				valueField : 'supplier_id',
				store : supplier_store,
				displayField : 'name',
				editable : false,
				triggerAction : 'all',
				mode: 'local',
				allowBlank : false,
				blankText : '不能为空',
				emptyText : '请选择供货单位...'
			});
		    var data=[['套','套'],['个','个'],['盒','盒'],['卷','卷'],['本','本'],['张','张'],['公斤','公斤'],['台','台']];
		    var goods_store = new Ext.data.ArrayStore({
				fields: ['unit_type','text'],
				data : data
			});
		    combo = new Ext.form.ComboBox({
		    	fieldLabel: '计量单位',
		    	valueField: 'unit_type',
		    	id:'unit_type',
		        store: goods_store,
		        displayField:'text',
		        mode: 'local',
		        editable: false,
		        triggerAction: 'all'
		    }); 
			combo.setValue(null);

			formPanel=new Ext.form.FormPanel({
		        defaultType: 'textfield',
		        items: [{
	                fieldLabel: '货品名称',
	                name: 'name',
	                id:'name',
					allowBlank: false,
					blankText:'不能为空'
	            },supplier_combo,{
	                fieldLabel: '规格型号',
	                name: 'model',
	                id:'model',
					allowBlank: false,
					blankText:'不能为空'
	            },combo,{
	                fieldLabel: '出库单价',
	                name: 'out_price',
	                id:'out_price',
					allowBlank: false,
					blankText:'不能为空',
					regex : /^[0-9]{0,8}[.]{0,2}$/ ,
					regexText : '输入值是带小数的数字'
					
	            },{
	            	xtype:'textarea',
	            	height:80,
	                fieldLabel: '备注',
	                name: 'note',
	                id:'note'
	            },{
	            	name : 'id',
	            	hidden : true,
	            	hideLabel : true
	            }]						 
			})
			// ----window表单----
			
			var win = new Ext.Window({
				title: '货品档案',
				closable:true,
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:function(){
		        		if(goods_add==true){
		        			add_goods_store(formPanel,win);
		        		}else{
		        			update_goods_store(formPanel,win);
		        		}
		        	}
		        },{
		            text: '取消',
					handler:function(){formPanel.form.reset();win.close();}
		        }]
			});
			win.show();
		}
	
		
// ----------gird操作---------
		function add_goods_store(formPanel,win){
			if(formPanel.getForm().isValid() == false){
				return false;
			}
			// 增加操作
//			var params = [nameV,modelV,unitV,noteV,'',supplierV];
			var params = Ext.zion.form.getParams(formPanel.form,['name','model','unit_type','note','supplier_id','out_price']);

			Ext.zion.db.getJSON("store_goods.insert", params, function(data){
				if (data.r==1) {
					Ext.Msg.alert("提示","添加成功");
					formPanel.form.reset();
					win.close();
				 	grid.store.reload();	
				 	disableButton();
				} else {
					Ext.Msg.alert("提示","数据添加错误");
				}
			});	
		}
		//修改操作
		function update_goods_store(formPanel,win){
			if(formPanel.getForm().isValid() == false){
				return false;
			}

			var params = Ext.zion.form.getParams(formPanel.form,['name','model','unit_type','note','supplier_id','out_price','id']);
			Ext.zion.db.getJSON("store_goods.update", params, function(data){
				if (data.r==1) {
					Ext.Msg.alert("提示","修改成功");
					formPanel.form.reset();
					win.close();
				 	grid.store.reload();	
				 	disableButton();
				} else {
					Ext.Msg.alert("提示","数据修改错误");
				}
			});
		}
//		======增加货品档案==============
		function add_new_goods(){
		goods_add = true;
		win_show();
		}
		// ----------修改window表单---------
		function update_goods(){
			goods_add = false;
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if(1!=sm_num){
				 Ext.Msg.alert("修改操作", "请选择一条记录修改");  
			}else{
				win_show();
				formPanel.form.loadRecord(sm);
				supplier_combo.setValue(sm.data.supplier_id);
				combo.setValue(sm.data.unit);

			}
		}
		function add_goods(){
			goods_add = true;
			win_show();
		
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


		// 删除 form
		function delete_goods(){
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
				Ext.zion.db.getJSON("store_goods.delete", [id.pop()], function(data){
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
			}
		}
		
	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
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