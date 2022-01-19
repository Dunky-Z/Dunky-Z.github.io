---
title: Linux安装nodejs以及hexo
date: 2022-01-10 11:51:50
updated:
tags: [Linux]
categories:
---

## 安装nodejs过程
进入该网站[下载 | Node.js](https://nodejs.org/zh-cn/download/)
也可以进入该网站下载历史版本，[Previous Releases | Node.js](https://nodejs.org/en/download/releases/)

进入download目录，
```
cd download
wget https://nodejs.org/dist/v10.16.3/node-v10.16.3-linux-x64.tar.xz  -O nodejs.tar.xz
```
解压
```
tar -xvf node-v10.16.3-linux-x64.tar.xz
```
改名nodejs
```
mv node-v10.16.3-linux-x64 nodejs
```
将npm，node两个程序建立软连接，能够全局可用
```
$ ln -s /download/nodejs/bin/npm /usr/local/bin/ 

$ ln -s /download/nodejs/bin/node /usr/local/bin/
```

检查是否安装
```
node -v

npm -v
```

## 安装hexo过程
```
npm i hexo-cli -g
hexo -v
```
如果出现命令未找到到错误，说明hexo还未加入全局变量。
将下面命令加入
```
vim ~/.bashrc
export PATH=/usr/local/nodejs/lib/node_modules/hexo-cli/bin/:$PATH 
```

## Reference

[Previous Releases | Node.js](https://nodejs.org/en/download/releases/)
[Linux 安装 Node.js | F2E 前端技术论坛](https://learnku.com/articles/32767)
[Linux下安装node及npm - SegmentFault 思否](https://segmentfault.com/a/1190000024422534)
[超详细Hexo+Github博客搭建小白教程 - 知乎](https://zhuanlan.zhihu.com/p/35668237)
