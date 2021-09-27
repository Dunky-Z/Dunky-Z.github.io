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
## 二进制文件读写

本节，我们将学习`QDataStream`的使用以及一些技巧。

`QDataStream`提供了基于`QIODevice`的二进制数据的序列化。数据流是一种二进制流，这种流完全不依赖于底层操作系统、CPU 或者字节顺序（大端或小端）。例如，在安装了 Windows 平台的 PC 上面写入的一个数据流，可以不经过任何处理，直接拿到运行了 Solaris 的 SPARC 机器上读取。由于数据流就是二进制流，因此我们也可以直接读写没有编码的二进制数据，例如图像、视频、音频等。

`QDataStream`既能够存取 `C++` 基本类型，如 `int`、`char`、`short` 等，也可以存取复杂的数据类型，例如自定义的类。实际上，`QDataStream`对于类的存储，是将复杂的类分割为很多基本单元实现的。

结合`QIODevice`，`QDataStream`可以很方便地对文件、网络套接字等进行读写操作。

```cpp
QFile file("file.dat");
file.open(QIODevice::WriteOnly);
QDataStream out(&file);
out << QString("the answer is");
out << (qint32)42;
```

在这段代码中，我们首先打开一个名为 file.dat 的文件（注意，我们为简单起见，并没有检查文件打开是否成功，这在正式程序中是不允许的）。然后，我们将刚刚创建的`file`对象的指针传递给一个`QDataStream`实例`out`。类似于`std::cout`标准输出流，`QDataStream`也重载了输出重定向<<运算符。后面的代码就很简单了：将`“the answer is”`和数字` 42 `输出到数据流（如果你不明白这句话的意思，这可是宇宙终极问题的答案，请自行搜索《银河系漫游指南》）。由于我们的 `out` 对象建立在`file`之上，因此相当于将宇宙终极问题的答案写入`file`。

需要指出一点：最好使用` Qt `整型来进行读写，比如程序中的`qint32`。这保证了在任意平台和任意编译器都能够有相同的行为。

我们通过一个例子来看看 `Qt` 是如何存储数据的。例如`char *`字符串，在存储时，会首先存储该字符串包括` \0 `结束符的长度（32位整型），然后是字符串的内容以及结束符` \0`。在读取时，先以` 32 `位整型读出整个的长度，然后按照这个长度取出整个字符串的内容。

但是，如果你直接运行这段代码，你会得到一个空白的 `file.dat`，并没有写入任何数据。这是因为我们的`file`没有正常关闭。为性能起见，数据只有在文件关闭时才会真正写入。因此，我们必须在最后添加一行代码：

```cpp
file.close(); // 如果不想关闭文件，可以使用 file.flush();
```

重新运行一下程序，你就得到宇宙终极问题的答案了。

我们已经获得宇宙终极问题的答案了，下面，我们要将这个答案读取出来：

```cpp
QFile file("file.dat");
file.open(QIODevice::ReadOnly);
QDataStream in(&file);
QString str;
qint32 a;
in >> str >> a;
```

这段代码没什么好说的。唯一需要注意的是，你必须按照写入的顺序，将数据读取出来。也就是说，程序数据写入的顺序必须预先定义好。在这个例子中，我们首先写入字符串，然后写入数字，那么就首先读出来的就是字符串，然后才是数字。顺序颠倒的话，程序行为是不确定的，严重时会直接造成程序崩溃。

由于二进制流是纯粹的字节数据，带来的问题是，如果程序不同版本之间按照不同的方式读取（前面说过，`Qt` 保证读写内容的一致，但是并不能保证不同 `Qt` 版本之间的一致），数据就会出现错误。因此，我们必须提供一种机制来确保不同版本之间的一致性。通常，我们会使用如下的代码写入：

```cpp
QFile file("file.dat");
file.open(QIODevice::WriteOnly);
QDataStream out(&file);

// 写入魔术数字和版本
out << (quint32)0xA0B0C0D0;
out << (qint32)123;

out.setVersion(QDataStream::Qt_4_0);

// 写入数据
out << lots_of_interesting_data;
```

所谓魔术数字，是二进制输出中经常使用的一种技术。二进制格式是人不可读的，并且通常具有相同的后缀名（比如 `dat` 之类），因此我们没有办法区分两个二进制文件哪个是合法的。所以，我们定义的二进制格式通常具有一个魔术数字，用于标识文件的合法性。在本例中，我们在文件最开始写入 `0xA0B0C0D0`，在读取的时候首先检查这个数字是不是 `0xA0B0C0D0`。如果不是的话，说明这个文件不是可识别格式，因此根本不需要去继续读取。一般二进制文件都会有这么一个魔术数字，例如 `Java` 的 `class` 文件的魔术数字就是 `0xCAFEBABE`，使用二进制查看器就可以查看。魔术数字是一个 `32` 位的无符号整型，因此我们使用`quint32`来得到一个平台无关的 `32` 位无符号整型。

`out << (qint32)123`是标识文件的版本。我们用魔术数字标识文件的类型，从而判断文件是不是合法的。但是，文件的不同版本之间也可能存在差异：我们可能在第一版保存整型，第二版可能保存字符串。为了标识不同的版本，我们只能将版本写入文件。比如，现在我们的版本是 `123`。

`out.setVersion(QDataStream::Qt_4_0)`上面一句是文件的版本号，但是，`Qt `不同版本之间的读取方式可能也不一样。这样，我们就得指定` Qt` 按照哪个版本去读。这里，我们指定以`Qt 4.0` 格式去读取内容。

当我们这样写入文件之后，我们在读取的时候就需要增加一系列的判断：
```cpp
QFile file("file.dat");
file.open(QIODevice::ReadOnly);
QDataStream in(&file);

// 检查魔术数字
quint32 magic;
in >> magic;
if (magic != 0xA0B0C0D0) 
{
    return BAD_FILE_FORMAT;
}

// 检查版本
qint32 version;
in >> version;
if (version < 100) {
    return BAD_FILE_TOO_OLD;
}
if (version > 123) {
    return BAD_FILE_TOO_NEW;
}

if (version <= 110) {
    in.setVersion(QDataStream::Qt_3_2);
} else {
    in.setVersion(QDataStream::Qt_4_0);
}

// 读取数据
in >> lots_of_interesting_data;
if (version >= 120) {
    in >> data_new_in_version_1_2;
}
in >> other_interesting_data;
```

我们通过下面一段代码看看什么是流的形式：
```cpp
QFile file("file.dat");
file.open(QIODevice::ReadWrite);

QDataStream stream(&file);
QString str = "the answer is 42";
QString strout;

stream << str;
file.flush();
stream >> strout;
```

在这段代码中，我们首先向文件中写入数据，紧接着把数据读出来。有什么问题吗？运行之后你会发现，`strout`实际是空的。为什么没有读取出来？我们不是已经添加了`file.flush()`;语句吗？原因并不在于文件有没有写入，而是在于我们使用的是“流”。**所谓流，就像水流一样，它的游标会随着输出向后移动**。当使用`<<`操作符输出之后，流的游标已经到了最后，此时你再去读，当然什么也读不到了。所以你需要在输出之后重新把游标设置为` 0 `的位置才能够继续读取。具体代码片段如下：

```cpp
stream << str;
stream.device()->seek(0);
stream >> strout;
```

## 文本文件读写
