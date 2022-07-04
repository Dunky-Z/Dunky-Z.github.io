---
title: Linux操作系统-进程管理
date: 2021-08-30 09:41:50
updated: 2022-07-04 08:41:50
tags: [Linux,进程管理, 操作系统]
categories: [Linux操作系统]
--- 

## 进程

### 源码

```C++
//process.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>
extern int create_process (char* program, char** arg_list);
int create_process (char* program, char** arg_list)
{
    pid_t child_pid;
    child_pid = fork ();
    if (child_pid != 0)
    {
        return child_pid;
    }
    else 
    {
        execvp (program, arg_list);
        abort ();
    }
}
```

在这里，我们创建的子程序运行了一个最最简单的命令 `ls`。

```C++
//createprocess.c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>
extern int create_process (char* program, char** arg_list);
int main ()
{
    char* arg_list[] = {
        "ls",
        "-l",
        "/etc/yum.repos.d/",
        NULL
    };
    create_process ("ls", arg_list);
    return 0;
}
```

### 编译

CPU看不懂源码里的函数，命令，CPU只认二进制数据，所以源码需要翻译成`01`二进制数据，这个过程就是**编译（Compile）**的过程。

编译出的文件好比一个公司的项目执行计划书，你要把一个项目执行好，计划书得有章法，有一定格式。在Linux下，二进制程序也有这样的格式，叫**ELF**（Executeable and Linkable Format，可执行与可链接格式），这个格式可以根据编译的结果不同，分为不同的格式。

### ELF-可重定位文件

下图展示了如何从源码到二进制文件的转化

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210810085445.png)

```
gcc -c -fPIC process.c
gcc -c -fPIC createprocess.c
```

`-fPIC `作用于编译阶段，告诉编译器产生与位置无关代码(Position-Independent Code)。产生的代码中，没有绝对地址，全部使用相对地址，故而代码可以被加载器加载到内存的任意位置，都可以正确的执行。

在编译的时候，先做**预处理**工作，例如将头文件嵌入到正文中，将定义的宏展开，然后就是真正的编译过程，最终编译成为`.o `文件，这就是`ELF`的第一种类型，**可重定位文件**（Relocatable File）。文件格式如下，

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210810085520.png)

`ELF` 文件的头是用于描述整个文件的。这个文件格式在内核中有定义，分别为 `struct elf32_hdr` 和 `struct elf64_hdr`。

|section|内容|
|-|-|
|.text|放编译好的二进制可执行代码|
|.data|已经初始化好的全局变量（临时变量放在栈里）|
|.rodata|只读数据，例如字符串常量、const 的变量|
|.bss|未初始化全局变量，运行时会置 0|
|.symtab|符号表，记录的则是函数和变量|
|.strtab|字符串表、字符串常量和变量名|


第一种ELF文件叫可重定位文件，为啥可重定位？我们可以想象一下，这个编译好的代码和变量，将来**加载到内存**里面的时候，都是要加载到一定位置的。比如说，调用一个函数，其实就是跳到这个函数所在的代码位置执行；再比如修改一个全局变量，也是要到变量的位置那里去修改。但是现在这个时候，还是`.o `文件，不是一个可以直接运行的程序，这里面只是部分代码片段。

例如这里的 `create_process `函数，将来被谁调用，在哪里调用都不清楚，就更别提确定位置了。所以，`.o `里面的位置是不确定的，但是必须是可重新定位的，因为它将来是要做函数库的嘛，就是一块砖，哪里需要哪里搬，搬到哪里就重新定位这些代码、变量的位置。

#### ELF-可执行文件

要让`create_process`这个函数作为库文件重用，需要将其形成库文件，最简单的类型是静态链接库`.a`文件，它将一系列`.o`文件归档为一个文件。使用`ar`命令创建`.a`文件。[使用方法看这里]()。

```
ar cr libstaticprocess.a process.o
```

虽然这里 `libstaticprocess.a` 里面只有一个`.o`，但是实际情况可以有多个`.o`。当有程序要使用这个静态连接库的时候，会将.o 文件提取出来，链接到程序中。

```
gcc -o staticcreateprocess createprocess.o -L. -lstaticprocess
```

`-L `表示在当前目录下找`.a `文件，`-lstaticprocess` 会自动补全文件名，比如加前缀 `lib`，后缀`.a`，变成 `libstaticprocess.a`，找到这个`.a `文件后，将里面的 process.o 取出来，和 `createprocess.o` 做一个链接，形成二进制执行文件 `staticcreateprocess`。

在链接过程中，重定位就起作用了，在`createprocess.o`里调用了`create_process`函数，但是不能确定位置，现在将`process.o`合并进来，就知道位置了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210810114727.png)

这个格式和`.o` 文件大致相似，还是分成一个个的 `section`，并且被节头表描述。只不过这些` section` 是多个`.o` 文件合并过的。但是这个时候，这个文件已经是马上就可以加载到内存里面执行的文件了，因而这些 `section` 被分成了需要加载到内存里面的**代码段**、**数据段**和**不需要加载**到内存里面的部分，将小的 `section` 合成了大的段 `segment`，并且在最前面加一个**段头表**（Segment Header Table）。

在代码里面的定义为 `struct elf32_phdr `和 `struct elf64_phdr`，这里面除了有对于段的描述之外，最重要的是 `p_vaddr`，这个是这个段加载到内存的虚拟地址。

在 `ELF` 头里面，有一项 `e_entry`，也是个虚拟地址，是这个**程序运行的入口**。

#### ELF-共享对象文件

静态库一旦被链接，代码和变量的`section`会被合并，所以运行时不依赖静态库文件，但是缺点就是，相同代码段被多个程序使用，在**内存里会有多份**，而且**静态库更新需要重新编译**。

因而就出现了另一种，**动态链接库**（Shared Libraries），不仅仅是一组对象文件的简单归档，而是多个对象文件的重新组合，可被多个程序共享。

```
gcc -shared -fPIC -o libdynamicprocess.so process.o
```

当一个动态链接库被链接到一个程序文件中的时候，最后的程序文件并不包括动态链接库中的代码，而仅仅包括对动态链接库的引用，并且不保存动态链接库的全路径，仅仅保存动态链接库的名称。

```
gcc -o dynamiccreateprocess createprocess.o -L. -ldynamicprocess
```

当运行这个程序的时候，首先寻找动态链接库，然后加载它。默认情况下，系统在 `/lib` 和` /usr/lib` 文件夹下寻找动态链接库。如果找不到就会报错，我们可以设定 `LD_LIBRARY_PATH `环境变量，程序运行时会在此环境变量指定的文件夹下寻找动态链接库。

```
# export LD_LIBRARY_PATH=.
# ./dynamiccreateprocess
# total 40
-rw-r--r--. 1 root root 1572 Oct 24 18:38 CentOS-Base.repo
......
```

动态链接库，就是`ELF`的第三种类型，**共享对象文件**（Shared Object）。

文件格式和上两种文件稍有不同，首先，多了一个`.interp `的 `Segment`，这里面是 `ld-linux.so`，这是动态链接器，也就是说，运行时的链接动作都是它做的。

另外，`ELF `文件中还多了两个` section`，一个是`.plt`，**过程链接表**（Procedure Linkage Table，PLT），一个是.`got.plt`，**全局偏移量表**（Global Offset Table，GOT）。

### 运行

在内核中，有`linux_binfmt elf_format `数据结构定义了加载ELF的方法，使用`load_elf_binary `加载二进制文件，该函数由`do_execve`调用，学过系统调用知道`exec`调用了`do_execve`函数。所以流程为

```
exec->do_execve->load_elf_binary
```

#### 进程树

所有进程都是从父进程fork来的，祖宗进程就是`init` 进程。

系统启动之后，`init` 进程会启动很多的` daemon` 进程，为系统运行提供服务，然后就是启动 `getty`，让用户登录，登录后运行 `shell`，用户启动的进程都是通过 `shell `运行的，从而形成了一棵进程树。

我们可以通过 `ps -ef `命令查看当前系统启动的进程，我们会发现有三类进程。`PID 1` 的进程就是我们的`init`进程 `systemd`，`PID 2` 的进程是内核线程 `kthreadd`。

内核态进程的`PPID`祖先进程都是2号进程，用户态进程祖先进程都是1号进程，`tty`列是问号的，说明是后台服务进程。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210810143343.png)

## 进程数据结构

在Linux里面，无论是进程还是线程，到了内核里面，我们统一都叫任务（Task），由一个统一的结构`task_struct`进行管理。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826183622.png)

每个任务应该包含的字段：

### 任务ID

```
pid_t pid; #process id
pid_t tgid; #thread group ID
struct task_struct *group_leader; 
```

为何要有这么多ID，一个不够吗？

- 可以方便任务展示，比如在命令行中ps显示所有进程，只显示`pid_t pid`，而不会把所有内部线程摊开展示，这样太碍眼。
- 方便下达命令，当我kill一个进程时，我们是对整个进程发送信号，但是有时候一些命令只需要对某个线程发送信号。
-  

### 信号处理

```c
/* Signal handlers: */
struct signal_struct    *signal;
struct sighand_struct    *sighand;
sigset_t      blocked;
sigset_t      real_blocked;
sigset_t      saved_sigmask;
struct sigpending    pending;
unsigned long      sas_ss_sp;
size_t        sas_ss_size;
unsigned int      sas_ss_flags;
```

这里定义了哪些信号被阻塞暂不处理（blocked），哪些信号尚等待处理（pending），哪些信号正在通过信号处理函数进行处理（sighand）。处理的结果可以是忽略，可以是结束进程等等。

### 任务状态

```

volatile long state;    /* -1 unrunnable, 0 runnable, >0 stopped */

int exit_state;

unsigned int flags;

```

`state`可取值定义如下

```c
/* Used in tsk->state: */
#define TASK_RUNNING                    0
#define TASK_INTERRUPTIBLE              1
#define TASK_UNINTERRUPTIBLE            2
#define __TASK_STOPPED                  4
#define __TASK_TRACED                   8
/* Used in tsk->exit_state: */
#define EXIT_DEAD                       16
#define EXIT_ZOMBIE                     32
#define EXIT_TRACE                      (EXIT_ZOMBIE | EXIT_DEAD)
/* Used in tsk->state again: */
#define TASK_DEAD                       64
#define TASK_WAKEKILL                   128
#define TASK_WAKING                     256
#define TASK_PARKED                     512
#define TASK_NOLOAD                     1024
#define TASK_NEW                        2048
#define TASK_STATE_MAX                  4096
```

可以发现Linux通过bitset方式设置状态，当前什么状态，哪一位就置1。

### 进程调度

进程的状态切换往往涉及调度，下面这些字段都是用于调度的。

```c
// 是否在运行队列上
int               on_rq;
// 优先级
int               prio;
int               static_prio;
int               normal_prio;
unsigned int      rt_priority;
// 调度器类
const struct sched_class  *sched_class;
// 调度实体
struct sched_entity       se;
struct sched_rt_entity    rt;
struct sched_dl_entity    dl;
// 调度策略
unsigned int      policy;
// 可以使用哪些 CPU
int            nr_cpus_allowed;
cpumask_t      cpus_allowed;
struct sched_info    sched_info;
```

### 运行统计信息

```c
u64        utime;// 用户态消耗的 CPU 时间
u64        stime;// 内核态消耗的 CPU 时间
unsigned long      nvcsw;// 自愿 (voluntary) 上下文切换计数
unsigned long      nivcsw;// 非自愿 (involuntary) 上下文切换计数
u64        start_time;// 进程启动时间，不包含睡眠时间
u64        real_start_time;// 进程启动时间，包含睡眠时间
```

### 进程亲缘关系

进程有棵进程树，所以有亲缘关系。

```c
struct task_struct __rcu *real_parent; /* real parent process */
struct task_struct __rcu *parent; /* recipient of SIGCHLD, wait4() reports */
struct list_head children;      /* list of my children */
struct list_head sibling;       /* linkage in my parent's children list */
```

通常情况下，`real_parent` 和 `parent` 是一样的，但是也会有另外的情况存在。例如，`bash` 创建一个进程，那进程的 parent 和 `real_parent` 就都是 `bash`。如果在 bash 上使用 `GDB` 来 `debug` 一个进程，这个时候 `GDB` 是 `real_parent`，`bash` 是这个进程的 `parent`。

### 进程权限

```c
/* Objective and real subjective task credentials (COW): */
const struct cred __rcu         *real_cred;
/* Effective (overridable) subjective task credentials (COW): */
const struct cred __rcu   
```

`real_cred` 就是说明谁能操作我这个进程，而 `cred` 就是说明我这个进程能够操作谁。

总结到一起，`task_struct`结构图如下，

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826190834.png)

