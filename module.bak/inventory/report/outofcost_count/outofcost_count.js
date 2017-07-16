	Ext.onReady(function(){
		Ext.QuickTips.init();
		var id = [];  //id 数组
		var store = new Ext.zion.db.ArrayStore({
			db:{alias: "inventory.report.out_cost_count.query"},
			root:"r",
			fields: [
		 		'id','action_time','goods_code','name','acount' ,'total'
	        ]
		});
		
		var sm = new Ext.grid.CheckboxSelectionModel();
		var purchase_in_data = [['id','入库明细表id'],['goods_id','货品编码'],['serial','入库单号'],['action_time','入库日期'] ];
		var purchase_in_store = new Ext.data.SimpleStore({
			fields: [ 'sql_str','text'],
			data : purchase_in_data
		});
		var select_combo = new Ext.form.ComboBox({
	    	hiddenName: 'sql_str',
	    	valueField: 'sql_str',
	        store: purchase_in_store,
	        displayField:'text',
	        emptyText:'--列表条件--',
	        mode: 'local',
	        editable: false,
	        triggerAction: 'all'
	    }); 

		var grid = new Ext.grid.GridPanel({  
	         store: store, 
	         sm:sm, 
	         columns: [  
			     //new Ext.grid.RowNumberer(),//获得行号	   
			     sm, 
	             {header: "序号", dataIndex: 'id', sortable: true,renderer:function(id){
			    	 return "D"+id;
	             }},  
	             {header: "出库日期",  dataIndex: 'action_time', sortable: true},
	             {header: "货品编码",  dataIndex: 'goods_code', sortable: true},
	             {header: "货品名称", dataIndex: 'name', sortable: true},  
	             {header: "数量", dataIndex: 'acount', sortable: true},  
	             {header: "总金额", dataIndex: 'total', sortable: true}
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
					Ext.Msg.alert( "下载报表", "<a href='"+ Zion.report.getURL('inventory.report.out_cost_count.query')
											+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
				},
				scope : this
			}
					],
						//第二个toolbar
						listeners:{
			 				'render': function() {
								var tbar = new Ext.Toolbar({
									items:['请根据',select_combo,{xtype: 'textfield', id:'term'},{text:'查询',tooltip:'查询',icon:Ext.zion.image_base+'/select.gif',handler:selectForm}]
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
	    
	    var unit_comp = new Ext.form.TextField({
            fieldLabel: '计量单位',
            name: 'unit',
			id: 'unit',
			readOnly : true
        });
	    
	    var amount_comp = new Ext.form.TextField({
            fieldLabel: '数量',
            name: 'acount',
			id: 'acount',
			readOnly : true
        });
	    
	    var total_comp = new Ext.form.TextField({
            fieldLabel: '总金额',
            name: 'total',
			id: 'total',
			readOnly : true
        });
	    
	    var formPanel=new Ext.form.FormPanel({
	        defaultType: 'textfield',
	        items: [
	                action_time_comp,
	                goods_code_comp,
	                name_comp,
	                amount_comp,
	                total_comp
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
		function selectForm(){
			var unit = combox.getValue();
			var term = $('#term').val();
			store.filter(unit, term,true,false);
			
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