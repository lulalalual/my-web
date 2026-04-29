---
title: KV存储
permalink: posts/raft-kv-storage-review/
date: 2026-04-25 14:00:00
updated: 2026-04-30 09:25:00
categories:
  - 分布式系统
tags:
  - 分布式
  - Raft
  - C++
  - KV存储
  - RPC
cover: /img/covers/ai/cover-raft-kv.webp
description: 复盘基于 Raft 的分布式 KV：选主、日志复制、持久化、状态机、跳表和 RPC 通信。
---
这个项目是用 C++ 实现的基于 Raft 的分布式 KV 存储。先不要把它想成工业级数据库，它更适合理解成一个“用 Raft 把多台机器变成一台可靠 KV 服务”的学习项目。

## 项目先说人话

如果只有一台机器，写入 <code>put a 1</code> 很简单，写到本地就行。问题是这台机器挂了怎么办？

分布式 KV 的思路是：多台机器保存同一份数据。写入不是随便写，而是先由 Leader 记录日志，再复制给多数节点，最后大家按相同顺序执行。

~~~text
客户端请求 -> Leader 收到命令 -> 复制日志 -> 多数确认 -> 提交 -> 状态机执行
~~~

这样即使少数节点挂了，系统仍然能继续工作。

## 技术栈和模块

项目主要包括这些模块：

- <code>raftCore/raft.cpp</code>：Raft 核心逻辑，包括选举、心跳、日志复制和提交。
- <code>raftCore/kvServer.cpp</code>：KV 服务层，把客户端命令交给 Raft，再把提交结果应用到状态机。
- <code>raftCore/Persister.cpp</code>：持久化关键状态，支持节点重启恢复。
- <code>raftRpcPro/*.proto</code>：定义 Raft 和 KV 的 RPC 消息。
- <code>rpc/</code>：自定义 RPC 通信框架，用 Protobuf 做序列化。
- <code>skipList/include/skipList.h</code>：跳表实现，作为底层 KV 存储结构。
- <code>fiber/</code>：协程和 IO 管理相关模块，用来支持更高效的并发调度。
- <code>raftClerk/</code>：客户端调用封装，负责向 KV 集群发送请求。

这些模块合起来，形成一条完整链路：客户端发请求，RPC 传输，Raft 达成一致，KV 状态机执行，必要状态落盘。

## Raft 解决什么问题

Raft 解决的是“多台机器如何对同一批操作达成一致”。它不直接关心 key 和 value，它关心的是日志顺序。

只要每台机器都按同样顺序执行同样日志，最终状态就会一致。

~~~text
日志1：put x 1
日志2：put y 2
日志3：delete x
~~~

如果所有节点都按这个顺序执行，KV 数据就不会乱。

## 三种角色

Raft 节点有三种角色：

- Follower：普通节点，接收 Leader 的心跳和日志。
- Candidate：候选节点，准备发起选举。
- Leader：领导者，负责处理写请求和复制日志。

Leader 不是永远固定的。如果一段时间收不到 Leader 心跳，Follower 会变成 Candidate 发起选举。谁拿到多数票，谁成为新 Leader。

## 领导者选举

选举可以理解成“谁来负责记账”。为了避免所有节点同时竞选，Raft 会使用随机选举超时。

大致流程是：

~~~text
Follower 超时 -> 变 Candidate -> term 加 1 -> 向其他节点请求投票 -> 多数同意 -> 成为 Leader
~~~

选举里最重要的不是“选出一个人”，而是“同一个任期最多只有一个 Leader”。这保证了系统不会同时有多个节点乱写日志。

## 日志复制

写请求必须先进入 Leader 的日志。Leader 再通过 AppendEntries RPC 把日志发给 Follower。

只有多数节点确认后，Leader 才能把这条日志提交，然后通知状态机执行。

~~~cpp
if (receiveMajorityAck(logIndex)) {
    commit(logIndex);
    stateMachine.apply(logIndex);
}
~~~

这里的“多数”非常关键。比如 3 个节点里 2 个确认就够了。这样即使一个节点挂掉，系统仍然能继续。

## 持久化为什么重要

Raft 里有些状态必须落盘，比如当前任期、投过票给谁、日志内容。如果这些只放内存里，节点一重启就忘了自己之前做过什么，可能破坏一致性。

所以项目里有 Persister 模块，用来保存和恢复关键状态。

可以这样理解：

~~~text
内存状态：跑得快，但重启会丢
持久化状态：写得慢一点，但重启能恢复
~~~

分布式系统宁愿慢一点，也不能在故障后乱掉。

## KV 状态机

Raft 只保证日志一致，不直接保存业务数据。真正保存 key-value 的是状态机。

当一条日志被提交后，KVServer 才把它应用到状态机里：

~~~text
日志提交 -> apply 到 KV -> get/put/append 生效
~~~

底层 KV 可以用 map、跳表、LSM 等结构。这个项目使用跳表，适合展示有序 KV 的基本思想。

## RPC 通信

Raft 节点之间要互相发送 RequestVote 和 AppendEntries，客户端也要向 KVServer 发请求，所以 RPC 是基础设施。

项目用 Protobuf 定义消息格式，再通过自定义 RPC 框架传输。这样比手写字符串协议更稳定，也更容易维护字段。

## 协程和线程池

项目里还有 fiber、scheduler、iomanager、timer 等模块。这说明它不只是简单多线程，而是尝试用协程调度和 IO 管理提升并发能力。

对 Raft 来说，定时器很重要：选举超时、心跳间隔、RPC 超时都依赖时间控制。定时器乱了，节点就可能频繁选举或迟迟不能发现故障。

## 难点和踩坑

第一个难点是边界情况。Raft 看起来只有选举和日志复制，但真正难的是异常：Leader 挂了怎么办，网络抖动怎么办，旧 Leader 恢复后怎么办，日志冲突怎么修正。

第二个难点是持久化时机。该落盘的状态必须在回复 RPC 之前落盘，否则节点重启后可能忘记自己已经承诺过的事情。

第三个难点是提交条件。不是 Leader 写入本地就算成功，必须多数复制后才能提交。

第四个难点是客户端重复请求。如果客户端超时重试，系统要避免同一个命令被执行两次。这通常需要 clientId 和 requestId 做幂等控制。

## 如果继续优化

后续可以继续补这些方向：

- 快照压缩，避免日志无限增长。
- ReadIndex 或 Lease Read，优化读请求一致性和性能。
- 批量日志复制，减少 RPC 次数。
- 更完整的故障测试，比如断网、重启、少数节点宕机。
- 加压测指标，观察吞吐、延迟和提交耗时。
- 增加成员变更，支持节点动态加入和退出。

## 项目总结

这个项目最重要的收获是建立分布式一致性的基本感觉。单机程序追求“我写成功了”，Raft 系统追求“多数节点按同样顺序确认了”。只要理解这句话，选主、日志复制、持久化和状态机就能串起来。
