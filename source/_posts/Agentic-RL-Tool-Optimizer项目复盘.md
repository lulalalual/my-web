---
title: Agentic RL
permalink: posts/agentic-rl-tool-optimizer-review/
date: 2026-05-19 18:10:00
updated: 2026-05-19 18:10:00
categories:
  - 项目合集
tags:
  - AI
  - Agent
  - RLHF
  - GRPO
  - 后训练
cover: /img/covers/ai/cover-agentic-rl.png
description: 复盘 Agentic RL Tool Optimizer：Agent trajectory 评测、偏好数据构造、SFT/DPO/GRPO JSONL 导出、策略投机检测和轻量训练。
---

Agentic RL Tool Optimizer 是一个面向 Agent 后训练的数据和 reward 实验台。它关注的不是“直接训练一个大模型”，而是训练前更关键的事情：如何记录 Agent 执行轨迹、如何评价轨迹质量、如何构造 SFT/DPO/GRPO 数据。

![Agentic RL Tool Optimizer](/img/covers/ai/cover-agentic-rl.png)

## 项目要解决的问题

Agent 的失败不一定体现在最终答案上。它可能最终答对了，但过程里工具乱调、参数错误、步骤过多、成本过高；也可能计划看起来合理，但执行完全偏离。

所以我把一次 Agent 执行抽象成 `Trajectory`：

- `plan`：Agent 的任务计划；
- `tool_calls`：工具名、参数和输出；
- `final_answer`：最终答案；
- `policy_features`：用于策略更新的行为特征。

这个结构能把“最终结果”和“执行过程”同时记录下来，后续才能做 reward、偏好数据和错误归因。

## 核心架构

系统从 `TaskSpec` 出发，对同一个任务采样多条 trajectory。评测器给每条轨迹计算 reward，然后生成 preference pairs，并导出三类后训练数据：

<div class="lula-ai-metric-grid">
  <div><strong>SFT JSONL</strong><span>学习高分轨迹的格式和工具调用模式</span></div>
  <div><strong>DPO JSONL</strong><span>用 chosen/rejected 做偏好对齐</span></div>
  <div><strong>GRPO JSONL</strong><span>保留同题多候选，用组内相对 reward 优化</span></div>
</div>

## Reward 怎么设计

我没有只看最终答案，而是拆成五个指标：

- task completion：任务是否完成；
- tool correctness：工具是否选对；
- argument correctness：参数是否正确；
- step efficiency：步骤是否冗余；
- plan adherence：执行是否遵循计划。

这样可以定位具体 failure mode。比如工具选错就是 tool selection error，参数错就是 argument error，步骤过多就是 step efficiency error。

## GRPO 风格更新

项目里实现了一个轻量的 group-relative reward baseline。对同一任务下多条轨迹计算平均 reward，单条轨迹的 reward 减去组内平均值就是 advantage。然后根据 `policy_features` 更新工具选择权重。

当前 demo 的真实结果：

<div class="lula-ai-kpi-row">
  <div><span>Good Reward</span><strong>1.0</strong></div>
  <div><span>Bad Reward</span><strong>0.33</strong></div>
  <div><span>Gaming Reward</span><strong>0.8133</strong></div>
  <div><span>Preference Pairs</span><strong>2</strong></div>
</div>

训练后 `use_search` 和 `use_calculator` 权重上升，`ask_clarify` 权重下降。这说明 reward 能推动策略向正确工具调用方向移动。

## 策略投机检测

Agent 后训练很容易出现 reward hacking。比如模型为了拿高分，可能反复调用工具、过度 ask_clarify，或者绕开必要工具直接给模板答案。

这个项目会检测：

- redundant tool calls：重复调用同一个工具和参数；
- clarification abuse：信息足够时仍反复澄清；
- step budget overrun：超过最大步骤数；
- tool avoidance：逃避必要工具。

当前 demo 识别了 5 个 policy gaming findings。`traj_gaming` 虽然最终答案看起来对，但因为重复工具调用、滥用澄清、超出步骤预算，所以不能简单当成优质训练样本。

## 我怎么介绍这个项目

面试时我会这样讲：这个项目体现的是 Agentic RL 的数据和评测能力。真正做后训练前，必须先有高质量 trajectory、可解释 reward、偏好数据和策略投机检测。我的项目把这些环节做成可运行闭环，并输出 SFT/DPO/GRPO 三类 JSONL。

如果继续优化，我会加入真实 Agent 采样、多任务 benchmark、人工审核界面和 reward model 训练。
