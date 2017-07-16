/*********   播放查询参数   *********/
/**
 * 过滤时间间隔
 * @type Number
 */
var filtertimeparam = 0;
/**
 * 查询终端id
 * @type 
 */
var trackSearchDeviceid = '';
var trackSearchDevicelocateType = '';
var trackSearchDevicesimcard = '';
var trackSearchDevicevehicleNumber = '';

/*********   播放控制参数   *********/
/**
 * 播放控制对象,用来控制定时播放
 * @type 
 */
var playinterval;
/**
 * 播放速度(秒)
 * @type Number
 */
var refreshTime=1;
/**
 * 播放进度值
 * @type Number
 */
var sliderposition=0;
/**
 * 播放进度值是否超出轨迹点最大值
 * @type Number
 */
var sliderpositionflag= false;

/**
 * 播放进度条总长度
 * @type Number
 */
var sliderlen=0;
/**
 * 地图视野控制,1:锁定;2:自由视野
 * @type Number
 */
var mapViewModal = false;
/**
 * 当前状态,第一帧:0,播放:1,暂停:2,停止:3,最后一帧:4
 * @type Number
 */
var currentstate = 0;
/**
 * 上一次画点更改图标的位置
 * @type Number
 */
var prevPointPosition = 1;
/******   轨迹回放操作对象   ******/
/**
 * 起点
 * @type 
 */
var trackQidian;
/**
 * 终点
 * @type 
 */
var trackZhongdian;
/**
 * 全显轨迹点
 * @type 
 */
var trackAllPoint = new Array();
/**
 * 全显轨迹线
 * @type 
 */
var trackAllLine;
/**
 * 可操作轨迹点,用来轨迹播放时画点
 */
var trackPointArr = new Array();
/**
 * 当前播放对象
 * @type 
 */
var trackCurrent;
/**
 * map对象mapObj
 * @type 
 */
var trackmap;

/******   轨迹回放点图标   ******/
var globalPointImage = '/axiom/apps/pipe/monitor/history/images/redpoint.gif';
var bluePointImage = '/axiom/apps/pipe/monitor/history/images/bluepoint.png';
var currentPointImage = '/axiom/apps/pipe/monitor/history/images/car.png';
var prevPointImage = '/axiom/apps/pipe/monitor/history/images/car.png';
var qidianImage = '/axiom/apps/pipe/monitor/history/images/qd.png';
var zhongdianImage = '/axiom/apps/pipe/monitor/history/images/zd.png';
