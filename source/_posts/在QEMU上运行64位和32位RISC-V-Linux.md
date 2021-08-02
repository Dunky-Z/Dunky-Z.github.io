---
title: 在QEMU上运行64位和32位RISC-V-Linux
date: 2021-07-28 13:47:56
tags: [linux,qemu,RISC-V]
---
## 制作交叉工具链 riscv-gnu-toolchain
### 下载源码
这个仓库是我遇到的最难下载的一个仓库了，公司网慢和虚拟机性能差都脱不了干系。估计下载了五小时都不止，刚开始还指望一个命令所有子模块都下载完的，结果愣是等了半天中断了。试了两次后放弃了。如果各位看官能一次完成，那您是福大。

国内的码云平台有个[Gitee极速下载](https://gitee.com/organizations/mirrors/projects)项目，上面有GitHub的一些常用开源项目的镜像，可供加速下载。
```
# riscv-gnu-toolchain
https://gitee.com/mirrors/riscv-gnu-toolchain.git
```
下载时问题出现了，如果下载子模块仍然会卡住，如果不加`--recursive`就只能下载主体内容，子模块都没有。（**以下内容为第一安装时的方法，后续又找到了[git clone快速下载子模块]()的方法**）

开始下载时不加`--recursive`参数，只下载`riscv-gnu-toolchain`的主体内容，然后进入到`riscv-gnu-toolchain`文件夹下，手动下载子模块的内容。

当下完`riscv-binutils`继续下载`riscv-gdb`时发现这两个项目是同一个项目，只是不同的分支。但是码云上并没有区分，但是我也没找到在码云上的对应分支。只能用油猴脚本了。

如果你有油猴插件可以去[greasyfork](https://greasyfork.org/zh-CN)搜索安装**GitHub镜像访问，加速下载**这个脚本，刷新GitHub仓库界面就会多出几个镜像地址，一般下载都会快好几倍。如果不用油猴插件的可以用我复制好的链接。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210728155417.png)
```
# riscv-binutils
git clone https://gitee.com/mirrors/riscv-binutils-gdb.git
# riscv-gcc
git clone https://gitee.com/mirrors/riscv-gcc.git
# riscv-dejagnu
git clone https://gitee.com/mirrors/riscv-dejagnu.git
# riscv-glibc
git clone https://gitee.com/mirrors/riscv-glibc.git
# riscv-newlib
git clone https://gitee.com/mirrors/riscv-newlib.git
# riscv-gdb
git clone --depth=1 https://hub.fastgit.org/riscv/riscv-binutils-gdb.git
```
### 编译riscv-gnu-toolchain
提前安装如下软件：
```
$ sudo apt-get install autoconf automake autotools-dev curl python3 libmpc-dev libmpfr-dev libgmp-dev gawk build-essential bison flex texinfo gperf libtool patchutils bc zlib1g-dev libexpat-dev
```
不听老人言，吃亏在眼前呀，本以为这是可选项，很多库都安装了，就没有操作这一步，结果就是编译半天结果还错了。如果报`make 错误 127`，那就老老实实把前置的这些库都装上。


建立`riscv-gnu-toolchain`安装目录`/opt/riscv64 `。
```
$ ./configure --prefix=/opt/riscv64 
$ sudo make linux -j8
```
### 导出安装路径
```
export PATH="$PATH:/opt/riscv64/bin"
```
出现一下信息表示安装成功。
```
Using built-in specs.
COLLECT_GCC=riscv64-unknown-linux-gnu-gcc
COLLECT_LTO_WRAPPER=/opt/riscv64/libexec/gcc/riscv64-unknown-linux-gnu/10.2.0/lto-wrapper
Target: riscv64-unknown-linux-gnu
Configured with: /home/dominic/riscv64-linux/riscv-gnu-toolchain/riscv-gcc/configure --target=riscv64-unknown-linux-gnu --prefix=/opt/riscv64 --with-sysroot=/opt/riscv64/sysroot --with-system-zlib --enable-shared --enable-tls --enable-languages=c,c++,fortran --disable-libmudflap --disable-libssp --disable-libquadmath --disable-libsanitizer --disable-nls --disable-bootstrap --src=.././riscv-gcc --disable-multilib --with-abi=lp64d --with-arch=rv64imafdc --with-tune=rocket 'CFLAGS_FOR_TARGET=-O2   -mcmodel=medlow' 'CXXFLAGS_FOR_TARGET=-O2   -mcmodel=medlow'
Thread model: posix
Supported LTO compression algorithms: zlib
gcc version 10.2.0 (GCC) 
```

## 制作内核
### 下载Linux内核