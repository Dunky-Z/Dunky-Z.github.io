---
title: '解决OpenSSL SSL_connect: Connection was reset in connection to github.com:443'
date: 2021-08-09 18:20:51
tags: [Git, Hexo,Bug]
categories: [Bug踩坑记录]
---
在向github推送博客时，推送失败报了这个错。也不知道是改了什么设置突然报错。SSL的错之前遇到一次，就是刚开始配置Git时用的`https`协议，每次`push`都需要重新输入一次密码。改成`ssl`协议就OK了。当时把Linux环境的Git改了，但是现在的Windows下没改，猜测可能和这也有关，于是就把URL改了一下，结果还真好了。
在本地仓库的`.git`文件里找到`config`文件，打开后将`url`改为`ssl`协议，`git@github.com:XXX`格式的。

将Hexo的配置也改了，找到仓库下的`_config.yml`
```
deploy:
  type: git
  repository: 改成ssl协议地址
  branch: master
```