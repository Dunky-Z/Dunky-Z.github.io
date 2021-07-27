---
title: QEMU文档
date: 2021-07-27 11:12:01
tags: [linux, qemu]
---
# 调用文档
`qemu-system-x86_64 [options] [disk_image]
`
`disk_image`是 IDE 硬盘 0 的原始硬盘映像。某些目标不需要磁盘映像。
## 标准参数 Standard options
### `-h`
- 功能
  显示帮助信息并退出
- 子参数
- 调用实例
    ```
    qemu-system-riscv32 -h
    ```

### `-version`
- 功能
  显示qemu版本信息并退出
- 子参数
- 调用实例
    ```
    qemu-system-riscv32 -version
    ```

### `-machine [type=]name[,prop=value[,...]]`
- 功能
通过名称选择模拟器。使用 `-machine help` 可以查看可用的模拟器。
对于支持跨版本实时迁移兼容性的架构，每个版本都会引入一个新的版本化模拟器类型。例如，2.8.0 版本为 `x86_64/i686` 架构引入了`“pc-i440fx-2.8”`和`“pc-q35-2.8”`。
- 子参数
为了允许用户从 QEMU 2.8.0 版实时迁移到 QEMU 2.9.0 版，2.9.0 版也必须支持`“pc-i440fx-2.8”`和`“pc-q35-2.8”`机器。为了允许用户在升级时实时迁移 VMs 跳过多个中间版本，QEMU 的新版本将支持多个以前版本的机器类型 。
支持的机器属性有：
  - `accel=accels1[:accels2[:...]]`
This is used to enable an accelerator. Depending on the target architecture, kvm, xen, hax, hvf, nvmm, whpx or tcg can be available. By default, tcg is used. If there is more than one accelerator specified, the next one is used if the previous one fails to initialize.
  - `vmport=on|off|auto`
Enables emulation of VMWare IO port, for vmmouse etc. auto says to select the value based on accel. For accel=xen the default is off otherwise the default is on.
  - `dump-guest-core=on|off`
Include guest memory in a core dump. The default is on.
  - `mem-merge=on|off`
Enables or disables memory merge support. This feature, when supported by the host, de-duplicates identical memory pages among VMs instances (enabled by default).
  - `aes-key-wrap=on|off`
Enables or disables AES key wrapping support on s390-ccw hosts. This feature controls whether AES wrapping keys will be created to allow execution of AES cryptographic functions. The default is on.
  - `dea-key-wrap=on|off`
Enables or disables DEA key wrapping support on s390-ccw hosts. This feature controls whether DEA wrapping keys will be created to allow execution of DEA cryptographic functions. The default is on.
  - `nvdimm=on|off`
Enables or disables NVDIMM support. The default is off.
  - `memory-encryption=`
Memory encryption object to use. The default is none.
  - `hmat=on|off`
Enables or disables ACPI Heterogeneous Memory Attribute Table (HMAT) support. The default is off.
  - `memory-backend='id'`
An alternative to legacy -mem-path and mem-prealloc options. Allows to use a memory backend as main RAM.
For example: `:: -object memory-backend-file,id=pc.ram,size=512M,mem-path=/hugetlbfs,prealloc=on,share=on -machine memory-backend=pc.ram -m 512M`
Migration compatibility note: a) as backend id one shall use value of ‘default-ram-id’, advertised by machine type (available via query-machines QMP command), if migration to/from old QEMU (<5.0) is expected. b) for machine types 4.0 and older, user shall use x-use-canonical-path-for-ramblock-id=off backend option if migration to/from old QEMU (<5.0) is expected. For example: :: -object memory-backend-ram,id=pc.ram,size=512M,x-use-canonical-path-for-ramblock-id=off -machine memory-backend=pc.ram -m 512M
- 调用实例：
    ```
    qemu-system-riscv32 -machine virt,mem-merge=on
    ```

### `-cpu model`
- 功能
选择 CPU 型号（`-cpu help`显示帮助列表和附加功能的选项）
>默认情况会给客户机提供qemu64或qemu32的基本CPU模型。这样做可以对CPU特性提供一些高级的过滤功能，让客户机在同一组硬件平台上的动态迁移会更加平滑和安全。
在客户机中查看CPU信息(cat /proc/cpuinfo)，model name就是当前CPU模型的名称。
- 调用实例
    ```
    qemu-system-riscv32 -cpu rv32
    ```
  
### `accel name[,prop=value[,...]]`
- 功能
This is used to enable an accelerator. Depending on the target architecture, kvm, xen, hax, hvf, nvmm, whpx or tcg can be available. By default, tcg is used. If there is more than one accelerator specified, the next one is used if the previous one fails to initialize.
- 子参数
  - `igd-passthru=on|off`
When Xen is in use, this option controls whether Intel integrated graphics devices can be passed through to the guest (default=off)
  - `kernel-irqchip=on|off|split`
Controls KVM in-kernel irqchip support. The default is full acceleration of the interrupt controllers. On x86, split irqchip reduces the kernel attack surface, at a performance cost for non-MSI interrupts. Disabling the in-kernel irqchip completely is not recommended except for debugging purposes.
  - `kvm-shadow-mem=size`
Defines the size of the KVM shadow MMU.
  - `split-wx=on|off`
Controls the use of split w^x mapping for the TCG code generation buffer. Some operating systems require this to be enabled, and in such a case this will default on. On other operating systems, this will default off, but one may enable this for testing or debugging.
  - `tb-size=n`
Controls the size (in MiB) of the TCG translation block cache.
  - `thread=single|multi`
Controls number of TCG threads. When the TCG is multi-threaded there will be one thread per vCPU therefore taking advantage of additional host cores. The default is to enable multi-threading where both the back-end and front-ends support it and no incompatible TCG features have been enabled (e.g. icount/replay).
  - `dirty-ring-size=n`
When the KVM accelerator is used, it controls the size of the per-vCPU dirty page ring buffer (number of entries for each vCPU). It should be a value that is power of two, and it should be 1024 or bigger (but still less than the maximum value that the kernel supports). 4096 could be a good initial value if you have no idea which is the best. Set this value to 0 to disable the feature. By default, this feature is disabled (dirty-ring-size=0). When enabled, KVM will instead record dirty pages in a bitmap.

### `smp [[cpus=]n][,maxcpus=maxcpus][,sockets=sockets][,dies=dies][,cores=cores][,threads=threads]`
- 功能
配置客户机的SMP（Symmetric Multi-Processing），对称多处理机
- 子参数
  - `[cpus=]n `                 
设置客户机中使用逻辑的CPU数量（默认值是1）。
  - `[,maxcpus=cpus]` 
设置客户机最大可能被使用的CPU数量（可以用热插拔hot-plug添加CPU，不能超过maxcpus上限）。
  - `[,cores=cores]`
设置每个CPU socket上的core数量（默认值是1）。
  - `[,threads=threads]`
设置每个CPU core上的线程数（默认值是1）。
  - `[,sockets=sockets]`
设置客户机中总的CPU socket数量。

- 调用实例
```
qemu-system-x86_64  -smp 1,sockets=1,cores=2,threads=2
```

### `-numa node[,mem=size][,cpus=firstcpu[-lastcpu]][,nodeid=node][,initiator=initiator]`

### `-numa node[,memdev=id][,cpus=firstcpu[-lastcpu]][,nodeid=node][,initiator=initiator]`
### `-numa dist,src=source,dst=destination,val=distance`
### `-numa cpu,node-id=node[,socket-id=x][,core-id=y][,thread-id=z]`
### `-numa hmat-lb,initiator=node,target=node,hierarchy=hierarchy,data-type=tpye[,latency=lat][,bandwidth=bw]`
### `-numa hmat-cache,node-id=node,size=size,level=level[,associativity=str][,policy=str][,line=size]`
- 功能
- 子参数
- 调用实例


### `-add-fd fd=fd,set=set[,opaque=opaque]`
- 功能
- 子参数
- 调用实例


### `-set group.id.arg=value`
- 功能
- 子参数
- 调用实例

### `-global driver.prop=value`
- 功能
- 子参数
- 调用实例

### `-global driver=driver,property=property,value=value`
- 功能
- 子参数
- 调用实例

### `-boot [order=drives][,once=drives][,menu=on|off][,splash=sp_name][,splash-time=sp_time][,reboot-timeout=rb_timeout][,strict=on|off]`
- 功能
设置客户机启动顺序
>在qemu模拟的x86平台中，用"a"、"b"分别表示第一和第二软驱，用"c"表示第一个硬盘，用"d"表示CD-ROM光驱，用"n"表示从网络启动。
默认从硬盘启动。
- 子参数
  - `[order=drives]`
设置启动顺序。
  - `[,once=drives]`
只设置下一次启动的顺序，再重启后无效。
  - `[,menu=on|off]`
只要固件/BIOS 支持，就可以启用交互式引导菜单/提示。默认为非交互式引导。
  - `[,splash=sp_name]`
如果固件/BIOS 支持选项 splash=sp_name 和 menu=on，则可以将启动画面传递给 bios，使用户能够将其显示为徽标。目前 Seabios for X86 系统支持它。限制：启动文件可以是 24 BPP 格式（真彩色）的 jpeg 文件或 BMP 文件。分辨率应该是SVGA模式支持的，推荐320x240、640x480、800x640。
  - `[,splash-time=sp_time]`
  - `[,reboot-timeout=rb_timeout]`
引导失败时，客户机将暂停 `rb_timeout` 毫秒，然后重新启动。如果 `rb_timeout` 为 '-1'，客户机不会重启，qemu 默认将 '-1' 传递给 bios。目前 Seabios for X86 系统支持它。
  - `[,strict=on|off]`
只要固件/BIOS 支持，就通过严格启动。这仅在 bootindex 选项更改引导优先级时有效。默认为非严格引导。
- 调用实例
    ```
    # 尝试先从网络启动，然后从硬盘启动
    qemu-system-x86_64 
    -boot order=nc # 先从光驱启动，重启后切换回默认顺序
    qemu-system-x86_64 
    -boot once=d # boot with 5 秒钟的启动画面。
    qemu-system-x86_64 -boot menu=on,splash=/root/boot.bmp,splash-time=5000
    ```

###    `-m [size=]megs[,slots=n,maxmem=size]`
- 功能
将客户机内存设置为 `megs` M字节。默认值为 `128 MiB`。或者，也可以使用“M”或“G”的后缀。齐。

- 子参数
  - `[size=]megs`
将客户机内存设置为 `megs` M字节
  - `[,slots=n,maxmem=size]`
可用于设置可热插拔内存插槽的数量和最大内存数量。`maxmem` 必须与页面大小对
- 调用实例
以下命令行将客户机启动 RAM 大小设置为 1GB，创建 3 个插槽以热插拔额外内存，并将客户机可以达到的最大内存设置为 4GB：
    ```
    qemu-system-x86_64 -m 1G,slots=3,maxmem=4G
    ```
    如果未指定 `slot` 和 `maxmem`，则不会启用内存热插拔，并且客户机内存永远不会增加。

### `-mem-path path`
- 功能
使用huge page。对于内存访问密集型的应用，使用`huge page`是可以比较明显地提高客户机性能。 使用`huge page`的内存不能被换出（swap out），也不能使用`ballooning`方式自动增长。
- 子参数
- 调用实例

### `-mem-prealloc`
- 功能
使宿主机在客户机启动时就全部分配好客户机的内存
- 子参数
- 调用实例

### `-k language`
- 功能
设置键盘布局语言，默认为`en-us`
- 子参数
可用布局：
    ```
    ar  de-ch  es  fo     fr-ca  hu  ja  mk     no  pt-br  sv
    da  en-gb  et  fr     fr-ch  is  lt  nl     pl  ru     th
    de  en-us  fi  fr-be  hr     it  lv  nl-be  pt  sl     tr
    ```

- 调用实例

## 块设备参数 Block device options
### `fda file`
- 功能
为客户机指定软盘设备，指定客户机的第一个软盘设备,在客户机中显示为`/dev/fd0`
- 子参数
- 调用实例

### `fdb file`
- 功能
为客户机指定软盘设备，指定客户机的第一个软盘设备,在客户机中显示为`/dev/fd1`
- 子参数
- 调用实例

### `hda file`
### `hdb file`
### `hdc file`
### `hdd file`
- 功能
为客户机指定块存储设备，指定客户机种的第一个IDE设备
- 子参数
若客户机使用`PIIX_IDE`驱动，显示为`/dev/hda`设备；
若客户机使用`ata_piix`驱动，显示为`/dev/sda`设备。
若没有使用`-hdx`的参数，则默认使用`-hda`参数；
可以将宿主机的一块硬盘作为`-hda`的参数使用；
若文件名包含逗号，应使用两个连续的逗号进行转义。
- 调用实例

### `-cdrom file`
- 功能
为客户机指定光盘CD-ROM。可以将宿主机的光驱`/dev/cdrom`设备作为`-cdrom`参数使用。`-cdrom`参数不能与`-hdc`参数同时使用，因为`-cdrom`就是客户机里的第三个IDE设备
- 子参数
- 调用实例

### `-blockdev option[,option[,option[,...]]]`
- 功能

- 子参数
- 调用实例

### `-drive option[,option[,option[,...]]]`
- 功能
定义一个存储驱动器
- 子参数
  - `[file=file]`
加载`file`镜像文件到客户机的驱动器中。
  - `[,if=type]`
指定驱动器使用的接口类型：可用的类类型有：`ide`、`scsi`、`virtio`、`sd`、`floopy`、`pflash`等。
  - `[,bus=n]`
设置驱动器在客户机中的总线编号。
  - `[,unit=m]`
设置驱动器在客户机中的单元编号。
  - `[,media=d]`
设置驱动器中媒介的类型，值为disk或cdrom。
  - `[,index=i]`
设置在通一种接口的驱动器中的索引编号。
  - `[,snapshot=on|off]`
当值为on时，qemu不会将磁盘数据的更改写回到镜像文件中，而是写到临时文件中，可以在qemu moinitor中使用commit命令强制将磁盘数据保存回镜像文件中。
  - `[,cache=writethrough|writeback|none|directsync|unsafe]`
设置宿主机对块设备数据访问的cache模式。，
`writethrough`（直写模式）：调用write写入数据的同时将数据写入磁盘缓存和后端块设备中。
`writeback`（回写模式）：调用write写入数据时只将数据写入到磁盘缓存中，当数据被换出缓存时才写入到后端存储中。优点写入数据块，缺点系统掉电数据无法恢复。
  - `[,aio=threads|native]`
选择异步IO的方式
  - `threads`
为aio参数的默认值，让一个线程池去处理异步IO；
  - `native`
只适用于cache=none的情况，使用的是linux原生的AIO。
  - `[,format=f]`
指定使用的磁盘格式，默认是QEMU自动检测磁盘格式的。
  - `[,serial=s]`
指定分配给设备的序列号。
  - `[,addr=A]`
分配给驱动器控制器的PCI地址，只在使用virtio接口时适用。
  - `[,id=name]`
设置驱动器的ID，可以在QEMU monitor中用info block看到。
`[,readonly=on|off]`
设置驱动器是否只读。
- 调用实例


## USB参数 USB convenience options
## 显示参数 Display options
## 网络参数 Network options
## 仅限i386架构的参数 i386 target only




















