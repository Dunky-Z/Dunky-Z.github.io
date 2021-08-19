---
title: 每天学命令-rename批量重命名
date: 2021-08-13 18:40:16
tags: [Linux,每天学命令]
---

## Commands
```
rename [options] "s/oldname/newname/" file
```
格式就很容易看出来怎么用的，就是`/`不能丢。

```
-v 将重命名的内容都打印到标准输出，v 可以看成 verbose
-n 测试会重命名的内容，将结果都打印，但是并不真正执行重命名的过程
-f force 会覆盖本地已经存在的文件
-h -m -V 分别为帮助，帮助，版本
-e 比较复杂，可以通过该选项，写一些脚本来做一些复杂的事情
```

## Examples
### 替换文件名中的特定字段
```
rename "s/AA/aa/" *  # 把文件名中的AA替换成aa
```

### 修改文件后缀
```
rename "s/.html/.php/" *     # 把.html 后缀的改成 .php后缀
rename "s/.png/.jpg/" *      # 将 png 改为 jpg
```
### 添加后缀
```
rename "s/$/.txt/" *     # 把所有的文件名都以txt结尾
```
`$`正则表达式中表示结尾。

### 保留部分文件名
假如需要在批量修改的时候保留部分文件名，可以使用引用` \1` ，比如有下面格式的文件，只想保留日期部分。
```
Screenshot from 2019-01-02 15-56-49.jpg
rename -n "s/Screenshot from ([0-9\\- ]+).jpg/\1.jpg/" *
```

将`()` 匹配的内容取出来放到替换部分。


