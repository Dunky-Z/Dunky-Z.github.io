---
title: Qt编译后的程序放到指定目录，屏蔽qDebug输出
date: 2022-03-18 13:50:35
updated:
tags:
categories:
---
## 可执行程序放到指定目录
默认情况下QtCreator会将编译链接后的可执行程序与中间生成的文件防盗`build-***-`文件中，如何能将可执行文件生成在指定目录？

修改`.pro`:
```
CONFIG(debug ,debug|release){
    DESTDIR = ../debug
}else{
    DESTDIR = ../release
}
```

`debug`版本放在`../debug`目录中，`release`版本放在`../release`目录中。
## 屏蔽qDebug输出

```
CONFIG(debug ,debug|release){
    DEFINES -= QT_NO_DEBUG_OUTPUT
}else{
    DEFINES += QT_NO_DEBUG_OUTPUT
}
```

`QT_NO_DEBUG_OUTPUT`即为屏蔽qDebug输出的宏定义，可以在`debug`版本中不屏蔽qDebug输出，`release`版本中屏蔽qDebug输出。

## 参考
[QT屏蔽qDebug()、qWarning()打印信息_qq_35173114的博客-CSDN博客_qwarning](https://blog.csdn.net/qq_35173114/article/details/81037315)
[QT 的QDebug无法输出日志_amwha的专栏-程序员宅基地_qdebug打印不出来 - 程序员宅基地](https://www.cxyzjd.com/article/amwha/115263253)
[Qt Creator中的.pro文件的详解_hebbely的博客-CSDN博客_qt的pro文件](https://blog.csdn.net/hebbely/article/details/66970821)