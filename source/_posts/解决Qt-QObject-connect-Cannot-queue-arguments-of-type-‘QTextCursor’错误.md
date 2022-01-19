---
title: '解决Qt-QObject::connect: Cannot queue arguments of type ‘QTextCursor’错误'
date: 2021-12-04 11:41:46
updated:
tags: [Qt, Bug]
categories: [Bug踩坑记录]
---
## 保留现场

我在线程中直接调用了 QTextEdit 的append函数时，候就会出现下面的错误：

```bash
QObject::connect: Cannot queue arguments of type 'QTextCursor'
 
(Make sure 'QTextCursor' is registered using qRegisterMetaType().)
```

## 探究原因

原因是**我们不能通过线程来修改UI，较为安全的修改用户界面的方式是向UI窗口发送信号(signal)**，较为简单的方式是使用 Qt threading类。

## 解决方法

在窗口类中定义信号和槽，并声明和实现一个接口函数，这个接口函数由线程调用，在接口函数中emit一个信号，示例代码如下：

```C++
//mainwindow.h
signals:
    void AppendText(const QString &text);
private slots:
    void SlotAppendText(const QString &text);
public:
  void Append(const QString &text);
//mainwindow.cpp
connect(this,SIGNAL(AppendText(QString)),this,SLOT(SlotAppendText(QString)));
void ClassName::Append(const QString &text)
{
    emit AppendText("ok: string1");
}
//thread.cpp
void ThreadClassName::SlotAppendText(const QString &text)
{
    mText.append(text);
}

```

