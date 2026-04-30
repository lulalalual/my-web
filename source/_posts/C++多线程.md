---
title: 多线程
permalink: posts/cpp-threading/
date: 2026-04-29 20:45:00
updated: 2026-04-30 10:30:00
categories:
  - C++语法笔记
tags:
  - C++
  - 多线程
  - 互斥锁
  - 原子操作
  - 条件变量
cover: /img/covers/ai/cover-cpp-thread.webp
description: 用人话讲 C++ 多线程：线程像多人协作，锁管秩序，条件变量负责通知，atomic 处理小共享状态。
---

多线程不是为了让程序看起来高级，而是为了让多个任务能同时推进。比如一个服务器一边收网络请求，一边处理业务；一个游戏一边渲染画面，一边加载资源；一个工具一边计算，一边保持界面响应。学习多线程时，最重要的是理解“共享数据”带来的风险。

## 线程是进程里的执行路线

进程可以理解成一个正在运行的程序，线程是进程里的执行路线。一个进程可以有多个线程，它们共享同一片进程内存，但各自有自己的调用栈。

~~~cpp
#include <thread>
#include <iostream>

void worker() {
    std::cout << "work" << std::endl;
}

int main() {
    std::thread t(worker);
    t.join();
}
~~~

<code>join</code> 的意思是主线程等待子线程执行完。如果线程对象销毁前既没有 <code>join</code>，也没有 <code>detach</code>，程序会直接终止。这是 C++ 在提醒你：线程的生命周期必须明确。

## 竞态条件来自同时修改同一份数据

多个线程同时读同一份数据通常没问题，但只要有人写，就要小心。下面的代码看起来只是加一，但多个线程同时执行时，结果可能不对。

~~~cpp
int counter = 0;

void add() {
    for (int i = 0; i < 10000; ++i) {
        counter++;
    }
}
~~~

<code>counter++</code> 不是一个不可分割的动作。它大致会经历读取、加一、写回。如果两个线程同时读到旧值，再分别写回，就会丢失更新。这就是竞态条件。

## 互斥锁保护临界区

互斥锁的作用是让同一时间只有一个线程进入某段关键代码。被保护的这段代码叫临界区。

~~~cpp
std::mutex m;
int counter = 0;

void add() {
    for (int i = 0; i < 10000; ++i) {
        std::lock_guard<std::mutex> guard(m);
        counter++;
    }
}
~~~

<code>lock_guard</code> 用 RAII 管理锁，构造时加锁，析构时解锁。这样即使函数提前返回，也不会忘记解锁。

锁的范围要尽量小。锁太大，线程都在排队，性能会下降；锁太小，又保护不住共享数据。设计多线程代码时，先把共享数据找出来，再决定锁保护哪一段。

## 条件变量用来等待事件

有时候线程不是要抢资源，而是要等某个条件成立。比如消费者要等队列里有任务，生产者放入任务后再通知消费者。

~~~cpp
std::mutex m;
std::condition_variable cv;
std::queue<int> tasks;

void consumer() {
    std::unique_lock<std::mutex> lock(m);
    cv.wait(lock, [] { return !tasks.empty(); });
    int task = tasks.front();
    tasks.pop();
}

void producer() {
    {
        std::lock_guard<std::mutex> guard(m);
        tasks.push(1);
    }
    cv.notify_one();
}
~~~

<code>wait</code> 会先释放锁，让其他线程有机会放任务；被唤醒后再重新拿锁并检查条件。这里一定要用条件判断，因为线程可能会被虚假唤醒。

## atomic 适合简单共享状态

如果只是做简单计数或标志位，可以用 <code>atomic</code>，它提供原子操作，不需要显式加锁。

~~~cpp
std::atomic<int> counter{0};

void add() {
    counter.fetch_add(1);
}
~~~

<code>atomic</code> 很适合计数器、停止标志、状态位。它不适合保护复杂结构，比如队列、map 或多个变量之间的关系。这类场景仍然需要锁。

## 死锁是锁顺序出了问题

死锁通常发生在两个线程互相等待对方释放锁。最典型的情况是线程 A 先拿锁 1 再拿锁 2，线程 B 先拿锁 2 再拿锁 1。

解决死锁的基本原则是：所有线程按照固定顺序拿锁，或者使用 <code>std::scoped_lock</code> 一次性锁住多个互斥量。

~~~cpp
std::mutex a;
std::mutex b;

void safe() {
    std::scoped_lock lock(a, b);
    // 同时保护两个资源
}
~~~

不要在持锁时做耗时操作，比如网络请求、磁盘读写、复杂计算。持锁时间越长，其他线程越容易被堵住。

## 线程池让任务复用线程

如果每来一个任务就创建一个线程，开销会很大。线程池的思路是提前准备一组工作线程，任务来了就放入队列，工作线程循环取任务执行。

线程池不是魔法，它解决的是线程创建和销毁成本，也能限制并发数量。写线程池时要关注三个点：任务队列要线程安全，工作线程要能被唤醒，程序退出时要能平滑停止。

## 多线程代码的检查清单

写多线程时，不要只看代码能不能跑。要逐项检查：共享数据在哪里，谁会读，谁会写，读写是否被保护，锁顺序是否一致，线程退出路径是否明确，异常时锁和资源是否能释放。

真正稳定的多线程代码，通常不是靠“我感觉不会冲突”，而是靠清楚的所有权、明确的同步规则和尽量少的共享状态。
