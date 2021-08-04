---
title: Qt添加资源文件
date: 2021-08-04 11:34:10
tags: [Qt]
---
>本文是学习【[Qt学习之路](https://www.devbean.net/2012/08/qt-study-road-2-catelog/)】的学习笔记，源码非原创。[Github](https://github.com/Dunky-Z/learning-qt/tree/main/MainWindow)同步本文更改的代码。

在
## 资源文件
Qt 资源系统是一个跨平台的资源机制，用于将程序运行时所需要的资源以二进制的形式存储于可执行文件内部。如果你的程序需要加载特定的资源（图标、文本翻译等），那么，将其放置在资源文件中，就再也**不需要担心这些文件的丢失**。也就是说，如果你将资源以资源文件形式存储，它是会**编译到可执行文件内部**。

使用QtCreator的[相关方法](https://www.devbean.net/2012/08/qt-study-road-2-resource-files/)，讲得也很清楚了，就不赘述了。


## 不使用QtCreator添加资源文件
在使用命令行编译运行时，并不能像在QtCreator中一样，可以自动的生成一个`.qrc`文件，这就需要我们自己去编写。从原文的讲解中我们也知道，它就是一个`XML`描述文件，里面定义了文件位置等信息。如原文中的`.qrc`文件：
```
<RCC>
    <qresource prefix="/images">
        <file alias="doc-open">document-open.png</file>
    </qresource>
</RCC>
```
其中
```
<RCC>
    <qresource>

    </qresource>
</RCC>
```
是固定的标记，再往中间加东西。如果学过`html`语言就很容易理解。其中`prefix="/images"`就是自动加上前缀`/images`，因为图片在`images`目录下，每次都加这个路径太麻烦，太长。

`alias="doc-open"`意思是将`document-open.png`这个文件起个别名，原来的太长了。下次再用`document-open.png`就只需要用`doc-open`就行了。



我们知道了这些，就可以编写一个自己的`.qrc`文件了。我也自己下载了一个打开文件的图标`open.png`，文件比较少，就和代码放在同一个目录下了。我们将其命名为`ico.qrc`，这个文件中以后都存放有关图标的资源，我们开始编写：
```
<RCC>
    <qresource>
        <file>open.png</file>
    </qresource>
</RCC>
```

因为添加资源后需要更新`.pro`文件才能正常编译，所以需要在`.pro`中加入`RESOURCES` 信息，就在`.pro`文件最后一行加入：
```
RESOURCES += ico.qrc
```

然后输入命令
```
qmake MainWindow.pro
make clean #因为之前可能make过，先清理一遍
make
./MainWindow
```
如果一切顺利，将会得到下面的窗口：
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210804120719.png)

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210804120739.png)
## Reference
1. https://www.devbean.net/2012/08/qt-study-road-2-action/