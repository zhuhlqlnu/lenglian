$(function(){
	var icon_base = '/image/tree/';
	var icon_path = icon_base + 'path.gif';
	var icon_module = icon_base + 'module.gif';
	Ext.zion.tree.custom_module = function(module_list){
		var tree = {
			children : []
		};
		var search = {};
		var max_level = 0;
		for ( var i = 0; i < module_list.length; i++) {
			max_level = Math.max(max_level, module_list[i][0].split(",").length);
		}
		module_list.sort(function(a, b){
			var as = a[0].split(",");
			var bs = b[0].split(",");
			
			if(as.length < bs.length){
				return -1;
			}
			
			if(as.length > bs.length){
				return 1;
			}
			
			for(var i = 0; i < as.length; i++){
				if(parseInt(as[i]) < parseInt(bs[i])){
					return -1;
				}else if(parseInt(as[i]) > parseInt(bs[i])){
					return 1;
				}
			}
			return 0;
		});
		
		/*function check_show(module,  module_list){
			for(var i = 0; i < module_list.length; i++){
				var tmp = module_list[i];
				if((tmp[0].indexOf(module[0]) == 0) && (module[0] !== tmp[0])){
					if(tmp[1]){
						return true;
					}else{
						return check_show(tmp, module_list);
					}
				}
			}
			return false;
		}*/
		
		var ungroup_root = {
			expanded : true,
			single : true,
			leaf : false,
			text : '其他',
			children : [],
			icon : icon_path
		};
		var tmp_node;
		for(var i = 1; i <= max_level; i++){
			for(var j = 0; j < module_list.length; j++){
				var module = module_list[j];
				var levels = module[0].split(",");
				
				if(levels.length == i){			
					if(i == 1){
						node = tree;
					}else{
						levels.pop();
						node = search[levels.join(",")];
					}

					node = node || tree;					
					if(module[1]){
						if(module[0] == 'a'){
							var ungroup_node = {
								single : true,
								leaf : true,
								text : module[2],
								url : module[3].split(".").join('/'),
								module_id : module[1],
								icon : icon_module
							}
							ungroup_root.children.push(ungroup_node);
						}else{
							node.children.push( {
								single : true,
								leaf : true,
								text : module[2],
								url : module[3].split(".").join('/'),
								module_id : module[1],
								icon : icon_module
							});
						}
					}else{
						//if(check_show(module, module_list)){
							tmp_node = {
								expanded : true,
								single : true,
								leaf : false,
								text : module[2],
								children : [],
								icon : icon_path
							};
							node.children.push(tmp_node);						
							search[module[0]] = tmp_node;
						//}
					}
				}
			}
		}
		if(ungroup_root.children.length == 0){
			
		}else{
			tree.children.push(ungroup_root);
			search[module[0]] = ungroup_root;
		}
		return tree;
	}
}())
