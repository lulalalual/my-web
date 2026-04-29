---
title: 回溯搜索
permalink: posts/backtracking-dfs-framework/
date: 2026-04-26 10:40:00
updated: 2026-04-26 10:40:00
categories:
  - 算法笔记
tags:
  - 算法
  - 回溯
  - DFS
cover: /img/covers/notes/algo-dfs-note.webp
description: 回溯就是做选择、继续走、走不通再撤销选择。
---

回溯可以想成“试路”。每走一步先做选择，继续往下试；如果走不通，就退回来换一条路。

## 基本框架

```cpp
void dfs() {
    if (到达终点) {
        保存答案;
        return;
    }
    for (选择 : 所有选择) {
        做选择;
        dfs();
        撤销选择;
    }
}
```

这段模板最重要的是最后一步：撤销选择。没有撤销，下一条分支就会被前面的状态污染。

## 适合什么题

- 子集。
- 排列。
- 组合。
- 棋盘搜索。
- 路径枚举。

## 小例子

```cpp
path.push_back(x);
dfs();
path.pop_back();
```

`push` 是选择，`pop` 是撤销。理解这两个动作，回溯就不再神秘。

## 少踩坑

先想清楚递归函数代表什么，再想每一层有哪些选择。不要一上来就写很多条件判断。

