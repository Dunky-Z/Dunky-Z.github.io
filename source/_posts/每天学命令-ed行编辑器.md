---
title: 每天学命令-ed行编辑器
date: 2021-08-02 09:57:10
tags: [每天学命令,linux]
---

`ed`命令是文本编辑器，用于文本编辑。

`ed`是Linux中功能最简单的文本编辑程序，一次仅能编辑一行而非全屏幕方式的操作。很多命令和`vim`相似，平时开发中并不常用，但是在编辑大文本时还是会用到。

学学无妨毕竟这是Unix系统三大要件（编辑器，汇编器和shell）之一。

`ed`编辑器有两种模式：命令模式和输入模式。命令模式下输入`a`,`i`,`c`,`d`可以进入对应的编辑模式，接下来可以输入任何想要输入的内容，输入完毕或者要切换命令时，可以输入`.`退出输入模式。
## Commands
```
a           #添加到行
i           #添加到行首
c           #改变行
d           #删除行
```
## Line Address
```
.	#buffer 中 当前行
$	#最后一行
n	#第 n 行，行的范围是 [0,$]
- or ^	#前一行
-n or ^n	#前 n 行
+ or +n	#后一行及后n行
, or %	#全部行，等同于 1,$
;	#当前行到最后一行 .,$
/re/	#下一个包含正则 re 的行
?re?	#上一个包含正则 re 的行
```

## 使用实例
```
dominic@hanhan:~$ ed                # 进入编辑模式
This is a test text!                # 输入文本
.               # 结束输入命令
This is a test text!                # 回显当前行
n               # 显示行号命令
1	This is a test text!        # 回显当前行并显示行号
c               # 改变行命令
This is changed text!               # 输入更改后的内容
.               # 结束输入命令
n               # 显示行号命令
1	This is changed text!       # 回显当前行并显示行号
i               # 在首行插入命令
This is first line!                 # 输入插入内容
.               # 结束输入命令
+               # 后一行命令
This is changed text!               # 回显后一行
d               # 删除当前行 
.               # 回显当前行命令
This is firt line!                  # 回显当前行
a
This is second line!
This is third line!
This is fourth line!
w test.txt      # 写入并保存文件
q               # 退出编辑器

dominic@hanhan:~$ cat test.txt      # 查看内容
This is firt line!
This is second line!
This is third line!
This is fourth line!
```