---
title: Linux帧缓冲
date: 2022-01-17 17:38:04
updated:
tags: [Linux]
categories:
---
## 简介

FrameBuffer 是内核当中的一种驱动程序接口。Linux是工作在保护模式下，所以用户态进程是无法象DOS那样使用显卡BIOS里提供的中断调用来实现直接写屏，Linux抽象出 FrameBuffer这个设备来供用户态进程实现直接写屏。

Framebuffer机制模仿显卡的功能，将显卡硬件结构抽象掉，可以通过Framebuffer的读写直接对显存进行操作。用户可以将Framebuffer看成是显示内存的一个映像，将其映射到进程地址空间之后，就可以直接进行读写操作，而写操作可以立即反应在屏幕上。 这种操作是抽象的，统一的。用户不必关心物理显存的位置、换页机制等等具体细节。这些都是由Framebuffer设备驱动来完成的。 

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220118092227.png)

## 帧缓冲主要结构
- fb_info
    该结构体记录当前帧缓冲设备的状态信息，如果系统中有多个帧缓冲设备，就需要两个fb_info结构，这个结构只在内核中可以看到，对用户空间不可见。

- fb_var_screeninfo
    该结构体记录指定的帧缓冲设备和显示模式中可以被修改的信息，其中包括显示器分辨率等信息。

- fb_fix_screeninfo
    该结构体表示帧缓冲设备中一些不能修改的参数，包括特定的显示模式，屏幕缓冲区的物理地址，显示缓冲区的长度信息。

- fb_ops
    LCD底层硬件操作接口集。比如`fb_open`、`fb_release`、`fb_read`、`fb_write`、`fb_ioctl`、`fb_mmap`等：


- fb_cmap
    `fb_cmap`指定颜色映射，用于以内核可以理解的方式存储用户的颜色定义。


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220117192106.png)

## 帧缓冲显示原理
帧缓冲设备是一种显示抽象的设备，也可以被理解为它是一个内存区域，上面的应用程序可以直接对显示缓冲区进行读和写操作，就像访问文件的通用接口一样，用户可以认为帧缓冲是一块内存，能读取数据的内存块也可以向这个内存写入数据，因此显示器显示图形界面实际上根据根据的是指定的内存数据块内的数据。

帧缓冲的显示缓冲区位于Linux内核地址空间，应用程序不能直接访问内核地址空间，在Linux中，只有一个内存的内核地址空间映射到用户地址空间才可以由用户访问，内存的映射是通过`MMAP`函数实现的在Linux中。对于帧缓冲，虚拟地址是通过内存映射的方法将显示缓冲区内核地址映射到用户空间的，然后用户可以通过读和写这部分的虚拟地址来访问显示缓冲区，在屏幕上绘图。

## 使用流程

使用帧缓冲之前应该首先确定Linux系统上已安装了帧缓冲驱动，可以在目录`/dev/`下查找`fb*`如，`/dev/fb0, /dev/fb1`等设备来确定是否安装。如果没有需要安装一个帧缓冲驱动的模块到内核，或者重新编译内核生成一个带帧缓冲模块的镜像。

使用帧缓冲需要进入控制台模式，即纯命令行的模式进行编程。一般可以通过快捷键`CTRL+ALT+F1`进入控制台模式，`CTRL+ALT+F7`切回图形窗口。如果控制台模式没有登录，可以`CTRL+ALT+F6`尝试登录。

因硬件显示设备的物理显示区是通过帧缓存区操作，而帧缓存区是处于内核空间，应用程序不能随意操作，此时可以通过系统调用`mmap`把帧缓存映射到用户空间，在用户空间中创建出帧缓存映射区（用户图像数据缓存区），以后只需把用户图像数据写入到帧缓存映射区就可在硬件设备上显示图像。



具体实现流程如下：

### 打开帧缓冲设备`/dev/f0`。
在Linux的/dev目录的寻找b*设备文件然后使用读写模式打开它， Linux系统将使用通用的`open`系统调用来完成功能， `open`的功能原型如下:
```
int open(const char *path, int oflags);
```
- `Path`是准备打开的文件或设备的路径参数；
- `oflags`指定打开文件时使用的参数；
- `flags`参数的指定，是通过组合文件访问模式和其他的可选模式一起的，可以支持多个模式或，参数必须是指定下列文件的访问模式。
    - 只读：O_RDONLLY
    - 只写：O_WRONLY
    - 读写：O_RDWR


简而言之， `open`函数建立设备文件的访问路径。如果操作成功，它返回一个文件描述符，只是一个文件描述符，它将不使用其他任何正在运行的进程共享。如果两个程序同时打开相同的文件，将得到两个不同的文件描述符。如果他们执行文件写入操作，他们将操作每个文件描述符，不会发生冲突，写完之后退出。他们的数据不会互相交织在一起的，但会互相的彼此覆盖(后写完的内容覆盖前面写的内容)，两个程序来读取和写入的文件位置看似一样但是有各自不同拷贝所以不会发生交织。如果`open`调用未能返回`1`，则将全局变量`errno`设置为指示失败的原因。


### 通过系统调用`ioctl`函数获得帧设备相关信息

通过顿缓冲文件描述符，屏幕的分辨率、颜色深度等信息可以被获得，帧缓冲驱动中存放了这些对应的信息，必须使用Linux系统调用`ioctl`首先将帧缓冲的文件描述符和`fb_var_screeninfo` 结构体对应起来。

结构体`fb_var_screeninfo`包含以下三个重要数据结构:
- 屏幕的x方向分辨率，像素作为单位。
- 屏幕的Y方向分辨率，像素作为单位。
- 屏幕的像素颜色深度，每个像素用多少比特数表示。

`ioctl`函数原型如下:
```c
extern int ioctl (int __fd, unsigned long int __request, ...) __THROW;
```
`ioctl`调用实现访问设备驱动各种各样的配置信息功能，它提供了一个控制设备的行为和配置底层服务接口的驱动函数，各种设备驱动程序，例如套接字和系统终端，还有磁带机都有`ioctl`命令可以支持。

`__request`是`ioctl`函数将要执行的命令，实现参数给定的对象描述符中指定的函数操作，各种设备支持的功能是有差异的，还有可能存在令一个可选的第三个参数，第一个参数在`ioctl`命令中是该帧缓冲的文件描述符，`FBIOGET_VSCREENINFO`是第二个参数，第三个参数是一个指针用来指向结构体`fb_var_screeninfo`。最后使用者可以通过结构体`fb_var_screeninfo`来获得屏幕的分辨率和颜色位深和其他重要的屏幕信息。根据这些信息可以计算屏幕缓冲区的大小:屏幕缓冲区大小(以字节为单位) = 屏幕宽度x高度x屏幕颜色深度/8

### 帧缓冲映射
在进行帧缓冲的`MMAP`映射之前，要先得到帧缓冲文件描述符，才能像屏幕上面显示，必须首先将缓冲区的内核地址映射映射到用户地址空间。Linux系统将使用`MMAP`系统调用完成功能，`MMAP`函数原型如下:
```c
extern void *mmap (void *__addr, size_t __len, int __prot,
		   int __flags, int __fd, __off_t __offset) __THROW;
```
- `__addr`：返回一个指向`mmap`函数的内存区域的指针，与内容相关的文件指针，通过指针可以访问帧缓冲区的内存区域。
- `__len`：可以请求使用特定内存地址，通过设置地址参数，如果值为`0`，将自动分配指针，这是推荐的做法，否则会降低程序的可移植性，因为不同的系统可用的地址范围是不一样的。

- `__prot`：设置内存访问的权限设定，通过端口相关的参数定义，位的定义值如下:
    - PORT-EXEC:允许内存段的执行。
    - PORTNONE:无法访问内存段。
    - PORT-READ:允许读取内存段。
    - PORT-WRITE:允许编写内存段。

- `__flags`：改变控制参数标志，能够影响该内存段的作用域，如下所示:
    - MAP-FIXED:内存段必须位于addr中指定的地址。
    - MAPSHARED:内存的修改保存到一个文件中。
    - MAP-PRIVATE:内存段是私人的，变化仅在本地范围内有效。

-  `__fd`：是通过一个`open`调用得到的访问文件的描述符。

- `offset`：用于指定访问数据的开始偏移量在内存段中，和访问普通文件使用方式是相同的，再指定文件描述符参数，以及访问的数据长度参数即可。

### 读写帧缓冲

`MMAP`返回的指针，可以访问到帧缓冲内存区，可以定位到屏幕缓冲区具体为每个显示像素的位置，通过读函数调用读取对应的位置数据在帧缓冲内存中，相反写操作对应于内存的写入数据可以显示内容写到屏幕上。
### 解除帧缓冲映射

在绘图完成后，帧缓冲文件描述符必须被释放之前，解除帧缓冲区的地址映射，使用Linux系统调用完成`mmap`函数的逆函数实现，即是`munmap`，函数的原型如下:
```c
extern int munmap (void *__addr, size_t __len) __THROW;
```

`addr`参数应该与调用`MMAP`时指定的参数值一致， `len`参数也应该与之前调用`MMAP`时指定的`len`参数保持一致。

`mmap`调用返回`0`成功，失败则返回`1`，同时将全局变量`erno`设置为指示失败的原因。

### 调用`close`关闭设备。

使用帧缓冲设备后，应关闭相应的文件描述符，使用Linux系统标准的函数完成关闭功能，`close`函数的原型如下:
```c
extern int close (int __fd);
```
`close`的参数和在开始调用`open`时指定的参数一致，文件描述符释放后可以重用，结束调用成功返回`0`，失败返回`1`。


## 帧缓冲实例

## Reference
[Linux驱动之Framebuffer子系统 | 量子范式](https://carlyleliu.github.io/2021/Linux%E9%A9%B1%E5%8A%A8%E4%B9%8BFramebuffer%E5%AD%90%E7%B3%BB%E7%BB%9F/)
[Linux驱动开发（9）——- framebuffer驱动详解 | 码农家园](https://www.codenong.com/cs106598190/)
[嵌入式系统中帧缓冲显示模块的设计与实现 - 中国知网](https://kns.cnki.net/kcms/detail/detail.aspx?dbcode=CMFD&dbname=CMFD201502&filename=1015587486.nh&uniplatform=NZKPT&v=KNvhApgKTzqH-mWxqP6f8BkbDR9mSjPHz8PfaxqDg2f1j30XqnHzSDsvwoqz-CbX)
[research/framebuffer/fivechess/fivechess-0.1 at master · tsuibin/research](https://github.com/tsuibin/research/tree/master/framebuffer/fivechess/fivechess-0.1)
[五子棋 framebuffer版 - 尚码园](https://www.shangmayuan.com/a/f67d260756ce42258a9ed4ef.html)
[FrameBuffer驱动程序分析_深入剖析Android系统-CSDN博客_framebuffer](https://blog.csdn.net/yangwen123/article/details/12096483)