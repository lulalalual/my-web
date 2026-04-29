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
cover: /img/covers/notes/cover-sql-basic.png
description: 用人话讲 SQL 基础：建表、增删改查、过滤、排序、分组、连接和约束。
---

SQL 是你和数据库说话的语言。你不需要把它想得很玄，它做的事情主要就几类：建表、写数据、改数据、删数据、查数据。

## SQL 先说人话

数据库像一个有规则的表格仓库。SQL 就是在告诉仓库管理员：我要建什么表、放什么数据、按什么条件找、结果怎么排。

~~~text
DDL：定义结构
DML：修改数据
DQL：查询数据
DCL：管理权限
~~~

实际开发里，最常用的是 DDL、DML 和 DQL。

## 建库和建表

建表就是先规定数据长什么样。

~~~sql
CREATE TABLE user_profile (
  id BIGINT PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  age INT,
  created_at DATETIME
);
~~~

这张表表达了四件事：每个用户有 id，name 不能为空，age 是整数，created_at 记录创建时间。

建表时要想清楚字段类型。能用整数就别用字符串，能限制长度就限制长度，能加约束就不要完全依赖业务代码。

## 插入数据

~~~sql
INSERT INTO user_profile (id, name, age, created_at)
VALUES (1, '青阳寻雪', 18, NOW());
~~~

插入语句最好写清字段名。这样以后表结构变化时，不容易因为字段顺序变化导致错误。

## 查询数据

查询是 SQL 里最常用的部分。

~~~sql
SELECT id, name, age
FROM user_profile
WHERE age >= 18
ORDER BY age DESC;
~~~

人话解释：从 user_profile 表里找成年人，只返回 id、name、age，并按年龄从大到小排。

## WHERE：过滤条件

WHERE 用来筛选行。

~~~sql
SELECT * FROM user_profile
WHERE age BETWEEN 18 AND 30
  AND name LIKE '青%';
~~~

常用条件包括等于、不等于、范围、模糊匹配、空值判断。注意 NULL 不能用等号比较，要用 IS NULL。

## ORDER BY：排序

~~~sql
SELECT * FROM user_profile
ORDER BY created_at DESC;
~~~

DESC 是降序，ASC 是升序。排序可能很耗时，如果数据量大，要考虑索引。

## LIMIT：分页

~~~sql
SELECT * FROM user_profile
ORDER BY id
LIMIT 10 OFFSET 20;
~~~

这表示跳过前 20 条，再取 10 条。大偏移分页在大表上可能很慢，后面进阶文章会讲优化。

## UPDATE：修改数据

~~~sql
UPDATE user_profile
SET age = 19
WHERE id = 1;
~~~

修改数据一定要写 WHERE。没有 WHERE 就可能全表更新，这是生产事故级错误。

## DELETE：删除数据

~~~sql
DELETE FROM user_profile
WHERE id = 1;
~~~

真实项目里很多删除是“软删除”，也就是加一个 deleted 字段标记，而不是直接物理删除。

## 聚合函数和 GROUP BY

聚合函数用来统计数据。

~~~sql
SELECT age, COUNT(*) AS total
FROM user_profile
GROUP BY age;
~~~

人话解释：按年龄分组，统计每个年龄有多少人。

常用聚合函数包括 COUNT、SUM、AVG、MAX、MIN。

## HAVING：过滤分组后的结果

WHERE 是分组前过滤，HAVING 是分组后过滤。

~~~sql
SELECT age, COUNT(*) AS total
FROM user_profile
GROUP BY age
HAVING COUNT(*) > 10;
~~~

这表示只保留人数超过 10 的年龄组。

## JOIN：把多张表连起来

很多数据不会放在一张表里。JOIN 用来按关系把表连接起来。

~~~sql
SELECT u.name, o.amount
FROM user_profile u
JOIN orders o ON u.id = o.user_id;
~~~

人话解释：用户表和订单表通过 user_id 关联，查出用户名字和订单金额。

常见 JOIN：

- INNER JOIN：两边都匹配才返回。
- LEFT JOIN：左表全部保留，右表没有就补 NULL。
- RIGHT JOIN：右表全部保留。

## 约束：把规则放进数据库

约束不是麻烦，它能保护数据。

- PRIMARY KEY：主键，唯一标识一行。
- NOT NULL：不能为空。
- UNIQUE：不能重复。
- DEFAULT：默认值。
- FOREIGN KEY：外键关系。

业务代码会变，数据库约束能守住底线。

## 索引的基本概念

索引像书的目录，可以减少扫描数据量。

~~~sql
CREATE INDEX idx_user_age ON user_profile(age);
~~~

有索引不代表一定快。写入会变慢，占用空间也会增加。索引要建在高频查询条件上。

## 常见坑

- SELECT * 用太多，拿了不需要的字段。
- UPDATE 或 DELETE 忘记 WHERE。
- NULL 用等号判断。
- 分页 OFFSET 很大还直接查。
- JOIN 条件写错导致笛卡尔积。
- 字段类型乱选，后期索引和查询都受影响。

## 面试怎么说

回答 SQL 基础题时，重点说清语句用途和执行结果。比如问 WHERE 和 HAVING 区别：WHERE 在分组前过滤行，HAVING 在分组后过滤组，所以 HAVING 可以使用聚合函数。

## 总结

SQL 基础的核心是把数据操作讲清楚：结构怎么定义，数据怎么变化，查询怎么筛选、排序、分组和关联。基础写稳了，后面的索引优化和事务理解才有意义。

## 完整细化笔记

> 说明：下面保留原来的完整知识内容，并在每个小节补了“说人话”解释。这样既不丢原有专业细节，也能让复习时先抓住重点。

## 通俗导读

SQL 是和数据库沟通的语言。你告诉数据库“我要什么”，数据库负责决定“怎么拿”。

```text
建库建表 -> 增删改查 -> 条件过滤 -> 排序分组 -> 连接多表
```

## 先看例子

> 说人话：这一节讲的是“先看例子”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
SELECT name, age
FROM user
WHERE age >= 18
ORDER BY age DESC;
```

这句 SQL 表示：从 `user` 表里找成年人，只取名字和年龄，并按年龄从大到小排序。

## 阅读建议

> 说人话：这一节讲的是“阅读建议”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

先熟悉 `SELECT/INSERT/UPDATE/DELETE`，再看表结构、约束、函数和事务。基础 SQL 写顺了，后面的索引优化才有意义。

## 完整笔记

> 说人话：这一节讲的是“完整笔记”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

下面保留原文档的完整内容，并在前面补了通俗导读和例子。原有知识点、表格和代码片段都不删减。

# SQL 系统笔记

## 一、SQL 通用语法

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

SQL（Structured Query Language，结构化查询语言）是用于操作关系型数据库的标准语言，具有**跨平台性**（不同数据库如 MySQL、PostgreSQL、SQL Server 语法略有差异，但核心一致）。

### 1. 书写规则

> 说人话：这一节讲的是“1. 书写规则”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **不区分大小写**：关键字（如 `SELECT`、`CREATE`）、表名、字段名均不区分大小写（建议关键字大写，自定义名称小写，增强可读性）。
    
- **字符串用单引号**：字符串常量必须用单引号 `' '` 包裹（双引号在部分数据库中用于标识符，如列别名）。
    
- **语句以分号结束**：每条 SQL 语句以 `;` 作为结束符（部分工具如 MySQL 客户端可省略，但建议显式添加）。
    
- **注释方式**：
    
    - 单行注释：`-- 注释内容`（注意 `--` 后必须有空格）或 `# 注释内容`（MySQL 特有）。
        
    - 多行注释：`/* 注释内容 */`。
        

### 2. 核心特点

> 说人话：这一节讲的是“2. 核心特点”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **声明式语言**：只需描述“做什么”，无需指定“怎么做”（由数据库引擎优化执行计划）。
    
- **面向集合操作**：一次操作可处理多条记录（而非逐条处理）。
    

## 二、SQL 分类

> 说人话：对象相关内容重点看生命周期。对象什么时候出生、什么时候复制或移动、什么时候销毁，决定了代码是否安全。

SQL 按功能分为四大类：**DDL、DML、DQL、DCL**，覆盖数据库对象的创建、数据操作、查询及权限控制。

|分类|全称|作用|核心命令|
|:--|:--|:--|:--|
|DDL|Data Definition Language（数据定义语言）|定义数据库对象（库、表、视图、索引等）|`CREATE`（创建）、`ALTER`（修改）、`DROP`（删除）、`TRUNCATE`（清空）|
|DML|Data Manipulation Language（数据操纵语言）|操作表中的**数据**（增、删、改）|`INSERT`（插入）、`UPDATE`（更新）、`DELETE`（删除）|
|DQL|Data Query Language（数据查询语言）|查询表中的**数据**|`SELECT`（查询）|
|DCL|Data Control Language（数据控制语言）|控制数据库访问权限、事务管理|`GRANT`（授权）、`REVOKE`（回收权限）、`COMMIT`（提交事务）、`ROLLBACK`（回滚事务）|

## 三、DDL（数据定义语言）

> 说人话：这一节讲的是“三、DDL（数据定义语言）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**作用**：定义和管理数据库对象（库、表、视图、索引等），操作的是**结构**而非数据。

### 1. 数据库操作

> 说人话：这一节讲的是“1. 数据库操作”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 1. 查询所有数据库
SHOW DATABASES;

-- 2. 查询当前使用的数据库
SELECT DATABASE();

-- 3. 创建数据库（支持条件判断与字符集配置）
CREATE DATABASE [IF NOT EXISTS] 数据库名
  [DEFAULT CHARSET 字符集]  -- 如 utf8mb4（支持 emoji，推荐）
  [COLLATE 排序规则];       -- 如 utf8mb4_unicode_ci（不区分大小写）

-- 4. 删除数据库（支持条件判断）
DROP DATABASE [IF EXISTS] 数据库名;

-- 5. 切换当前数据库
USE 数据库名;
```

### 2. 表操作

> 说人话：这一节讲的是“2. 表操作”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

#### （1）创建表（`CREATE TABLE`）

> 说人话：这一节讲的是“（1）创建表（`CREATE TABLE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
CREATE TABLE 表名 (
  字段名1 数据类型 [约束] [COMMENT '字段注释'],
  字段名2 数据类型 [约束] [COMMENT '字段注释'],
  ...
  [表级约束]  -- 如主键、外键、唯一约束
) [COMMENT '表注释'] 
  [ENGINE=引擎]  -- 如 InnoDB（支持事务）、MyISAM（不支持事务，查询快）
  [DEFAULT CHARSET=字符集];  -- 如 utf8mb4
```

**示例**（含约束）：

```sql
CREATE TABLE students (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID（主键，自增）',
  name VARCHAR(50) NOT NULL COMMENT '姓名（非空）',
  age TINYINT UNSIGNED DEFAULT 18 COMMENT '年龄（默认18，无符号）',
  gender ENUM('男','女','未知') DEFAULT '未知' COMMENT '性别（枚举）',
  class_id INT COMMENT '班级ID（外键）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（自动填充当前时间）',
  -- 表级约束：外键关联 classes 表的 id
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '学生表';
```

#### （2）修改表结构（`ALTER TABLE`）

> 说人话：这一节讲的是“（2）修改表结构（`ALTER TABLE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 添加字段
ALTER TABLE 表名 ADD 字段名 数据类型 [约束] [COMMENT '注释'];

-- 修改字段类型（保留原字段名）
ALTER TABLE 表名 MODIFY 字段名 新数据类型 [约束];

-- 修改字段名+类型
ALTER TABLE 表名 CHANGE 旧字段名 新字段名 新数据类型 [约束] [COMMENT '注释'];

-- 删除字段
ALTER TABLE 表名 DROP 字段名;

-- 重命名表
ALTER TABLE 表名 RENAME TO 新表名;
-- 或
RENAME TABLE 旧表名 TO 新表名;
```

#### （3）删除/清空表

> 说人话：这一节讲的是“（3）删除/清空表”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 删除表（含结构+数据，不可恢复）
DROP TABLE [IF EXISTS] 表名;

-- 清空表数据（保留结构，重置自增ID）
TRUNCATE TABLE 表名;
```

### 3. 其他对象操作（视图、索引）

> 说人话：对象相关内容重点看生命周期。对象什么时候出生、什么时候复制或移动、什么时候销毁，决定了代码是否安全。

#### （1）视图（`VIEW`，虚拟表）

> 说人话：数据结构先问“数据怎么摆”。摆法决定查找、插入、删除和遍历的成本，也决定它适合什么题。

```sql
-- 创建视图（基于查询结果）
CREATE VIEW 视图名 AS 
SELECT 字段1, 字段2 FROM 表名 WHERE 条件;

-- 查询视图（同查询表）
SELECT * FROM 视图名;

-- 删除视图
DROP VIEW IF EXISTS 视图名;
```

**作用**：简化复杂查询、隐藏敏感字段、统一数据访问接口。

#### （2）索引（`INDEX`，加速查询）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

```sql
-- 创建普通索引
CREATE INDEX 索引名 ON 表名(字段名);

-- 创建唯一索引（字段值唯一）
CREATE UNIQUE INDEX 索引名 ON 表名(字段名);

-- 删除索引
DROP INDEX 索引名 ON 表名;
```

**注意**：索引会加速查询，但会降低 `INSERT/UPDATE/DELETE` 效率（需维护索引结构），需合理设计。

## 四、DML（数据操纵语言）

> 说人话：这一节讲的是“四、DML（数据操纵语言）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**作用**：操作表中的**数据**（增、删、改），操作的是**记录**而非结构。

### 1. 插入数据（`INSERT`）

> 说人话：这一节讲的是“1. 插入数据（`INSERT`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 1. 指定字段插入单行数据
INSERT INTO 表名 (字段1, 字段2, ...) 
VALUES (值1, 值2, ...);

-- 2. 全字段插入单行数据（需按表结构顺序传值，含默认值字段可省略）
INSERT INTO 表名 
VALUES (值1, 值2, ...);

-- 3. 批量插入多行数据（推荐，减少网络交互）
INSERT INTO 表名 (字段1, 字段2, ...)
VALUES 
  (值1a, 值2a, ...),
  (值1b, 值2b, ...),
  (值1c, 值2c, ...);
```

**示例**：

```sql
INSERT INTO students (name, age, gender, class_id)
VALUES 
  ('张三', 20, '男', 101),
  ('李四', 19, '女', 102);
```

### 2. 修改数据（`UPDATE`）

> 说人话：这一节讲的是“2. 修改数据（`UPDATE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 带条件修改（推荐，避免全表更新）
UPDATE 表名 
SET 字段1=新值1, 字段2=新值2, ... 
WHERE 条件;  -- 如 id=1、age>18、name LIKE '张%'

-- 全表修改（谨慎使用！）
UPDATE 表名 SET 字段1=新值1;
```

**示例**：

```sql
-- 将班级ID为101的学生年龄加1
UPDATE students 
SET age = age + 1 
WHERE class_id = 101;
```

### 3. 删除数据（`DELETE`）

> 说人话：这一节讲的是“3. 删除数据（`DELETE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 带条件删除（推荐，避免误删全表）
DELETE FROM 表名 WHERE 条件;  -- 如 id=10、status='失效'

-- 全表删除（谨慎使用！）
DELETE FROM 表名;
```

**⚠️ 注意**：

- `DELETE` 删除后**自增ID不重置**，可通过 `TRUNCATE` 重置（见 DDL）。
    
- 生产环境建议用 `软删除`（如添加 `is_deleted` 字段标记删除，而非物理删除）。
    

## 五、DQL（数据查询语言）

> 说人话：这一节讲的是“五、DQL（数据查询语言）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**作用**：查询表中的**数据**，是 SQL 中最核心、最常用的部分。

**核心语法**：`SELECT 字段列表 FROM 表名 [WHERE 条件] [GROUP BY 分组] [HAVING 过滤] [ORDER BY 排序] [LIMIT 分页]`

### 1. 基础查询

> 说人话：这一节讲的是“1. 基础查询”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 查询所有字段（* 代表所有字段，不建议生产环境使用，效率低）
SELECT * FROM 表名;

-- 查询指定字段
SELECT 字段1, 字段2, ... FROM 表名;

-- 去重查询（DISTINCT）
SELECT DISTINCT 字段名 FROM 表名;

-- 别名（AS，可省略）
SELECT 字段名 AS 别名 FROM 表名;
-- 示例：查询学生姓名和年龄，年龄别名为 student_age
SELECT name AS 姓名, age AS student_age FROM students;
```

### 2. 条件查询（`WHERE`）

> 说人话：这一节讲的是“2. 条件查询（`WHERE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

通过运算符筛选符合条件的记录：

|类型|运算符/关键字|说明|
|:--|:--|:--|
|比较运算|`=`, `<>`, `>`, `<`, `>=`, `<=`|等于、不等于、大于、小于、大于等于、小于等于|
|范围查询|`BETWEEN a AND b`|在 [a,b] 范围内（含边界）|
|集合查询|`IN (值1, 值2, ...)`|在指定集合中|
|模糊查询|`LIKE '通配符'`|`_` 匹配单个字符，`%` 匹配任意字符|
|空值判断|`IS NULL` / `IS NOT NULL`|判断字段是否为 NULL|
|逻辑运算|`AND`（与）、`OR`（或）、`NOT`（非）|组合多个条件|

**示例**：

```sql
-- 查询年龄20-25岁、姓“张”的男生
SELECT * FROM students 
WHERE age BETWEEN 20 AND 25 
  AND name LIKE '张%' 
  AND gender = '男';

-- 查询班级ID为101或103的学生（排除年龄为NULL的）
SELECT * FROM students 
WHERE class_id IN (101, 103) 
  AND age IS NOT NULL;
```

### 3. 排序（`ORDER BY`）

> 说人话：这一节讲的是“3. 排序（`ORDER BY`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
SELECT 字段列表 FROM 表名 
ORDER BY 字段1 [ASC|DESC], 字段2 [ASC|DESC], ...;
-- ASC：升序（默认），DESC：降序
```

**示例**：

```sql
-- 按年龄降序、姓名升序排列学生
SELECT * FROM students ORDER BY age DESC, name ASC;
```

### 4. 聚合函数（统计查询）

> 说人话：这一节讲的是“4. 聚合函数（统计查询）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

对一组数据进行计算，返回单个结果：

|函数|说明|示例|
|:--|:--|:--|
|`COUNT()`|统计记录数（忽略 NULL）|`COUNT(*)`（统计所有行）、`COUNT(字段名)`（统计非NULL值）|
|`SUM()`|求和|`SUM(score)`（求总分）|
|`AVG()`|求平均值|`AVG(age)`（求平均年龄）|
|`MAX()`|求最大值|`MAX(score)`（求最高分）|
|`MIN()`|求最小值|`MIN(age)`（求最小年龄）|

**示例**：

```sql
-- 统计学生总数、平均年龄、最高/最低年龄
SELECT 
  COUNT(*) AS total_students,
  AVG(age) AS avg_age,
  MAX(age) AS max_age,
  MIN(age) AS min_age
FROM students;
```

### 5. 分组查询（`GROUP BY`）

> 说人话：这一节讲的是“5. 分组查询（`GROUP BY`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

按指定字段分组，结合聚合函数统计每组数据：

```sql
SELECT 分组字段, 聚合函数(字段) 
FROM 表名 
GROUP BY 分组字段 [HAVING 分组后过滤条件];
```

**示例**：

```sql
-- 按班级分组，统计每个班级的学生数和平均年龄（只显示平均>20岁的班级）
SELECT 
  class_id, 
  COUNT(*) AS class_count, 
  AVG(age) AS class_avg_age
FROM students 
GROUP BY class_id 
HAVING class_avg_age > 20;  -- HAVING 过滤分组结果（类似 WHERE，但作用于分组后）
```

### 6. 分页查询（`LIMIT`）

> 说人话：这一节讲的是“6. 分页查询（`LIMIT`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

限制返回记录数，用于分页（MySQL 语法，其他数据库用 `OFFSET/FETCH`）：

```sql
SELECT 字段列表 FROM 表名 
LIMIT [起始索引,] 记录数;  -- 起始索引从0开始，省略则默认0
```

**示例**：

```sql
-- 查询第2页数据（每页10条，起始索引=10）
SELECT * FROM students LIMIT 10, 10;  -- 等价于 LIMIT 10 OFFSET 10
```

### 7. 多表连接查询（`JOIN`）

> 说人话：这一节讲的是“7. 多表连接查询（`JOIN`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

当数据分布在多张表时，通过关联字段合并查询：

|连接类型|说明|语法示例|
|:--|:--|:--|
|内连接（`INNER JOIN`）|只返回两表匹配的记录|`SELECT * FROM A INNER JOIN B ON A.id=B.a_id`|
|左外连接（`LEFT JOIN`）|返回左表所有记录+右表匹配记录（右表无匹配则为NULL）|`SELECT * FROM A LEFT JOIN B ON A.id=B.a_id`|
|右外连接（`RIGHT JOIN`）|返回右表所有记录+左表匹配记录（左表无匹配则为NULL）|`SELECT * FROM A RIGHT JOIN B ON A.id=B.a_id`|
|全外连接（`FULL JOIN`）|返回两表所有记录（无匹配则为NULL，MySQL 不直接支持，需用 `UNION` 模拟）|-|

**示例**（学生表+班级表内连接）：

```sql
-- 查询学生姓名、年龄及其所在班级名称（假设班级表 classes 有 id、name 字段）
SELECT s.name, s.age, c.name AS class_name
FROM students s
INNER JOIN classes c ON s.class_id = c.id;
```

### 8. 子查询（嵌套查询）

> 说人话：这一节讲的是“8. 子查询（嵌套查询）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

将一个查询的结果作为另一个查询的条件或数据源：

```sql
-- 示例：查询比“张三”年龄大的学生
SELECT * FROM students 
WHERE age > (SELECT age FROM students WHERE name = '张三');
```

## 六、DCL（数据控制语言）

> 说人话：这一节讲的是“六、DCL（数据控制语言）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**作用**：管理数据库访问权限、控制事务，保障数据安全。

### 1. 用户与权限管理

> 说人话：这一节讲的是“1. 用户与权限管理”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

#### （1）创建用户

> 说人话：这一节讲的是“（1）创建用户”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
CREATE USER '用户名'@'主机名' IDENTIFIED BY '密码';
-- 主机名：'localhost'（本地）、'%'（任意远程主机）
-- 示例：创建远程用户 user1，允许所有IP登录
CREATE USER 'user1'@'%' IDENTIFIED BY 'Password123!';
```

#### （2）授权（`GRANT`）

> 说人话：这一节讲的是“（2）授权（`GRANT`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
GRANT 权限列表 ON 数据库名.表名 TO '用户名'@'主机名';
-- 权限列表：ALL PRIVILEGES（所有权限）、SELECT、INSERT、UPDATE、DELETE 等
-- 数据库名.表名：*.*（所有库所有表）、db1.*（db1库所有表）、db1.t1（db1库t1表）
```

**示例**：

```sql
-- 授予 user1 对 testdb 库所有表的查询和插入权限
GRANT SELECT, INSERT ON testdb.* TO 'user1'@'%';

-- 刷新权限（使授权生效）
FLUSH PRIVILEGES;
```

#### （3）回收权限（`REVOKE`）

> 说人话：这一节讲的是“（3）回收权限（`REVOKE`）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
REVOKE 权限列表 ON 数据库名.表名 FROM '用户名'@'主机名';
-- 示例：回收 user1 的插入权限
REVOKE INSERT ON testdb.* FROM 'user1'@'%';
FLUSH PRIVILEGES;
```

#### （4）删除用户

> 说人话：这一节讲的是“（4）删除用户”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
DROP USER '用户名'@'主机名';
```

### 2. 事务管理（ACID 特性）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

事务是一组不可分割的 SQL 操作（要么全成功，要么全失败），保证数据一致性。

#### （1）事务控制命令

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

```sql
START TRANSACTION;  -- 开启事务（或用 BEGIN）
-- 执行 SQL 操作（INSERT/UPDATE/DELETE）
COMMIT;  -- 提交事务（永久保存修改）
ROLLBACK;  -- 回滚事务（撤销所有未提交的修改）
SAVEPOINT 保存点名;  -- 设置保存点（可回滚到指定点）
ROLLBACK TO 保存点名;  -- 回滚到保存点
```

**示例**：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 账户1减100
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 账户2加100
COMMIT;  -- 确认无误后提交
-- 若中间出错，执行 ROLLBACK; 回滚
```

#### （2）事务 ACID 特性

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

- **原子性（Atomicity）**：事务是不可分割的最小单元，要么全做，要么全不做。
    
- **一致性（Consistency）**：事务执行前后，数据从一个合法状态转换到另一个合法状态（如转账后总金额不变）。
    
- **隔离性（Isolation）**：多个事务并发执行时，彼此互不干扰（通过隔离级别控制）。
    
- **持久性（Durability）**：事务提交后，修改永久保存到数据库。
    

#### （3）隔离级别（解决并发问题）

> 说人话：并发问题先想“多个人同时改同一份东西”。锁负责秩序，条件变量负责通知，atomic 适合小状态，别把它们混成一个概念。

|隔离级别|脏读（读未提交）|不可重复读（读已提交，值变化）|幻读（读已提交，行数变化）|实现方式|
|:--|:--|:--|:--|:--|
|读未提交（Read Uncommitted）|✅ 可能|✅ 可能|✅ 可能|无锁|
|读已提交（Read Committed）|❌ 避免|✅ 可能|✅ 可能|行级锁（提交后释放）|
|可重复读（Repeatable Read）|❌ 避免|❌ 避免|✅ 可能（MySQL 默认避免）|MVCC（多版本并发控制）|
|串行化（Serializable）|❌ 避免|❌ 避免|❌ 避免|表级锁（完全串行）|

**查看/设置隔离级别**（MySQL）：

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别（会话级）
SET SESSION TRANSACTION ISOLATION LEVEL 隔离级别;
-- 示例：设置为读已提交
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## 七、总结

> 说人话：这一节讲的是“七、总结”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **DDL**：管结构（库、表、视图、索引），命令 `CREATE/ALTER/DROP/TRUNCATE`。
    
- **DML**：管数据（增删改），命令 `INSERT/UPDATE/DELETE`。
    
- **DQL**：查数据，核心是 `SELECT`，含条件、排序、聚合、分组、连接、子查询。
    
- **DCL**：管权限和事务，命令 `GRANT/REVOKE/COMMIT/ROLLBACK`。
    


# 函数

函数是 SQL 中预定义的代码块，用于实现特定功能（如字符串处理、数值计算、日期转换等），**输入参数后返回计算结果**。MySQL 函数按功能可分为：**字符串函数、数值函数、日期时间函数、聚合函数、流程控制函数、加密/系统函数**等。

## 一、字符串函数

> 说人话：这一节讲的是“一、字符串函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于处理字符串（拼接、截取、替换、大小写转换等），**输入字符串/字符集，返回处理后的字符串或长度**。

|函数名|语法格式|说明|示例|
|:--|:--|:--|:--|
|**CONCAT**|`CONCAT(str1, str2, ..., strn)`|拼接多个字符串（任一参数为 NULL，结果为 NULL）|`CONCAT('Hello', ' ', 'MySQL')` → `'Hello MySQL'`|
|**CONCAT_WS**|`CONCAT_WS(separator, str1, str2, ...)`|用分隔符拼接字符串（跳过 NULL 值）|`CONCAT_WS('-', '2023', '08', '20')` → `'2023-08-20'`|
|**SUBSTRING**|`SUBSTRING(str, start, length)` 或 `SUBSTR(str, start, length)`|截取子串（start：起始位置，1开始；length：截取长度，省略则截取到末尾）|`SUBSTRING('MySQL Function', 7, 5)` → `'Funct'`（从第7位取5个字符）|
|**LENGTH**|`LENGTH(str)`|返回字符串字节数（UTF8中中文占3字节）|`LENGTH('你好')` → `6`（2个中文×3字节）|
|**CHAR_LENGTH**|`CHAR_LENGTH(str)`|返回字符串字符数（与编码无关）|`CHAR_LENGTH('你好')` → `2`|
|**UPPER/LOWER**|`UPPER(str)` / `LOWER(str)`|转大写/小写|`UPPER('abc')` → `'ABC'`；`LOWER('ABC')` → `'abc'`|
|**TRIM/LTRIM/RTRIM**|`TRIM([remstr FROM] str)` / `LTRIM(str)` / `RTRIM(str)`|去除首尾/左侧/右侧空格（或指定字符 remstr）|`TRIM(' abc ')` → `'abc'`；`TRIM('x' FROM 'xxabcxx')` → `'abc'`|
|**REPLACE**|`REPLACE(str, from_str, to_str)`|替换字符串中所有 from_str 为 to_str|`REPLACE('abc123abc', 'abc', 'xyz')` → `'xyz123xyz'`|
|**INSTR**|`INSTR(str, substr)`|返回 substr 在 str 中首次出现的位置（未找到返回 0）|`INSTR('hello world', 'world')` → `7`|
|**LPAD/RPAD**|`LPAD(str, len, padstr)` / `RPAD(str, len, padstr)`|左/右填充字符串至指定长度（len < 原长则截断）|`LPAD('5', 3, '0')` → `'005'`；`RPAD('ab', 4, '*')` → `'ab**'`|

## 二、数值函数

> 说人话：这一节讲的是“二、数值函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于数值计算（绝对值、取整、随机数、三角函数等），**输入数值，返回计算结果**。

|函数名|语法格式|说明|示例|
|:--|:--|:--|:--|
|**ABS**|`ABS(x)`|返回 x 的绝对值|`ABS(-123)` → `123`|
|**ROUND**|`ROUND(x, d)`|四舍五入（d：保留小数位数，省略则取整）|`ROUND(3.1415, 2)` → `3.14`|
|**CEIL/FLOOR**|`CEIL(x)` / `FLOOR(x)`|向上取整（≥x的最小整数）/向下取整（≤x的最大整数）|`CEIL(3.2)` → `4`；`FLOOR(3.9)` → `3`|
|**MOD**|`MOD(x, y)` 或 `x % y`|返回 x 除以 y 的余数|`MOD(10, 3)` → `1`；`10 % 3` → `1`|
|**RAND**|`RAND()`|返回 0~1 之间的随机浮点数（可指定种子：`RAND(seed)`）|`RAND()` → `0.82647...`（每次不同）|
|**POWER**|`POWER(x, y)` 或 `x^y`|返回 x 的 y 次方|`POWER(2, 3)` → `8`|
|**SQRT**|`SQRT(x)`|返回 x 的平方根（x ≥ 0）|`SQRT(16)` → `4`|
|**TRUNCATE**|`TRUNCATE(x, d)`|截断小数（保留 d 位，不四舍五入）|`TRUNCATE(3.1415, 2)` → `3.14`|

## 三、日期时间函数

> 说人话：这一节讲的是“三、日期时间函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于处理日期和时间（获取当前时间、格式化、计算间隔等），**输入日期/时间，返回处理后的日期/时间或数值**。

|函数名|语法格式|说明|示例|
|:--|:--|:--|:--|
|**NOW()**|`NOW()`|返回当前日期时间（YYYY-MM-DD HH:MM:SS）|`NOW()` → `'2023-08-20 14:30:25'`|
|**CURDATE()**|`CURDATE()`|返回当前日期（YYYY-MM-DD）|`CURDATE()` → `'2023-08-20'`|
|**CURTIME()**|`CURTIME()`|返回当前时间（HH:MM:SS）|`CURTIME()` → `'14:30:25'`|
|**DATE_FORMAT**|`DATE_FORMAT(date, format)`|格式化日期（format 见下表）|`DATE_FORMAT(NOW(), '%Y-%m-%d')` → `'2023-08-20'`|
|**STR_TO_DATE**|`STR_TO_DATE(str, format)`|字符串转日期（format 需匹配 str）|`STR_TO_DATE('2023/08/20', '%Y/%m/%d')` → `'2023-08-20'`|
|**DATEDIFF**|`DATEDIFF(date1, date2)`|返回 date1 - date2 的天数差（date1 > date2 为正）|`DATEDIFF('2023-08-20', '2023-08-10')` → `10`|
|**DATE_ADD**|`DATE_ADD(date, INTERVAL expr unit)`|日期加减（unit：DAY/HOUR/MONTH/YEAR 等）|`DATE_ADD(CURDATE(), INTERVAL 7 DAY)` → `'2023-08-27'`|
|**DATE_SUB**|`DATE_SUB(date, INTERVAL expr unit)`|日期减法（同上）|`DATE_SUB(CURDATE(), INTERVAL 1 MONTH)` → `'2023-07-20'`|
|**YEAR/MONTH/DAY**|`YEAR(date)` / `MONTH(date)` / `DAY(date)`|提取日期的年/月/日|`YEAR('2023-08-20')` → `2023`；`MONTH(...)` → `8`|
|**HOUR/MINUTE/SECOND**|`HOUR(time)` / `MINUTE(time)` / `SECOND(time)`|提取时间的时/分/秒|`HOUR('14:30:25')` → `14`|

### `DATE_FORMAT` 常用格式符

> 说人话：这一节讲的是“`DATE_FORMAT` 常用格式符”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

|格式符|说明|示例（输入 `'2023-08-20 14:30:25'`）|输出|
|:--|:--|:--|:--|
|`%Y`|四位年份|`%Y`|`2023`|
|`%y`|两位年份|`%y`|`23`|
|`%m`|两位月份（01-12）|`%m`|`08`|
|`%d`|两位日期（01-31）|`%d`|`20`|
|`%H`|24小时制小时（00-23）|`%H`|`14`|
|`%i`|两位分钟（00-59）|`%i`|`30`|
|`%s`|两位秒（00-59）|`%s`|`25`|
|`%W`|星期名（英文）|`%W`|`Sunday`|

## 四、聚合函数

> 说人话：这一节讲的是“四、聚合函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于对**一组数据进行统计计算**（多行输入，单行输出），常与 `GROUP BY` 配合使用（见 DQL 分组查询）。

|函数名|语法格式|说明|示例（基于 students 表）|
|:--|:--|:--|:--|
|**COUNT()**|`COUNT(字段名)` / `COUNT(*)`|统计非 NULL 记录数（`*` 统计所有行，包括 NULL）|`COUNT(*)` → 总学生数；`COUNT(age)` → 年龄非 NULL 的学生数|
|**SUM()**|`SUM(字段名)`|求和（忽略 NULL）|`SUM(age)` → 所有学生年龄总和|
|**AVG()**|`AVG(字段名)`|求平均值（忽略 NULL）|`AVG(age)` → 平均年龄|
|**MAX()**|`MAX(字段名)`|求最大值（忽略 NULL）|`MAX(age)` → 最大年龄|
|**MIN()**|`MIN(字段名)`|求最小值（忽略 NULL）|`MIN(age)` → 最小年龄|
|**GROUP_CONCAT()**|`GROUP_CONCAT(字段名 [SEPARATOR '分隔符'])`|将分组内字段值拼接为字符串（默认逗号分隔）|`GROUP_CONCAT(name SEPARATOR ';')` → `'张三;李四;王五'`（按班级分组）|

## 五、流程控制函数

> 说人话：这一节讲的是“五、流程控制函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于条件判断（类似编程语言的分支逻辑），**根据条件返回不同结果**。

|函数名|语法格式|说明|示例|
|:--|:--|:--|:--|
|**IF**|`IF(expr, v1, v2)`|若 expr 为真（非0、非NULL），返回 v1，否则返回 v2|`IF(age > 18, '成年', '未成年')` → 年龄>18返回“成年”，否则“未成年”|
|**IFNULL**|`IFNULL(v1, v2)`|若 v1 不为 NULL，返回 v1，否则返回 v2|`IFNULL(address, '未知地址')` → 地址为 NULL 时显示“未知地址”|
|**CASE**|两种形式：  <br>1. `CASE expr WHEN v1 THEN r1 WHEN v2 THEN r2 ... ELSE rn END`  <br>2. `CASE WHEN expr1 THEN r1 WHEN expr2 THEN r2 ... ELSE rn END`|多条件分支判断（类似 switch/case）|示例1：`CASE gender WHEN '男' THEN '先生' WHEN '女' THEN '女士' ELSE '未知' END` → 性别转称呼  <br>示例2：`CASE WHEN age < 18 THEN '少年' WHEN age < 30 THEN '青年' ELSE '中年' END` → 年龄分段|

## 六、其他常用函数

> 说人话：这一节讲的是“六、其他常用函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

### 1. 加密函数

> 说人话：这一节讲的是“1. 加密函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

| 函数名          | 语法格式            | 说明                         | 示例                                                                |
| :----------- | :-------------- | :------------------------- | :---------------------------------------------------------------- |
| **MD5**      | `MD5(str)`      | 返回 str 的 MD5 哈希值（32位十六进制）  | `MD5('123456')` → `'e10adc3949ba59abbe56e057f20f883e'`            |
| **SHA1**     | `SHA1(str)`     | 返回 str 的 SHA1 哈希值（40位十六进制） | `SHA1('abc')` → `'a9993e364706816aba3e25717850c26c9cd0d89d'`      |
| **PASSWORD** | `PASSWORD(str)` | MySQL 旧版密码加密（现推荐用 `SHA2`）  | `PASSWORD('123')` → `'*23AE809DDACAF96AF0FD78ED04B6A265E05AA257'` |

### 2. 系统信息函数

> 说人话：这一节讲的是“2. 系统信息函数”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

|函数名|语法格式|说明|示例|
|:--|:--|:--|:--|
|**VERSION()**|`VERSION()`|返回 MySQL 版本号|`VERSION()` → `'8.0.32'`|
|**USER()**|`USER()`|返回当前登录用户|`USER()` → `'root@localhost'`|
|**DATABASE()**|`DATABASE()`|返回当前使用的数据库名|`DATABASE()` → `'testdb'`|
|**LAST_INSERT_ID()**|`LAST_INSERT_ID()`|返回最后一次自增 ID（影响多行插入时返回首行 ID）|`INSERT ...; SELECT LAST_INSERT_ID();` → 新增记录的自增 ID|

### 3. JSON 函数（MySQL 5.7+）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

用于处理 JSON 数据（解析、提取、修改）：

- `JSON_EXTRACT(json_doc, path)`：提取 JSON 字段（`path` 如 `$.name`）→ 简写 `json_doc->'$.name'`
    
- `JSON_OBJECT(key1, val1, key2, val2)`：创建 JSON 对象 → `JSON_OBJECT('name', '张三', 'age', 20)` → `{"name": "张三", "age": 20}`
    
- `JSON_ARRAY(val1, val2)`：创建 JSON 数组 → `JSON_ARRAY(1, 'a', true)` → `[1, "a", true]`
    

## 七、函数使用注意事项

> 说人话：这一节讲的是“七、函数使用注意事项”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

1. **参数类型匹配**：函数参数需符合预期类型（如字符串函数传入数值会自动转为字符串，可能导致意外结果）。
    
2. **NULL 处理**：多数函数遇 NULL 返回 NULL（如 `CONCAT('a', NULL)` → NULL），需用 `IFNULL` 预处理。
    
3. **性能影响**：复杂函数（如正则匹配 `REGEXP`）可能影响查询效率，避免在 WHERE 条件中对字段直接使用函数（会导致索引失效）。
    
4. **版本兼容性**：部分函数为高版本 MySQL 新增（如 JSON 函数需 5.7+），低版本需升级或使用替代方案。
    


# 约束与多表查询

## 一、约束（Constraints）

> 说人话：这一节讲的是“一、约束（Constraints）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**约束**是作用于表中字段上的规则，用于**保证数据的完整性、准确性和一致性**（如避免重复、空值、无效关联等）。MySQL 支持多种约束类型，可在创建表时定义（列级约束）或表级约束。

### 1. 约束分类与详解

> 说人话：对象相关内容重点看生命周期。对象什么时候出生、什么时候复制或移动、什么时候销毁，决定了代码是否安全。

|约束类型|作用|语法示例|注意事项|
|:--|:--|:--|:--|
|**主键约束**|唯一标识表中**一条记录**（非空且唯一），一个表只能有一个主键。|列级：`id INT PRIMARY KEY`  <br>表级：`PRIMARY KEY (id)`  <br>复合主键：`PRIMARY KEY (id, class_id)`|主键字段建议用 `INT/BIGINT` + `AUTO_INCREMENT`（自增），避免手动赋值冲突。|
|**外键约束**|关联两张表，保证**从表数据必须引用主表存在的数据**（参照完整性）。|表级：`FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE ON UPDATE RESTRICT`|主表关联字段必须是主键或唯一键；MySQL 5.6+ 需启用外键支持（`InnoDB` 引擎）。|
|**唯一约束**|保证字段值**唯一**（允许 NULL，但 NULL 仅可出现一次，视数据库而定）。|列级：`username VARCHAR(50) UNIQUE`  <br>表级：`UNIQUE (username, email)`（复合唯一）|与主键区别：唯一约束可允许多个 NULL，主键不允许 NULL。|
|**非空约束**|保证字段值**不为 NULL**。|列级：`name VARCHAR(50) NOT NULL`|未设置默认值时，插入数据必须显式传值，否则报错。|
|**检查约束**|保证字段值满足指定条件（如年龄范围、性别枚举）。|MySQL 8.0+：`age TINYINT CHECK (age >= 0 AND age <= 150)`  <br>低版本用触发器模拟|低版本（如 5.7）忽略 `CHECK` 约束，需通过应用层或触发器实现。|
|**默认约束**|未显式赋值时，自动使用默认值。|列级：`gender ENUM('男','女') DEFAULT '未知'`  <br>数值：`score INT DEFAULT 0`|默认值需与字段类型兼容（如字符串默认值用单引号）。|
|**自增约束**|整数主键自动递增（从1开始，步长1），避免手动维护ID。|列级：`id INT PRIMARY KEY AUTO_INCREMENT`|仅适用于整数类型主键，删除记录后自增ID不回滚（如删除id=3，下条记录仍为4）。|

### 2. 约束使用示例

> 说人话：这一节讲的是“2. 约束使用示例”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

#### （1）创建表时定义约束（综合示例）

> 说人话：这一节讲的是“（1）创建表时定义约束（综合示例）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
CREATE TABLE students (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID（主键+自增）',
  name VARCHAR(50) NOT NULL COMMENT '姓名（非空）',
  age TINYINT UNSIGNED CHECK (age >= 0 AND age <= 150) DEFAULT 18 COMMENT '年龄（检查+默认）',
  gender ENUM('男','女','未知') DEFAULT '未知' COMMENT '性别（枚举+默认）',
  id_card CHAR(18) UNIQUE COMMENT '身份证号（唯一）',
  class_id INT COMMENT '班级ID（外键）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（默认当前时间）',
  -- 表级约束：外键关联 classes 表 id，级联删除+限制更新
  FOREIGN KEY (class_id) REFERENCES classes(id) 
    ON DELETE CASCADE  -- 主表班级删除时，从表学生记录也删除
    ON UPDATE RESTRICT -- 主表班级ID更新时，若从表有引用则拒绝
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '学生表';
```

#### （2）修改表时添加/删除约束

> 说人话：这一节讲的是“（2）修改表时添加/删除约束”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

```sql
-- 添加外键约束
ALTER TABLE students 
ADD CONSTRAINT fk_class 
FOREIGN KEY (class_id) REFERENCES classes(id);

-- 删除外键约束（需知道约束名，可通过 SHOW CREATE TABLE 查看）
ALTER TABLE students DROP FOREIGN KEY fk_class;

-- 添加唯一约束
ALTER TABLE students ADD UNIQUE (id_card);

-- 删除唯一约束（需知道约束名，默认格式为 表名_字段名_unique）
ALTER TABLE students DROP INDEX id_card;
```

### 3. 约束的作用与重要性

> 说人话：这一节讲的是“3. 约束的作用与重要性”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **数据完整性**：避免无效数据（如负年龄、重复用户名）。
    
- **参照完整性**：通过外键保证关联表数据一致性（如学生不能属于不存在的班级）。
    
- **简化应用逻辑**：数据库层自动校验，减少应用代码负担。
    

## 二、多表查询

> 说人话：这一节讲的是“二、多表查询”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

实际业务中，数据常分散在多张表（如学生表、班级表、成绩表），需通过**多表查询**关联分析。多表查询核心是**连接（JOIN）**，按逻辑分为**连接查询**、**子查询**、**联合查询**。

### 1. 连接查询（JOIN）

> 说人话：这一节讲的是“1. 连接查询（JOIN）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

通过关联字段（如外键）将多表记录合并，按连接条件分为以下几类：

#### （1）内连接（INNER JOIN）

> 说人话：这一节讲的是“（1）内连接（INNER JOIN）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**只返回两表中匹配关联条件的记录**（交集），是最常用的连接方式。

**语法**：

```sql
SELECT 字段列表 
FROM 表1 
INNER JOIN 表2 ON 表1.关联字段 = 表2.关联字段 
[WHERE 过滤条件];
```

**示例**（学生表+班级表，查询学生姓名、班级名称）：

```sql
-- 表结构：students(id, name, class_id), classes(id, name)
SELECT s.name AS 学生姓名, c.name AS 班级名称
FROM students s
INNER JOIN classes c ON s.class_id = c.id;  -- 关联条件：学生表class_id=班级表id
```

**结果**：仅包含有班级的学生（class_id 不为 NULL 且在 classes 表中存在的记录）。

#### （2）外连接（OUTER JOIN）

> 说人话：这一节讲的是“（2）外连接（OUTER JOIN）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**返回主表所有记录 + 从表匹配记录**（不匹配则显示 NULL），分左外连接、右外连接、全外连接。

|类型|语法|说明|示例（学生表s，班级表c）|
|:--|:--|:--|:--|
|**左外连接**|`LEFT [OUTER] JOIN`|返回**左表所有记录** + 右表匹配记录（右表无匹配则为 NULL）|`s LEFT JOIN c ON s.class_id=c.id` → 含无班级的学生|
|**右外连接**|`RIGHT [OUTER] JOIN`|返回**右表所有记录** + 左表匹配记录（左表无匹配则为 NULL）|`s RIGHT JOIN c ON s.class_id=c.id` → 含无学生的班级|
|**全外连接**|`FULL [OUTER] JOIN`|返回两表所有记录（无匹配则为 NULL），**MySQL 不直接支持**，需用 `UNION` 模拟|`(s LEFT JOIN c) UNION (s RIGHT JOIN c)`|

**左外连接示例**（查询所有学生，含无班级的学生）：

```sql
SELECT s.name AS 学生姓名, c.name AS 班级名称
FROM students s
LEFT JOIN classes c ON s.class_id = c.id;
-- 结果：无班级的学生，班级名称显示为 NULL
```

#### （3）交叉连接（CROSS JOIN）

> 说人话：这一节讲的是“（3）交叉连接（CROSS JOIN）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**返回两表记录的笛卡尔积**（表1行数 × 表2行数），无关联条件（极少用，易产生大量冗余数据）。

**语法**：

```sql
SELECT * FROM 表1 CROSS JOIN 表2;  -- 等价于 SELECT * FROM 表1, 表2;
```

**示例**（3个学生 × 2个班级 → 6条记录）：

```sql
SELECT s.name, c.name FROM students s CROSS JOIN classes c;
```

#### （4）自连接（SELF JOIN）

> 说人话：这一节讲的是“（4）自连接（SELF JOIN）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**同一表自己连接自己**，用于查询表中层级关系（如员工-经理、分类-子分类）。

**示例**（员工表employees含id、name、manager_id，查询员工及其经理姓名）：

```sql
SELECT e.name AS 员工姓名, m.name AS 经理姓名
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;  -- 自连接：员工表关联自身（经理ID=经理表ID）
```

### 2. 子查询（Subquery）

> 说人话：这一节讲的是“2. 子查询（Subquery）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

**将一个查询（子查询）的结果作为另一个查询（主查询）的条件或数据源**，分以下类型：

#### （1）按位置分类

> 说人话：对象相关内容重点看生命周期。对象什么时候出生、什么时候复制或移动、什么时候销毁，决定了代码是否安全。

|位置|说明|示例|
|:--|:--|:--|
|**WHERE**|子查询作为过滤条件（最常用）|查询年龄大于平均年龄的学生：`SELECT * FROM students WHERE age > (SELECT AVG(age) FROM students)`|
|**FROM**|子查询作为临时表（需别名）|查询每个班级的平均年龄：`SELECT class_id, avg_age FROM (SELECT class_id, AVG(age) AS avg_age FROM students GROUP BY class_id) t`|
|**SELECT**|子查询作为字段值（标量子查询，仅返回1行1列）|查询学生姓名及其班级人数：`SELECT name, (SELECT COUNT(*) FROM students s2 WHERE s2.class_id=s1.class_id) AS class_count FROM students s1`|

#### （2）按返回结果分类

> 说人话：对象相关内容重点看生命周期。对象什么时候出生、什么时候复制或移动、什么时候销毁，决定了代码是否安全。

|类型|说明|示例|
|:--|:--|:--|
|**标量子查询**|返回**1行1列**（单个值）|`(SELECT AVG(age) FROM students)` → 平均年龄（数值）|
|**列子查询**|返回**1列多行**（值列表）|`(SELECT id FROM classes WHERE grade=3)` → 三年级班级ID列表|
|**行子查询**|返回**1行多列**（一行记录）|`(SELECT name, age FROM students WHERE id=1)` → 单个学生的姓名和年龄|
|**表子查询**|返回**多行多列**（临时表）|`(SELECT id, name FROM classes)` → 班级表的部分字段作为临时表|

#### （3）相关子查询 vs 非相关子查询

> 说人话：这一节讲的是“（3）相关子查询 vs 非相关子查询”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **非相关子查询**：子查询独立执行，不依赖主查询（如上述标量子查询示例）。
    
- **相关子查询**：子查询依赖主查询字段（需多次执行，效率较低）。
    

**相关子查询示例**（查询有不及格成绩的学生）：

```sql
SELECT s.name 
FROM students s 
WHERE EXISTS (  -- EXISTS：子查询返回结果则条件成立
  SELECT 1 FROM scores sc WHERE sc.student_id = s.id AND sc.score < 60
);
```

### 3. 联合查询（UNION/UNION ALL）

> 说人话：操作系统可以先当成资源管家。它负责把 CPU、内存、文件和设备分给程序，并尽量让大家互不干扰。

**将多个 SELECT 结果合并为一个结果集**，需满足：**列数相同、对应列类型兼容**。

|类型|说明|语法示例|
|:--|:--|:--|
|**UNION**|合并结果并**去重**（默认排序）|`SELECT name FROM students UNION SELECT name FROM teachers;`|
|**UNION ALL**|合并结果**不去重**（效率更高）|`SELECT name FROM students UNION ALL SELECT name FROM teachers;`|

**示例**（合并学生和老师的姓名）：

```sql
SELECT 'student' AS type, name FROM students
UNION ALL
SELECT 'teacher' AS type, name FROM teachers;
-- 结果：type列标识身份，name列合并两者姓名（不去重）
```

### 4. 多表查询注意事项

> 说人话：这一节讲的是“4. 多表查询注意事项”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

1. **关联字段必选**：连接查询需明确关联条件（如 `ON 表1.id=表2.表1_id`），避免笛卡尔积。
    
2. **性能优化**：
    
    - 优先用**内连接**代替子查询（效率更高）。
        
    - 关联字段建立索引（如外键字段）。
        
    - 避免多层嵌套子查询（可拆分为临时表分步查询）。
        
3. **别名使用**：多表查询时用别名（如 `s` 代表 students）简化语法。
    

## 三、总结

> 说人话：这一节讲的是“三、总结”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **约束**：通过主键、外键、唯一、非空等规则保证数据质量，是数据库设计的基石。
    
- **多表查询**：
    
    - **连接查询**（INNER/LEFT/RIGHT JOIN）：关联多表记录，核心是关联条件。
        
    - **子查询**：嵌套查询，灵活但需注意效率和相关性。
        
    - **联合查询**（UNION）：合并多个结果集，适合异构数据整合。
        


# 事务

## 一、事务的基本概念

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

**事务**是数据库中**一组不可分割的操作序列**，这些操作要么**全部成功执行**（提交），要么**全部失败回滚**（恢复到初始状态），是保证数据一致性的核心机制。

**通俗理解**：事务像一个“原子操作包”，例如“转账”场景中，“A账户扣钱”和“B账户加钱”必须同时成功或同时失败，不能出现“A扣了钱但B没收到”的中间状态。

## 二、事务的核心特性（ACID）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

事务的四大特性（ACID）是衡量事务可靠性的标准，也是数据库设计的基石。

|特性|全称|含义|实现依赖（InnoDB引擎）|
|:--|:--|:--|:--|
|**原子性**|Atomicity|事务是不可分割的最小单元，要么全做，要么全不做（无中间状态）。|undo log（回滚日志，记录反向操作，失败时回滚）|
|**一致性**|Consistency|事务执行前后，数据从一个合法状态转换到另一个合法状态（如转账后总金额不变）。|原子性+隔离性+持久性共同保证|
|**隔离性**|Isolation|多个事务并发执行时，彼此互不干扰（通过隔离级别控制可见性）。|MVCC（多版本并发控制）+ 锁机制|
|**持久性**|Durability|事务提交后，修改永久保存到数据库（即使系统崩溃也不丢失）。|redo log（重做日志，记录修改，崩溃后重放）|

### 1. 原子性（Atomicity）

> 说人话：这一节讲的是“1. 原子性（Atomicity）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **问题场景**：若事务中某步操作失败（如插入数据时违反唯一约束），需撤销已执行的所有操作。
    
- **实现**：InnoDB 通过 **undo log** 记录事务执行前的原始数据。若事务失败，通过 undo log 逆向执行（如 insert 回滚为 delete，update 回滚为旧值）恢复数据。
    

### 2. 一致性（Consistency）

> 说人话：这一节讲的是“2. 一致性（Consistency）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **本质**：事务执行结果需符合业务规则（如“账户余额不能为负”“订单状态流转正确”）。
    
- **实现**：需结合应用层逻辑（如业务校验）和数据库约束（如非空、检查约束），ACID 其他特性是基础。
    

### 3. 隔离性（Isolation）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

- **问题背景**：多事务并发时，可能出现**脏读、不可重复读、幻读**等问题（见下文“并发问题与隔离级别”）。
    
- **实现**：InnoDB 通过 **MVCC（多版本并发控制）** 和 **锁机制**（行锁、表锁、间隙锁）实现隔离性，平衡并发性能与数据一致性。
    

### 4. 持久性（Durability）

> 说人话：这一节讲的是“4. 持久性（Durability）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **问题场景**：事务提交后，若数据库崩溃，需保证修改不丢失。
    
- **实现**：InnoDB 通过 **redo log** 记录事务的修改操作（物理日志，如“将页X的偏移Y修改为Z”）。事务提交时，先将 redo log 写入磁盘（WAL 技术：Write-Ahead Logging），再异步刷盘数据文件。崩溃后，通过 redo log 重放未刷盘的修改。
    

## 三、事务的状态

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

事务从启动到结束，经历以下状态：

|状态|说明|
|:--|:--|
|**活动状态**|事务正在执行 SQL 操作（如 INSERT/UPDATE），未结束。|
|**部分提交**|事务最后一条 SQL 执行完成，结果暂存内存，等待刷盘（此时崩溃可能丢失）。|
|**失败状态**|事务执行中出错（如违反约束、系统崩溃），无法继续。|
|**中止状态**|事务失败后，通过 rollback 回滚到初始状态，释放资源。|
|**提交状态**|事务所有操作成功完成，通过 commit 永久保存修改，进入提交状态。|

## 四、事务的并发问题与隔离级别

> 说人话：并发问题先想“多个人同时改同一份东西”。锁负责秩序，条件变量负责通知，atomic 适合小状态，别把它们混成一个概念。

多事务并发执行时，因操作交叉可能破坏隔离性，产生以下问题：

### 1. 并发问题详解

> 说人话：并发问题先想“多个人同时改同一份东西”。锁负责秩序，条件变量负责通知，atomic 适合小状态，别把它们混成一个概念。

|问题|定义|示例|
|:--|:--|:--|
|**脏读**|事务A读取到事务B**未提交**的修改（事务B可能回滚，导致A读取到“脏数据”）。|事务B将账户余额从100改为200（未提交），事务A读取到200；后事务B回滚，实际余额为100，A读取的200是“脏数据”。|
|**不可重复读**|事务A内**多次读取同一数据**，因事务B的**提交修改**导致结果不一致。|事务A第一次读账户余额为100，事务B将其改为200并提交，事务A第二次读变为200（两次结果不同）。|
|**幻读**|事务A内**多次查询同一范围数据**，因事务B的**提交新增/删除**导致结果行数变化（“幻觉”新增/删除行）。|事务A查询“余额>100”的账户（共2条），事务B插入1条余额150的账户并提交，事务A再次查询变为3条。|

### 2. 隔离级别（解决并发问题）

> 说人话：并发问题先想“多个人同时改同一份东西”。锁负责秩序，条件变量负责通知，atomic 适合小状态，别把它们混成一个概念。

SQL 标准定义了4种隔离级别，从低到高隔离性增强，并发性能降低：

|隔离级别|脏读|不可重复读|幻读|实现方式（InnoDB）|MySQL 默认？|
|:--|:--|:--|:--|:--|:--|
|**读未提交（Read Uncommitted）**|✅ 可能|✅ 可能|✅ 可能|无锁，直接读取最新数据（含未提交）|❌|
|**读已提交（Read Committed）**|❌ 避免|✅ 可能|✅ 可能|行级锁（提交后释放），MVCC 快照读（每次读生成新快照）|❌（Oracle默认）|
|**可重复读（Repeatable Read）**|❌ 避免|❌ 避免|❌ 避免（InnoDB 通过间隙锁进一步避免）|MVCC 快照读（事务内共用一个快照）+ 行锁/间隙锁|✅（MySQL默认）|
|**串行化（Serializable）**|❌ 避免|❌ 避免|❌ 避免|表级锁（完全串行执行，无并发）|❌|

#### （1）MySQL 默认隔离级别：可重复读（Repeatable Read）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

- **实现原理**：InnoDB 通过 **MVCC** 保证“可重复读”——事务启动时生成一个**一致性读视图（快照）**，后续查询均基于此快照，不受其他事务提交的影响。
    
- **幻读的特殊处理**：InnoDB 在“可重复读”级别下，通过 **间隙锁（Gap Lock）** 锁定查询范围的间隙（如 `WHERE id > 10` 锁定 id>10 的间隙），阻止其他事务插入新行，从而避免幻读。
    

#### （2）查看与设置隔离级别

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

```sql
-- 查看当前会话隔离级别
SELECT @@SESSION.transaction_isolation;
-- 查看全局隔离级别
SELECT @@GLOBAL.transaction_isolation;

-- 设置会话隔离级别（仅当前连接有效）
SET SESSION TRANSACTION ISOLATION LEVEL 隔离级别;
-- 示例：设置为读已提交
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 设置全局隔离级别（需重启连接生效）
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

## 五、事务的控制语句

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

MySQL 通过以下语句显式控制事务（默认自动提交模式下，需先关闭自动提交）：

### 1. 基本控制语句

> 说人话：这一节讲的是“1. 基本控制语句”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

|语句|作用|示例|
|:--|:--|:--|
|`START TRANSACTION` 或 `BEGIN`|显式开启一个事务（关闭自动提交，进入事务上下文）|`START TRANSACTION;`|
|`COMMIT`|提交事务：将修改永久保存到数据库，释放锁资源|`COMMIT;`|
|`ROLLBACK`|回滚事务：撤销所有未提交的修改，恢复到事务开始状态|`ROLLBACK;`|
|`SET autocommit = 0/1`|关闭/开启自动提交（0：关闭，需手动 COMMIT/ROLLBACK；1：默认，每条 SQL 自动提交）|`SET autocommit = 0;`（关闭自动提交，进入显式事务模式）|

### 2. 高级控制：保存点（SAVEPOINT）

> 说人话：这一节讲的是“2. 高级控制：保存点（SAVEPOINT）”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

用于**部分回滚**（事务内设置多个“存档点”，可回滚到指定存档点，而非全部回滚）。

|语句|作用|示例|
|:--|:--|:--|
|`SAVEPOINT 保存点名`|在事务内设置一个保存点（存档）|`SAVEPOINT sp1;`|
|`ROLLBACK TO 保存点名`|回滚到指定保存点（保存点之后的操作被撤销，保存点之前的操作保留）|`ROLLBACK TO sp1;`|
|`RELEASE SAVEPOINT 保存点名`|删除指定保存点（释放资源，不影响事务）|`RELEASE SAVEPOINT sp1;`|

**保存点示例**（转账场景，部分回滚）：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- A账户扣100
SAVEPOINT sp1;  -- 设置保存点sp1（此时A已扣钱，B未加钱）
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- B账户加100
-- 若发现B账户异常，回滚到sp1（仅撤销B的加钱操作，保留A的扣钱？不，实际应调整逻辑，此处仅为示例）
ROLLBACK TO sp1;  -- 回滚到sp1，B的加钱操作被撤销，A的扣钱操作仍保留（需业务层处理）
COMMIT;  -- 最终提交（此时A已扣钱，B未加钱，需人工介入）
```

## 六、事务的实现原理（InnoDB 引擎）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

InnoDB 通过 **日志（redo/undo log）** 和 **MVCC** 实现事务的 ACID 特性，核心组件如下：

### 1. redo log（重做日志）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

- **作用**：保证事务的**持久性**，记录数据页的物理修改（如“页号X，偏移Y，旧值A，新值B”）。
    
- **写入时机**：事务执行中实时写入 redo log buffer，提交时刷盘（通过 `innodb_flush_log_at_trx_commit` 控制刷盘策略，默认1：每次提交刷盘）。
    
- **循环写入**：redo log 是固定大小的环形缓冲区，写满后覆盖旧日志（已刷盘的数据）。
    

### 2. undo log（回滚日志）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

- **作用**：保证事务的**原子性**，记录数据修改前的旧值（逻辑日志，如“将id=1的name从‘张三’改为‘李四’”）。
    
- **类型**：
    
    - `insert undo log`：记录插入操作，事务提交后可删除（插入的记录对其他事务不可见，无需保留）。
        
    - `update undo log`：记录更新/删除操作，需保留至无事务引用（用于MVCC读和回滚）。
        

### 3. MVCC（多版本并发控制）

> 说人话：并发问题先想“多个人同时改同一份东西”。锁负责秩序，条件变量负责通知，atomic 适合小状态，别把它们混成一个概念。

- **作用**：保证事务的**隔离性**，通过“数据多版本”实现读写不阻塞（读不加锁，写不阻塞读）。
    
- **核心概念**：
    
    - **隐藏字段**：每行数据含 `DB_TRX_ID`（最后修改事务ID）、`DB_ROLL_PTR`（指向 undo log 中旧版本的指针）。
        
    - **ReadView（读视图）**：事务启动时生成的“快照”，包含当前活跃事务ID列表，用于判断数据版本可见性（仅可见“已提交且事务ID小于当前事务ID”的版本）。
        

## 七、事务的使用场景与注意事项

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

### 1. 典型使用场景

> 说人话：这一节讲的是“1. 典型使用场景”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **资金交易**：转账（A扣钱+B加钱）、支付（订单扣款+库存扣减）。
    
- **订单流程**：创建订单（生成订单记录+扣减库存+记录日志）。
    
- **数据同步**：跨表数据迁移（源表删除+目标表插入）。
    

### 2. 注意事项

> 说人话：这一节讲的是“2. 注意事项”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

- **避免长事务**：长事务会占用锁资源、积累 undo log 导致膨胀，甚至引发主从延迟（MySQL 复制基于事务日志）。
    
- **合理选择隔离级别**：读已提交（RC）并发性能更好，适合大多数业务；可重复读（RR）适合强一致性场景（如金融）。
    
- **事务中避免耗时操作**：如网络请求、文件IO，会阻塞事务并增加锁持有时间。
    
- **防止死锁**：多事务交叉更新同一批数据时可能死锁（如事务1锁行A再锁行B，事务2锁行B再锁行A），可通过**固定更新顺序**（如按ID升序更新）避免。
    
- **自动提交模式**：默认 `autocommit=1`（每条SQL自动提交），显式事务需 `START TRANSACTION` 或 `SET autocommit=0`。
    

## 八、分布式事务简介（扩展）

> 说人话：数据库问题先看它服务哪类操作：查得快、写得稳、并发不乱、故障能恢复。读这一节时把索引、事务、锁和日志串起来。

**分布式事务**指跨多个数据库/服务的事务（如微服务架构下单服务调用库存服务和支付服务），需保证跨节点的一致性，挑战更大。

### 常见解决方案

> 说人话：这一节讲的是“常见解决方案”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

|方案|原理|缺点|
|:--|:--|:--|
|**2PC（两阶段提交）**|协调者分“准备阶段”（各节点预提交）和“提交阶段”（全部成功后正式提交）|同步阻塞、单点故障、数据不一致风险|
|**TCC（Try-Confirm-Cancel）**|业务层拆分“尝试预留资源（Try）-确认提交（Confirm）-取消回滚（Cancel）”|开发成本高，需手写补偿逻辑|
|**消息队列（最终一致性）**|通过本地事务+消息队列异步通知，保证最终一致（如 RocketMQ 事务消息）|短暂不一致，适合非实时场景|

## 九、总结

> 说人话：这一节讲的是“九、总结”。先别急着背定义，先抓住它解决的问题、代码里怎么写、边界在哪里。

事务是保证数据一致性的核心机制，其 **ACID 特性**通过 undo log（原子性）、redo log（持久性）、MVCC+锁（隔离性）实现。实际使用中，需根据业务场景选择隔离级别、控制事务粒度，并避免长事务和死锁。掌握事务原理，是设计高可靠数据库应用的基础。
