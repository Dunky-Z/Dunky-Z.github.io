---
title: QEMU源码分析-QOM
date: 2022-03-09 16:02:19
updated:
tags: [QEMU,Linux]
categories: [QEMU源码分析]
---

## QOM简介
QOM(QEMU Object Model)是QEMU的一个模块，用于描述虚拟机的结构，包括虚拟机的CPU、内存、硬盘、网络、输入输出设备等。QEMU 为了方便整个系统的构建，实现了自己的一套的面向对象机制，也就是QOM(QEMU Object Model)。

## QOM中的面向对象
### 继承

在 QEMU 中通过 **TypeInfo** 来定义一个类。

例如 `x86_base_cpu_type_info` 就是一个 `class`，

```C
static const TypeInfo x86_base_cpu_type_info = {
        .name = X86_CPU_TYPE_NAME("base"),
        .parent = TYPE_X86_CPU,
        .class_init = x86_cpu_base_class_init,
};
```

**利用结构体包含来实现继承**。这应该是所有的语言实现继承的方法，在 C++ 中，结构体包含的操作被语言内部实现了，而 C 语言需要自己实现。

例如 `x86_cpu_type_info` 的 `parent` 是 `cpu_type_info`, 他们的结构体分别是 `X86CPU` 和 `CPUState`。

```C
static const TypeInfo x86_cpu_type_info = {
    .name = TYPE_X86_CPU,
    .parent = TYPE_CPU,
		// ...
    .instance_size = sizeof(X86CPU),
};

static const TypeInfo cpu_type_info = {
    .name = TYPE_CPU,
    .parent = TYPE_DEVICE,
		// ...
    .instance_size = sizeof(CPUState),
};
```
在 `X86CPU` 中包含一个 `CPUState`。

```C
struct X86CPU {
    /*< private >*/
    CPUState parent_obj;
    /*< public >*/

    CPUNegativeOffsetState neg;
```

### 静态成员
静态成员变量可以在类的多个对象中访问，但是要在类外声明。**不同对象访问的其实是同一个实体，静态成员变量被多个对象共享**。

```C
static const TypeInfo x86_cpu_type_info = {
    .name = TYPE_X86_CPU,
    .parent = TYPE_CPU,
    .instance_size = sizeof(X86CPU),
    .instance_init = x86_cpu_initfn,
    .instance_post_init = x86_cpu_post_initfn,

    .abstract = true,
    .class_size = sizeof(X86CPUClass),
    .class_init = x86_cpu_common_class_init,
};
```

其中 `X86CPU` 描述的是非静态成员，而 `X86CPUClass` 描述的是静态的成员。也就是说`class_init`初始化静态成员，`instance_init`初始化非静态成员。

那么何时初始化静态成员呢？首先得告诉系统，咱有`class_init`这个初始化函数，等需要的时候随时可以调用它初始化，所有先解决如何将这个初始化函数注册到系统中？

在`target/i386/cpu.c`最后使用了`type_init`。在`qemu/include/qemu/module.h`中有一个`type_init`宏定义，除了`type_init`还有其他宏，比如`block_init`，`opts_init`等。每个宏都表示一类`module`，通过`module_init`构造出来。我们展开这个宏，

```C
static void __attribute__((constructor))
do_qemu_init_x86_cpu_register_types(void) {
  register_module_init(x86_cpu_register_types, MODULE_INIT_QOM);
}
```

通过 `gcc` 扩展属性` __attribute__((constructor)) `可以让 `do_qemu_init_x86_cpu_register_types` 在运行 `main` 函数之前运行。 `register_module_init` 会让 `x86_cpu_register_types` 这个函数挂载到 `init_type_list[MODULE_INIT_QOM]` 这个链表上。


![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210907133931.svg)

到底，所有的 `TypeInfo` 通过 `type_init` 都被放到 `type_table` 上了，之后通过 `Typeinfo` 的名称调用 `type_table_lookup` 获取到 `TypeImpl` 了。

到这里，将`TYPE_X86_CPU`注册进类系统，包括其初始化函数，这部分也就是QEMU中类型的构造。那么何时调用静态成员初始化函数呢？也就是类型的初始化。

静态成员是所有的对象公用的，其初始化显然要发生在所有的对象初始化之前。

```C
main
    qemu_init 
        select_machine 
            object_class_get_list 
                object_class_foreach 
                    g_hash_table_foreach 
                        object_class_foreach_tramp 
                            type_initialize 
                                type_initialize 
                                    x86_cpu_common_class_init 
```

`select_machine` 需要获取所有的 `TYPE_MACHINE` 的 `class`, 其首先会调用所有的` class_list`，其会遍历 `type_table`，遍历的过程中会顺带 `type_initialize` 所有的 `TypeImpl` 进而调用的 `class_init`。

说完类型的初始化，再讲一下对象的初始化，也就是初始化非静态成员，也就是`instance_init`在何时被调用？

对象初始化，通过调用 `object_new` 来实现初始化。

- `object_initialize_with_type`
    - 初始化一个空的 :` Object::properties`
    - `object_init_with_type`
        - 如果 `object` 有 `parent`，那么调用 `object_init_with_type` 首先初始化 `parent` 的
        - 调用` TypeImpl::instance_init`

```C
main 
    qemu_init 
        qmp_x_exit_preconfig 
            qemu_init_board 
                machine_run_board_init 
                    pc_init_v6_1 
                        pc_init1 
                            x86_cpus_init 
                                x86_cpu_new 
                                    object_new 
                                        object_new_with_type 
                                            object_initialize_with_type 
                                                object_init_with_type 
                                                    x86_cpu_initfn 
```

### 动态类型装换(dynamic cast)

















### 多态


## 参考

[QEMU 中的面向对象 : QOM | Deep Dark Fantasy](https://martins3.github.io/qemu/qom.html#init)