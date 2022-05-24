---
title: 解决/usr/bin/env:python:No such file or directory
date: 2021-08-03 15:58:44
tags: [Linux,Bug]
categories: [Bug踩坑记录]
---

在执行的程序源码开头有这么一句`!#/usr/bin/env python`，`!#`这玩意叫`shebang`也叫`hashbang`。他用来指定脚本的解释器，也就是说这个程序指定`python`解释器。

再看这个错误提示，罪魁祸首就是这句命令，就是说在环境变量找不到`python`，通俗点说，假如我要能直接用`python`来跑这个程序，我在命令行直接输入`python`应该是可以进入`python`环境的，但是此时肯定不能。我们可以试试
```
dominic@hanhan:~$ python
Commond not found xxxxxxxxxxx
```
## 解决方案一
系统里没有`python`还跑个锤子，先装上再说
```
apt-get install python3
```
这时候可能就解决问题了

## 解决方案二
有的人可能`python`早就装了，但是仍然有这个问题，但是我们在命令输入`python`仍然没法用，但是输入`python3`就可以

那`python3`可以，我直接将`python`改成`python3`不就完了。没错！

打开文件将`!#/usr/bin/env python`改成`!#/usr/bin/env python3`

## 解决方案三
如果了解软链接，那我们就可以不用去改源码了，源码最好还是保持原样。

既然找不到`python`这玩意，那我们给他建一个不就完了。

他要`python`就是用来解释程序的，我们本地装的`python3`就是他需要的东西

先找找我们的`python3`在哪
```
dominic@hanhan:~$ whereis python3
python3: /usr/bin/python3.8 /usr/bin/python3.8-config /usr/bin/python3 
```
一般在`/usr/bin`目录下，然后我们在这个目录下给他创建一个软链接“快捷方式”，具体咋用的啥意思，可以[参考这篇文章](https://dunky-z.github.io/2021/08/03/%E6%AF%8F%E5%A4%A9%E5%AD%A6%E5%91%BD%E4%BB%A4-ln%E8%BD%AF%E7%A1%AC%E9%93%BE%E6%8E%A5/)。
```
sudo ln -s /usr/bin/python3 /usr/bin/python
```
这样程序再找`python`时就会链接到`python3`，然后用`python3`去当解释器。

## 解决方案四
可能在`root`目录下使用过`repo`，将其删除