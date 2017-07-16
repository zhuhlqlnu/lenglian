
MainPanel = function(){
    this.preview = new Ext.Panel({
        id: 'preview',
        region: 'south',
        cls:'preview',
        layout : 'fit',
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
    });

    this.grid_areashow = new AreaShowGrid(this, {
    	autoScroll: true,
    	enableColumnHide : false,
        tbar:[
        {
            //split:true,
        	id: 'showHid_map1',
            text:'显示地图',
            tooltip: {title:'显示或隐藏地图'},
            iconCls: 'preview-bottom',
            handler: this.movePreview
        },{
            //split:true,
        	//id: 'showHid_map',
            text:'查看未报警信息',
            tooltip: {title:'显示未报警终端信息'},
            iconCls: 'preview-bottom',
            handler: this.showGridAreashow
        }]
    });

    this.grid_track = new TrackGrid(this, {
    	autoScroll: true,
    	enableColumnHide : false,
        tbar:[
        {
            //split:true,
        	id: 'showHid_map2',
            text:'显示地图',
            tooltip: {title:'显示或隐藏地图'},
            iconCls: 'preview-bottom',
            handler: this.movePreview
        },{
            //split:true,
        	//id: 'showHid_map',
            text:'查看报警信息',
            tooltip: {title:'显示报警终端信息'},
            iconCls: 'preview-bottom',
            handler: this.showGridTrack
        }]
    });
    
    this.gridCard = new Ext.Panel({
    	region: 'center',
        id: 'topic-grid',
    	layout: 'card',
    	activeItem: 0,
    	items: [
			this.grid_areashow ,this.grid_track
		]
    });
    
    MainPanel.superclass.constructor.call(this, {
        id:'main-tabs',
        region:'center',
        margins:'0 5 5 0',
        hideMode:'offsets',
        layout:'border',
        items:[
                this.gridCard, {
                id:'bottom-preview',
                layout:'fit',
                items:this.preview,
                height: 250,
                split: true,
                border:false,
                region:'south'
            }]
    });

};

Ext.extend(MainPanel, Ext.Panel, {

    movePreview : function(m, pressed){
        if(pressed){
            switch(m.text){
                case '显示地图':
                	mainPanel.showMap();
                    break;
                case '隐藏地图':
                	mainPanel.hideMap();
                    break;
            }
        }
    },
    showMap: function(){
    	var bot = Ext.getCmp('bottom-preview');
    	var m1 = Ext.getCmp('showHid_map1');
		m1.setText('隐藏地图');
		var m2 = Ext.getCmp('showHid_map2');
		m2.setText('隐藏地图');
        bot.add(mainPanel.preview);
        bot.show();
        bot.ownerCt.doLayout();
	},
	hideMap: function(){
		var m1 = Ext.getCmp('showHid_map1');
		m1.setText('显示地图');
		var m2 = Ext.getCmp('showHid_map2');
		m2.setText('显示地图');
        mainPanel.preview.ownerCt.hide();
        mainPanel.preview.ownerCt.ownerCt.doLayout();
	},
	showGridAreashow: function(){
		mainPanel.gridCard.layout.setActiveItem(mainPanel.grid_track);
	},
	showGridTrack: function(){
		mainPanel.gridCard.layout.setActiveItem(mainPanel.grid_areashow);
	}
});

Ext.reg('appmainpanel', MainPanel);