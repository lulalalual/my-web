---
title: C++ 值类别、引用折叠与完美转发笔记
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
description: 理解左值、右值、亡值、引用折叠和 std::forward，是看懂移动语义和泛型代码的基础。
---

很多人背过“左值能取地址，右值不能”，但一到模板推导和 `std::move/std::forward` 就开始混乱。问题不在记忆量，而在没有把值类别和引用折叠放到一个体系里看。

## 一条主线

- 值类别决定表达式在语义上是“可复用对象”还是“临时结果”。
- 引用折叠决定模板实例化后引用类型最终长什么样。
- 完美转发的目标是“把调用者传进来的值类别尽量原样传出去”。

## 最小例子

```cpp
#include <iostream>
#include <utility>

void sink(int& x) { std::cout << "lvalue: " << x << '\n'; }
void sink(int&& x) { std::cout << "rvalue: " << x << '\n'; }

template <class T>
void relay(T&& value) {
    sink(std::forward<T>(value));
}

int main() {
    int a = 42;
    relay(a);   // 传入左值
    relay(99);  // 传入右值
}
```

这里 `T&&` 不是单纯的右值引用，而是**转发引用**。当传入左值时，`T` 会被推成 `int&`；当传入右值时，`T` 才是 `int`。

## 引用折叠规则

- `T& &` 折叠成 `T&`
- `T& &&` 折叠成 `T&`
- `T&& &` 折叠成 `T&`
- `T&& &&` 折叠成 `T&&`

你可以把它记成一句话：**只要出现左值引用，最后通常就是左值引用。**

## 常见误区

- `T&&` 并不总是右值引用，在模板推导里要先判断它是不是转发引用。
- `std::move` 不会移动对象，它只做强制类型转换，把表达式变成右值。
- `std::forward<T>` 不能乱用，它依赖模板参数 `T` 才有意义。

## 工程里怎么用

- 写包装层、回调层、工厂函数时，需要保留实参值类别。
- 写普通业务逻辑时，不要为了“高级”到处上 `std::forward`。
- 如果一个对象之后还要继续用，不要轻易 `std::move`。

