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