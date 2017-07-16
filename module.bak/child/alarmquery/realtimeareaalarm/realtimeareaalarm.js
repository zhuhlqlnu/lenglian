var map;
var mainPanel;
var areaOverlay;
var markerOverlay;
var fields = [
	'id','target_id','longitude','latitude','speed','direction','alarm_time','alarm_type',
	'inputdate', 'area_points','start_time','end_time','area_type','loc_desc',
	'target_name'
];
var alias = "axiom_areaalarm.alarm_show.select";
var fieldstrack = [
	'target_name','target_id','longitude','latitude','speed','heading','status','terminal_status_desc',
	'gps_time', 'recv_time','terminal_identity','track_id','terminal_status'
];
var aliastrack = "axiom_areaalarm.no_alarm_show.select";

var alarmInterval;
var paramsA = [];

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

	mainPanel.grid_areashow.store.constructor( {
		db : {
			alias : alias
		},
		root : "r",
		fields : fields
	});
	mainPanel.grid_areashow.store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	mainPanel.grid_track.store.constructor( {
		db : {
			alias : aliastrack
		},
		root : "r",
		fields : fieldstrack
	});
	mainPanel.grid_track.store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	alarmInterval=setInterval('alarmShowInterval();',30*1000);
	mainPanel.hideMap();
	loadMask.hide();
	
});

function alarmShowInterval(){
	mainPanel.grid_areashow.store.constructor( {
		db : {
			alias : alias
		},
		root : "r",
		fields : fields
	});
	mainPanel.grid_areashow.store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
	
	mainPanel.grid_track.store.constructor( {
		db : {
			alias : aliastrack
		},
		root : "r",
		fields : fieldstrack
	});
	mainPanel.grid_track.store.load( {
		params : {
			start : 0,
			limit : Ext.zion.page.limit
		}
	});
}
