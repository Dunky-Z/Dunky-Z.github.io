---
title: 解决C++中vector声明错误expected parameter declarator
date: 2021-11-13 19:00:29
updated:
tags: [C++,Bug]
categories: [Bug踩坑记录]
---
## 保留现场

```C++
    QVector<uint32_t> buttonPins(3);

```

声明了一个长度为3的`vector`数组，编译是会报这个错误。

## 探究原因

编译器可能无法区分这是一个成员函数声明还是一个成员变量声明，也就是产生歧义。

## 解决方法

方法1：

```C++
    QVector<uint32_t> buttonPins = QVector<uint32_t>(3);//明确这是一个成员变量

```

方法2：默认构造函数里面进行成员变量的初始化

```C++
MainWindow::MainWindow(QWidget *parent) : QMainWindow(parent),
    ui(new Ui::MainWindow),buttonPins(3){}
```

方法3：列表初始化

```C++
QVector<uint32_t> buttonPins{0, 0, 0};
```