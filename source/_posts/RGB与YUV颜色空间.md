---
title: RGB与YUV颜色空间
date: 2022-03-01 16:00:03
updated:
tags:
categories:
---

## 基础概念
RGB和YUV都属于一种颜色编码方式，或者说颜色空间。

RGB色彩模式是工业界的一种颜色标准，是通过对红、绿、蓝三个颜色通道的变化以及它们相互之间的叠加来得到各式各样的颜色的，RGB即是代表红、绿、蓝三个通道的颜色，这个标准几乎包括了人类视力所能感知的所有颜色，是目前运用最广的颜色系统之一。


在YUV空间中，Y代表亮度，其实Y就是图像的灰度值；UV代表色差，U和V是构成彩色的两个分量。在现代彩色电视系统中，通常采用三管彩色摄影机或彩色CCD摄影机进行取像，然后把取得的彩色图像信号经分色、分别放大校正后得到RGB，再经过矩阵变换电路得到亮度信号Y和两个色差信号B--Y(即U)、R--Y(即V)，最后发送端将亮度和色差三个信号分别进行编码，用同一信道发送出去。这种色彩的表示方法就是所谓的YUV色彩空间表示。

## 解析

### RGB格式

#### RGB16

RGB16数据格式主要有二种：RGB565和RGB555。

RGB565,每个像素用16比特位表示，占2个字节，RGB分量分别使用5位、6位、5位。

```C
//获取高字节的5个bit
R = color & 0xF800;
//获取中间6个bit
G = color & 0x07E0;
//获取低字节5个bit
B = color & 0x001F;
```

RGB555,每个像素用16比特位表示，占2个字节，RGB分量都使用5位(最高位不用)。
```C
//获取高字节的5个bit
R = color & 0x7C00;
//获取中间5个bit
G = color & 0x03E0;
//获取低字节5个bit
B = color & 0x001F;
```

#### RGB24
RGB24图像每个像素用24比特位表示，占3个字节，注意：在内存中RGB各分量的排列顺序为：**BGR BGR BGR**。

#### RGB32
RGB32图像每个像素用32比特位表示，占4个字节，R，G，B分量分别用8个bit表示，存储顺序为B，G，R，最后8个字节保留。注意：在内存中RGB各分量的排列顺序为：**BGRA BGRA BGRA** ......。

本质就是带alpha通道的RGB24，与RGB32的区别在与，保留的8个bit用来表示透明，也就是alpha的值。

```C
R = color & 0x0000FF00;
G = color & 0x00FF0000;
B = color & 0xFF000000;
A = color & 0x000000FF;
```

### YUV采样
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220301170332.png)

- YUV444：一个像素就有YUV三个值，和RGB类似；一个YUV占8+8+8 = 24bits 3个字节。
- YUV422：第一个像素有YUV三个值，第二个像素只有Y，与前一个像素共用UV；一个YUV占8+4+4 = 16bits 2个字节。
- YUV420：上下四个像素共用一个UV。一个YUV占8+2+2 = 12bits 1.5个字节。


## 转换

### YUV2RGB

$$
R = Y + 1.403 \times (V-128)\\
G=Y-0.343 \times (U-128) - 0.714 \times (V-128)\\
B=Y + 1.770 \times (U-128)
$$

### RGB2YUV

$$
Y = 0.299 \times R + 0.587 \times G + 0.114 \times B\\
U = -0.169 \times R - 0.331 \times G + 0.500 \times B + 128\\
V = 0.500 \times R - 0.419 \times G - 0.081 \times B + 128\\
$$

浮点型运算比较耗时，将所有运算换成位运算，提高效率。具体推倒过程见[色彩转换系列之RGB格式与YUV格式互转原理及实现_小武的博客-CSDN博客_rgb yuv](https://blog.csdn.net/weixin_40647819/article/details/92619298)

```C
Y= ((R << 6) + (R << 3) + (R << 2) + R + (G << 7) + (G << 4) + (G << 2) + (G << 1) + (B << 4) + (B << 3) + (B << 2) + B) >> 8
U= (-((R << 5) + (R << 3) + (R << 1)+ R) - ((G << 6) + (G << 4) + (G << 2)+G) + (B << 7) + 32768) >> 8
V= ((R << 7) - ((G << 6) + (G << 5) + (G << 3) + (G << 3) + G) - ((B << 4) + (B << 2) + B) + 32768 )>> 8
```


## 参考
[RGB和YUV - 简书](https://www.jianshu.com/p/cd7e73005ac4)
[颜色空间YUV简介_网络资源是无限的-CSDN博客_yuv颜色空间](https://blog.csdn.net/fengbingchun/article/details/50216901)
[图解RGB565、RGB555、RGB16、RGB24、RGB32、ARGB32等格式的区别_handy周-CSDN博客_rgb565](https://blog.csdn.net/byhook/article/details/84262330)
[图解YU12、I420、YV12、NV12、NV21、YUV420P、YUV420SP、YUV422P、YUV444P的区别_handy周-CSDN博客_yv12](https://blog.csdn.net/byhook/article/details/84037338)