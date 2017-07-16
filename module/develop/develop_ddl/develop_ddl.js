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
				} ]
			})

			// ============增加数据form================
			var eastForm = new Ext.form.FormPanel( {
				defaultType : 'textfield',
				autoHeight : false,
				items : [ {
					fieldLabel : '数据表语句',
					xtype : 'textarea',
					name : 'exec_sql',
					id : 'exec_sql',
					anchor : '100%'
				} ],
				buttons : [ {
					text : '执行',
					handler : function() {
						executionForm();
					}
				}],
				listeners : {
					resize : function() {
						Ext.getCmp("exec_sql").setHeight(
								this.getHeight() - 60);
					}
				}
			});

			function executionForm() {
				var datasource = Ext.getCmp('datasource').getValue();
				var exec_sql = Ext.getCmp("exec_sql").getValue();	
				if (datasource&&exec_sql ) {
					Zion.develop.db.execDdl(datasource, exec_sql, function(data) {
						if (data.r && !data.f) {
							Ext.Msg.alert("提示", '数据执行完成');
						}else{
							Ext.Msg.alert("提示", '数据执行有误');
						}
					});
				} 
				else{
					Ext.Msg.alert("提示", '请将数据填写完整');
				}
			}
			// grid自适应
			new Ext.Viewport( {
				layout : 'border',
				border : false,
				items : [ tree, {
					region : 'center',
					layout : 'fit',
					items : [ eastForm]
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

		})