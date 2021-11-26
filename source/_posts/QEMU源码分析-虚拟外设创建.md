---
title: QEMU源码分析-虚拟外设创建(以GPIO为例)
date: 2021-11-09 17:39:38
tags: [QEMU]
---
一个板子上有很多硬件：芯片，LED、按键、LCD、触摸屏、网卡等等。芯片里面也有很多部件，比如CPU、GPIO、SD控制器、中断控制器等等。

这些硬件，或是部件，各有不同。怎么描述它们？

### 如何描述硬件
每一个都使用一个`TypeInfo`结构体来描述。

对于`KVM`有这样的结构体 
```c
static const TypeInfo kvm_accel_type = {
    .name = TYPE_KVM_ACCEL,
    .parent = TYPE_ACCEL,
    .class_init = kvm_accel_class_init,
    .instance_size = sizeof(KVMState),
};
```
对于`sifive_gpio`有这样的结构体
```c
static const TypeInfo sifive_gpio_info =
{
        .name = TYPE_SIFIVE_GPIO,
        .parent = TYPE_SYS_BUS_DEVICE,
        .instance_size = sizeof(SIFIVEGPIOState),
        .class_init = sifive_gpio_class_init
};
```

这些结构体在运行时会被注册进程序里，保存在一个链表中备用，为什么是备用，因为不是每一个硬件都会被用到。


### 如何注册硬件
当虚拟机真的要使用物理资源的时候，对下面的物理机上的资源要进行请求，所以它的工作模式有点儿类似操作系统对接驱动。驱动要符合一定的格式，才能算操作系统的一个模块。同理，`qemu` 为了模拟各种各样的设备，也需要管理各种各样的模块，这些模块也需要符合一定的格式。

怎么注册这些`TypeInfo`结构体呢？不需要我们去调用注册函数，以`GPIO`为例，在`hw/gpio/sifive_gpio.c`中有如下代码,一般在最后一行：

```c
type_init(sifive_gpio_register_types)
```
`F12`找到这个宏定义，我们追根溯源，调用过程如下
```c
type_init(sifive_gpio_register_types)
||
#define type_init(function) module_init(function, MODULE_INIT_QOM)
||
#define module_init(function, type)                                         \
static void __attribute__((constructor)) do_qemu_init_ ## function(void)    \
{                                                                           \
    register_module_init(function, type);                                   \
}
||
void register_module_init(void (*fn)(void), module_init_type type)
{
    ModuleEntry *e;     //构造ModuleEntry
    ModuleTypeList *l;  //构造链表

    e = g_malloc0(sizeof(*e));
    e->init = fn;       //设置初始化函数，fn即sifive_gpio_register_types
    e->type = type;

    l = find_type(type);

    QTAILQ_INSERT_TAIL(l, e, node);//将ModuleEntry插入链表尾
}
```
`type_init`是个宏定义，调用了`__attribute__((constructor))`函数，我们知道这个C语言中位数不多的在`main`函数执行前，执行的函数。函数中调用了`register_module_init`注册函数，说明在`main`函数执行前，已经注册好硬件了。该函数将一个新的`ModuleEntry`加到链表里。

### 初始化设备
了解了设备的注册机制，得到了`ModuleEntry`链表，那么`ModuleEntry`里面的`init`函数在合适被调用呢？

```c
//qemu/softmmu/main.c
int main()
--> qemu_init()
--> qemu_init_subsystems()
--> module_call_init()
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


在 `module_call_init` 中，我们会找到 `MODULE_INIT_QOM` 这种类型对应的 `ModuleTypeList`，找出列表中所有的 `ModuleEntry`，然后调用每个 `ModuleEntry` 的 `init` 函数。

这些`xxx_register_types`执行后，又得到了什么？

- 分配一个`TypeImpl`结构体，使用`TypeInfo`来设置它：
    ```c
    static void kvm_type_init(void)
    {
        type_register_static(&kvm_accel_type);
    }
    ||
    TypeImpl *type_register_static(const TypeInfo *info)
    {
        return type_register(info);
    }
    ||
    TypeImpl *type_register(const TypeInfo *info)
    {
        assert(info->parent);
        return type_register_internal(info);
    }
    ||
    static TypeImpl *type_register_internal(const TypeInfo *info)
    {
        TypeImpl *ti;
        ti = type_new(info);
    
        type_table_add(ti);
        return ti;
    }
    ||
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
    ```
- 把`TypeImpl`放入链表：`type_table`。
  在 `qemu` 里面，有一个全局的哈希表 `type_table`，用来存放所有定义的类。在 `type_new` 里面，我们先从全局表里面根据名字`type_table_lookup`查找找这个类。如果找到，说明这个类曾经被注册过，就报错；如果没有找到，说明这是一个新的类，则将 `TypeInfo` 里面信息填到 `TypeImpl` 里面。`type_table_add` 会将这个类注册到全局的表里面。到这里，我们注意，`class_init` 还没有被调用，也即这个类现在还处于**纸面的状态**。
    ```c
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
    ```

这点更加像 Java 的反射机制了。在 Java 里面，对于一个类，首先我们写代码的时候要写一个 `class xxx` 的定义，编译好就放在`XXX.class` 文件中，这也是出于纸面的状态。然后，Java 会有一个 `Class` 对象，用于读取和表示这个纸面上的 `class xxx`，可以生成真正的对象。

相同的过程在后面的代码中我们也可以看到，`class_init` 会生成`XXXClass`，就相当于 Java 里面的 `Class`对象，`TypeImpl` 还会有一个 `instance_init` 函数，相当于构造函数，用于根据 `XXXClass` 生成 `Object`，这就相当于 Java 反射里面最终创建的对象。和构造函数对应的还有 `instance_finalize`，相当于析构函数。

### 实例化设备

上面提到，目前设备还处于纸面状态，它只有被实例化后，才表示QEMU模拟的板子上有了这些硬件设备。那么到底是如何实例化的呢？

在程序的`type_table`链表中，有很多`TypeImpl`结构体，比如`CPU`、`GPIO`、`LCD`对应的`TypeImpl`结构体。

但是这并不表示QEMU模拟的板子上有这些硬件，必竟它们只是“TypeImpl”，表示“类型”，需要在“实例化”之后，才表示板子上有了这些硬件。


以`GPIO`为例，代码为`hw/gpio/sifive_gpio.c`，里面声明了一个`A15MPPrivState`结构体，还定义了一个`TypeInfo`结构体：

```c
struct SIFIVEGPIOState
{
    SysBusDevice parent_obj;

    MemoryRegion mmio;

    qemu_irq irq[SIFIVE_GPIO_PINS];
    qemu_irq output[SIFIVE_GPIO_PINS];

    uint32_t value; /* Actual value of the pin */
    uint32_t input_en;
    uint32_t output_en;
    uint32_t port; /* Pin value requested by the user */
    uint32_t pue;
    uint32_t ds;
    uint32_t rise_ie;
    uint32_t rise_ip;
    uint32_t fall_ie;
    uint32_t fall_ip;
    uint32_t high_ie;
    uint32_t high_ip;
    uint32_t low_ie;
    uint32_t low_ip;
    uint32_t iof_en;
    uint32_t iof_sel;
    uint32_t out_xor;

    /* config */
    uint32_t ngpio;
};
```

`SIFIVEGPIOState`用来表示`GPIO`外设，你要在板子上添加`GPIO`设备，就必须分配，设置一个`SIFIVEGPIOState`结构体。

板子上不止有一个`GPIO`端口，假设有10个，那么应该有对应的10个`GPIO`结构体。这10个`GPIO`是类似的，同属于某类：用`TypeImpl`来描述。

```c
struct TypeImpl
{
    const char *name;

    size_t class_size;

    size_t instance_size;
    size_t instance_align;

    void (*class_init)(ObjectClass *klass, void *data);
    void (*class_base_init)(ObjectClass *klass, void *data);

    void *class_data;

    void (*instance_init)(Object *obj);
    void (*instance_post_init)(Object *obj);
    void (*instance_finalize)(Object *obj);

    bool abstract;

    const char *parent;
    TypeImpl *parent_type;

    ObjectClass *class;

    int num_interfaces;
    InterfaceImpl interfaces[MAX_INTERFACES];
};
```
谁来分配、设置`SIFIVEGPIOState`结构体？
- 分配：
    根据`TypeInfo`中的`instrance_size`来`malloc`出结构体。
- 设置：
    调用`TypeInfo`中的`instrance_init`函数来设置刚`malloc`出的结构体。

#### 方法一：object_initialize_child

参考`hw/arm/fsl-imx6ul.c`，比如：
```c
/*
    * GPIOs 1 to 5
    */
for (i = 0; i < FSL_IMX6UL_NUM_GPIOS; i++) {
    snprintf(name, NAME_SIZE, "gpio%d", i);
    object_initialize_child(obj, name, &s->gpio[i], TYPE_IMX_GPIO);
}
```
`object_initialize_child`该函数的第`5`个参数是`type`，表示`type name`，
它会被用来找到对应的`TypeImpl`;
找到后，会分配`instance_size`大小的结构体；
然后调用`TypeImpl`中的`class_init`函数，这一般是设置`dc->realize`;
最后调用`TypeImpl`中的`instance_init`函数。

调用流程如下：
```c
object_initialize_child(obj, name, &s->gpio[i], TYPE_IMX_GPIO);
    object_initialize_child_internal()
        object_initialize_child_with_props()
            object_initialize_child_with_propsv()
                object_initialize()
                    object_initialize_with_type()
                        type_initialize()
                        {
                            if (ti->class_init) 
                            {
                                ti->class_init(ti->class, ti->class_data);
                            }
                        }
                        object_init_with_type()
                        {       
                            if (ti->instance_init) {
                                ti->instance_init(obj);
                            }
                        }
```

