---
title: KV存储
permalink: posts/raft-kv-storage-review/
date: 2026-04-25 14:00:00
updated: 2026-04-25 14:00:00
categories:
  - 分布式系统
tags:
  - 分布式
  - Raft
  - C++
  - KV存储
  - RPC
cover: /img/covers/notes/project-raft.webp
description: 把 Raft KV 项目讲成一套多人记账系统：选主、复制、确认、落盘。
---

这个项目可以先不要想得太复杂。它像一套多人记账系统：大家要记同一本账，必须先选一个负责人，再按同样顺序记账。

## 项目做什么

客户端发来 `put/get` 请求，系统要保证多台机器看到的数据尽量一致。核心流程是：

```text
选出 Leader -> Leader 记录日志 -> 复制给多数节点 -> 提交到状态机
```

## Raft 怎么看

- Follower：平时听 Leader 的。
- Candidate：准备竞选 Leader。
- Leader：负责接收写请求并复制日志。

## 小代码

```cpp
if (receiveMajorityAck(logIndex)) {
    commit(logIndex);
    stateMachine.apply(logIndex);
}
```

意思是：大多数节点都确认后，这条日志才算真正提交。

## 项目价值

这个项目能训练分布式系统的基本感觉：不是一台机器写成功就完事，而是要考虑宕机、超时、重试、日志顺序和数据恢复。

后续可以继续补快照、批量复制、读一致性和压测记录。

