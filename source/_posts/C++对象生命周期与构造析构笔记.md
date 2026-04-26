---
title: C++ 对象生命周期与构造析构笔记
date: 2026-04-26 12:40:00
updated: 2026-04-26 12:40:00
categories:
  - C++语法笔记
tags:
  - C++
  - 生命周期
  - 构造析构
  - 对象模型
cover: /img/covers/notes/cpp-lifetime.svg
description: 读懂对象什么时候构造、什么时候析构、成员按什么顺序初始化，是 C++ 基础里最容易被忽略但最容易出 bug 的部分。
---

`C++` 很多诡异 bug，本质上都能追溯到生命周期：对象是不是已经构造完，资源是不是已经释放，析构阶段还能不能访问某个成员。

## 三个必须记住的顺序

- 成员初始化顺序看**声明顺序**，不看初始化列表书写顺序。
- 派生类构造前，先构造基类。
- 析构顺序和构造顺序相反。

## 示例

```cpp
#include <iostream>
#include <string>

struct Logger {
    Logger(const std::string& name) : name(name) {
        std::cout << "construct " << name << '\n';
    }
    ~Logger() {
        std::cout << "destruct " << name << '\n';
    }
    std::string name;
};

struct Demo {
    Logger first;
    Logger second;

    Demo() : second("second"), first("first") {}
};

int main() {
    Demo demo;
}
```

尽管初始化列表里写的是 `second` 在前，实际仍然是 `first` 先构造，因为成员声明顺序决定了一切。

## 为什么这很重要

- 如果成员之间有依赖，初始化顺序写错就可能读到未构造对象。
- 析构阶段访问已经释放的资源，会出现未定义行为。
- 异常抛出时，已经构造成功的成员会按逆序自动析构。

## 常见坑

- 在构造函数体里做“补初始化”，不如放到初始化列表里。
- 在基类析构函数里调用虚函数，往往不是你以为的多态行为。
- 把裸指针成员忘记释放，或者重复释放。

## 工程建议

- 有资源就封装成成员对象，而不是手写 `new/delete`。
- 让资源跟随对象生命周期自动管理。
- 一旦一个类型拥有资源，就认真考虑拷贝构造、移动构造和析构语义。
