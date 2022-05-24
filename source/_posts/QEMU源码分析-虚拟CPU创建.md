---
title: QEMU源码分析-虚拟CPU创建
date: 2021-09-01 18:22:14
tags: [QEMU,Linux]
categories: [QEMU源码分析]
---
## 流程图
先开个头吧，把创建流程稍微捋一下，找到创建虚拟CPU的模块。至于中间的流程还没有详细分析，万事开头难，先上手再说吧。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210901182329.svg)

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

```c
int main()
--> qemu_init()
--> qemu_init_subsystems()
--> module_call_init()
```

当虚拟机真的要使用物理资源的时候，对下面的物理机上的资源要进行请求，所以它的工作模式有点儿类似操作系统对接驱动。驱动要符合一定的格式，才能算操作系统的一个模块。同理，qemu 为了模拟各种各样的设备，也需要管理各种各样的模块，这些模块也需要符合一定的格式。


定义一个 qemu 模块会调用 `type_init`。例如，`kvm` 的模块要在 `accel/kvm/kvm-all.c` 文件里面实现。在这个文件里面，有一行下面的代码：
```c
static const TypeInfo kvm_accel_type = {
    .name = TYPE_KVM_ACCEL,
    .parent = TYPE_ACCEL,
    .instance_init = kvm_accel_instance_init,
    .class_init = kvm_accel_class_init,
    .instance_size = sizeof(KVMState),
};

static void kvm_type_init(void)
{
    type_register_static(&kvm_accel_type);
}

type_init(kvm_type_init);
```
找到`type_init`的定义
```c
#define type_init(function) module_init(function, MODULE_INIT_QOM)
```
从代码里面的定义我们可以看出来，`type_init` 后面的参数是一个函数，调用 `type_init` 就相当于调用 `module_init`，在这里函数就是 `kvm_type_init`，类型就是 `MODULE_INIT_QOM`。

再查看一下`module_init`的定义
```c
//include/qemu/module.h
#define module_init(function, type)                                         \
static void __attribute__((constructor)) do_qemu_init_ ## function(void)    \
{                                                                           \
    register_module_init(function, type);                                   \
}
```
`module_init` 最终要调用 `register_module_init`。属于 `MODULE_INIT_QOM` 这种类型的，有一个 `Module` 列表 `ModuleTypeList`，列表里面是一项一项的 `ModuleEntry`。`KVM` 就是其中一项，并且会初始化每一项的 `init` 函数为参数表示的函数 `fn`，也即 `KVM` 这个 `module` 的 `init` 函数就是 `kvm_type_init`。

当然，`MODULE_INIT_QOM` 这种类型会有很多很多的 `module`，从后面的代码我们可以看到，所有调用 `type_init` 的地方都注册了一个 `MODULE_INIT_QOM` 类型的 `Module`。


了解了 `Module` 的注册机制，我们继续回到 `qemu_init_subsystems` 函数中 `module_call_init` 的调用。

```c
void qemu_init_subsystems(void)
{
    Error *err;
    os_set_line_buffering();
    module_call_init(MODULE_INIT_TRACE);
    qemu_init_cpu_list();
    qemu_init_cpu_loop();
    qemu_mutex_lock_iothread();
    atexit(qemu_run_exit_notifiers);
    module_call_init(MODULE_INIT_QOM);
    module_call_init(MODULE_INIT_MIGRATION);
.
.
.
}
```
```c
// utils/module.c
void module_call_init(module_init_type type)
{
    ModuleTypeList *l;
    ModuleEntry *e;
    l = find_type(type);
    QTAILQ_FOREACH(e, l, node) {
        e->init();
    }
}
```

在 `module_call_init` 中，我们会找到 `MODULE_INIT_QOM` 这种类型对应的 `ModuleTypeList`，找出列表中所有的 `ModuleEntry`，然后调用每个 `ModuleEntry` 的 `init` 函数。这里需要注意的是，在 `module_call_init` 调用的这一步，所有 `Module` 的 `init` 函数都已经被调用过了。

后面我们会看到很多的 `Module`，当我们后面再次遇到时，需要意识到，它的 `init` 函数在这里也被调用过了。这里我们还是以对于 `kvm` 这个 `module` 为例子，看看它的 `init` 函数都做了哪些事情。我们会发现，其实它调用的是 `kvm_type_init`。

```c
static void kvm_type_init(void)
{
    type_register_static(&kvm_accel_type);
}
TypeImpl *type_register_static(const TypeInfo *info)
{
    return type_register(info);
}
TypeImpl *type_register(const TypeInfo *info)
{
    assert(info->parent);
    return type_register_internal(info);
}
static TypeImpl *type_register_internal(const TypeInfo *info)
{
    TypeImpl *ti;
    ti = type_new(info);
 
    type_table_add(ti);
    return ti;
}
static TypeImpl *type_new(const TypeInfo *info)
{
    TypeImpl *ti = g_malloc0(sizeof(*ti));
    int i;
 
    if (type_table_lookup(info->name) != NULL) {
    }
    ti->name = g_strdup(info->name);
    ti->parent = g_strdup(info->parent);
    ti->class_size = info->class_size;
    ti->instance_size = info->instance_size;
    ti->class_init = info->class_init;
    ti->class_base_init = info->class_base_init;
    ti->class_data = info->class_data;
    ti->instance_init = info->instance_init;
    ti->instance_post_init = info->instance_post_init;
    ti->instance_finalize = info->instance_finalize;
    ti->abstract = info->abstract;
    for (i = 0; info->interfaces && info->interfaces[i].type; i++) {
        ti->interfaces[i].typename = g_strdup(info->interfaces[i].type);
    }
    ti->num_interfaces = i;
    return ti;
}
static void type_table_add(TypeImpl *ti)
{
    assert(!enumerating_types);
    g_hash_table_insert(type_table_get(), (void *)ti->name, ti);
}
static GHashTable *type_table_get(void)
{
    static GHashTable *type_table;
 
    if (type_table == NULL) {
        type_table = g_hash_table_new(g_str_hash, g_str_equal);
    }
 
    return type_table;
}
static const TypeInfo kvm_accel_type = {
    .name = TYPE_KVM_ACCEL,
    .parent = TYPE_ACCEL,
    .class_init = kvm_accel_class_init,
    .instance_size = sizeof(KVMState),
};
```

调用流程如下：虚线表示返回

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210907133931.svg)

每一个 `Module` 既然要模拟某种设备，那应该定义一种类型 `TypeImpl` 来表示这些设备，这其实是一种`面向对象编程`的思路，只不过这里用的是纯 C 语言的实现，所以需要变相实现一下类和对象。

`kvm_type_init` 会注册 `kvm_accel_type`，定义上面的代码，我们可以认为这样动态定义了一个类。这个类的名字是 `TYPE_KVM_ACCEL`，这个类有父类 `TYPE_ACCEL`，这个类的初始化应该调用函数 `kvm_accel_class_init`。如果用这个类声明一个对象，对象的大小应该是 `instance_size`。

在 `type_register_internal` 中，我们会根据 `kvm_accel_type` 这个 `TypeInfo`，创建一个` TypeImpl` 来表示这个新注册的类，也就是说，`TypeImpl` 才是我们想要声明的那个 `class`。在 qemu 里面，有一个全局的哈希表 `type_table`，用来存放所有定义的类。在 `type_new` 里面，我们先从全局表里面根据名字`type_table_lookup`查找找这个类。如果找到，说明这个类曾经被注册过，就报错；如果没有找到，说明这是一个新的类，则将 `TypeInfo` 里面信息填到 `TypeImpl` 里面。`type_table_add` 会将这个类注册到全局的表里面。到这里，我们注意，`class_init` 还没有被调用，也即这个类现在还处于纸面的状态。

这点更加像 Java 的反射机制了。在 Java 里面，对于一个类，首先我们写代码的时候要写一个 `class xxx` 的定义，编译好就放在`.class` 文件中，这也是出于纸面的状态。然后，Java 会有一个 `Class` 对象，用于读取和表示这个纸面上的 `class xxx`，可以生成真正的对象。

相同的过程在后面的代码中我们也可以看到，`class_init` 会生成` XXXClass`，就相当于 Java 里面的 `Class `对象，`TypeImpl` 还会有一个 `instance_init` 函数，相当于构造函数，用于根据 `XXXClass` 生成 `Object`，这就相当于 Java 反射里面最终创建的对象。和构造函数对应的还有 `instance_finalize`，相当于析构函数。

这一套反射机制放在 `qom` 文件夹下面，全称 `QEMU Object Model`，也即用 C 实现了一套**面向对象的反射机制**。




## 初始化machine

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210913115046.svg)

```c
//vl.c
qemu_create_machine (select_machine());
```
在创建machine之前，先要通过`select_machine`确定一个`machine`。`select_machine`又是怎么确定的呢，这就和我们命令行的输入有关，比如我们`-m spike`，那么这里就会选择`spike`作为`machine`。它的定义在`hw/riscv/spike.c`中。

在源码最后有这么一句，会和我们上面解析的`type_init` 是一样的，在全局的表里面注册了一个全局的名字是`spike`的纸面上的 `class`，也即 `TypeImpl`。
```c
type_init(spike_machine_init_reqister_types)
```

现在全局表中有这个纸面上的 `class` 了。我们回到 `select_machine`。

在 `select_machine` 中，有两种方式可以生成 `MachineClass`。一种方式是 `find_default_machine`，找一个默认的；另一种方式是 `machine_parse`，通过解析参数生成 `MachineClass`。无论哪种方式，都会调用 `object_class_get_list` 获得一个 `MachineClass` 的列表，然后在里面找。

```c
static MachineClass *select_machine(void)
{
    GSList *machines = object_class_get_list(TYPE_MACHINE, false);
    MachineClass *machine_class = find_default_machine(machines);
    const char *optarg;
    QemuOpts *opts;
    Location loc;
    loc_push_none(&loc);
    opts = qemu_get_machine_opts();
    qemu_opts_loc_restore(opts);
    optarg = qemu_opt_get(opts, "type");
    if (optarg) {
        machine_class = machine_parse(optarg, machines);
    }
    if (!machine_class) {
        error_report("No machine specified, and there is no default");
        error_printf("Use -machine help to list supported machines\n");
        exit(1);
    }
    loc_pop(&loc);
    g_slist_free(machines);
    return machine_class;
}

static MachineClass *find_default_machine(GSList *machines)
{
    GSList *el;
    MachineClass *default_machineclass = NULL;
    for (el = machines; el; el = el->next) {
        MachineClass *mc = el->data;

        if (mc->is_default) {
            assert(default_machineclass == NULL && "Multiple default machines");
            default_machineclass = mc;
        }
    }
    return default_machineclass;
}

static MachineClass *machine_parse(const char *name, GSList *machines)
{
    MachineClass *mc;
    GSList *el;
    if (is_help_option(name)) {
        printf("Supported machines are:\n");
        machines = g_slist_sort(machines, machine_class_cmp);
        for (el = machines; el; el = el->next) {
            MachineClass *mc = el->data;
            if (mc->alias) {
                printf("%-20s %s (alias of %s)\n", mc->alias, mc->desc, mc->name);
            }
            printf("%-20s %s%s%s\n", mc->name, mc->desc,
                   mc->is_default ? " (default)" : "",
                   mc->deprecation_reason ? " (deprecated)" : "");
        }
        exit(0);
    }
    mc = find_machine(name, machines);
    if (!mc) {
        error_report("unsupported machine type");
        error_printf("Use -machine help to list supported machines\n");
        exit(1);
    }
    return mc;
}

```

`object_class_get_list` 定义如下：
```c
GSList *object_class_get_list(const char *implements_type,bool include_abstract)
{
    GSList *list = NULL;
    object_class_foreach(object_class_get_list_tramp,
                         implements_type, include_abstract, &list);
    return list;
}

void object_class_foreach(void (*fn)(ObjectClass *klass, void *opaque),
                          const char *implements_type, bool include_abstract,
                          void *opaque)
{
    OCFData data = { fn, implements_type, include_abstract, opaque };

    enumerating_types = true;
    g_hash_table_foreach(type_table_get(), object_class_foreach_tramp, &data);
    enumerating_types = false;
}
```
在全局表 `type_table_get()` 中，对于每一项 `TypeImpl`，我们都执行 `object_class_foreach_tramp`。
```c
static void object_class_foreach_tramp(gpointer key, gpointer value,
                                       gpointer opaque)
{
    OCFData *data = opaque;
    TypeImpl *type = value;
    ObjectClass *k;
    type_initialize(type);
    k = type->class;
    if (!data->include_abstract && type->abstract) {
        return;
    }
    if (data->implements_type && 
        !object_class_dynamic_cast(k, data->implements_type)) {
        return;
    }
    data->fn(k, data->opaque);
}
```

在 `object_class_foreach_tramp` 中，会调用将 `type_initialize`，这里面会调用 `class_init` 将纸面上的 `class` 也即 `TypeImpl` 变为 `ObjectClass`，`ObjectClass` 是所有` Class` 类的祖先，`MachineClass` 是它的子类。

因为在 `machine` 的命令行里面，我们指定了名字为`spike`，就肯定能够找到我们注册过了的 `TypeImpl`，并调用它的 `class_init` 函数。

所以，当 `select_machine` 执行完毕后，就有一个 `MachineClass` 了。

接着，我们回到 `qemu_create_machine` 中的`object_new_with_class`。这就很好理解了，`MachineClass` 是一个 `Class` 类，接下来应该通过它生成一个 `Instance`，也即对象，这就是 `object_new_with_class` 的作用。

`object_new_with_class` 中，`TypeImpl` 的 `instance_init` 会被调用，创建一个对象。`current_machine` 就是这个对象，它的类型是` MachineState`。

```c
Object *object_new_with_class(ObjectClass *klass)
{
    return object_new_with_type(klass->type);
}
static Object *object_new_with_type(Type type)
{
    Object *obj;
    type_initialize(type);
    obj = g_malloc(type->instance_size);
    object_initialize_with_type(obj, type->instance_size, type);
    obj->free = g_free;

    return obj;
}
```

至此，绕了这么大一圈，有关体系结构的对象才创建完毕，接下来很多的设备的初始化，包括 CPU 和内存的初始化，都是围绕着体系结构的对象来的，后面我们会常常看到` current_machine`。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220308180036.png)

## 参考
[Qemu CPU虚拟化 - 人生一世，草木一秋。 - 博客园](https://www.cnblogs.com/nm90/p/15661202.html)
[【原创】Linux虚拟化KVM-Qemu分析（四）之CPU虚拟化（2） - LoyenWang - 博客园](https://www.cnblogs.com/LoyenWang/p/13796537.html)