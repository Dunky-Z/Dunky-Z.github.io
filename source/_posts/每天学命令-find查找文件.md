---
title: 每天学命令-find查找文件
date: 2021-07-29 11:05:43
tags: [每天学命令,linux]
---
## 命令格式
```
find [path] [expression]
```
在`path`下查找`expression`表示的文件
## 常用命令
一般常见就是自己不知道写的某个文件或者文件夹放哪里了，又或者只记住部分文件名。以下几个命令就能帮到你。
### 按文件名查找
```
find  -name filename(查找结果显示路径)或者 find filename(查找结果不显示路径)

find hello.cpp          #当前目录下精确查找hello.cpp文件
find hello              #当前目录下精确查找hello文件
find hello*             #当前目录下模糊查找以hello为前缀的文件
```

### 按类型查找
这就是为查找文件夹用的。
```
find -type [fdlcb] name
```
`[fdlcb]`都是类型，`d`就是目录，文件夹类型。
```
find / -type d -name "helloworld"   #查找名为helloworld的文件夹
```

## 按文件名查找
以下就详细介绍一些参数
```
find -name "hello.cpp"              # 搜索文件名，大小写敏感
find -iname "hello.cpp"             #大小写不敏感
```
## 按文件大小查找
```
find [path] -size 50M

find / -size 10M                # 查找系统中大小等于10M的文件
find / -size +50M               # 查找系统中大小大于50M的文件
find  / -size -30M              # 查找系统中大小小于30M的文件
```

## 按时间来查找文件
Linux 会存储下面的时间：
- Access time 上一次文件读或者写的时间
- Modifica time 上一次文件被修改的时间
- Change time 上一次文件 `inode meta` 信息被修改的时间

在按照时间查找时，可以使用 `-atime`， `-mtime` 或者 `-ctime `，和之前 `size `参数一样可以使用 `+` 或者 `- `时间范围，下图表示`find`的时间轴。`+`表示超过多少天，`-`表示多少天以内。

此外，也可以换成`-amin`， `-mmin` 或者 `-cmin `参数，单位是分钟。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210729151915.png)
```
find / -mtime 1          # 寻找修改时间超过一天的文件
find / -atime -1         # 寻找在一天时间内被访问的文件
find / -ctime +3         # 寻找 meta 信息被修改的时间超过 3 天的文件
```
## Reference
1. http://c.biancheng.net/view/779.html

2. https://einverne.github.io/post/2018/02/find-command.html#%E6%89%B9%E9%87%8F%E5%88%A0%E9%99%A4%E6%97%B6%E9%97%B4%E8%B6%85%E8%BF%87-1-%E5%A4%A9%E7%9A%84%E6%96%87%E4%BB%B6