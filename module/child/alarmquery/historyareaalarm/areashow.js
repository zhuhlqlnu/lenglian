var map;
var mainPanel;
var areaOverlay;
var markerOverlay;
Ext.onReady(function() {
	Ext.QuickTips.init();
	var limit = 20;
	var loadMask = new Ext.LoadMask(Ext.getBody(), {
		msg : "加载中，请稍后 ..."
	});
	loadMask.show();
    
	map = new GMap2(document.getElementById("map_canvas"), M_DEFAULT_MAP_OPTIONS);
	setDefaultMapUI(map);
	map.setCenter(new GLatLng(34.63320791137959, 107.7099609375), 4);

    mainPanel = new MainPanel();
    var viewport = new Ext.Viewport({
        layout:'border',
        items:[
            mainPanel
         ]
    });
    
    //mainPanel.grid.store.load({params:{start:0,limit:Ext.zion.page.limit}});
    var paramsA = '99';
    mainPanel.grid.store.constructor( {
		db : {
			params : [paramsA],
			alias : "axiom_areaalarm.alarm_locrecord.select"
		},
		root : "r",
		fields : [
			'id','target_id','longitude','latitude','speed','direction','alarm_time',
			'inputdate', 'area_points','start_time','end_time','area_type','loc_desc',
			'target_name'
		]
	});
	
	mainPanel.grid.store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	})
	
	mainPanel.hideMap();
	loadMask.hide();
});
