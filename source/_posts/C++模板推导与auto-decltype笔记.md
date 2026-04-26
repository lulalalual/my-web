---
title: C++ 模板推导与 auto/decltype 笔记
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
description: 模板参数推导、auto 和 decltype 是一条线上的能力，核心是“编译器按什么规则保留或丢掉类型信息”。
---

`auto`、`decltype` 和模板推导看起来像三套语法，实际上都在回答同一个问题：**编译器会把表达式推成什么类型。**

## 先记结论

- `auto` 默认会忽略顶层 `const` 和引用。
- `auto&`、`auto&&` 能保留引用语义。
- `decltype(expr)` 更接近“按表达式原样推断”。
- 模板推导和 `auto` 大体相似，但要结合参数形式一起看。

## 例子

```cpp
#include <iostream>
#include <type_traits>

int main() {
    int x = 0;
    const int& rx = x;

    auto a = rx;        // int
    auto& b = rx;       // const int&
    decltype(rx) c = x; // const int&

    std::cout << std::boolalpha
              << std::is_same_v<decltype(a), int> << '\n'
              << std::is_same_v<decltype(b), const int&> << '\n'
              << std::is_same_v<decltype(c), const int&> << '\n';
}
```

## 一眼判断的方法

- 想“拿值副本”，用 `auto`。
- 想“保留引用”，看 `auto&` 或 `auto&&`。
- 想“严格跟表达式类型一致”，优先看 `decltype`。

## 模板里最容易错的地方

- 以为 `T` 会保留引用，实际上很多情况下会退化掉。
- `const T&` 参数推导时，`T` 本身通常不带引用。
- `decltype((x))` 和 `decltype(x)` 不一样，双括号可能让结果变成引用。

## 工程建议

- 局部变量不需要保留引用语义时，用 `auto` 简化代码。
- 涉及返回值推导、泛型库封装时，要明确选择 `auto`、`auto&`、`decltype(auto)`。
- 如果你说不清楚推导结果，就写 `static_assert(std::is_same_v<...>)` 验证。

