sql.script
sql.sales_goods_record.type_two.select =  main,select g.goods_id,g.goods_sn,g.goods_name,g.goods_type,gr.recv_time, gr.goods_quantity,g.goods_price*gr.goods_quantity as goods_price  from sales_goods g, (select goods_sn, trunc( axiom_utc_to_date(recv_time)) as recv_time,sum(goods_quantity) as goods_quantity from sales_goods_record  where  recv_time>? and recv_time<? group by trunc( axiom_utc_to_date(recv_time)),goods_sn ) gr  where g.goods_sn = gr.goods_sn  order by g.goods_sn

http.report
report.sales_goods_record.type_two.select.head =  实时销售额(查询),商品编号,商品名称,商品类别,日期,销售数量,销售额
report.sales_goods_record.type_two.select.sql =  main,select * from table(report_SALES_GOODS_RECORD2(?, ?))


