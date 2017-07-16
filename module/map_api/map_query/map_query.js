Ext.onReady(function() {
	Ext.QuickTips.init();
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
		
	var search_result = null;
	var current_action = "name";//near near.name
	
	var page_size = 30; 
	var start_index = 0;
	var search_name;
	var search_point;
	var search_distance;
	var map;
	var markers = {};
	var marker_click_show = false;
	var last_select_row = null;
	
	function show_info(marker, no_show){
		if(!no_show){
			last_select_row = marker.grid_index;
			map.openInfoWindowHtml(marker.getLatLng(), marker.address);
		}
		marker_click_show = true;
		address_grid.getSelectionModel().selectRow(marker.grid_index);
		marker_click_show = false;
	}
	
	function draw_result(){
		map.clearOverlays();
		markers = {};
		var data = search_result.r;
		for(var i = 0; i<data.length;i++){
			var icon = new GIcon();
			icon.iconSize = new GSize(20, 28);
			icon.iconAnchor = new GPoint(8, 8);
			var markerOptions = {
				icon : icon,
				clickable : true
			}
			icon.image = "/module/pipe/management/alarm/point/images/marker.png";
			var point = new GLatLng(data[i][0], data[i][1]);
			var marker = new GMarker(point, markerOptions);
			var address = data[i][2];
			
			marker.address = address;
			marker.grid_index = i;
			map.addOverlay(marker);
			markers[data[i][3] + "-" + data[i][4]] = marker;
			GEvent.addListener(marker, "click", GEvent.callbackArgs(marker, function(){
				show_info(this);
			}));
			
			GEvent.addListener(marker, "mouseover", GEvent.callbackArgs(marker, function(){
				show_info(this, true);
			}));
			
			GEvent.addListener(marker, "mouseout", GEvent.callbackArgs(marker, function(){
				marker_click_show = true;
				address_grid.getSelectionModel().selectRow(last_select_row);
				marker_click_show = false;
			}));
		}
	}
	
	function update_grid(){
		address_store.loadData(search_result);
	}
	
	function update_button(){
		Ext.getCmp("first_page").disable();
		Ext.getCmp("prev_page").disable();
		Ext.getCmp("next_page").disable();
		Ext.getCmp("last_page").disable();
		
		if(search_result.c > (start_index + page_size)){
			Ext.getCmp("next_page").enable();
			Ext.getCmp("last_page").enable();
		}
		
		if(search_result.p > 0){
			Ext.getCmp("first_page").enable();
			Ext.getCmp("prev_page").enable();
		}
	}
	
	function search(){
		var url = "";
		if(current_action === "name"){
			url = "/s/name/"+Zion.util.encodeParam([search_name,start_index,page_size]);
		}else if(current_action === "near"){
			url = "/gq/near/"+Zion.util.encodeParam([search_point.x, search_point.y, search_distance, start_index, page_size]);
		}else if(current_action === "near.name"){
			url = "/gq/near.name/"+Zion.util.encodeParam([search_point.x, search_point.y, search_distance, search_name, start_index, page_size]);
		}else{
			return;
		}
		loadMask.show();
		$.getJSON(url,function(data){
			if(data.r){
				search_result = data;
				Ext.getCmp('search_total').setValue(data.c);
				update_grid();
				draw_result();
				update_button();
			}
			loadMask.hide();
		});		
	}
	
	address_store = new Ext.data.ArrayStore({
		fields:['lat','lng','address','layer_id','object_id'],
		totalProperty:'s',
		root:'r'
	});
	
	var address_grid = new Ext.grid.GridPanel({
		store:address_store,
		autoScroll : true,
		columns : [ {
			header : "地址",
			dataIndex : 'address',
			sortable : true,
			renderer:function(address,c,r){
				return address;
			}
		},{
			header : "周边查询",
			dataIndex : 'address',
			renderer:function(v,c,r){
				var lat = r.data["lat"];
				var lng = r.data["lng"];
				return "<a href='javascript:show_near_address("+lat+","+lng+",\""+v+"\");'>周边查询</a>";
			}
		}],
		bbar:[{
			text : '首页',
			id:'first_page',
			disabled:true,
			handler : function() {
				start_index = 0;
				search();
			}
		},{
			text : '上一页',
			id:'prev_page',
			disabled:true,
			handler : function() {
				start_index -=  page_size;
				search();
			}
		}, {
			text : '下一页',
			id:'next_page',
			disabled:true,
			handler : function() {
				start_index +=  page_size;
				search();
			}
		},{
			text : '尾页',
			id:'last_page',
			disabled:true,
			handler : function() {
				start_index = parseInt(search_result.c / page_size) * page_size;
				search();
			}
		},'共',{
			xtype: 'textfield',
			readOnly:true,
			id:'search_total',
			width:45
			},'条'],
		viewConfig : {
			autoFill : true,
			forceFit : true
		}
	})
	
	var select_button = new Ext.Button({
		text : '查询',
		tooltip : '查询',
		handler : function() {
			search_name = Ext.getCmp('term').getValue();;
			current_action = "name";
			start_index = 0;
			search();
		},
		icon : Ext.zion.image_base+'/select.gif'
	})
	
	var address_form = new Ext.form.FormPanel({
		labelWidth:85,
		items : [ {
			layout : 'column',
			items : [ {
				width:500,
				layout : 'form',
				items : [ {
					xtype : 'textfield',
					fieldLabel:'输入查询名称',
					width : 400,
					name : 'term',
					id : 'term'
				}]
			}, {
				width:70,
				items : [select_button]
			} ]
		} ]
	});
	
	address_grid.addListener('rowclick', show_address);
	function show_address(grid, rowIndex, e) {
		if(marker_click_show){
			return;
		}
		address_grid.getSelectionModel().each(function(rec){
			var marker = markers[rec.get("layer_id") + "-" + rec.get("object_id")];
			map.setCenter(marker.getLatLng());
			show_info(marker);
		});
	}
	
	var viewport = new Ext.Viewport({
		layout : 'border',
		defaults : {
			border : true
		},
		items : [{
			region : 'west',
			layout : 'fit',
			width : 300,
			split : true,
			items : [ address_grid ]
		}, {
			region : 'north',
			layout : 'fit',
			height : 50,
			items : [ address_form ]
		} ,{
			layout : 'border',
			region : 'center',
			items : [ {
				layout : 'fit',
				region : 'center',
				contentEl : 'map_canvas',
				cmargins : '5 0 0 0',
				listeners : {
					bodyresize : function(p, width, height) {
						document.getElementById("map_canvas").style.width = width;
						document.getElementById("map_canvas").style.height = height;
						if (map) {
							map.checkResize();
						}
					}
				}
			} ]
		} ]
	});

	function show_near_address(lat,lng,v){
		var show_near_form = new Ext.form.FormPanel({
			width:300,
			height:200,
			labelWidth:80,
			items:[{
				fieldLabel:'查询距离(米)',
				width:150,
				emptyText:'输入数字',
				xtype : 'textfield',
				allowBlank : false,
				id : 'distance_rangle'
			},{
				fieldLabel:'包含名称',
				width:150,
				xtype : 'textfield',
				id : 'address_name'
			}]
		})
		var show_near_win = new Ext.Window({
			title:'输入查询条件',
			width:300,
			height:200,
			items:[show_near_form],
			buttons:[{
				text:'确定',
				id:'save_button',
				handler:function(){
					start_index = 0;
					search_point = {x:lat, y:lng};
					search_distance = parseInt(Ext.getCmp("distance_rangle").getValue())
					search_name = Ext.getCmp("address_name").getValue();
					if(isNaN(search_distance)){
						Ext.Msg.alert("提示","请输入查询距离");
					}else if(search_distance>100000 || search_distance <= 0){
						Ext.Msg.alert("提示","距离数字为：大于0，小于100000");
					}else{
						if(!search_name){
							current_action = "near";
						}else{
							current_action = "near.name";
						}
						search();
						show_near_win.close()
					}
				}
			},{
				text:'取消',
				handler:function(){
					show_near_win.close();
				}
			}]
		})
		show_near_win.show();
	}
	
	window.show_near_address = show_near_address;
	
	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);
});

