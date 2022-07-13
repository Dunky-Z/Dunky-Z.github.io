---
title: 构建和测试RISC-V架构下启用ACPI的内核
date: 2022-07-12 15:06:51
updated:
tags: [Linux,RISC-V, ACPI, Kernel, 内核]
categories:
---

## 准备环境及工具链

1. 安装RISCV工具链，需下载原发行版。好在apt可以安装。

    > 如果报错：riscv64-linux-gnu-gcc: error: unrecognized command line option ‘-mno-relax’; did you mean ‘-Wno-vla’?，多半是工具链原因，请按照以下方法安装！！！

    ```Bash
    sudo apt remove gcc-riscv64-linux-gnu
    sudo apt install gcc-8-riscv64-linux-gnu
    ```
1. 安装必要的三方库，以下为Ubuntu下的命令，其他平台可以参考[这个文档](https://risc-v-getting-started-guide.readthedocs.io/en/latest/linux-qemu.html#prerequisites)。

    ```Bash
    sudo apt install autoconf automake autotools-dev \
                     curl libmpc-dev libmpfr-dev \
                     libgmp-dev gawk build-essential \
                     bison flex texinfo gperf libtool \
                     patchutils bc zlib1g-dev libexpat-dev git
    ```

## 下载源码

可能无法一次搭建成功，一些环境变量会经常用到，所以干脆把所有环境变量放到`.bashrc`。

```Bash
vim ~/.bashrc
# 添加以下内容
export WORK_DIR=~/riscv64-acpi
export GCC5_RISCV64_PREFIX=riscv64-unknown-elf-
export MAINSPACE=~/riscv64-acpi/tianocore
export PACKAGES_PATH=$MAINSPACE/edk2:$MAINSPACE/edk2-platforms
export EDK_TOOLS_PATH=$MAINSPACE/edk2/BaseTools
```

首先，创建一个工作目录，我们将在其中下载并构建所有源代码。

```Bash
source ~/.bashrc
WORK_DIR=$PWD/riscv64-acpi
mkdir -p $WORK_DIR
cd $WORK_DIR
```

然后下载所有需要的源，它们是：[qemu](https://github.com/ventanamicro/qemu/tree/dev-upstream)、[opensbi](https://github.com/ventanamicro/opensbi/tree/dev-upstream)、[edk2](https://github.com/ventanamicro/edk2/tree/dev-upstream)、[edk2-platforms](https://github.com/ventanamicro/edk2-platforms/tree/dev-upstream)、[linux](https://github.com/ventanamicro/linux/tree/dev-upstream)。

下载地址更换成了加速镜像源，原来地址下载太慢，容易中断。有两个项目包含子模块，下载容易出错，所以`--depth=1`舍弃了多余的提交记录。

```Bash
git clone --branch dev-upstream  https://hub.fastgit.xyz/ventanamicro/qemu.git qemu
git clone --branch dev-upstream  https://hub.fastgit.xyz/ventanamicro/opensbi.git opensbi
git clone --branch dev-upstream --recurse-submodules --depth=1  https://hub.fastgit.xyz/ventanamicro/edk2.git tianocore/edk2
git clone --branch dev-upstream --recurse-submodules --depth=1  https://hub.fastgit.xyz/ventanamicro/edk2-platforms.git  tianocore/edk2-platforms
git clone --branch dev-upstream  https://hub.fastgit.xyz/ventanamicro/linux.git linux

```

## 编译构建

### QEMU

```Bash
cd $WORK_DIR/qemu
./configure --target-list=riscv64-softmmu
make -j $(nproc)
```

### OPENSBI

```Bash
cd $WORK_DIR/opensbi
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-elf- make PLATFORM=generic -j $(nproc)
```

### EDK2 固件

> 此处原文里设置了一些环境变量在开头我们设置了，请不要重新设置，尤其不能`export WORKSPACE=pwd`，因为与源码脚本的WORKSPACE冲突。

```Bash
cd $WORK_DIR/tianocore
source edk2/edksetup.sh
make -C edk2/BaseTools clean
make -C edk2/BaseTools
make -C edk2/BaseTools/Source/C
source edk2/edksetup.sh BaseTools
build -a RISCV64 -buildtarget RELEASE -D FW_BASE_ADDRESS=0x80200000 -D EDK2_PAYLOAD_OFFSET -p Platform/Qemu/RiscvVirt/RiscvVirt.dsc -t GCC5
```

#### ERROR

1. **StoreCurrentConfiguration:7: no such file or directory: /home/user/riscv64-acpi/tianocore/Conf/BuildEnv.sh**

    不要设置`export WORKSPACE=pwd`！！！如果所有方法都不可行，直接把路径写死`export CONF_PATH=$WORK_DIR/tianocore/edk2/Conf`
1. **uuid/uuid.h: No such file or directory**

    ```Bash
    sudo apt install uuid-dev
    ```

### Linux

```Bash
cd $WORK_DIR/linux
make ARCH=riscv CROSS_COMPILE=riscv64-linux-gnu- defconfig
make ARCH=riscv CROSS_COMPILE=riscv64-linux-gnu- -j $(nproc)
```

### Rootfs

您可以使用您选择的任何 rootfs。此示例使用 buildroot。

```Bash
cd $WORK_DIR/
git clone https://hub.fastgit.xyz/buildroot/buildroot.git
cd $WORK_DIR/buildroot
make qemu_riscv64_virt_defconfig -j $(nproc)
make rootfs-cpio -j $(nproc)
```

## 创建 EFI 分区并复制文件

```bash
fallocate -l 512M efi.img
sgdisk -n 1:34: -t 1:EF00 $WORK_DIR/efi.img
sudo losetup -fP $WORK_DIR/efi.img
loopdev=`losetup -j $WORK_DIR/efi.img | awk -F: '{print $1}'`
efi_part="$loopdev"p1
sudo mkfs.msdos $efi_part
mkdir -p /tmp/mnt
sudo mount $efi_part /tmp/mnt/
sudo cp $WORK_DIR/linux/arch/riscv/boot/Image /tmp/mnt/
sudo umount /tmp/mnt
sudo losetup -D $loopdev
```

## yun