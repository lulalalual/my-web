---
title: RAG评测飞轮
permalink: posts/evalops-rag-flywheel-review/
date: 2026-05-19 18:00:00
updated: 2026-05-19 18:00:00
categories:
  - 项目合集
tags:
  - AI
  - RAG
  - Agent
  - LLM评测
  - 数据飞轮
cover: /img/covers/ai/cover-evalops-rag.png
description: 复盘 EvalOps RAG Flywheel：多 Agent 编排、RAG 评测、OpenAI-compatible/vLLM 适配、LLM-as-judge、实验矩阵和数据飞轮。
---

EvalOps RAG Flywheel 是一个面向企业知识库问答的 RAG + 多 Agent + 评测飞轮项目。它的目标不是做一个“能回答问题”的 demo，而是把 RAG 能力做成可上线、可迭代、可控成本的产品能力。

![EvalOps RAG Flywheel](/img/covers/ai/cover-evalops-rag.png)

## 项目要解决的问题

RAG 项目真正难的地方，通常不是把文档塞进 prompt，而是持续回答这些问题：

- 检索有没有召回正确上下文；
- 生成有没有忠于上下文；
- 答案有没有引用关键来源；
- chunk size、top-k、rerank、模型切换后效果是否退化；
- 每次请求的成本和延迟是否可控；
- 失败样本能不能回流成下一轮评测和训练数据。

所以我把项目设计成一条闭环：文档进入系统后先切块，再检索、生成、评测、复核，最后输出数据飞轮报告。

## 核心架构

系统分成两层。第一层是 RAG 链路：文档加载、chunking、TF-IDF/VectorStore 检索、可选 rerank、Extractive/OpenAI-compatible/vLLM 生成。第二层是 Agent 编排和评测：Planner、Memory、Retriever、Answer、Eval 多 Agent 分工，所有工具通过 MCP-like Tool Registry 管理。

Tool Registry 记录每个工具的 name、description、input schema、permission 和调用轨迹。这样做的价值是：工具调用不再是散落在代码里的函数，而是可以审计、限权、替换和评测的系统资源。

## 评测怎么做

我实现了一个 RAG Rubric Evaluator，主要看五个指标：

<div class="lula-ai-metric-grid">
  <div><strong>Answer Relevance</strong><span>答案是否回答了问题</span></div>
  <div><strong>Faithfulness</strong><span>答案是否被上下文支持</span></div>
  <div><strong>Context Recall</strong><span>检索是否拿到关键证据</span></div>
  <div><strong>Citation Coverage</strong><span>引用是否覆盖必要来源</span></div>
  <div><strong>Cost Score</strong><span>成本是否低于预算</span></div>
</div>

这些指标拆开之后，RAG 的问题定位会清楚很多。比如 context recall 低，优先看检索和 chunk；faithfulness 低，优先看生成和 prompt；citation coverage 低，优先看引用约束。

## 实验矩阵

项目新增了 `run-experiments`，用于比较不同策略：

- chunk size：45 / 90；
- top-k：2 / 4；
- retriever：TF-IDF / VectorStore；
- rerank：开启 / 关闭。

当前 demo 的真实输出：

<div class="lula-ai-kpi-row">
  <div><span>Pass Rate</span><strong>1.0</strong></div>
  <div><span>Best Config</span><strong>tfidf_chunk45_top2</strong></div>
  <div><span>Avg Score</span><strong>0.8876</strong></div>
  <div><span>Avg Cost</span><strong>$0.000016</strong></div>
</div>

这说明项目不是只展示最终答案，而是能用质量、成本、延迟和人工复核指标支持发布决策。

## 生产化增强点

- 支持 OpenAI-compatible/vLLM 接口，没有 API key 时走本地 fallback。
- 支持 VectorStore 检索适配，后续可以替换成 FAISS、Chroma、Qdrant 或 pgvector。
- 支持 Heuristic LLM-as-judge 和人工复核队列。
- 支持 FastAPI 服务：`/health`、`/ask`、`/evaluate`。
- 支持 HTML dashboard 展示实验结果。
- 配套 Dockerfile、Makefile 和 GitHub Actions CI。

## 我怎么介绍这个项目

面试时我会这样讲：这个项目体现的是大模型应用工程化能力。RAG 不是调用一次模型，而是要有离线评测、线上实验、人工复核、失败样本回流和成本控制。我把一次问答拆成多 Agent 任务链，并把工具调用显式记录下来，所以后续可以接 MCP、Skills 或企业内部工具。

如果继续优化，我会重点做三件事：接入真实向量库、补充更多 hard negative 评测集、把 dashboard 扩展成实验追踪系统。
