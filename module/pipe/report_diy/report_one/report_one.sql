//sql.script//旧语句,已不使用
sql.pipe.report_diy.report_one.query_L.count =  main,select count(*) from 
(select base.gps_date,  target.target_name, nvl(patrol_count, 0) patrol_count, nvl(speed_count, 0) speed_count, nvl(region_count, 0) region_count, nvl(piont_count, ?) piont_count, nvl(task_count, 0) task_count from (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as patrol_count from axiom_track_gpstracker where target_id = ? and bitand(terminal_status, 16) = 16 and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) patrol,(select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as speed_count from axiom_alarm_speed where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) speed,(select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as region_count from axiom_alarm_region where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) region, (select gps_date,count(point_id)-(select count(point_id) from axiom_analyze_target_point where target_id = ?) as piont_count from (select point_id ,to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60)),point_id) group by gps_date) point, (select to_char(axiom_utc_to_date(trunc(task_date / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as task_date, count(task_date) as task_count from pipe_special_task where target_id = ? and task_date between ? and ? group by trunc(task_date / (24 * 60 * 60))) task, (select pat.target_id from pipe_attendant pat where pat.target_id = ?),(select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum - 1) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from dual connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base, (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+))
sql.pipe.report_diy.report_one.query_L.page =  main,select * from (select a.*,rownum row_num from (select gps_date, target_name, patrol_count, speed_count, region_count, piont_count, task_count, decode(sign(sign(piont_count*2 - 1) + sign(task_count) * -2), -1, 'Y', 'N') from (select base.gps_date, target.target_name, nvl(patrol_count, 0) patrol_count, nvl(speed_count, 0) speed_count, nvl(region_count, 0) region_count, nvl(piont_count, (select count(point_id) from axiom_analyze_target_point where target_id = ?)) piont_count, nvl(task_count, 0) task_count from (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as patrol_count from axiom_track_gpstracker where target_id = ? and bitand(terminal_status, 16) = 16 and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) patrol,(select to_char(axiom_utc_to_date(trunc(gps_time /(24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as speed_count from axiom_alarm_speed where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) speed,(select to_char(axiom_utc_to_date(trunc(gps_time /(24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as region_count from axiom_alarm_region where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) region, (select gps_date, ((select count(point_id) from axiom_analyze_target_point where target_id = ?)-count(point_id)) as piont_count from (select point_id, to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60)), point_id) group by gps_date) point, (select to_char(axiom_utc_to_date(trunc(task_date /(24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as task_date, count(task_date) as task_count from pipe_special_task where target_id = ? and task_date between ? and ? group by trunc(task_date / (24 * 60 * 60))) task, (select pat.target_id from pipe_attendant pat where pat.target_id = ?), (select to_char(axiom_utc_to_date((trunc((? + 24*60*60) / (24 * 60 * 60)) + rownum - 1) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from dual connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base, (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+) order by gps_date))a ) b where  b.row_num between ? and ?
sql.pipe.report_diy.report_one_all.pass_count_L =  main,select count(passed) from (select decode(sign(sign(piont_count*2 - 1) + sign(task_count) * -2), -1, 'Y', 'N') as passed from (select base.gps_date, target.target_name, month_salary, nvl(patrol_count, 0) patrol_count, nvl(speed_count, 0) speed_count, nvl(region_count, 0) region_count, nvl(piont_count, (select count(point_id) from axiom_analyze_target_point where target_id = ?)) piont_count, nvl(task_count, 0) task_count from (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as patrol_count from axiom_track_gpstracker where target_id = ? and bitand(terminal_status, 16) = 16 and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) patrol,(select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as speed_count from axiom_alarm_speed where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) speed, (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)),'yyyy-mm-dd') as gps_date, count(gps_time) as region_count from axiom_alarm_region where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) region, (select gps_date,(select count(point_id) from axiom_analyze_target_point where target_id = ?)-count(point_id) as piont_count from (select point_id ,to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60)),point_id) group by gps_date) point, (select to_char(axiom_utc_to_date(trunc(task_date / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as task_date, count(task_date) as task_count from pipe_special_task where target_id = ? and task_date between ? and ? group by trunc(task_date / (24 * 60 * 60))) task,(select pat.target_id, pat.month_salary from pipe_attendant pat where pat.target_id = ?), (select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum - 1) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from dual connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base, (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+) order by gps_date)) t1 where t1.passed = 'Y'
sql.pipe.report_diy.report_one_all.query_test_L =  main,select target_name, sum(patrol_count), sum(speed_count), sum(region_count), sum(piont_count), sum(task_count), month_salary from (select base.gps_date, target.target_name, month_salary, nvl(patrol_count, 0) patrol_count, nvl(speed_count, 0) speed_count, nvl(region_count, 0) region_count, nvl(piont_count, (select count(point_id) from axiom_analyze_target_point where target_id = ?)) piont_count, nvl(task_count, 0) task_count from (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as patrol_count from axiom_track_gpstracker where target_id = ? and bitand(terminal_status, 16) = 16 and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) patrol,(select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as speed_count from axiom_alarm_speed where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) speed, (select to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) *(24 * 60 * 60)), 'yyyy-mm-dd') as gps_date, count(gps_time) as region_count from axiom_alarm_region where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60))) region,(select gps_date,(select count(point_id) from axiom_analyze_target_point where target_id = ?)-count(point_id) as piont_count from (select point_id ,to_char(axiom_utc_to_date(trunc(gps_time / (24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point where target_id = ? and gps_time between ? and ? group by trunc(gps_time / (24 * 60 * 60)),point_id) group by gps_date) point, (select to_char(axiom_utc_to_date(trunc(task_date /(24 * 60 * 60)) * (24 * 60 * 60)), 'yyyy-mm-dd') as task_date, count(task_date) as task_count from pipe_special_task where target_id = ? and task_date between ? and ? group by trunc(task_date / (24 * 60 * 60))) task, (select pat.target_id, pat.month_salary from pipe_attendant pat where pat.target_id = ?),(select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum - 1) * (24 * 60 * 60)), 'yyyy-mm-dd') as gps_date from dual connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base, (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+) order by gps_date) group by target_name ,month_salary



//修改完成 2010-9-10
select 
gps_date, target_name, patrol_count, speed_count, region_count, piont_count, task_count,  
decode(sign(sign(piont_count * 2 - 1) + sign(task_count) * -2), -1,  1, 0) pass 
from ( 
   select base.gps_date,  target.target_name,  
   (select pat.month_salary from pipe_attendant pat  where pat.target_id = ? )as month_salary,   
   nvl(patrol_count, 0) patrol_count,  nvl(speed_count, 0) speed_count,  nvl(region_count, 0) region_count, 
   nvl(piont_count, (select count(point_id) from axiom_analyze_target_point  where target_id = ?)) piont_count,
   nvl(task_count, 0) task_count 
   from 
   (select to_char(trunc(axiom_utc_to_date(gps_time)),  'yyyy-mm-dd') as gps_date,  
   count(gps_time) as patrol_count  from axiom_track_patrol where target_id = ? 
   and bitand(terminal_status, 16) = 16  and gps_time between ? and ?  
   group by trunc(axiom_utc_to_date(gps_time)) ) patrol, 
   (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date,  
   count(speed_id) as speed_count   from axiom_alarm_speed where target_id = ?  
   and gps_time between ? and ?   group by trunc(axiom_utc_to_date(gps_time)), speed_id) speed, 
   (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date, 
   count(region_id) as region_count   from axiom_alarm_region   where target_id = ?  
   and gps_time between ? and ?  group by trunc(axiom_utc_to_date(gps_time)), region_id) region, 
   (select gps_date, (select count(point_id) from axiom_analyze_target_point 
   where target_id = ?) - count(point_id) as piont_count from (select point_id,  
   to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point 
   where target_id = ? and gps_time between ? and ?  
   group by trunc(axiom_utc_to_date(gps_time)), point_id) group by gps_date) point, 
   (select to_char(trunc(axiom_utc_to_date(task_date)), 'yyyy-mm-dd') as task_date, 
   count(task_date) as task_count from pipe_special_task   where target_id = ?  and task_date 
   between ? and ?  group by trunc(axiom_utc_to_date(task_date))) task, 
   (select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum) * (24 * 60 * 60)),  'yyyy-mm-dd') 
   as gps_date  from dual  connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base, 
   (select target_name from axiom_target where target_id = ?) target 
where base.gps_date = patrol.gps_date(+) 
and base.gps_date = speed.gps_date(+) 
and base.gps_date = region.gps_date(+) 
and base.gps_date = point.gps_date(+) 
and base.gps_date = task.task_date(+) 
order by gps_date
)

t,t,t,s,e,t,s,e,t,s,e,t,t,s,e,t,s,e,s,e,s,t
http.db
sql.pipe.report_diy.report_one.select = 3,3,3,1,2,3,1,2,3,1,2,3,3,1,2,3,1,2,1,2,1,3>pipe.report_diy.report_one.select
sql.script
sql.pipe.report_diy.report_one.select =  main,select gps_date, target_name, patrol_count, speed_count, region_count, piont_count, task_count,  decode(sign(sign(piont_count * 2 - 1) + sign(task_count) * -2), -1, 1, 0) pass,month_salary from (   select base.gps_date,  target.target_name,     (select pat.month_salary from pipe_attendant pat  where pat.target_id = ? )as month_salary,     nvl(patrol_count, 0) patrol_count,  nvl(speed_count, 0) speed_count,  nvl(region_count, 0) region_count,   nvl(piont_count, (select count(point_id) from axiom_analyze_target_point  where target_id = ?)) piont_count,  nvl(task_count, 0) task_count    from    (select to_char(trunc(axiom_utc_to_date(gps_time)),  'yyyy-mm-dd') as gps_date,     count(gps_time) as patrol_count  from axiom_track_patrol where target_id = ?    and bitand(terminal_status, 16) = 16  and gps_time between ? and ?     group by trunc(axiom_utc_to_date(gps_time)) ) patrol,    (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date,     count(speed_id) as speed_count   from axiom_alarm_speed where target_id = ?     and gps_time between ? and ?   group by trunc(axiom_utc_to_date(gps_time)), speed_id) speed,    (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date,    count(region_id) as region_count   from axiom_alarm_region   where target_id = ?     and gps_time between ? and ?  group by trunc(axiom_utc_to_date(gps_time)), region_id) region,    (select gps_date, (select count(point_id) from axiom_analyze_target_point    where target_id = ?) - count(point_id) as piont_count from (select point_id,     to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point    where target_id = ? and gps_time between ? and ?     group by trunc(axiom_utc_to_date(gps_time)), point_id) group by gps_date) point,    (select to_char(trunc(axiom_utc_to_date(task_date)), 'yyyy-mm-dd') as task_date,    count(task_date) as task_count from pipe_special_task   where target_id = ?  and task_date    between ? and ?  group by trunc(axiom_utc_to_date(task_date))) task,    (select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum) * (24 * 60 * 60)),  'yyyy-mm-dd')   as gps_date  from dual  connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base,    (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+) order by gps_date )

http.report
report.pipe.report_diy.report_one.select.head =  集体报表,日期, 巡线员, 事件上报, 超速报警, 越界报警, 巡漏报警 ,特殊任务, 合格率(%)
report.pipe.report_diy.report_one.select.sql =  main,select * from table(axiom_report_one(?,?,?))




--- 最新

sql.pipe.report_diy.report_one.select =  main,select gps_date, target_name, patrol_count, speed_count,  decode(trunc(piont_count/(select count(point_id) from axiom_analyze_target_point where target_id = ?)),0,'否',1,'是'), piont_count,task_count,  decode(sign(sign(piont_count * 2 - 1) + sign(task_count) * -2), -1, 1, 0) pass,month_salary from (   select base.gps_date,  target.target_name,     (select pat.month_salary from pipe_attendant pat  where pat.target_id = ? )as month_salary,     nvl(patrol_count, 0) patrol_count,  nvl(speed_count, 0) speed_count,  nvl(region_count, 0) region_count,   nvl(piont_count, (select count(point_id) from axiom_analyze_target_point  where target_id = ?)) piont_count,  nvl(task_count, 0) task_count    from    (select to_char(trunc(axiom_utc_to_date(gps_time)),  'yyyy-mm-dd') as gps_date,     count(gps_time) as patrol_count  from axiom_track_patrol where target_id = ?    and bitand(terminal_status, 16) = 16  and gps_time between ? and ?     group by trunc(axiom_utc_to_date(gps_time)) ) patrol,    (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date,     count(speed_id) as speed_count   from axiom_alarm_speed where target_id = ?     and gps_time between ? and ?   group by trunc(axiom_utc_to_date(gps_time)), speed_id) speed,    (select to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date,    count(region_id) as region_count   from axiom_alarm_region   where target_id = ?     and gps_time between ? and ?  group by trunc(axiom_utc_to_date(gps_time)), region_id) region,    (select gps_date, (select count(point_id) from axiom_analyze_target_point    where target_id = ?) - count(point_id) as piont_count from (select point_id,     to_char(trunc(axiom_utc_to_date(gps_time)), 'yyyy-mm-dd') as gps_date from axiom_alarm_point    where target_id = ? and gps_time between ? and ?     group by trunc(axiom_utc_to_date(gps_time)), point_id) group by gps_date) point,    (select to_char(trunc(axiom_utc_to_date(task_date)), 'yyyy-mm-dd') as task_date,    count(task_date) as task_count from pipe_special_task   where target_id = ?  and task_date    between ? and ?  group by trunc(axiom_utc_to_date(task_date))) task,    (select to_char(axiom_utc_to_date((trunc(? / (24 * 60 * 60)) + rownum) * (24 * 60 * 60)),  'yyyy-mm-dd')   as gps_date  from dual  connect by rownum <= (trunc((? - ?) / (24 * 60 * 60)) + 1)) base,    (select target_name from axiom_target where target_id = ?) target where base.gps_date = patrol.gps_date(+) and base.gps_date = speed.gps_date(+) and base.gps_date = region.gps_date(+) and base.gps_date = point.gps_date(+) and base.gps_date = task.task_date(+) order by gps_date )
sql.pipe.report_diy.report_one.select =  3,3,3,3,1,2,3,1,2,3,1,2,3,3,1,2,3,1,2,1,2,1,3>pipe.report_diy.report_one.select


存储过程

create or replace function axiom_report_one( s_time in number,e_time in number ,target_id_val in varchar2) return report_one_query PIPELINED IS
 TYPE myCursor IS REF CURSOR;  
  R myCursor;

  v_s_date varchar2(20);
  v_e_date varchar2(20);
  v_gps_date varchar2(20);
  v_target_name varchar2(40);
  v_patrol_count number(10);
  v_speed_count  number(10);
  v_region_count number(10);
  v_point_count  number(10);
  v_task_count number(10);
  v_rate_pass number(10,4);
  v_money number(10,2);
  v_count number(10);
  v_rate_pass_name varchar2(20);
  target_name_count number(10);
  patrol_count number(10);
  speed_count  number(10);
  region_count number(10);
  point_count  number(10);
  task_count number(10);
  rate_pass number(10,4);
  money number(10,2);
  region_count_value varchar(20);
begin
    target_name_count:=0;
    patrol_count:=0;
    speed_count:=0;
    region_count:=0;
    point_count:=0;
    task_count:=0;
    rate_pass :=0.00;
    money :=0.00;
    v_count :=0;
    region_count:=0;
    
OPEN R FOR select gps_date,
       target_name,
       patrol_count,
       speed_count,
       trunc(piont_count/(select count(point_id) from axiom_analyze_target_point where target_id = target_id_val)) as region_count,
       piont_count,
       task_count,
       decode(sign(sign(piont_count * 2 - 1) + sign(task_count) * -2),
              -1,
              1,
              0) pass,
       month_salary
  from (select base.gps_date,
               target.target_name,
               (select pat.month_salary
                  from pipe_attendant pat
                 where pat.target_id = target_id_val) as month_salary,
               nvl(patrol_count, 0) patrol_count,
               nvl(speed_count, 0) speed_count,
               nvl(region_count, 0) region_count,
               nvl(piont_count,
                   (select count(point_id)
                      from axiom_analyze_target_point
                     where target_id = target_id_val)) piont_count,
               nvl(task_count, 0) task_count
          from (select to_char(trunc(axiom_utc_to_date(gps_time)),
                               'yyyy-mm-dd') as gps_date,
                       count(gps_time) as patrol_count
                  from axiom_track_patrol
                 where target_id = target_id_val
                   and bitand(terminal_status, 16) = 16
                   and gps_time between s_time and e_time
                 group by trunc(axiom_utc_to_date(gps_time))) patrol,
               (select to_char(trunc(axiom_utc_to_date(gps_time)),
                               'yyyy-mm-dd') as gps_date,
                       count(speed_id) as speed_count
                  from axiom_alarm_speed
                 where target_id = target_id_val
                   and gps_time between s_time and e_time
                 group by trunc(axiom_utc_to_date(gps_time)), speed_id) speed,
               (select to_char(trunc(axiom_utc_to_date(gps_time)),
                               'yyyy-mm-dd') as gps_date,
                       count(region_id) as region_count
                  from axiom_alarm_region
                 where target_id = target_id_val
                   and gps_time between s_time and e_time
                 group by trunc(axiom_utc_to_date(gps_time)), region_id) region,
               (select gps_date,
                       (select count(point_id)
                          from axiom_analyze_target_point
                         where target_id = target_id_val) - count(point_id) as piont_count
                  from (select point_id,
                               to_char(trunc(axiom_utc_to_date(gps_time)),
                                       'yyyy-mm-dd') as gps_date
                          from axiom_alarm_point
                         where target_id = target_id_val
                           and gps_time between s_time and e_time
                         group by trunc(axiom_utc_to_date(gps_time)), point_id)
                 group by gps_date) point,
               (select to_char(trunc(axiom_utc_to_date(task_date)),
                               'yyyy-mm-dd') as task_date,
                       count(task_date) as task_count
                  from pipe_special_task
                 where target_id = target_id_val
                   and task_date between s_time and e_time
                 group by trunc(axiom_utc_to_date(task_date))) task,
               (select to_char(axiom_utc_to_date((trunc(s_time / (24 * 60 * 60)) +
                                                 rownum) * (24 * 60 * 60)),
                               'yyyy-mm-dd') as gps_date
                  from dual
                connect by rownum <= (trunc((e_time - s_time) / (24 * 60 * 60)) + 1)) base,
               (select target_name from axiom_target where target_id = target_id_val) target
         where base.gps_date = patrol.gps_date(+)
           and base.gps_date = speed.gps_date(+)
           and base.gps_date = region.gps_date(+)
           and base.gps_date = point.gps_date(+)
           and base.gps_date = task.task_date(+)
         order by gps_date) ;

 LOOP 
     FETCH R INTO v_gps_date,v_target_name,v_patrol_count, v_speed_count,v_region_count, v_point_count, v_task_count, v_rate_pass, v_money ;
    -- FETCH R INTO money;
     EXIT WHEN R%NOTFOUND;     
     target_name_count := target_name_count+1;   
     patrol_count := patrol_count+v_patrol_count;
     speed_count :=speed_count+v_speed_count;
     region_count :=region_count+v_region_count;
     point_count :=point_count+v_point_count;
     task_count :=task_count+v_task_count;
     rate_pass :=rate_pass+v_rate_pass;
     v_count := v_count+1;
     if v_rate_pass = 1 
       then v_rate_pass_name := '合格';
     else v_rate_pass_name := '不合格';
     end if;
     if region_count = 0 then
      region_count_value := '否';
      else
      region_count_value := '是';
      end if;
     PIPE ROW(report_one( v_gps_date,v_target_name,v_patrol_count, v_speed_count,region_count_value, v_point_count, v_task_count, v_rate_pass_name ));
      
   END LOOP;
  -- FETCH R INTO v_target_name,v_patrol_count, v_speed_count,v_region_count, v_point_count, v_task_count,
 --   v_rate_pass , v_money;
      
     PIPE ROW(report_one('汇总', '巡线员：'||v_target_name,patrol_count, speed_count,'全部漏巡天数(天)：'||region_count, point_count, task_count, (round(rate_pass/v_count*100*100)/100||'%')));
     
     PIPE ROW(report_one('实发工资','￥'||round((v_money/30)*rate_pass*100)/100 ,null, null,null, null, null, ''));
     
--, round((v_money/30)*rate_pass*100)/100)
close R;
RETURN;
end axiom_report_one;
