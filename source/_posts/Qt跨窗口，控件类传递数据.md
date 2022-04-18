---
title: Qt跨窗口，控件类传递数据
date: 2021-12-02 10:35:14
updated:
tags: [Qt]
categories:
---

## 问题简介
本文基于[【Qt】窗体间传递数据（跨控件跨类），三种情况与处理方法](https://blog.csdn.net/shihoongbo/article/details/48681979)


已知三个窗体，A为B C的父控件，B与C互为兄弟控件
那么参数传递分三种情况：
1. B向A（C向A）传递参数
2. B向C（C向B）传递参数
3. A向B（A向C）传递参数

三个空间关系模型参考如下，

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211208122116.png)

## B向A（C向A）传递参数

```cpp
//B.h
class B
{
signals:
    void toA([ParamList]);
}

//B.cpp
B::B()
{
    emit toA([ParamList]);
}
```

```cpp
//A.h
class A
{
private:
   B *b;
private slots:
   void fromB([ParamList]);
}

//A.cpp
A::A()
{
    b = new B;
    connect(b, SIGNAL(toA([ParamList])), this, SLOT(fromB([ParamList])));
}

void A::fromB([ParamList])
{
//get[ParamList]
}
```

## B向C（C向B）传递参数
```cpp
//A.h
{
private:
  B *b;
  C *c;
}

//A.cpp
A::A()
{
  b = new B;
  c = new C;
  connect(b, SIGNAL(toC([ParamList]), c, SLOT(fromB([ParamList])));
}

//B.h
class B
{
signals:
 void toC([ParamList]);
}

//B.cpp
B::B()
{
  emit toC([ParamList]);
}

//C.h
class C
{
private slots:
  void fromB([ParamList]);
}

//C.cpp
void C::fromB([ParamList])
{
//get[ParamList]
}
```

## A向B（A向C）传递参数
```cpp
//B.h
class B
{
public:
   void fromA([ParamList]);
} 

//B.cpp
void B::fromA([ParamList])
{
//get[ParamList]
}

//A.h
class A
{
private:
   B *b;
}

//A.cpp
A:A()
{
    b = new B;
    b->fromA([ParamList]);
}
```