(function() {
	Ext.ns('Ext.zion');
	Ext.ns('Ext.zion.tree');
	var icon_base = '/image/tree/';
	var icon_path = icon_base + 'path.gif';
	var icon_module = icon_base + 'module.gif';

	loadModuleTree = function(callback,corp_id, scope) {
		function createTree(module_list, path_list) {
			var tree = {
				children : []
			};
			var search = {};
			var path_name = {};
			for ( var i = 0; i < path_list.length; i++) {
				var path = path_list[i];
				path_name[path[0]] = [path[1], path[2]];
			}

			for ( var i = 0; i < module_list.length; i++) {
				var module = module_list[i];
				var paths = module[1].split('.');
				var node = tree;
				var path = null;
				for ( var j = 0; j < paths.length - 1; j++) {
					path = (path == null ? paths[j] : (path + "." + paths[j]));
					if (!search[path]) {
						search[path] = {
							expanded : true,
							single : true,
							text : path_name[path] ? path_name[path][0] : paths[j],
							order: path_name[path] ? path_name[path][1] : null,
							children : [],
							icon : icon_path
						};
						node.children.push(search[path]);
					}
					node = search[path];
				}
				node.path = path;//.substring(1);
				node.children.push( {
					single : true,
					leaf : true,
					text : module[2],
					order : module[5],
					module_id : module[0],
					url : module[4] ? module[4] : paths.join('/'),
					icon : icon_module
				});
			}
			
			function sortByOrder(node){
				if(node.children){
					node.children.sort(function(a,b){
						if((a.order == null) && (b.order == null)){
							return 0;
						}
						if(a.order == null){
							return -1;
						}
						if(b.order == null){
							return 1;
						}
						return a.order - b.order;
					});
					for(var i = 0; i < node.children.length; i++){
						sortByOrder(node.children[i]);
					}
				}
			}
			sortByOrder(tree);
			return tree;
		}

		Zion.user.getInfo(function(data) {
			if (data) {
				Zion.db.getJSON('module_list_by_corp',[corp_id,corp_id], function(data) {
					if ((data) && (data.r)) {
						var module_list = data.r;
						Zion.db.getJSON('module_path_list', null, function(data) {
							if ((data) && (data.r)) {
								var modlue_path_list = data.r;
								var tree = createTree(module_list, modlue_path_list);
								if (callback) {
									callback.call(scope || window, tree);
								}
							}
						});
					}
				});
			}
		});
	}
})();