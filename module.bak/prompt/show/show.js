	Ext.onReady(function(){
		Ext.QuickTips.init();
//	=========================gridPanel's data=======================
		
	var fields = ['id','project','use_unit' ,'action_time', 'user_action_time', 'apply_unit','bill_count', 'self_count', 'memo',
						 'approvel_result_p','goods_code','name' ,'model','unit','supplier_id','supplier_name' ];
	var store = new Ext.zion.db.ArrayStore({
				db : {
					alias : "prompt.show.approval_view"
				},
				root : "r",
				fields : fields
			});
	var sm = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	var grid = new Ext.grid.GridPanel({
				store : store,
//				sm : sm,
				height : 400,
				columns : [{
							header : '序号',
							dataIndex : 'id',
							sortable : true
						}, {
							header : '申请项目名称',
							dataIndex : 'project',
							sortable : true
						}, {
							header : '领货单位',
							dataIndex : 'use_unit',
							sortable : true
						}, {
							header : '申请日期',
							dataIndex : 'action_time',
							sortable : true
						}, {
							header : '申请领用日期',
							dataIndex : 'user_action_time',
							sortable : true
						}, {
							header : '审批情况',
							dataIndex : 'approvel_result',
							sortable : true,
							renderer : function(approve) {
								if (approve == 1) {
									return "已审核通过";
								} else if (approve == 0) {
									return "未审核通过";
								} else {
									return "尚未审核"
								}
							}
						}],
				tbar : [{
				id : 'go_page_id',
				text : '处理任务',
				icon : Ext.zion.image_base+'/picture_go.png',
				handler : goto_page,
				scope : this
					
				}],
				bbar : new Ext.PagingToolbar({
							store : store,
							pageSize : Ext.zion.page.limit,
							displayInfo : true
						})
			})
	store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});


/*
 *    Here is where we create the Form
 */

	var searchButton = new Ext.Button({
		name : 'search',
		text : '搜索',
		handler : function(){search();}
	});		
	var gridForm = new Ext.FormPanel({
        id: 'company-form',
        frame: true,
        labelAlign: 'left',
        title: '出库审批事项',
        bodyStyle:'padding:5px',
        autoWidth : true,
        layout: 'column',    // Specifies that the items will now be arranged in columns
        items: [{
            columnWidth: 0.7,
            layout: 'fit',
            items: grid},
           {
            columnWidth: 0.3,
            xtype: 'fieldset',
            labelWidth: 90,
            title:'******************结果搜索:',
            defaults: { border:false},    // Default config options for child items
            defaultType: 'textfield',
            autoHeight: true,
            bodyStyle: Ext.isIE ? 'padding:0 0 5px 15px;' : 'padding:10px 15px;',
            border: false,
            style: {
                "margin-left": "10px", // when you add custom margin in IE 6...
                "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0"  
                // you have to adjust for it somewhere else
            },
            items: [{
            	hidden : true
            },{
                fieldLabel: '申请项目名称',
                name: 'project',
                id : 'project_id',
                anchor : '90%'
            },{
                fieldLabel: '领货单位',
                name: 'use_unit',
                id : 'use_unit_id',
                anchor : '90%'
            },{
            	xtype : 'datefield',
                fieldLabel: '申请领用日期从',
                editable : false,
                format: 'Y-m-d',
                name: 'user_action_time1',
                id : 'user_action_time_1',
                anchor : '90%'
            },{
            	xtype : 'datefield',
                fieldLabel: '到',
                editable : false,
                format: 'Y-m-d',
                name: 'user_action_time2',
                id : 'user_action_time_2',
                anchor : '90%'
            }],
            buttons : [searchButton]
        }]
    });

	store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});

    //========================new add form and grid===================
//	==========================出库确认===================================
		
	var fields_out = ['id','goods_code','serial' , 'supplier_id', 'name', 'price', 'memo', 'acount',
						'goods_name', 'model','unit'];
	var store_out = new Ext.zion.db.ArrayStore({
				db : {
					alias : "inventory.access.goods_use_all",
					params : ['1']
				},
				root : "r",
				fields : fields_out
			});
	var sm_out = new Ext.grid.CheckboxSelectionModel({singleSelect : true});
	var grid_out = new Ext.grid.GridPanel({
				store : store_out,
//				sm : sm,
				height : 400,
				columns : [
						// new Ext.grid.RowNumberer(),//获得行号
						sm, {
							header : "序号",
							dataIndex : 'id',
							sortable : true,
							renderer : function(id) {
								return "B" + id;
							}
						}
						, {
							header : "供货商",
							dataIndex : 'name',
							sortable : true
						}, {
							header : "货品编码",
							dataIndex : 'goods_code',
							sortable : true
						},{
							header : "货品名称",
							dataIndex : 'goods_name',
							sortable : true
						},{
							header : "规格型号",
							dataIndex : 'model',
							sortable : true
						},{
							header : "计量单位",
							dataIndex : 'unit',
							sortable : true
						},{
							header : "货品单价",
							dataIndex : 'price',
							sortable : true
						}, {
							header : "货品数量",
							dataIndex : 'acount',
							sortable : true
						}, {
							header : "备注",
							dataIndex : 'memo',
							sortable : true
						},{
							header : "是否入库",
							dataIndex : 'serial',
							sortable : true,
							renderer : function(str){
								if(null==str||''==str){
									return '未领用';
								}else{
									return '已经领用';
								}
							}
						}],
				tbar : [{
				id : 'go_out_page_id',
				text : '处理任务',
				icon : Ext.zion.image_base+'/picture_go.png',
				handler : goto_out_page,
				scope : this
					
				}],
				bbar : new Ext.PagingToolbar({
							store : store_out,
							pageSize : Ext.zion.page.limit,
							displayInfo : true
						})
			})
	store_out.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});


/*
 *    Here is where we create the Form
 */

	var searchButton_out = new Ext.Button({
		name : 'search_out',
		text : '搜索',
		handler : function(){search_out();}
	});		
	var gridForm_out = new Ext.FormPanel({
        id: 'company-form-out',
        frame: true,
        labelAlign: 'left',
        title: '出库确认单',
        bodyStyle:'padding:5px',
        autoWidth : true,
        layout: 'column',    // Specifies that the items will now be arranged in columns
        items: [{
            columnWidth: 0.7,
            layout: 'fit',
            items: grid_out},
           {
            columnWidth: 0.3,
            xtype: 'fieldset',
            labelWidth: 90,
            title:'******************结果搜索:',
            defaults: { border:false},    // Default config options for child items
            defaultType: 'textfield',
            autoHeight: true,
            bodyStyle: Ext.isIE ? 'padding:0 0 5px 15px;' : 'padding:10px 15px;',
            border: false,
            style: {
                "margin-left": "10px", // when you add custom margin in IE 6...
                "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0"  
                // you have to adjust for it somewhere else
            },
            items: [{
            	hidden : true
            },{
                fieldLabel: '供货商',
                name: 'name',
                id : 'name_id',
                anchor : '90%'
            },{
                fieldLabel: '货品名称',
                name: 'goods_name',
                id : 'goods_name_id',
                anchor : '90%'
            },{
                fieldLabel: '货品数量从',
                name: 'start_acount',
                id : 'start_acount_id',
                anchor : '90%'
            },{
                fieldLabel: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;到',
                name: 'end_acount',
                id : 'end_acount_id',
                anchor : '90%'
            }],
            buttons : [searchButton_out]
        }]
    });

	store_out.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			});

		
//	==========================出库确认===================================
		
		new Ext.Viewport({
			layout:'border',    
			border:false,  
			items:[{  
				region:'center',  
				layout:'fit',  
				items:[{
					title : '待办任务-结果提示',
					layout : 'accordion',
					defaults: {
				        // applied to each contained panel
				        bodyStyle: 'padding:5px'
				    },
				    layoutConfig: {
				        // layout-specific configs go here
				        titleCollapse: false,
				        animate: true,
				        activeOnTop: false
				    },
				    items:[gridForm,
				    	gridForm_out]
					

				}]  
			}]  
		});	
		
//		=================funciton method==========
		function goto_page(){
			var tabPage = top.moduleTab.add( {
								title : '出库审批',
								html : '<iframe src="../module/inventory/apply_approval/out_approval/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="auto" width="100%" height="100%"></iframe>',
								closable : true,
								onDestroy : function() {
//									n.attributes.tab = undefined;
								}
							});
						top.moduleTab.setActiveTab(tabPage );
		
		}
		function goto_out_page(){
			var tabPage = top.moduleTab.add( {
								title : '出库确认',
								html : '<iframe src="../module/inventory/purchase_access/department_out/index.htm?token=' + Zion.token + '" frameborder="0" scrolling="auto" width="100%" height="100%"></iframe>',
								closable : true,
								onDestroy : function() {
//									n.attributes.tab = undefined;
								}
							});
						top.moduleTab.setActiveTab(tabPage );
		
		}
		function search(){
			var paramsV = [];
			var projectV = Ext.getCmp('project_id').getValue();
			var use_unitV = Ext.getCmp('use_unit_id').getValue();
			var star_dateV = Ext.getCmp('user_action_time_1').getValue();
			var end_dateV = Ext.getCmp('user_action_time_2').getValue();
			if(star_dateV==null||star_dateV==''){
				star_dateV = new Date(1970,0,1);
			
			}
			if(end_dateV==null||end_dateV==''){
				end_dateV = new Date(3000,0,1);
			
			}
			
			paramsV.push(projectV);
			paramsV.push(use_unitV);
			paramsV.push(star_dateV);
			paramsV.push(end_dateV);

			grid.store.constructor({
				db : {
					alias : 'prompt.show.approval_view_search',
					params : paramsV
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
		
		function search_out(){
			var paramsV = [];
			var nameV = Ext.getCmp('name_id').getValue();
			var goods_nameV = Ext.getCmp('goods_name_id').getValue();
			var start_acountV = Ext.getCmp('start_acount_id').getValue();
			var end_acountV = Ext.getCmp('end_acount_id').getValue();
			if(start_acountV==null||start_acountV==''){
				start_acountV = 0;
			
			}
			if(end_acountV==null||end_acountV==''){
				end_acountV = 10000;
			
			}
			paramsV.push("1");
			paramsV.push(nameV);
			paramsV.push(goods_nameV);
			paramsV.push(start_acountV);
			paramsV.push(end_acountV);
		
			grid_out.store.constructor({
				db : {
					alias : 'prompt.show.goods_out_search',
					params : paramsV
				},
				root : "r",
				fields : fields_out
			});
			grid_out.store.load({
				params : {
					start : 0,
					limit : Ext.zion.page.limit
				}
			})
		}
		

	})