---
title: 每天学命令-ln软硬链接
date: 2021-08-03 11:57:02
tags: [每天学命令,linux]
---


Linux ln（英文全拼：link files）命令是一个非常重要命令，它的功能是为某一个文件在另外一个位置建立一个同步的链接。这有点像Windows环境下的快捷方式。介绍命令前了解一下软链接，硬链接具体是什么。

## 硬链接 Hard Link
在 Linux 系统中，每个文件对应一个 `inode`，文件的内容在存储在 `inode` 指向的 `data block` 中。要读取该文件的内容，需要通过文件所在的目录中记录的**文件名**找到文件的 `inode` 号，然后通过 `inode` 找到存储文件内容的 `data block`。当然多个**文件名**可以指向同一个`inode`。

使用`ll`命令显示文件的详细信息，`-i`参数显示其结点信息，其中最前面的一串数字就是`inode`信息。我们以`/opt/test.txt`文件为例，查看其结点信息。
```
dominic@hanhan:/opt$ ll -i test.txt 
2498138 -rw-r--r-- 1 root root 4 8月   3 12:16 test.txt
```
使用 `ln` 命令在`/opt/temp`目录下创建一个 `test.txt` 文件的硬链接，然后观察其文件属性：
```
dominic@hanhan:/opt/temp$ sudo ln ../test.txt .
dominic@hanhan:/opt/temp$ ll -i ../test.txt test.txt 
2498138 -rw-r--r-- 2 root root 4 8月   3 12:16 ../test.txt
2498138 -rw-r--r-- 2 root root 4 8月   3 12:16 test.txt
```
我们再用`ll -i`命令查看结点信息，发现这两个文件名的结点信息是一样的。说明这两个文件名指向的是同一个文件。其中第三个字段是**链接数**，数字`2`，表示有两个文件名链接到同一个`inode`。

#### 硬链接的特点
- 硬链接，以文件副本的形式存在。但不占用实际空间。
由于硬链接只是在目录中添加了一条包含文件名和 对应 inode 的记录，所以它几乎不会消耗额外的磁盘容量。
- 不允许给目录创建硬链接
- 硬链接只有在同一个文件系统中才能创建
- 只要还有一个文件名引用着文件，文件就不会被真正删除
删除硬链接所关联的文件时，其实只是删除了一条目录中的记录，真正的文件并不受影响。只有在删除最后一个硬链接时才会真正删除文件的内容数据。

## 软链接 Symbolic Link
软链接的实现方式与硬链接有本质上的不同。创建软链接时会创建一个新的文件(分配一个` inode` 和对应的 `data block`)，新文件的 `data block` 中存储了目标文件的路径。

我们以`/opt/test.txt`为例，在`/opt/temp`目录中，为其创建一个软链接，然后查看其`inode`结点信息。
```
dominic@hanhan:/opt/temp$ sudo ln -s ../test.txt test2.txt
dominic@hanhan:/opt/temp$ ll -i ../test.txt test2.txt 
2498139 lrwxrwxrwx 1 root root 11 8月   3 14:01 test2.txt -> ../test.txt
2498138 -rw-r--r-- 2 root root  4 8月   3 12:16 ../test.txt
```
- 第一个字段不同，说明是两个文件了
- 第二个字段表示权限，第一个字母表示文件类型，`l`说明书软链接文件
- 第三个字段表示链接数，仍然是`2`，说明软链接不增加源文件链接数
- 第六个字段是文件大小，新建的软链接文件时11字节，这就是`/opt/test.txt`的长度。

#### 软链接特点
- 软链接，以路径的形式存在。类似于Windows操作系统中的快捷方式
- 软链接可以 跨文件系统 ，硬链接不可以
- 软链接可以对一个不存在的文件名进行链接
- 软链接可以对目录进行链接


## 使用实例
ln [参数][源文件或目录][目标文件或目录]
为文件`test.txt`创建一个硬链接
```
sudo ln test.txt /etc/
```
删除`test.txt`的硬链接，因为是以副本形式存在的，所以直接用`rm`命令将其删除即可。
```
sudo rm /etc/test.txt 
```
为文件`test.txt`创建一个软链接
```
sudo ln -s test.txt /etc/test2.txt
```
删除软链接也一样，直接用`rm`命令删除软链接的名称即可。


## Reference
- https://www.runoob.com/linux/linux-comm-ln.html
- https://www.cnblogs.com/lixuze/p/14248559.html