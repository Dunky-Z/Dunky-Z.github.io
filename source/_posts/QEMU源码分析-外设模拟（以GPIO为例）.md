---
title: QEMU源码分析-外设模拟（以GPIO为例）
date: 2021-11-11 10:11:32
tags: [QEMU, GPIO]
categories: [QEMU源码分析]
---

## QEMU模拟外设的原理
QEMU主要是实现了CPU核的模拟，可以读写某个地址。
QEMU的模拟外设的原理很简单：**硬件即内存**。
要在QEMU上模拟某个外设，思路就是：
- CPU读某个地址时，QEMU模拟外设的行为，把数据返回给CPU
- CPU写某个地址时，QEMU获得数据，用来模拟外设的行为。
即：要模拟外设备，我们只需要针对外设的地址提供对应的读写函数即可。

以GPIO为例：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211111102930.png)

QEMU 为`GPIO`内存地址提供读写回调函数，
```c
static void sifive_gpio_write(void *opaque, hwaddr offset, uint64_t value, unsigned int size)

static uint64_t sifive_gpio_read(void *opaque, hwaddr offset, unsigned int size)
```

## 给外设地址提供读写函数
怎么描述某段地址：基地址、大小？如何给这段地址提供读写函数呢？这段地址设置好后，如何添加进`system_memory`去？有2种方法。

**法1：memory_region_init_io/memory_region_add_subregion**
以`SIFIVE_UART`为例，
```c
memory_region_init_io(&s->mmio, NULL, &uart_ops, s,
                        TYPE_SIFIVE_UART, 0x2000);
memory_region_add_subregion(address_space, base, &s->mmio);
```
`memory_region_init_io`函数初始化`iomem`，读写函数，大小。
`memory_region_add_subregion`函数`s->iomem`指定了基地址，并添加进`system_memory`中。
以后，客户机上的程序读写这块地址时，就会导致对应的读写函数被调用。

**法2：memory_region_init_io/sysbus_init_mmio/sysbus_mmio_map**
以`SIFIVE_GPIO`为例，

```c
memory_region_init_io(&s->mmio, OBJECT(dev), &gpio_ops, s, TYPE_SIFIVE_GPIO, SIFIVE_GPIO_SIZE);

sysbus_init_mmio(SYS_BUS_DEVICE(dev), &s->mmio);
```

`memory_region_init_io`函数初始化`iomem`，读写函数，大小。
`sysbus_init_mmio`将`mmin`传给设备；

```c
sysbus_mmio_map(SYS_BUS_DEVICE(&s->gpio), 0, memmap[SIFIVE_E_DEV_GPIO0].base);
```

`sysbus_mmio_map`从设备中吧`mmio`添加进`system_memory`并指定基地址。