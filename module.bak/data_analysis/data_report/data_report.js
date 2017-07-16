function timeStr(n) {
	return new Date(n * 1000).toLocaleString();
}

Ext
		.onReady(function() {
			Ext.QuickTips.init();
			var is_approve = false;
			var limit = 100;
			var sql_array = [];
			var fields = [ 'target_id', 'target_name', 'longitude', 'latitude',
					'speed', 'heading', 'status', 'terminal_status_desc',
					'gps_time', 'recv_time', 'temp_0', 'temp_bat_0',
					'temp_id_0', 'temp_1', 'temp_bat_1', 'temp_id_1',
					'track_id', 'terminal_status', 'voltage', 'internal_temp',
					'odometer', 'reasion', 'battery_used', 'protocol',
					'position_count' ];
			var store = new Ext.zion.db.ArrayStore( {
				db : {
					alias : "data_analysis.data_report.data_report.select"
				},
				root : "r",
				fields : fields
			});
			var select_data = [ [ 1, '所有' ], [ 2, '目标名称' ] ];
			var selelct_store = new Ext.data.SimpleStore( {
				fields : [ 'type', 'name' ],
				data : select_data
			});
			var select_combo = new Ext.form.ComboBox( {
				hiddenName : 'type',
				valueField : 'type',
				store : selelct_store,
				displayField : 'name',
				mode : 'local',
				editable : false,
				triggerAction : 'all',
				width : 100,
				listeners : {
					'select' : function(index) {
						var objv = this.getValue();
						if (objv == 1) {
							Ext.getCmp('term').setValue('');
							Ext.getCmp('startdt').setValue('');
							Ext.getCmp('term').disable();
						} else {
							Ext.getCmp('term').enable();
						}

					}
				}
			});
			select_combo.setValue(select_data[1][0]);
			var sm = new Ext.grid.CheckboxSelectionModel();
			var start_date = new Ext.form.DateField( {
				id : 'startdt',
				name : 'start_date',
				altFormats : 'Y-m-d H:i:s',
				format : 'Y-m-d H:i:s',
				editable : false,
				maxValue:new Date,
				emptyText : '请填写开始时间,查询1天',
				// blankText : '不能为空',
				width : 200
			})

			var grid = new Ext.grid.GridPanel(
					{
						store : store,
						sm : sm,
						autoScroll : true,
						columns : [ sm, {
							header : "目标编号",
							dataIndex : 'target_id',
							sortable : true
						}, {
							header : "目标名称",
							dataIndex : 'target_name',
							sortable : true
						}, {
							header : " GPS时间",
							dataIndex : 'gps_time',
							sortable : true,
							renderer : timeStr
						}, {
							header : " 接收数据时间",
							dataIndex : 'recv_time',
							sortable : true,
							renderer : timeStr
						}, {
							header : "经度(度)",
							dataIndex : 'longitude',
							sortable : true
						}, {
							header : "纬度(度)",
							dataIndex : 'latitude',
							sortable : true
						}, {
							header : "速度(公里/小时)",
							dataIndex : 'speed',
							sortable : true
						}, {
							header : "方向(度)",
							dataIndex : 'heading',
							sortable : true
						}, {
							header : "状态字",
							dataIndex : 'status',
							sortable : true
						}, {
							header : "设备状态描述",
							dataIndex : 'terminal_status_desc',
							sortable : true
						}, {
							header : "温度(1)",
							dataIndex : 'temp_0',
							sortable : true
						}, {
							header : "电量(1)",
							dataIndex : 'temp_bat_0',
							sortable : true
						}, {
							header : "编号(1)",
							dataIndex : 'temp_id_0',
							sortable : true
						}, {
							header : "温度(2)",
							dataIndex : 'temp_1',
							sortable : true
						}, {
							header : "电量(2)",
							dataIndex : 'temp_bat_1',
							sortable : true
						}, {
							header : "编号(2)",
							dataIndex : 'temp_id_1',
							sortable : true
						}, {
							header : "轨迹编号",
							dataIndex : 'track_id',
							sortable : true
						}, {
							header : "设备状态字",
							dataIndex : 'terminal_status',
							sortable : true
						}, {
							header : "设备电压",
							dataIndex : 'voltage',
							sortable : true
						}, {
							header : "设备内部温度",
							dataIndex : 'internal_temp',
							sortable : true
						}, {
							header : "里程",
							dataIndex : 'odometer',
							sortable : true
						}, {
							header : "数据回传原因",
							dataIndex : 'reasion',
							sortable : true
						}, {
							header : "备用电池使用时间(分)",
							dataIndex : 'battery_used',
							sortable : true
						}, {
							header : "数据协议",
							dataIndex : 'protocol',
							sortable : true
						}, {
							header : "已上传数据个数",
							dataIndex : 'position_count',
							sortable : true
						} ],
						tbar : [
								'请根据',
								select_combo,
								{
									xtype : 'textfield',
									width : 150,
									name : 'term',
									id : 'term'
								},
								start_date,
								{
									text : '查询',
									tooltip : '查询',
									icon : Ext.zion.image_base + '/select.gif',
									handler : selectForm
								},
								'-',
								{
									text : '导出报表',
									icon : Ext.zion.image_base + '/report_link.png',
									tooltip : '导出报表',
									handler : function() {
										var count = grid.getStore()
												.getTotalCount();
										var start_time = $('#startdt').val();
										// 开始时间转换时间戳
										var start_str = start_time.replace(
												/:/g, '-');
										start_str = start_str
												.replace(/ /g, '-');
										var start_arr = start_str.split("-");
										var start_datum = new Date(Date.UTC(
												start_arr[0], start_arr[1] - 1,
												start_arr[2], start_arr[3] - 8,
												start_arr[4], start_arr[5]));
										var starttime = start_datum.getTime() / 1000;
										var endtime = starttime
												+ (24 * 60 * 60);
										if (count > 65534) {
											Ext.Msg.alert('提示',
													'数据条数大于65336条，数据不能导出，请条件查询');
										} else if (select_combo.getValue() == 1) {
											if (isNaN(starttime)) {
												Ext.Msg
														.alert(
																"下载报表",
																"<a href='"
																		+ Zion.report
																				.getURL('data_analysis.data_report.data_report.select')
																		+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
											} else {
												Ext.Msg
														.alert(
																"下载报表",
																"<a href='"
																		+ Zion.report
																				.getURL(
																						'data_analysis.data_report.data_report_time.select',
																						[
																								starttime,
																								endtime ])
																		+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
											}

										} else if (select_combo.getValue() == 2) {
											if (select_combo.getValue() == 2) {
												if (term != ""
														&& isNaN(starttime)) {
													var type = "data_analysis.data_report.data_report.target_id.select";
													Ext.Msg
															.alert(
																	"下载报表",
																	"<a href='"
																			+ Zion.report
																					.getURL(
																							type,
																							[ $(
																									'#term')
																									.val() ])
																			+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
												} else if (term != ""
														&& !isNaN(starttime)) {
													var type = "data_analysis.data_report.data_report.condition.select";
													var params = [
															$('#term').val(),
															starttime, endtime ];
													Ext.Msg
															.alert(
																	"下载报表",
																	"<a href='"
																			+ Zion.report
																					.getURL(
																							type,
																							params)
																			+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
												} else if (term == ""
														&& !isNaN(starttime)) {
													Ext.Msg
															.alert(
																	"下载报表",
																	"<a href='"
																			+ Zion.report
																					.getURL(
																							'data_analysis.data_report.data_report_time.select',
																							[
																									starttime,
																									endtime ])
																			+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
												}
											}
										} else {
											Ext.Msg
													.alert(
															"下载报表",
															"<a href='"
																	+ Zion.report
																			.getURL(
																					'data_analysis.data_report.data_report_time.select',
																					[
																							starttime,
																							endtime ])
																	+ "' target='_blank' onclick='Ext.Msg.hide() '>点击此链接下载报表</a>");
										}
									},
									scope : this
								} ],

						bbar : new Ext.PagingToolbar( {
							store : store,
							pageSize : limit,
							displayInfo : true
						})
					});
			store.load( {
				params : {
					start : 0,
					limit : limit
				}
			});

			// 查询form
			function selectForm() {
				var type = select_combo.getValue();
				var term = $('#term').val();
				var start_time = $('#startdt').val();
				// 开始时间转换时间戳
				var start_str = start_time.replace(/:/g, '-');
				start_str = start_str.replace(/ /g, '-');
				var start_arr = start_str.split("-");
				var start_datum = new Date(Date.UTC(start_arr[0],
						start_arr[1] - 1, start_arr[2], start_arr[3] - 8,
						start_arr[4], start_arr[5]));
				var starttime = start_datum.getTime() / 1000;
				// 结束时间转换时间戳
				var endtime = starttime + (24 * 60 * 60);
				var paramsA;
				if (type == 2) {
					if (term != "" && isNaN(starttime)) {
						type = "data_analysis.data_report.data_report.target_id.select";
						paramsA = [ term ];
					} else if (term != "" && !isNaN(starttime)) {
						type = "data_analysis.data_report.data_report.condition.select";
						paramsA = [ term, starttime, endtime ];
					} else if (term == "" && !isNaN(starttime)) {
						type = "data_analysis.data_report.data_report_time.select";
						paramsA = [ starttime, endtime ];
					} else {
						type = "data_analysis.data_report.data_report.select";
					}
				} else if (type == 1) {
					if (isNaN(starttime)) {
						type = "data_analysis.data_report.data_report.select";
					} else {
						type = "data_analysis.data_report.data_report_time.select";
						paramsA = [ starttime, endtime ];
					}
				} else {
					type = "data_analysis.data_report.data_report.select";
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
						limit : limit
					}
				})
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