---
title: Linux操作系统-虚拟化
date: 2021-08-31 09:44:40
updated:
tags:
categories: [Linux操作系统]
---

## 虚拟化

### 虚拟机

#### QEMU工作原理

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210721140349.png)

单纯使用 qemu，采用的是完全虚拟化的模式。qemu 向 Guest OS 模拟 CPU，也模拟其他的硬件，GuestOS 认为自己和硬件直接打交道，其实是同 qemu 模拟出来的硬件打交道，qemu 会将这些指令转译给真正的硬件。由于所有的指令都要从 qemu 里面过一手，因而性能就会比较差。

完全虚拟化是非常慢的，所以要使用硬件辅助虚拟化技术 Intel-VT，AMD-V，所以需要 CPU 硬件开启这个标志位，一般在 BIOS 里面设置。当确认开始了标志位之后，通过 KVM，GuestOS 的 CPU 指令不用经过 Qemu 转译，直接运行，大大提高了速度。所以，KVM 在内核里面需要有一个模块，来设置当前 CPU 是 Guest OS 在用，还是 Host OS 在用。

可以通过如下命令查看内核模块中是否有KVM

```
lsmod | grep kvm
```

KVM 内核模块通过 `/dev/kvm` 暴露接口，用户态程序可以通过 `ioctl`来访问这个接口。Qemu 将 KVM 整合进来，将有关 CPU 指令的部分交由内核模块来做，就是 qemu-kvm (qemu-system-XXX)。

qemu 和 kvm 整合之后，CPU 的性能问题解决了。另外 Qemu 还会模拟其他的硬件，如网络和硬盘。同样，全虚拟化的方式也会影响这些设备的性能。

于是，qemu 采取半虚拟化的方式，让 Guest OS 加载特殊的驱动来做这件事情。

例如，网络需要加载 `virtio_net`，存储需要加载 `virtio_blk`，Guest 需要安装这些半虚拟化驱动，GuestOS 知道自己是虚拟机，所以数据会直接发送给半虚拟化设备，经过特殊处理（例如排队、缓存、批量处理等性能优化方式），最终发送给真正的硬件。这在一定程度上提高了性能。

### 计算虚拟化之CPU

### 计算虚拟化之内存

