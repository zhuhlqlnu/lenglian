Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();

	var select_store = new Ext.data.ArrayStore( {
		fields : [ 'configure' ]
	});

	var select_combo = new Ext.form.ComboBox( {
		fieldLabel : '配置项',
		id : 'configure',
		valueField : 'configure',
		store : select_store,
		displayField : 'configure',
		mode : 'local',
		editable : false,
		triggerAction : 'all',
		anchor : '100%',
		listeners : {
			'select' : function() {
				loadConfigureTree(Ext.getCmp('configure').getValue());
			}
		}
	});

	var form = new Ext.form.FormPanel( {
		items : [ select_combo ]
	})

	function createConfigureTree(configure_list) {
		var tree = {
			children : []
		};
		var search = {};

		for ( var i = 0; i < configure_list.length; i++) {
			var configure = configure_list[i];
			var paths = configure[0].split('.');
			var node = tree;
			var path = null;
			for ( var j = 0; j < paths.length - 1; j++) {
				path = (path == null ? paths[j] : (path + "." + paths[j]));
				if (!search[path]) {
					search[path] = {
						// expanded : true,
						single : true,
						text : paths[j],
						children : []
					};
					node.children.push(search[path]);
				}
				node = search[path];
			}
			node.children.push( {
				single : true,
				leaf : true,
				text : paths[paths.length - 1],
				property : configure

			});
		}
		return tree;
	}

	var tree = new Ext.tree.TreePanel( {
		title : '属性列表',
		id : 'm-tree',
		rootVisible : false,
		autoScroll : true,
		collapsible : true,
		animate : false,
		split : true,
		region : 'west',
		margins : '5 0 0 0',
		cmargins : '5 5 0 0',
		width : 250,
		minSize : 100,
		maxSize : 350,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		tools : [ {
			id : 'refresh',
			on : {
				click : function() {
					loadConfigureTree(Ext.getCmp('configure').getValue());
				}
			}
		} ],
		tbar : [ ' ', new Ext.form.TextField( {
			width : 240,
			emptyText : '输入条件',
			enableKeyEvents : true,
			listeners : {
				render : function(f) {
					tree.filter = new Ext.tree.TreeFilter(tree, {
						clearBlank : true,
						autoClear : true
					});
					tree.hiddenPkgs = [];
				},
				keydown : {
					fn : function(t, e) {
						var text = t.getValue();
						Ext.each(tree.hiddenPkgs, function(n) {
							n.ui.show();
						});
						if (!text) {
							tree.filter.clear();
							return;
						}
						tree.expandAll();

						var re = new RegExp('^' + Ext.escapeRe(text), 'i');

						tree.filter.filterBy(function(n) {
							if(n.leaf){
								return re.test(n.text);
							}else{
								return true;
							}
						});

						 

					},
					buffer : 350,
					scope : this
				},
				scope : this
			}
		}) ],

		listeners : {
			click : function(n) {
				if (n.leaf) {
					loadPropery(Ext.getCmp('configure').getValue(),
							n.attributes.property);
				}
			}
		}
	})
	tree.getSelectionModel().on('beforeselect', function(sm, node) {
		return node.isLeaf();
	});
	// ============增加数据form================
		var eastForm = new Ext.form.FormPanel( {
			defaultType : 'textfield',
			autoHeight : false,
			height : '100%',
			items : [ {
				fieldLabel : '属性名称',
				name : 'property_name',
				id : 'property_name',
				anchor : '100%'
			}, {
				fieldLabel : '属性值',
				xtype : 'textarea',
				name : 'property_value',
				id : 'property_value',
				anchor : '100%'
			} ],
			buttons : [ {
				text : '修改',
				handler : function() {
					addForm();
				}
			}, {
				text : '删除',
				handler : function() {
					deleteForm();
				}
			} ],
			listeners : {
				resize : function() {
					Ext.getCmp("property_value").setHeight(
							this.getHeight() - 80);
				}
			}
		});

		function addForm() {
			var configure = Ext.getCmp('configure').getValue();
			var property_name = Ext.getCmp("property_name").getValue();
			var property_value = Ext.getCmp("property_value").getValue();
			if (configure && property_name && property_value) {
				Zion.configure.putProperty(configure, property_name,
						property_value, function(data) {
							if (data.r && !data.f) {
								Ext.Msg.alert("提示", '数据修改成功');
							} else {
								Ext.Msg.alert("提示", '数据修改失败');
							}
						});
			} else {
				Ext.Msg.alert("提示", '请将数据填写完整');
			}
		}

		function deleteForm() {
			var configure = Ext.getCmp('configure').getValue();
			var property_name = Ext.getCmp("property_name").getValue();
			if (configure && property_name) {
				Ext.Msg.confirm('删除确认', '你是否确认删除？', function(btn) {
					if (btn == 'yes') {
						Zion.configure.removeProperty(configure, property_name,
								function(data) {
									if (data.r && !data.f) {
										Ext.getCmp("property_name")
												.setValue("");
										Ext.getCmp("property_value").setValue(
												"");
										Ext.Msg.alert("提示", '数据删除成功');
									} else {
										Ext.Msg.alert("提示", '数据删除失败');
									}
								});
					}
				})
			} else {
				Ext.Msg.alert("提示", '请将数据填写完整');
			}
		}
		// grid自适应
		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ {
				region : 'north',
				layout : 'fit',
				height : 50,
				items : [ form ]
			}, tree, {
				region : 'center',
				layout : 'fit',
				items : [ eastForm ]
			} ]
		});

		function loadConfigureTree(configure) {
			Ext.getCmp("property_name").setValue("");
			Ext.getCmp("property_value").setValue("");
			loadMask.show();
			Zion.configure.getProperties(configure, function(data) {
				if ((data) && (data.r)) {
					tree.setRootNode(new Ext.tree.AsyncTreeNode(
							createConfigureTree(data.r)));
					loadMask.hide();
				}
			});
		}

		function loadPropery(configure, property) {
			loadMask.show();
			Ext.getCmp("property_name").setValue(property);
			Ext.getCmp("property_value").setValue("");
			Zion.configure.getProperty(configure, property, function(data) {
				Ext.getCmp("property_name").setValue(property);
				Ext.getCmp("property_value").setValue(data.r);
				loadMask.hide();
			});
		}

		Zion.configure.getConfigures(function(data) {
			select_store.loadData(data.r);
			loadMask.hide();
		})
	})