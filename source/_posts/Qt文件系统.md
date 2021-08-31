---
title: Qt文件系统
date: 2021-08-31 20:00:06
tags: [Qt]
---

Qt 通过`QIODevice`提供了对 `I/O` 设备的抽象，这些设备具有读写字节块的能力。下面是 `I/O` 设备的类图：


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210831200940.png)

途中所涉及的类及其用途简要说明如下：

`QIODevice`：所有` I/O `设备类的父类，提供了字节块读写的通用操作以及基本接口；
`QFlie`：访问本地文件或者嵌入资源；
`QTemporaryFile`：创建和访问本地文件系统的临时文件；
`QBuffer`：读写`QByteArray`；
`QProcess`：运行外部程序，处理进程间通讯；
`QAbstractSocket`：所有套接字类的父类；
`QTcpSocket`：`TCP`协议网络数据传输；
`QUdpSocket`：传输 `UDP` 报文；
`QSslSocket`：使用 `SSL/TLS` 传输数据；
`QFileDevice`：Qt5新增加的类，提供了有关文件操作的通用实现。