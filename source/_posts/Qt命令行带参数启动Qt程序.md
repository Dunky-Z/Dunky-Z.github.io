---
title: Qt命令行带参数启动Qt程序
date: 2021-09-13 12:03:44
tags: [Qt]
---

## 简介
我们经常用到命令行参数，比如最常见的Linux命令，显示所有文件`ls -a`,`ls`其实就是一个程序，`-a`就是该程序需要解析的一个参数。那么如何能让Qt程序也能解析命令行参数，从命令行启动呢？

Qt从5.2版开始提供了两个类`QCommandLineOption`和`QCommandLineParser`来解析应用的命令行参数。

## 添加程序属性信息，帮助，版本
一个程序启动后，我们会在命令行看到程序的一些简要信息，以及可以使用`-v`命令显示其版本信息，这些通用的参数以及被Qt分装好，可以直接使用。

```cpp
#include "mainwindow.h"

#include <QApplication>
#include <QCommandLineParser>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QCommandLineParser parser;                        // 定义解析实例
    parser.setApplicationDescription("TestCommandLine");  // 描述可执行程序的属性
    parser.addHelpOption();                           // 添加帮助命令
    parser.addVersionOption();                        // 添加版本选择命令
    parser.process(a);                                // 把用户的命令行的放入解析实例
    MainWindow w;
    w.show();
    return a.exec();
}
```
运行结果：
```sh
➜ ./CommandLine -h
Usage: ./CommandLine [options]
TestCommandLine

Options:
  -h, --help     Displays help on commandline options.
  --help-all     Displays help including Qt specific options.
  -v, --version  Displays version information.
```

## 自定义参数
```cpp
#include "mainwindow.h"
#include <QApplication>
#include <QCommandLineParser>
#include <QCommandLineOption>
int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QCommandLineParser parser;                        // 定义解析实例
    parser.setApplicationDescription("TestCommandLine");  // 描述可执行程序的属性
    parser.addHelpOption();                           // 添加帮助命令
    parser.addVersionOption();                        // 添加版本选择命令

    QCommandLineOption  CommandExe("c", QGuiApplication::translate("main","Take  the  first  argument  as a command to execute, "
                                                          "rather than reading commands from a script or standard input.  "
                                                          "If  any  fur‐\ther  arguments  are  given,  "
                                                          "the  first  one is assigned to $0,"
                                                          " rather than being used as a positional parameter."));

    parser.addOption(CommandExe);
    parser.process(a);                                // 把用户的命令行的放入解析实例
    MainWindow w;
    w.show();
    return a.exec();
}
```

运行结果：
```
➜ ./CommandLine -h
Usage: ./CommandLine [options]
TestCommandLine

Options:
  -h, --help     Displays help on commandline options.
  --help-all     Displays help including Qt specific options.
  -v, --version  Displays version information.
  -c             Take  the  first  argument  as a command to execute, rather
                 than reading commands from a script or standard input.  If  any
                 fur‐	her  arguments  are  given,  the  first  one is assigned
                 to $0, rather than being used as a positional parameter.
```

## 获取参数值

如果需要从命令行获取参数值，那么必须要给参数值，指定一个名字。如，参数接收的是路径，可以`setValueName("path")`，如，参数接收的是个数值，可以`setValueName("value")`。

如果不设置参数值名称，那么将无法获取其值。