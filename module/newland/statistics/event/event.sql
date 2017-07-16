
sql.newland.statistics.event.recv_time.select.count = main,select count(*) from axiom_track_thenewworld t where t.ext_photoname is not null and t.recv_time>? and t.recv_time<? 
sql.newland.statistics.event.recv_time.select.page = main,select * from (select a.* ,rownum row_num from (select t.target_id,t.ext_photoname,t.recv_time,t.longitude,t.latitude,t.speed,t.heading,t.status,t.terminal_status_desc,t.terminal_status,t.ext_acceleration,t.ext_altitude,t.ext_distance,t.ext_sate_num,t.geocoding from axiom_track_thenewworld t where t.ext_photoname is not null and t.recv_time>? and t.recv_time<? order by t.recv_time desc)a) b where  b.row_num between ? and ?
 
report.newland.statistics.event.recv_time.select.head=新大陆拍照统计,上报时间, 纬度, 经度, 速度, 加速度, 高度, 离上次定位的距离, 卫星数量, 位置描述 
report.newland.statistics.event.recv_time.select.sql = main,select to_char(axiom_utc_to_date(t.recv_time),'yyyy-mm-dd hh24:mi:ss'),t.longitude,t.latitude,t.speed,t.ext_acceleration,t.ext_altitude,t.ext_distance,t.ext_sate_num,t.geocoding from axiom_track_thenewworld t where t.ext_photoname is not null and t.recv_time>? and t.recv_time<? order by t.recv_time desc
