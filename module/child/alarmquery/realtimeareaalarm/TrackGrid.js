
TrackGrid = function(viewer, config) {
    this.viewer = viewer;
    Ext.apply(this, config);

    this.store = new Ext.zion.db.ArrayStore({
		db:{alias: aliastrack},
		root: 'r',
		fields: fieldstrack
	});

    this.columns = [
    	{ header: "名称",dataIndex: 'target_name',sortable: true, width: 100},
    	{ header: "target_id",dataIndex: 'target_id',sortable: true, width: 10, hidden: true},
    	{ header: "longitude",dataIndex: 'longitude',sortable: true, width: 10,hidden: true},
    	{header: "latitude",dataIndex: 'latitude',sortable: true, width: 10, hidden: true},
    	{header: "速度",dataIndex: 'speed',sortable: true, width: 100},
    	{header: "方向",dataIndex: 'heading',sortable: true, width: 100},
    	{header: "状态",dataIndex: 'status',sortable: true, width: 100},
    	{header: "terminal_status_desc",dataIndex: 'terminal_status_desc',sortable: true, width: 100,hidden: true},
    	{header: "GPS时间",dataIndex: 'gps_time',sortable: true, width: 130},
    	{header: "接收时间",dataIndex: 'recv_time',sortable: true, width: 130},
    	{header: "terminal_identity",dataIndex: 'terminal_identity',sortable: true, width: 130,hidden: true},
    	{header: "track_id",dataIndex: 'track_id',sortable: true, width: 100,hidden: true},
    	{header: "terminal_status",dataIndex: 'terminal_status',sortable: true, width: 100,hidden: true},
    	{header: '查看', width: 100, sortable: true,  dataIndex: 'view_opt' , renderer: this.viewOptRender}
    ];

    this.bbar= new Ext.PagingToolbar({
		store: this.store,
		pageSize: Ext.zion.page.limit,
		displayInfo : true 
	});

    TrackGrid.superclass.constructor.call(this, {
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

Ext.extend(TrackGrid, Ext.grid.GridPanel, {
	
	locView: function (longitude, latitude){
		if(longitude == null || latitude == null){
			Ext.Msg.alert('提示','无上报GPS信息');
			return;
		}
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
	    	}
		}   
	},
	viewOptRender: function (value, meta, record){
		var formatStr = "<a href='javascript:void({0});' onclick='javscript:return false;' class='locview'>位置</a>";
		var resultStr = String.format(formatStr, record.get('id'), record.get('id'));
		return "<div class='controlBtn'>" + resultStr + "</div>";
	}.createDelegate(this),
	
	alarmTimeRender: function(val){
		return val;
		//var d = new Date(val);
    	//return new Date(val).pattern("yyyy-MM-dd hh:mm:ss");
    },
    
    locDescRender: function(val){
    	if(val == null){
    		return '';
    	}
		return '<span style="display:table;width:100%;" qtip="' + val + '">' + val + '</span>';
    }
});

Ext.reg('trackgrid', TrackGrid);