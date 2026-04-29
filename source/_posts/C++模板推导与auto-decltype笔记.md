---
title: 模板推导
permalink: posts/cpp-template-auto-decltype-notes/
date: 2026-04-26 13:00:00
updated: 2026-04-26 13:00:00
categories:
  - C++语法笔记
tags:
  - C++
  - 模板
  - auto
  - decltype
cover: /img/covers/notes/cpp-template.webp
description: 把 auto、decltype 和模板推导讲成一句话：编译器到底帮你推成什么类型。
---

模板推导看起来复杂，其实核心问题很简单：你写少了，编译器会帮你补出什么类型？

## 怎么理解

`auto` 像是“帮我猜一个合适的类型”。`decltype` 更像是“照着这个表达式原样看类型”。模板参数推导也是同一类事情，只是发生在函数模板里。

## 小代码

```cpp
int x = 10;
const int& r = x;

auto a = r;         // a 是 int
const auto& b = r;  // b 是 const int&
```

`auto a = r` 会拿到一个值副本，所以引用信息被去掉了。想保留引用，就要写成 `auto&` 或 `const auto&`。

## 什么时候用

- 局部变量类型很长时，用 `auto` 简化。
- 想保留引用时，写清楚 `auto&`。
- 写泛型工具时，再认真考虑 `decltype`。

## 常见坑

不要以为 `auto` 会完整保留所有类型信息。它会做一些简化，这对普通代码很方便，但在封装模板时要特别小心。

