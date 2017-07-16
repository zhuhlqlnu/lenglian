sql.m_sales.sales_manage.daily.report_manage.customer_visit.point.point_id.select.count =  main,select count(*) from axiom_alarm_point t,axiom_analyze_point aap,axiom_target at where aap.point_id=t.point_id and t.alarm_type=4 and t.point_id=? and  t.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn))  and t.gps_time>=? and t.gps_time<=? and at.target_id= t.target_id 
sql.m_sales.sales_manage.daily.report_manage.customer_visit.point.point_id.select.page =  main,select * from (select a.* ,rownum row_num from (select aap.point_name,at.target_name,t.arrive_time,t.leave_time,(t.leave_time-t.arrive_time),t.geocoding from axiom_alarm_point t,axiom_analyze_point aap,axiom_target at where aap.point_id=t.point_id and t.alarm_type=4 and t.point_id=?  and  t.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn)) and t.gps_time>=? and t.gps_time<=? and at.target_id= t.target_id order by t.gps_time desc)a) b where  b.row_num between ?and ?
sql.m_sales.sales_manage.daily.report_manage.customer_visit.point.select.count =  main,select count(*) from axiom_alarm_point t,axiom_analyze_point aap,axiom_target at where aap.point_id=t.point_id and t.alarm_type=4  and at.target_id= t.target_id order by t.gps_time desc
sql.m_sales.sales_manage.daily.report_manage.customer_visit.point.select.page =  main,select * from (select a.* ,rownum row_num from (select aap.point_name,at.target_name,t.arrive_time,t.leave_time,(t.leave_time-t.arrive_time),t.geocoding from axiom_alarm_point t,axiom_analyze_point aap,axiom_target at where aap.point_id=t.point_id and t.alarm_type=4  and at.target_id= t.target_id order by t.gps_time desc)a) b where  b.row_num between ?and ?
sql.m_sales.sales_manage.daily.report_manage.customer_visits.select.count =  main,select count(*) from (select ap.point_name, count(*) as point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and aap.gps_time >= ? and aap.gps_time <= ? group by ap.point_name,ap.point_id)
sql.m_sales.sales_manage.daily.report_manage.customer_visits.select.page =  main,select * from (select a.* ,rownum row_num from ( select ap.point_name, count(*) as count_point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and aap.gps_time >= ? and aap.gps_time <= ? group by ap.point_name,ap.point_id)a) b where  b.row_num between ?and ?
sql.m_sales.sales_manage.daily.report_manage.customer_visits.target.select.count =  main,select count(*) from (select ap.point_name, count(*) as count_point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and at.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn)) and  aap.gps_time >= ? and aap.gps_time <= ? group by ap.point_name,ap.point_id order by aap.gps_time desc)
sql.m_sales.sales_manage.daily.report_manage.customer_visits.target.select.page =  main,select * from (select a.* ,rownum row_num from (select ap.point_name, count(*) as count_point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and at.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn)) and  aap.gps_time > ? and aap.gps_time < ? group by ap.point_name,ap.point_id)a) b where  b.row_num between ?and ?
sql.m_sales.sales_manage.daily.report_manage.customer_visits.target_id.select.count =  main,select count(*) form (select ap.point_name, count(*) as count_point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and at.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn)) and  aap.gps_time >= ? and aap.gps_time <= ? group by ap.point_name,ap.point_id)
sql.m_sales.sales_manage.daily.report_manage.customer_visits.target_id.select.page =  main,select * from (select a.* ,rownum row_num from (select ap.point_name, count(*) as count_point_id, ap.point_id from axiom_alarm_point aap, axiom_analyze_point  ap, (select * from axiom_target where target_id in (select distinct target_id from (select target_id from axiom_target where corp_id in (select corp_id from axiom_corp start with corp_id = ${corp_id} connect by prior corp_id = parent_id) and (select status from axiom_user where user_id = ${user_id}) = 1 union select att.target_id from axiom_target att, axiom_group_target agt, axiom_user_group aug where agt.target_id = att.target_id and agt.group_id = aug.group_id and aug.user_id = ${user_id}))) at where aap.point_id = ap.point_id and aap.target_id = at.target_id and aap.alarm_type = 4 and at.target_id in(select substr(?, s, e - s) target_id from (select pos_start.pos as s, pos_end.pos as e from (select rownum rn, pos from (select distinct pos from (select instr(concat(',', ?), ',',  rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_start, (select rownum rn, pos from (select distinct pos from (select instr(concat(?, ','), ',', rownum) as pos from dual connect by rownum <= length(?)) where pos > 0 order by pos)) pos_end where pos_start.rn = pos_end.rn)) and  aap.gps_time >= ? and aap.gps_time <= ? group by ap.point_name,ap.point_id order by app.gps_time desc))a) b where  b.row_num between ?and ?
