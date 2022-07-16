---
title: 解决unable to install libpng12.so.0
date: 2022-01-05 13:01:47
updated:
tags: [Bug, Linux]
categories: [Bug踩坑记录]
---

## 保留现场
`apt`工具损坏了，在修复时使用了`sudo apt-get install -f`命令，中途会提示需要安装` libpng12-0`，但是始终无法安装，会提示如下错误。

```bash
Unpacking libpng12-0:amd64 (1.2.50-2+deb8u3) ... dpkg: error 
processing archive libpng12-0_1.2.50-2+deb8u3_amd64.deb 
(--install): unable to install new version of '/usr/lib/
x86_64-linux-gnu/libpng12.so.0': No such file or directory 
Errors were encountered while processing: libpng12-0_1.2.50-2
+deb8u3_amd64.deb

```
## 探究原因

具体原因未知，网上答案众说纷纭。

## 解决方法

这个问题遇到的人还挺多的，解决方法也各不相同，我先说我自己最终解决的方法。
### 方法一
1. 将软件源更换成中科院的源，使用Linux自带的**软件和更新**工具，具体方法参考[这篇文章](https://dunky-z.github.io/2021/07/30/%E6%9B%B4%E6%8D%A2Ubuntu%E8%BD%AF%E4%BB%B6%E6%9B%B4%E6%96%B0%E6%BA%90/)。更换完之后可以重新尝试安装，有人换源后即可成功安装。
2. 如果未能安装成功，可能曾经手动添加过软件源，将其删除。
    ```
    # 将所有内容注释
    vim /etc/apt/sources.list
    ```

### 方法二
1. 下载已安装的库文件`libpng12.so.0`，可以从[该链接](https://www.aliyundrive.com/s/pf9cAPjuqfn)下载。
2. 将该文件复制到它本该安装的位置。
    ```
    sudo cp libpng12.so.0 /usr/lib/x86_64-linux-gnu/
    ```
### 方法三
```
sudo add-apt-repository ppa:linuxuprising/libpng12
sudo apt update
sudo apt install libpng12-0
```
