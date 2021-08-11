---
title: 每天学命令-cat可以查看文件的小猫咪
date: 2021-08-04 09:57:51
tags: [Linux, 每天学命令]
---

`cat` 可以将文件的内容方便地输出到屏幕上。但是它的全称`concatenate`意为“连接”，连接文件也是它的重要功能之一，很多人可能都不常用。只记得输出文件内容了。

## 可选参数

```
-n 或 --number              #由 1 开始对所有输出的行数编号。
-b 或 --number-nonblank     #和 -n 相似，只不过对于空白行不编号。
-s 或 --squeeze-blank       #当遇到有连续两行以上的空白行，就代换为一行的空白行。
-v 或 --show-nonprinting    #使用 ^ 和 M- 符号，除了 LFD 和 TAB 之外。
-E 或 --show-ends           # 在每行结束处显示 $。
-T 或 --show-tabs:          #将 TAB 字符显示为 ^I。
-A, --show-all              #等价于 -vET。
-e                          #等价于"-vE"选项；
-t                          #等价于"-vT"选项；
```

## 使用实例
将文件内容输出到屏幕
```
➜  ~ cat test.txt 
This is firt line!
This is second line!
This is third line!
This is fourth line!
```
将`test.txt`的内容输入到`test01.txt`中

```
➜  ~ cat test.txt > test01.txt
➜  ~ cat test01.txt 
This is firt line!
This is second line!
This is third line!
This is fourth line!
```
带行号输出
```
➜  ~ cat -n test.txt 
     1	This is firt line!
     2	This is second line!
     3	This is third line!
     4	This is fourth line! 
```
将两个文件内容合并，再写入到第三个文件中
```
➜  ~ cat test.txt test01.txt >> test02.txt
➜  ~ cat test02.txt 
This is firt line!
This is second line!
This is third line!
This is fourth line!
This is firt line!
This is second line!
This is third line!
This is fourth line!
```

清空文件中的内容
```
➜  ~ cat /dev/null > test.txt 
➜  ~ cat test.txt 
➜  ~ 
```
在类 Unix 系统中，/dev/null 称空设备，是一个特殊的设备文件，它丢弃一切写入其中的数据（但报告写入操作成功），读取它则会立即得到一个 EOF。
## Reference
1. https://www.runoob.com/linux/linux-comm-cat.html