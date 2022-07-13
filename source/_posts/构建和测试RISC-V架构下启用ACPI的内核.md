---
title: 构建和测试RISC-V架构下启用ACPI的内核
date: 2022-07-12 15:06:51
updated:
tags: [Linux,RISC-V, ACPI, Kernel, 内核]
categories:
---
> 参考自[PoC : How to build and test ACPI enabled kernel · riscv-non-isa/riscv-acpi Wiki](https://github.com/riscv-non-isa/riscv-acpi/wiki/PoC-:-How-to-build-and-test-ACPI-enabled-kernel)

## 准备环境及工具链

1. 安装RISCV工具链，需下载原发行版。好在apt可以安装。

    > 如果报错：riscv64-linux-gnu-gcc: error: unrecognized command line option ‘-mno-relax’; did you mean ‘-Wno-vla’?，多半是工具链原因，请按照以下方法安装！！！

    ```Bash
    sudo apt remove gcc-riscv64-linux-gnu
    sudo apt install gcc-8-riscv64-linux-gnu
    ```
1. 安装必要的三方库，以下为Ubuntu下的命令，其他平台可以参考[这个文档](https://risc-v-getting-started-guide.readthedocs.io/en/latest/linux-qemu.html#prerequisites)。

    ```Bash
    sudo apt install autoconf automake autotools-dev curl libmpc-dev libmpfr-dev libgmp-dev \
                    gawk build-essential bison flex texinfo gperf libtool patchutils bc \
                    zlib1g-dev libexpat-dev git
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

下载地址更换成了加速镜像源，原来地址下载太慢，容易中断。下载地址更换成了加速镜像源，原来地址下载太慢，容易中断。有两个项目包含子模块，下载容易出错，所以`--depth=1`舍弃了多余的提交记录。

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

> 此处我们使用以`riscv64-unknown-elf-`为前缀的版本，则表示该版本GCC工具链会使用newlib作为C运行库。原文使用`riscv64-linux-gnu-`，表示GCC工具链会使用Linux的Glibc作为C运行库。但是本人未编译成功。故后面编译工具均使用`riscv64-unknown-elf-`，与原文不同。

```Bash
cd $WORK_DIR/opensbi
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-elf- make PLATFORM=generic
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
# 原文使用 -buildtarget RELEASE。但是提示Not supported target RELEASE
build -a RISCV64 -b DEBUG -D FW_BASE_ADDRESS=0x80200000 -D EDK2_PAYLOAD_OFFSET -p Platform/Qemu/RiscvVirt/RiscvVirt.dsc -t GCC5
```

#### ERROR

1. **StoreCurrentConfiguration:7: no such file or directory: /home/user/riscv64-acpi/tianocore/Conf/BuildEnv.sh**

    不要设置`export WORKSPACE=pwd`！！！如果所有方法都不可行，直接把路径写死`export CONF_PATH=$WORK_DIR/tianocore/edk2/Conf`
2. **uuid/uuid.h: No such file or directory**

    ```Bash
    sudo apt install uuid-dev
    ```
3. **Not supported target RELEASE**

    ```Bash
    # 将build命令改为如下，使用DEBUG版本。
    build -a RISCV64 -b DEBUG -D FW_BASE_ADDRESS=0x80200000 -D EDK2_PAYLOAD_OFFSET -p Platform/Qemu/RiscvVirt/RiscvVirt.dsc -t GCC5
    ```

### Linux

```Bash
cd $WORK_DIR/linux
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-elf- defconfig
make ARCH=riscv CROSS_COMPILE=riscv64-unknown-elf- -j $(nproc)
```

### Rootfs

您可以使用您选择的任何 rootfs。此示例使用 buildroot。

> 此步耗时较久，与网络环境有关，如果网络不好可能按小时算。容易中断，需要重新下载。

```Bash
cd $WORK_DIR/
git clone https://hub.fastgit.xyz/buildroot/buildroot.git
cd $WORK_DIR/buildroot
make qemu_riscv64_virt_defconfig
make rootfs-cpio
```

## 创建 EFI 分区并复制文件

```Bash
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

## 运行

### 使用 virtio-blk 磁盘

> 原文参数`-drive file=$WORK_DIR/buildroot/output/images/rootfs.ext2,format=raw,id=hd0 `需要更改如下。因为在编译Rootfs时的命令是`make rootfs-cpio`所以生成的是`rootfs.cpio`。无法找到`rootfs.ext2`

```Bash
$WORK_DIR/qemu/build/qemu-system-riscv64 -nographic \
-machine virt,aclint=on,aia=aplic-imsic,acpi=on -cpu rv64,sscofpmf=true -smp 8  -m 2G  \
-bios $WORK_DIR/opensbi/build/platform/generic/firmware/fw_jump.elf \
-kernel $WORK_DIR/tianocore/Build/RiscvVirt/DEBUG_GCC5/FV/RISCVVIRT.fd  \
-drive file=$WORK_DIR/buildroot/output/images/rootfs.cpio,format=raw,id=hd0 \
-device virtio-blk-device,drive=hd0 \
-drive file=$WORK_DIR/efi.img,format=raw,id=hd1 \
-device virtio-blk-device,drive=hd1 \
-device virtio-net-device,netdev=usernet \
-netdev user,id=usernet,hostfwd=tcp::9990-:22
```

#### ERROR

1. 无法找到`rootfs.ext2`

    ```Bash
    # 因为在编译Rootfs时的命令是make rootfs-cpio所以生成的是rootfs.cpio
    # 原文参数
    -drive file=$WORK_DIR/buildroot/output/images/rootfs.ext2,format=raw,id=hd0 \
    # 修改为
    -drive file=$WORK_DIR/buildroot/output/images/rootfs.cpio,format=raw,id=hd0 \
    ```
2. 无法找到`RISCVVIRT.fd`

    ```Bash
    # 因为编译EDK2固件时，参数是-b DEBUG版本，原文是RELEASE版本，这两个版本路径不一样，所以找不到
    # 原文参数
    -kernel $WORK_DIR/tianocore/Build/RiscvVirt/RELEASE_GCC5/FV/RISCVVIRT.fd  \
    # 修改为
    -kernel $WORK_DIR/tianocore/Build/RiscvVirt/DEBUG_GCC5/FV/RISCVVIRT.fd  \
    ```

At EFI Shell:

```Bash
Shell> fs0:\Image root=/dev/vdb console=ttyS0 rootwait earlycon
```

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220713153915.bmp)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220713153932.bmp)

### 使用 virtio-scsi 磁盘

```Bash
$WORK_DIR/qemu/build/qemu-system-riscv64 -nographic \
-machine virt,aclint=on,aia=aplic-imsic,acpi=on -cpu rv64,ssofpmf=true -smp 8  -m 2G \
-bios $WORK_DIR/opensbi/build/platform/generic/firmware/fw_jump.elf \
-kernel $WORK_DIR/tianocore/Build/RiscvVirt/DEBUG_GCC5/FV/RISCVVIRT.fd  \
-device virtio-scsi-pci,id=scsi0,num_queues=4 \
-device scsi-hd,drive=drive0,bus=scsi0.0,channel=0,scsi-id=0,lun=0 \
-drive file=$WORK_DIR/buildroot/output/images/rootfs.cpio,format=raw,if=none,id=drive0 \
-device virtio-scsi-pci,id=scsi1,num_queues=4 \
-device scsi-hd,drive=drive1,bus=scsi0.0,channel=0,scsi-id=1,lun=0 \
-drive file=$WORK_DIR/efi.img,format=raw,if=none,id=drive1 \
-device virtio-net-device,netdev=usernet \
-netdev user,id=usernet,hostfwd=tcp::9990-:22
```

At EFI Shell:

```Bash
Shell> fs0:\Image root=/dev/sda console=ttyS0 rootwait earlycon
```

