Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var training_programs_add = false;
			var fields = [ 'id', 'name', 'sex', 'post', 'training_name',
					'theory_scores', 'actual_score', 'document_number',
					'teaching_address', 'training_date', 'training_hours',
					'training_form' ];
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "ledger.training.select"
				},
				root : "r",
				fields : fields
			});

			var select_data = [ [ "ledger.training.select", '所有' ],
					[ "ledger.training.select.name", '姓名' ],
					[ "ledger.training.select.training_name", '培训项目' ] ];
			var selelct_store = new Ext.data.SimpleStore( {
				fields : [ 'type', 'name' ],
				data : select_data
			});
			var select_combo = new Ext.form.ComboBox( {
				fieldLabel : '工作表类型',
				hiddenName : 'type',
				valueField : 'type',
				store : selelct_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				anchor : '95%',
				listeners : {
					'select' : function(index) {
						var objv = this.getValue();
						if (objv == "ledger.training.select") {
							Ext.getCmp('term').setValue('');
							Ext.getCmp('term').disable();
						} else {
							Ext.getCmp('term').enable();
						}

					}
				}
			});
			select_combo.setValue(select_data[0][0]);
			var grid = new Ext.grid.GridPanel(
					{
						store : store,
						autoScroll : true,
						columns : [ {
							header : "序号",
							dataIndex : 'id',
							width : 50,
							sortable : true
						}, {
							header : "姓名",
							dataIndex : 'name',
							width : 100,
							sortable : true
						}, {
							header : "性别",
							width : 100,
							dataIndex : 'sex',
							sortable : true
						}, {
							header : "工种或岗位",
							width : 100,
							dataIndex : 'post',
							sortable : true
						}, {
							header : "培训项目",
							width : 100,
							dataIndex : 'training_name',
							sortable : true
						}, {
							header : "理论成绩",
							dataIndex : 'theory_scores',
							sortable : true
						}, {
							header : "实际成绩",
							dataIndex : 'actual_score',
							sortable : true
						}, {
							header : "证件编号",
							dataIndex : 'document_number',
							sortable : true
						}, {
							header : "培训单位及地点",
							dataIndex : 'teaching_address',
							sortable : true
						}, {
							header : "培训日期",
							dataIndex : 'training_date',
							sortable : true
						}, {
							header : "学时",
							dataIndex : 'training_hours',
							sortable : true
						}, {
							header : "培训形式",
							dataIndex : 'training_form',
							sortable : true
						} ],
						tbar : [
								'请根据',
								select_combo,
								{
									xtype : 'textfield',
									width : 150,
									name : 'term',
									id : 'term',
									disabled : true
								},
								{
									text : '查询',
									tooltip : '查询',
									icon : Ext.zion.image_base+'/select.gif',
									handler : selectForm,
									scope : this
								},
								'-',
								{
									text : '导出报表',
									icon : Ext.zion.image_base+'/report_link.png',
									tooltip : '导出报表',
									handler : function() {
										Ext.Msg
												.alert(
														"下载报表",
														"<a href='"
																+ Zion.report
																		.getURL('educational_training.ledger_training.report')
																+ "' target='_blank' onclick='Ext.Msg.hide()'>点击此链接下载报表</a>");
									},
									scope : this
								} ],
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
			function selectForm() {
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
				Ext.getCmp('editButton').disable();
				Ext.getCmp('deleteButton').disable();
			}
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