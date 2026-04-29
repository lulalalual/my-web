---
title: 多线程
permalink: posts/cpp-threading/
date: 2026-04-29 20:45:00
updated: 2026-04-29 20:45:00
categories:
  - C++语法笔记
tags:
  - C++
  - 多线程
  - 互斥锁
  - 原子操作
  - 条件变量
cover: /img/covers/notes/cover-cpp-thread.png
description: 整理 std::thread、mutex、lock_guard、atomic、条件变量、信号量、死锁和读写锁。
---

## 通俗导读

多线程就是让多个执行流同时做事。它能提高吞吐，也会带来共享数据混乱的问题。所以学习多线程，重点不是会创建线程，而是会保护共享资源。

```text
多个线程同时跑 -> 共享数据可能被改乱 -> 用锁、原子和条件变量协调
```

## 先看例子

```cpp
std::mutex mtx;
int count = 0;

void add() {
    std::lock_guard<std::mutex> lock(mtx);
    ++count;
}
```

`lock_guard` 的作用是进入作用域时加锁，离开作用域时自动解锁。这样即使中途抛异常，也不容易忘记释放锁。

## 阅读建议

先理解 `thread` 和 `join`，再看互斥锁。等知道竞态条件是什么，再读 `atomic`、条件变量、信号量和死锁，逻辑会更清楚。

## 完整笔记

下面保留原文档的完整内容，并在前面补了通俗导读。原有知识点、表格和代码例子都不删减。

# 线程thread

#### **一、`std::thread`：创建与启动线程**

`std::thread` 是 C++11 引入的线程管理类，用于创建并启动一个新线程。线程启动后，会执行指定的**可调用对象**（函数、lambda、成员函数等）。

##### **1. 核心构造函数**

`std::thread` 的构造函数接受一个可调用对象及其参数，语法：

```cpp
template <class F, class... Args>  
explicit thread(F&& f, Args&&... args);  
```

- **`F`**：可调用对象（函数、lambda、函数对象、成员函数指针等）。
    
- **`Args...`**：传递给可调用对象的参数（支持任意数量和类型）。
    

##### **2. 创建线程的常用方式**

###### **（1）普通函数作为线程函数**

```cpp
#include <thread>  
#include <iostream>  

void thread_func(int x, const std::string& str) {  
    std::cout << "线程函数：x=" << x << ", str=" << str << std::endl;  
}  

int main() {  
    // 创建线程，传递函数和参数（值传递）  
    std::thread t(thread_func, 42, "hello");  
    t.join(); // 主线程等待子线程结束  
    return 0;  
}  
```

###### **（2）Lambda 表达式作为线程函数**

最常用的方式，简洁灵活：

```cpp
int main() {  
    int x = 10;  
    std::thread t([x](const std::string& str) {  
        std::cout << "Lambda 线程：x=" << x << ", str=" << str << std::endl;  
    }, "world"); // 捕获 x（值捕获），传递 str 参数  
    t.join();  
    return 0;  
}  
```

###### **（3）成员函数作为线程函数**

需传递**对象指针**和成员函数参数：

```cpp
class Worker {  
public:  
    void work(int task_id) {  
        std::cout << "Worker 处理任务：" << task_id << std::endl;  
    }  
};  

int main() {  
    Worker w;  
    // 成员函数指针：&Worker::work，对象指针：&w，参数：task_id=5  
    std::thread t(&Worker::work, &w, 5);  
    t.join();  
    return 0;  
}  
```

###### **（4）函数对象（仿函数）作为线程函数**

```cpp
struct Functor {  
    void operator()(int x) const {  
        std::cout << "函数对象线程：x=" << x << std::endl;  
    }  
};  

int main() {  
    std::thread t(Functor{}, 100); // 传递函数对象实例和参数  
    t.join();  
    return 0;  
}  
```

##### **3. 参数传递注意事项**

- **值传递**：默认按值传递参数（会拷贝），若需避免拷贝（如大对象），用 `std::move`。
    
- **引用传递**：必须用 `std::ref` 或 `std::cref` 包装，否则会被视为值传递：
    
    ```cpp
    int x = 0;  
    std::thread t([](int& val) { val++; }, std::ref(x)); // 引用传递 x  
    t.join();  
    std::cout << x << std::endl; // 输出 1（x 被修改）  
    ```
    
- **避免悬垂引用**：确保子线程访问的外部变量生命周期长于子线程（或用智能指针管理）。
    

#### **二、子线程函数的结束方式**

子线程函数执行完毕后，线程自动结束。常见结束场景：

##### **1. 自然执行完毕**

线程函数体执行完所有语句后，线程结束：

```cpp
void func() {  
    std::cout << "线程开始\n";  
    // ... 业务逻辑 ...  
    std::cout << "线程结束\n"; // 执行完后线程结束  
}  
```

##### **2. 通过标志位控制退出（循环场景）**

若线程函数是循环逻辑，可通过**共享标志位**通知退出（需配合互斥锁保证线程安全）：

```cpp
#include <atomic> // 原子变量，避免锁开销  

std::atomic<bool> stop_flag(false); // 原子标志位  

void loop_thread() {  
    while (!stop_flag) { // 循环检查标志位  
        // ... 执行任务 ...  
        std::this_thread::sleep_for(std::chrono::milliseconds(100));  
    }  
    std::cout << "线程退出\n"; // 标志位为 true 时退出循环，线程结束  
}  

int main() {  
    std::thread t(loop_thread);  
    std::this_thread::sleep_for(std::chrono::seconds(1)); // 主线程运行 1 秒  
    stop_flag = true; // 通知子线程退出  
    t.join(); // 等待子线程结束  
    return 0;  
}  
```

##### **3. 抛出异常（不推荐）**

若子线程函数抛出未捕获的异常，程序会调用 `std::terminate` 终止。需在子线程内捕获异常：

```cpp
void safe_thread_func() {  
    try {  
        // ... 可能抛出异常的代码 ...  
    } catch (const std::exception& e) {  
        std::cerr << "线程异常：" << e.what() << std::endl;  
    }  
}  
```

#### **三、主线程处理子线程：`join` 与 `detach`**

`std::thread` 对象管理子线程的生命周期，通过 `join()` 或 `detach()` 决定主线程与子线程的关系。

##### **1. `join()`：阻塞等待子线程结束**

- **作用**：主线程阻塞，直到子线程执行完毕，回收子线程资源。
    
- **前提**：子线程必须处于 `joinable` 状态（未被 `join` 或 `detach`）。
    
- **示例**：
    
    ```cpp
    int main() {  
        std::thread t([] {  
            std::this_thread::sleep_for(std::chrono::seconds(1));  
            std::cout << "子线程结束\n";  
        });  
        std::cout << "主线程等待子线程...\n";  
        t.join(); // 阻塞 1 秒，直到子线程结束  
        std::cout << "主线程继续\n";  
        return 0;  
    }  
    ```
    

##### **2. `detach()`：分离子线程（独立运行）**

- **作用**：将子线程与主线程分离，子线程在后台独立运行，主线程不再控制其生命周期。
    
- **注意**：
    
    - 分离后，子线程的资源由系统自动回收（子线程结束时）。
        
    - 主线程结束后，子线程可能仍在运行（成为“孤儿线程”），需确保子线程不访问主线程已销毁的资源（如局部变量）。
        
- **示例**：
    
    ```cpp
    int main() {  
        std::thread t([] {  
            std::cout << "分离线程运行中...\n";  
            std::this_thread::sleep_for(std::chrono::seconds(2));  
            std::cout << "分离线程结束\n";  
        });  
        t.detach(); // 分离子线程  
        std::cout << "主线程结束（子线程可能在后台继续运行）\n";  
        // 主线程结束，子线程可能仍在运行（输出可能延迟）  
        return 0;  
    }  
    ```
    

##### **3. `joinable()`：检查线程是否可 `join`/`detach`**

- **作用**：判断线程是否处于“可连接”状态（即未被 `join` 或 `detach`）。
    
- **规则**：
    
    - 刚创建的线程 `joinable()` 为 `true`。
        
    - 调用 `join()` 或 `detach()` 后，`joinable()` 变为 `false`。
        
    - 线程对象析构时，若 `joinable()` 为 `true`，会调用 `std::terminate` 终止程序（**必须避免**）。
        

##### **4. 错误示例：未 `join`/`detach` 导致程序终止**

```cpp
int main() {  
    std::thread t([] { /* ... */ });  
    // 忘记 join 或 detach  
    return 0; // 线程对象析构时，t.joinable()=true → 调用 std::terminate  
}  
```

#### **四、线程生命周期管理：RAII 封装**

为避免忘记 `join`/`detach`，推荐用 **RAII（资源获取即初始化）** 封装 `std::thread`：

```cpp
class ThreadGuard {  
private:  
    std::thread& t;  
public:  
    explicit ThreadGuard(std::thread& t_) : t(t_) {}  
    ~ThreadGuard() {  
        if (t.joinable()) {  
            t.join(); // 析构时自动 join  
        }  
    }  
    // 禁止拷贝  
    ThreadGuard(const ThreadGuard&) = delete;  
    ThreadGuard& operator=(const ThreadGuard&) = delete;  
};  

int main() {  
    std::thread t([] { /* ... */ });  
    ThreadGuard guard(t); // RAII 管理，析构时自动 join  
    // ... 业务逻辑 ...  
    return 0; // guard 析构，自动 join 子线程  
}  
```

**C++20 改进**：`std::jthread` 自动管理线程生命周期，析构时自动 `join`（若未 `detach`），推荐优先使用。

#### **五、关键总结**

|**操作**|**作用**|**注意事项**|
|:--|:--|:--|
|**创建线程**|`std::thread t(f, args...)`|传递可调用对象（函数、lambda、成员函数等），参数用 `std::ref` 传引用。|
|**`join()`**|主线程阻塞等待子线程结束，回收资源|必须在子线程结束前调用，且只能调用一次。|
|**`detach()`**|分离子线程，主线程不再控制其生命周期|子线程需独立管理资源，避免访问主线程已销毁的变量。|
|**`joinable()`**|检查线程是否可 `join`/`detach`|线程对象析构前，若 `joinable()` 为 `true` 会终止程序，需确保已 `join`/`detach`。|
|**RAII 封装**|用类管理线程生命周期（如 `ThreadGuard`）|避免资源泄漏，C++20 推荐用 `std::jthread` 替代 `std::thread`。|

**最佳实践**：

- 优先用 `join()` 确保子线程资源被回收，避免 `detach()` 除非明确需要后台运行。
    
- 用 `std::jthread`（C++20）或 RAII 封装管理线程生命周期，杜绝“忘记 `join`”导致的崩溃。
    
- 子线程函数内捕获所有异常，避免程序意外终止。


# 线程间互斥mutex与锁lock_guard

#### **一、竞态条件**

**定义**：当多个线程**同时读写共享数据**，且最终结果**依赖于线程执行的先后顺序**时，程序行为变得不确定，这种现象称为**竞态条件**。

- **核心问题**：共享数据的访问缺乏同步，导致数据不一致或逻辑错误。
    
- **示例**：多个线程对全局变量 `count` 执行 `count++`（非原子操作，分三步：读-改-写），结果可能小于预期。
    

```cpp
#include <thread>
#include <iostream>
int count = 0; // 共享数据

void increment() {
    for (int i = 0; i < 100000; ++i) {
        count++; // 非原子操作：读count→+1→写回count
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);
    t1.join(); t2.join();
    std::cout << "预期200000，实际：" << count << std::endl; // 结果可能小于200000（竞态条件导致）
    return 0;
}
```

#### **二、互斥锁（mutex）：解决竞态条件的核心工具**

`std::mutex`（互斥量）是 C++11 提供的同步原语，通过**独占访问**确保同一时间只有一个线程能执行临界区代码（访问共享资源的代码段）。

##### **1. 基础用法**

- **加锁**：`mutex.lock()`（阻塞式，若锁被占用则等待）。
    
- **解锁**：`mutex.unlock()`（必须手动调用，否则会导致死锁）。
    
- **风险**：若临界区抛异常，`unlock()` 可能无法执行，导致锁永久占用（死锁）。
    

##### **2. RAII 锁管理：`std::lock_guard`**

`std::lock_guard` 是**轻量级 RAII 锁封装**，构造时自动加锁，析构时自动解锁，彻底避免“忘记解锁”的风险。

**语法**：

```cpp
#include <mutex>
std::mutex mtx; // 全局或类成员互斥锁

{
    std::lock_guard<std::mutex> lock(mtx); // 构造时加锁
    // 临界区：访问共享资源（如 count++）
    count++;
} // 作用域结束，lock 析构，自动解锁
```

**优点**：

- **自动管理锁生命周期**：无需手动调用 `unlock()`，异常安全。
    
- **轻量级**：无额外开销，性能接近手动加解锁。
    
- **不可复制/移动**：确保锁的所有权唯一。
    

##### **3. 用 `lock_guard` 修复竞态条件**

```cpp
int count = 0;
std::mutex mtx;

void increment() {
    for (int i = 0; i < 100000; ++i) {
        std::lock_guard<std::mutex> lock(mtx); // 加锁保护临界区
        count++; // 原子操作（相对）
    }
}

// 主线程同上，最终 count=200000（正确）
```

#### **三、锁加双重判断：双重检查锁定**

**场景**：单例模式（懒汉式）中，避免频繁加锁提升性能——仅在对象未创建时加锁，创建后直接返回。

**问题**：多线程同时进入“第一次检查”，可能同时通过检查并加锁，导致重复创建对象。

**解决**：**双重判断**——第一次无锁检查（快速路径），加锁后第二次检查（确保对象未创建）。

##### **1. 错误实现（未考虑指令重排）**

```cpp
class Singleton {
private:
    static Singleton* instance;
    static std::mutex mtx;
    Singleton() = default;
public:
    static Singleton* getInstance() {
        if (instance == nullptr) { // 第一次检查（无锁）
            std::lock_guard<std::mutex> lock(mtx); // 加锁
            if (instance == nullptr) { // 第二次检查（加锁后）
                instance = new Singleton(); // 可能指令重排：先分配内存，再构造对象，最后赋值给instance
            }
        }
        return instance;
    }
};
// 风险：线程A执行 new 时，若指令重排导致 instance 先被赋值为“未构造完成的对象地址”，线程B第一次检查发现 instance != nullptr，直接返回未构造完成的对象（崩溃）。
```

##### **2. C++11 正确实现（内存序保证）**

用 `std::atomic` 和内存序（`memory_order_acquire`/`memory_order_release`）禁止指令重排，或用 `std::call_once` 简化：

**方案1：`std::atomic` + 内存序**

```cpp
#include <atomic>
class Singleton {
private:
    static std::atomic<Singleton*> instance;
    static std::mutex mtx;
    Singleton() = default;
public:
    static Singleton* getInstance() {
        Singleton* ptr = instance.load(std::memory_order_acquire); // 第一次检查（原子读）
        if (ptr == nullptr) { // 无锁快速路径
            std::lock_guard<std::mutex> lock(mtx);
            ptr = instance.load(std::memory_order_relaxed); // 加锁后第二次检查
            if (ptr == nullptr) {
                ptr = new Singleton();
                instance.store(ptr, std::memory_order_release); // 原子写，禁止重排
            }
        }
        return ptr;
    }
};
```

**方案2：`std::call_once`（更简单）**

```cpp
#include <mutex>
class Singleton {
private:
    static Singleton* instance;
    static std::once_flag onceFlag; // 确保初始化仅执行一次
    Singleton() = default;
public:
    static Singleton* getInstance() {
        std::call_once(onceFlag, [] { // 原子性执行初始化
            instance = new Singleton();
        });
        return instance;
    }
};
```

#### **四、`std::unique_lock`：灵活的锁管理**

`std::unique_lock` 是**更灵活的 RAII 锁封装**，支持**延迟加锁、手动解锁、条件变量配合**等高级功能，但性能略低于 `lock_guard`（因额外状态管理）。

##### **1. 核心特性**

|**特性**|**`lock_guard`**|**`unique_lock`**|
|:--|:--|:--|
|**加锁时机**|构造时立即加锁|可延迟加锁（`std::defer_lock`）|
|**手动解锁**|不支持|支持（`unlock()` 方法）|
|**所有权转移**|不可转移|可移动（转移锁所有权）|
|**配合条件变量**|不支持|必须（`condition_variable::wait` 要求）|

##### **2. 常用场景**

###### **（1）延迟加锁**

```cpp
std::mutex mtx;
std::unique_lock<std::mutex> lock(mtx, std::defer_lock); // 构造时不加锁
// ... 其他操作 ...
lock.lock(); // 手动加锁（可在条件满足时加锁）
// 临界区
lock.unlock(); // 手动解锁（提前释放锁，减少竞争）
```

###### **（2）配合条件变量（`condition_variable`）**

条件变量的 `wait` 方法需先释放锁并阻塞，唤醒后重新加锁，`unique_lock` 支持这种动态锁管理：

```cpp
std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void worker() {
    std::unique_lock<std::mutex> lock(mtx); // 加锁
    cv.wait(lock, []{ return ready; }); // 释放锁并阻塞，唤醒后重新加锁
    // 执行任务...
}

void master() {
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true; // 修改共享标志
    }
    cv.notify_one(); // 通知 worker
}
```

###### **（3）所有权转移**

通过 `std::move` 转移锁的所有权（如函数返回锁）：

```cpp
std::unique_lock<std::mutex> get_lock() {
    std::mutex mtx;
    std::unique_lock<std::mutex> lock(mtx);
    return lock; // 移动语义转移所有权（C++11 起支持）
}
```

#### **五、多线程程序最佳实践**

1. **最小化临界区**：仅将必要的共享数据访问放入临界区，减少锁持有时间。
    
2. **优先用 `lock_guard`**：简单场景下，`lock_guard` 性能最优且安全。
    
3. **复杂同步用 `unique_lock`**：需延迟加锁、手动解锁或配合条件变量时。
    
4. **避免死锁**：
    
    - 固定加锁顺序（所有线程按相同顺序获取锁）；
        
    - 用 `std::lock(mtx1, mtx2)` 原子性同时加多个锁；
        
    - 用 `std::scoped_lock`（C++17，自动管理多锁顺序）。
        
5. **双重检查锁定注意内存序**：C++11 后用 `std::atomic` 或 `std::call_once` 确保安全。
    

#### **六、总结**

- **竞态条件**：多线程无同步访问共享数据导致结果不确定，需用互斥锁解决。
    
- **`mutex`**：核心同步原语，通过独占访问保护临界区。
    
- **`lock_guard`**：RAII 轻量级锁，自动加解锁，适合简单场景。
    
- **双重检查锁定**：优化单例模式性能，需注意指令重排（C++11 用 `atomic` 或 `call_once`）。
    
- **`unique_lock`**：灵活锁管理，支持延迟加锁、手动解锁、条件变量配合，适合复杂同步。
    

**核心原则**：用 RAII 锁（`lock_guard`/`unique_lock`）避免手动管理锁，最小化临界区，警惕死锁与竞态条件！
# 基于CAS操作的atomic原子类型
#### **一、CAS**

`std::atomic` 是 C++11 引入的**原子类型模板**，用于支持**无锁的原子操作**（操作不可分割，多线程并发访问时无数据竞争）。其核心机制是 **CAS（Compare-And-Swap，比较并交换）**，一种硬件级别的原子指令，几乎所有现代 CPU 都支持。

##### **1. CAS 操作原理**

CAS 是一种乐观锁机制，包含三个操作数：

- **内存位置（V）**：要修改的变量地址；
    
- **预期值（A）**：线程认为 V 当前应有的值；
    
- **新值（B）**：线程希望将 V 更新为的值。
    

**操作逻辑**：

```plaintext
if (V == A) {  // 检查内存位置的值是否与预期值一致  
    V = B;    // 一致则更新为新值  
    return true;  // 成功  
} else {  
    return false; // 失败（V 已被其他线程修改）  
}  
```

**原子性保证**：整个操作（读 V、比较、写 V）是不可分割的，不会被其他线程中断。

##### **2. `std::atomic` 的核心特性**

- **原子操作**：支持加载（`load`）、存储（`store`）、交换（`exchange`）、CAS（`compare_exchange_weak`/`compare_exchange_strong`）等。
    
- **内存序控制**：通过 `std::memory_order` 指定操作的可见性和排序约束（如 `memory_order_relaxed`、`memory_order_acquire` 等）。
    
- **无锁性**：多数 `atomic` 操作（如整数自增）通过 CAS 或硬件原子指令实现，无需互斥锁。
    

##### **3. `std::atomic` 常用操作（以 `atomic<int>` 为例）**

|**操作**|**功能**|**底层是否依赖 CAS**|
|:--|:--|:--|
|`load()`/`store(val)`|原子加载/存储值|否（硬件直接支持）|
|`fetch_add(n)`|原子自增 `n`（返回旧值）|是（循环 CAS 实现）|
|`exchange(val)`|原子替换值（返回旧值）|是（CAS 实现）|
|`compare_exchange_weak(expected, desired)`|弱 CAS（可能虚假失败，适合循环）|硬件 CAS 指令|
|`compare_exchange_strong(expected, desired)`|强 CAS（保证成功/失败准确）|硬件 CAS 指令|

##### **4. CAS 实现原子自增示例**

```cpp
#include <atomic>  
#include <thread>  
#include <iostream>  

std::atomic<int> count(0);  

void increment() {  
    for (int i = 0; i < 100000; ++i) {  
        // 方法1：直接用 fetch_add（底层可能用 CAS 循环）  
        count.fetch_add(1, std::memory_order_relaxed);  

        // 方法2：手动 CAS 循环（模拟 fetch_add 实现）  
        int expected = count.load(std::memory_order_relaxed);  
        while (!count.compare_exchange_weak(expected, expected + 1,  
                                            std::memory_order_relaxed)) {  
            // 若失败（expected 已被其他线程修改），重试（expected 自动更新为当前值）  
        }  
    }  
}  

int main() {  
    std::thread t1(increment), t2(increment);  
    t1.join(); t2.join();  
    std::cout << "count = " << count << std::endl; // 预期 200000（正确）  
    return 0;  
}  
```

#### **二、无锁操作（Lock-Free Programming）**

**定义**：通过原子操作（如 `atomic` 的 CAS）实现线程同步，避免使用互斥锁（`mutex`），从而减少上下文切换和死锁风险。

##### **1. 无锁操作的优势**

- **高性能**：无锁操作避免线程阻塞，适合高并发场景（如计数器、队列）。
    
- **无死锁**：无需加锁，天然避免死锁。
    
- **细粒度控制**：通过内存序精确控制可见性。
    

##### **2. 无锁操作的挑战**

- **ABA 问题**：
    
    - **现象**：线程1准备将 V 从 A 改为 B，期间线程2将 V 改为 C 后又改回 A，线程1的 CAS 检查通过（V=A），但实际状态已被篡改。
        
    - **示例**：无锁栈中，节点被弹出后又重新插入，导致指针“看似未变但实际已失效”。
        
    - **解决**：给变量添加**版本号**（如 `atomic<pair<T, int>>`，版本号递增），或使用 `std::shared_ptr` 的原子操作（自带引用计数版本）。
        
- **内存序复杂性**：错误的内存序可能导致可见性问题（如一个线程的修改对其他线程不可见）。
    
- **实现复杂度**：无锁数据结构（如无锁队列、栈）需精心设计，易出错。
    

##### **3. 无锁操作示例：无锁计数器**

```cpp
#include <atomic>  
class LockFreeCounter {  
private:  
    std::atomic<int> count{0};  
public:  
    void increment() {  
        count.fetch_add(1, std::memory_order_relaxed); // 无锁自增  
    }  
    int get() const {  
        return count.load(std::memory_order_acquire); // 确保读取最新值  
    }  
};  
```

#### **三、`volatile` 关键字：澄清误解**

`volatile` 是 C/C++ 中的关键字，**仅用于告知编译器“变量可能被意外修改”（如硬件寄存器、中断服务程序），禁止编译器优化**（如不缓存到寄存器、不重排访问顺序）。

##### **1. `volatile` 的作用**

- **防止编译器优化**：确保每次访问变量都直接从内存读取，而非寄存器缓存。
    
    ```cpp
    volatile int sensor_value; // 传感器值可能被硬件修改  
    void read_sensor() {  
        int val = sensor_value; // 每次从内存读取（而非寄存器缓存）  
    }  
    ```
    
- **多线程中的误区**：`volatile` **不提供线程安全**！它不保证原子性（如 `volatile int count; count++` 仍是非原子的），也不保证内存可见性（不同线程的缓存可能不一致）。
    

##### **2. `volatile` vs `std::atomic`**

|**特性**|`volatile`|`std::atomic`|
|:--|:--|:--|
|**线程安全**|否（仅防止编译器优化）|是（原子操作+内存序保证）|
|**原子性**|否（如 `volatile int++` 非原子）|是（硬件支持的原子指令）|
|**内存序**|无（编译器不重排，CPU 可能重排）|支持（`memory_order` 控制可见性/排序）|
|**适用场景**|硬件交互、信号处理|多线程共享数据同步|

##### **3. 错误示例：`volatile` 不能替代 `atomic`**

```cpp
#include <thread>  
volatile int count = 0; // 错误：volatile 不保证原子性  

void increment() {  
    for (int i = 0; i < 100000; ++i) {  
        count++; // 非原子操作（读-改-写），多线程下结果错误  
    }  
}  

int main() {  
    std::thread t1(increment), t2(increment);  
    t1.join(); t2.join();  
    std::cout << count << std::endl; // 结果可能小于 200000  
    return 0;  
}  
```

#### **四、总结**

- **`std::atomic`**：基于 CAS 等硬件原子指令，提供线程安全的原子操作，是实现无锁编程的基础。
    
- **CAS 操作**：乐观锁核心，通过比较-交换实现无锁更新，需注意 ABA 问题。
    
- **无锁编程**：用原子操作替代锁，提升并发性能，但实现复杂（需处理 ABA、内存序）。
    
- **`volatile`**：仅防止编译器优化，不保证线程安全，**不可替代 `atomic`**。
    

**最佳实践**：多线程共享数据用 `std::atomic` 或互斥锁；硬件交互用 `volatile`；无锁数据结构优先用成熟的库实现（如 TBB、Folly）。

# 线程间的同步通信

#### **一、线程间同步通信的核心目标**

多线程协作时，线程间需通过**同步机制**协调执行顺序，避免竞态条件，实现**有序的数据交换或任务协作**。核心问题包括：

- **等待与通知**：一个线程需等待某个条件满足（如“数据已准备好”）才能继续执行，条件满足时通知其他线程。
    
- **共享资源保护**：通过互斥锁（mutex）确保共享资源（如缓冲区、队列）的原子访问。
    
- **避免忙等**：通过阻塞等待（而非循环检查）减少 CPU 资源浪费。
    

#### **二、经典模型：生产者-消费者问题**

生产者-消费者模型是线程同步通信的典型场景：**生产者线程**生成数据并放入缓冲区，**消费者线程**从缓冲区取出数据处理。两者速度可能不匹配，需通过同步机制协调。

##### **1. 模型核心要素**

- **共享缓冲区**：存储生产者生成的数据（如队列、数组），容量有限（有界缓冲区）或无限（无界缓冲区）。
    
- **同步机制**：
    
    - **互斥锁（mutex）**：保护缓冲区访问（避免同时读写）。
        
    - **条件变量（condition_variable）**：生产者通知消费者“缓冲区非空”，消费者通知生产者“缓冲区非满”。
        

##### **2. 问题分析**

- **缓冲区为空**：消费者需等待生产者放入数据（避免空读）。
    
- **缓冲区为满**：生产者需等待消费者取出数据（避免溢出）。
    
- **多线程并发**：多生产者/多消费者时需确保操作的原子性（如缓冲区计数、数据存取）。
    

#### **三、C++ 实现：基于条件变量的生产者-消费者模型**

结合 `std::mutex`、`std::condition_variable`、`std::unique_lock` 实现同步通信，核心是**条件变量的等待（wait）与通知（notify）**。

##### **1. 单生产者-单消费者模型（基础版）**

**场景**：一个生产者线程生成数据，一个消费者线程消费数据，缓冲区为有界队列（容量固定）。

```cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <chrono>

const int BUFFER_SIZE = 5; // 缓冲区容量
std::queue<int> buffer;    // 共享缓冲区（存储整数）
std::mutex mtx;            // 保护缓冲区的互斥锁
std::condition_variable cv_not_empty; // 消费者等待：缓冲区非空
std::condition_variable cv_not_full;  // 生产者等待：缓冲区非满

// 生产者线程函数：生成数据并放入缓冲区
void producer(int id, int count) {
    for (int i = 0; i < count; ++i) {
        std::unique_lock<std::mutex> lock(mtx); // 加锁（unique_lock支持条件变量）
        
        // 若缓冲区满，等待消费者通知（cv_not_full）
        cv_not_full.wait(lock, []{ 
            return buffer.size() < BUFFER_SIZE; 
        });
        
        // 生产数据（此处简化为 i）
        int data = id * 100 + i; 
        buffer.push(data);
        std::cout << "Producer " << id << " produced: " << data 
                  << " (buffer size: " << buffer.size() << ")\n";
        
        lock.unlock(); // 提前解锁（可选，减少锁持有时间）
        cv_not_empty.notify_one(); // 通知消费者：缓冲区非空
        std::this_thread::
        sleep_for(std::chrono::milliseconds(100)); 
		// 模拟生产耗时
    }
}

// 消费者线程函数：从缓冲区取出数据并处理
void consumer(int id, int count) {
    for (int i = 0; i < count; ++i) {
        std::unique_lock<std::mutex> lock(mtx);
        
        // 若缓冲区空，等待生产者通知（cv_not_empty）
        cv_not_empty.wait(lock, []{ 
            return !buffer.empty(); 
        });
        
        // 消费数据
        int data = buffer.front();
        buffer.pop();
        std::cout << "Consumer " << id << " consumed: " 
        << data << " (buffer size: " << buffer.size() 
        << ")\n";
        
        lock.unlock();
        cv_not_full.notify_one(); // 通知生产者：缓冲区非满
        
        std::this_thread::
        sleep_for(std::chrono::milliseconds(150)); 
        // 模拟消费耗时
    }
}

int main() {
    const int PRODUCE_COUNT = 10; // 总生产/消费次数
    std::thread prod(producer, 1, PRODUCE_COUNT); // 生产者线程
    std::thread cons(consumer, 1, PRODUCE_COUNT); // 消费者线程
    
    prod.join();
    cons.join();
    return 0;
}
```

##### **2. 多生产者-多消费者模型（扩展版）**

**场景**：多个生产者/消费者线程并发操作缓冲区，需确保线程安全和同步。

**关键调整**：

- 缓冲区操作（入队/出队）需通过互斥锁保护（单生产者单消费者时也可用，但多生产者/消费者时必须严格加锁）。
    
- 条件变量通知需用 `notify_all()`（多消费者时唤醒所有等待线程）或 `notify_one()`（随机唤醒一个）。
    

**示例代码片段（多生产者）**：

```cpp
// 多生产者：3个生产者线程，共生产 30 个数据
void multi_producer() {
    std::vector<std::thread> producers;
    for (int i = 0; i < 3; ++i) {
        producers.emplace_back(producer, i+1, 10); 
        // 每个生产者生产 10 个数据
    }
    for (auto& t : producers) t.join();
}
```

#### **四、条件变量（condition_variable）的核心机制**

在生产者-消费者模型中，条件变量是同步的“神经中枢”，其工作机制如下：

##### **1. 等待（wait）**

消费者/生产者通过 `wait` 阻塞等待条件满足：

```cpp
cv.wait(lock, predicate); // 等价于：while (!predicate) { wait(lock); }  
```

- **`lock`**：必须是 `std::unique_lock`（支持动态解锁/加锁）。
    
- **`predicate`**：条件检查函数（如 `[]{ return !buffer.empty(); }`）。
    
- **虚假唤醒（Spurious Wakeup）**：即使无通知，`wait` 也可能返回，因此必须用**循环检查条件**（或 `wait` 的第二个参数 `predicate` 自动处理）。
    

##### **2. 通知（notify）**

条件满足时，通过 `notify_one()` 或 `notify_all()` 唤醒等待线程：

- **`notify_one()`**：唤醒一个等待线程（适合单消费者/单生产者）。
    
- **`notify_all()`**：唤醒所有等待线程（适合多消费者/多生产者，需通过竞争锁决定执行权）。
    

**通知时机**：必须在**修改共享数据后、释放锁前**通知，确保被唤醒线程能看到最新数据：

```cpp
{  
    std::lock_guard<std::mutex> lock(mtx);  
    buffer.push(data); // 修改共享数据  
}  
cv_not_empty.notify_one(); // 释放锁后通知（或 unlock 后）  
```

#### **五、关键问题与解决方案**

##### **1. 缓冲区满/空的边界条件**

- **生产者发现缓冲区满**：`cv_not_full.wait(lock, []{ return buffer.size() < BUFFER_SIZE; })` 阻塞，直到消费者取走数据后 `notify_one()`。
    
- **消费者发现缓冲区空**：`cv_not_empty.wait(lock, []{ return !buffer.empty(); })` 阻塞，直到生产者放入数据后 `notify_one()`。
    

##### **2. 多生产者/消费者的竞争**

- **数据一致性**：通过互斥锁确保缓冲区的 `push`/`pop` 操作原子性（如队列的 `size()`、`front()`、`pop()` 需整体加锁）。
    
- **通知效率**：`notify_one()` 比 `notify_all()` 更高效（减少线程唤醒开销），但多消费者时需用 `notify_all()` 避免饥饿。
    

##### **3. 死锁风险**

- **避免嵌套锁**：生产者和消费者均只持有一个锁（缓冲区锁），不会嵌套加锁。
    
- **及时释放锁**：临界区尽量小（如仅保护缓冲区操作，通知放在锁外）。
    

#### **六、同步通信的其他方式（补充）**

除条件变量外，C++ 还支持其他同步机制（需结合场景选择）：

##### **1. 信号量（Semaphore）**

- **功能**：通过一个计数器控制同时访问资源的线程数（P 操作减计数，V 操作加计数）。
    
- **C++ 实现**：C++20 引入 `std::counting_semaphore`，此前需用 `mutex + condition_variable` 模拟：
    
    ```cpp
    class Semaphore {  
    private:  
        std::mutex mtx;  
        std::condition_variable cv;  
        int count;  
    public:  
        Semaphore(int init) : count(init) {}  
        void wait() {  
            std::unique_lock<std::mutex> lock(mtx);  
            cv.wait(lock, [this] { return count > 0; });  
            --count;  
        }  
        void signal() {  
            std::lock_guard<std::mutex> lock(mtx);  
            ++count;  
            cv.notify_one();  
        }  
    };  
    ```
    

##### **2. 屏障（Barrier）**

- **功能**：让多个线程等待，直到所有线程都到达屏障点后再继续执行（C++20 引入 `std::barrier`）。
    

#### **七、最佳实践与总结**

##### **1. 核心原则**

- **明确同步目标**：区分“互斥”（保护共享资源）和“同步”（协调执行顺序），条件变量用于同步，mutex 用于互斥。
    
- **最小化锁粒度**：仅保护必要代码（如缓冲区操作），通知操作放在锁外。
    
- **警惕虚假唤醒**：条件变量等待必须用循环检查或 `wait` 的 `predicate` 参数。
    

##### **2. 生产者-消费者模型总结**

- **核心组件**：共享缓冲区、mutex（保护缓冲区）、条件变量（通知满/空状态）。
    
- **C++ 实现关键**：`std::unique_lock` 配合 `condition_variable::wait`，`notify_one()`/`notify_all()` 适时通知。
    
- **适用场景**：任务队列、消息中间件、日志系统等“生产者-消费者”模式。
    

**一句话总结**：线程间同步通信的本质是“等待-通知”机制，条件变量是 C++ 实现这一机制的利器，结合 mutex 可高效解决生产者-消费者等经典同步问题，核心是**用循环检查条件、及时通知、最小化锁持有时间**。

# 死锁、读写锁与线程同步

## 一、死锁（Deadlock）

### 1. 定义与产生条件

**死锁**是指多个线程因争夺资源而相互等待，导致所有线程都无法继续执行的状态。

**四个必要条件**（缺一不可）：

- **互斥条件**：资源只能被一个线程占用（如互斥量`std::mutex`的独占性）；
    
- **占有且等待**：线程已持有部分资源，同时等待其他线程释放所需资源；
    
- **不可剥夺**：资源只能由持有者主动释放，不能被强制剥夺；
    
- **循环等待**：多个线程形成环形等待链（如线程A等B的资源，线程B等A的资源）。
    

### 2. 死锁示例（经典“双锁互等”）

```cpp
#include <mutex>
#include <thread>

std::mutex mtx1, mtx2;

void thread1() {
    std::lock_guard<std::mutex> lock1(mtx1);  // 线程1先锁mtx1
    std::this_thread::sleep_for(std::chrono::milliseconds(100));  // 模拟耗时操作
    std::lock_guard<std::mutex> lock2(mtx2);  // 尝试锁mtx2（此时线程2可能已锁mtx2）
    // ... 业务逻辑 ...
}

void thread2() {
    std::lock_guard<std::mutex> lock2(mtx2);  // 线程2先锁mtx2
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::lock_guard<std::mutex> lock1(mtx1);  // 尝试锁mtx1（此时线程1已锁mtx1）
    // ... 业务逻辑 ...
}

int main() {
    std::thread t1(thread1), t2(thread2);
    t1.join(); t2.join();
    return 0;
}
```

**结果**：线程1持有`mtx1`等`mtx2`，线程2持有`mtx2`等`mtx1`，形成循环等待，导致死锁。

### 3. 死锁避免与解决方法

#### （1）破坏“循环等待”条件：按固定顺序加锁

所有线程都按**相同顺序**申请资源（如先锁`mtx1`再锁`mtx2`）。

```cpp
// 修改thread2：先锁mtx1，再锁mtx2（与thread1顺序一致）
void thread2() {
    std::lock_guard<std::mutex> lock1(mtx1);  // 先锁mtx1
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    std::lock_guard<std::mutex> lock2(mtx2);  // 再锁mtx2
    // ...
}
```

#### （2）破坏“占有且等待”条件：一次性申请所有资源

用`std::lock`同时锁定多个互斥量（避免分步加锁导致的等待）：

```cpp
void thread1() {
    std::lock(mtx1, mtx2);  // 同时锁定mtx1和mtx2（内部避免死锁）
    std::lock_guard<std::mutex> lock1(mtx1, std::adopt_lock);  // 接管已锁的mtx1
    std::lock_guard<std::mutex> lock2(mtx2, std::adopt_lock);  // 接管已锁的mtx2
    // ... 业务逻辑 ...
}
```

`std::adopt_lock`告诉`lock_guard`：互斥量已被当前线程锁定，只需在析构时解锁。

#### （3）破坏“不可剥夺”条件：设置锁超时

用`std::timed_mutex`的`try_lock_for`/`try_lock_until`尝试加锁，超时则释放已有资源并重试：

```cpp
#include <timed_mutex>

std::timed_mutex tm1, tm2;

void thread1() {
    if (tm1.try_lock_for(std::chrono::milliseconds(100))) {  // 尝试锁tm1，超时放弃
        if (tm2.try_lock_for(std::chrono::milliseconds(100))) {  // 尝试锁tm2
            // ... 业务逻辑 ...
            tm2.unlock();
        }
        tm1.unlock();
    }
}
```

#### （4）使用RAII管理锁

优先用`std::lock_guard`或`std::unique_lock`（自动解锁），避免手动`lock/unlock`遗漏导致死锁。

## 二、读写锁（Read-Write Lock）

### 1. 定义与核心思想

**读写锁**是一种特殊的互斥量，允许多个线程**同时读**（共享模式），但仅允许一个线程**写**（独占模式），适用于**读多写少**的场景（如缓存、配置文件读取），可提高并发性。

- **读锁（共享锁）**：多个线程可同时持有，不阻塞其他读锁，但会阻塞写锁；
    
- **写锁（独占锁）**：仅一个线程可持有，阻塞所有读锁和其他写锁。
    

### 2. C++中的读写锁实现

C++标准库原生读写锁演进：

- **C++14**：引入`std::shared_timed_mutex`（支持定时锁定）；
    
- **C++17**：引入更轻量的`std::shared_mutex`（推荐优先使用）；
    
- **C++20**：引入`std::shared_lock`（读锁RAII封装）和`std::unique_lock`（写锁RAII封装）。
    

### 3. 核心操作函数

以`std::shared_mutex`（C++17）为例：

|**操作**|**功能**|**适用场景**|
|:--|:--|:--|
|`lock()`|获取写锁（独占模式，阻塞直到成功）|写操作|
|`unlock()`|释放写锁|写操作结束|
|`try_lock()`|尝试获取写锁（立即返回，成功返回true）|非阻塞写尝试|
|`lock_shared()`|获取读锁（共享模式，阻塞直到成功）|读操作|
|`unlock_shared()`|释放读锁|读操作结束|
|`try_lock_shared()`|尝试获取读锁（立即返回，成功返回true）|非阻塞读尝试|

### 4. 使用示例（读多写少场景）

```cpp
#include <shared_mutex>
#include <vector>
#include <thread>

std::shared_mutex rw_mtx;  // 读写锁
std::vector<int> data = {1, 2, 3};  // 共享数据

// 读线程：获取读锁
void read_data(int id) {
    std::shared_lock<std::shared_mutex> lock(rw_mtx);  // C++17：读锁RAII封装
    // 或用 lock_shared() + unlock_shared()
    // rw_mtx.lock_shared();
    printf("Thread %d read: ", id);
    for (int x : data) printf("%d ", x);
    printf("\n");
    // rw_mtx.unlock_shared();
}

// 写线程：获取写锁
void write_data(int val) {
    std::unique_lock<std::shared_mutex> lock(rw_mtx);  // C++17：写锁RAII封装
    // 或用 lock() + unlock()
    // rw_mtx.lock();
    data.push_back(val);
    printf("Write %d, data size: %zu\n", val, data.size());
    // rw_mtx.unlock();
}

int main() {
    // 启动3个读线程
    std::thread t1(read_data, 1), t2(read_data, 2), t3(read_data, 3);
    // 启动1个写线程
    std::thread t4(write_data, 4);
    
    t1.join(); t2.join(); t3.join(); t4.join();
    return 0;
}
```

**效果**：读线程可同时执行（共享读锁），写线程执行时阻塞所有读线程（独占写锁）。

## 三、线程同步机制与操作函数

线程同步是指协调多个线程的执行顺序，确保共享资源的互斥访问或有序协作。C++多线程同步主要依赖以下机制：

### 1. 互斥量（Mutex）：独占访问共享资源

**作用**：保证同一时间只有一个线程访问共享资源（互斥性）。

#### 核心类型与函数：

|**类型**|**特点**|**核心函数**|
|:--|:--|:--|
|`std::mutex`|基础互斥量，不可递归加锁|`lock()`, `unlock()`, `try_lock()`|
|`std::recursive_mutex`|允许同一线程多次加锁（递归调用安全）|同上（需对应次数解锁）|
|`std::timed_mutex`|支持超时加锁（`try_lock_for`/`try_lock_until`）|增加定时锁定接口|
|`std::recursive_timed_mutex`|递归+超时版本|同上|

#### RAII封装（推荐）：

- `std::lock_guard<Mutex>`：构造时加锁，析构时解锁（简单场景）；
    
- `std::unique_lock<Mutex>`：更灵活（支持延迟加锁、转移所有权、配合条件变量）。
    

**示例（用`unique_lock`保护共享变量）**：

```cpp
#include <mutex>
#include <thread>

int count = 0;
std::mutex mtx;

void increment() {
    std::unique_lock<std::mutex> lock(mtx);  // 构造时加锁
    count++;  // 临界区（安全访问共享变量）
}  // 析构时自动解锁
```

### 2. 条件变量（Condition Variable）：线程间通信

**作用**：让线程等待某个条件成立后再继续执行（如生产者-消费者模型中“缓冲区非空”条件）。

#### 核心组件：

- `std::condition_variable`：配合`std::unique_lock`使用；
    
- `std::condition_variable_any`：可配合任意锁类型（效率略低）。
    

#### 核心函数：

|**函数**|**功能**|
|:--|:--|
|`wait(unique_lock& lock, Predicate pred)`|释放锁并阻塞，直到被`notify`且`pred`为true（避免虚假唤醒）|
|`notify_one()`|唤醒一个等待线程|
|`notify_all()`|唤醒所有等待线程|

**示例（生产者-消费者模型）**：

```cpp
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>

std::queue<int> q;
std::mutex mtx;
std::condition_variable cv;
const int MAX_SIZE = 5;  // 队列最大容量

// 生产者：往队列放数据
void producer() {
    for (int i = 0; i < 10; ++i) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, []{ return q.size() < MAX_SIZE; });  // 等待队列不满
        q.push(i);
        printf("Produce: %d, queue size: %zu\n", i, q.size());
        lock.unlock();  // 提前解锁（可选，notify前释放锁更高效）
        cv.notify_one();  // 唤醒一个消费者
    }
}

// 消费者：从队列取数据
void consumer() {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, []{ return !q.empty(); });  // 等待队列不空
        int data = q.front(); q.pop();
        printf("Consume: %d, queue size: %zu\n", data, q.size());
        lock.unlock();
        cv.notify_one();  // 唤醒一个生产者
        if (data == 9) break;  // 生产完10个数据后退出
    }
}

int main() {
    std::thread prod(producer), cons(consumer);
    prod.join(); cons.join();
    return 0;
}
```

### 3. 原子操作（Atomic Operations）：无锁同步

**作用**：通过硬件指令保证操作的原子性（不可分割），无需加锁，效率极高。

#### 核心类型：`std::atomic<T>`（T为整数、指针等平凡类型）

#### 核心函数：

|**函数**|**功能**|
|:--|:--|
|`load(memory_order)`|原子读取值（默认`memory_order_seq_cst`）|
|`store(val, memory_order)`|原子写入值|
|`exchange(val)`|原子替换值并返回旧值|
|`fetch_add(n)`|原子加n并返回旧值（类似`a += n`）|
|`compare_exchange_strong(expected, desired)`|若当前值==expected，则替换为desired（成功返回true）|

**示例（原子计数器）**：

```cpp
#include <atomic>
#include <thread>
#include <vector>

std::atomic<int> cnt(0);  // 原子变量

void increment(int n) {
    for (int i = 0; i < n; ++i) {
        cnt.fetch_add(1, std::memory_order_relaxed);  // 原子自增
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(increment, 1000000);  // 4个线程各加100万次
    }
    for (auto& t : threads) t.join();
    printf("Final cnt: %d (expected 4000000)\n", cnt.load());  // 输出4000000
    return 0;
}
```

### 4. 信号量（Semaphore，C++20引入）

**作用**：控制同时访问资源的线程数量（计数信号量），`std::counting_semaphore<N>`表示最大计数为N的信号量。

#### 核心函数：

- `acquire()`：计数减1（若计数为0则阻塞）；
    
- `release()`：计数加1（唤醒等待线程）；
    
- `try_acquire()`：尝试减1（立即返回是否成功）。
    

**示例（限制并发线程数）**：

```cpp
#include <semaphore>
#include <thread>
#include <iostream>

std::counting_semaphore<3> sem(3);  // 最多3个线程同时执行

void task(int id) {
    sem.acquire();  // 计数-1（若满则阻塞）
    printf("Task %d start (current threads: %d)\n", id, 3 - sem.max() + sem.count());
    std::this_thread::sleep_for(std::chrono::seconds(1));  // 模拟任务
    printf("Task %d end\n", id);
    sem.release();  // 计数+1
}

int main() {
    std::thread t1(task, 1), t2(task, 2), t3(task, 3), t4(task, 4), t5(task, 5);
    t1.join(); t2.join(); t3.join(); t4.join(); t5.join();
    return 0;
}
```

## 四、线程同步总结

### 1. 核心机制对比

|**机制**|**适用场景**|**优点**|**缺点**|
|:--|:--|:--|:--|
|互斥量（mutex）|独占访问共享资源|简单可靠，保证互斥|读多写少时并发性低|
|读写锁（shared_mutex）|读多写少场景（如缓存）|提高读并发性|实现复杂，写锁优先级问题|
|条件变量（condition_variable）|线程间等待-通知（如生产者-消费者）|灵活协调线程执行顺序|需配合互斥量，易漏`wait`条件|
|原子操作（atomic）|简单计数、标志位等轻量同步|无锁高效，硬件支持|仅支持简单操作，不适用复杂逻辑|
|信号量（semaphore）|控制并发线程数（如连接池）|灵活控制资源访问数量|C++20才标准化，兼容性差|

### 2. 同步原则

- **最小化临界区**：仅对必要代码加锁，减少锁持有时间；
    
- **优先用RAII**：用`lock_guard`/`unique_lock`管理锁，避免手动解锁遗漏；
    
- **避免嵌套锁**：若必须嵌套，按固定顺序加锁（如先小后大、先局部后全局）；
    
- **读多写少用读写锁**：替代互斥量提升性能；
    
- **简单场景用原子操作**：避免锁开销（如计数器、标志位）。
    
# 条件变量与信号量

## 一、条件变量（Condition Variable）

### 1. 核心定义与本质

**条件变量**是线程间的“等待-通知”机制，允许线程在某个**条件不满足时主动阻塞**，并在条件可能满足时被其他线程唤醒。其核心价值是解决**线程间协作**（如“生产者-消费者”中消费者等待“缓冲区非空”条件），避免忙等（busy-wait）浪费CPU资源。

**本质**：条件变量本身不管理锁，需配合**互斥量**（`std::unique_lock`）使用，通过“释放锁-阻塞-唤醒后重新加锁”的流程实现同步。

### 2. 核心机制：等待与通知

#### （1）等待（wait）

线程调用`wait`时，会执行三步：

1. 释放关联的互斥量（允许其他线程进入临界区修改条件）；
    
2. 阻塞当前线程（进入等待队列）；
    
3. 被唤醒后，重新获取互斥量（竞争锁），并检查条件是否成立。
    

**关键函数**：

```cpp
void wait(std::unique_lock<std::mutex>& lock);  // 基础版：无条件等待（需配合循环检查条件）
template <class Predicate>
void wait(std::unique_lock<std::mutex>& lock, Predicate pred);  // 带条件谓词：避免虚假唤醒
```

- **`pred`谓词**：lambda表达式，返回`bool`（`true`表示条件满足）。`wait`会循环执行：释放锁→阻塞→唤醒后加锁→检查`pred`，直到`pred`为`true`才返回。
    

#### （2）通知（notify）

其他线程修改条件后，通过`notify_one`或`notify_all`唤醒等待线程：

- `notify_one()`：唤醒**一个**等待线程（随机选择一个，效率高）；
    
- `notify_all()`：唤醒**所有**等待线程（需竞争锁，可能引发“惊群效应”）。
    

### 3. 为什么需要配合互斥量？

条件变量的“条件”（如缓冲区是否为空）通常是**共享变量**，修改和检查需在互斥环境下进行：

- **等待线程**：检查条件前加锁（确保条件不被并发修改），调用`wait`时释放锁（允许其他线程修改条件）；
    
- **通知线程**：修改条件后加锁（确保修改对其他线程可见），调用`notify`后解锁（唤醒线程需重新竞争锁）。
    

### 4. 虚假唤醒（Spurious Wakeup）与应对

**虚假唤醒**：线程可能在未被`notify`的情况下被唤醒（操作系统调度导致）。若仅用`if`检查条件，可能误判条件成立，导致逻辑错误。

**解决方案**：用**循环+谓词**（`while`或带`pred`的`wait`）反复检查条件：

```cpp
// 错误写法（可能虚假唤醒）
if (q.empty()) {  // 若虚假唤醒，此处条件不成立但线程已唤醒
    cv.wait(lock); 
}

// 正确写法（循环检查）
while (q.empty()) {  // 虚假唤醒后再次检查，条件仍不满足则继续等待
    cv.wait(lock); 
}

// 更简洁：用带谓词的wait（内部自动循环）
cv.wait(lock, []{ return !q.empty(); });  // 等价于上述while循环
```

### 5. 完整示例：生产者-消费者模型（强化版）

```cpp
#include <queue>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <iostream>

std::queue<int> q;
std::mutex mtx;
std::condition_variable cv;
const int MAX_SIZE = 3;  // 缓冲区最大容量

// 生产者：放入数据（满则等待）
void producer(int id) {
    for (int i = 0; i < 5; ++i) {
        std::unique_lock<std::mutex> lock(mtx);
        // 等待条件：队列不满（带谓词避免虚假唤醒）
        cv.wait(lock, []{ return q.size() < MAX_SIZE; });  
        
        q.push(i);
        std::cout << "Producer " << id << " push: " << i 
                  << " (queue size: " << q.size() << ")\n";
        
        lock.unlock();  // 提前解锁（通知前释放锁，减少锁竞争）
        cv.notify_one();  // 唤醒一个消费者
        std::this_thread::sleep_for(std::chrono::milliseconds(100));  // 模拟生产耗时
    }
}

// 消费者：取出数据（空则等待）
void consumer(int id) {
    while (true) {
        std::unique_lock<std::mutex> lock(mtx);
        // 等待条件：队列不空（带谓词）
        cv.wait(lock, []{ return !q.empty(); });  
        
        int data = q.front(); q.pop();
        std::cout << "Consumer " << id << " pop: " << data 
                  << " (queue size: " << q.size() << ")\n";
        
        lock.unlock();
        cv.notify_one();  // 唤醒一个生产者
        
        if (data == 4) break;  // 消费完最后一个数据后退出
    }
}

int main() {
    std::thread p1(producer, 1), p2(producer, 2);
    std::thread c1(consumer, 1), c2(consumer, 2);
    
    p1.join(); p2.join(); c1.join(); c2.join();
    return 0;
}
```

### 6. 注意事项与常见错误

- **必须用`std::unique_lock`**：不能用`std::lock_guard`（`lock_guard`不支持手动解锁，`wait`需要先释放锁）；
    
- **避免“通知丢失”**：若通知线程在等待线程调用`wait`前发送通知，等待线程会错过通知（需确保条件检查和等待是原子的，通常用`while`循环解决）；
    
- **优先用`notify_one`**：除非所有等待线程都需唤醒（如条件全局变化），否则`notify_all`可能导致不必要的竞争；
    
- **不要在锁内执行耗时操作**：`wait`外的临界区代码应尽量简短（如仅修改条件和发送通知）。
    

## 二、信号量（Semaphore）

### 1. 核心定义与类型

**信号量**是一种**计数型同步原语**，通过一个整数计数器控制对共享资源的访问：

- **计数信号量**：计数器可取任意非负整数（`std::counting_semaphore<N>`，C++20引入，`N`为最大计数）；
    
- **二进制信号量**：计数器仅取0或1（等价于互斥量，但更灵活，可实现“一次性资源”控制）。
    

### 2. C++20信号量：`std::counting_semaphore`

#### 核心接口：

|**函数**|**功能**|**说明**|
|:--|:--|:--|
|`acquire()`|计数器减1（若计数器为0则阻塞）|获取资源（P操作）|
|`try_acquire()`|尝试减1（立即返回`bool`，不阻塞）|非阻塞获取资源|
|`try_acquire_for(dur)`|限时尝试减1（超时返回`false`）|带超时的非阻塞获取|
|`try_acquire_until(tp)`|截止时间点前尝试减1（超时返回`false`）|绝对时间限时获取|
|`release(n=1)`|计数器加`n`（唤醒`n`个等待线程）|释放资源（V操作），`n`默认为1|
|`max()`|返回最大计数（模板参数`N`）|如`counting_semaphore<5>`的`max()`为5|

### 3. 二进制信号量（Binary Semaphore）

用`std::counting_semaphore<1>`实现，计数器仅0或1，可用于**互斥访问**或**线程间简单同步**（如“主线程等待子线程完成”）。

**示例：用二进制信号量实现互斥**

```cpp
#include <semaphore>
#include <thread>
#include <iostream>

std::counting_semaphore<1> sem(1);  // 二进制信号量（初始计数1，相当于“锁”）
int shared_data = 0;

void increment() {
    sem.acquire();  // 计数-1（若为0则阻塞，获取“锁”）
    shared_data++;
    std::cout << "Increment: " << shared_data << "\n";
    sem.release();  // 计数+1（释放“锁”）
}

int main() {
    std::thread t1(increment), t2(increment), t3(increment);
    t1.join(); t2.join(); t3.join();  // 输出1、2、3（顺序可能不同）
    return 0;
}
```

### 4. 计数信号量（Counting Semaphore）

用`std::counting_semaphore<N>`（`N>1`）实现，用于控制**同时访问资源的线程数量**（如线程池、连接池）。

**示例：限制并发线程数为3**

```cpp
#include <semaphore>
#include <thread>
#include <iostream>
#include <vector>

std::counting_semaphore<3> sem(3);  // 最大计数3（允许3个线程同时执行）

void task(int id) {
    sem.acquire();  // 计数-1（若满则阻塞）
    std::cout << "Task " << id << " start (active: " << 3 - sem.count() << "/3)\n";
    std::this_thread::sleep_for(std::chrono::seconds(1));  // 模拟任务耗时
    std::cout << "Task " << id << " end\n";
    sem.release();  // 计数+1（唤醒其他线程）
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 1; i <= 5; ++i) {
        threads.emplace_back(task, i);  // 启动5个任务，最多3个并发
    }
    for (auto& t : threads) t.join();
    return 0;
}
```

### 5. 信号量 vs 互斥量 vs 条件变量

|**特性**|**信号量**|**互斥量（mutex）**|**条件变量（condition_variable）**|
|:--|:--|:--|:--|
|**计数能力**|支持任意计数（0~N）|仅二进制（0或1）|不直接计数（需配合变量）|
|**核心用途**|控制并发数、资源池大小|独占访问共享资源|线程间等待-通知（复杂条件）|
|**灵活性**|高（可加减任意值）|低（仅加锁/解锁）|中（需配合互斥量）|
|**C++标准**|C++20引入|C++11引入|C++11引入|

### 6. 信号量实现经典同步问题

#### （1）生产者-消费者（有限缓冲区）

用**两个信号量**：`empty`（空闲槽位，初始`MAX_SIZE`）、`full`（已用槽位，初始0），配合一个互斥信号量`mutex`（保护缓冲区）。

```cpp
std::counting_semaphore<MAX_SIZE> empty(MAX_SIZE);  // 空闲槽位
std::counting_semaphore<MAX_SIZE> full(0);          // 已用槽位
std::mutex mtx;  // 保护缓冲区访问

// 生产者
void producer(int data) {
    empty.acquire();  // 占用一个空闲槽位（empty-1）
    {
        std::lock_guard<std::mutex> lock(mtx);  // 临界区保护缓冲区
        q.push(data);
    }
    full.release();   // 增加一个已用槽位（full+1）
}

// 消费者
void consumer() {
    full.acquire();   // 占用一个已用槽位（full-1）
    int data;
    {
        std::lock_guard<std::mutex> lock(mtx);
        data = q.front(); q.pop();
    }
    empty.release();  // 增加一个空闲槽位（empty+1）
}
```

#### （2）读者-写者问题（读写锁简化版）

用**三个信号量**：`mutex`（控制读者计数，初始1）、`rw_mutex`（控制写操作，初始1）、`read_count`（读者数量，初始0）。

```cpp
std::counting_semaphore<1> mutex(1), rw_mutex(1);  // 二进制信号量
int read_count = 0;  // 读者数量（需原子操作或加锁保护）

// 读者
void reader() {
    mutex.acquire();  // 保护read_count修改
    if (++read_count == 1) rw_mutex.acquire();  // 第一个读者锁写
    mutex.release();
    
    // 读操作（共享）
    
    mutex.acquire();
    if (--read_count == 0) rw_mutex.release();  // 最后一个读者释放写锁
    mutex.release();
}

// 写者
void writer() {
    rw_mutex.acquire();  // 独占写锁
    // 写操作（独占）
    rw_mutex.release();
}
```

## 三、总结与高频面试问题

### 1. 核心总结

- **条件变量**：线程间“等待-通知”机制，需配合`std::unique_lock`和互斥量，用`while+谓词`避免虚假唤醒，适用于复杂条件协作（如生产者-消费者）；
    
- **信号量**：C++20引入`std::counting_semaphore`，分二进制（互斥）和计数（控制并发数），通过`acquire/release`管理资源，适用于资源池、限流等场景；
    
- **三者关系**：互斥量（独占）⊂ 二进制信号量（计数0/1）⊂ 计数信号量（任意计数），条件变量依赖互斥量实现复杂等待。
    

### 2. 高频面试问题

1. **条件变量为什么需要配合互斥量？**
    
    答：条件变量的“条件”是共享变量，修改和检查需互斥；`wait`时需释放锁允许其他线程修改条件，唤醒后重新加锁保证可见性。
    
2. **什么是虚假唤醒？如何解决？**
    
    答：线程未被通知却被唤醒的现象；用`while`循环或带谓词的`wait`反复检查条件（如`cv.wait(lock, []{ return !q.empty(); })`）。
    
3. **信号量和互斥量的区别？**
    
    答：信号量支持计数（0~N），可实现多资源控制；互斥量是二进制信号量（0/1），仅支持独占访问；信号量更灵活但易出错。
    
4. **如何用信号量实现生产者-消费者？**
    
    答：用两个计数信号量`empty`（空闲槽位）和`full`（已用槽位），配合互斥信号量保护缓冲区，生产者`empty.acquire()+full.release()`，消费者`full.acquire()+empty.release()`。
    
