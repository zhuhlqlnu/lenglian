Ext
		.onReady(function() {
			Ext.QuickTips.init();

			Zion.configure.getProperty("com.mapprsoft.zion.sql.core.Activator",
					'ds', function(data) {
						var datasource = data.r.split(",");
						for ( var i = 0; i < datasource.length; i++) {
							datasource[i] = [ datasource[i] ];
						}
						datasource_store.loadData(datasource);
					});
			var datasource_store = new Ext.data.ArrayStore( {
				fields : [ 'datasource' ]
			});
			var username;
			function getUsername() {
				Zion.configure.getProperty(
						"com.mapprsoft.zion.sql.core.Activator", 'ds.' + Ext
								.getCmp('datasource').getValue() + '.username',
						function(data) {
							username = data.r;
							loadTableTree(Ext.getCmp('datasource').getValue(),
									username);
						});
			}
			var select_combo = new Ext.form.ComboBox( {
				fieldLabel : '数据源',
				id : 'datasource',
				valueField : 'datasource',
				store : datasource_store,
				displayField : 'datasource',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				width : 200,
				listeners : {
					'select' : function() {
						getUsername();
					}
				}
			});

			function createTableTree(develop_list) {
				var tree = {
					children : []
				};
				var search = {};

				for ( var i = 0; i < develop_list.length; i++) {
					var structure = develop_list[i];
					var paths = structure[0];
					var node = tree;
					node.children.push( {
						single : true,
						leaf : true,
						text : paths
					});
				}
				return tree;
			}
			var tree = new Ext.tree.TreePanel( {
				title : '数据类型列表',
				id : 'm-tree',
				rootVisible : false,
				autoScroll : true,
				collapsible : true,
				animate : false,
				split : true,
				region : 'west',
				width : 250,
				minSize : 250,
				maxSize : 350,
				tbar : [ '数据源', select_combo ],
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(null),
				tools : [ {
					id : 'refresh',
					on : {
						click : function() {
							loadTableTree(Ext.getCmp('datasource').getValue(),
									username);
						}
					}
				} ],
				listeners : {
					click : function(n) {
						if (n.leaf) {
							loadPropery(Ext.getCmp('datasource').getValue(),
									username, n.attributes.text);
						}
					}
				}
			})

			// ============数据执行================
			var eastForm = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				autoHeight : false,
				items : [ {
					fieldLabel : '数据表语句',
					name : 'sql_statement',
					id : 'sql_statement',
					anchor : '100%'
				}, {
					fieldLabel : '数据表参数',
					name : 'sql_property',
					id : 'sql_property',
					anchor : '100%'
				}, {
					fieldLabel : '数据结构',
					xtype : 'textarea',
					readOnly : true,
					name : 'property_value',
					id : 'property_value',
					anchor : '100%'
				} ],
				buttons : [ {
					text : '执行',
					handler : function() {
						executionForm();
					}
				} ],
				listeners : {
					resize : function() {
						Ext.getCmp("property_value").setHeight(
								eastForm.getHeight() - 110);
					}
				}
			});

			function executionForm() {
				var datasource = Ext.getCmp('datasource').getValue();
				var sql_statement = Ext.getCmp("sql_statement").getValue();
				var sql_property = Ext.getCmp("sql_property").getValue();
				if (datasource && sql_statement && !sql_property) {
					Zion.develop.db.execSql(datasource, sql_statement, null,
							function(data) {
								if (data.r && !data.f) {
									Ext.getCmp("property_value").setValue(
											data.r);
								}
							});
				} else if (datasource && sql_statement && sql_property) {
					Zion.develop.db.execSql(datasource, sql_statement,
							sql_property, function(data) {
								if (data.r && !data.f) {
									Ext.getCmp("property_value").setValue(
											data.r);
								}
							});
				} else {
					Ext.Msg.alert("提示", '请将数据填写完整');
				}
			}

			var store = new Ext.data.SimpleStore( {
				root : "r",
				fields : [ 'field_name', 'field_type', 'length' ]
			})
			var grid = new Ext.grid.GridPanel( {
				store : store,
				width : 100,
				columns : [ {
					header : "字段名",
					dataIndex : 'field_name',
					sortable : true
				}, {
					header : "字段属性",
					dataIndex : 'field_type',
					sortable : true
				}, {
					header : "字段长度",
					dataIndex : 'length',
					sortable : true
				} ],
				viewConfig : {
					autoFill : true,
					forceFit : true
				}
			})
			// grid自适应
			new Ext.Viewport( {
				layout : 'border',
				border : false,
				items : [ tree, {
					region : 'center',
					layout : 'fit',
					items : [ {
						layout : 'vbox',
						layoutConfig : {
							align : 'stretch',
							pack : 'start'
						},
						items : [ {
							xtype : 'panel',
							layout : 'fit',
							flex : 1,
							items : [ eastForm ]
						}, {
							xtype : 'panel',
							layout : 'fit',
							flex : 1,
							items : [ grid ]
						} ]
					} ]
				} ]
			});

			function loadTableTree(datasource, username) {
				Zion.develop.db.getTables(datasource, username, function(data) {
					if ((data) && (data.r)) {
						tree.setRootNode(new Ext.tree.AsyncTreeNode(
								createTableTree(data.r)));
					}
				});
			}

			function loadPropery(datasource, username, table) {
				Zion.develop.db.getTableInfo(datasource, username, table,
						function(data) {
							grid.store
									.constructor( {
										fields : [ 'field_name', 'field_type',
												'length' ],
										data : data.r
									});
						});
			}
		})