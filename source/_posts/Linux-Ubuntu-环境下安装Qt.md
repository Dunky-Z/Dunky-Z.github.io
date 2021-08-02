---
title: Linux(Ubuntu)环境下安装Qt
date: 2021-07-27 16:34:50
tags: [qt,linux]
---
## 下载Qt
从Qt5.15.0起，对于开源用户，Qt官方不再提供独立安装文件，且不再有bug修复版本（比如Qt5.15.1），如果从官网下载，需要自己编译。虽然想试试编译，但是虚拟机刚开始开的空间太小了，还是另寻他法吧。以后有机会再来编译试试新功能。若读者有兴趣可以从[官网](https://download.qt.io/archive/qt/)下载源码并编译。或者参考[官方的编译教程](https://wiki.qt.io/Building_Qt_5_from_Git#Getting_the_source_code)，从github上下载。

国内有一些镜像站，提供qt镜像下载：
清华大学：https://mirrors.tuna.tsinghua.edu.cn/qt/archive/qt/
中国科学技术大学：http://mirrors.ustc.edu.cn/qtproject/
北京理工大学：https://mirrors.cnnic.cn/qt/

以清华大学的镜像为例，找到`archive/qt/5.14/5.14.0/qt-opensource-linux-x64-5.14.0.run`，点击即可开始下载。
>qt 5.15已经不提供安装包，想要最新版本，只能下5.14,但是5.14.2下载没资源，下不动，如果遇到下不动的情况换一个版本吧

## 安装Qt
下载的`.run`文件双击是无法安装的，因为它还没有可执行的权限，需要我们赋给它执行权限，打开终端进入安装包的目录。
```
chmod +x filename.run
```
`chmod`命令是控制用户对文件的权限修改的命令，`x`是可执行权限的参数。
执行以上命令后就可以直接双击安装了。

网上一些教程可以跳过登录，我没找到跳过按钮，需要注册一个账号才能继续安装。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728092743.png)

安装目录一般选择在`/opt`目录下
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728092813.png)

安装的附加组件最好都选择，以免后期使用再安装麻烦。Qt Creator肯定要装的。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728093014.png)

## 安装依赖库
```
apt-get install g++
apt-get install libgl1-mesa-dev
apt-get install libqt4-dev
apt-get install build-essential # Build Essential，它是一个元软件包，可让您在Ubuntu中安装和使用c ++工具。
sudo apt install qt5-default # 如果要将Qt 5用作默认的Qt Creator版本需要安装，否则会报 qmake: could not find a Qt installation of ''的错误
```

## 使用Qt Creator创建第一个程序
### 使用Qt Creator创建
首先我们先创建一个不带窗口的HelloWorld程序，测试安装是否成功，打开Qt Creator-文件-新建文件或项目，选择Non-Qt Project-Plain C++ Application。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728102920.png)
接下来就设置项目名等，一直下一步。完成后就可以在编辑器看到如下
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728103424.png)

点击左下角运行按钮就可以得到如下：
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728103540.png)

再创建一个带窗口的HelloWorld，在选择模板时选择Application-Qt Widgets Application。一路点下一步就可以完成创建，运行后就可得到一个灰白的HelloWorld窗口。

### 命令行编译第一个Qt程序
首先创建工作目录`HelloWorldQt`
```
mkdir HelloWorld
```
进入项目目录下，新建一个`main.cpp`文件
```bash
cd HelloWorldQt
vim main.cpp
```
编辑以下内容：
```c++
#include <QApplication>
#include <QLabel>
#include <QWidget>

int main(int argc, char *argv[ ])
{
    QApplication app(argc, argv);
    QLabel hello("<center>Welcome to my first Qt program</center>");
    hello.setWindowTitle("My First Qt Program");
    hello.resize(400, 400);
    hello.show();
    return app.exec();
}
```
建立QtProject文件
```
qmake -project
```
用`vim`打开`HelloWorldQt.pro`文件，添加以下内容
```
QT += gui widgets
```
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210730095602.png)
运行`qmake`，使项目platform-specific，会得到一个`Makefile`文件
```
qmake HelloWorldQt.pro 
```
使用`make`命令将`Makefile`编译为可执行程序
```
➜  HelloWorldQt make
g++ -c -pipe -O2 -Wall -W -D_REENTRANT -fPIC -DQT_DEPRECATED_WARNINGS / 
-DQT_NO_DEBUG -DQT_WIDGETS_LIB /
-DQT_GUI_LIB -DQT_CORE_LIB -I. / 
-I. -isystem / 
/usr/include/x86_64-linux-gnu/qt5 -isystem / 
/usr/include/x86_64-linux-gnu/qt5/QtWidgets /
-isystem /usr/include/x86_64-linux-gnu/qt5/QtGui /
-isystem /usr/include/x86_64-linux-gnu/qt5/QtCore -I. /
-I/usr/lib/x86_64-linux-gnu/qt5/mkspecs/linux-g++ -o main.o main.cpp
g++ -Wl,-O1 -o HelloWorldQt main.o  /
/usr/lib/x86_64-linux-gnu/libQt5Widgets.so /
/usr/lib/x86_64-linux-gnu/libQt5Gui.so / 
/usr/lib/x86_64-linux-gnu/libQt5Core.so /
/usr/lib/x86_64-linux-gnu/libGL.so -lpthread 
```
如果一切顺利，执行可以得到如下
```
./HelloWorldQt 
```
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728112155.png)