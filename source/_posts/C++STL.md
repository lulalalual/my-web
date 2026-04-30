---
title: STL
permalink: posts/cpp-stl/
date: 2026-04-29 20:45:00
updated: 2026-04-30 10:30:00
categories:
  - C++语法笔记
tags:
  - C++
  - STL
  - 容器
  - 算法
cover: /img/covers/ai/cover-cpp-stl.webp
description: 把 STL 讲成 C++ 标准工具箱：按场景选择容器，用迭代器和算法写出清楚代码。
---

STL 可以理解成 C++ 标准库里的一套常用工具箱。它帮你准备好了容器、迭代器、算法和函数对象。学 STL 的重点不是把每个函数名背下来，而是知道遇到不同数据组织需求时，应该选哪种工具，以及这个工具的代价是什么。

## 容器是在回答“数据怎么放”

容器的第一件事是存数据，但不同容器适合的场景完全不同。<code>vector</code> 像一排连续座位，按下标访问很快；<code>list</code> 像一串互相拉着手的人，中间插入删除方便，但随机访问慢；<code>map</code> 像按 key 排好序的字典；<code>unordered_map</code> 像用哈希表快速找位置的柜子。

如果你经常按下标访问，用 <code>vector</code>。如果你经常按 key 查询，用 <code>unordered_map</code>。如果你需要有序遍历，用 <code>map</code>。选择容器时不要凭感觉，先看你的主要操作是什么。

## vector 是最常用的默认选择

在大多数工程里，如果没有特殊理由，<code>vector</code> 往往是第一选择。它内存连续，缓存友好，遍历速度快，还能和很多底层接口配合。

~~~cpp
std::vector<int> nums;
nums.push_back(1);
nums.push_back(2);
nums.push_back(3);

for (int x : nums) {
    std::cout << x << std::endl;
}
~~~

<code>vector</code> 的关键细节是扩容。当容量不够时，它会申请一块更大的内存，把原来的元素搬过去。搬家之后，旧地址就可能失效，所以保存元素指针或迭代器时要特别小心。

~~~cpp
std::vector<int> v{1, 2, 3};
int* p = &v[0];
v.push_back(4);     // 可能触发扩容
// p 可能已经失效
~~~

如果你提前知道大概会放多少元素，可以用 <code>reserve</code> 预留容量，减少扩容次数。

## map 和 unordered_map 的区别

<code>map</code> 底层通常是红黑树，元素按 key 有序，查找、插入、删除一般是 <code>O(log n)</code>。<code>unordered_map</code> 底层是哈希表，平均查询接近 <code>O(1)</code>，但元素没有顺序。

~~~cpp
std::unordered_map<std::string, int> score;
score["Tom"] = 90;
score["Jack"] = 85;

if (score.find("Tom") != score.end()) {
    std::cout << score["Tom"] << std::endl;
}
~~~

面试或工程里经常会问为什么不能无脑使用 <code>unordered_map</code>。原因是哈希表依赖哈希函数，极端冲突会退化；它也不保证顺序。如果你需要按 key 排序输出，<code>map</code> 更合适。

## 迭代器是容器和算法之间的桥

迭代器可以理解成一种“当前位置”。算法不需要知道容器内部长什么样，只要能通过迭代器从头走到尾，就能工作。

~~~cpp
std::vector<int> v{3, 1, 2};
std::sort(v.begin(), v.end());
~~~

<code>sort</code> 并不知道 <code>v</code> 的内部细节，它只通过 <code>begin</code> 和 <code>end</code> 操作一段范围。这个设计让 STL 的容器和算法可以自由组合。

使用迭代器时最容易踩的坑是失效。比如 <code>vector</code> 扩容会让旧迭代器失效；<code>map</code> 删除当前元素时，也要先保存下一个位置。

~~~cpp
for (auto it = m.begin(); it != m.end(); ) {
    if (it->second == 0) {
        it = m.erase(it);
    } else {
        ++it;
    }
}
~~~

这段写法的关键是 <code>erase</code> 返回删除后下一个合法位置。

## 算法让代码表达意图

STL 算法的价值不是少写几行循环，而是让代码更接近人的意图。看到 <code>find</code>，你知道它在找元素；看到 <code>sort</code>，你知道它在排序；看到 <code>remove_if</code>，你知道它在按条件移除。

~~~cpp
std::vector<int> nums{1, 2, 3, 4, 5};
auto it = std::find(nums.begin(), nums.end(), 3);

std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b;
});
~~~

lambda 表达式可以把比较规则直接写在调用处。它适合短小逻辑，如果逻辑很复杂，就应该提取成函数或函数对象，避免代码变成一坨。

## string 不是字符数组的简单替代

<code>std::string</code> 帮你管理字符内存，避免大量手动处理 <code>char*</code>。它支持拼接、查找、截取和比较，也能和 C 风格接口互相转换。

~~~cpp
std::string name = "qingyang";
std::string hello = "hello, " + name;

if (hello.find("yang") != std::string::npos) {
    std::cout << "found" << std::endl;
}
~~~

需要注意的是，<code>c_str()</code> 返回的指针只在字符串对象没有被修改且仍然存活时有效。不要把它保存起来长期使用。

## STL 的学习顺序

先把 <code>vector</code>、<code>string</code>、<code>unordered_map</code>、<code>map</code>、<code>set</code> 用熟，再学迭代器失效和常用算法。等这些稳定以后，再看 <code>deque</code>、<code>list</code>、<code>priority_queue</code>、自定义哈希、自定义比较器。

真正会用 STL，不是记住所有 API，而是能解释清楚：为什么这里选这个容器，它的时间复杂度是多少，它会不会让迭代器失效，它的内存布局是否适合当前场景。
