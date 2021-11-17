---
title: QWidget中update不执行paintEvent
date: 2021-11-15 18:04:50
updated:
tags: [Qt]
categories: [Bug踩坑记录]
---
## 保留现场

手动执行`update()`或者`repaint()`都不能执行`paintEvent`函数。

## 探究原因

如果是代码`new`出来的控件，检查是否正确显示，比如有没有加入到`layout`中。或者有没有设置父窗口（可能被其他空间遮挡）。

检查控件`width`或者`height`大小是否不为0。如果为0，也不会出出发`paintEvent`。

## 解决方法

参考QT在构造函数中写的控件不显示

