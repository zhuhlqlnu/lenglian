Ext.onReady(function() {
	Ext.QuickTips.init();
	//	var start = 0;

		var sql_array = [];
		var params_search ;
		var fields;
		fields = [ 'id', 'payment_name', 'month', 'payment_money',
					'payment_condition', 'payment_leader', 'memo' ];
		sql_array.push('marketing.record.store_prefix_count');
		sql_array.push('marketing.record.store_prefix_count_payname');
		sql_array.push('marketing.record.store_prefix_count_leader');
		var query_data = [[sql_array[0],'全部'],[sql_array[1],'结算名称'],[sql_array[2],'负责人'] ];
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
// ===========查询combox=================

	var store = new Ext.zion.db.ArrayStore( {
			db : {
				alias : sql_array[0]
			},
			root : "r",
			fields : fields
		});
		var sm = new Ext.grid.CheckboxSelectionModel();
		var id = [];
		var grid = new Ext.grid.GridPanel( {
			store : store,
			sm : sm,
			columns : [ sm, {
				header : "序号",
				dataIndex : 'id',
				sortable : true
			}, {
				header : "结算名称",
				dataIndex : 'payment_name',
				sortable : true
			}, {
				header : "结算月份",
				dataIndex : 'month',
				sortable : true
			}, {
				header : "结算金额",
				dataIndex : 'payment_money',
				sortable : true
			}, {
				header : "是否结算",
				dataIndex : 'payment_condition',
				sortable : true,
				renderer : function(str){
					var re_str = '';
					if(1==str){
						re_str = '结算';
					}else if(2==str){
						re_str = '未结算';
					}
					return re_str;
				}
			}, {
				header : "负责人",
				dataIndex : 'payment_leader',
				sortable : true
			}, {
				header : "备注",
				dataIndex : 'memo',
				sortable : true
			} ],
			tbar : [ {
				id : 'addButton',
				text : '新增',
				icon : Ext.zion.image_base+'/add.gif',
				tooltip : '添加新纪录',
				handler : newAddForm,
				scope : this
			}, '-', {
				id : 'editButton',
				text : '修改',
				disabled : true,
				icon : Ext.zion.image_base+'/update.gif',
				tooltip : '修改记录',
				handler : updateForm,
				scope : this
			}, '-', {
				id : 'deleteButton',
				text : '删除',
				disabled : true,
				icon : Ext.zion.image_base+'/delete.gif',
				tooltip : '删除记录',
				handler : deleteForm,
				scope : this
			}, '-', {
				text : '刷新',
				icon : Ext.zion.image_base+'/refresh.gif',
				tooltip : '刷新纪录',
				handler : function() {
					grid.store.reload();
					disableButton();
				},
				scope : this
			} ],
			//第二个toolbar
			listeners : {
				'render' : function() {
					var tbar = new Ext.Toolbar( {
						items : [ '请根据',select_combo, {
							xtype : 'textfield',
							disabled : true,
							id : 'term'
						}, {
							text : '查询',
							tooltip : '查询',
							icon : Ext.zion.image_base+'/select.gif',
							handler : selectForm
						} ]
					})
					tbar.render(this.tbar);

				}
			},
			bbar : new Ext.PagingToolbar( {
				store : store,
				pageSize : Ext.zion.page.limit,
				displayInfo : true
			}),
			viewConfig : {
				autoFill : true,
				forceFit : true
			}
		});
		store.load( {
			params : {
				start : 0,
				limit : Ext.zion.page.limit
			}
		});
		
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


		/////////////////////////////////////////////////////////////////////////////////////
		//----------form表单---------

		var componA = new Ext.form.TextField( {
			fieldLabel : '结算名称',
			name : 'payment_name',
			allowBlank : false,
			blankText : '不能为空'
		});
		//=============结算月份  可以用combox==================
		var componB = new Ext.form.TextField( {
			fieldLabel : '结算月份',
			name : 'month',
			allowBlank : false,
			blankText : '不能为空'
		});
		var componC = new Ext.form.TextField( {
			fieldLabel : '结算金额',
			name : 'payment_money',
			allowBlank : false,
			blankText : '不能为空'
		});

		var componD = new Ext.form.RadioGroup( {
			xtype : 'radiogroup',
			fieldLabel : '是否结算',
			autoHeight : true,
			allowBlank : false,
			items : [ {
				columnWidth : .5,
				checked : true,
				xtype : "radio",
				boxLabel : "是",
				name : "payment_condition",

				inputValue : 1
			}, {
				columnWidth : .5,
				xtype : "radio",
				boxLabel : "否",
				name : "payment_condition",
				inputValue : 2
			} ],
			anchor : '90%'
		});

		var componE = new Ext.form.TextField( {
			fieldLabel : '结算负责人',
			name : 'payment_leader',
			allowBlank : false,
			blankText : '不能为空'

		});
		var componF = new Ext.form.TextArea( {
			fieldLabel : '备注',
			name : 'memo',
			allowBlank : false,
			blankText : '不能为空'

		});

		var componG = new Ext.form.TextField( {
//			fieldLabel : '结算单id',
			name : 'id',
			hidden : true

		});

		var formPanel = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			items : [ componA, componB, componC, componD, componE, componF ,componG]
		})
		//----window表单----
		var win = new Ext.Window( {
			title : '上游结算',
			closable : true,
			closeAction : 'hide',
			items : [ formPanel ],
			buttons : [ {
				text : '保存',
				handler : addForm
			}, {
				text : '取消',
				handler : function() {
					formPanel.form.reset();
					win.hide();
				}
			} ]
		})

		function addForm() {
			if (formPanel.getForm().isValid() == false) {
				return false;
			} else if (!win.update) {
				//增加操作
//id, payment_name, month, payment_money, payment_condition, payment_leader, memo
				var params = Ext.zion.form.getParams(formPanel.form,
					['payment_name','month','payment_money','payment_condition','payment_leader','memo'])
				Ext.zion.db.getJSON("muchun.store_prefix_count.insert", params,
						function(data) {
							if (data.r && data.r!=0) {
								Ext.Msg.alert("提示", "成功");
								formPanel.form.reset();
								win.hide();
								grid.store.reload();
								disableButton();
							} else {
								Ext.Msg.alert("提示", "数据添加错误");
							}
						});

			} else {
			//修改操作

				var params = Ext.zion.form.getParams(formPanel.form,
					['payment_name','month','payment_money','payment_condition','payment_leader','memo','id']);

				Ext.zion.db.getJSON("store_prefix_count.update", params,
						function(data) {
							if (data.r && data.r!=0) {
								Ext.Msg.alert("提示", "修改成功");
								formPanel.form.reset();
								win.hide();
								grid.store.reload();
								disableButton();
							} else {
								Ext.Msg.alert("提示", "数据修改错误");
							}
						});


			}
		}
		//----------修改window表单---------
		function updateForm() {
			var sm = grid.getSelectionModel().getSelected();
			var sm_num = grid.selModel.getSelections().length;
			if (!sm) {
				Ext.Msg.alert("修改操作", "请选择要修改的项");
			} else if (sm_num > 1) {
				Ext.Msg.alert("修改操作", "你选择修改的记录不能多于一条");
			} else {
				win.show();
				win.update = true;
				formPanel.form.loadRecord(sm);
			}
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


		//删除 form
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
				Ext.zion.db.getJSON("marketing.store_prefix_count.delete", [ id.pop() ],
						function(data) {
							if (data.r != 0) {
								Ext.Msg.alert("提示", "成功");

							} else {
								Ext.Msg.alert("提示", "失败");
							}
							deleNext();
						});
			} else {
				grid.store.reload();
				disableButton();
			}
		}

		function newAddForm() {
			win.update = false;
			win.show();
		}
//		function toCommonCase(date) {
//			var regex = /^(\d{4})-(\d{2})-(\d{2})$/;
//			if (date != null && date != "") {
//				if (regex.test(date)) {
//					date = new Date(date.replace(regex, '$1/$2/$3'));
//				}
//				var xYear = date.getYear();
//				if (xYear < 2000) {
//					xYear = xYear + 1900;
//				}
//
//				var xMonth = date.getMonth() + 1;
//				if (xMonth < 10) {
//					xMonth = "0" + xMonth;
//				}
//
//				var xDay = date.getDate();
//				if (xDay < 10) {
//					xDay = "0" + xDay;
//				}
//				return "" + xYear + xMonth + xDay;
//			}
//			return null;
//		}
		grid.addListener('rowdblclick', updateGridRowClick);
		function updateGridRowClick(grid, rowIndex, e) {
			updateForm();

		}

	function disableButton(){
		Ext.getCmp('editButton').disable();
		Ext.getCmp('deleteButton').disable();
	}
		

		//grid自适应
		var view = new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ {
				region : 'center',
				layout : 'fit',
				items : [ grid ]
			} ]
		});
	})