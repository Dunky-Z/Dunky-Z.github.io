---
title: git clone快速下载子模块
date: 2021-07-28 15:28:58
tags: [git]
---

在`git clone`时候，如果遇到项目里有子模块通常会在下载时加上`--recursive`参数，一起下载。但是子模块较多，体积较大时大概率都会下载失败。

好在可以通过一些小技巧，下载国内镜像，进行加速。但是下载项目时，只是主体是国内的镜像，子模块仍然下载很慢。首先解决获取国内镜像的问题。有三个方法：
- **在码云Gitee上搜索下载**

    在码云上搜索同样的项目，然后用码云git 的地址下载。

- **加上`.cnpmjs.org`后缀**

    在地址后面加上后缀，如`git clone https://github.com.cnpmjs.org/riscv/riscv-binutils-gdb.git`。

- **使用油猴脚本获取镜像地址**

    如果你有油猴插件可以去[greasyfork](https://greasyfork.org/zh-CN)搜索安装**GitHub镜像访问，加速下载**这个脚本，刷新GitHub仓库界面就会多出几个镜像地址，一般下载都会快好几倍。

    ![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728155417.png)

再来解决子模块下载速度慢的问题，下载项目时，先不加`--recursive`参数，只下载项目的本题。

下载完后找到`.gitmodules`文件，这是一个隐藏文件，需要显示隐藏文件，Linux下使用快捷键`Ctrl+H`。用`vim`打开后可以得到：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728164406.png)

这个文件里写入了子模块的下载信息，`url`就是下载地址。我们把所有子模块中的url地址同样加上`.cnpmjs.org`后缀。或者使用上述三种方式得到的镜像地址。

然后利用`git submodule sync`更新子项目对应的`url`

最后再`git submodule update --init --recursive`，即可快速下载所有子项目。
