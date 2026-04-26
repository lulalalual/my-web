---
title: C++ 语法笔记索引
permalink: posts/cpp-syntax-notes-index/
date: 2026-04-26 12:10:00
updated: 2026-04-26 12:10:00
categories:
  - C++语法笔记
tags:
  - C++
  - 语法
  - 对象模型
cover: /img/covers/notes/cpp-index.webp
description: 这个专栏只维护 C++ 语言本身的知识点：值类别、引用折叠、构造析构、模板推导、智能指针、RAII 和对象生命周期。
---

这个专栏只讲 `C++` 语言和标准库本身，不放算法题解。目标是把“会背概念”改成“能解释行为、能写最小示例、能说清边界”。

## 专栏范围

- 值类别、左值右值、移动语义和引用折叠。
- 构造、析构、拷贝控制、资源管理和对象生命周期。
- `auto`、`decltype`、模板参数推导和完美转发。
- 智能指针、RAII、异常安全和所有权表达。
- `const`、`constexpr`、初始化方式和类型推断。

## 当前已整理的笔记

- [C++ 值类别、引用折叠与完美转发笔记](/posts/cpp-forwarding-notes/)
- [C++ 对象生命周期与构造析构笔记](/posts/cpp-object-lifecycle-notes/)
- [C++ 模板推导与 auto/decltype 笔记](/posts/cpp-template-auto-decltype-notes/)
- [C++ 智能指针与 RAII 笔记](/posts/cpp-smart-pointer-raii-notes/)
- [C++ 笔记如何长期维护](/posts/cpp-notes-maintenance/)

## 写法规则

- 先讲问题：这个语法点到底解决什么问题。
- 再讲行为：编译器会怎么推导、构造、绑定或销毁。
- 必须有代码：每篇都给一个最小示例。
- 最后讲边界：什么时候会踩坑，工程里怎么规避。

