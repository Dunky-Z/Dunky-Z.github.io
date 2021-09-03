---
title: oh-my-zsh让你的终端更加顺手（眼）
date: 2021-08-29 09:56:21
tags: [Linux,Plugins]
---
## 效果
## 安装
官方方法，`curl`和`wget`二选一即可
```
curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh
wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh
```

应该也有人和我一样，可能会遇到连接GitHub失败的问题，要不就是SSL验证失败，要不就是连接无响应。可以更换下面的方法。
```
# 先下载
git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
## 再替换
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
```
重启终端即可成功。