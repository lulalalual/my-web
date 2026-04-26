---
title: 回溯搜索与DFS框架笔记
date: 2026-04-26 10:40:00
updated: 2026-04-26 10:40:00
categories:
  - 算法笔记
tags:
  - 算法
  - 回溯
  - DFS
cover: /img/covers/notes/algo-dfs-note.webp
description: 回溯和 DFS 的核心不是递归本身，而是路径、选择列表、结束条件和撤销操作这四个元素。
---

回溯是“带撤销的 DFS”。如果一个搜索问题需要枚举所有合法方案，而且每一步都要在多个分支之间做选择，优先想回溯。

## 四个固定元素

- 路径：当前已经做出的选择。
- 选择列表：当前还能选什么。
- 结束条件：什么时候收集答案。
- 撤销操作：返回上一层前要恢复现场。

## 通用模板

```cpp
vector<vector<int>> ans;
vector<int> path;

void dfs(vector<int>& nums, vector<int>& used) {
    if (path.size() == nums.size()) {
        ans.push_back(path);
        return;
    }

    for (int i = 0; i < nums.size(); ++i) {
        if (used[i]) continue;
        used[i] = 1;
        path.push_back(nums[i]);
        dfs(nums, used);
        path.pop_back();
        used[i] = 0;
    }
}
```

## 三类题的区别

- 子集：每个元素选或不选。
- 排列：每层都从“未使用元素”里选一个。
- 组合：通过起始下标避免重复选择顺序。

## 剪枝要点

- 排序后剪枝最常见，可以处理重复元素和提前终止。
- 当当前路径已经不可能优于答案时，立即返回。
- 对组合求和类问题，如果数字非负，当前和超出目标后可以直接停止。

## 和普通 DFS 的区别

图遍历的 DFS 更关注“访问状态”和连通性；回溯更关注“枚举树”和撤销选择。两者都用递归，但目标不同。

