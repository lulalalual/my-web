---
title: C++高级
permalink: posts/cpp-advanced/
date: 2026-04-29 20:45:00
updated: 2026-04-29 20:45:00
categories:
  - C++语法笔记
tags:
  - C++
  - 高级
  - 移动语义
  - 智能指针
  - Lambda
cover: /img/covers/notes/cpp-forwarding.webp
description: 整理移动语义、左右值引用、智能指针、对象优化、绑定器和 lambda 等现代 C++ 内容。
---

## 通俗导读

这篇讲的是“怎么把 C++ 写得更现代、更安全、更省开销”。核心不是炫语法，而是减少不必要的拷贝，明确资源归属，让函数调用更灵活。

可以先记住这条线：

```text
资源很贵 -> 尽量少拷贝 -> 能移动就移动 -> 所有权要写清楚
```

## 先看例子

```cpp
std::unique_ptr<int> a = std::make_unique<int>(10);
std::unique_ptr<int> b = std::move(a);

if (!a) {
    std::cout << "资源已经交给 b 了\n";
}
```

`std::move` 不是搬运工，它只是告诉编译器：这个对象可以被当成右值使用。真正的资源转移发生在移动构造或移动赋值里。

## 阅读建议

先看左右值和移动语义，再看智能指针。理解所有权以后，再读 lambda、绑定器和对象优化，会顺很多。

## 完整笔记

下面保留原文档的完整内容，并在前面补了通俗导读。原有知识点、表格和代码例子都不删减。

# 移动语义与完美转发

#### **一、移动语义（Move Semantics）**

移动语义通过**右值引用（Rvalue Reference）** 和 **移动操作**实现资源的高效转移，避免不必要的深拷贝，提升性能。

##### **1. 核心概念**

- **右值引用（`T&&`）**：绑定到临时对象（右值），允许“窃取”其资源。
    
- **移动构造函数**：`ClassName(ClassName&& other)`，接管资源并置空源对象。
    
- **移动赋值运算符**：`ClassName& operator=(ClassName&& other)`，转移资源并清理原对象。
    

##### **2. 实现原理**

- **资源转移**：移动操作直接“窃取”源对象的资源指针（如动态内存），而非复制数据。
    
    ```cpp
    class MyString {
    public:
        // 移动构造函数
        MyString(MyString&& other) noexcept 
            : data_(other.data_), size_(other.size_) {
            other.data_ = nullptr; // 置空源对象
            other.size_ = 0;
        }
    private:
        char* data_;
        size_t size_;
    };
    ```
    
- **`std::move`的作用**：将左值强制转换为右值引用，触发移动语义。
    
    ```cpp
    MyString s1("Hello");
    MyString s2 = std::move(s1); // 调用移动构造函数，s1变为空状态
    ```
    

##### **3. 应用场景**

- **容器操作**：`std::vector`的`push_back`、`emplace_back`通过移动语义避免拷贝。
    
- **智能指针**：`std::unique_ptr`通过移动转移所有权。
    
- **工厂函数**：返回临时对象时，编译器可能使用移动语义（NRVO失败时）。
    

##### **4. 注意事项**

- **移动后对象状态**：源对象处于有效但未定义状态，不可再依赖其原始数据。
    
- **`noexcept`标记**：移动构造函数/赋值运算符应标记为`noexcept`，确保容器操作（如扩容）优先选择移动。
    
- **避免滥用**：对内置类型（如`int`）使用`std::move`无意义，可能误导代码阅读。
    

---

#### **二、完美转发（Perfect Forwarding）**

完美转发通过**万能引用（`T&&`）**和**`std::forward`**保持参数的原始值类别（左值/右值），确保模板函数正确传递参数。

##### **1. 核心原理**

- **万能引用（`T&&`）**：根据传入参数的类型推导为左值引用或右值引用。
    
    ```cpp
    template<typename T>
    void wrapper(T&& arg) { // arg可能是左值或右值引用
        some_function(std::forward<T>(arg)); // 保持arg的原始值类别
    }
    ```
    
- **`std::forward`的实现**：条件性类型转换，还原参数的原始值类别。
    
    ```cpp
    template<typename T>
    T&& forward(typename std::remove_reference<T>::type& arg) noexcept {
        return static_cast<T&&>(arg); // 左值转左值，右值转右值
    }
    ```
    

##### **2. 引用折叠规则**

- **`T&&`的推导规则**：

|传入参数类型|推导后的 T 类型|T&& 类型|
|:--|:--|:--|
|左值（ int& ）|int&|int& &&  →  int&|
|右值（ int&& ）|int|int&&|

##### **3. 应用场景**

- **泛型包装器**：将参数原封不动传递给底层函数。
    
    ```cpp
    template<typename Func, typename... Args>
    auto timer(Func&& func, Args&&... args) {
        return std::forward<Func>(func)(std::forward<Args>(args)...);
    }
    ```
    
- **工厂函数**：`std::make_unique`/`std::make_shared`通过完美转发构造对象。
    
- **线程池任务**：传递任务参数时保持值类别。
    

##### **4. 注意事项**

- **必须配合万能引用**：`std::forward`仅对`T&&`参数有效，普通左值/右值无法触发完美转发。
    
- **避免中间变量**：转发链中若参数被赋值给左值变量，后续无法恢复右值属性。
    
    ```cpp
    template<typename T>
    void middle(T&& x) {
        auto local = std::forward<T>(x); // local是左值，后续转发失效
        inner(local); // 错误：inner接收左值
    }
    ```
    
- **`noexcept`与异常安全**：完美转发需确保参数传递过程中不抛出异常。
    

---

#### **三、移动语义与完美转发的协同**

1. **移动语义优化资源转移**：
    
    - 通过移动构造函数/赋值运算符实现资源“窃取”，减少拷贝开销。
        
    - 例如，`std::vector`的扩容操作通过移动元素而非复制。
        
2. **完美转发支持泛型编程**：
    
    - 在模板中保持参数的原始值类别，启用移动语义。
        
    - 例如，`std::make_pair`通过`std::forward`传递参数，避免不必要的拷贝。
        
3. **性能提升案例**：
    
    ```cpp
    // 传统拷贝方式
    std::vector<std::string> createVector() {
        std::string s = "Hello";
        return {s, s + " World"}; 
        // 调用移动构造函数（NRVO失败时）
    }
    
    // 完美转发 + 移动语义
    template<typename T>
    void process(T&& arg) {
        std::vector<std::string> v = {std::forward<T>(arg)}; 
        // 移动arg到vector
    }
    ```
    

---

#### **四、总结与最佳实践**

|**特性**|**移动语义**|**完美转发**|
|:--|:--|:--|
|**核心目标**|高效资源转移（避免拷贝）|保持参数原始值类别（左值/右值）|
|**关键工具**|`std::move`、移动构造函数/赋值运算符|`std::forward`、万能引用（`T&&`）|
|**典型场景**|容器操作、智能指针、工厂函数|泛型包装器、线程池、模板函数参数传递|
|**注意事项**|移动后对象不可用，需标记`noexcept`|避免中间变量，配合万能引用使用|

**最佳实践**：

1. 优先使用移动语义处理临时对象，减少拷贝开销。
    
2. 在模板函数中，始终使用`std::forward`实现完美转发。
    
3. 对资源管理类（如智能指针）实现移动语义，确保所有权转移安全。
    
4. 避免对内置类型滥用`std::move`，保持代码可读性。
    

**示例代码对比**：

```cpp
// 未使用移动语义和完美转发（低效）
void process(std::string str) {
    // 拷贝传入的字符串
}

// 使用移动语义（高效）
void process(std::string&& str) {
    // 移动传入的字符串
}

// 使用完美转发（通用高效）
template<typename T>
void process(T&& str) {
    inner(std::forward<T>(str)); // 保持str的原始值类别
}
```


# 左右值引用

#### **定义**
**左值（Lvalue）** 和 **右值（Rvalue）** 的本质区别——它们是表达式中对象的“身份”与“生存期”的分类。

##### **1. 左值（Lvalue）：有身份、可修改（或不可修改）的持久对象**

- **定义**：指**有明确内存地址**、**生存期较长**（非临时）的表达式，可理解为“可被取地址的对象”。
    
- **特征**：
    
    - 有名字（如变量名、函数返回的引用）；
        
    - 可取地址（`&x`合法）；
        
    - 可作为赋值操作的左操作数（非const左值）。
        
- **示例**：
    
    ```cpp
    int a = 10;       // a是左值（变量名）
    int& func() { static int x=5; return x; } 
    // func()返回左值引用（左值）
    class Obj { public: int x; }; Obj obj; obj.x = 20; 
    // obj.x是左值（成员访问）
    ```
    

##### **2. 右值（Rvalue）：无身份、临时的“值”**

- **定义**：指**临时生成**、**生存期短暂**（表达式结束后销毁）的表达式，不可取地址。
    
- **特征**：
    
    - 通常是字面量（如`42`、`"hello"`）、临时对象（如函数返回的非引用类型）、表达式计算结果（如`a+b`）；
        
    - 不可取地址（`&(a+b)`非法）；
        
    - 不能作为赋值操作的左操作数（除非被`const`修饰的特殊情况）。
        
- **示例**：
    
    ```cpp
    42;               // 字面量是右值
    "hello";          // 字符串字面量是右值（C风格字符串指针除外）
    func() + 1;        // 表达式结果是右值（临时值）
    std::string("tmp"); // 临时对象是右值
    ```
    

##### **3. 延伸：将亡值（Xvalue）与纯右值（Prvalue）**

C++11进一步细分右值为：

- **纯右值（Prvalue）**：纯粹的右值（如字面量、非引用返回的临时对象）；
    
- **将亡值（Xvalue）**：即将被移动的对象（如`std::move(x)`的结果），兼具右值的临时性和左值的资源所有权（可被视为“待转移的持久对象”）。
    

#### **二、左值引用（Lvalue Reference：`T&`）**

左值引用是C++98就有的传统引用，**必须绑定到左值**，本质是给已有对象起“别名”。

##### **1. 定义与特性**

- **语法**：`类型& 引用名 = 左值对象;`
    
- **核心特性**：
    
    - **绑定对象**：只能绑定到**左值**（非const左值引用）或**const左值**（const左值引用可绑定const左值）；
        
    - **不可重绑定**：一旦绑定对象，无法再绑定其他对象（区别于指针）；
        
    - **不分配新内存**：仅作为别名，操作引用即操作原对象。
        

##### **2. 两种左值引用**

|**类型**|**语法**|**绑定对象**|**可修改性**|**典型场景**|
|:--|:--|:--|:--|:--|
|**非const左值引用**|`T&`|非const左值（如普通变量、非const成员）|可修改原对象|函数参数（避免拷贝，修改实参）|
|**const左值引用**|`const T&`|左值（const或非const）、const右值、纯右值|不可修改原对象|函数参数（接受任意类型，避免拷贝）|

##### **3. 示例代码**

```cpp
int a = 10;
int& lref1 = a;       // 非const左值引用绑定左值a（正确）
lref1 = 20;            // 修改a的值（a变为20）

const int b = 30;
const int& lref2 = b;  // const左值引用绑定const左值b（正确）
// lref2 = 40;         // 错误：const引用不可修改

int& lref3 = 50;       // 错误：非const左值引用不能绑定右值（50是右值）
const int& lref4 = 50;  // 正确：const左值引用可绑定右值（临时对象生命周期延长至引用作用域）
```

#### **三、右值引用（Rvalue Reference：`T&&`）**

右值引用是C++11引入的新引用类型，**专门绑定到右值**（包括纯右值和将亡值），核心目的是**实现移动语义**（资源转移）和**完美转发**（保持值类别）。

##### **1. 定义与特性**

- **语法**：`类型&& 引用名 = 右值对象;`
    
- **核心特性**：
    
    - **绑定对象**：只能绑定到**右值**（纯右值或将亡值，如`std::move(x)`的结果）；
        
    - **本身是左值**：右值引用变量有名字、可取地址，因此**在表达式中被当作左值处理**（需`std::move`显式转为右值）；
        
    - **资源转移**：通过右值引用可“窃取”右值（临时对象）的资源（如动态内存），避免深拷贝。
        

##### **2. 右值引用的核心作用**

- **移动语义**：通过移动构造函数/赋值运算符，用右值引用接收临时对象，直接转移资源（见前文“移动语义”笔记）；
    
- **完美转发**：在模板中，通过`T&&`（万能引用）和`std::forward`保持参数原始值类别（见前文“完美转发”笔记）。
    

##### **3. 示例代码**

```cpp
int&& rref1 = 100;      
// 右值引用绑定纯右值100（正确，100是临时对象）
int a = 20;
// int&& rref2 = a;     // 错误：右值引用不能绑定左值a

int&& rref3 = std::move(a); 
// 正确：std::move将左值a转为右值引用（将亡值），rref3绑定a的资源
rref3 = 30;              
// 修改rref3即修改a（a变为30，因为资源被“窃取”后原对象仍可修改，但状态不确定）

// 右值引用本身是左值（有名字）
auto func(int&& x) -> int&& {
    x = 40;              // x是左值（右值引用变量），可修改
    return std::move(x); // 需显式转为右值返回（否则返回左值引用）
}
```

#### **四、左值引用 vs 右值引用：核心区别对比**

|**对比维度**|**左值引用（`T&`/`const T&`）**|**右值引用（`T&&`）**|
|:--|:--|:--|
|**绑定对象**|左值（`const T&`可绑定右值）|右值（纯右值、将亡值）|
|**本质**|对象的“别名”（持久引用）|临时对象的“资源接管者”（短期引用）|
|**是否可修改原对象**|非const可修改，const不可修改|可修改（但原对象状态不确定）|
|**典型用途**|函数参数（避免拷贝）、返回值（别名）|移动语义（资源转移）、完美转发|
|**自身值类别**|左值（有名字，可取地址）|左值（变量本身），需用`std::move`转为右值|

#### **五、关键注意事项**

##### **1. const左值引用的“万能绑定”**

`const T&`是唯一能同时绑定**左值、const左值、右值**的引用类型，因此常被用作函数参数以接受任意类型输入（避免拷贝）：

```cpp
void print(const std::string& s) { // 可接受左值、右值字符串
    std::cout << s << std::endl;
}

print("hello");       // 右值字符串字面量（绑定const string&）
std::string s = "world";
print(s);             // 左值s（绑定const string&）
```

##### **2. 右值引用变量是左值**

右值引用变量（如`int&& rref = 10`中的`rref`）本身有名字，在表达式中被当作**左值**处理。若需将其作为右值传递，必须用`std::move`显式转换：

```cpp
void consume(int&& x) { x = 100; } // x是左值（右值引用变量）

int main() {
    int&& rref = 5; 
    consume(rref);   // 错误：rref是左值，不能绑定到右值引用参数
    consume(std::move(rref)); // 正确：std::move(rref)转为右值（将亡值）
    return 0;
}
```

##### **3. 避免“右值引用绑定左值”的误用**

非const右值引用（`T&&`）**绝对不能绑定左值**，否则编译报错。只有`const T&&`（极少用）可绑定const右值，但实际中几乎不用，直接用`const T&`即可。

#### **六、总结**

- **左值**：有身份、可寻址的持久对象（如变量名），用`T&`（非const）或`const T&`（const）引用；
    
- **右值**：临时、无身份的“值”（如字面量、临时对象），用`T&&`引用（右值引用）；
    
- **核心用途**：左值引用避免拷贝（如函数参数），右值引用实现移动语义（资源转移）和完美转发（保持值类别）；
    
- **关键记忆点**：右值引用变量本身是左值，需用`std::move`转为右值；`const T&`可绑定任意类型（左值/右值）。
    

**小细节**：区分“左值/右值”看是否能取地址，区分“左值引用/右值引用”看绑定对象类型，右值引用是实现移动语义的基础！


# 智能指针

### **一、概念**

**智能指针**是C++中用于**自动管理动态内存**的类模板，通过**RAII（资源获取即初始化）**机制，在对象生命周期结束时自动释放所管理的内存，避免内存泄漏。C++11标准提供`shared_ptr`、`unique_ptr`、`weak_ptr`三种核心智能指针，其中`shared_ptr`和`weak_ptr`带引用计数，`unique_ptr`不带引用计数（独占所有权）。

### **二、带引用计数的智能指针：`shared_ptr`与`weak_ptr`**

#### **1. `shared_ptr`：共享所有权智能指针**

`shared_ptr`通过**引用计数**（Reference Counting）实现多指针共享同一对象的所有权：

- **引用计数**：记录有多少个`shared_ptr`指向同一对象，当计数为0时，自动释放对象内存。
    
- **核心特性**：
    
    - 支持**复制**（引用计数+1）和**移动**（引用计数不变，原指针置空）；
        
    - 可自定义**删除器**（Deleter），管理非内存资源（如文件句柄、网络连接）；
        
    - 线程安全（引用计数的增减是原子操作，但对象本身的访问需额外同步）。
        

**基本用法**：

```cpp
#include <memory>
using namespace std;

int main() {
    // 1. 创建shared_ptr（推荐用make_shared，效率更高）
    shared_ptr<int> sp1 = make_shared<int>(10); // 引用计数=1
    shared_ptr<int> sp2 = sp1; // 复制，引用计数=2
    
    // 2. 访问对象
    cout << *sp1 << endl; // 10（解引用）
    cout << sp1.use_count() << endl; // 2（引用计数）
    
    // 3. 重置（释放所有权，引用计数-1）
    sp1.reset(); // sp1置空，引用计数=1
    cout << sp2.use_count() << endl; // 1
    
    // 4. 自定义删除器（管理动态数组）
    shared_ptr<int> sp3(new int[5], [](int* p) { delete[] p; }); // 用lambda作为删除器
    return 0;
}
```

#### **2. `weak_ptr`：弱引用智能指针（辅助`shared_ptr`）**

`weak_ptr`是一种**不增加引用计数**的智能指针，用于**观察**`shared_ptr`管理的对象，解决`shared_ptr`的**循环引用问题**（交叉引用）。

- **核心特性**：
    
    - 不能单独访问对象，需通过`lock()`方法获取`shared_ptr`（若对象存在则引用计数+1）；
        
    - 不影响对象的生命周期（对象销毁后，`weak_ptr`自动失效）；
        
    - 用于缓存、观察者模式等场景，避免循环引用。
        

**基本用法**：

```cpp
shared_ptr<int> sp = make_shared<int>(10);
weak_ptr<int> wp = sp; // weak_ptr不增加引用计数（sp计数仍为1）

// 访问对象：通过lock()获取shared_ptr（若对象存在）
if (shared_ptr<int> tmp = wp.lock()) { // tmp计数=2（sp和tmp）
    cout << *tmp << endl; // 10
}
sp.reset(); // 对象销毁，wp失效
if (wp.expired()) { // 检查对象是否已销毁
    cout << "对象已释放" << endl; 
}
```


### **三、不带引用计数的智能指针：`unique_ptr`**

`unique_ptr`是**独占所有权**的智能指针，无引用计数，同一时刻只能有一个`unique_ptr`指向对象，轻量高效（无额外开销），是C++11推荐的默认智能指针。

#### **1. 核心特性**

- **独占性**：不可复制（拷贝构造/赋值被禁用），只能**移动**（通过`std::move`转移所有权）；
    
- **轻量高效**：大小与裸指针相同（无引用计数开销）；
    
- **支持数组**：`unique_ptr<T[]>`自动调用`delete[]`释放数组；
    
- **自定义删除器**：可指定删除逻辑（如文件关闭）。
    

#### **2. 基本用法**

```cpp
#include <memory>
using namespace std;

int main() {
    // 1. 创建unique_ptr（推荐用make_unique，C++14起支持）
    unique_ptr<int> up1 = make_unique<int>(20); // 独占对象20
    // unique_ptr<int> up2 = up1; // 错误：不可复制
    
    // 2. 移动所有权
    unique_ptr<int> up2 = move(up1); // up1置空，up2独占对象
    if (!up1) cout << "up1已释放" << endl; // 输出：up1已释放
    
    // 3. 管理数组
    unique_ptr<int[]> up_arr = make_unique<int[]>(3); // 数组大小3
    up_arr[0] = 1; up_arr[1] = 2; up_arr[2] = 3;
    
    // 4. 自定义删除器（管理文件）
    auto file_deleter = [](FILE* fp) { if (fp) fclose(fp); };
    unique_ptr<FILE, decltype(file_deleter)> up_file(fopen("test.txt", "w"), file_deleter);
    return 0;
}
```

#### **3. 与`auto_ptr`的区别（已弃用）**

C++98的`auto_ptr`是早期独占指针，但**复制时会转移所有权**（原指针置空），易导致误用（如容器中使用时失效）。`unique_ptr`完全替代`auto_ptr`，且支持移动语义，更安全。

### **四、交叉引用问题（循环引用）及解决**

#### **1. 问题描述：循环引用导致内存泄漏**

当两个或多个`shared_ptr`互相引用（形成环）时，它们的引用计数永远无法归零，导致对象无法释放，引发**内存泄漏**。

**示例（循环引用）**：

```cpp
#include <memory>
using namespace std;

struct A; struct B;

struct A {
    shared_ptr<B> b_ptr; // A引用B
    ~A() { cout << "A销毁" << endl; }
};

struct B {
    shared_ptr<A> a_ptr; // B引用A（循环引用）
    ~B() { cout << "B销毁" << endl; }
};

int main() {
    shared_ptr<A> a = make_shared<A>();
    shared_ptr<B> b = make_shared<B>();
    a->b_ptr = b; // A引用B（b计数=2）
    b->a_ptr = a; // B引用A（a计数=2）
    
    // 离开作用域时，a和b的计数减为1（而非0），A和B对象无法销毁！
    return 0; // 无输出（内存泄漏）
}
```

#### **2. 解决方法：用`weak_ptr`打破循环**

将循环引用中的一个`shared_ptr`改为`weak_ptr`（弱引用，不增加计数），即可打破循环。

**修正示例**：

```cpp
struct B {
    weak_ptr<A> a_ptr; // 改为weak_ptr，不增加A的计数
    ~B() { cout << "B销毁" << endl; }
};

int main() {
    shared_ptr<A> a = make_shared<A>();
    shared_ptr<B> b = make_shared<B>();
    a->b_ptr = b; // b计数=2
    b->a_ptr = a; // a计数=1（weak_ptr不增加计数）
    
    // 离开作用域时，a和b的计数减为0，A和B正常销毁
    return 0; // 输出：A销毁  B销毁
}
```

### **五、智能指针对比与适用场景**

|**智能指针**|**所有权**|**引用计数**|**核心特性**|**适用场景**|
|:--|:--|:--|:--|:--|
|`shared_ptr`|共享（多指针）|有（原子操作）|支持复制，线程安全（计数），自定义删除器|多模块共享对象（如缓存、全局资源）|
|`weak_ptr`|无（观察）|无|不增加计数，需`lock()`获取`shared_ptr`|解决循环引用，缓存观察，避免悬垂指针|
|`unique_ptr`|独占（单指针）|无|轻量高效，不可复制，仅可移动|独占资源（如局部动态对象、工厂函数返回）|
|`auto_ptr`|独占（已弃用）|无|复制时转移所有权，易误用|不推荐使用（用`unique_ptr`替代）|

### **六、关键注意事项**

1. **优先用`make_shared`/`make_unique`**：
    
    - 避免显式`new`，效率更高（一次性分配对象+控制块内存），且异常安全（防止内存泄漏）。
        
2. **避免混合使用智能指针与裸指针**：
    
    - 裸指针可能导致重复释放（如`delete sp.get()`），应完全通过智能指针管理。
        
3. **`unique_ptr`的移动语义**：
    
    - 函数返回`unique_ptr`时，编译器自动优化为“移动”而非“复制”（无需显式`std::move`）。
        
4. **`weak_ptr`的有效性检查**：
    
    - 用`expired()`或`lock()`判断对象是否存在，避免访问已释放对象。
        

### **七、总结**

- **带引用计数**：`shared_ptr`（共享所有权）和`weak_ptr`（弱引用，解循环），适合多模块共享资源；
    
- **无引用计数**：`unique_ptr`（独占所有权，轻量高效），适合单一所有者场景，是默认首选；
    
- **交叉引用问题**：`shared_ptr`循环引用导致内存泄漏，用`weak_ptr`打破循环；
    
- **核心原则**：根据所有权需求选智能指针，优先`unique_ptr`，共享用`shared_ptr`+`weak_ptr`防泄漏。
    



### **八 、make_shared代替shared_ptr**

#### **一、核心背景**

`std::make_shared` 是 C++11 引入的**智能指针工厂函数**，用于**安全高效地创建 `shared_ptr` 对象**。相比直接用 `new` 构造 `shared_ptr`（如 `shared_ptr<T>(new T(...))`），`make_shared` 在**内存分配、异常安全、性能**上有显著优势，是现代 C++ 推荐的创建 `shared_ptr` 的首选方式。

#### **二、`make_shared` 的优势**

##### **1. 减少内存分配次数（核心优势）**

`shared_ptr` 管理对象时，需要两部分内存：

- **对象本身**（`T` 类型实例）；
    
- **控制块**（存储引用计数、弱引用计数、删除器等）。
    
- **直接构造 `shared_ptr`**：需**两次独立内存分配**——先 `new T(...)` 分配对象，再 `shared_ptr` 构造函数分配控制块。
    
- **`make_shared`**：**一次内存分配**同时分配对象和控制块（连续内存块），减少内存碎片和分配开销。
    

**示例对比**：

```cpp
// 直接构造：2次内存分配（对象+控制块）
shared_ptr<int> sp1(new int(10)); 

// make_shared：1次内存分配（对象+控制块连续存储）
auto sp2 = make_shared<int>(10); // 推荐写法
```

##### **2. 异常安全（避免内存泄漏）**

若用 `new` 构造 `shared_ptr` 时发生异常，可能导致内存泄漏。例如：

```cpp
void func() {
    // 危险：若 new int(10) 成功，但 shared_ptr 构造前抛出异常（如内存不足），则 int(10) 泄漏
    shared_ptr<int> sp(new int(10)); 
    throw runtime_error("异常"); // 此时 sp 未构造完成，int(10) 无人管理
}
```

`make_shared` 通过**单一函数调用**完成对象和控制块分配，避免中间状态，确保异常发生时内存不泄漏：

```cpp
void func() {
    auto sp = make_shared<int>(10); // 原子操作：分配+构造，异常时自动释放
    throw runtime_error("异常"); // sp 已构造完成，引用计数=1，异常后自动释放对象
}
```

##### **3. 性能优化（缓存局部性）**

`make_shared` 分配的对象和控制块在内存中**连续存储**，CPU 缓存命中率更高（访问时无需跳转内存地址），尤其对频繁创建/销毁的小对象，性能提升明显。

##### **4. 代码简洁性**

`make_shared` 语法更简洁，避免显式 `new`，符合 RAII 原则（资源获取即初始化）：

```cpp
// 繁琐：显式 new + 类型重复
shared_ptr<string> sp(new string("hello")); 

// 简洁：自动推导类型（C++14 起支持 auto）
auto sp = make_shared<string>("hello"); 
```

#### **三、`make_shared` 的使用限制**

##### **1. 无法自定义删除器**

`make_shared` 的模板参数仅包含对象类型和构造参数，**不支持指定自定义删除器**（如管理文件句柄、数组等）。此时需直接用 `shared_ptr` 构造函数：

```cpp
// 管理动态数组（需自定义删除器 delete[]）
shared_ptr<int> sp(new int[5], [](int* p) { delete[] p; }); 

// make_shared 无法直接实现（C++20 前不支持数组，C++20 支持 make_shared<int[]>(5)，但仍无法自定义删除器）
```

##### **2. 数组支持有限**

- **C++17 及之前**：`make_shared` 不支持动态数组（如 `make_shared<int[]>(5)` 非法），需用 `shared_ptr<T[]>` 配合 `new[]` 和删除器。
    
- **C++20 起**：支持 `make_shared<T[]>(n)` 创建数组，但仍无法自定义删除器（默认用 `delete[]`）。
    

##### **3. 内存释放延迟（罕见场景）**

`make_shared` 分配的对象和控制块在同一内存块，当**引用计数归零**时，对象被销毁（调用析构函数），但**控制块需等待所有 `weak_ptr` 过期后才释放**（因为 `weak_ptr` 需访问控制块检查对象是否存在）。若长期存在 `weak_ptr`，对象占用的内存可能延迟释放（即使对象已销毁）。

**示例**：

```cpp
auto sp = make_shared<int>(10); // 对象+控制块连续分配
weak_ptr<int> wp = sp; 
sp.reset(); // 引用计数=0，对象销毁，但控制块因 wp 存在暂不释放
// 此时 int(10) 占用的内存已释放（对象销毁），但控制块内存仍被占用（直到 wp 过期）
```

**直接构造 `shared_ptr`**：对象和控制块独立分配，对象销毁后可立即释放对象内存（控制块需等 `weak_ptr` 过期），内存释放更及时。

#### **四、`make_shared` 与直接构造 `shared_ptr` 的对比**

|**对比维度**|`make_shared<T>(args...)`|`shared_ptr<T>(new T(args...))`|
|:--|:--|:--|
|**内存分配次数**|1次（对象+控制块连续）|2次（对象、控制块独立）|
|**异常安全**|安全（原子操作，无中间状态）|不安全（可能泄漏 `new` 分配的对象）|
|**性能**|更高（少一次分配+缓存局部性好）|较低（多一次分配+内存碎片）|
|**自定义删除器**|不支持|支持（构造函数第二个参数）|
|**数组支持**|C++20 前不支持，C++20 支持 `make_shared<T[]>(n)`（默认 `delete[]`）|支持（需显式 `new T[n]` + 删除器 `delete[]`）|
|**代码简洁性**|高（自动推导类型，无显式 `new`）|低（需显式 `new` 和类型重复）|

#### **五、最佳实践**

1. **优先用 `make_shared`**：除非需要**自定义删除器**或**C++20 前的数组管理**，否则一律用 `make_shared` 创建 `shared_ptr`。
    
2. **避免混合使用 `new` 和 `make_shared`**：同一对象的管理逻辑统一，减少错误。
    
3. **C++14 起用 `auto` 简化类型**：`auto sp = make_shared<T>(args...)` 比显式写 `shared_ptr<T>` 更简洁。
    
4. **数组场景特殊处理**：C++20 前用 `shared_ptr<T[]>` + `new T[n]` + 删除器 `delete[]`；C++20 起可用 `make_shared<T[]>(n)`（默认 `delete[]`）。
    

#### **六、总结**

`make_shared` 是创建 `shared_ptr` 的**首选方式**，通过**一次内存分配、异常安全、性能优化**解决了直接构造 `shared_ptr` 的痛点。仅在需自定义删除器或处理数组（C++20 前）时，才考虑用 `shared_ptr<T>(new T(...))`。



# 智能指针的删除器

#### **一、删除器的核心作用**

智能指针的**删除器**是**资源释放逻辑的自定义函数/函数对象**，用于替代默认的`delete`操作。当智能指针管理的对象生命周期结束（如`shared_ptr`引用计数归零、`unique_ptr`析构或`reset`）时，删除器被调用以释放资源。

**默认删除器**：`shared_ptr`和`unique_ptr`默认使用`delete`（单个对象）或`delete[]`（数组对象，仅`unique_ptr<T[]>`），但实际场景中需管理非内存资源（如文件句柄、网络连接、动态数组等），必须通过自定义删除器实现。

### **二、`shared_ptr`的删除器**

`shared_ptr`的删除器在**构造时指定**，存储在控制块中，类型为智能指针的一部分（但不影响引用计数）。删除器可以是**函数指针、函数对象（仿函数）、lambda表达式**。

#### **1. 语法格式**

```cpp
template <class Y, class Deleter>
shared_ptr(Y* ptr, Deleter d); // 构造函数：ptr为原始指针，d为删除器
```

- **`Deleter`**：可调用对象，接受`Y*`（管理对象的指针）作为参数，无返回值（或返回`void`）。
    

#### **2. 使用示例**

##### **场景1：管理动态数组（需`delete[]`）**

`shared_ptr`默认用`delete`释放对象，动态数组需用`delete[]`，故需自定义删除器：

```cpp
#include <memory>
#include <iostream>
using namespace std;

int main() {
    // 自定义删除器：用delete[]释放数组
    shared_ptr<int> sp(new int[5], [](int* p) { 
        delete[] p; 
        cout << "数组释放" << endl; 
    });
    sp.get()[0] = 10; // 访问数组元素
    // 离开作用域时，删除器被调用（输出“数组释放”）
    return 0;
}
```

##### **场景2：管理文件句柄（需`fclose`）**

```cpp
#include <cstdio>
#include <memory>
using namespace std;

int main() {
    // 打开文件，用lambda作为删除器（fclose释放）
    FILE* fp = fopen("test.txt", "w");
    shared_ptr<FILE> sp(fp, [](FILE* f) { 
        if (f) fclose(f); 
        cout << "文件关闭" << endl; 
    });
    fprintf(sp.get(), "hello"); // 使用文件句柄
    // 离开作用域时，删除器调用fclose（输出“文件关闭”）
    return 0;
}
```

##### **场景3：函数对象作为删除器**

```cpp
struct FileDeleter {
    void operator()(FILE* f) const {
        if (f) fclose(f);
        cout << "File closed by functor" << endl;
    }
};

int main() {
    FILE* fp = fopen("test.txt", "w");
    shared_ptr<FILE> sp(fp, FileDeleter()); // 函数对象作为删除器
    return 0;
}
```

#### **3. 注意事项**

- **删除器类型影响`shared_ptr`类型**：不同的删除器会导致`shared_ptr`类型不同，无法直接赋值（需显式转换，极少用）。
    
    ```cpp
    auto del1 = [](int* p) { delete p; };
    auto del2 = [](int* p) { delete p; }; // 即使逻辑相同，类型也不同（lambda无捕获时可能为函数指针，有捕获时为不同仿函数类型）
    shared_ptr<int> sp1(new int(10), del1);
    shared_ptr<int> sp2(new int(20), del2);
    // sp1 = sp2; // 编译报错：删除器类型不同
    ```
    
- **无法通过`make_shared`指定删除器**：`make_shared`仅支持默认删除器，需自定义删除器时必须用`shared_ptr`构造函数。
    
- **删除器调用时机**：当`shared_ptr`引用计数归零且所有`weak_ptr`过期后，删除器被调用（控制块内存延迟释放，见前文“内存释放延迟”）。
    

### **三、`unique_ptr`的删除器**

`unique_ptr`的删除器是**模板参数的一部分**（编译时确定），因此其类型包含删除器类型。这使得`unique_ptr`的删除器更高效（无类型擦除开销），但也意味着不同的删除器会导致不同的`unique_ptr`类型。

#### **1. 语法格式**

```cpp
template <class T, class Deleter = default_delete<T>>
class unique_ptr; // 单个对象版本

template <class T, class Deleter = default_delete<T[]>>
class unique_ptr<T[], Deleter>; // 数组版本（默认用delete[]）
```

- **`Deleter`**：模板参数，指定删除器类型（默认`std::default_delete`，对单个对象用`delete`，数组用`delete[]`）。
    

#### **2. 使用示例**

##### **场景1：自定义删除器（单个对象）**

```cpp
#include <memory>
#include <iostream>
using namespace std;

struct CustomDeleter {
    void operator()(int* p) const {
        delete p;
        cout << "Custom deleter: int released" << endl;
    }
};

int main() {
    // 用自定义删除器构造unique_ptr
    unique_ptr<int, CustomDeleter> up(new int(10), CustomDeleter());
    // 或简化为lambda（需显式指定删除器类型）
    unique_ptr<int, void(*)(int*)> up2(new int(20), [](int* p) { 
        delete p; 
        cout << "Lambda deleter: int released" << endl; 
    });
    return 0; // 离开作用域时，删除器依次调用
}
```

##### **场景2：数组版本（`unique_ptr<T[]>`）**

`unique_ptr<T[]>`默认用`delete[]`，也可自定义删除器：

```cpp
int main() {
    // 数组版本，默认删除器（delete[]）
    unique_ptr<int[]> arr_up(new int[3]);
    arr_up[0] = 1;

    // 自定义删除器（数组）
    unique_ptr<int[], void(*)(int*)> arr_up2(new int[3], [](int* p) {
        delete[] p;
        cout << "Array deleted" << endl;
    });
    return 0;
}
```

##### **场景3：lambda删除器（无捕获时优化为函数指针）**

若lambda无捕获，可隐式转换为函数指针，简化类型：

```cpp
unique_ptr<int, void(*)(int*)> up(new int(10), [](int* p) { delete p; }); 
```

#### **3. 注意事项**

- **删除器类型影响`unique_ptr`类型**：不同类型的删除器会导致`unique_ptr`无法赋值或移动（除非删除器类型兼容）。
    
    ```cpp
    auto del1 = [](int* p) { delete p; };
    using UPtr1 = unique_ptr<int, decltype(del1)>;
    UPtr1 up1(new int(10), del1);
    
    auto del2 = [](int* p) { delete p; };
    using UPtr2 = unique_ptr<int, decltype(del2)>;
    UPtr2 up2(new int(20), del2);
    // up1 = move(up2); // 编译报错：UPtr1和UPtr2类型不同
    ```
    
- **移动时删除器转移**：`unique_ptr`移动后，原指针失效，删除器被转移给新指针。
    
- **`std::default_delete`**：默认删除器，对`T`用`delete`，对`T[]`用`delete[]`，可显式指定：
    
    ```cpp
    unique_ptr<int, default_delete<int>> up(new int(10)); // 等价于默认unique_ptr<int>
    ```
    

### **四、删除器对比（`shared_ptr` vs `unique_ptr`）**

|**对比维度**|`shared_ptr` 删除器|`unique_ptr` 删除器|
|:--|:--|:--|
|**类型位置**|构造时指定，非模板参数（类型擦除）|模板参数（编译时确定）|
|**性能**|轻微开销（类型擦除）|无额外开销（编译时确定）|
|**灵活性**|可动态更换删除器（但极少见）|不可更换，移动时转移|
|**与`make_shared`兼容**|不兼容（需显式`new`构造）|不兼容（需显式`new`构造）|
|**适用场景**|多模块共享资源，需灵活指定删除器|独占资源，追求极致性能，删除器固定|

### **五、最佳实践**

1. **优先用lambda作为删除器**：简洁且支持捕获（如需要访问外部资源），无捕获时可优化为函数指针。
    
2. **`shared_ptr`删除器**：用于多模块共享非内存资源（如文件、网络句柄），注意`make_shared`无法指定删除器。
    
3. **`unique_ptr`删除器**：用于独占资源，利用模板参数固定删除器类型以提升性能（如`unique_ptr<FILE, decltype(file_deleter)*>`）。
    
4. **避免资源泄漏**：确保删除器能正确处理`nullptr`（如`if (p) delete p`）。
    
5. **数组管理**：`unique_ptr<T[]>`默认用`delete[]`，`shared_ptr`需显式指定`delete[]`删除器。
    

### **六、总结**

删除器是智能指针管理**非内存资源**的核心机制，通过自定义资源释放逻辑，扩展了智能指针的应用场景。`shared_ptr`的删除器灵活但有一定开销，`unique_ptr`的删除器高效但类型固定。实际开发中，应根据资源类型（共享/独占）和性能需求选择合适的智能指针及删除器，优先用lambda简化代码，确保资源安全释放。

**核心记忆点**：`shared_ptr`删器构造时定，类型擦除有开销；`unique_ptr`删器模板参，性能优先类型固；非内存资源需删器，lambda最简又高效！

# 对象优化三原则
#### **核心思想**

这三条规则围绕**减少对象拷贝开销**、**利用临时对象右值特性**和**配合编译器优化（RVO/NRVO）** 展开，目标是避免不必要的深拷贝，提升程序性能。

### **一、原则1：函数参数传递——优先按引用传递，避免按值传递**

#### **1. 核心原理**

- **按值传递**：实参对象会被**拷贝**到形参（调用拷贝构造函数），若对象较大（如含动态内存的`BigData`），拷贝开销极高。
    
- **按引用传递**：仅传递对象地址（4/8字节），无拷贝开销；用`const T&`可同时避免修改实参，且能绑定临时对象（右值）。
    

#### **2. 对比示例**

```cpp
class BigData { // 假设含1MB动态内存的大对象
public:
    BigData() { data = new int[1024*1024]; } // 构造开销大
    BigData(const BigData& other) { /* 深拷贝1MB数据，耗时 */ } // 拷贝构造开销大
    ~BigData() { delete[] data; }
private:
    int* data;
};

// 按值传递：每次调用拷贝1MB数据，严重性能损耗
void processByValue(BigData obj) { /* 使用obj */ } 

// 按const引用传递：无拷贝，仅传地址
void processByConstRef(const BigData& obj) { /* 使用obj */ } 

int main() {
    BigData data;
    processByValue(data);   // 拷贝构造1次（实参→形参）
    processByConstRef(data); // 无拷贝，直接传地址
    processByConstRef(BigData()); // 临时对象（右值）绑定到const引用，无拷贝（生命周期延长）
    return 0;
}
```

#### **3. 注意事项**

- **优先用`const T&`**：避免意外修改实参，且兼容临时对象（右值）。
    
- **非const引用（`T&`）**：仅当需要修改实参时使用，但不能绑定临时对象（如`func(BigData())`会编译报错）。
    
- **小对象例外**：对`int`、`Point`等小对象（拷贝开销可忽略），按值传递更简洁（但需权衡可读性）。
    

### **二、原则2：函数返回对象——优先返回临时对象，而非具名对象**

#### **1. 核心原理**

- **返回临时对象（匿名对象）**：如`return Point(x, y);`，属于**纯右值**，编译器优先触发**RVO（返回值优化）**，直接在调用方内存构造对象，无临时对象生成和拷贝。
    
- **返回具名对象**：如`return temp;`（`temp`是函数内定义的变量），触发**NRVO（具名返回值优化）**，但NRVO是**可选优化**（编译器可能不执行），若未优化则需拷贝/移动具名对象。
    

#### **2. 对比示例**

```cpp
class Point {
public:
    Point(int x=0, int y=0) : x(x), y(y) 
    { cout << "构造\n"; }
    Point(const Point& other) : x(other.x), y(other.y) 
    { cout << "拷贝构造\n"; }
    Point(Point&& other) noexcept : x(other.x), y(other.y) 
    { cout << "移动构造\n"; }
private:
    int x, y;
};

// 返回临时对象（纯右值）：优先触发RVO（C++17后强制优化，无拷贝/移动）
Point createTempPoint(int x, int y) {
    return Point(x, y); // RVO：直接在调用方构造，输出1次“构造”
}

// 返回具名对象：依赖NRVO（可能优化，也可能不优化）
Point createNamedPoint(int x, int y) {
    Point temp(x, y); // 具名对象
    return temp; 
    // 若NRVO生效：同RVO（1次构造）；若未生效：1次构造+1次移动/拷贝
}

int main() {
    Point p1 = createTempPoint(1, 2);  
    // RVO生效：仅1次构造（无临时对象）
    Point p2 = createNamedPoint(3, 4);  
    // 可能1次构造（NRVO），或1次构造+1次移动（未优化）
    return 0;
}
```

#### **3. 关键结论**

- **优先返回临时对象**：`return Point(x,y);` 比 `return temp;` 更易触发RVO，优化更可靠。
    
- **C++17的强化**：对纯右值返回（如`return T(...)`），RVO成为**强制要求**（必须省略拷贝/移动），进一步保证性能。
    

### **三、原则3：接收返回值——优先按初始化方式，避免按赋值方式**

#### **1. 核心原理**

- **初始化方式**：`T obj = func();` 或 `T obj(func());`，直接触发RVO，在`obj`的内存位置构造对象，无临时对象。
    
- **赋值方式**：`T obj; obj = func();`，先默认构造`obj`（1次构造），再调用赋值运算符（1次赋值），多一次操作（若`T`无默认构造则编译报错）。
    

#### **2. 对比示例**

```cpp
Point createPoint(int x, int y) {
    return Point(x, y); // 返回临时对象（RVO优化）
}

int main() {
    // 初始化方式：直接构造，无临时对象（RVO生效）
    Point p1 = createPoint(1, 2); // 1次构造（RVO直接构造p1）
    
    // 赋值方式：先默认构造p2，再赋值（多1次操作）
    Point p2;          // 1次默认构造（若Point有默认构造）
    p2 = createPoint(3, 4); // 1次移动/拷贝赋值（临时对象→p2）
    
    // 更差：先定义空对象，再赋值（两次操作）
    Point p3;
    p3 = Point(5, 6); // 临时对象构造（1次）+ 赋值（1次）
    return 0;
}
```

#### **3. 注意事项**

- **初始化方式等价于直接构造**：`T obj = func();` 与 `T obj(func());` 效果相同，编译器均优先优化为直接构造。
    
- **避免“先定义后赋值”**：尤其对无默认构造函数的对象，赋值方式会编译报错（如`unique_ptr`无默认构造）。
    

### **四、三条规则协同优化示例**

结合三条规则，实现一个高效的对象创建与传递流程：

```cpp
class BigData { /* 大对象，含动态内存 */ };

// 规则2：返回临时对象（RVO优化）
BigData createBigData(int size) {
    return BigData(size); // 临时对象（纯右值），触发RVO
}

// 规则1：参数按const引用传递（无拷贝）
void processBigData(const BigData& data) { /* 处理数据 */ }

// 规则3：初始化方式接收返回值（RVO优化）
int main() {
    BigData data = createBigData(1024); 
    // 初始化方式接收（RVO直接构造data）
    processBigData(data); // 参数按const引用传递（无拷贝）
    return 0;
}
```

### **五、总结与最佳实践**

|**规则**|**核心操作**|**优化原理**|**反例（避免）**|
|:--|:--|:--|:--|
|参数传递优先引用|`void func(const T& obj)`|无拷贝，传地址；兼容临时对象|`void func(T obj)`（按值传递，拷贝开销）|
|返回优先临时对象|`return T(...);`（匿名对象）|RVO强制优化（C++17），直接构造调用方对象|`return temp;`（具名对象，依赖NRVO）|
|接收优先初始化方式|`T obj = func();` 或 `T obj(func())`|直接构造，无默认构造+赋值两步操作|`T obj; obj = func();`（先构造后赋值）|

**核心记忆点**：

- 引用传参省拷贝，临时对象返回靠RVO，初始化接收免赋值；
    
- 三条规则协同减少对象拷贝，配合移动语义和编译器优化，最大化性能；
    
- 代码可读性优先，但性能敏感场景（如大对象、高频调用）严格遵循此原则。
    

#  对象方法与临时对象

#### **一、对象使用过程中调用的方法**

对象调用方法（成员函数）时，需注意**临时对象作为调用者**或**被调用对象**的场景，核心是理解`this`指针的指向和临时对象的生命周期。

##### **1. 普通对象调用方法**

非临时对象调用成员函数时，`this`指针指向对象本身，行为直观：

```cpp
class MyClass {
public:
    void print() const { cout << "Object: " << this << endl; } // const成员函数
};

MyClass obj;
obj.print(); // this指向obj的地址（非临时对象）
```

##### **2. 临时对象调用方法**

临时对象（匿名对象）也可调用成员函数，但需注意：

- 临时对象的生命周期通常为**完整表达式结束**（除非绑定到`const`引用延长生命周期）；
    
- 若成员函数返回临时对象，可能引发链式调用的临时对象管理问题。
    

**示例**：

```cpp
class MyClass {
public:
    MyClass(int x) : data(x) {}
    MyClass add(const MyClass& other) const { 
        return MyClass(data + other.data); // 返回临时对象
    }
    void print() const { cout << data << endl; }
private:
    int data;
};

// 临时对象调用方法
MyClass().print(); // 输出：随机值（未初始化？不，这里构造函数传参了？哦，上面构造函数是int x，所以MyClass()会报错！修正：
// 正确示例：MyClass(10).print(); // 输出10（临时对象调用print，表达式结束后销毁）
(MyClass(10).add(MyClass(20))).print(); // 链式调用：临时对象相加后返回新临时对象，调用print后销毁
```

#### **二、临时对象的生成方式**

临时对象是**匿名对象**，生命周期短暂，主要用于中间计算或隐式转换。分为**显式生成**和**隐式生成**。

##### **1. 显式生成临时对象**

开发者主动创建匿名对象，语法明确：

- **直接构造**：`类名(构造参数)`（注意括号不能省略，区别于函数声明）；
    
- **类型转换**：通过`static_cast`显式转换为目标类型；
    
- **函数返回临时对象**：函数返回非引用类型时，本质是生成临时对象（可能被优化）。
    

**示例**：

```cpp
class Point {
public:
    Point(int x=0, int y=0) : x(x), y(y) {}
private:
    int x, y;
};

// 显式生成临时对象
Point p1 = Point(1, 2); // 直接构造临时对象并拷贝给p1（可能被优化）
Point p2 = static_cast<Point>(3); 
// 显式转换生成临时对象（假设Point有单参构造函数）

// 函数返回临时对象（可能被优化）
Point createPoint(int x, int y) {
    return Point(x, y); 
    // 返回临时对象（编译器可能优化为直接构造调用处的对象）
}
```

##### **2. 隐式生成临时对象**

编译器自动生成的临时对象，通常发生在**隐式转换**或**表达式求值**中：

- **隐式类型转换**：实参类型与目标参数类型不匹配时，生成临时对象转换；
    
- **表达式中间结果**：自定义类型的算术运算（`+`、`-`等）返回临时对象存储结果；
    
- **函数返回非引用类型**：即使开发者未显式写，编译器也会生成临时对象承载返回值。
    

**示例**：

```cpp
void func(Point p) {} // 参数为Point类型

int main() {
    // 隐式转换生成临时对象（int→Point，假设Point有单参构造函数）
    func(10); 
    // 等价于func(Point(10))，生成临时Point(10)传给func
    
    // 表达式中间结果生成临时对象
    Point p3 = Point(1, 2) + Point(3, 4); 
    // 假设operator+返回临时Point对象
    
    // 函数返回临时对象（隐式生成）
    Point p4 = createPoint(5, 6); 
    // createPoint返回临时对象，赋值给p4
    return 0;
}
```

#### **三、临时对象生成新对象时的优化：直接构造（避免临时对象）**

编译器会通过**拷贝省略（Copy Elision）** 优化，避免临时对象的生成和拷贝，直接将临时对象构造为目标对象。常见场景如下：

##### **1. 临时对象初始化新对象：`T obj = T(...)` → 直接构造**

当用一个临时对象初始化另一个对象时，编译器会跳过临时对象的生成，直接在目标对象的内存位置构造：

```cpp
Point p = Point(1, 2); // 优化后：直接在p的内存位置构造Point(1,2)，无临时对象
```

等价于 `Point p(1, 2);`（更高效）。

##### **2. 函数返回临时对象：`return T(...)` → 直接构造调用处对象（RVO/NRVO）**

- **RVO（返回值优化）**：返回匿名临时对象时，直接在调用方的接收对象内存位置构造；
    
- **NRVO（具名返回值优化）**：返回函数内具名对象时，同样优化为直接构造。
    

**示例**：

```cpp
Point createPoint(int x, int y) {
    return Point(x, y); // RVO：直接在调用处构造对象，无临时对象
}

Point createNamedPoint(int x, int y) {
    Point temp(x, y); // 具名对象
    return temp; // NRVO：优化为直接在调用处构造，无temp的拷贝
}

int main() {
    Point p1 = createPoint(1, 2); // RVO生效：直接构造p1
    Point p2 = createNamedPoint(3, 4); // NRVO生效：直接构造p2
    return 0;
}
```

**C++17规定**：对纯右值（如`return Point(x,y)`）的返回值优化成为强制要求（必须省略拷贝）。

##### **3. 临时对象参与表达式：`a = T(...)` → 直接构造目标对象**

当临时对象用于赋值或初始化时，编译器可能优化为直接构造目标对象：

```cpp
Point p;
p = Point(5, 6); // 优化前：生成临时对象→拷贝赋值给p；优化后：直接用(5,6)构造p的内容（或直接移动赋值）
```

#### **四、对象在函数调用过程中的优化**

函数调用涉及**参数传递**、**返回值处理**、**临时对象生成**，编译器通过多种优化减少临时对象和拷贝开销。

##### **1. 参数传递优化**

- **按值传递**：若函数参数是对象，实参可能是临时对象或具名对象。编译器优先尝试移动构造（若参数是右值），否则拷贝构造；
    
- **按引用传递**：优先用`const T&`（避免拷贝），尤其对大对象；
    
- **临时对象作为参数**：隐式转换生成的临时对象可直接传递给形参（可能被优化）。
    

**示例**：

```cpp
void func(Point p) {} // 按值传递

int main() {
    func(Point(1, 2)); // 临时对象作为参数：可能触发移动构造（若Point定义了移动构造函数）
    Point p(3, 4);
    func(p); // 具名对象作为参数：拷贝构造（除非用std::move转为右值）
    func(std::move(p)); // 显式转为右值：移动构造（p的资源被“窃取”）
}
```

##### **2. 返回值优化（RVO/NRVO）**

如前所述，函数返回对象时，编译器通过RVO/NRVO直接在调用方内存构造对象，避免临时对象的生成和拷贝。**这是最重要的优化之一**。

##### **3. 拷贝省略（Copy Elision）的其他场景**

C++标准允许编译器在以下情况省略拷贝/移动构造（视为“优化义务”，C++17后部分强制）：

- **初始化时拷贝省略**：`T x = T(T(...))`（多层临时对象嵌套）；
    
- **异常处理**：`throw T()`与`catch(T e)`之间的拷贝省略；
    
- **临时量实质化**：纯右值（如`42`、`Point(1,2)`）转换为临时对象时，可能直接构造目标对象（跳过临时对象生成）。
    

##### **4. 移动语义辅助优化**

若对象定义了**移动构造函数**（`T(T&&)`）和**移动赋值运算符**（`T& operator=(T&&)`），编译器会用移动代替拷贝（尤其对临时对象，因其为右值）：

```cpp
class BigData {
public:
    BigData(BigData&& other) noexcept { /* 窃取other的资源 */ } // 移动构造
};

BigData createBigData() {
    BigData tmp;
    return tmp; // NRVO优先；若无NRVO，触发移动构造（tmp为右值）
}
```

#### **五、关键注意事项**

1. **临时对象的生命周期**：默认在完整表达式结束时销毁（如`func(Point(1,2))`中，临时对象在`func`调用结束后销毁）；若绑定到`const`引用（`const Point& p = Point(1,2)`），生命周期延长至`p`的作用域结束。
    
2. **避免过度依赖优化**：编写代码时应优先保证正确性，而非依赖编译器优化（如显式用`std::move`转移资源）。
    
3. **显式生成临时对象的用途**：常用于一次性操作（如`Point(1,2).print()`），或作为函数参数/返回值的中间载体（但优先用优化后的写法）。
    

### **总结**

- **临时对象**：显式（`Point()`、`static_cast`）和隐式（隐式转换、表达式中间结果）生成，生命周期短暂；
    
- **优化核心**：编译器通过**拷贝省略（RVO/NRVO）** 避免临时对象，直接构造目标对象；
    
- **函数调用优化**：参数传递（移动优先）、返回值优化（RVO/NRVO）、移动语义辅助减少拷贝；
    
- **最佳实践**：用`make_shared`/`make_unique`避免显式`new`，优先按`const&`传参，利用移动语义管理大对象，信任编译器优化（但需理解其原理）。

# 绑定器和函数对象

#### **一、C++98 旧绑定器：`bind1st` 与 `bind2nd`**

`bind1st` 和 `bind2nd` 是 C++98 引入的**二元函数参数绑定器**，用于将二元函数对象（接受两个参数的可调用对象）的**第一个**或**第二个**参数固定为指定值，生成一个新的**一元函数对象**（只接受一个参数）。二者均定义在 `<functional>` 头文件中，现已被 C++11 的 `std::bind` 取代（因功能有限），但需理解其原理以兼容旧代码。

##### **1. 核心功能**

- **`bind1st(二元函数对象, 固定值)`**：将二元函数的**第一个参数**绑定为 `固定值`，新函数对象仅接受**第二个参数**。
    
- **`bind2nd(二元函数对象, 固定值)`**：将二元函数的**第二个参数**绑定为 `固定值`，新函数对象仅接受**第一个参数**。
    

##### **2. 底层实现原理**

`bind1st` 和 `bind2nd` 通过**继承二元函数基类**（如 `std::binary_function`）并**重写 `operator()`** 实现参数绑定。以 `bind2nd` 为例：

```cpp
// 伪代码：bind2nd 的简化实现
template <class Fn, class T> 
struct binder2nd : public unary_function<typename Fn::first_argument_type, typename Fn::result_type> {
    Fn fn;          // 原二元函数对象
    T value;        // 绑定的第二个参数值
    binder2nd(Fn f, const T& v) : fn(f), value(v) {}
    // 新的一元函数对象：仅接受第一个参数 a，调用原函数时传入 (a, value)
    typename Fn::result_type operator()(const typename Fn::first_argument_type& a) const {
        return fn(a, value); 
    }
};

// bind2nd 工厂函数
template <class Fn, class T> 
binder2nd<Fn, T> bind2nd(const Fn& fn, const T& value) {
    return binder2nd<Fn, T>(fn, value);
}
```

- **`binary_function`**：C++98 基类模板，定义二元函数的参数类型和返回值类型（`first_argument_type`、`second_argument_type`、`result_type`），便于统一接口。
    
- **`unary_function`**：同理，定义一元函数的参数和返回值类型。
    

##### **3. 使用示例**

```cpp
#include <functional> // for bind1st, bind2nd, less<int>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {3, 1, 4, 1, 5, 9};
    
    // 需求：统计 v 中 >5 的元素个数（用 count_if + 绑定器）
    // 二元函数：greater<int>()（a > b），需绑定第二个参数 b=5（即 a > 5）
    int cnt = count_if(v.begin(), v.end(), bind2nd(greater<int>(), 5)); 
    // 等价于：count_if(v.begin(), v.end(), [](int x) { return x > 5; });
    // 结果：cnt=2（元素9）
    
    // 需求：统计 v 中 <3 的元素个数（绑定第一个参数 a=3，即 3 > b → b < 3）
    cnt = count_if(v.begin(), v.end(), bind1st(less<int>(), 3)); 
    // 等价于：count_if(v.begin(), v.end(), [](int x) { return 3 < x; }); → 统计 >3 的元素？注意：less<int>() 是 a < b，bind1st 绑定 a=3，即 3 < b → b > 3
    // 正确用法：统计 <3 应绑定 greater<int>() 的第二个参数？或调整逻辑
    // 修正：用 bind2nd(less<int>(), 3) → a < 3（正确统计 <3 的元素：1,1 → cnt=2）
    return 0;
}
```

##### **4. 局限性**

- **仅支持二元函数**：无法绑定三元及以上函数；
    
- **固定参数位置**：只能绑定第一个或第二个参数，不能调整顺序（如交换参数）；
    
- **不支持成员函数绑定**：无法直接绑定类的成员函数；
    
- **已被弃用**：C++11 起推荐用 `std::bind` 替代（更通用、灵活）。
    

#### **二、C++11 新绑定器：`std::bind`（源自 Boost.Bind）**

`std::bind` 是 C++11 从 Boost 库引入的**通用绑定器**，取代了 `bind1st`/`bind2nd`。它可将**任意函数/函数对象/成员函数**的部分参数绑定（或调整顺序），生成一个**新的可调用对象**（函数对象）。

##### **1. 核心功能**

- **绑定参数**：固定函数的部分参数（用具体值），剩余参数用**占位符**（`_1`, `_2`, ...）表示；
    
- **调整参数顺序**：通过占位符重新排列参数；
    
- **绑定成员函数**：需传入对象指针/引用作为第一个参数；
    
- **绑定函数对象**：调整其内部参数。
    

##### **2. 底层实现原理**

`std::bind` 通过**类型擦除**（Type Erasure）生成一个匿名函数对象（仿函数），内部存储原可调用对象和绑定的参数（值或占位符）。调用时，根据占位符替换为实际传入的参数，再调用原函数。

##### **3. 使用示例（对比 `bind1st`/`bind2nd`）**

```cpp
#include <functional> // for bind, placeholders
#include <vector>
#include <algorithm>
using namespace std;
using namespace placeholders; // 占位符 _1, _2...

int main() {
    vector<int> v = {3, 1, 4, 1, 5, 9};
    
    // 替代 bind2nd(greater<int>(), 5)：绑定 greater<int>() 的第二个参数为 5，第一个参数用 _1
    auto greater_than_5 = bind(greater<int>(), _1, 5); 
    int cnt = count_if(v.begin(), v.end(), greater_than_5); // 统计 >5 的元素（9）→ cnt=1
    
    // 替代 bind1st(less<int>(), 3)：绑定 less<int>() 的第一个参数为 3，第二个参数用 _1（即 3 < _1 → _1 > 3）
    auto greater_than_3 = bind(less<int>(), 3, _1); 
    cnt = count_if(v.begin(), v.end(), greater_than_3); // 统计 >3 的元素（4,5,9）→ cnt=3
    
    // 调整参数顺序：原函数 sub(int a, int b) { return a - b; }，生成新函数 sub_rev(b, a) = b - a
    auto sub = [](int a, int b) { return a - b; };
    auto sub_rev = bind(sub, _2, _1); // _2 是第二个参数，_1 是第一个参数
    cout << sub_rev(5, 8) << endl; // 8 - 5 = 3（原 sub(5,8)= -3，反转后正确）
    return 0;
}
```

#### **三、`std::function`：通用函数对象封装器（源自 Boost.Function）**

`std::function` 是 C++11 从 Boost 引入的**多态函数封装器**，可存储、复制和调用**任何可调用对象**（函数、函数对象、lambda、成员函数等），提供统一的调用接口。

##### **1. 核心作用**

- **统一类型**：不同类型但签名相同的可调用对象（如函数指针、lambda、函数对象）可赋值给同一个 `std::function` 变量；
    
- **延迟调用**：存储可调用对象，在需要时调用；
    
- **作为回调接口**：函数参数或类成员，接受任意可调用对象。
    

##### **2. 语法与示例**

```cpp
#include <functional>
#include <iostream>
using namespace std;

int add(int a, int b) { return a + b; }

struct Multiply {
    int operator()(int a, int b) const { return a * b; }
};

int main() {
    // 存储普通函数
    function<int(int, int)> f1 = add;
    cout << f1(2, 3) << endl; // 5
    
    // 存储函数对象
    function<int(int, int)> f2 = Multiply();
    cout << f2(2, 3) << endl; // 6
    
    // 存储 lambda 表达式
    function<int(int, int)> f3 = [](int a, int b) { return a - b; };
    cout << f3(5, 2) << endl; // 3
    
    // 存储成员函数（需绑定对象）
    struct Divider {
        int divide(int a, int b) { return a / b; }
    };
    Divider d;
    function<int(int, int)> f4 = bind(&Divider::divide, &d, _1, _2);
    cout << f4(10, 2) << endl; // 5
    return 0;
}
```

#### **四、Lambda 表达式的底层：函数对象（仿函数）机制**

C++11 引入的 **lambda 表达式**并非全新语法，其底层通过**编译器自动生成匿名函数对象（仿函数）** 实现，即 lambda 本质是“语法糖”，编译后等价于一个重载了 `operator()` 的类实例。

##### **1. 转换规则**

- **lambda 体** → 函数对象的 `operator()` 实现；
    
- **捕获列表** → 函数对象的成员变量（值捕获拷贝值，引用捕获存引用）；
    
- **参数列表** → `operator()` 的参数列表；
    
- **返回类型** → `operator()` 的返回类型（可自动推导）。
    

##### **2. 示例：lambda 与函数对象的等价性**

```cpp
// lambda 表达式
auto lambda = [](int x, int y) -> int { return x + y; };

// 编译器自动生成的等价函数对象
struct AnonymousFunctor {
    int operator()(int x, int y) const { // 参数列表与 lambda 一致
        return x + y; // 函数体与 lambda 一致
    }
};
AnonymousFunctor lambda; // 匿名对象，与 lambda 变量等价
```

##### **3. 捕获列表的底层实现**

- **值捕获 `[=var]`**：函数对象构造函数中拷贝 `var` 的值，存储为成员变量；
    
- **引用捕获 `[&var]`**：函数对象存储 `var` 的引用（需注意生命周期）；
    
- **隐式捕获 `[=]`/`[&]`**：自动捕获所有使用的外部变量（值/引用）。
    

```cpp
int a = 10, b = 20;
// lambda 表达式（值捕获 a，引用捕获 b）
auto lambda = [a, &b](int x) { return a + b + x; };

// 等价函数对象
struct AnonymousFunctor {
    int a_;       // 值捕获：拷贝 a
    int& b_ref_;  // 引用捕获：存储 b 的引用
    // 构造函数：初始化捕获的变量
    AnonymousFunctor(int a, int& b) : a_(a), b_ref_(b) {}
    // operator()：lambda 体
    int operator()(int x) const { return a_ + b_ref_ + x; }
};
AnonymousFunctor lambda(a, b); // 匿名对象，与 lambda 变量等价
```

#### **五、总结：绑定器、函数对象与 lambda 的关系**

|**组件**|**核心作用**|**底层实现**|**C++ 版本**|**现状**|
|:--|:--|:--|:--|:--|
|`bind1st`/`bind2nd`|绑定二元函数的第1/2个参数为固定值|继承 `unary_function` 的重载 `operator()`|C++98|已弃用（用 `std::bind` 替代）|
|`std::bind`|通用参数绑定（任意函数/对象，调整顺序）|类型擦除的匿名函数对象|C++11|推荐（灵活强大）|
|`std::function`|封装任意可调用对象（统一接口）|类型擦除的多态函数包装器|C++11|广泛使用（回调、延迟调用）|
|Lambda 表达式|简洁定义匿名函数对象|编译器自动生成匿名函数对象（仿函数）|C++11|首选（语法简洁，底层同函数对象）|

**核心结论**：

- `bind1st`/`bind2nd` 是 C++98 的有限绑定器，现已被 `std::bind` 取代；
    
- `std::bind` 和 `std::function` 源自 Boost，提供通用参数绑定和函数封装；
    
- Lambda 表达式底层是函数对象，语法糖简化函数对象定义，与 `std::function` 配合使用可存储和传递；
    
- 三者共同构成 C++ 函数式编程基础，核心都是**通过函数对象（仿函数）实现灵活的可调用逻辑**。

#  lambda表达式

#### **一、Lambda 表达式的核心价值**

Lambda 表达式是 C++11 引入的**匿名函数对象**（闭包），用于**简洁定义短小的一次性函数逻辑**，避免显式定义函数对象（仿函数）。其核心价值：

- **语法简洁**：无需定义类/结构体，内联实现函数逻辑；
    
- **上下文捕获**：通过捕获列表访问外部变量，实现闭包功能；
    
- **适配性强**：可直接作为函数参数（如 STL 算法、回调函数），或存储于 `std::function`。
    

#### **二、基本语法结构**

```cpp
[capture-list](parameters) mutable noexcept -> return-type { body }  
```

- **`capture-list`（捕获列表）**：指定外部变量的访问方式（值/引用/隐式捕获），**必选**（可为空 `[]`）；
    
- **`parameters`（参数列表）**：与普通函数参数类似，可省略（无参时 `()` 可省）；
    
- **`mutable`（可选）**：允许修改值捕获的变量（默认 `const` 成员函数，不可改）；
    
- **`noexcept`（可选，C++17）**：声明 lambda 不抛出异常；
    
- **`-> return-type`（可选）**：显式指定返回类型（C++11 需显式，C++14 起可自动推导）；
    
- **`body`（函数体）**：实现具体逻辑。
    

#### **三、捕获列表（Capture List）：核心机制**

捕获列表定义 lambda 如何访问**定义时所在作用域的外部变量**，是 lambda 区别于普通函数的关键。

##### **1. 值捕获（`[var]`）**

- **机制**：将外部变量 `var` 的**当前值拷贝**到 lambda 内部（作为成员变量），lambda 内修改拷贝不影响原变量。
    
- **特点**：拷贝发生在 lambda **定义时**（而非调用时）。
    
- **示例**：
    
    ```cpp
    int x = 10;
    auto lambda = [x](int y) { return x + y; }; // 值捕获 x=10（拷贝）
    x = 20; // 原变量修改不影响 lambda 内的 x
    cout << lambda(5) << endl; // 10+5=15（而非 20+5）
    ```
    

##### **2. 引用捕获（`[&var]`）**

- **机制**：存储外部变量 `var` 的**引用**，lambda 内修改会影响原变量；需确保原变量生命周期**长于 lambda**。
    
- **特点**：无拷贝开销，但存在悬垂引用风险（原变量提前销毁）。
    
- **示例**：
    
    ```cpp
    int x = 10;
    auto lambda = [&x](int y) { x += y; }; // 引用捕获 x
    lambda(5); // x 变为 15
    cout << x << endl; // 15（原变量被修改）
    ```
    

##### **3. 隐式捕获（`[=]` 或 `[&]`）**

- **`[=]`（隐式值捕获）**：自动捕获 lambda 体中**所有使用的外部变量**（值拷贝）；
    
- **`[&]`（隐式引用捕获）**：自动捕获 lambda 体中**所有使用的外部变量**（引用）。
    
- **注意**：隐式捕获可能导致意外捕获无关变量，建议显式指定（如 `[x, &y]`）。
    
- **示例**：
    
    ```cpp
    int a = 1, b = 2;
    auto lambda1 = [=]() { return a + b; }; // 值捕获 a、b（=1+2=3）
    auto lambda2 = [&]() { a *= 2; b *= 3; }; // 引用捕获 a、b（修改原变量）
    ```
    

##### **4. 混合捕获**

- 显式指定部分变量，其余用隐式捕获：
    
    - `[=, &x]`：隐式值捕获所有变量，但 `x` 用引用捕获；
        
    - `[&, x]`：隐式引用捕获所有变量，但 `x` 用值捕获。
        
- **示例**：
    
    ```cpp
    int a = 1, b = 2;
    auto lambda = [=, &b]() { b += a; }; // a 值捕获（1），b 引用捕获（修改原变量）
    lambda(); 
    cout << b << endl; // 3（2+1）
    ```
    

##### **5. 特殊捕获：`this` 指针（类成员函数中）**

- 在类成员函数中，lambda 可通过 `[this]` 捕获当前对象的 `this` 指针，访问成员变量/函数（等价于 `[=]` 隐式捕获 `this`，但不推荐隐式捕获 `this`）。
    
- **风险**：若 lambda 的生命周期超过对象（如存储于全局容器），`this` 会成为悬垂指针。
    
- **示例**：
    
    ```cpp
    class MyClass {
        int x = 10;
        void func() {
            auto lambda = [this]() { x += 5; }; // 捕获 this，访问成员变量 x
            lambda(); 
            cout << x << endl; // 15
        }
    };
    ```
    

##### **6. C++14 扩展：初始化捕获（移动捕获）**

- 允许用**表达式初始化捕获变量**（如移动语义捕获临时对象），语法 `[var = expr]`。
    
- **场景**：捕获只能移动的对象（如 `std::unique_ptr`）。
    
- **示例**：
    
    ```cpp
    auto ptr = make_unique<int>(10);
    auto lambda = [p = move(ptr)]() { cout << *p << endl; }; // 移动捕获 ptr（原 ptr 失效）
    lambda(); // 输出 10
    ```
    

#### **四、参数列表与返回类型**

##### **1. 参数列表**

- 与普通函数参数类似，支持任意类型（包括 `auto`，C++14 泛型 lambda）；
    
- 无参数时可省略 `()`（仅当无捕获列表或捕获列表非空但无参数时？不，`[](){}` 可简写为 `[]{}`）。
    
- **示例**：
    
    ```cpp
    auto add = [](int a, int b) { return a + b; }; // 显式参数
    auto hello = [] { cout << "Hello" << endl; }; // 无参数（省略 ()）
    ```
    

##### **2. 返回类型**

- **C++11**：必须显式指定（若函数体仅含 `return` 语句，可省略，编译器自动推导）；
    
- **C++14 起**：支持自动推导返回类型（无需 `-> return-type`），复杂逻辑（多返回路径）仍需显式指定。
    
- **示例**：
    
    ```cpp
    // C++11：显式返回类型
    auto add = [](int a, int b) -> int { return a + b; }; 
    // C++14：自动推导返回类型
    auto multiply = [](int a, int b) { return a * b; }; 
    // 多返回路径：需显式指定
    auto max = [](int a, int b) -> int { 
        if (a > b) return a; 
        else return b; 
    };
    ```
    

#### **五、关键特性**

##### **1. `mutable` 关键字**

- **作用**：允许修改**值捕获**的变量（默认 lambda 的 `operator()` 是 `const` 成员函数，值捕获的变量为 `const`）。
    
- **注意**：仅修改拷贝，不影响原变量。
    
- **示例**：
    
    ```cpp
    int x = 10;
    auto lambda = [x]() mutable { x += 5; cout << x << endl; }; // 值捕获 x，mutable 允许修改拷贝
    lambda(); // 输出 15（拷贝的 x 变为 15）
    cout << x << endl; // 10（原变量不变）
    ```
    

##### **2. `constexpr` Lambda（C++17）**

- 若 lambda 满足 `constexpr` 函数要求（无动态内存分配、无虚函数等），可声明为 `constexpr`，在编译期执行。
    
- **示例**：
    
    ```cpp
    constexpr auto square = [](int x) { return x * x; };
    static_assert(square(5) == 25); // 编译期计算
    ```
    

##### **3. 泛型 Lambda（C++14）**

- 参数列表用 `auto` 声明，实现泛型逻辑（等价于模板函数）。
    
- **示例**：
    
    ```cpp
    auto add = [](auto a, auto b) { return a + b; }; // 泛型 lambda，支持 int/double 等
    cout << add(1, 2) << endl; // 3（int）
    cout << add(1.5, 2.5) << endl; // 4.0（double）
    ```
    

##### **4. 作为函数指针转换（无捕获时）**

- 无捕获列表的 lambda 可隐式转换为**函数指针**（类型 `Ret(*)(Args...)`）。
    
- **示例**：
    
    ```cpp
    void func(int (*f)(int)) { cout << f(5) << endl; }
    int main() {
        auto lambda = [](int x) { return x * 2; }; // 无捕获
        func(lambda); // 转换为函数指针，输出 10
    }
    ```
    

#### **六、使用场景**

##### **1. STL 算法（最常用）**

- 作为谓词（如 `find_if`、`count_if`）或操作函数（如 `for_each`）。
    
- **示例**：
    
    ```cpp
    vector<int> v = {1, 2, 3, 4, 5};
    // 查找第一个偶数
    auto it = find_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; }); 
    // 对每个元素平方
    for_each(v.begin(), v.end(), [](int& x) { x *= x; }); 
    ```
    

##### **2. 回调函数**

- 作为事件回调（如 GUI 按钮点击、异步任务完成通知），简化接口。
    
- **示例**：
    
    ```cpp
    using Callback = function<void(int)>;
    void asyncTask(Callback cb) { 
        int result = 42; 
        cb(result); // 任务完成后调用回调
    }
    int main() {
        asyncTask([](int res) { cout << "Result: " << res << endl; }); // 输出 Result: 42
    }
    ```
    

##### **3. 局部函数定义**

- 替代局部函数对象，简化短小逻辑（如数学计算、条件判断）。
    
- **示例**：
    
    ```cpp
    double calculate(double x) {
        auto square = [](double a) { return a * a; };
        return square(x) + 2 * x + 1; // (x+1)^2
    }
    ```
    

##### **4. 延迟执行**

- 存储 lambda 于 `std::function`，在后续需要时调用（如任务队列）。
    
- **示例**：
    
    ```cpp
    queue<function<void()>> tasks;
    tasks.push([] { cout << "Task 1" << endl; });
    tasks.push([] { cout << "Task 2" << endl; });
    while (!tasks.empty()) { tasks.front()(); tasks.pop(); } // 依次执行任务
    ```
    

#### **七、注意事项与陷阱**

##### **1. 引用捕获的生命周期风险**

- 若 lambda 存储于全局容器，而引用捕获的局部变量已销毁，调用时会导致**悬垂引用**（未定义行为）。
    
- **避坑**：优先用值捕获（或移动捕获 C++14），或确保原变量生命周期足够长。
    

##### **2. 值捕获的拷贝开销**

- 对大对象（如 `std::string`、自定义大对象）值捕获会触发拷贝，影响性能。
    
- **优化**：用引用捕获（注意生命周期）或移动捕获（C++14 `std::move`）。
    

##### **3. 捕获 `this` 的陷阱**

- 类成员函数中的 lambda 隐式捕获 `this` 时，若 lambda 被传递到类外（如作为回调），可能访问已销毁的对象。
    
- **避坑**：显式用 `[this]` 并谨慎管理 lambda 生命周期，或捕获成员变量副本（C++14 初始化捕获：`[x = this->x]`）。
    

##### **4. Lambda 类型唯一性**

- 每个 lambda 表达式有**唯一的匿名类型**（即使语法完全相同），因此不能直接赋值或比较，需通过 `std::function` 或模板统一类型。
    
- **示例**：
    
    ```cpp
    auto lambda1 = [](int x) { return x; };
    auto lambda2 = [](int x) { return x; };
    // lambda1 = lambda2; // 编译报错：类型不同
    function<int(int)> f1 = lambda1, f2 = lambda2; // 正确：统一为 function 类型
    ```
    

#### **八、C++ 标准演进中的 Lambda 扩展**

|**C++ 版本**|**扩展特性**|**说明**|
|:--|:--|:--|
|C++11|基础语法（捕获列表、参数、返回类型）|支持值/引用/隐式捕获，`mutable`，`noexcept`（C++11 无，C++17 加）|
|C++14|泛型 lambda（`auto` 参数）、初始化捕获（移动捕获）|支持 `[](auto x){}` 和 `[p = move(ptr)]`|
|C++17|`constexpr` lambda、`noexcept` 说明符、捕获 `*this`（C++17 后）|编译期执行、异常说明、按值捕获当前对象副本|
|C++20|模板 lambda（`template<class T>`）、`concept` 约束|显式模板参数、概念约束（如 `requires`）|

#### **九、总结**

Lambda 表达式是 C++ 函数式编程的核心工具，通过**捕获列表**实现闭包，以简洁语法定义一次性函数逻辑。关键要点：

- **捕获列表**决定变量访问方式（值/引用/隐式），注意生命周期和性能；
    
- **`mutable`** 允许修改值捕获的拷贝，**泛型 lambda**（`auto` 参数）实现通用逻辑；
    
- **适用场景**：STL 算法、回调、局部函数、延迟执行；
    
- **避坑**：警惕悬垂引用、大对象值捕获开销、`this` 指针生命周期。
    

**必记**：用 lambda 简化 STL 算法谓词，无捕获时转函数指针，复杂逻辑用 `std::function` 存储，优先值捕获（或移动捕获 C++14）保安全！



# 模板特例化与实参推演

#### **一、模板特例化（Template Specialization）**

模板特例化是为**特定类型或参数组合**提供定制化实现的机制，分为**完全特例化**（Full Specialization）和**部分特例化**（Partial Specialization）。其核心作用是：当通用模板对某些类型不适用时，通过特例化优化性能或修复行为。

### **二、完全特例化（Full Specialization）**

**定义**：为模板的**所有参数**指定具体类型，生成一个独立的、专用的模板实现。

**适用范围**：函数模板和类模板均支持完全特例化。

#### **1. 函数模板的完全特例化**

语法：显式为所有模板参数指定类型，提供专用函数实现。

**示例**：通用模板计算两数之和，特例化 `char*` 类型（字符串拼接）

```cpp
#include <cstring>
#include <iostream>
using namespace std;

// 通用模板（求和）
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 完全特例化：针对 char* 类型（字符串拼接）
template <>
char* add<char*>(char* a, char* b) {
    char* result = new char[strlen(a) + strlen(b) + 1];
    strcpy(result, a);
    strcat(result, b);
    return result;
}

int main() {
    int x = add(1, 2);          // 调用通用模板：3
    char* s1 = add("Hello, ", "World!"); // 调用完全特例化："Hello, World!"
    cout << s1 << endl;         // 输出：Hello, World!
    delete[] s1;                // 手动释放内存（特例化中new的）
    return 0;
}
```

#### **2. 类模板的完全特例化**

语法：为类模板的所有参数指定类型，定义专用类。

**示例**：通用模板存储数组，特例化 `bool` 类型（用位压缩优化）

```cpp
#include <iostream>
#include <cstddef>
using namespace std;

// 通用类模板：存储任意类型数组
template <typename T, size_t N>
class Array {
private:
    T data[N];
public:
    void print() const {
        cout << "Generic Array: ";
        for (auto& elem : data) cout << elem << " ";
        cout << endl;
    }
};

// 完全特例化：针对 bool 类型（位压缩存储）
template <>
class Array<bool, 10> { // 固定大小10（仅为示例，实际可泛化）
private:
    unsigned char bits[2] = {0}; // 10位用2字节存储（8位/字节）
public:
    void set(size_t idx, bool val) {
        if (idx >= 10) return;
        if (val) bits[idx/8] |= (1 << (idx%8));
        else bits[idx/8] &= ~(1 << (idx%8));
    }
    void print() const {
        cout << "Specialized bool Array: ";
        for (size_t i=0; i<10; ++i) {
            cout << ((bits[i/8] >> (i%8)) & 1) << " ";
        }
        cout << endl;
    }
};

int main() {
    Array<int, 3> int_arr; // 通用模板实例化（需手动初始化元素，此处省略）
    int_arr.print();       // 输出：Generic Array: [元素值]

    Array<bool, 10> bool_arr; // 完全特例化版本
    bool_arr.set(2, true);
    bool_arr.set(5, true);
    bool_arr.print();       // 输出：Specialized bool Array: 0 0 1 0 0 1 0 0 0 0 
    return 0;
}
```

### **三、部分特例化（Partial Specialization）**

**定义**：为类模板的**部分参数**指定类型（剩余参数保持泛型），生成一个针对特定参数组合的专用类模板。

**适用范围**：**仅类模板支持**（函数模板无部分特例化，需用重载或SFINAE替代）。

#### **1. 类模板的部分特例化语法**

```cpp
template <typename T1, typename T2> // 通用模板
class MyClass { /* 通用实现 */ };

// 部分特例化：指定 T1 = int，T2 保持泛型
template <typename T2> 
class MyClass<int, T2> { /* 针对 T1=int 的实现 */ };

// 部分特例化：指定 T1 和 T2 均为指针类型
template <typename T1, typename T2>
class MyClass<T1*, T2*> { /* 针对指针类型的实现 */ };
```

#### **2. 示例：部分特例化实现类型萃取**

```cpp
#include <iostream>
using namespace std;

// 通用模板：判断是否为指针（默认 false）
template <typename T>
struct IsPointer {
    static constexpr bool value = false;
};

// 部分特例化：针对指针类型（T*），value=true
template <typename T>
struct IsPointer<T*> {
    static constexpr bool value = true;
};

int main() {
    cout << IsPointer<int>::value << endl;    // 0（false）
    cout << IsPointer<int*>::value << endl;   // 1（true）
    cout << IsPointer<double**>::value << endl; // 1（true，二级指针也是指针）
    return 0;
}
```

#### **3. 部分特例化的匹配规则**

- **最特化原则**：当多个特例化版本都能匹配时，编译器选择**参数限制最多**的版本（如 `T*` 比 `T` 更特化）。
    
- **优先级**：完全特例化 > 部分特例化 > 通用模板。
    

### **四、模板实参推演（Template Argument Deduction）**

**定义**：编译器根据**函数实参**或**类初始化值**自动推断模板参数类型的过程。

**核心作用**：简化代码书写，避免显式指定模板参数（如 `add<int>(1,2)` 可简写为 `add(1,2)`）。

#### **1. 函数模板的实参推演**

编译器通过函数实参的类型反推模板参数类型，需满足**实参类型与模板参数类型兼容**。

**示例1：基本推演**

```cpp
template <typename T>
T max(T a, T b) { return a > b ? a : b; }

int main() {
    max(1, 2);    // 实参 int，推演 T=int → 调用 max<int>(1,2)
    max(3.5, 2.1); // 实参 double，推演 T=double → 调用 max<double>(3.5,2.1)
    max('a', 'z'); // 实参 char，推演 T=char → 调用 max<char>('a','z')
    return 0;
}
```

**示例2：推演失败与显式指定**

若实参类型不一致，推演失败，需显式指定模板参数：

```cpp
max(1, 2.5); // 错误：T 无法同时推演为 int 和 double
max<int>(1, 2.5); // 显式指定 T=int → 2.5 隐式转换为 int（2）
```

#### **2. 类模板的实参推演（C++17 起支持 CTAD）**

C++17 引入**类模板实参推演（CTAD, Class Template Argument Deduction）**，允许编译器根据构造函数实参推演类模板参数。

**示例：CTAD 推演 `std::pair` 类型**

```cpp
#include <utility> // for pair
#include <iostream>
using namespace std;

int main() {
    pair p(1, "hello"); // CTAD 推演：T1=int, T2=const char* → pair<int, const char*>
    cout << get<0>(p) << ", " << get<1>(p) << endl; // 1, hello
    return 0;
}
```

**自定义类模板的 CTAD**：需定义 **deduction guide** （推演指引）

```cpp
template <typename T>
class Box {
public:
    Box(T content) : data(content) {}
    T data;
};

// 推演指引：告诉编译器如何从构造函数实参推演 T
template <typename T>
Box(T) -> Box<T>; // 等价于默认推演规则（可省略）

int main() {
    Box box(42); // CTAD 推演 T=int → Box<int>
    cout << box.data << endl; // 42
    return 0;
}
```

#### **3. 实参推演的限制**

- **无法推演返回类型**：函数模板的返回类型需显式指定或通过 `decltype` 推导（如 `auto add(T a, T b) -> decltype(a+b)`）。
    
- **数组与函数指针退化**：数组实参退化为指针（如 `template <typename T> void f(T a)` 中，`int arr[5]` 推演 `T=int*`）。
    
- **引用折叠**：实参为引用时，推演遵循引用折叠规则（如 `int&` 推演 `T=int&`，最终折叠为 `int&`）。
    

### **五、关键对比与注意事项**

#### **1. 完全特例化 vs 部分特例化**

|**维度**|**完全特例化**|**部分特例化**|
|:--|:--|:--|
|**参数指定**|所有模板参数均为具体类型|部分参数为具体类型，剩余泛型|
|**适用范围**|函数模板、类模板|仅类模板|
|**语法**|`template <> class/class<T1,T2> {...}`|`template <typename T> class<T1_fixed, T> {...}`|
|**本质**|独立的专用实现|泛型模板的子集实现|

#### **2. 模板特例化 vs 模板重载**

- **函数模板**：优先使用重载（而非部分特例化），因重载更直观且支持隐式转换。
    
- **类模板**：只能用特例化（无重载），通过部分特例化适配不同类型组合。
    

#### **3. 实参推演注意事项**

- **显式指定模板参数**：当推演失败或不明确时（如多参数类型冲突），用 `模板名<参数>` 显式指定（如 `max<double>(1, 2.5)`）。
    
- **避免推演歧义**：确保实参类型唯一对应一个模板参数（如 `add(1, 2.5)` 歧义，需显式指定）。
    

### **六、总结**

- **模板特例化**：通过完全特例化（全参数确定）和部分特例化（部分参数确定）为特定类型定制实现，解决通用模板的局限性。
    
- **实参推演**：编译器自动推断模板参数类型（函数模板默认支持，类模板需 C++17 CTAD），简化代码书写。
    
- **核心原则**：通用模板保证复用性，特例化优化特殊性；实参推演优先自动推断，失败时显式指定。
    

**实习生必记**：完全特例化所有参数都确定，部分特例化仅类模板支持；实参推演让代码简洁，歧义时显式指定 `<类型>`！
# function函数对象

#### **一、`std::function` 核心定位**

`std::function` 是 C++11 从 Boost.Function 引入的**通用函数对象封装器**（polymorphic function wrapper），属于**函数对象（Functor）** 的一种。它能**存储、复制、调用任何可调用对象**（函数、lambda、函数对象、成员函数、绑定表达式等），只要其**签名与 `std::function` 模板参数匹配**。

**核心价值**：提供**运行时多态**的可调用对象接口，统一不同类型可调用对象的存储和调用方式，简化回调、策略模式等场景的代码。

### **二、`std::function` 实现原理：类型擦除（Type Erasure）**

`std::function` 的底层通过**类型擦除**技术实现“存储任意可调用对象”。核心思想是：**用一个通用的基类接口隐藏具体可调用对象的类型差异，通过派生类存储具体对象并实现调用逻辑**。

#### **1. 简化版实现模型**

以下是 `std::function` 的伪代码简化实现，揭示类型擦除的核心逻辑：

```cpp
// 1. 基类：定义统一调用接口（类型擦除的“抽象层”）
template <typename Ret, typename... Args>
class FunctionBase {
public:
    virtual Ret operator()(Args... args) const = 0; 
    // 纯虚函数：调用可调用对象
    virtual ~FunctionBase() = default; 
    // 虚析构确保派生类正确释放
};

// 2. 派生类：存储具体可调用对象（类型擦除的“实现层”）
template <typename Callable, typename Ret, typename... Args>
class FunctionImpl : public FunctionBase<Ret, Args...> {
private:
    Callable callable; 
    // 存储具体可调用对象（函数、lambda、函数对象等）
public:
    // 构造函数：用万能引用接收并存储可调用对象（完美转发）
    template <typename T>
    FunctionImpl(T&& c) : callable(std::forward<T>(c)) {}

    // 实现调用逻辑：转发参数给存储的可调用对象
    Ret operator()(Args... args) const override {
        return callable(std::forward<Args>(args)...);
    }
};

// 3. std::function 本体：通过基类指针管理派生类对象（类型擦除的“外壳”）
template <typename Ret, typename... Args>
class function<Ret(Args...)> {
private:
    FunctionBase<Ret, Args...>* impl; 
    // 基类指针：指向具体存储的可调用对象
public:
    // 构造函数：用模板接收任意可调用对象，创建派生类实例（FunctionImpl）
    template <typename Callable>
    function(Callable&& c) 
        : impl(new FunctionImpl<std::decay_t<Callable>, 
        Ret, Args...>(std::forward<Callable>(c))) {}

    // 调用操作符：转发参数给基类接口的 operator()
    Ret operator()(Args... args) const {
        return (*impl)(std::forward<Args>(args)...); 
        // 虚函数调用：运行时多态
    }

    // 析构函数：释放派生类对象
    ~function() { delete impl; }
};
```

#### **2. 类型擦除的关键步骤**

1. **抽象接口**：定义基类 `FunctionBase`，声明纯虚函数 `operator()`（统一调用接口）。
    
2. **具体实现**：为每个可调用对象类型 `Callable` 创建派生类 `FunctionImpl<Callable>`，存储 `Callable` 实例并实现 `operator()`。
    
3. **统一封装**：`std::function` 内部用基类指针 `impl` 指向 `FunctionImpl` 实例，对外隐藏 `Callable` 的具体类型（类型擦除）。
    
4. **调用转发**：通过基类指针调用 `operator()`，实际执行派生类中存储的 `Callable` 的逻辑（运行时多态）。
    

#### **3. 性能与内存开销**

- **类型擦除代价**：
    
    - **虚函数调用开销**：每次调用 `std::function` 会触发一次虚函数调用（比直接调用函数/lambda慢）。
        
    - **额外内存开销**：需存储派生类对象（可能包含 `Callable` 的大小 + 基类指针 overhead），通常比原始函数指针大（如 GCC 中 `std::function` 大小为 2 个指针，32 位系统 8 字节，64 位 16 字节）。
        
- **优化**：编译器可能对简单可调用对象（如无捕获 lambda）做特化，减少开销（接近函数指针）。
    

### **三、`std::function` 应用实例**

`std::function` 广泛用于**动态回调、策略模式、事件系统、延迟执行**等场景，以下是典型案例：

#### **1. 通用回调函数（异步操作/事件处理）**

在异步任务（如网络请求、文件IO）中，用 `std::function` 存储回调函数，支持函数、lambda、成员函数等多种类型。

```cpp
#include <iostream>
#include <functional>
#include <thread>
#include <chrono>

// 异步任务：执行耗时操作后调用回调
void async_task(int delay_ms, std::function<void(int)> callback) {
    std::this_thread::sleep_for(std::chrono::milliseconds(delay_ms)); // 模拟耗时
    callback(delay_ms); // 调用回调，传递结果
}

// 普通函数作为回调
void print_result(int ms) {
    std::cout << "Task finished in " << ms << "ms (function)\n";
}

// 函数对象作为回调
struct CallbackObj {
    void operator()(int ms) const {
        std::cout << "Task finished in " << ms << "ms (functor)\n";
    }
};

int main() {
    // 1. 用普通函数作为回调
    async_task(1000, print_result);

    // 2. 用函数对象作为回调
    async_task(2000, CallbackObj());

    // 3. 用 lambda 作为回调（最常用）
    async_task(1500, [](int ms) { 
        std::cout << "Task finished in " << ms << "ms (lambda)\n"; 
    });

    // 4. 用 std::bind 绑定成员函数作为回调
    struct TaskHandler {
        void on_complete(int ms) {
            std::cout << "Task finished in " << ms << "ms (member function)\n";
        }
    };
    TaskHandler handler;
    async_task(500, std::bind(&TaskHandler::on_complete, &handler, std::placeholders::_1));

    return 0;
}
```

#### **2. 策略模式（动态切换算法）**

用 `std::function` 存储不同策略函数，运行时动态切换。

```cpp
#include <iostream>
#include <functional>
using namespace std;

// 策略函数类型：接收两个 int，返回 int
using Strategy = function<int(int, int)>;

// 具体策略函数
int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

// 上下文类：使用策略函数
class Context {
private:
    Strategy strategy;
public:
    void set_strategy(Strategy s) { strategy = s; }
    int execute(int a, int b) { return strategy(a, b); }
};

int main() {
    Context ctx;
    ctx.set_strategy(add); // 设置加法策略
    cout << ctx.execute(2, 3) << endl; // 5

    ctx.set_strategy(multiply); // 切换为乘法策略
    cout << ctx.execute(2, 3) << endl; // 6

    // 动态传入 lambda 作为策略
    ctx.set_strategy([](int a, int b) { return a - b; });
    cout << ctx.execute(5, 3) << endl; // 2

    return 0;
}
```

#### **3. 事件系统（观察者模式）**

用 `std::function` 存储事件监听器，支持多观察者订阅同一事件。

```cpp
#include <iostream>
#include <functional>
#include <vector>
#include <map>
using namespace std;

// 事件系统：管理事件类型与监听器
class EventSystem {
private:
    map<string, vector<function<void(int)>>> listeners; // 事件类型→监听器列表
public:
    // 订阅事件：注册监听器（std::function）
    void subscribe(const string& event, function<void(int)> listener) {
        listeners[event].push_back(listener);
    }

    // 触发事件：调用所有监听器
    void trigger(const string& event, int data) {
        if (listeners.count(event)) {
            for (auto& listener : listeners[event]) {
                listener(data); // 调用每个监听器
            }
        }
    }
};

int main() {
    EventSystem es;

    // 订阅 "click" 事件（用 lambda）
    es.subscribe("click", [](int x) { 
        cout << "Click event: " << x << " (listener 1)\n"; 
    });

    // 订阅 "click" 事件（用函数对象）
    struct ClickListener {
        void operator()(int x) const { 
            cout << "Click event: " << x << " (listener 2)\n"; 
        }
    };
    es.subscribe("click", ClickListener());

    // 触发事件
    es.trigger("click", 42); 
    // 输出：
    // Click event: 42 (listener 1)
    // Click event: 42 (listener 2)
    return 0;
}
```

#### **4. 延迟执行（任务队列）**

结合线程池，用 `std::function` 存储任务，实现延迟执行（见前文“线程池”笔记）。

### **四、`std::function` 核心笔记**

#### **1. 基本语法**

```cpp
#include <functional>
// 声明：function<返回类型(参数类型列表)>
std::function<Ret(Arg1, Arg2, ...)> func; 

// 示例：存储“int(int, int)”签名的函数
std::function<int(int, int)> add_func = [](int a, int b) { return a + b; };
int result = add_func(2, 3); // 5
```

#### **2. 可存储的可调用对象类型**

|**可调用对象**|**示例**|
|:--|:--|
|普通函数|`int add(int a, int b) { return a + b; }` → `function<int(int,int)> f = add;`|
|Lambda 表达式|`auto lambda = [](int a) { return a*2; };` → `function<int(int)> f = lambda;`|
|函数对象（仿函数）|`struct Multiply { int operator()(int a) { return a*3; } };` → `f = Multiply();`|
|`std::bind` 结果|`auto bound = bind(add, 1, 2);` → `f = bound;`|
|成员函数（需绑定对象）|`struct A { int method(int x) { return x; } }; A a; f = bind(&A::method, &a, _1);`|

#### **3. 关键特性**

- **空状态（Empty State）**：未存储可调用对象时，`std::function` 处于“空”状态，调用会抛出 `std::bad_function_call` 异常。
    
    ```cpp
    std::function<int(int)> f;
    f(10); // 抛出 std::bad_function_call
    if (f) { ... } // 检查是否为空（C++11 起支持）
    ```
    
- **可复制/可移动**：`std::function` 满足 CopyConstructible 和 MoveConstructible，复制时会拷贝内部可调用对象（深拷贝，若为 lambda 有捕获则可能复制捕获的变量）。
    
- **与函数指针的转换**：无捕获的 lambda 可隐式转换为函数指针，进而存储于 `std::function`：
    
    ```cpp
    int (*func_ptr)(int) = [](int x) { return x; };
    std::function<int(int)> f = func_ptr; // 正确
    ```
    

#### **4. 注意事项**

- **性能敏感场景慎用**：类型擦除的虚函数调用和内存开销可能高于直接调用函数/lambda，高频调用场景（如内层循环）建议用模板或函数指针。
    
- **避免存储大型对象**：若可调用对象捕获了大对象（如大数组），`std::function` 的复制会导致额外拷贝开销，建议用引用捕获或移动语义。
    
- **明确签名匹配**：`std::function` 的模板参数必须与可调用对象的签名完全一致（返回值、参数类型、const 限定），否则编译报错。
    
- **与 `auto` 的区别**：`auto` 在编译期确定类型（如 `auto f = [](int x) { ... }` 的类型是 lambda 的匿名类型），`std::function` 在运行期确定类型（统一为 `function<...>`），前者性能更好，后者更灵活。
    

#### **5. 与 `std::bind` 的协同**

`std::bind` 可将多参数函数/成员函数绑定为单参数或无参可调用对象，再存储于 `std::function`：

```cpp
int add(int a, int b) { return a + b; }
// 绑定 add 的前两个参数，生成无参可调用对象
auto bound_add = std::bind(add, 2, 3); 
std::function<int()> f = bound_add; 
f(); // 5
```

### **五、总结**

`std::function` 是 C++ 函数式编程的核心工具，通过**类型擦除**实现对任意可调用对象的统一封装，核心价值在于**运行时多态的灵活性**。其底层依赖基类接口和派生类存储具体对象，通过虚函数调用实现转发。

**适用场景**：回调、策略模式、事件系统、任务队列等需要动态切换可调用对象的场景；**不适用场景**：性能敏感的底层代码（优先用模板或函数指针）。

**核心记忆点**：`std::function` 是“万能函数容器”，类型擦除藏细节，灵活但有开销，回调策略事件用，性能敏感需谨慎！


# 线程池

#### **一、线程池核心架构**

线程池通过**预先创建一组工作线程**，循环从**任务队列**中获取并执行任务，避免频繁创建/销毁线程的开销。核心组件：

- **任务队列**：存储待执行的任务（用 `std::function<void()>` 封装）；
    
- **工作线程**：循环从队列取任务执行；
    
- **同步机制**：用互斥锁（`std::mutex`）和条件变量（`std::condition_variable`）保证线程安全；
    
- **任务提交接口**：用 `std::function` 和 `std::bind` 接收任意可调用对象（函数、成员函数、lambda等）。
    

#### **二、`std::function`：任务队列的统一容器**

`std::function` 是 C++11 引入的**通用函数封装器**，可存储任意可调用对象（函数、lambda、函数对象、`std::bind` 结果等），只要签名匹配 `void()`（无参无返回值，或统一返回值类型）。

**线程池中作用**：作为任务队列的元素类型，统一存储不同类型的任务。

```cpp
#include <functional>
#include <queue>
using namespace std;

// 任务队列：存储 std::function<void()> 类型任务
queue<function<void()>> task_queue; 
```

#### **三、`std::bind`：灵活绑定任务参数**

`std::bind` 用于将**任意可调用对象**（函数、成员函数、lambda）与其参数绑定，生成新的可调用对象（适配 `std::function<void()>` 签名）。

**核心用途**：

- 绑定函数的部分参数，生成无参/单参可调用对象；
    
- 绑定成员函数与对象实例；
    
- 调整参数顺序（用占位符 `_1, _2...`）。
    

#### **四、线程池实现步骤**

##### **1. 线程池类定义**

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <future>
using namespace std;

class ThreadPool {
public:
    // 构造函数：创建 n 个工作线程
    explicit ThreadPool(size_t num_threads);
    ~ThreadPool();

    // 提交任务到线程池（返回 future 获取结果）
    template <typename F, typename... Args>
    auto submit(F&& f, Args&&... args) -> future<decltype(f(args...))>;

private:
    // 工作线程函数：循环取任务执行
    void worker_thread();

    // 任务队列（存储无参任务）
    queue<function<void()>> tasks; 
    // 线程集合
    vector<thread> workers; 
    // 同步原语
    mutex mtx;                   // 保护任务队列
    condition_variable cv;       // 通知新任务到来
    bool stop;                   // 线程池停止标志
};
```

##### **2. 构造函数：启动工作线程**

```cpp
ThreadPool::ThreadPool(size_t num_threads) : stop(false) {
    for (size_t i = 0; i < num_threads; ++i) {
        // 创建工作线程，绑定 worker_thread 成员函数（无参）
        workers.emplace_back(bind(&ThreadPool::worker_thread, this));
    }
}
```

##### **3. 工作线程函数：循环取任务执行**

```cpp
void ThreadPool::worker_thread() {
    while (true) {
        function<void()> task;
        {
            // 加锁并等待任务（或停止信号）
            unique_lock<mutex> lock(mtx);
            cv.wait(lock, [this] { return stop || !tasks.empty(); });

            // 收到停止信号且队列为空，退出线程
            if (stop && tasks.empty()) return;

            // 取出任务
            task = move(tasks.front());
            tasks.pop();
        }
        // 执行任务（解锁后执行，避免阻塞其他线程）
        task(); 
    }
}
```

##### **4. 任务提交接口：用 `std::bind` 适配任意任务**

`submit` 函数接收任意函数和参数，用 `std::bind` 绑定参数后存入任务队列，并返回 `std::future` 供调用者获取结果。

```cpp
template <typename F, typename... Args>
auto ThreadPool::submit(F&& f, Args&&... args) -> future<decltype(f(args...))> {
    using ReturnType = decltype(f(args...)); // 推导返回值类型

    // 1. 用 bind 绑定函数和参数，生成无参可调用对象
    auto bound_task = bind(forward<F>(f), forward<Args>(args)...);
    
    // 2. 包装为 packaged_task（关联 future）
    auto task = make_shared<packaged_task<ReturnType()>>(bound_task);
    
    // 3. 提取 future（供调用者获取结果）
    future<ReturnType> res = task->get_future();
    
    {
        lock_guard<mutex> lock(mtx);
        if (stop) throw runtime_error("Submit on stopped ThreadPool");
        // 4. 将任务（无参 lambda）加入队列
        tasks.emplace([task]() { (*task)(); }); 
    }
    
    // 5. 通知一个工作线程取任务
    cv.notify_one();
    return res;
}
```

##### **5. 析构函数：优雅停止线程池**

```cpp
ThreadPool::~ThreadPool() {
    {
        lock_guard<mutex> lock(mtx);
        stop = true; // 设置停止标志
    }
    cv.notify_all(); // 唤醒所有线程
    for (auto& worker : workers) {
        if (worker.joinable()) worker.join(); // 等待线程结束
    }
}
```

#### **五、使用示例：绑定不同类型任务**

##### **1. 提交普通函数**

```cpp
int add(int a, int b) { return a + b; }

int main() {
    ThreadPool pool(4); // 4个工作线程
    
    // 提交 add(2, 3)，用 bind 绑定参数
    auto future = pool.submit(add, 2, 3); 
    cout << "2 + 3 = " << future.get() << endl; // 输出：5
    return 0;
}
```

##### **2. 提交成员函数**

```cpp
class Calculator {
public:
    int multiply(int a, int b) { return a * b; }
};

int main() {
    ThreadPool pool(4);
    Calculator calc;
    
    // 绑定成员函数：第一个参数为对象指针，后续为函数参数
    auto future = pool.submit(&Calculator::multiply, &calc, 4, 5); 
    cout << "4 * 5 = " << future.get() << endl; // 输出：20
    return 0;
}
```

##### **3. 提交 lambda 表达式**

```cpp
int main() {
    ThreadPool pool(4);
    
    // 提交 lambda（无需 bind，直接转为 function<void()>）
    auto future = pool.submit([](int a, int b) { return a - b; }, 10, 3); 
    cout << "10 - 3 = " << future.get() << endl; // 输出：7
    return 0;
}
```

##### **4. 提交带返回值的复杂任务**

```cpp
int complex_task(int x) {
    this_thread::sleep_for(chrono::seconds(1)); // 模拟耗时操作
    return x * x;
}

int main() {
    ThreadPool pool(2);
    vector<future<int>> results;
    
    // 提交5个任务
    for (int i = 0; i < 5; ++i) {
        results.emplace_back(pool.submit(complex_task, i));
    }
    
    // 获取结果
    for (auto& res : results) {
        cout << res.get() << " "; // 输出：0 1 4 9 16
    }
    return 0;
}
```

#### **六、关键技术点解析**

##### **1. `std::bind` 参数转发**

- 使用 `std::forward` 完美转发参数，保持左值/右值特性：
    
    ```cpp
    auto bound_task = bind(forward<F>(f), forward<Args>(args)...); 
    ```
    
- 绑定成员函数时，第一个参数必须是对象指针/引用：
    
    ```cpp
    // &Calculator::multiply 是成员函数指针，&calc 是对象指针
    bind(&Calculator::multiply, &calc, 4, 5); 
    ```
    

##### **2. `std::function` 与任务队列**

- 任务队列元素类型为 `function<void()>`，因此需用 lambda 包装绑定后的任务：
    
    ```cpp
    tasks.emplace([task]() { (*task)(); }); // task 是 packaged_task 指针
    ```
    

##### **3. 线程安全与性能优化**

- **锁粒度**：仅在操作任务队列时加锁，任务执行时解锁（见 `worker_thread`）；
    
- **条件变量**：用 `cv.wait(lock, predicate)` 避免虚假唤醒；
    
- **任务窃取**：高级线程池可实现（本示例为基础版，无任务窃取）。
    

#### **七、注意事项**

##### **1. 任务异常传播**

若任务执行中抛出异常，`std::packaged_task` 会将异常存储，在 `future.get()` 时重新抛出。需在调用者处捕获：

```cpp
try {
    future.get();
} catch (const exception& e) {
    cerr << "Task failed: " << e.what() << endl;
}
```

##### **2. 避免任务阻塞**

若任务执行时间过长，会占用工作线程，导致其他任务等待。需合理控制任务粒度，或增加线程数。

##### **3. 智能指针管理任务**

用 `shared_ptr` 管理 `packaged_task`，确保任务在执行期间不被销毁：

```cpp
auto task = make_shared<packaged_task<ReturnType()>>(bound_task);
```

#### **八、总结**

- **`std::function`**：作为任务队列的统一容器，存储任意可调用对象；
    
- **`std::bind`**：灵活绑定函数/成员函数与参数，适配任务队列签名；
    
- **线程池核心**：任务队列+工作线程+同步机制，通过 `submit` 接口提交任务，用 `future` 获取结果；
    
- **优势**：复用线程、降低开销、提高响应速度，适合处理大量短期任务。
    

**核心记忆点**：`bind` 绑任务，`function` 存任务，队列管任务，线程跑任务——四者协同实现高效线程池！

# C++11内容简要汇总

#### **一、关键字与语法特性**

1. **`auto` 关键字**
    
    - **功能**：编译器自动推导变量类型，简化复杂类型声明（如迭代器、模板类型）。
        
    - **示例**：
        
        ```cpp
        auto it = vec.begin(); // 推导为 vector<int>::iterator  
        auto lambda = [](int x) { return x * 2; }; 
        // 推导为匿名函数类型  
        ```
        
    - **限制**：不能用于函数参数、数组声明。
        
2. **`nullptr` 关键字**
    
    - **功能**：替代 `NULL` 或 `0`，表示空指针，避免重载歧义。
        
    - **类型**：`std::nullptr_t`，仅可隐式转换为指针类型。
        
3. **范围 `for` 循环**
    
    - **语法**：`for (auto& elem : container)`，简化容器遍历。
        
    - **支持类型**：数组、STL 容器（需 `begin()`/`end()` 方法）。
        
4. **移动语义与右值引用**
    
    - **右值引用**：`T&&`，绑定临时对象（右值），支持资源“窃取”。
        
    - **移动构造/赋值**：避免深拷贝，提升性能（如 `std::vector` 的移动操作）。
        
    - **`std::move()`**：显式将左值转为右值引用。
        
5. **可变参数模板**
    
    - **语法**：`template<typename... Args>`，支持任意数量模板参数。
        
    - **应用**：实现泛型函数/类（如 `std::tuple`）。
        
6. **`decltype` 类型推导**
    
    - **功能**：获取表达式类型，与 `auto` 配合实现通用代码。
        
    - **示例**：
        
        ```cpp
        template<typename T, typename U>  
        auto add(T a, U b) -> decltype(a + b) {  
            return a + b;  
        }  
        ```
        

---

#### **二、智能指针**

1. **`std::unique_ptr`**
    
    - **特性**：独占所有权，禁止拷贝，支持移动语义。
        
    - **用途**：替代 `auto_ptr`，避免资源泄漏。
        
2. **`std::shared_ptr`**
    
    - **特性**：共享所有权，引用计数管理（原子操作）。
        
    - **线程安全**：引用计数增减线程安全，对象访问需额外同步。
        
3. **`std::weak_ptr`**
    
    - **特性**：弱引用，不增加引用计数，打破 `shared_ptr` 循环引用。
        
    - **用法**：通过 `lock()` 获取 `shared_ptr` 访问对象。
        

---

#### **三、容器与算法**

1. **新增容器**
    
    - **`std::array`**：固定大小数组，支持迭代器和 `at()` 方法。
        
    - **`std::forward_list`**：单向链表，内存占用更低。
        
    - **`std::unordered_map`/`set`**：哈希表实现，查找效率 O(1)。
        
2. **算法增强**
    
    - **`std::all_of`/`any_of`/`none_of`**：检查容器元素是否满足条件。
        
    - **`std::iota`**：生成连续递增序列（如 `iota(arr, arr+5, 0)` 生成 0-4）。
        

---

#### **四、多线程编程支持**

1. **线程库**
    
    - **`std::thread`**：创建和管理线程。
        
    - **`std::mutex`**：互斥锁，保护共享数据。
        
    - **`std::condition_variable`**：线程间同步，等待条件满足。
        
    - **`std::atomic`**：原子操作，无锁编程（如 `atomic<int> counter`）。
        
2. **线程安全容器**
    
    - **`std::vector`/`map`**：需配合互斥锁使用。
        
    - **`std::shared_ptr`**：引用计数线程安全，对象访问需同步。
        

---

#### **五、函数对象与 Lambda**

1. **Lambda 表达式**
    
    - **语法**：`[capture](params) -> return_type { body }`。
        
    - **捕获方式**：值捕获 `[x]`、引用捕获 `[&x]`、隐式捕获 `[=]` 或 `[&]`。
        
    - **应用**：STL 算法回调、局部逻辑封装。
        
2. **`std::function` 与 `std::bind`**
    
    - **`std::function`**：统一存储任意可调用对象（函数、Lambda、成员函数）。
        
    - **`std::bind`**：绑定函数参数，生成新可调用对象（适配固定参数）。
        

---

#### **六、其他重要特性**

1. **`constexpr`**
    
    - **功能**：编译时常量表达式，用于优化性能（如数学计算）。
        
2. **强类型枚举**
    
    - **语法**：`enum class Color { Red, Green };`，避免命名冲突。
        
3. **委托构造函数**
    
    - **功能**：一个构造函数调用另一个构造函数，减少代码冗余。
        
4. **继承构造函数**
    
    - **语法**：`using Base::Base;`，派生类继承基类构造函数。
        

---

#### **七、总结**

C++11 通过以下核心改进显著提升开发效率与代码安全性：

- **内存管理**：智能指针（`unique_ptr`/`shared_ptr`）替代手动 `new/delete`。
    
- **并发编程**：线程库与原子操作支持跨平台多线程开发。
    
- **语法简化**：`auto`、范围 `for`、Lambda 表达式减少样板代码。
    
- **性能优化**：移动语义避免深拷贝，右值引用提升资源管理效率。
- 

# 多线程访问共享对象的线程安全问题

#### **一、多线程访问共享对象的核心问题**

在多线程环境中，多个线程同时访问或修改同一对象时，可能引发以下问题：

1. **数据竞争（Data Race）**
    
    - **定义**：多个线程同时读写同一内存位置，且至少有一个线程执行写操作。
        
    - **后果**：未定义行为（程序崩溃、数据损坏、结果错误）。
        
    - **示例**：
        
        ```cpp
        int shared_data = 0;  
        // 线程A和线程B同时执行以下操作  
        shared_data++; // 非原子操作，可能丢失更新  
        ```
        
2. **悬垂指针（Dangling Pointer）**
    
    - **定义**：线程A访问的对象被线程B提前销毁，导致指针指向无效内存。
        
    - **示例**：
        
        ```cpp
        // 线程A  
        A* p = new A();  
        // 线程B  
        delete p; // 主线程提前释放对象  
        // 线程A后续访问 p->method() 导致崩溃  
        ```
        
3. **死锁（Deadlock）**
    
    - **定义**：多个线程互相等待对方释放锁，导致无限阻塞。
        
    - **常见场景**：嵌套锁、无序加锁。
        
4. **内存泄漏**
    
    - **定义**：动态分配的内存未被正确释放，导致资源耗尽。
        
    - **示例**：未捕获异常时忘记释放锁或智能指针未正确管理。
        

---

#### **二、智能指针的线程安全解决方案**

智能指针通过自动管理内存生命周期，结合同步机制，可有效解决上述问题。

##### **1. `std::shared_ptr` 与 `std::weak_ptr`**

- **核心机制**：
    
    - `shared_ptr` 使用引用计数管理对象生命周期，引用计数操作是线程安全的（原子性）。
        
    - `weak_ptr` 观察 `shared_ptr` 管理的对象，不增加引用计数，避免循环引用。
        
- **适用场景**：
    
    - **共享所有权**：多个线程需要访问同一对象。
        
    - **避免悬垂指针**：通过 `weak_ptr::lock()` 检查对象是否存活。
        
- **示例**：
    
    ```cpp
    #include <memory>  
    #include <thread>  
    
    void thread_func(std::weak_ptr<int> wp) {  
        if (auto sp = wp.lock()) { // 检查对象是否存活  
            *sp = 42;  
        } else {  
            // 对象已销毁  
        }  
    }  
    
    int main() {  
        auto sp = std::make_shared<int>(10);  
        std::thread t1(thread_func, wp);  
        std::thread t2(thread_func, wp);  
        t1.join(); t2.join();  
        return 0;  
    }  
    ```
    

##### **2. `std::unique_ptr`**

- **核心机制**：
    
    - 独占所有权，不可复制，只能移动。
        
    - 适用于单线程或明确所有权转移的多线程场景。
        
- **线程安全**：
    
    - 移动操作是线程安全的（无数据竞争）。
        
    - 但需确保移动后原指针不再被访问。
        
- **示例**：
    
    ```cpp
    std::unique_ptr<int> up(new int(10));  
    std::thread t([&up]() {  
        auto new_up = std::move(up); // 转移所有权到线程内  
        *new_up = 20;  
    });  
    t.join();  
    ```
    

##### **3. 原子操作与智能指针结合**

- **`std::atomic<std::shared_ptr<T>>`**：
    
    - 原子化 `shared_ptr` 的读写操作，避免数据竞争。
        
    - **适用场景**：需要原子更新指针的场景（如无锁队列）。
        
- **示例**：
    
    ```cpp
    std::atomic<std::shared_ptr<int>> atomic_sp;  
    // 线程A：原子更新指针  
    atomic_sp.store(std::make_shared<int>(100));  
    // 线程B：原子读取指针  
    auto sp = atomic_sp.load();  
    ```
    

---

#### **三、同步机制与智能指针的配合**

##### **1. 互斥锁（`std::mutex`）**

- **保护共享数据**：
    
    ```cpp
    std::mutex mtx;  
    std::shared_ptr<int> shared_data;  
    
    void writer() {  
        std::lock_guard<std::mutex> lock(mtx);  
        shared_data = std::make_shared<int>(42); // 写操作  
    }  
    
    void reader() {  
        std::lock_guard<std::mutex> lock(mtx);  
        if (shared_data) {  
            std::cout << *shared_data << std::endl; // 读操作  
        }  
    }  
    ```
    

##### **2. 读写锁（`std::shared_mutex`）**

- **读多写少场景**：
    
    - 多个线程可同时读取（共享锁）。
        
    - 写操作需独占锁。
        
- **示例**：
    
    ```cpp
    std::shared_mutex rw_mutex;  
    std::shared_ptr<std::vector<int>> data;  
    
    void read_data() {  
        std::shared_lock<std::shared_mutex> lock(rw_mutex);  
        // 读取 data  
    }  
    
    void write_data() {  
        std::unique_lock<std::shared_mutex> lock(rw_mutex);  
        data = std::make_shared<std::vector<int>>(); // 写入  
    }  
    ```
    

##### **3. 原子操作与锁的对比**

|**机制**|**优点**|**缺点**|**适用场景**|
|:--|:--|:--|:--|
|**互斥锁**|简单易用，保护复杂逻辑|性能开销大（上下文切换）|临界区代码复杂、耗时|
|**原子操作**|无锁、高性能|仅支持简单操作（如自增、指针交换）|计数器、标志位、指针更新|
|**读写锁**|读操作并发，提升吞吐量|写操作仍需独占锁|读多写少（如缓存）|

---

#### **四、最佳实践与避坑指南**

1. **最小化共享数据**
    
    - 优先使用线程局部存储（`thread_local`）避免共享。
        
    - **示例**：
        
        ```cpp
        thread_local std::vector<int> local_cache; // 每个线程独立副本  
        ```
        
2. **智能指针的生命周期管理**
    
    - 使用 `std::make_shared`/`std::make_unique` 避免裸指针。
        
    - 避免循环引用（`shared_ptr` 之间），用 `weak_ptr` 打破循环。
        
3. **锁的粒度控制**
    
    - 锁的范围尽可能小，减少锁竞争。
        
    - **示例**：
        
        ```cpp
        void process() {  
            // 非临界区  
            {  
                std::lock_guard<std::mutex> lock(mtx); // 临界区  
                // 修改共享数据  
            }  
            // 非临界区  
        }  
        ```
        
4. **异常安全**
    
    - 使用 RAII（如 `lock_guard`）确保锁在异常时自动释放。
        
5. **避免虚假共享（False Sharing）**
    
    - 不同线程访问同一缓存行的不同变量时，需填充缓存行（`alignas`）。
        
    - **示例**：
        
        ```cpp
        struct alignas(64) PaddedData {  
            int data;  
            char padding[60]; // 填充至64字节  
        };  
        ```
        

---

#### **五、实战案例：线程安全的对象池**

```cpp
#include <memory>
#include <vector>
#include <mutex>
#include <thread>

template<typename T>
class ObjectPool {
public:
    std::shared_ptr<T> acquire() {
        std::unique_lock<std::mutex> lock(mutex_);
        if (pool_.empty()) {
            return std::make_shared<T>();
        }
        auto obj = pool_.back();
        pool_.pop_back();
        return obj;
    }

    void release(std::shared_ptr<T> obj) {
        std::unique_lock<std::mutex> lock(mutex_);
        pool_.push_back(obj);
    }

private:
    std::vector<std::shared_ptr<T>> pool_;
    std::mutex mutex_;
};

// 使用示例
void worker(ObjectPool<int>& pool) {
    auto obj = pool.acquire();
    *obj = 42; // 操作对象
    pool.release(obj);
}

int main() {
    ObjectPool<int> pool;
    std::thread t1(worker, std::ref(pool));
    std::thread t2(worker, std::ref(pool));
    t1.join(); t2.join();
    return 0;
}
```

---

#### **六、总结**

- **智能指针的核心作用**：自动管理内存，避免泄漏和悬垂指针。
    
- **线程安全的关键**：
    
    - 通过 `shared_ptr`/`weak_ptr` 管理共享对象生命周期。
        
    - 结合互斥锁、原子操作、读写锁等同步机制保护数据一致性。
        
- **设计原则**：最小化共享、明确所有权、锁粒度控制、异常安全。
    

**引用来源**：

- 智能指针解决悬垂指针问题
    
- 互斥锁与锁管理
    
- 原子操作与线程局部存储
    
- 线程池中的智能指针应用
    
- 智能指针类型选择与线程安全

