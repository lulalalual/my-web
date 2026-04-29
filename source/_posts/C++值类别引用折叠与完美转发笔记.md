---
title: 值与引用
permalink: posts/cpp-forwarding-notes/
date: 2026-04-26 12:20:00
updated: 2026-04-26 12:20:00
categories:
  - C++语法笔记
tags:
  - C++
  - 值类别
  - 引用折叠
  - 完美转发
cover: /img/covers/notes/cpp-forwarding.webp
description: 用一个转发例子讲清左值、右值、引用折叠和 std::forward。
---

左值和右值不用先背定义。先记一句话：左值像有名字的东西，右值像临时拿来用的东西。

## 先看例子

```cpp
int a = 10; // a 是左值
foo(20);    // 20 是右值
```

`a` 可以反复使用，所以是左值。`20` 只是临时出现一下，所以更像右值。

## 小代码

```cpp
void print(int& x)  { std::cout << "left\n"; }
void print(int&& x) { std::cout << "right\n"; }

int a = 1;
print(a);
print(2);
```

这段代码会分别走两个重载：一个接“有名字的值”，一个接“临时值”。

## forward 是什么

`std::forward` 的目标是：别人传进来是什么样，我就尽量原样传出去。包装函数、工厂函数、回调转发里经常会用到它。

## 少踩坑

- `std::move` 不是真的移动，它只是把表达式变成右值。
- 移动后的对象还能析构，但不要再依赖它原来的内容。
- 普通业务代码里不要到处写 `forward`，真正封装泛型时再用。

