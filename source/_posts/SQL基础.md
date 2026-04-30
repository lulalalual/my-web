---
title: SQL基础
permalink: posts/sql-basic/
date: 2026-04-29 21:20:00
updated: 2026-04-29 23:35:00
categories:
  - 技术笔记
tags:
  - MySQL
  - SQL
  - 数据库
  - 基础
cover: /img/covers/ai/cover-sql-basic.webp
description: 用人话讲 SQL 基础：建表、增删改查、过滤、排序、分组、连接和约束。
---

SQL 的核心不是背关键字，而是学会用表来描述现实世界，再用查询把你想要的信息取出来。表像一张结构化的清单，行代表一条记录，列代表这条记录的属性。只要先把这个模型想清楚，后面的查询、关联、分组和排序都会更自然。

## SELECT 是在问数据库问题

最简单的 SQL 查询，就是告诉数据库“我想从哪张表里拿哪些列”。

~~~sql
SELECT name, age
FROM users;
~~~

这句话可以读成：从 <code>users</code> 表里取出 <code>name</code> 和 <code>age</code> 两列。写 SQL 时不要急着想语法，先用人类语言把问题说清楚，再把它翻译成 SQL。

如果只想看符合条件的数据，就加 <code>WHERE</code>。

~~~sql
SELECT name, age
FROM users
WHERE age >= 18;
~~~

这里的重点是过滤发生在行级别。数据库会检查每一行，只有满足条件的行才会进入结果集。

## 排序和分页是展示层常用需求

业务里经常需要“最新的文章”“销量最高的商品”“第 2 页数据”。排序用 <code>ORDER BY</code>，分页通常用 <code>LIMIT</code> 和 <code>OFFSET</code>。

~~~sql
SELECT title, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;
~~~

这表示按发布时间倒序，跳过前 20 条，再取 10 条。数据量小时这样写没问题；数据量很大时，深分页会变慢，因为数据库需要跳过大量记录。工程里可以用游标分页或基于最后一条记录的位置继续查。

## JOIN 是把多张表拼成一个答案

真实业务很少只有一张表。文章表可能只保存作者 ID，作者名字在用户表里。这时就要用 <code>JOIN</code>。

~~~sql
SELECT posts.title, users.name
FROM posts
JOIN users ON posts.user_id = users.id;
~~~

这句话的意思是：文章表里的 <code>user_id</code> 和用户表里的 <code>id</code> 对上时，就把文章标题和用户名字放到同一行结果里。

理解 JOIN 时，可以把它想成两张表之间的“对照”。关键不是记住 INNER JOIN、LEFT JOIN 的名字，而是知道你希望保留哪边的数据。普通 JOIN 只保留能匹配上的行；LEFT JOIN 会保留左表全部行，右表没有匹配时用 NULL 补上。

## GROUP BY 是按组统计

当你想问“每个分类有多少文章”“每个用户下了多少单”时，就需要分组。

~~~sql
SELECT category_id, COUNT(*) AS total
FROM posts
GROUP BY category_id;
~~~

数据库会先按 <code>category_id</code> 把文章分成一堆一堆，再对每一堆做统计。<code>WHERE</code> 是分组前过滤原始行，<code>HAVING</code> 是分组后过滤统计结果。

~~~sql
SELECT category_id, COUNT(*) AS total
FROM posts
GROUP BY category_id
HAVING COUNT(*) >= 10;
~~~

这表示只保留文章数量不少于 10 的分类。

## NULL 不是空字符串

NULL 表示未知或不存在，它和空字符串、0 都不是一回事。判断 NULL 不能用 <code>= NULL</code>，要用 <code>IS NULL</code>。

~~~sql
SELECT *
FROM users
WHERE phone IS NULL;
~~~

NULL 会影响很多表达式。比如任何值和 NULL 比较，结果通常不是 true，也不是 false，而是 unknown。设计表结构时，如果字段必须有值，就应该加 <code>NOT NULL</code>，减少后续判断成本。

## 索引像书的目录

没有索引时，数据库找数据可能要一行一行扫。索引就像书的目录，可以帮助数据库更快定位目标。

~~~sql
CREATE INDEX idx_users_email ON users(email);
~~~

有了邮箱索引后，按邮箱查询用户会更快。但索引不是越多越好。每次插入、更新、删除数据时，索引也要维护，所以索引会提高查询速度，也会增加写入成本。

建索引前先看查询条件。经常出现在 <code>WHERE</code>、<code>JOIN</code>、<code>ORDER BY</code> 里的字段，才更值得考虑索引。

## 事务保证一组操作要么都成功，要么都失败

转账是理解事务最经典的例子。A 扣钱和 B 加钱必须作为一个整体。如果 A 已经扣了钱，B 没加上，数据就坏了。

~~~sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
~~~

如果中途出错，就执行 <code>ROLLBACK</code> 回滚。事务的价值是让数据库在复杂业务里仍然保持一致。

## 学 SQL 的正确练法

学 SQL 不要只背语法。拿一个博客系统做练习最合适：用户表、文章表、分类表、评论表、点赞表。然后不断问问题：最新文章怎么查？某个作者的文章数怎么统计？评论数最多的文章怎么排？没有评论的文章怎么找？

当你能把业务问题自然翻译成 SQL，SQL 基础就真正掌握了。
