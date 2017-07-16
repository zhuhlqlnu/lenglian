//²éÑ¯Â©Ñ²µã
sql.module.monitor.history_pipe.point_query.select =  main, select aap.point_name,aap.x,aap.y,aatp.range,aap.type,aatp.start_time,aatp.end_time,aatp.is_alarm,aatp.alarm_type from axiom_analyze_point aap,axiom_analyze_target_point aatp where aatp.point_id=aap.point_id and aatp.target_id=?
