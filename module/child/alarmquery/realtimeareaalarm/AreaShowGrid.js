
AreaShowGrid = function(viewer, config) {
    this.viewer = viewer;
    Ext.apply(this, config);

    this.store = new Ext.zion.db.ArrayStore({
		db:{alias: alias},
		root: 'r',
		fields: fields
	});

    this.columns = [{id: 'id', header: "id",dataIndex: 'id',sortable: true, width: 10,hidden: true},
    	{ header: "target_id",dataIndex: 'target_id',sortable: true, width: 10, hidden: true},
    	{ header: "longitude",dataIndex: 'longitude',sortable: true, width: 10,hidden: true},
    	{header: "latitude",dataIndex: 'latitude',sortable: true, width: 10, hidden: true},
    	{header: "speed",dataIndex: 'speed',sortable: true, width: 10,hidden: true},
    	{header: "direction",dataIndex: 'direction',sortable: true, width: 10,hidden: true},
    	{header: "area_points",dataIndex: 'area_points',sortable: true, width: 10,hidden: true},
    	{header: "名称",dataIndex: 'target_name',sortable: true, width: 100},
    	{header: "alarm_type",dataIndex: 'alarm_type',sortable: true, width: 100,hidden: true},
    	{header: "报警时间",dataIndex: 'alarm_time',sortable: true, width: 130, renderer: this.alarmTimeRender},
    	{header: "接收时间",dataIndex: 'inputdate',sortable: true, width: 130},
    	{header: "报警开始时间",dataIndex: 'start_time',sortable: true, width: 100},
    	{header: "报警结束时间",dataIndex: 'end_time',sortable: true, width: 100},
    	{header: "报警类型",dataIndex: 'area_type',width: 100,sortable: true, renderer: this.areaTypeRender},
    	{header: "位置描述",dataIndex: 'loc_desc',width: 200,sortable: true, renderer: this.locDescRender},
    	{header: '查看', width: 100, sortable: true,  dataIndex: 'view_opt' , renderer: this.viewOptRender}
    ];

    this.bbar= new Ext.PagingToolbar({
		store: this.store,
		pageSize: Ext.zion.page.limit,
		displayInfo : true 
	});

    AreaShowGrid.superclass.constructor.call(this, {
        loadMask: {msg:'查询中...'},
        sm: new Ext.grid.RowSelectionModel({
            singleSelect:true
        }),
        viewConfig: {
            //forceFit:true,
            enableRowBody:true,
            showPreview:true
        }
    });
	
    this.on('cellclick', this.onCellclick, this);
};

Ext.extend(AreaShowGrid, Ext.grid.GridPanel, {
	
	locView: function (longitude, latitude){
		mainPanel.showMap();
		var targetIcon = new GIcon();
		targetIcon.iconSize = new GSize(23, 28);
		targetIcon.iconAnchor = new GPoint(23, 28);
		targetIcon.image = "/module/child/monitor/history/images/person.gif";
		var markerOptions = {
			icon : targetIcon,
			clickable : true
		}
		var point = new GLatLng(latitude, longitude);
		var marker = new GMarker(point, markerOptions);
		if(markerOverlay){
			map.removeOverlay(markerOverlay);
		}
		markerOverlay = marker;
		map.addOverlay(marker);
		map.setCenter(point, 13);
		
	},
	areaView: function (area_points){
		mainPanel.showMap();
		var tmpxyArr = area_points.split('#');
	    if(tmpxyArr.length<=1){
	    	return;
	    }
		var points = [];
		var tmpxy = tmpxyArr[0].split(',');
		var x = tmpxy[0];
		var y = tmpxy[1];
		for(var i = 0;i < tmpxyArr.length;i++){
			var tmpxy = tmpxyArr[i].split(',');
			points.push(new GLatLng(tmpxy[1],tmpxy[0]));
		}
		points.push(new GLatLng(y,x));
		var Polygon = new GPolygon(points,'#FF0000',3,0.5,'#ffff00',0.5)
		if(areaOverlay){
			map.removeOverlay(areaOverlay);
		}
		areaOverlay = Polygon;
		var bounds = Polygon.getBounds();
		map.addOverlay(Polygon); 
		map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds));
		
	},
	onCellclick: function (grid, rowIndex, columnIndex, e) {   
		var btn = e.getTarget('.controlBtn');
		if (btn) {
	    	var t = e.getTarget();
	    	var record = grid.getStore().getAt(rowIndex);
	    	var control = t.className;
	    	switch (control) {
		    case 'locview':
		      this.locView(record.get('longitude') , record.get('latitude'));
		      break;
		    case 'areaview':
		      this.areaView(record.get('area_points'));
		      break;
	    	}
		}   
	},
	viewOptRender: function (value, meta, record){
		var formatStr = "<a href='javascript:void({0});' onclick='javscript:return false;' class='locview'>位置</a> | <a href='javascript:void({1});' onclick='javscript:return false;' class='areaview'>区域</a>";
		var resultStr = String.format(formatStr, record.get('id'), record.get('id'));
		return "<div class='controlBtn'>" + resultStr + "</div>";
	}.createDelegate(this),
	
	alarmTimeRender: function(val){
		return val;
		//var d = new Date(val);
    	//return new Date(val).pattern("yyyy-MM-dd hh:mm:ss");
    },
    
    areaTypeRender: function(val){
    	if(val == '0'){return "出区域";}else{return "进区域";}
    },
    
    locDescRender: function(val){
    	if(val == null){
    		return '';
    	}
		return '<span style="display:table;width:100%;" qtip="' + val + '">' + val + '</span>';
    }
});

Ext.reg('areashowgrid', AreaShowGrid);