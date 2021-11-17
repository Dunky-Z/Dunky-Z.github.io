---
title: 解决QT在构造函数中写的控件不显示的问题
date: 2021-11-16 16:15:26
tags: [Bug, Qt]
categories: [Bug踩坑记录]
---
## 保留现场

在新窗口中的构造函数中添加控件运行后却没有显示

## 探究原因

- 新建的工程师MainWindow子类工程，没有设置父窗口。

- 没有将控件的父窗口设置成自己定义的widget。

```C++
#include<QMainWindow>
 
QMainWindow::QMainWindow(QMainWindow*parent) :
    QMainWindow(parent),
    ui(new Ui::QMainWindow)
{
     ui->setupUi(this);
     QPushButton* button_1 = new QPushButton("add");
     QPushButton* button_1 = new QPushButton("del");
}
```

## 解决方法

方法1：给按钮控件设置父窗口：QWidget,并且把按钮添加到父窗口中。

```C++
#include<QMainWindow>
#include<QPushButton>
#include<QHBoxLayout>
 
QMainWindow::QMainWindow(QMainWindow*parent) :
    QMainWindow(parent),
    ui(new Ui::QMainWindow)
{
     ui->setupUi(this);
     QWidget* w = new QWidget();
     this->setCentralWidget(w);
     QHBoxLayout* hLayout = new QHBoxLayout();
     QPushButton* button_1 = new QPushButton("add");
     QPushButton* button_1 = new QPushButton("del");
     hLayout->addWidget(button_1);
     hLayout->addWidget(button_2);
     w->setLayout(hLayout);
}
```



方法2：手动指定父窗口

```C++
#include<QMainWindow>
#include<QPushButton>
#include<QHBoxLayout>
 
QMainWindow::QMainWindow(QMainWindow*parent) :
    QMainWindow(parent),
    ui(new Ui::QMainWindow)
{
     ui->setupUi(this);
    
    
     QPushButton* button_1 = new QPushButton("add");
     QPushButton* button_1 = new QPushButton("del");
     button_1->setParent(this);
     button_2->setParent(this);
     button_2->move(300,100);
    
}
```

