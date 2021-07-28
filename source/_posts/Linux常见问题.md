---
title: Linux常见问题
date: 2021-07-27 11:04:51
tags:
---

#### 什么是shell，bash
shell的意思是“壳程序”，指的是能对操作系统和应用程序进行操作的接口程序，狭义的壳程序指的是命令行方面的软件，例如bash;广义上也包括图形界面下的程序。
shell不止有一种。例如：
- Bourne shell(简称为sh):第一个shell
- C shell(简称为csh):由于语法和C语言类似而得名
- Bourne Again Shell(简称为bash):这是对Bourne shell的增强版本
- Tenex C shell(简称tcsh):是C shell的增强版本
我们使用的Linux默认使用bash

#### 什么是.bashrc
.bashrc位于/home/<用户名>的目录下
bash 是一个能解释你输入进终端程序的东西，并且基于你的输入来运行命令。它在一定程度上支持使用脚本来定制功能，这时候就要用到 .bashrc 了。
为了加载你的配置，bash 在每次启动时都会加载 .bashrc 文件的内容。每个用户的 home 目录都有这个 shell 脚本。它用来存储并加载你的终端配置和环境变量。

#### 执行apt-get命令时无法获得锁 /var/lib/dpkg/lock
直接kill占用的进程
```shell
sudo kill 1627
```

上述方法行不通就强制解锁

```shell
sudo rm /var/cache/apt/archives/lock
sudo rm /var/lib/dpkg/lock
```

#### 普通用户下VSCode无法保存写入文件
sudo创建的目录，存取模式为只读，普通用户只具有可读的权限，必须只有root用户才可以进行修改和删除之类的操作，查看文件夹的属性可以看到。所以我们要把文件夹变更权限为普通用户可以编辑的状态，一条命令可以搞定．

```shell
chmod 777 -R  需要改变存取模式的目录
sudo chmod 600 ××× （只有所有者有读和写的权限）
sudo chmod 644 ××× （所有者有读和写的权限，组用户只有读的权限）
sudo chmod 700 ××× （只有所有者有读和写以及执行的权限）
sudo chmod 666 ××× （每个人都有读和写的权限）
sudo chmod 777 ××× （每个人都有读和写以及执行的权限）
```

ｘｘｘ可以是文件名也可以是单个文件，中间加的　-R 是递归这个目录下的所有目录和文件

#### find命令报错： paths must precede expression
查找以test为前缀的所有文件
```shell
find -name test*
````

报错paths must precede expression，多文件的查找的时候需要增加单引号
```shell
find -name 'test*'
```

#### linux shopt not found
因为我在zsh环境下进行的source操作，而shopt是bash的builtin命令，所以找不到shopt命令，有两个方法
1. 如果习惯了zsh环境，那么可以通过以下命令将shell环境切换到zsh下。
```shell
chsh -s /bin/zsh
```
此时在进行source操作就不会报错了
2. 直接退出zsh环境，用原生的shell进行source
```shell
exit #退出
source ~/.bashrc
```
加入更改到了zsh环境下，可以用同样的命令再切换回去
```shell
chsh -s /bin/bash
```

#### 在tmp文件夹下新建的文件消失不见了
tmp文件夹会自动删除保存的文件

#### Linux 和 BSD 有什么联系与区别
Linux 和 BSD 都是类 UNIX 操作系统。Linux 是由 Linus Torvalds 在芬兰上大学的时候开发的。BSD 则代表“Berkeley Software Distribution，伯克利软件套件”，其源于对加州大学伯克利分校所开发的贝尔实验室UNIX的一系列修改，它最终发展成一个完整的操作系统，现在有多个不同的BSD分支。
##### 内核与操作系统
Linux 只是一个内核，制作一个Linux操作系统发行版需要汇集各种软件，将他组合成一个像Ubuntu、Mint、Debian、RedHat这样的Linux发行版。而BSD代表其内核和操作系统。例如，FreeBSD 提供了 FreeBSD 内核和 FreeBSD 操作系统。它是作为一个单一的项目维护的。换句话说，如果你想要安装 FreeBSD，就只有一个 FreeBSD 可供你安装。如果你想要安装 Linux，你首先需要在许多 Linux 发行版之间选择。
##### 许可证差异
Linux 使用 GNU 通用公共许可证，即 GPL。如果你修改了 Linux 内核，并将其分发，你就必须放出您的修改的源代码。
BSD 使用 BSD 许可证。如果你修改了 BSD 内核或发行版，并且发布它，你根本不需要必须发布其源代码。
#### 将下载进程置于后台
```
nohup git clone https://github.com/~~/~~.git 
```
进程相关的操作
`jobs -l` ：看当前终端的当下的所有进程
`fg % 10` ：第10个任务调至前台
`bg % 11` ：第11个任务调至 后台
`kill - 9 pid`：`pid`代表进程号，`kill -9`表示强制杀死该进程

#### 下载的安装包无法执行安装，提示没有能处理的程序
需要为安装包`.run`文件赋予可执行权限
```
chmod +x filename.run
```
接下来就可以和windows下`.exe`文件一样安装软件了。

Linux chmod（英文全拼：change mode）命令是控制用户对文件的权限的命令

| 模式 | 名字 | 说明 |
| :-----:|:----: | :----: |
| r | 读 | 设置为可读权限 |
| w | 写 | 设置为可写权限 |
| x | 执行权限 | 设置为可执行权限 |
| X | 特殊执行权限 | 只有当文件为目录文件，或者其他类型的用户有可执行权限时，才将文件权限设置可执行 |
| s | setuid/gid | 当文件被执行时，根据who参数指定的用户类型设置文件的setuid或者setgid权限 |
| t | 粘贴位 | 只有超级用户可以设置该位，只有文件所有者u可以使用该位 |


