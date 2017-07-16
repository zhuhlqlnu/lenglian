Ext.onReady(function() {

	Ext.QuickTips.init();
	var formPanel;
	var selectNode;
	var add_group = false;
	var checkeding = false;
	var selectCorpId;
	var selectGroupId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});

	loadMask.show();

	var icon_base = '/image/tree/';
	var icon_corp = icon_base + 'corp.gif';
	var icon_group = icon_base + 'group.gif';
	var icon_target = icon_base + 'target.gif';
	var icon_path = icon_base + 'path.gif';
	var icon_module = icon_base + 'module.gif';
//=================组的添加修改删除操作窗口===========
//		============增加数据form================
	function win_show(){
		formPanel = new Ext.form.FormPanel({
	        defaultType: 'textfield',	      
	        items: [{
	                fieldLabel: '目标组名称',
	                name: 'group_name',
					id: 'group_name',
					allowBlank: false,
					blankText:'不能为空'
	            },{
					xtype : "radiogroup",
					fieldLabel : '是否生效',
					isFormField : true,
					items : [{
							columnWidth : .5,
							checked : true,
							xtype : "radio",
							boxLabel : "生效",
							name : "enable",
							inputValue : 1
						}, {
							columnWidth : .5,
							xtype : "radio",
							boxLabel : "不生效",
							name : "enable",
							inputValue : 0
						}]
				},{
					xtype : 'textarea',
	                fieldLabel: '备注',
	                name: 'memo',
					id: 'memo'
	            }]						 
			})
		
//----------------------目标组窗口window------------------------
			var group_win = new Ext.Window({
				title: '目标组信息',
				closable:true,
				items:[formPanel],
		        buttons: [{
		            text: '保存',
					handler:function(){
						if(add_group){
							add_group_from(formPanel,group_win);
						}else{
							update_group_from(formPanel,group_win);
						}
					}
		        },{
		            text: '取消',
					handler:function(){group_win.close();}
		        }]
			})
			
			group_win.show();

		}

//=================组的添加修改删除操作窗口===========

//================目标组树group_tree===============

		var group_tree = new Ext.tree.TreePanel({
			title : '目标组列表',
			id : 'group_tree_id',
			autoScroll : true,
			collapsible : false,
			split : true,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			tbar:[{
					id:'addButton',
					text: '新增',
					icon:Ext.zion.image_base+'/add.gif',
					tooltip:'增加子组',					
					handler:newAddForm,
	                scope:this
				},'-',//'-'给工具栏按钮之间添加'|'
				{
					id:'editButton',
					text:'修改',
					disabled : true,
					icon:Ext.zion.image_base+'/update.gif',
					tooltip:'修改记录',
					handler:updateForm,				
	                scope:this
				},'-',
				{
					id : 'deleteButton',
					text:'删除',
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
	                handler: refresh,
	               	scope:this
				}
			],

			listeners : {
				click : function(node) {
					car_tree.enable();
					Ext.getCmp('editButton').enable();
					Ext.getCmp('deleteButton').enable();
					selectNode = node;
					selectGroupId = node.attributes.group.group_id;
					Zion.db.getJSON('device_group.group_target.select', [ selectGroupId ],
						function(data) {
							if (!data.f) {
								checkedCar(data.r);
							}
						});
					
				}
			}
		});



		// ==============corp_tree=================
		
		function deleteCorpCar(car_id) {
			if(selectGroupId){
				Zion.db.getJSON('device_group.group_target.delete', [ selectGroupId, car_id ], function(data) {
					if (!data.f) {
	
					} else {
					}
				})
			}else{
				
			}
		}

		function insertCorpCar(car_id) {
			if(selectGroupId){
				Zion.db.getJSON('device_group.group_target.insert', [ selectGroupId, car_id ], function(data) {
					if (!data.f) {
	
					} else {
					}
				})
			}else{
				
			}
		}

		function appendCorpNode(corp_list, node, index) {

			var nodeAdd = {};
			nodeAdd.text = corp_list[index][2];
			nodeAdd.expanded = true;
			nodeAdd.icon = icon_corp;
			nodeAdd.corp = {
				corp_id : corp_list[index][0],
				selectCorpId : corp_list[index][1],
				order_by : corp_list[index][3],
				group_id : corp_list[index][4]
			};

			node.children.push(nodeAdd);
			if (corp_list[index].children) {
				nodeAdd.children = [];
				for ( var i = 0; i < corp_list[index].children.length; i++) {
					appendCorpNode(corp_list, nodeAdd,
							corp_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}

		function createCorpTree(corp_list) {
			var tree = {
				children : []
			};

			for ( var i = 0; i < corp_list.length; i++) {
				for ( var j = 0; j < corp_list.length; j++) {
					if (corp_list[j][0] == corp_list[i][1]) {
						if (!corp_list[j].children) {
							corp_list[j].children = [];
						}
						corp_list[j].children.push(i);
						corp_list[i].child = true;
					}
				}
			}

			for ( var i = 0; i < corp_list.length; i++) {
				if (!corp_list[i].child) {
					appendCorpNode(corp_list, tree, i);
				}
			}

			return tree;
		}

		function loadCorpTree(callback, scope) {
			Zion.db.getJSON('tree.user_corp', null, function(data) {
				if ((data) && (data.r)) {
					if (callback) {
						callback.call(scope || window, createCorpTree(data.r));
					}
				}
			});
		}

		// ==============car_tree=================
		// car_id,corp_id,car_name
		function appendCarNode(car_list, node, index) {
			var nodeAdd = {};
			nodeAdd.text = car_list[index][2];
			nodeAdd.checked = false;
			nodeAdd.expanded = true;
			nodeAdd.icon = icon_target;
			nodeAdd.car = {
				car_id : car_list[index][0],
				corp_id :car_list[index][1],
				car_name : car_list[index][2]
			};

			node.children.push(nodeAdd);
			if (car_list[index].children) {
				nodeAdd.children = [];
				for ( var i = 0; i < car_list[index].children.length; i++) {
					appendCarNode(car_list, nodeAdd,
							car_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}
		function appendGroupNode(group_list, node, index) {
			var nodeAdd = {};
			nodeAdd.text = group_list[index][2];
//			nodeAdd.checked = false;
			nodeAdd.expanded = true;
			nodeAdd.icon = icon_group;
			nodeAdd.group = {
				group_id : group_list[index][0],
				parent_id :group_list[index][1],
				group_name : group_list[index][2]
			};

			node.children.push(nodeAdd);
			if (group_list[index].children) {
				nodeAdd.children = [];
				for ( var i = 0; i < group_list[index].children.length; i++) {
					appendGroupNode(group_list, nodeAdd,
							group_list[index].children[i]);
				}
			} else {
				nodeAdd.leaf = true;
			}
		}

		function createCarTree(car_list) {
			var tree = {
				children : []
			};

			 

			for ( var i = 0; i < car_list.length; i++) {
				if (!car_list[i].child) {
					appendCarNode(car_list, tree, i);
				}
			}
			return tree;
		}

		function createGroupTree(group_list) {
			var tree = {
				children : []
			};

			for ( var i = 0; i < group_list.length; i++) {
				for ( var j = 0; j < group_list.length; j++) {
					if (group_list[j][0] == group_list[i][1]) {
						if (!group_list[j].children) {
							group_list[j].children = [];
						}
						group_list[j].children.push(i);
						group_list[i].child = true;
					}
				}
			}

			for ( var i = 0; i < group_list.length; i++) {
				if (!group_list[i].child) {
					appendGroupNode(group_list, tree, i);
				}
			}
			return tree;
		}

		var car_tree = new Ext.tree.TreePanel( {
			autoScroll : true,
			animate : false,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				checkchange : function(node, checked) {
					if (checkeding) {
						return;
					}

					if (node.attributes.car.car_id) {
						if (checked) {
							insertCorpCar(node.attributes.car.car_id);
						} else {
							deleteCorpCar(node.attributes.car.car_id);
						}
					}

					node.attributes.checked = checked;
					if (node.hasChildNodes()) {
						node.eachChild(function(child) {
							child.ui.toggleCheck(checked);
						});
					}
				}
			}
		});

		function loadCarTree(callback, scope) {
			Zion.db.getJSON('device_group.axiom_target_corp.select',
					[ selectCorpId ], function(data) {
						if ((data) && (data.r)) {
							if (callback) {
								callback.call(scope || window,
										createCarTree(data.r));
							}
						}
					});
		}

		function loadGroupTree(callback, scope) {
			Zion.db.getJSON('device_manage.device_group.crop_group',
					[ selectCorpId ], function(data) {
						if ((data) && (data.r)) {
							if (callback) {
								callback.call(scope || window,
										createGroupTree(data.r));
							}
						}
					});
		}

		Zion.user.getInfo(function() {
			selectCorpId = Zion.user.corp_id;
			reloadCarTree();
			reloadGroupTree();
		});

		// =========显示树和grid列表================

		var tree = new Ext.tree.TreePanel( {
			title : '集团列表',
			id : 'tree_id',
			autoScroll : true,
			collapsible : true,
			split : true,
			region : 'west',
			width : 200,
			loader : new Ext.tree.TreeLoader(),
			root : new Ext.tree.AsyncTreeNode(null),
			rootVisible : false,
			listeners : {
				click : function(node) {
					selectCorpId = node.attributes.corp.corp_id;
					selectGroupId = node.attributes.corp.group_id;
					reloadGroupTree();
					reloadCarTree();
					Ext.getCmp('editButton').disable();
					Ext.getCmp('deleteButton').disable();
					car_tree.disable();

				}
			}
		});

		new Ext.Viewport( {
			layout : 'border',
			border : false,
			items : [ tree, {
				region : 'center',
				layout : 'fit',
				items : [ group_tree ]
			}, {
				region : 'east',
				layout : 'fit',
				collapsible : true,
				split : true,
				region : 'east',
				width : 240,
				minSize : 100,
				maxSize : 300,
				title : '目标列表',
				items : [ car_tree ]
			} ]
		});

		function checkedCar(car) {
			var mod_map = {};
			for ( var i = 0; i < car.length; i++) {
				mod_map[car[i]] = car[i];
			}
			function checkedNode(node) {
				if (node.attributes.car&&mod_map[node.attributes.car.car_id]) {
					node.attributes.checked = true;
					node.ui.toggleCheck(true);
				} else {
					node.attributes.checked = false;
					node.ui.toggleCheck(false);
				}
				if (node.hasChildNodes()) {
					node.eachChild(function(child) {
						checkedNode(child);
					});
				}
			}
			checkeding = true;
			checkedNode(car_tree.getRootNode());
			checkeding = false;
		}
		
		function reloadCarTree() {
			loadCarTree(function(tree) {
				car_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
				car_tree.disable();
			});
		}

		function reloadGroupTree() {
			loadGroupTree(function(tree) {
				group_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
//				group_tree.getRootNode().childNodes[0].select();
			});
		}

		loadCorpTree(function(corpTree) {
			tree.setRootNode(new Ext.tree.AsyncTreeNode(corpTree));
			tree.getRootNode().childNodes[0].select();
			loadMask.hide();
		});
//		===========目标组组的操作：增删改刷============
		function newAddForm(){
			add_group = true;
			win_show();
		}
		
		function updateForm(){
			add_group = false;
			win_show();
			Ext.zion.db.getJSON('device_group.group.select',[selectGroupId],function(data){
				if(data.r&&data.r!=0){
					var group_store = new Ext.data.SimpleStore({
						fields : ['group_id','group_name','enable','memo'],
						data : data.r
					
					});
					formPanel.form.loadRecord(group_store.getAt(0));
				}else{
					Ext.Msg.alert('提示','数据加载失败！');
				}
			
			},this);
			
		}
		
		function deleteForm(){
			if(selectNode.hasChildNodes()){
				Ext.Msg.alert('警告','要删除的组不能含有子组！');
				return null;
			}
			Ext.Msg.confirm('删除确认','你是否确认删除选中的记录？',function(btn){
			if (btn == 'yes') {
				Ext.zion.db.getJSON('device_group.group_target.delete_all',[selectGroupId],function(data){
					if(!data.f){
						Ext.zion.db.getJSON('device_group.group.delete',[selectGroupId],function(data){
							if(data.r&&data.r!=0){
								Ext.Msg.alert('提示','删除成功！');
								refresh();
								//reloadCarTree();
							}else{
								Ext.Msg.alert('提示','删除失败！');
							}
						
						},this);
					}else{
						Ext.Msg.alert('提示','删除失败！');
					}
				
				},this);
			}})

		}
		
		function refresh(){
			reloadGroupTree();
			car_tree.disable();
			Ext.getCmp('editButton').disable();
			Ext.getCmp('deleteButton').disable();
		}
		
		function add_group_from(form,win){
			var params_add = Ext.zion.form.getParams(form.form,['group_name','enable','memo']);
			params_add.push(selectGroupId);
			params_add.push(selectCorpId);
			Ext.zion.db.getJSON('device_group.group.insert',params_add,function(data){
				if(data.r&&data.r!=0){
					Ext.Msg.alert('提示','添加成功！');
					win.close();
					refresh();
				}else{
					Ext.Msg.alert('提示','添加失败！');
				}
			
			},this);
			
		}
		
		function update_group_from(form,win){
			var params = Ext.zion.form.getParams(form.form,['group_name','enable','memo']);
			params.push(selectGroupId);
			Ext.zion.db.getJSON('device_group.group.update',params,function(data){
				if(data.r&&data.r!=0){
					Ext.Msg.alert('提示','修改成功！');
					win.close();
					refresh();
				}else{
					Ext.Msg.alert('提示','修改失败！');
				}
			
			},this);
						
		}
		
//		===========目标组组的操作：增删改刷============
		
	})