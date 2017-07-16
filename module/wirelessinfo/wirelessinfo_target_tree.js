(function() {
	Ext.ns('Ext.zion');
	Ext.ns('Ext.zion.tree');
	var icon_base = '/image/tree/';
	var icon_corp = icon_base + 'corp.gif';
	var icon_group = icon_base + 'group.gif';
	var icon_target = icon_base + 'target.gif';
	var icon_path = icon_base + 'path.gif';
	var icon_module = icon_base + 'module.gif';
	Ext.zion.wirelessinfo_target_tree = {
		loadTargetTree : function(callback, checkbox, scope) {
			function createTargetTree(corp_list, group_list, target_list, target_no_group_list) {
				var corps = [];
				var corps_map = {};
				for ( var i = 0; i < corp_list.length; i++) {
					var add = true;
					corps_map[corp_list[i][0]] = corp_list[i];
					for ( var j = 0; j < corp_list.length; j++) {
						if (corp_list[j][0] == corp_list[i][1]) {
							if (!corp_list[j].corps) {
								corp_list[j].corps = [];
							}
							corp_list[j].corps.push(corp_list[i]);
							add = false;
							break;
						}
					}
					if (add) {
						corps.push(corp_list[i]);
					}
				}

				var groups_map = {};
				for ( var i = 0; i < group_list.length; i++) {
					var add = true;
					groups_map[group_list[i][0]] = group_list[i];
					for ( var j = 0; j < group_list.length; j++) {
						if (group_list[j][0] == group_list[i][1]) {
							if (!group_list[j].groups) {
								group_list[j].groups = [];
							}
							group_list[j].groups.push(group_list[i]);
							add = false;
							break;
						}
					}
					if (add) {
						if (corps_map[group_list[i][2]]) {
							if (!corps_map[group_list[i][2]].groups) {
								corps_map[group_list[i][2]].groups = [];
							}
							corps_map[group_list[i][2]].groups.push(group_list[i]);
						} else {
							if (!corps[0].groups) {
								corps[0].groups = [];
							}
							corps[0].groups.push(group_list[i]);
						}
					}
				}

				for ( var i = 0; i < target_list.length; i++) {
					if (!groups_map[target_list[i][1]].targets) {
						groups_map[target_list[i][1]].targets = [];
					}
					groups_map[target_list[i][1]].targets.push(target_list[i]);
				}

				for ( var i = 0; i < target_no_group_list.length; i++) {
					if (!corps_map[target_no_group_list[i][1]].targets) {
						corps_map[target_no_group_list[i][1]].targets = [];
					}
					corps_map[target_no_group_list[i][1]].targets.push(target_no_group_list[i]);
				}

				function checkAddGroup(group) {
					if (group.targets) {
						return true;
					}

					if (group.groups) {
						for ( var i = 0; i < group.groups.length; i++) {
							if (checkAddGroup(group.groups[i])) {
								return true;
							}
						}
					}
					return false;
				}

				function checkAddGroups(groups) {
					if (groups) {
						for ( var i = 0; i < groups.length; i++) {
							if (checkAddGroup(groups[i])) {
								return true;
							}
						}
					}
					return false;
				}

				function addGroup(node, group) {
					if (!checkAddGroup(group)) {
						return;
					}
					var nd = {
						text : group[3],
						group : {
							group_id : group[0]
						},
						checked:false,
						icon : icon_group
					};
					if (checkbox) {
						nd.checked = false;
					}
					node.children.push(nd);
					var leaf = true;
					if (group.groups && checkAddGroups(group.groups)) {
						leaf = false;
						nd.children = [];
						nd.expanded = true;
						for ( var i = 0; i < group.groups.length; i++) {
							addGroup(nd, group.groups[i]);
						}
					}

					if (group.targets) {
						leaf = false;
						if (!nd.children) {
							nd.children = [];
							nd.expanded = true;
						}
						for ( var i = 0; i < group.targets.length; i++) {
							var target = group.targets[i];
							var ndTarget = {
								text : target[2],
								target : {
									target_id : target[0],
									term_identity : target[3]
								},
								leaf : true,
								icon : icon_target
							}

							if (checkbox) {
								ndTarget.checked = false;
							}
							nd.children.push(ndTarget);
						}
					}

					if (leaf) {
						nd.leaf = true;
					}
				}

				function checkAddCorp(corp) {
					if (corp.targets) {
						return true;
					}

					if (corp.groups && checkAddGroups(corp.groups)) {
						return true;
					}

					if (corp.corps) {
						for ( var i = 0; i < corp.corps.length; i++) {
							if (checkAddCorp(corp.corps[i])) {
								return true;
							}
						}
					}
					return false;
				}

				function checkAddCorps(corps) {
					if (corps) {
						for ( var i = 0; i < corps.length; i++) {
							if (checkAddCorp(corps[i])) {
								return true;
							}
						}
					}
					return false;
				}

				function addCorp(node, corp) {
					if (!checkAddCorp(corp)) {
						return;
					}
					var nd = {
						text : corp[2],
						corp : {
							corp_id : corp[0]
						},
						expanded : true,
						icon : icon_corp
					};
					if (checkbox) {
						nd.checked = false;
					}
					node.children.push(nd);
					var leaf = true;

					if (corp.groups && checkAddGroups(corp.groups)) {
						leaf = false
						nd.children = [];
						for ( var i = 0; i < corp.groups.length; i++) {
							addGroup(nd, corp.groups[i]);
						}
					}

					if (corp.targets) {
						leaf = false;
						if (!nd.children) {
							nd.children = [];
						}
						for ( var i = 0; i < corp.targets.length; i++) {
							var target = corp.targets[i];
							var ndTarget = {
								text : target[2],
								target : {
									target_id : target[0],
									term_identity : target[3]
								},
								leaf : true,
								icon : icon_target
							}
							if (checkbox) {
								ndTarget.checked = false;
							}
							nd.children.push(ndTarget);
						}
					}

					if (corp.corps && checkAddCorps(corp.corps)) {
						leaf = false;
						if (!nd.children) {
							nd.children = [];
						}
						for ( var i = 0; i < corp.corps.length; i++) {
							addCorp(nd, corp.corps[i]);
						}
					}

					if (leaf) {
						nd.leaf = true;
					}
				}

				var tree = {
					children : []
				};

				for ( var i = 0; i < corps.length; i++) {
					addCorp(tree, corps[i]);
				}
				return tree;
			}

			Zion.user.getInfo(function(data) {
				if (data) {
					Zion.db.getJSON('monitor.realtime.user_corp', null, function(data) {
						if ((data) && (data.r)) {
							var corp_list = data.r;
							Zion.db.getJSON('wirelessinfo.wirelessinfo_list.user_group', null, function(data) {
								if ((data) && (data.r)) {
									var group_list = data.r;
									Zion.db.getJSON('wirelessinfo.wirelessinfo_list.user_target', null, function(data) {
										if ((data) && (data.r)) {
											var target_list = data.r;
											if (Zion.user.status == 1) {
												Zion.db.getJSON('wirelessinfo.wirelessinfo_list.user_target_no_group', null, function(data) {
													if ((data) && (data.r)) {
														var target_no_group_list = data.r;
														if (callback) {
															callback.call(scope || window, createTargetTree(corp_list, group_list, target_list, target_no_group_list));
														}
													}
												});
											} else {
												if (callback) {
													callback.call(scope || window, createTargetTree(corp_list, group_list, target_list, []));
												}
											}
										}
									});
								}
							});
						}
					});
				}
			});
		}
	};
	})();