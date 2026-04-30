---
title: C++高级
permalink: posts/cpp-advanced/
date: 2026-04-29 20:45:00
updated: 2026-04-30 10:30:00
categories:
  - C++语法笔记
tags:
  - C++
  - 高级
  - 移动语义
  - 智能指针
  - Lambda
cover: /img/covers/ai/cover-cpp-advanced.webp
description: 用人话讲现代 C++：智能指针管资源，移动语义提性能，lambda 和模板让接口更灵活。
---

C++ 高级内容容易让人觉得很散：智能指针、移动语义、模板、虚函数、异常、类型萃取，每个名词都像单独的一座山。其实它们背后有一条主线：让资源管理更安全，让抽象更灵活，让性能损耗更可控。

## RAII 是高级 C++ 的地基

RAII 的意思是“资源获取即初始化”。听起来抽象，实际很简单：把资源交给对象管理，对象创建时拿到资源，对象销毁时释放资源。这样就不需要在每条路径上手动写释放逻辑。

~~~cpp
class LockGuard {
public:
    explicit LockGuard(std::mutex& m) : mutex_(m) {
        mutex_.lock();
    }

    ~LockGuard() {
        mutex_.unlock();
    }

private:
    std::mutex& mutex_;
};
~~~

如果函数中途 return 或抛异常，局部对象仍然会析构，所以锁会自动释放。这就是 RAII 比手动管理可靠的原因。智能指针、文件流、锁对象，本质上都在用这个思想。

## 智能指针解决所有权问题

裸指针只表示“这里有一个地址”，它不告诉你谁负责释放。智能指针把所有权写进类型里。

<code>unique_ptr</code> 表示独占所有权。一个资源只能由一个 <code>unique_ptr</code> 管理，不能随便复制，只能移动。

~~~cpp
std::unique_ptr<int> p = std::make_unique<int>(42);
std::unique_ptr<int> q = std::move(p);
~~~

移动之后，资源归 <code>q</code>，<code>p</code> 不再拥有它。这个设计可以防止两个对象同时释放同一块内存。

<code>shared_ptr</code> 表示共享所有权。它会记录有多少个对象正在共享这份资源，最后一个离开时释放资源。

~~~cpp
auto p1 = std::make_shared<std::string>("hello");
auto p2 = p1;
~~~

<code>shared_ptr</code> 很方便，但不要滥用。共享所有权越多，生命周期越难看清。两个对象互相持有 <code>shared_ptr</code> 还可能形成循环引用，需要用 <code>weak_ptr</code> 打断。

## 移动语义是在减少没必要的拷贝

拷贝像复制一份文件，移动像把文件夹的所有权转交给别人。对于包含大量数据的对象，移动通常比拷贝便宜得多。

~~~cpp
std::vector<int> makeData() {
    std::vector<int> data(1000000, 1);
    return data;
}
~~~

返回大 vector 时，现代 C++ 会尽量使用返回值优化或移动语义，避免真的复制一百万个元素。你可以把移动语义理解成一种承诺：这个对象马上就不用了，它的资源可以直接交给新对象。

自定义类如果管理资源，就要认真考虑拷贝构造、拷贝赋值、移动构造、移动赋值和析构函数。工程里常说的“五法则”就是在提醒你：只要类开始手动管理资源，就不要让编译器随便生成默认行为。

## 模板是在编译期写通用代码

模板让你写一份代码，适配多种类型。它不是简单的文本替换，而是在编译期根据实际类型生成对应代码。

~~~cpp
template <typename T>
T maxValue(const T& a, const T& b) {
    return a > b ? a : b;
}
~~~

调用 <code>maxValue(1, 2)</code> 时，编译器会生成 int 版本；调用 <code>maxValue(std::string("a"), std::string("b"))</code> 时，会生成 string 版本。模板的优势是零运行时开销，缺点是错误信息可能很长，编译时间也会增加。

模板适合写容器、算法、通用工具。业务逻辑不要为了“高级”而强行模板化，否则代码会变难读。

## 虚函数让运行时决定行为

模板偏向编译期多态，虚函数偏向运行时多态。虚函数的核心是：通过基类指针或引用调用函数时，实际执行哪个版本由对象真实类型决定。

~~~cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    double area() const override { return 3.14 * r_ * r_; }
private:
    double r_ = 1.0;
};
~~~

如果一个类要被继承，并且可能通过基类指针删除对象，析构函数一定要写成 virtual。否则删除派生类对象时，派生类部分可能不会正确析构。

## 异常处理要保证资源安全

异常不是洪水猛兽。它适合表达“当前函数处理不了，需要交给上层”的错误。但使用异常时，资源管理必须可靠。RAII 正是异常安全的基础。

~~~cpp
void save() {
    std::ofstream file("data.txt");
    if (!file) {
        throw std::runtime_error("open failed");
    }
    file << "hello";
}
~~~

即使写文件时抛出异常，<code>file</code> 的析构函数也会关闭文件。不要在析构函数里随意抛异常，因为析构通常发生在清理阶段，再抛异常会让程序更难控制。

## 高级特性要服务工程目标

学高级 C++ 不是为了把代码写得玄，而是为了让代码更安全、更清晰、更高效。智能指针解决所有权，移动语义减少拷贝，模板提高复用，虚函数隔离变化，RAII 兜住资源安全。

判断一个高级特性该不该用，可以问三句话：它有没有让所有权更清楚？有没有减少重复代码或性能浪费？有没有让读代码的人更容易理解设计意图？如果答案是否定的，就不要为了炫技而使用。
