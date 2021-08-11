---
title: Linux操作系统-进程管理
date: 2021-08-09 17:56:25
tags: [Linux,操作系统]
---
## 源码
```cpp
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
在这里，我们创建的子程序运行了一个最最简单的命令 ls。
```cpp
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
## 编译
CPU看不懂源码里的函数，命令，CPU只认二进制数据，所以源码需要翻译成`01`二进制数据，这个过程就是**编译（Compile）**的过程。

编译出的文件好比一个公司的项目执行计划书，你要把一个项目执行好，计划书得有章法，有一定格式。在Linux下，二进制程序也有这样的格式，叫**ELF**（Executeable and Linkable Format，可执行与可链接格式），这个格式可以根据编译的结果不同，分为不同的格式。
### ELF-可重定位文件
下图展示了如何从源码到二进制文件的转化
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810085445.png)

```
gcc -c -fPIC process.c
gcc -c -fPIC createprocess.c
```
`-fPIC `作用于编译阶段，告诉编译器产生与位置无关代码(Position-Independent Code)。产生的代码中，没有绝对地址，全部使用相对地址，故而代码可以被加载器加载到内存的任意位置，都可以正确的执行。

在编译的时候，先做**预处理**工作，例如将头文件嵌入到正文中，将定义的宏展开，然后就是真正的编译过程，最终编译成为`.o `文件，这就是` ELF `的第一种类型，**可重定位文件**（Relocatable File）。文件格式如下，
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810085520.png)

`ELF` 文件的头是用于描述整个文件的。这个文件格式在内核中有定义，分别为 `struct elf32_hdr` 和 `struct elf64_hdr`。
| section |内容 |
| :----: |:----: |
| .text |放编译好的二进制可执行代码 |
| .data|已经初始化好的全局变量（临时变量放在栈里）|
| .rodata|只读数据，例如字符串常量、const 的变量|
| .bss|未初始化全局变量，运行时会置 0|
| .symtab|符号表，记录的则是函数和变量|
| .strtab|字符串表、字符串常量和变量名|

第一种ELF文件叫可重定位文件，为啥可重定位？我们可以想象一下，这个编译好的代码和变量，将来**加载到内存**里面的时候，都是要加载到一定位置的。比如说，调用一个函数，其实就是跳到这个函数所在的代码位置执行；再比如修改一个全局变量，也是要到变量的位置那里去修改。但是现在这个时候，还是`.o `文件，不是一个可以直接运行的程序，这里面只是部分代码片段。

例如这里的 `create_process `函数，将来被谁调用，在哪里调用都不清楚，就更别提确定位置了。所以，`.o `里面的位置是不确定的，但是必须是可重新定位的，因为它将来是要做函数库的嘛，就是一块砖，哪里需要哪里搬，搬到哪里就重新定位这些代码、变量的位置。
### ELF-可执行文件
要让`create_process`这个函数作为库文件重用，需要将其形成库文件，最简单的类型是静态链接库`.a`文件，它将一系列`.o`文件归档为一个文件。使用`ar`命令创建`.a`文件。[使用方法看这里]()。
```
ar cr libstaticprocess.a process.o
```
虽然这里 `libstaticprocess.a` 里面只有一个`.o`，但是实际情况可以有多个`.o`。当有程序要使用这个静态连接库的时候，会将.o 文件提取出来，链接到程序中。
```
gcc -o staticcreateprocess createprocess.o -L. -lstaticprocess
```

`-L `表示在当前目录下找`.a `文件，`-lstaticprocess` 会自动补全文件名，比如加前缀 `lib`，后缀`.a`，变成 `libstaticprocess.a`，找到这个`.a `文件后，将里面的 process.o 取出来，和 `createprocess.o` 做一个链接，形成二进制执行文件 `staticcreateprocess`。

在链接过程中，重定位就起作用了，在`createprocess.o`里调用了`create_process`函数，但是不能确定位置，现在降`process.o`合并进来，就知道位置了。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810114727.png)

这个格式和`.o` 文件大致相似，还是分成一个个的 `section`，并且被节头表描述。只不过这些` section` 是多个`.o` 文件合并过的。但是这个时候，这个文件已经是马上就可以加载到内存里面执行的文件了，因而这些 `section` 被分成了需要加载到内存里面的**代码段**、**数据段**和**不需要加载**到内存里面的部分，将小的 `section` 合成了大的段 `segment`，并且在最前面加一个**段头表**（Segment Header Table）。

在代码里面的定义为 `struct elf32_phdr `和 `struct elf64_phdr`，这里面除了有对于段的描述之外，最重要的是 `p_vaddr`，这个是这个段加载到内存的虚拟地址。

在 `ELF` 头里面，有一项 `e_entry`，也是个虚拟地址，是这个**程序运行的入口**。

### ELF-共享对象文件

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
动态链接库，就是` ELF `的第三种类型，**共享对象文件**（Shared Object）。

文件格式和上两种文件稍有不同，首先，多了一个`.interp `的 `Segment`，这里面是 `ld-linux.so`，这是动态链接器，也就是说，运行时的链接动作都是它做的。

另外，`ELF `文件中还多了两个` section`，一个是`.plt`，**过程链接表**（Procedure Linkage Table，PLT），一个是.`got.plt`，**全局偏移量表**（Global Offset Table，GOT）。

## 运行
在内核中，有`linux_binfmt elf_format `数据结构定义了加载ELF的方法，使用`load_elf_binary `加载二进制文件，该函数由`do_execve`调用，学过系统调用知道`exec`调用了`do_execve`函数。所以流程为
```
exec->do_execve->load_elf_binary
```

## 进程树
所有进程都是从父进程fork来的，祖宗进程就是`init` 进程。

系统启动之后，`init` 进程会启动很多的` daemon` 进程，为系统运行提供服务，然后就是启动 `getty`，让用户登录，登录后运行 `shell`，用户启动的进程都是通过 `shell `运行的，从而形成了一棵进程树。

我们可以通过 `ps -ef `命令查看当前系统启动的进程，我们会发现有三类进程。`PID 1` 的进程就是我们的` init `进程 `systemd`，`PID 2` 的进程是内核线程 `kthreadd`。

内核态进程的`PPID`祖先进程都是2号进程，用户态进程祖先进程都是1号进程，`tty`列是问号的，说明是后台服务进程。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210810143343.png)