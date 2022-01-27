---
title: QEMU源码分析-内存虚拟化
date: 2022-01-25 13:42:11
tags: [QEMU,Linux]
categories: [QEMU源码分析]
---

>1.大部分转载自[QEMU 内存虚拟化源码分析 | Keep Coding | 苏易北](https://abelsu7.top/2019/07/07/kvm-memory-virtualization/)
>2.原文源码为QEMU1.2.0，版本较旧，部分源码内容根据QEMU6.2版本修改
>3.部分内容根据自己理解补充添加
>1.大部分转载自[QEMU 内存虚拟化源码分析 | Keep Coding | 苏易北](https://abelsu7.top/2019/07/07/kvm-memory-virtualization/)
>2.原文源码为QEMU1.2.0，版本较旧，部分源码内容根据QEMU6.2版本修改
>3.部分内容根据自己理解补充添加
## 概述
我们知道操作系统给每个进程分配虚拟内存，通过页表映射，变成物理内存进行访问。当有了虚拟机之后，情况会变得更加复杂。因为虚拟机对于物理机来讲是一个进程，但是虚拟机里面也有内核，也有虚拟机里面跑的进程。所以有了虚拟机，内存就变成了四类：
- 虚拟机里面的虚拟内存（Guest OS Virtual Memory，GVA），这是虚拟机里面的进程看到的内存空间；
- 虚拟机里面的物理内存（Guest OS Physical Memory，GPA），这是虚拟机里面的操作系统看到的内存，它认为这是物理内存；
- 物理机的虚拟内存（Host Virtual Memory，HVA），这是物理机上的 qemu 进程看到的内存空间；
- 物理机的物理内存（Host Physical Memory，HPA），这是物理机上的操作系统看到的内存。

内存虚拟化的关键在于维护 `GPA` 到 `HVA` 的映射关系。


## 页面分配和映射的两种方式

要搞清楚QEMU system emulation的仿真架构，首先对于Host OS，将QEMU作为进程启动，然后对于QEMU进程，会仿真各种硬件和运行Guest OS，在这层OS上运行要全系统模拟的应用程序，因此对于Guest OS管理的内存要实现到QEMU进程的虚拟空间的转换需要softMMU（即需要对GPA到HVA进行转换）。从 GVA 到 GPA 到 HVA 到 HPA，性能很差，为了解决这个问题，有两种主要的思路。

### 影子页表Shadow Page Table，SPT
第一种方式就是软件的方式，影子页表 （Shadow Page Table）。

KVM 通过维护记录GVA->HPA的影子页表 SPT，减少了地址转换带来的开销，可以直接将 GVA 转换为 HPA。

内存映射要通过页表来管理，页表地址应该放在 CR3 寄存器里面。在软件虚拟化的内存转换中，GVA 到 GPA 的转换通过查询 CR3 寄存器来完成，CR3 中保存了 Guest 的页表基地址，然后载入 MMU 中进行地址转换。

在加入了 SPT 技术后，当 Guest 访问 CR3 时，KVM 会捕获到这个操作EXIT_REASON_CR_ACCESS，之后 KVM 会载入特殊的 CR3 和影子页表，欺骗 Guest 这就是真实的 CR3。之后就和传统的访问内存方式一致，当需要访问物理内存的时候，只会经过一层影子页表的转换。

>本来的过程是，客户机要通过 cr3 找到客户机的页表，实现从 GVA 到 GPA 的转换，然后在宿主机上，要通过 cr3 找到宿主机的页表，实现从 HVA 到 HPA 的转换。
为了实现客户机虚拟地址空间到宿主机物理地址空间的直接映射。客户机中每个进程都有自己的虚拟地址空间，所以 KVM 需要为客户机中的每个进程页表都要维护一套相应的影子页表。
在客户机访问内存时，使用的不是客户机的原来的页表，而是这个页表对应的影子页表，从而实现了从客户机虚拟地址到宿主机物理地址的直接转换。而且，在 TLB 和 CPU 缓存上缓存的是来自影子页表中客户机虚拟地址和宿主机物理地址之间的映射，也因此提高了缓存的效率。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220124192700.png)

为了快速检索Guest页表对应的影子页表，KVM为每个客户机维护了一个hash表来进行客户机页表到影子页表之间的映射。 对于每一个Guest来说，其页目录和页表都有唯一的GPA，通过页目录/页表的GPA就可以在哈希链表中快速地找到对应的影子页目录/页表。

当Guest切换进程时，Guest会把待切换进程的页表基址载入 CR3，而 KVM 将会截获这一特权指令。KVM在哈希表中找到与此页表基址对应的影子页表基址，载入Guest CR3，使Guest在恢复运行时 CR3 实际指向的是新切换进程对应的影子页表。

影子页表的引入，减少了GVA->HPA的转换开销，但是缺点在于需要为 Guest 的每个进程都维护一个影子页表，这将带来很大的内存开销。同时影子页表的建立是很耗时的，如果 Guest 的进程过多，将导致影子页表频繁切换。

因此 Intel 和 AMD 在此基础上提供了基于硬件的虚拟化技术EPT。

### 扩展页表Extent Page Table，EPT

Intel 的 EPT（Extent Page Table）技术和 AMD 的 NPT（Nest Page Table）技术都对内存虚拟化提供了硬件支持。 这两种技术原理类似，都是在硬件层面上实现GVA到HPA之间的转换。 下面就以 EPT 为例分析一下 KVM 基于硬件辅助的内存虚拟化实现。

EPT 在原有客户机页表对客户机虚拟地址 GVA 到客户机物理地址 GPA 映射的基础上，又引入了 EPT 页表来实现客户机物理地址 GPA 到宿主机物理地址 HPA 的另一次映射。客户机运行时，客户机页表被载入 CR3，而 EPT 页表被载入专门的 EPT 页表指针寄存器 EPTP。

即EPT 技术采用了在两级页表结构，即原有Guest OS页表对 **GVA->GPA** 映射的基础上，又引入了 EPT 页表来实现 **GPA->HPA** 的另一次映射，这**两次地址映射都是由硬件自动完成**。

有了 EPT，在**GPA->HPA**转换的过程中，缺页会产生 EPT 缺页异常。 KVM 首先根据引起异常的客户机物理地址，映射到对应的宿主机虚拟地址，然后为此虚拟地址分配新的物理页，最后 KVM 再更新 EPT 页表，建立起引起异常的客户机物理地址到宿主机物理地址之间的映射。

KVM 只需为每个客户机维护一套 EPT 页表，也大大减少了内存的开销。

这里，我们重点看第二种方式。因为使用了 EPT 之后，客户机里面的页表映射，也即从 GVA 到 GPA 的转换，还是用传统的方式，和在内存管理那一章讲的没有什么区别。而 EPT 重点帮我们解决的就是从 GPA 到 HPA 的转换问题。因为要经过两次页表，所以 EPT 又 tdp(two dimentional paging)。

EPT 的页表结构也是分为四层，EPT Pointer （EPTP）指向 PML4 的首地址。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220124194059.png)

## QEMU 的主要工作

内存虚拟化的目的就是让虚拟机能够无缝的访问内存。有了 Intel EPT 的支持后，CPU 在 VMX non-root状态时进行内存访问会再做一次 EPT 转换。在这个过程中，QEMU 会负责以下内容：

首先需要从自己的进程地址空间中申请内存用于 Guest
需要将上一步中申请到的内存的虚拟地址（HVA）和 Guest 的物理地址之间的映射关系传递给 KVM（kernel），即 GPA->HVA
需要组织一系列的数据结构来管理虚拟内存空间，并在内存拓扑结构更改时将最新的内存信息同步至 KVM 中

## QEMU 和 KVM 的工作分界

QEMU 和 KVM 之间是通过 KVM 提供的ioctl()接口进行交互的。在内核的kvm_vm_ioctl()中，**设置虚拟机内存**的系统调用【kernel就是一系列系统调用函数接口和处理逻辑，其中有个处理”创建/设置虚拟机内存“的系统调用接口】为  `VM_SET_USER_MEMORY_REGION`：

```c
static long kvm_vm_ioctl(struct file *filp,
               unsigned int ioctl, unsigned long arg)
{
    /* ... */
    case KVM_SET_USER_MEMORY_REGION: { // 在 KVM 中注册用户空间传入的内存信息
        struct kvm_userspace_memory_region kvm_userspace_mem;

        r = -EFAULT;
         // 将传入的数据结构复制到内核空间
        if (copy_from_user(&kvm_userspace_mem, argp, sizeof kvm_userspace_mem))
            goto out;

         // 实际进行处理的函数
        r = kvm_vm_ioctl_set_memory_region(kvm, &kvm_userspace_mem, 1);
        if (r)
            goto out;
        break;
    }
    /* ... */
}
```

可以看到这里需要传递的参数类型为 `kvm_userspace_memory_region`：
```c
/* for KVM_SET_USER_MEMORY_REGION */
struct kvm_userspace_memory_region {
    __u32 slot;            // slot 编号 [参考：https://www.cnblogs.com/LoyenWang/p/11922887.html]
    __u32 flags;           // 标志位，例如是否追踪脏页、是否可用等
    __u64 guest_phys_addr; // Guest 物理地址，即 GPA
    __u64 memory_size;     // 内存大小，单位 bytes
    __u64 userspace_addr;  // 从 QEMU 进程地址空间中分配内存的起始地址，即 HVA
};
```
`KVM_SET_USER_MEMORY_REGION`这个 `ioctl` 主要目的就是设置`GPA->HVA`的映射关系，KVM 会继续调用`kvm_vm_ioctl_set_memory_region()`，在内核空间维护并管理 Guest 的内存。

## 相关数据结构
### AddressSpace
#### 结构体定义
QEMU 用 AddressSpace 结构体表示 Guest 中 CPU/设备看到的内存【也就是Guest OS可以在QEMU进程虚存中用到的所有内存，是 MemoryRegion 的集合，即 GPA 的整体】，类似于物理机中地址空间的概念，但在这里表示的是 Guest 的一段地址空间，如内存地址空间 `address_space_memory` 、`I/O` 地址空间`address_space_io`，它在 QEMU 源码`memory.c`中定义：

```c
/**
 * struct AddressSpace: describes a mapping of addresses to #MemoryRegion objects
 */
struct AddressSpace {
    /* private: */
    struct rcu_head rcu;
    char *name;
    MemoryRegion *root;

    /* Accessed via RCU.  */
    struct FlatView *current_map;

    int ioeventfd_nb;
    struct MemoryRegionIoeventfd *ioeventfds;
    QTAILQ_HEAD(, MemoryListener) listeners;
    QTAILQ_ENTRY(AddressSpace) address_spaces_link;
};
```

每个 AddressSpace 一般包含一系列的 MemoryRegion：`root`指针指向根级 MemoryRegion，而root可能有自己的若干个 sub-regions（子节点），于是形成树状结构。这些 MemoryRegion 通过树连接起来，树的根即为 AddressSpace 的root域。


#### 全局变量
另外，QEMU 中有两个全局的静态 AddressSpace，在memory.c中定义：

```c
static AddressSpace address_space_memory; // 内存地址空间
static AddressSpace address_space_io;     // I/O 地址空间
```
其 root 域分别指向之后会提到的两个 MemoryRegion 类型变量：system_memory、system_io。

### MemoryRegion

#### 结构体定义

`MemoryRegion` 表示在 `Guest Memory Layout` 中的一段内存区域【也就是单元级GPA的概念，Guest OS可以管理到的那些Guest 物理内存单元】，它是联系 `GPA` 和 `RAMBlocks`（描述真实内存）之间的桥梁，在`memory.h`中定义：

```c
struct MemoryRegion {
    /* All fields are private - violators will be prosecuted */
    const MemoryRegionOps *ops;      // 回调函数集合
    void *opaque;
    MemoryRegion *parent;            // 父 MemoryRegion 指针
    Int128 size;                     // 该区域内存的大小
    target_phys_addr_t addr;         // 在 Address Space 中的地址，即 HVA
    void (*destructor)(MemoryRegion *mr);
    ram_addr_t ram_addr;             // MemoryRegion 的起始地址，即 GPA
    bool subpage;
    bool terminates;
    bool readable;
    bool ram;                        // 是否表示 RAM
    bool readonly; /* For RAM regions */
    bool enabled;                    // 是否已经通知 KVM 使用这段内存
    bool rom_device;
    bool warning_printed; /* For reservations */
    MemoryRegion *alias;             // 是否为 MemoryRegion alias
    target_phys_addr_t alias_offset; // 若为 alias，在原 MemoryRegion 中的 offset
    unsigned priority;
    bool may_overlap;
    QTAILQ_HEAD(subregions, MemoryRegion) subregions; // 子区域链表头
    QTAILQ_ENTRY(MemoryRegion) subregions_link;       // 子区域链表节点
    QTAILQ_HEAD(coalesced_ranges, CoalescedMemoryRange) coalesced;
    const char *name;       // MemoryRegion 的名字，调试时使用
    uint8_t dirty_log_mask; // 表示哪一种 dirty map 被使用，共分三种
    unsigned ioeventfd_nb;
    MemoryRegionIoeventfd *ioeventfds;
};

```


#### 全局变量
在 QEMU 的exec.c中也定义了两个静态的 MemoryRegion 指针变量：


```c
static MemoryRegion *system_memory; // 内存 MemoryRegion，对应 address_space_memory
static MemoryRegion *system_io;     // I/O MemoryRegion，对应 address_space_io
```
与两个全局 AddressSpace 对应，即 AddressSpace 的root域指向这两个 MemoryRegion。

#### MemoryRegion 的类型

MemoryRegion 有多种类型，可以表示一段 RAM、ROM、MMIO、alias(别名)。

若为 alias 则表示一个 MemoryRegion 的部分区域，例如 ，QEMU 会为pc.ram这个表示 RAM 的 MemoryRegion 添加两个 alias：ram-below-4g和ram-above-4g，之后会看到具体的代码实例。

另外，MemoryRegion 也可以表示一个 container，这就表示它只是其他若干个 MemoryRegion 的容器。

那么要如何创建不同类型的 `MemoryRegion` 呢？

在 QEMU 中实际上是通过调用不同的初始化函数区分的。根据不同的初始化函数及其功能，可以将 MemoryRegion 划分为以下三种类型：

- 根级 MemoryRegion：直接通过memory_region_init初始化，没有自己的内存，用于管理 subregion，例如system_memory：
```c
void memory_region_init(MemoryRegion *mr,
                        const char *name,
                        uint64_t size)
{
    mr->ops = NULL;
    mr->parent = NULL;
    mr->size = int128_make64(size);
    if (size == UINT64_MAX) {
        mr->size = int128_2_64();
    }
    mr->addr = 0;
    mr->subpage = false;
    mr->enabled = true;
    mr->terminates = false; // 非实体 MemoryRegion，搜索时会继续前往其 subregions
    mr->ram = false;        // 根级 MemoryRegion 不分配内存
    mr->readable = true;
    mr->readonly = false;
    mr->rom_device = false;
    mr->destructor = memory_region_destructor_none;
    mr->priority = 0;
    mr->may_overlap = false;
    mr->alias = NULL;
    QTAILQ_INIT(&mr->subregions);
    memset(&mr->subregions_link, 0, sizeof mr->subregions_link);
    QTAILQ_INIT(&mr->coalesced);
    mr->name = g_strdup(name);
    mr->dirty_log_mask = 0;
    mr->ioeventfd_nb = 0;
    mr->ioeventfds = NULL;
}
```
可以看到mr->addr被设置为 0，而mr->ram_addr则并没有初始化。


- 实体 `MemoryRegion`：通过`memory_region_init_ram()`初始化，有自己的内存（从 QEMU 进程地址空间中分配），大小为`size`，例如`ram_memory`、 `pci_memory`：

```c
void *pc_memory_init(MemoryRegion *system_memory,
                    const char *kernel_filename,
                    const char *kernel_cmdline,
                    const char *initrd_filename,
                    ram_addr_t below_4g_mem_size,
                    ram_addr_t above_4g_mem_size,
                    MemoryRegion *rom_memory,
                    MemoryRegion **ram_memory)
{
    MemoryRegion *ram, *option_rom_mr;
    /* ...*/

    /* Allocate RAM.  We allocate it as a single memory region and use
     * aliases to address portions of it, mostly for backwards compatibility
     * with older qemus that used qemu_ram_alloc().
     */
    ram = g_malloc(sizeof(*ram));
    // 调用 memory_region_init_ram 对 ram_memory 进行初始化
    memory_region_init_ram(ram, "pc.ram", below_4g_mem_size + above_4g_mem_size);
    vmstate_register_ram_global(ram);
    *ram_memory = ram;

    /* ... */
}
```

```c
void memory_region_init_ram(MemoryRegion *mr,
                            const char *name,
                            uint64_t size)
{
    memory_region_init(mr, name, size);
    mr->ram = true;
    mr->terminates = true;
    mr->destructor = memory_region_destructor_ram;
    mr->ram_addr = qemu_ram_alloc(size, mr);
}
```
可以看到这里是先调用了`memory_region_init()`，之后设置 `RAM` 属性，并继续调用`qemu_ram_alloc()`分配内存。

- 别名 `MemoryRegion`：通过`memory_region_init_alias()` 初始化，没有自己的内存，表示实体 `MemoryRegion` 的一部分。通过 `alias` 成员指向实体 `MemoryRegion`，`alias_offset`为在实体 `MemoryRegion` 中的偏移量，例如`ram_below_4g`、`ram_above_4g`：
```c
void *pc_memory_init(MemoryRegion *system_memory,
                    const char *kernel_filename,
                    const char *kernel_cmdline,
                    const char *initrd_filename,
                    ram_addr_t below_4g_mem_size,
                    ram_addr_t above_4g_mem_size,
                    MemoryRegion *rom_memory,
                    MemoryRegion **ram_memory)
{
    MemoryRegion *ram_below_4g, *ram_above_4g;
    /* ... */
    ram_below_4g = g_malloc(sizeof(*ram_below_4g));
    // 调用 memory_region_init_alias 对 ram_below_4g 进行初始化
    memory_region_init_alias(ram_below_4g, "ram-below-4g", ram, 0, below_4g_mem_size);
    /* ..
```

```c
void memory_region_init_alias(MemoryRegion *mr,
                              const char *name,
                              MemoryRegion *orig,
                              target_phys_addr_t offset,
                              uint64_t size)
{
    memory_region_init(mr, name, size);
    mr->alias = orig; // 指向实体 MemoryRegion
    mr->alias_offset = offset; //通过offset得到实体的某一个部分
}
```

### RAMBlock

#### 结构体定义
`MemoryRegion` 用来描述一段逻辑层面上的内存区域，而记录实际分配的内存地址信息的结构体则是 `RAMBlock`，在`ramblock.h`中定义：
```c

struct RAMBlock {
    struct rcu_head rcu;
    struct MemoryRegion *mr;
    uint8_t *host;
    uint8_t *colo_cache; /* For colo, VM's ram cache */
    ram_addr_t offset;
    ram_addr_t used_length;
    ram_addr_t max_length;
    void (*resized)(const char*, uint64_t length, void *host);
    uint32_t flags;
    /* Protected by iothread lock.  */
    char idstr[256];
    /* RCU-enabled, writes protected by the ramlist lock */
    QLIST_ENTRY(RAMBlock) next;
    QLIST_HEAD(, RAMBlockNotifier) ramblock_notifiers;
    int fd;
    size_t page_size;
    /* dirty bitmap used during migration */
    unsigned long *bmap;
    /* bitmap of already received pages in postcopy */
    unsigned long *receivedmap;

    /*
     * bitmap to track already cleared dirty bitmap.  When the bit is
     * set, it means the corresponding memory chunk needs a log-clear.
     * Set this up to non-NULL to enable the capability to postpone
     * and split clearing of dirty bitmap on the remote node (e.g.,
     * KVM).  The bitmap will be set only when doing global sync.
     *
     * NOTE: this bitmap is different comparing to the other bitmaps
     * in that one bit can represent multiple guest pages (which is
     * decided by the `clear_bmap_shift' variable below).  On
     * destination side, this should always be NULL, and the variable
     * `clear_bmap_shift' is meaningless.
     */
    unsigned long *clear_bmap;
    uint8_t clear_bmap_shift;

    /*
     * RAM block length that corresponds to the used_length on the migration
     * source (after RAM block sizes were synchronized). Especially, after
     * starting to run the guest, used_length and postcopy_length can differ.
     * Used to register/unregister uffd handlers and as the size of the received
     * bitmap. Receiving any page beyond this length will bail out, as it
     * could not have been valid on the source.
     */
    ram_addr_t postcopy_length;
};

```
可以看到在 `RAMBlock` 中host和offset域分别对应了 `HVA` 和` GPA`，因此也可以说 `RAMBlock` 中存储了`GPA->HVA`的映射关系，另外每一个 `RAMBlock` 都会指向其所属的 `MemoryRegion`。

#### 全局变量 ram_list

QEMU 在`ramlist.h`中定义了一个全局变量`ram_list`，以链表的形式维护了所有的 `RAMBlock`：

```c
typedef struct RAMList {
    QemuMutex mutex;
    RAMBlock *mru_block;
    /* RCU-enabled, writes protected by the ramlist lock. */
    QLIST_HEAD(, RAMBlock) blocks;
    DirtyMemoryBlocks *dirty_memory[DIRTY_MEMORY_NUM];
    uint32_t version;
    QLIST_HEAD(, RAMBlockNotifier) ramblock_notifiers;
} RAMList;
extern RAMList ram_list;
````

每一个新分配的 `RAMBlock` 都会被插入到`ram_list`的头部。如需查找地址所对应的 `RAMBlock`，则需要遍历`ram_list`，当目标地址落在当前` RAMBlock `的地址区间时，该 `RAMBlock` 即为查找目标。


####  AS、MR、RAMBlock 之间的关系

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220125133133.svg)

### FlatView


AddressSpace 的root域及其子树共同构成了 Guest 的物理地址空间，但这些都是在 QEMU 侧定义的。要传入 KVM 进行设置时，复杂的树状结构是不利于内核进行处理的，因此需要将其**转换为一个“平坦”的地址模**型，也就是一个从零开始、只包含地址信息的数据结构，这在 QEMU 中通过 **FlatView** 来表示。每个 AddressSpace 都有一个与之对应的 FlatView 指针current_map，表示其对应的平面展开视图。


#### 结构体定义
`FlatView` 在`memory.c`中定义：

```c

/* Flattened global view of current active memory hierarchy.  Kept in sorted
 * order.
 */
struct FlatView {
    struct rcu_head rcu;
    unsigned ref;
    FlatRange *ranges;      // 对应的 FlatRange 数组
    unsigned nr;            // FlatRange 的数目
    unsigned nr_allocated;  // 当前数组的项数
    struct AddressSpaceDispatch *dispatch;
    MemoryRegion *root;
};
```
其中，`ranges`是一个数组，记录了 `FlatView` 下所有的 `FlatRange`。



#### FlatRange

在 `FlatView` 中，`FlatRange` 表示在 `FlatView` 中的一段内存范围，同样在`memory.c`中定义：
```c
/* Range of memory in the global map.  Addresses are absolute. */
struct FlatRange {
    MemoryRegion *mr;           // 指向所属的 MemoryRegion
    hwaddr offset_in_region;    // 在全局 MemoryRegion 中的 offset，对应 GPA
    AddrRange addr;             // 代表的地址区间，对应 HVA
    uint8_t dirty_log_mask;
    bool romd_mode;
    bool readonly;
    bool nonvolatile;
};
```
每个 `FlatRange` 对应一段虚拟机物理地址区间，各个 `FlatRange` 不会重叠，**按照地址的顺序保存在数组中**，具体的地址范围由一个 `AddrRange` 结构来描述：

```c
/*
 * AddrRange 用于表示 FlatRange 的起始地址及大小
 */
struct AddrRange {
    Int128 start;
    Int128 size;
};
```

### MemoryRegionSection

####  结构体定义

在 `QEMU` 中，还有几个起到中介作用的结构体，`MemoryRegionSection` 就是其中之一。

之前介绍的 `FlatRange` 代表一个物理地址空间的片段，偏向于描述在 `Host` 侧即 **AddressSpace 中的分布【Guest的物理空间】**，而 `MemoryRegionSection` 则代表在 `Guest` 侧即 **MemoryRegion 中的片段**。`MemoryRegionSection` 在`memory.h`中定义：

```c
/**
 * MemoryRegionSection: describes a fragment of a #MemoryRegion
 *
 * @mr: the region, or %NULL if empty
 * @address_space: the address space the region is mapped in
 * @offset_within_region: the beginning of the section, relative to @mr's start
 * @size: the size of the section; will not exceed @mr's boundaries
 * @offset_within_address_space: the address of the first byte of the section
 *     relative to the region's address space
 * @readonly: writes to this section are ignored
 */
 //只是起到描述的作用，描述了是哪个AddressSpace的MemoryRegion，
 //并且在MemoryRegion中的offset，和在AddressSpace展开为平坦内存的offset
struct MemoryRegionSection {  
    MemoryRegion *mr;                               // 所属的 MemoryRegion
    MemoryRegion *address_space;                    // 关联的 AddressSpace
    target_phys_addr_t offset_within_region;        // 在 MemoryRegion 内部的 offset
    uint64_t size;                                  // Section 的大小
    target_phys_addr_t offset_within_address_space; // 在 AddressSpace 内部的 offset
    bool readonly;                                  // 是否为只读
};
```
- `offset_within_region`：在所属 `MemoryRegion` 中的` offset`。一个`AddressSpace` 可能由多个 `MemoryRegion` 组成，因此该 `offset` 是局部的
- `offset_within_address_space`：在所属 `AddressSpace` 中的 `offset`，它是全局的

#### 和其他数据结构之间的关系
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220125110422.png)

- `AddressSpace` 的`root`指向对应的根级`MemoryRegion`，`current_map`指向`AddressSpace` 的`root`通过`generate_memory_topology()`生成的 `FlatView`
- `FlatView` 中的`ranges`数组表示该` MemoryRegion` 所表示的` Guest `地址区间【GPA的整个平坦物理空间】，并按照地址的顺序进行排列
- `MemoryRegionSection` 由`ranges`数组中的 `FlatRange` 对应生成，作为注册到 `KVM `中的基本单位

---

`QEMU` 在用户空间申请内存后，需要将内存信息通过一系列系统调用传入内核空间的 `KVM`，由 `KVM` 侧进行管理，因此 `QEMU` 侧也定义了一些用于向 `KVM` 传递参数的结构体。

以下为`KVM`相关的数据结构。
### KVMSlot

`在kvm_init.h`中定义，是 `KVM` 中内存管理的基本单位：

```c
typedef struct KVMSlot
{
    hwaddr start_addr; // Guest 物理地址，GPA
    ram_addr_t memory_size;        // 内存大小
    void *ram; // QEMU 用户空间地址，HVA
    int slot;  // Slot 编号
    int flags; // 标志位，例如是否追踪脏页、是否可用等
    /* Dirty bitmap cache for the slot */
    unsigned long *dirty_bmap;
    unsigned long dirty_bmap_size;
    /* Cache of the address space ID */
    int as_id;
    /* Cache of the offset in ram address space */
    ram_addr_t ram_start_offset;
} KVMSlot;
```

`KVMSlot` 类似于内存插槽的概念。

### kvm_userspace_memory_region
调用`ioctl(KVM_SET_USER_MEMORY_REGION)`时需要向 `KVM` 传递的参数，在`kvm.h`中定义


```c
/* for KVM_SET_USER_MEMORY_REGION */
struct kvm_userspace_memory_region {
    __u32 slot;            // slot 编号
    __u32 flags;           // 标志位，例如是否追踪脏页、是否可用等
    __u64 guest_phys_addr; // Guest 物理地址，GPA
    __u64 memory_size;     // 内存大小，bytes
    __u64 userspace_addr;  // 从 QEMU 进程空间分配的起始地址，HVA
};
```

### MemoryListener

#### 结构体定义

为了监控虚拟机的物理地址访问，对于每一个 `AddressSpace`，都会有一个 `MemoryListener` 与之对应。每当物理映射`GPA->HVA`发生改变时，就会回调这些函数。**MemoryListener** 是对一些事件的**回调函数合集**，在`memory.h`中定义：

```c
/**
 * MemoryListener: callbacks structure for updates to the physical memory map
 *
 * Allows a component to adjust to changes in the guest-visible memory map.
 * Use with memory_listener_register() and memory_listener_unregister().
 */
struct MemoryListener {
    void (*begin)(MemoryListener *listener);
    void (*commit)(MemoryListener *listener);
    void (*region_add)(MemoryListener *listener, MemoryRegionSection *section);
    void (*region_del)(MemoryListener *listener, MemoryRegionSection *section);
    void (*region_nop)(MemoryListener *listener, MemoryRegionSection *section);
    void (*log_start)(MemoryListener *listener, MemoryRegionSection *section);
    void (*log_stop)(MemoryListener *listener, MemoryRegionSection *section);
    void (*log_sync)(MemoryListener *listener, MemoryRegionSection *section);
    void (*log_global_start)(MemoryListener *listener);
    void (*log_global_stop)(MemoryListener *listener);
    void (*eventfd_add)(MemoryListener *listener, MemoryRegionSection *section,
                        bool match_data, uint64_t data, EventNotifier *e);
    void (*eventfd_del)(MemoryListener *listener, MemoryRegionSection *section,
                        bool match_data, uint64_t data, EventNotifier *e);
    /* Lower = earlier (during add), later (during del) */
    unsigned priority;
    MemoryRegion *address_space_filter;
    QTAILQ_ENTRY(MemoryListener) link;
};
```

#### 全局变量 memory_listeners
所有的 `MemoryListener` 都会挂在全局变量`memory_listeners`链表上，在`memory.c`中定义：
```c
static QTAILQ_HEAD(, MemoryListener) memory_listeners
    = QTAILQ_HEAD_INITIALIZER(memory_listeners);
```
在`memory.c`中枚举了` ListenerDirection`:
```c
enum ListenerDirection { Forward, Reverse };
```

###  重要数据结构总览

| 结构体名 |说明 |
| :----: |:---- |
|AddressSpace|	VM 能看到的一段地址空间，偏向 Host 侧【注意指的是偏向】|
|MemoryRegion		|地址空间中一段逻辑层面的内存区域，偏向 Guest 侧|
|RAMBlock	|记录实际分配的内存地址信息，存储了GPA->HVA的映射关系|
|FlatView|		MemoryRegion 对应的平面展开视图，包含一个 FlatRange 类型的 ranges 数组|
|FlatRange|		对应一段虚拟机物理地址区间，各个 FlatRange 不会重叠，按照地址的顺序保存在数组中|
|MemoryRegionSection	|	表示 MemoryRegion 中的片段|
|MemoryListener|		回调函数集合|
|KVMSlot		|KVM 中内存管理的基本单位，表示一个内存插槽|
|kvm_userspace_memory_region|		调用ioctl(KVM_SET_USER_MEMORY_REGION)时需要向 KVM 传递的参数|

## 具体实现机制

QEMU 的内存申请流程大致可分为三个部分：回调函数的注册、AddressSpace 的初始化、实际内存的分配。下面将根据在vl.c的main()函数中的调用顺序分别介绍。

### 回调函数的注册

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220125133808.png)

```c
int main()
  └─ static int configure_accelerator()
       └─ int kvm_init()                                     // 初始化 KVM
            ├─ int kvm_ioctl(KVM_CREATE_VM)                  // 创建 VM
            ├─ int kvm_arch_init()                           // 针对不同的架构进行初始化
            └─ void memory_listener_register()               // 注册 kvm_memory_listener
                 └─ static void listener_add_address_space() // 调用 region_add 回调
                      └─ static void kvm_region_add()        // region_add 对应的回调实现
                           └─ static void kvm_set_phys_mem() // 根据传入的 section 填充 KVMSlot
                                └─ static int kvm_set_user_memory_region()
                                     └─ int ioctl(KVM_SET_USER_MEMORY_REGION)
```

进入`configure_accelerator()`后，`QEMU `会先调用`configure_accelerator()`设置 `KVM` 的加速支持，之后进入`kvm_init()`。该函数主要完成对 KVM 的初始化，包括一些常规检查如 `CPU` 个数、`KVM` 版本等，之后通过`kvm_ioctl(KVM_CREATE_VM)`与内核交互，创建 `KVM` 虚拟机。在`kvm_init()`的最后，会调用`memory_listener_register()`注册`kvm_memory_listener`：

```c
static int kvm_init(MachineState *ms)
{
    MachineClass *mc = MACHINE_GET_CLASS(ms);
    // 打开/dev/kvm
    s->fd = qemu_open_old("/dev/kvm", O_RDWR);
    // 创建VM
    do {
        ret = kvm_ioctl(s, KVM_CREATE_VM, type);
    } while (ret == -EINTR);
/* ... */
    ret = kvm_arch_init(s); // 针对不同的架构进行初始化

    // 对于以下 AddressSpace，设置其对应的 listener
    kvm_memory_listener_register(s, &s->memory_listener,
                                 &address_space_memory, 0, "kvm-memory");
    memory_listener_register(&kvm_coalesced_pio_listener,
                             &address_space_io);
/* ... */
}
```

```c
void memory_listener_register(MemoryListener *listener, AddressSpace *as)
{
    MemoryListener *other = NULL;

    /* Only one of them can be defined for a listener */
    assert(!(listener->log_sync && listener->log_sync_global));

    listener->address_space = as;
    if (QTAILQ_EMPTY(&memory_listeners)
        || listener->priority >= QTAILQ_LAST(&memory_listeners)->priority) {
        QTAILQ_INSERT_TAIL(&memory_listeners, listener, link);
    } else {
        QTAILQ_FOREACH(other, &memory_listeners, link) {
            if (listener->priority < other->priority) {
                break;
            }
        }
        QTAILQ_INSERT_BEFORE(other, listener, link);
    }

    if (QTAILQ_EMPTY(&as->listeners)
        || listener->priority >= QTAILQ_LAST(&as->listeners)->priority) {
        QTAILQ_INSERT_TAIL(&as->listeners, listener, link_as);
    } else {
        QTAILQ_FOREACH(other, &as->listeners, link_as) {
            if (listener->priority < other->priority) {
                break;
            }
        }
        QTAILQ_INSERT_BEFORE(other, listener, link_as);
    }

    listener_add_address_space(listener, as);
}
```

最后的`listener_add_address_space()`主要是将listener注册到其对应的 `AddressSpace` 上，并根据 `AddressSpace` 对应的 `FlatRange` 数组，生成 `MemoryRegionSection`【`MemoryRegionSection`就像是为`FlatRange`数组设置的一种中介表示，便于传入`KVM`，因为传入`KVM`应该是对平坦内存的一种表示】，并注册到 `KVM` 中：

```c

static void listener_add_address_space(MemoryListener *listener,
                                       AddressSpace *as)
{
    FlatView *view;
    FlatRange *fr;

    if (listener->begin) {
        listener->begin(listener);
    }
    /* 开启内存脏页记录 */
    if (global_dirty_tracking) {
        if (listener->log_global_start) {
            listener->log_global_start(listener);
        }
    }

    /* 遍历 AddressSpace 对应的 FlatRange 数组，并将其转换成 MemoryRegionSection */
    view = address_space_get_flatview(as);
    FOR_EACH_FLAT_RANGE(fr, view) {
        MemoryRegionSection section = section_from_flat_range(fr, view);
        /* 将 section 所代表的内存区域注册到 KVM 中 */
        if (listener->region_add) {
            listener->region_add(listener, &section);
        }
        if (fr->dirty_log_mask && listener->log_start) {
            listener->log_start(listener, &section, 0, fr->dirty_log_mask);
        }
    }
    if (listener->commit) {
        listener->commit(listener);
    }
    flatview_unref(view);
}
```
由于此时 `AddressSapce` 尚未初始化，所以此处的循环为空，仅是在全局注册了`kvm_memory_listener`。最后调用了`kvm_memory_listener->region_add()`，对应的实现是`kvm_region_add()`，该函数最终会通过`ioctl(KVM_SET_USER_MEMORY_REGION)`，将 `QEMU` 侧申请的内存信息传入 `KVM` 进行注册，这里的流程会在下一部分进行分析。


### AddressSpace 的初始化

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220125154841.png)

```c
int main()
  └─ void cpu_exec_init_all()
       ├─ static void memory_map_init()
       |    ├─ void memory_region_init()    // 初始化 system_memory/io 这两个全局 MemoryRegion
       |    ├─ void set_system_memory_map() // address_space_memory->root = system_memory
       |    |    └─ static void memory_region_update_topology()        // 为 MemoryRegion 生成 FlatView
       |    |         └─ static void address_space_update_topology()   // as->current_map = new_view
       |    |              └─ static void address_space_update_topology_pass()
       |    |                   └─ static void kvm_region_add()        // region_add 对应的回调实现
       |    |                        └─ static void kvm_set_phys_mem() // 根据传入的 section 填充 KVMSlot
       |    |                             └─ static int kvm_set_user_memory_region()
       |    |                                  └─ int ioctl(KVM_SET_USER_MEMORY_REGION)
       |    |
       |    └─ void memory_listener_register() // 注册对应的 MemoryListener
       |         └─ static void listener_add_address_space()
       |
       └─ static void io_mem_init()
            └─ void memory_region_init_io() // ram/rom/unassigned/notdirty/subpage-ram/watch
                 └─ void memory_region_init()
```

第一部分在全局注册了`kvm_memory_listener`，但由于` AddressSpace` 尚未初始化，实际上并未向 `KVM` 中注册任何实际的内存信息。`QEMU` 在`main()`函数中会继续调用`cpu_exec_init_all()`对` AddressSpace `进行初始化，该函数实际上是对两个 `init` 函数的封装调用：

```c

void cpu_exec_init_all(void)
{
    qemu_mutex_init(&ram_list.mutex);
    /* The data structures we set up here depend on knowing the page size,
     * so no more changes can be made after this point.
     * In an ideal world, nothing we did before we had finished the
     * machine setup would care about the target page size, and we could
     * do this much later, rather than requiring board models to state
     * up front what their requirements are.
     */
    finalize_target_page_bits();
    io_mem_init();      // 初始化六个I/O MemoryRegion
    memory_map_init(); // 初始化两个全局 AddressSpace，以及对应的 MemoryRegion、FlatView
    qemu_mutex_init(&map_client_list_lock);
}
```
先来看`memory_map_init()`，主要用来初始化两个全局的系统地址空间`system_memory`、`system_io`
```c
static void memory_map_init(void)
{
    system_memory = g_malloc(sizeof(*system_memory));
    // 1. 初始化 system_memory
    memory_region_init(system_memory, NULL, "system", UINT64_MAX);
    // 2. 设置 address_space_memory 关联 system_memory
    // 这两个都是全局变量，也就是把内存地址空间和IO地址空间于对应的MemoryRegion联系起来 
    //及其对应的 FlatView
    address_space_init(&address_space_memory, system_memory, "memory");

    system_io = g_malloc(sizeof(*system_io));
    // 1. 初始化 system_io  
    memory_region_init_io(system_io, NULL, &unassigned_io_ops, NULL, "io",
                          65536);
    // 2. 设置 address_space_io 关联 system_io 
    // 及其对应的 FlatView
    address_space_init(&address_space_io, system_io, "I/O");
}
```

这里比较重要的是`address_space_init()`，先设置 `AddressSpace` 对应的 `MemoryRegion`，之后根据`system_memory`更新`address_space_memory`对应的 `FlatView`：
```c
void address_space_init(AddressSpace *as, MemoryRegion *root, const char *name)
{
    memory_region_ref(root);
    // 将 address_space_memory 的 root 域指向 system_memory
    as->root = root;        
    as->current_map = NULL;
    as->ioeventfd_nb = 0;
    as->ioeventfds = NULL;
    QTAILQ_INIT(&as->listeners);
    QTAILQ_INSERT_TAIL(&address_spaces, as, address_spaces_link);
    as->name = g_strdup(name ? name : "anonymous");
    // 根据 system_memory 更新 address_space_memory 对应的 FlatView
    address_space_update_topology(as);  
    address_space_update_ioeventfds(as);
}
```
`address_space_update_topology()`会继续调用`generate_memory_topology()`生成 `AddressSpace` 对应的 `FlatView `视图：
```c
static void address_space_update_topology(AddressSpace *as)
{
    MemoryRegion *physmr = memory_region_get_flatview_root(as->root);

    flatviews_init();
    if (!g_hash_table_lookup(flat_views, physmr)) {
        generate_memory_topology(physmr);
    }
    address_space_set_flatview(as);
}
```

`address_space_update_topology()`会先调用`generate_memory_topology()`生成`system_memory`更新后的视图`new_view`，再将`address_space_memory`的`current_map`指向这个`new_view`，最后销毁`old_view`：

```c
static void address_space_set_flatview(AddressSpace *as)
{
    FlatView *old_view = address_space_to_flatview(as);
    MemoryRegion *physmr = memory_region_get_flatview_root(as->root);
    FlatView *new_view = g_hash_table_lookup(flat_views, physmr);

    assert(new_view);

    if (old_view == new_view) {
        return;
    }

    if (old_view) {
        flatview_ref(old_view);
    }

    flatview_ref(new_view);

    if (!QTAILQ_EMPTY(&as->listeners)) {
        FlatView tmpview = { .nr = 0 }, *old_view2 = old_view;

        if (!old_view2) {
            old_view2 = &tmpview;
        }
        address_space_update_topology_pass(as, old_view2, new_view, false);
        address_space_update_topology_pass(as, old_view2, new_view, true);
    }

    /* Writes are protected by the BQL.  */
    qatomic_rcu_set(&as->current_map, new_view);
    if (old_view) {
        flatview_unref(old_view);
    }

    /* Note that all the old MemoryRegions are still alive up to this
     * point.  This relieves most MemoryListeners from the need to
     * ref/unref the MemoryRegions they get---unless they use them
     * outside the iothread mutex, in which case precise reference
     * counting is necessary.
     */
    if (old_view) {
        flatview_unref(old_view);
    }
}
```
在`address_space_update_topology_pass()`的最后，会调用`MEMORY_LISTENER_UPDATE_REGION`这个宏，触发`region_add`对应的回调函数`kvm_region_add()`。

这个宏在`memory.c`中定义，会将 `FlatView` 中的 `FlatRange` 转换为 `MemoryRegionSection`，作为入参传递给`kvm_region_add()`：

```C
/* No need to ref/unref .mr, the FlatRange keeps it alive.  */
#define MEMORY_LISTENER_UPDATE_REGION(fr, as, dir, callback, _args...)  \
    do {                                                                \
        MemoryRegionSection mrs = section_from_flat_range(fr,           \
                address_space_to_flatview(as));                         \
        MEMORY_LISTENER_CALL(as, callback, dir, &mrs, ##_args);         \
    } while(0)
```

而`kvm_region_add()`实际上是对`kvm_set_phys_mem()`的封装调用。该函数比较复杂，会根据传入的`section`填充 KVMSlot，再传递给`kvm_set_user_memory_region()`：

```C

static int kvm_set_user_memory_region(KVMMemoryListener *kml, KVMSlot *slot, bool new)
{
    KVMState *s = kvm_state;
    struct kvm_userspace_memory_region mem;
    int ret;

    // 根据 KVMSlot 填充 kvm_userspace_memory_region
    mem.slot = slot->slot | (kml->as_id << 16);
    mem.guest_phys_addr = slot->start_addr;
    mem.userspace_addr = (unsigned long)slot->ram;
    mem.flags = slot->flags;

    if (slot->memory_size && !new && (mem.flags ^ slot->old_flags) & KVM_MEM_READONLY) {
        /* Set the slot size to 0 before setting the slot to the desired
         * value. This is needed based on KVM commit 75d61fbc. */
        mem.memory_size = 0;
        ret = kvm_vm_ioctl(s, KVM_SET_USER_MEMORY_REGION, &mem);
        if (ret < 0) {
            goto err;
        }
    }
    mem.memory_size = slot->memory_size;
    ret = kvm_vm_ioctl(s, KVM_SET_USER_MEMORY_REGION, &mem);
    slot->old_flags = mem.flags;
    return ret;
}
```
可以看到这里又将 `KVMSlot` 转换为 `kvm_userspace_memory_region`，作为`ioctl()`的参数，交给内核中的 `KVM` 进行内存的注册【设置`GPA->HVA`的映射关系，在内核空间维护并管理 Guest 的内存】。

至此 QEMU 侧负责管理内存的数据结构均已完成初始化，**可以参考下面的图片了解各数据结构之间的对应关系**

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220127155506.png)


### 实际内存的分配

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220127160121.png)

```C
int main()
  └─ void machine->init(ram_size, ...)
       └─ static void pc_init_pci(ram_size, ...) // 初始化虚拟机
            └─ static void pc_init1(system_memory, system_io, ram_size, ...)
                 ├─ void memory_region_init(pci_memory, "pci", ...) // pci_memory, rom_memory
                 └─ void pc_memory_init() // 初始化内存，分配实际的物理内存地址
                      ├─ void memory_region_init_ram() // 创建 pc.ram, pc.rom 并分配内存
                      |    ├─ void memory_region_init()
                      |    └─ ram_addr_t qemu_ram_alloc()
                      |         └─ ram_addr_t qemu_ram_alloc_from_ptr()
                      |
                      ├─ void vmstate_register_ram_global() // 将 MR 的 name 写入 RAMBlock 的 idstr
                      |    └─ void vmstate_register_ram()
                      |         └─ void qemu_ram_set_idstr()
                      |
                      ├─ void memory_region_init_alias()    // 初始化 ram_below_4g, ram_above_4g
                      └─ void memory_region_add_subregion() // 在 system_memory 中添加 subregions
                           └─ static void memory_region_add_subregion_common()
                                └─ static void memory_region_update_topology() // 为 MemoryRegion 生成 FlatView
                                     └─ static void address_space_update_topology() // as->current_map = new_view
                                          └─ static void address_space_update_topology_pass()
                                               └─ static void kvm_region_add() // region_add 对应的回调实现
                                                    └─ static void kvm_set_phys_mem() // 根据传入的 section 填充 KVMSlot
                                                         └─ static int kvm_set_user_memory_region()
                                                              └─ int ioctl(KVM_SET_USER_MEMORY_REGION)
```
之前的回调函数注册、AddressSpace 的初始化，实际上均没有对应的物理内存。【实际的内存是在RAMBlock中】

我们再回到 `qemu` 启动的 `main` 函数中。接下来的初始化过程会调用 `pc_init1`。在这里面，对于 `CPU` 虚拟化，我们会调用 `pc_cpus_init`。另外，`pc_init1` 还会调用` pc_memory_init`，进行内存的虚拟化。

```c
void *pc_memory_init(MemoryRegion *system_memory,
                    const char *kernel_filename,
                    const char *kernel_cmdline,
                    const char *initrd_filename,
                    ram_addr_t below_4g_mem_size,
                    ram_addr_t above_4g_mem_size,
                    MemoryRegion *rom_memory,
                    MemoryRegion **ram_memory)
{
    MemoryRegion *ram, *option_rom_mr;         // 两个实体 MR: pc.ram, pc.rom
    MemoryRegion *ram_below_4g, *ram_above_4g; // 两个别名 MR: ram_below_4g, ram_above_4g

    /* Allocate RAM.  We allocate it as a single memory region and use
     * aliases to address portions of it, mostly for backwards compatibility
     * with older qemus that used qemu_ram_alloc().
     */
    ram = g_malloc(sizeof(*ram)); // 创建 ram
    // 分配具体的内存（实际上会创建一个 RAMBlock 并将其 offset 值写入 ram.ram_addr，对应 GPA）
    memory_region_init_ram(ram, "pc.ram", below_4g_mem_size + above_4g_mem_size);
    // 将 MR 的 name 写入 RAMBlock 的 idstr
    vmstate_register_ram_global(ram);
    *ram_memory = ram;

    // 创建 ram_below_4g 表示 4G 以下的内存
    ram_below_4g = g_malloc(sizeof(*ram_below_4g));
    memory_region_init_alias(ram_below_4g, "ram-below-4g", ram, 0, below_4g_mem_size);
    // 将 ram_below_4g 挂在 system_memory 下
    memory_region_add_subregion(system_memory, 0, ram_below_4g);

    if (above_4g_mem_size > 0) {
        ram_above_4g = g_malloc(sizeof(*ram_above_4g));
        memory_region_init_alias(ram_above_4g, "ram-above-4g", ram, below_4g_mem_size, above_4g_mem_size);
        memory_region_add_subregion(system_memory, 0x100000000ULL, ram_above_4g);
    }
    /* ... */
}
```

这里的重点在于`memory_region_init_ram()`，它通过`qemu_ram_alloc()`获取ram这个 `MemoryRegion` 对应的 `RAMBlock` 的`offset`，并存入`ram.ram_addr`，这样就可以在`ram_list`中根据该字段查找 `MR` 对应的 `RAMBlock`：

```c
void memory_region_init_ram(MemoryRegion *mr, const char *name, uint64_t size)
{
    memory_region_init(mr, name, size); // 填充字段，初始化默认值
    mr->ram = true; // 表示为 RAM
    mr->terminates = true; // 表示为实体 MemoryRegion
    mr->destructor = memory_region_destructor_ram;
    mr->ram_addr = qemu_ram_alloc(size, mr); // 这里保存 RAMBlock 的 offset，即 GPA
}
```

而qemu_ram_alloc()最终会调用qemu_ram_alloc_from_ptr()，创建一个对应大小 RAMBlock 并分配内存，返回对应的 GPA 地址存入mr->ram_addr中：

```C
ram_addr_t qemu_ram_alloc_from_ptr(ram_addr_t size, void *host,
                                   MemoryRegion *mr)
{
    RAMBlock *new_block; // 创建一个 RAMBlock

    size = TARGET_PAGE_ALIGN(size); // 页对齐
    new_block = g_malloc0(sizeof(*new_block)); // 初始化 new_block

    new_block->mr = mr; // 将 new_block-> 指向入参的 MemoryRegion
    new_block->offset = find_ram_offset(size); // 从 ram_list 中的 RAMBlock 之间找到一段可以满足 size 需求的 gap，并返回起始地址的 offset，对应 GPA
    if (host) { // 新建的 RAMBlock host 字段为空，跳过
        new_block->host = host;
        new_block->flags |= RAM_PREALLOC_MASK;
    } else {
        if (mem_path) { // 未指定 mem_path
#if defined (__linux__) && !defined(TARGET_S390X)
            new_block->host = file_ram_alloc(new_block, size, mem_path);
            if (!new_block->host) {
                new_block->host = qemu_vmalloc(size);
                qemu_madvise(new_block->host, size, QEMU_MADV_MERGEABLE);
            }
#else
            fprintf(stderr, "-mem-path option unsupported\n");
            exit(1);
#endif
        } else {
            if (xen_enabled()) {
                xen_ram_alloc(new_block->offset, size, mr);
            } else if (kvm_enabled()) { // 从这里继续
                /* some s390/kvm configurations have special constraints */
                new_block->host = kvm_vmalloc(size); // 实际上还是调用 qemu_vmalloc(size)
            } else {
                new_block->host = qemu_vmalloc(size); // 从 QEMU 的线性空间中分配 size 大小的内存，返回 HVA
            }
            qemu_madvise(new_block->host, size, QEMU_MADV_MERGEABLE);
        }
    }
    new_block->length = size; // 将 length 设置为 size

    QLIST_INSERT_HEAD(&ram_list.blocks, new_block, next); // 将该 RAMBlock 插入 ram_list 头部

    ram_list.phys_dirty = g_realloc(ram_list.phys_dirty, // 重新分配 ram_list.phys_dirty 的内存空间
                                       last_ram_offset() >> TARGET_PAGE_BITS);
    memset(ram_list.phys_dirty + (new_block->offset >> TARGET_PAGE_BITS),
           0, size >> TARGET_PAGE_BITS);
    cpu_physical_memory_set_dirty_range(new_block->offset, size, 0xff); // 对该 RAMBlock 对应的内存标记为 dirty

    qemu_ram_setup_dump(new_block->host, size);

    if (kvm_enabled())
        kvm_setup_guest_memory(new_block->host, size);

    return new_block->offset;
}
```

这样一来`ram`【其实就是`system memory`，整个`Guest`物理空间的大小】对应的 `RAMBlock` 中就分配好了 `GPA` 和 `HVA`，就可以**将内存信息同步至 KVM 侧**了。

最后回到`pc_memory_init()`中，在分配完实际内存后，会先调用`memory_region_init_alias()`初始化`ram_below_4g`、`ram_above_4g`这两个` alias`，之后调用`memory_region_add_subregion()`将这两个 `alias` 指向`ram`这个实体 `MemoryRegion`。如下图，该函数最终会触发`kvm_region_add()`回调，将实际的内存信息传入 `KVM` 注册。该过程如下图所示，与之前分析的流程相同，此处不再赘述。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220127163205.png)

## 总结
虚拟机的内存管理也是需要用户态的 `qemu` 和内核态的 `KVM` 共同完成。为了加速内存映射，需要借助硬件的 `EPT` 技术。

### QEMU 侧
- 创建一系列 `MemoryRegion`，分别表示 `Guest` 中的 `RAM`、`ROM` 等区域。`MemoryRegion `之间通过 `alias` 或 `subregions` 的方式维护相互之间的关系，从而进一步细化区域的定义

- 对于一个实体 `MemoryRegion`（非 `alias`），在初始化内存的过程中 `QEMU` 会创建它所对应的 `RAMBlock`。该 `RAMBlock` 通过调用`qemu_ram_alloc_from_ptr()`从 `QEMU` 的进程地址空间中**以 mmap 的方式分配内存**，并负责**维护该 MemoryRegion 对应内存的起始 GPA/HVA/size 等相关信息**【在`qemu_ram_alloc_from_ptr`中创建的新`RAMBlock`有`offset`、`host`的赋值，即`GPA->HVA`的对应关系】

- `AddressSpace` 表示 `Guest` 的物理地址空间。如果 `AddressSpace` 中的 `MemoryRegion` 发生变化，则注册的 `listener` 会被触发，将所属的 `MemoryRegion` 树展开生成一维的 `FlatView`，比较 FlatRange 是否发生了变化。如果是，则调用相应的方法对 `MemoryRegionSection` 进行检查，更新 `QEMU` 中的 `KVMSlot`，同时填充`kvm_userspace_memory_region`结构体，作为`ioctl()`的参数更新 `KVM` 中的`kvm_memory_slot`


### KVM 侧
- 当 `QEMU` 通过`ioctl()`创建 `vcpu` 时，调用`kvm_mmu_create()`初始化 `MMU` 相关信息.
当 `KVM` 要进入 `Guest` 前，`vcpu_enter_guest()=>kvm_mmu_reload()`会将根级页表地址加载到 `VMCS`，让 `Guest` 使用该页表

- 当发生` EPT Violation` 时，`VM-EXIT `到 `KVM` 中。如果是缺页，则根据 `GPA` 算出 `gfn`，再根据 `gfn` 找到对应的 `KVMSlot`，从中得到对应的 `HVA`。然后根据 `HVA` 算出对应的 `pfn`，确保该 `Page` 位于内存中。填好缺失的页之后，需要更新 `EPT`，完善其中缺少的页表项，逐层补全页表

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220127163418.png)


>虚拟机的物理内存空间里面的页面当然不是一开始就映射到物理页面的，只有当虚拟机的内存被访问的时候，也即 `mmap` 分配的虚拟内存空间被访问的时候，先查看 `EPT` 页表，是否已经映射过，如果已经映射过，则经过四级页表映射，就能访问到物理页面。
如果没有映射过，则虚拟机会通过` VM-Exit `指令回到宿主机模式，通过 `handle_ept_violation` 补充页表映射。先是通过 `handle_mm_fault `为虚拟机的物理内存空间分配真正的物理页面，然后通过 `__direct_map` 添加 `EPT` 页表映射。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20220127171031.jpg)

































## Reference
[“QEMU内存空间虚拟化及内存管理” - B10g | FΓom 许大仙](http://xudaxian.fun/2020/09/03/QEMU%E5%86%85%E5%AD%98%E7%A9%BA%E9%97%B4%E8%99%9A%E6%8B%9F%E5%8C%96%E5%8F%8A%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86/)
[【原创】Linux虚拟化KVM-Qemu分析（五）之内存虚拟化 - LoyenWang - 博客园](https://www.cnblogs.com/LoyenWang/p/13943005.html)
[KVM/Qemu 工作原理系列目录_xiongwenwu的专栏-CSDN博客_qemu目录结构](https://blog.csdn.net/xiongwenwu/article/details/58586013)
[QEMU 内存虚拟化源码分析 | Keep Coding | 苏易北](https://abelsu7.top/2019/07/07/kvm-memory-virtualization/)