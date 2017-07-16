	Ext.onReady(function(){
		Ext.QuickTips.init();
		var id = [];  //id 数组
		var sql_array = [];
		var fields;
		var params_search;
		params_search = '';
		fields = ['id','action_time','supplier_name','goods_code','name','unit','model','amount','price','total','memo','tpye'];

		sql_array.push('inventory.report.business_store_in_a.query');
		sql_array.push('inventory.report.business_store_in_b.query');
		sql_array.push('inventory.report.business_store_out_a.query');
		sql_array.push('inventory.report.business_store_out_b.query');

		var store = new Ext.zion.db.ArrayStore({
			db:{alias: sql_array[0],
					params: ['']
				},
			root:"r",
			fields: fields
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		var purchase_in_data = [[sql_array[0],'入库货品'],[sql_array[1],'生产退库'],[sql_array[2],'出库货品'],[sql_array[3],'采购退库']];
		var purchase_in_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','sql_name'],
			data : purchase_in_data
		});
		var select_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: purchase_in_store,
	        displayField:'sql_name',
	        emptyText:'--出库类型--',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all'
	    }); 
	    select_combo.setValue(sql_array[0]);
		var condition_data = [[sql_array[2],'全部'],[sql_array[0],'供货商'],[sql_array[1],'货品编码'],[sql_array[3],'货品名称']];
		var condition_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','sql_name'],
			data : condition_data
		});
		var condition_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: condition_store,
	        displayField:'sql_name',
	        emptyText:'--查询条件--',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all'
	    }); 
//	    select_combo.on('select',function(combo,record,index){
//	    	if()
//	    
//	    },this);

		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [  
			     //new Ext.grid.RowNumberer(),//获得行号	   
			     sm, 
	             {header: "序号", dataIndex: 'id', sortable: true,renderer:function(id){
			    	 return "D"+id;
	             }},  
	             {header: "入库日期",  dataIndex: 'action_time', sortable: true},
	             {header: "供货商",  dataIndex: 'supplier_name', sortable: true},
	             {header: "货品编码",  dataIndex: 'goods_code', sortable: true},
	             {header: "货品名称", dataIndex: 'name', sortable: true},  
	             {header: "规格型号", dataIndex: 'model', sortable: true},  
	             {header: "计量单位",  dataIndex: 'unit', sortable: true},
	             {header: "数量", dataIndex: 'amount', sortable: true},  
	             {header: "单价", dataIndex: 'price', sortable: true},  
	             {header: "总金额", dataIndex: 'total', sortable: true},  
	             {header: "备注", dataIndex: 'memo', sortable: true}
	         ],  
	         tbar:[
					{
						id:'editButton',
						text:'查看',
						disabled : true,
						icon:Ext.zion.image_base+'/update.gif',
						tooltip:'查看记录',
						handler:updateForm,				
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
				text : '导出报表',
				icon : Ext.zion.image_base+'/report_link.png',
				tooltip : '导出报表',
				handler : function() {
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
//									'中-请根据:',condition_combo,{xtype: 'textfield',disabled : true, id:'term'},
									items:['在',select_combo,'中，根据货品编号：',{xtype:'textfield',disabled:false,id:'term'},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
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
			})
			sm.on('rowdeselect', function() {
				var length = grid.selModel.getSelections().length;
				if (length == 1) {
					Ext.getCmp('editButton').enable();
				} else {
					Ext.getCmp('editButton').disable();
				}
			})


		//----------form表单---------
		//单位名称
	    var action_time_comp = new Ext.form.DateField({
            fieldLabel: '入库日期',
            name: 'action_time',
			id: 'action_time',
			format : 'Y-m-d',
			disabled : true
//			readOnly : true
        });
	    
	    var supplier_name_comp = new Ext.form.TextField({
            fieldLabel: '供货商',
            name: 'supplier_name',
			id: 'supplier_name',
			readOnly : true
        });
	    
	    var goods_code_comp = new Ext.form.TextField({
            fieldLabel: '货品编码',
            name: 'goods_code',
			id: 'goods_code',
			readOnly : true
        });
	    
	    var name_comp = new Ext.form.TextField({
            fieldLabel: '货品名称',
            name: 'name',
			id: 'name',
			readOnly : true
        });
	    
	    var model_comp = new Ext.form.TextField({
            fieldLabel: '规格型号',
            name: 'model',
			id: 'model',
			readOnly : true
        });
	    
	    var unit_comp = new Ext.form.TextField({
            fieldLabel: '计量单位',
            name: 'unit',
			id: 'unit',
			readOnly : true
        });
	    
	    var amount_comp = new Ext.form.TextField({
            fieldLabel: '数量',
            name: 'amount',
			id: 'amount',
			readOnly : true
        });
	    
	    var price_comp = new Ext.form.TextField({
            fieldLabel: '单价',
            name: 'pirce',
			id: 'price',
			readOnly : true
        });
	    
	    var total_comp = new Ext.form.TextField({
            fieldLabel: '总金额',
            name: 'total',
			id: 'total',
			readOnly : true
        });
	    
	    var memo_comp = new Ext.form.TextArea({
        	fieldLabel:'商品备注',
        	name:'memo',
			readOnly : true
	    });
	    
	    var formPanel=new Ext.form.FormPanel({
	        defaultType: 'textfield',
	        items: [
	                action_time_comp,
	                supplier_name_comp,
	                goods_code_comp,
	                name_comp,
	                model_comp,
	                unit_comp,
	                amount_comp,
	                price_comp,
	                total_comp,
	                memo_comp
	            ]
			})
		//----window表单----
		var win = new Ext.Window({
			title: '库存表单查看',
			closable:true,
			closeAction : 'hide',
			items:[formPanel],
	        buttons: [{
	            text: '关闭',
				handler:function(){
	        	formPanel.form.reset();
	        	win.hide();}
	        }]
		})


		// ---------- 查看window表单---------
	function updateForm() {
		var sm = grid.getSelectionModel().getSelected();
		var sm_num = grid.selModel.getSelections().length;
		win.show();
		formPanel.form.loadRecord(sm);
	}
		// 查询form
	function selectForm() {
		var type = select_combo.getValue();
		params_search = [];

		var term = Ext.getCmp('term').getValue();
		if(term != null){
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
		grid.addListener('rowdblclick',updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e ){
			updateForm();
			
		}
	//grid自适应
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