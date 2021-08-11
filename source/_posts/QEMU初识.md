---
title: QEMU初识
date: 2021-07-23 11:54:49
tags: [Linux,QEMU]
---


## 简介
QEMU是一款开源的模拟器及虚拟机监管器(Virtual Machine Monitor, VMM)。QEMU主要提供两种功能给用户使用。一是作为用户态模拟器，利用动态代码翻译机制来执行不同于主机架构的代码。二是作为虚拟机监管器，模拟全系统，利用其他VMM(Xen, KVM, etc)来使用硬件提供的虚拟化支持，创建接近于主机性能的虚拟机。

## 安装
### 使用包管理安装
```
sudo apt-get install qemu
```
#### 使用源码安装
```
wget wget https://download.qemu.org/qemu-6.1.0-rc3.tar.xz
tar xvJf qemu-6.1.0-rc3.tar.xz
cd qemu-6.1.0-rc3
```
通过` ./configure --help` 的查看编译时的选项，` --target-list`选项为可选的模拟器，默认全选。
`--target-list` 中的 `xxx-soft` 和 `xxx-linux-user` 分别指系统模拟器和应用程序模拟器, 生成的二进制文件名字为` qemu-system-xxx `和 `qemu-xxx`
本文使用如下配置：

```
./configure --prefix=XXX --enable-debug --target-list=riscv32-softmmu,riscv32-linux-user --enable-kvm
# --prefix 选项设置qemu的安装位置绝对路径，之后若要卸载删除qemu只要删除该文件夹即可，--enable-kvm开启kvm
# config完，可以在指定的qemu安装文件夹下面找到config-host.mak文件，
# 该文件记录着qemu配置的选项，可以和自己设置的进行对比，确保配置和自己已知
```
接着进行编译
```
make -j8
```
直接`make`会很慢，第一次编译时默认安装说有模拟器，编译了三四个小时。加上`-j8`可以进行多线程编译

## 创建与使用
### 创建虚拟镜像
使用虚拟镜像来模拟虚拟机的硬盘，在启动虚拟机之前需要创建一个镜像文件
```
root@hanhan:/home/dominic/qemu/# qemu-img create -f qcow2 qmtest.img 10G
Formatting 'qmtest.img', fmt=qcow2 size=10737418240 encryption=off cluster_size=65536 lazy_refcounts=off 
root@hanhan:/home/dominic/qemu/# ls
qmtest.img
```
`-f`选项用于指定镜像的格式，`qcow2`格式是QEMU最常用的镜像格式，采用写时复制技术来优化性能。`qmtest.img`是镜像文件的名字，`10G`是镜像文件大小。

镜像文件创建完成后，可使用`qemu-system-x86`来启动`x86`架构的虚拟机：
```
qemu-system-x86_64 qmtest.img
```
qmtest.img中还未安装操作系统，所以会提示“No bootable device”的错误。



### 准备操作系统镜像
下载需要的Linux发行版镜像文件,https://launchpad.net/ubuntu/+cdmirrors， 找到想要下载的镜像，这里以交通大学的镜像为例
右击链接复制地址：https://ftp.sjtu.edu.cn/ubuntu-cd/20.10/ubuntu-20.10-live-server-amd64.iso
```
root@hanhan:/home/dominic/qemu/# wget https://ftp.sjtu.edu.cn/ubuntu-cd/20.10/ubuntu-20.10-live-server-amd64.iso
```
### 检查KVM是否可用
QEMU使用KVM来提升虚拟机性能，如果不启用KVM会导致性能损失。要使用KVM，首先要检查硬件是否有虚拟化支持：
```
root@hanhan:/home/dominic/qemu/# grep -E 'vmx|svm' /proc/cpuinfo
```
如果有输出则表示硬件有虚拟化支持。其次要检查kvm模块是否已经加载：
```
root@hanhan:/home/dominic/qemu/# lsmod | grep kvm
kvm_intel             142999  0 
kvm                   444314  1 kvm_intel
```
如果`kvm_intel/kvm_amd`、`kvm`模块被显示出来，则`kvm`模块已经加载。最后要确保qemu在编译的时候使能了`KVM`，即在执行`configure`脚本的时候加入了`–enable-kvm`选项。


### 启动虚拟机安装操作系统
```
root@hanhan:/home/dominic/qemu/# qemu-system-x86_64 -m 2048 -enable-kvm qmtest.img -cdrom ./Fedora-Live-Desktop-x86_64-20-1.iso
```
`-m `指定虚拟机内存大小，默认单位是MB，`-enable-kvm`使用KVM进行加速，`-cdrom`添加fedora的安装镜像。可在弹出的窗口中操作虚拟机，安装操作系统，安装完成后重起虚拟机便会从硬盘(qmtest.img)启动。之后再启动虚拟机只需要执行：
```
root@hanhan:/home/dominic/qemu/#  qemu-system-x86_64 -m 2048 -enable-kvm qmtest.img
```

## 退出qemu
在运行qemu后，关闭图形界面但是终端仍然是处于qemu环境中，可以直接关闭终端退出。如果不想关闭终端，可以另外打开一个终端kill进程
```
killall qemu-system-riscv32
```
如果记不清全称，可以输入大概名称回车后会列出相关的进程