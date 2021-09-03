---
title: QEMU源码分析-虚拟CPU创建
date: 2021-09-01 18:22:14
tags: [QEMU,Linux]
---
## 流程图
先开个头吧，把创建流程稍微捋一下，找到创建虚拟CPU的模块。至于中间的流程还没有详细分析，万事开头难，先上手再说吧。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210901182329.svg)

## `qemu_add_opts`解析qemu的命令行
`qemu_init`函数中下面这一长串内容，就是在解析命令行的参数。

```c
qemu add opts (&qemu drive opts);
qemu add drive opts(&qemu Legacy drive opts);
qemu add drive opts (&qemu common drive opts);
qemu add drive opts (&qemu drive opts);
qemu add drive opts (sbdry runtime opts);
qemu add opts (qemu chardev opts);
qemu add opts (&qemu device opts);
qemu add opts (&qemu netdev opts);
qemu add opts (&qemu nic opts);
qemu add opts (sqemu net opts
qemu add opts (&qemu rtc opts)
qemu add opts (&qemu global_opts);
qemu add opts (&qemu mon opts);
qemu add opts (sqemu trace opts);
.
.
.
```

为什么有这么多的 `opts `呢？这是因为，实际运行中创建的` kvm `参数会复杂` N `倍。这里我们贴一个开源云平台软件 `OpenStack` 创建出来的` KVM `的参数，如下所示。
```shell
qemu-system-x86_64
-enable-kvm
-name instance-00000024
-machine pc-i440fx-trusty,accel=kvm,usb=off
-cpu SandyBridge,+erms,+smep,+fsgsbase,+pdpe1gb,+rdrand,+f16c,+osxsave,+dca,+pcid,+pdcm,+xtpr,+tm2,+est,+smx,+vmx,+ds_cpl,+monitor,+dtes64,+pbe,+tm,+ht,+ss,+acpi,+ds,+vme
-m 2048
-smp 1,sockets=1,cores=1,threads=1
......
-rtc base=utc,driftfix=slew
-drive file=/var/lib/nova/instances/1f8e6f7e-5a70-4780-89c1-464dc0e7f308/disk,if=none,id=drive-virtio-disk0,format=qcow2,cache=none
-device virtio-blk-pci,scsi=off,bus=pci.0,addr=0x4,drive=drive-virtio-disk0,id=virtio-disk0,bootindex=1
-netdev tap,fd=32,id=hostnet0,vhost=on,vhostfd=37
-device virtio-net-pci,netdev=hostnet0,id=net0,mac=fa:16:3e:d1:2d:99,bus=pci.0,addr=0x3
-chardev file,id=charserial0,path=/var/lib/nova/instances/1f8e6f7e-5a70-4780-89c1-464dc0e7f308/console.log
-vnc 0.0.0.0:12
-device cirrus-vga,id=video0,bus=pci.0,addr=0x2
```
- `-enable-kvm`：表示启用硬件辅助虚拟化。

- `-name instance-00000024`：表示虚拟机的名称。

- `-machine pc-i440fx-trusty,accel=kvm,usb=off`：machine 是什么呢？其实就是计算机体系结构。不知道什么是体系结构的话，可以订阅极客时间的另一个专栏《深入浅出计算机组成原理》。
qemu 会模拟多种体系结构，常用的有普通 PC 机，也即 x86 的 32 位或者 64 位的体系结构、Mac 电脑 PowerPC 的体系结构、Sun 的体系结构、MIPS 的体系结构，精简指令集。如果使用 KVM hardware-assisted virtualization，也即 BIOS 中 VD-T 是打开的，则参数中 `accel=kvm`。如果不使用 `hardware-assisted virtualization`，用的是纯模拟，则有参数 `accel = tcg`，`-no-kvm`。

- `-cpu SandyBridge,+erms,+smep,+fsgsbase,+pdpe1gb,+rdrand,+f16c,+osxsave,+dca,+pcid,+pdcm,+xtpr,+tm2,+est,+smx,+vmx,+ds_cpl,+monitor,+dtes64,+pbe,+tm,+ht,+ss,+acpi,+ds,+vme`：表示设置 CPU，SandyBridge 是 Intel 处理器，后面的加号都是添加的 CPU 的参数，这些参数会显示在 /proc/cpuinfo 里面。

- `-m 2048`：表示内存。

- `-smp 1,sockets=1,cores=1,threads=1`：`SMP` 我们解析过，叫对称多处理器，和` NUMA` 对应。qemu 仿真了一个具有 1 个 `vcpu`，一个 `socket`，一个 `core`，一个 `threads` 的处理器。
`socket`、`core`、`threads` 是什么概念呢？`socket` 就是主板上插 cpu 的槽的数目，也即常说的“路”，`core` 就是我们平时说的“核”，即双核、4 核等。`thread` 就是每个 core 的硬件线程数，即超线程。举个具体的例子，某个服务器是：2 路 4 核超线程（一般默认为 2 个线程），通过 `cat /proc/cpuinfo`，我们看到的是 242=16 个` processor`，很多人也习惯成为 16 核了。

- `-rtc base=utc,driftfix=slew`：表示系统时间由参数 `-rtc` 指定。

- `-device cirrus-vga,id=video0,bus=pci.0,addr=0x2`：表示显示器用参数 `-vga` 设置，默认为 `cirrus`，它模拟了 `CL-GD5446PCI VGA card`。

- 有关网卡，使用 `-net` 参数和 `-device`。

- 从 HOST 角度：`-netdev tap,fd=32,id=hostnet0,vhost=on,vhostfd=37`。

- 从 GUEST 角度：`-device virtio-net-pci,netdev=hostnet0,id=net0,mac=fa:16:3e:d1:2d:99,bus=pci.0,addr=0x3`。

- 有关硬盘，使用 `-hda -hdb`，或者使用 `-drive` 和 `-device`。

- 从 HOST 角度：`-drive file=/var/lib/nova/instances/1f8e6f7e-5a70-4780-89c1-464dc0e7f308/disk,if=none,id=drive-virtio-disk0,format=qcow2,cache=none`

- 从 GUEST 角度：`-device virtio-blk-pci,scsi=off,bus=pci.0,addr=0x4,drive=drive-virtio-disk0,id=virtio-disk0,bootindex=1`

- `-vnc 0.0.0.0:12`：设置 VNC。
## `module_call_init`初始化所有模块
当虚拟机真的要使用物理资源的时候，对下面的物理机上的资源要进行请求，所以它的工作模式有点儿类似操作系统对接驱动。驱动要符合一定的格式，才能算操作系统的一个模块。同理，qemu 为了模拟各种各样的设备，也需要管理各种各样的模块，这些模块也需要符合一定的格式。

## 初始化machine
