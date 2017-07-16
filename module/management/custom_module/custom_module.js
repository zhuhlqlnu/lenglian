Ext.onReady(function() {
	Ext.QuickTips.init();
	var selectCorpId;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	var add_update_module = false;
	var module_name = "";
	var module_tree = new Ext.tree.TreePanel( {
		title : '自定义功能列表',
		region : 'center',
		autoScroll : true,
		animate : false,
		animate : false,
		layout:'fit',		
		animate:true,
        enableDD:true,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		tbar:[{
		    text: '增加分类',
			handler:function(){
				add_update_module = true;
                show_window();
			}, 
			icon:'/image/tree/path.gif'
		},{
		    text: '修改名称',
		    icon : Ext.zion.image_base + '/update.gif',
			handler:function(){
				add_update_module = false;
				var selectedNode = module_tree.getSelectionModel().getSelectedNode();
				if(!selectedNode){
					Ext.Msg.alert('提示','请选择要修改的节点');
				}else{
            		show_window();
				}
			}
		},{
		    text: '删除',
			icon : Ext.zion.image_base + '/delete.gif',
			handler:function(){
				add_update_module = false;
				var selectedNode = module_tree.getSelectionModel().getSelectedNode();
				/*if(selectedNode.attributes.leaf == true)
					Ext.Msg.alert('提示','请选择要删除的分类');
				}*/
				if(!selectedNode){
					Ext.Msg.alert('提示','请选择要删除的节点');
				}else{
            		selectedNode.remove();	
				}
			}
		},'-',{
		    text: '拷贝名称',
		    icon : Ext.zion.image_base + '/relegate.gif',
			handler:function(){
				show_copy_win();
			}
		},{
		    text: '原始名称',
		    icon : Ext.zion.image_base + '/arrow_redo.png',
			handler:function(){
				loadMask.show();
				loadModuleTree(function(tree) {
					module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
					loadMask.hide();
				},selectCorpId);
			}
		},'-',{
		    text: '保存',
		    icon : Ext.zion.image_base + '/save.png',
			handler:function(){
				save_custom_module_tree();
			}
		}],
		rootVisible : false,
		listeners : {
			click: function(n,e){
               module_name = n.attributes.text;
			}
		}
	});

	function show_copy_win(){
		loadMask.show();
		Ext.zion.tree.loadCorpTree(function(tree) {
			var relegateToCorp;
			var corp_tree = new Ext.tree.TreePanel( {
				autoScroll : true,
				width : 250,
				height : 250,
				loader : new Ext.tree.TreeLoader(),
				root : new Ext.tree.AsyncTreeNode(tree),
				rootVisible : false,
				listeners : {
					click : function(node) {
						relegateToCorp = node.attributes.corp.corp_id;
						if (selectCorpId == relegateToCorp) {
							button.disable();
						} else {
							button.enable();
						}
					}
				}
			});
			var button = new Ext.Button( {
				disabled : true,
				text : '确定',
				handler : function() {
					load_corp_tree_by_crop(selectCorpId,relegateToCorp);
					win.close();
				}
			});

			var win = new Ext.Window( {
				title : '集团树拷贝',
				closable : true,
				autoWidth:false,
				width:380,
				items : [ corp_tree ],
				buttons : [ button, {
					text : '取消',
					handler : function() {
						win.close();
					}
				} ]
			});
			win.show();
			loadMask.hide();
		});
	}
	
	tree_form = new Ext.form.FormPanel({
		labelWidth : 65,
		defaultType : 'textfield',
		defaults :{width : 200},
		items : [ {
			fieldLabel : '原始名称',
			name : 'old_name',
			id:'old_name',
			xtype:'label'
		},{
			fieldLabel : '名称',
			name : 'name',
			id:'name',
			maxLength : 16
		}]
	});
	 tree_window = new Ext.Window({
		title : "编辑",  
		closable : true,
		closeAction : 'hide',
		autoWidth : false,
		width : 380,
		items : [tree_form],
		buttons: [{
			text: '确定',
			handler:function(){
				if(add_update_module){
					if(Ext.getCmp("name").getValue() == null || Ext.getCmp("name").getValue() ==""){
						Ext.Msg.alert("提示","名称不能为空");
						return;
					}
					var icon_base = '/image/tree/';
					var icon_path = icon_base + 'path.gif';
					var new_module = {
						expanded : true,
						single : true,
						leaf : false,
						text : Ext.getCmp("name").getValue(),
						children : [],
						icon : icon_path
					}
					tree_window.hide();
					module_tree.getRootNode().appendChild(new_module);
				}else{
					var name = Ext.getCmp("name").getValue();
					if(name == null || name ==""){
						Ext.Msg.alert("提示","名称不能为空");
						return;
					}
					module_tree.getSelectionModel().getSelectedNode().setText(name);
					tree_window.hide();
				}
			}
		},{
			text: '取消',
			handler:function(){tree_window.hide();}
		}]
	});
	 function show_window(){
        if(add_update_module){
        	Ext.getCmp("name").setValue("");
			Ext.getCmp("old_name").setText("");	
        }else{
			if(module_tree.getSelectionModel().getSelectedNode().attributes.module_id){
				Zion.db.getJSON('axiom_custom_module.module.select',[module_tree.getSelectionModel().getSelectedNode().attributes.module_id],function(data){
					if(data.r){
						var old_module_name = data.r[0][0];
						Ext.getCmp("old_name").setText(old_module_name);	
					}
				});
			}else{
				Ext.getCmp("old_name").setText("");	
			}
        	Ext.getCmp("name").setValue(module_name);
        }
		tree_window.show();
    }
                
	var corp_tree = new Ext.tree.TreePanel( {
		id : 'tree_id',
		autoScroll : true,
		region : 'west',
		width : 250,
		loader : new Ext.tree.TreeLoader(),
		root : new Ext.tree.AsyncTreeNode(null),
		rootVisible : false,
		listeners : {
			click : function(node) {
				selectCorpId = node.attributes.corp.corp_id;
				loadMask.show();
				load_corp_tree(selectCorpId);
			}
		}
	});
	
	var viewport = new Ext.Viewport( {
		layout : 'border',
		defaults : {
			border : false
		},
		items : [{
			width:200,
			split:true,
			region : 'west',
			layout : 'fit',
			collapsible : true,
			title : '集团列表',
			items :[corp_tree]
		}, module_tree ]
	});
	
	Zion.user.getInfo(function() {
		loadMask.show();
		selectCorpId = Zion.user.corp_id;
		Ext.zion.tree.loadCorpTree(function(tree) {
			corp_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
			corp_tree.getRootNode().childNodes[0].select();
		});
		load_corp_tree(selectCorpId);
	});

	function remove_empty_path(modlue_list){
		var modlue_list_result = [];
		for(var i = 0; i < modlue_list.length; i++){
			if(modlue_list[i][3]){
				modlue_list_result.push(modlue_list[i]);
				continue;
			}
			var path = modlue_list[i][0] + ",";
			for(var j = i; j < modlue_list.length; j++){
				if((modlue_list[j][0].indexOf(path) == 0) && modlue_list[j][3]){
					modlue_list_result.push(modlue_list[i]);
					break;
				}
			}
		}
		return modlue_list_result;
	}

	function load_corp_tree_by_crop(selectCorpId, fromCorpId){
		loadMask.show();
		Zion.db.getJSON('axiom_custom_module.from_corp.select',[selectCorpId,selectCorpId,fromCorpId],function(data){
			var modlue_list = data.r;
			load_module_tree(remove_empty_path(modlue_list));

			loadMask.hide();
		});
	}

	
	function load_corp_tree(selectCorpId){
		Zion.db.getJSON('axiom_custom_module.count_by_corp.select',[selectCorpId,selectCorpId],function(data){
			if(data.r){
				if(data.r[0][0] != 0){
					Zion.db.getJSON('axiom_custom_module.by_corp.select',[selectCorpId],function(data){
						var modlue_list = data.r;
						load_module_tree(modlue_list);
						loadMask.hide();
					});
				}else{
					loadModuleTree(function(tree) {
						module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
						loadMask.hide();
					},selectCorpId);
				}
			}else{
				loadModuleTree(function(tree) {
					module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
					loadMask.hide();
				},selectCorpId);
			}	
		});	
	}
	function save_custom_module_tree(){
		var custom_module = get_custom_module_tree();
		upload_custom_module_tree(custom_module);
	}
	
	function load_module_tree(custom_module_list){
		module_tree.setRootNode(new Ext.tree.AsyncTreeNode(Ext.zion.tree.custom_module(custom_module_list)));
		loadMask.hide();
	}	
	
	function upload_custom_module_tree(custom_module){
		Zion.db.getJSON('module_tree.delete',[selectCorpId],function(data){
			if(!data.f){
				var insertNext = function(){
					if(custom_module.length>0){
						loadMask.show();
						var data_value = custom_module.pop();
						var structure = data_value[0];
						var module_id;
						if(!data_value[1]){
							module_id = "";
						}else{
							module_id = data_value[1];
						}
						var module_name = data_value[2];
						var params = [structure,module_id,module_name,selectCorpId];
						Zion.db.getJSON('module_tree.insert',params,function(data){
							if(data.r){
								insertNext();
							}
						});
					}else{
						loadMask.hide();
						Ext.Msg.alert('提示','保存成功');	
						Zion.db.getJSON('axiom_custom_module.by_corp.select',[selectCorpId],function(data){
							if(data.r){
								var modlue_list = data.r;
								load_module_tree(modlue_list);
							}	
						});
					}
				}
				if(custom_module.length>0){
					insertNext();
				}else{
					Ext.zion.tree.loadModuleTree(function(tree) {
						module_tree.setRootNode(new Ext.tree.AsyncTreeNode(tree));
					});
				}
			}else{
				
			}
		});
	}
	
	function get_custom_module_tree(){
		var custom_module = [];
		function checkedNode(node, parent, index) {
			var id;
			if(parent.length > 0){
				id = parent + "," + index;
			}else{
				id = index + "";
			}
			if (node.hasChildNodes()) {
				if(node.text == '其他'){
				
				}else{
					custom_module.push([id, null, node.text]);
					var i = 0;
					node.eachChild(function(child) {
						checkedNode(child, id , i++);
					});
				}
			}else{
				if(node.text == '其他'){
				}else{
					custom_module.push([id, node.attributes.module_id, node.text]);
				}
			}
		}
		
		var i = 0;
		module_tree.getRootNode().eachChild(function(child) {
			checkedNode(child, "" , i++);
		});
		return custom_module;
		}
	})