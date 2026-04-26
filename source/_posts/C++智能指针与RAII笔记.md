---
title: C++ 智能指针与 RAII 笔记
date: 2026-04-26 13:20:00
updated: 2026-04-26 13:20:00
categories:
  - C++语法笔记
tags:
  - C++
  - 智能指针
  - RAII
  - 资源管理
cover: /img/covers/notes/cpp-raii.webp
description: 智能指针不是为了替代所有指针，而是为了把所有权、释放时机和异常安全写进类型系统。
---

`RAII` 的核心不是“用了智能指针”，而是**资源在对象构造时获得，在析构时自动释放**。资源可以是内存、锁、文件句柄、socket，不只是 `new` 出来的对象。

## 三种常见智能指针

- `std::unique_ptr`：独占所有权，最轻量，默认优先选它。
- `std::shared_ptr`：共享所有权，用引用计数管理生命周期。
- `std::weak_ptr`：不拥有对象，只是观察者，常用于打破循环引用。

## 最小示例

```cpp
#include <iostream>
#include <memory>

struct FileGuard {
    FileGuard() { std::cout << "open\n"; }
    ~FileGuard() { std::cout << "close\n"; }
};

int main() {
    auto guard = std::make_unique<FileGuard>();
}
```

离开作用域时，无论是正常返回还是异常展开，`guard` 都会自动析构，资源随之释放。

## 什么时候别用 shared_ptr

- 所有权本来就只有一个。
- 生命周期边界很清楚。
- 只是临时借用对象，不需要共享拥有权。

## 常见坑

- 把同一个裸指针交给两个 `shared_ptr` 管理，结果二次释放。
- 到处滥用 `shared_ptr`，最后说不清对象到底谁负责销毁。
- `shared_ptr` 循环引用导致对象永远不析构。

## 工程建议

- 默认优先 `unique_ptr`，只有确实存在共享所有权时才升级到 `shared_ptr`。
- 函数参数如果只是借用，优先传引用或裸指针，不要平白制造所有权语义。
- 自定义资源类型时，先想能不能直接做成 RAII 对象，而不是先裸拿资源再补释放逻辑。

