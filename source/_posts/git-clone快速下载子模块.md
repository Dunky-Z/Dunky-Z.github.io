---
title: git clone快速下载子模块
date: 2021-07-28 15:28:58
tags: [git]
---

在`git clone`时候，如果遇到项目里有子模块通常会在下载时加上`--recursive`参数，一起下载。但是子模块较多，体积较大时大概率都会下载失败。

好在可以通过一些小技巧，下载国内镜像，进行加速。但是下载项目时，只是主体是国内的镜像，子模块仍然下载很慢。首先解决获取国内镜像的问题。有三个方法：
- **在码云Gitee上搜索下载**

    在码云上搜索同样的项目，然后用码云的地址下载
    
- **加上`.cnpmjs.org`后缀**

    在地址后面加上后缀，如`git clone https://github.com.cnpmjs.org/riscv/riscv-binutils-gdb.git`

- **使用油猴脚本获取镜像地址**

    如果你有油猴插件可以去[greasyfork](https://greasyfork.org/zh-CN)搜索安装**GitHub镜像访问，加速下载**这个脚本，刷新GitHub仓库界面就会多出几个镜像地址，一般下载都会快好几倍。

    ![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728155417.png)

  对于含有子模块的项目，一般我们在克隆这种项目的时候都会采取git clone --recursive https://github.com/susername/xxx.git的方式去克隆，这种方式很慢，即使加上.cnpmjs.org后缀，因为就算加上.cnpmjs.org后缀，也只是使得项目的主体克隆的很快，当克隆到该项目中的子模块时，由于子模块的url未加上.cnpmjs.org，导致了子模块克隆时依然是龟速。

  可以先不要在git clone的时候加上--recursive，等主体部分下载完之后，该文件夹中有个隐藏文件称为：.gitmodules，把子项目中的url地址同样加上.cnpmjs.org后缀，然后利用git submodule sync更新子项目对应的url，最后再git submodule update --init --recursive，即可正常网速克隆完所有子项目。

 在git clone的时候，例如git clone https://github.com/username/xxx.git，改为git clone https://github.com.cnpmjs.org/username/xxx.git，也即加上后缀.cnpmjs.org，从国内镜像源里直接下载，速度瞬间提升。（实测有效）