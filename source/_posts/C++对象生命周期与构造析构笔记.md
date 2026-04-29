---
title: 对象生死
permalink: posts/cpp-object-lifecycle-notes/
date: 2026-04-26 12:40:00
updated: 2026-04-26 12:40:00
categories:
  - C++语法笔记
tags:
  - C++
  - 生命周期
  - 构造析构
  - 对象模型
cover: /img/covers/notes/cpp-lifetime.webp
description: 用通俗方式讲清 C++ 对象什么时候创建、什么时候销毁，以及顺序为什么重要。
---

C++ 对象也有“出生”和“离开”。构造函数负责出生，析构函数负责收尾。很多 bug 都是因为对象还没准备好，或者已经被销毁了。

## 先记顺序

最重要的顺序只有三条：

- 成员按声明顺序构造。
- 基类先于派生类构造。
- 析构顺序和构造顺序相反。

## 小代码

```cpp
struct A {
    A() { std::cout << "A born\n"; }
    ~A() { std::cout << "A gone\n"; }
};

int main() {
    A a;
}
```

程序进入 `main` 后，`a` 被构造；离开 `main` 时，`a` 自动析构。

## 常见误会

初始化列表的书写顺序不决定成员初始化顺序。真正起作用的是成员声明顺序。

```cpp
struct Demo {
    int first;
    int second;
    Demo() : second(2), first(1) {}
};
```

虽然 `second` 写在前面，但 `first` 还是先初始化。

## 怎么用

写类时先想清楚：这个对象拥有什么资源？资源跟对象绑定，构造时拿到，析构时释放，代码就会少很多“忘记清理”的问题。

