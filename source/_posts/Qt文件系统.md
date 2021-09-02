---
title: Qt文件系统
date: 2021-08-31 20:00:06
tags: [Qt]
---

Qt 通过`QIODevice`提供了对 `I/O` 设备的抽象，这些设备具有读写字节块的能力。下面是 `I/O` 设备的类图：


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210831200940.png)

图中所涉及的类及其用途简要说明如下：

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

## QFile及其相关类
我们通常会将文件路径作为参数传给`QFile`的构造函数。不过也可以在创建好对象最后，使用`setFileName()`来修改。`QFile`需要使用` / `作为文件分隔符，不过，它会自动将其转换成操作系统所需要的形式。例如` C:/windows `这样的路径在 Windows 平台下同样是可以的。

`QFile`主要提供了有关文件的各种操作，比如打开文件、关闭文件、刷新文件等。我们可以使用`QDataStream`或`QTextStream`类来读写文件，也可以使用`QIODevice`类提供的`read()`、`readLine()`、`readAll()`以及`write()`这样的函数。值得注意的是，有关文件本身的信息，比如文件名、文件所在目录的名字等，则是通过`QFileInfo`获取，而不是自己分析文件路径字符串。

在这段代码中，我们首先使用`QFile`创建了一个文件对象。这个文件名字是 `test.txt`。只要将这个文件放在同执行路径一致的目录下即可。可以使用`QDir::currentPath()`来获得应用程序执行时的当前路径。只要将这个文件放在与当前路径一致的目录下即可。然后，我们使用`open()`函数打开这个文件，打开形式是只读方式，文本格式。这个类似于`fopen()`的 `r` 这样的参数。`open()`函数返回一个 `bool` 类型，如果打开失败，我们在控制台输出一段提示然后程序退出。否则，我们利用 `while` 循环，将每一行读到的内容输出。


```cpp
#include <QWidget>
#include <QApplication>
#include <QDebug>
#include <QFile>
#include <QFileInfo>
#include <QMainWindow>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    QFile file("test.txt");
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text))
    {
        qDebug() << "Open file failed.";
        return -1;
    }
    else
    {
        while (!file.atEnd())
        {
            qDebug() << file.readLine();
        }
    }
    QFileInfo info(file);
    qDebug() << info.isDir();            //false
    qDebug() << info.isExecutable();     //false
    qDebug() << info.baseName();         //test
    qDebug() << info.completeBaseName(); //test.txt
    qDebug() << info.suffix();           //txt
    qDebug() << info.completeSuffix();   //txt

    QFileInfo fi("/tmp/archive.tar.gz");
    QString base = fi.baseName();          // base = "archive"
    QString cbase = fi.completeBaseName(); // base = "archive.tar"
    QString ext = fi.suffix();             // ext = "gz"
    QString ext = fi.completeSuffix();     // ext = "tar.gz"
    return app.exec();
}
```
