---
title: VSCode调试RISCV程序
date: 2021-08-23 15:51:51
tags: [Linux,GDB,RISCV]
---
## 前提
本文主要涉及VSCode的相关配置，编译及调试工具需要提前安装好。

- 已经安装好`riscv-toolchain`，包括`riscv64-unknown-elf-gcc`，`riscv64-unknown-elf-gdb`
- 已经安装好`qemu`，包括`riscv32-softmmu,riscv32-linux-user,riscv64-softmmu,riscv64-linux-user`
- 已经安装好`g++`,`gdb`

## 调试流程简介
对于我这样的新手，要调试一个项目源码最怕的就是开始，也就是怎么能把项目跑起来。

我们以一个简单的`test`项目，看看在VSCode里怎么跑起来。

拿到源码后，将其以文件夹形式，加入到VSCode中，`文件-打开文件夹-选择test项目文件夹`。项目就会在VSCode 中打开，但是此时我们还无法编译运行，我们需要在VSCode上
构建出一个C语言的编译与调试环境。

首先得安装一个插件`C/C++`，打开插件中心`Ctrl+Shit+X`，搜索，安装。

然后输入`F5`，会弹出对话框，选择`C++(GDB)`，继续选择`g++`。VSCode会自动创建`.vscode`文件夹，已经两个文件`launch.json`和`tasks.json`。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210823193157.png)

`launch.json`用来配置调试环境，`tasks.json`主要用来配置编译环境，当然也可以配置其他任务。`task.json`里配置的每个任务其实就相当于多开一个控制台。
## 配置`tasks.json`
因为我们先要编译源码，生成`.out`或者`.exe`文件，才能调试，所以先进行编译任务配置。

自动生成的文件是个配置模板，我们可以根据自己的实际情况进行配置，也有一部分可以保持默认。

```
// tasks.json
{
    // https://code.visualstudio.com/docs/editor/tasks
    "version": "2.0.0",
    "tasks": [
        {
             // 任务的名字，注意是大小写区分的
             //会在launch中调用这个名字
            "label": "C/C++: g++ build active file", 
             // 任务执行的是shell
            "type": "shell", 
             // 命令是g++
            "command": "g++", 
             //g++ 后面带的参数
            "args": [
                "'-Wall'",
                "-g",           // 生成调试信息，否则无法进入断点
                "'-std=c++17'",     //使用c++17标准编译
                "'${file}'",        //当前文件名
                "-o",               //对象名，不进行编译优化
                "'${fileBasenameNoExtension}.exe'",  //当前文件名（去掉扩展名）
            ],
        }
    ]
}
```
## 配置`launch.json`

```
// launch.json

{
    "version": "0.2.0",
    "configurations": [
        {
            //调试任务的名字
            "name": "g++ - Build and debug active file", 
            //在launch之前运行的任务名，这个名字一定要跟tasks.json中的任务名字大小写一致
            "preLaunchTask": "C/C++: g++ build active file",  
            "type": "cppdbg",
            "request": "launch",
            //需要运行的是当前打开文件的目录中，
            //名字和当前文件相同，但扩展名为exe的程序
            "program": "${fileDirname}/${fileBasenameNoExtension}.exe", 
            "args": [],
            // 选为true则会在打开控制台后停滞，暂时不执行程序
            "stopAtEntry": false,
            // 当前工作路径：当前文件所在的工作空间
            "cwd": "${workspaceFolder}",
            "environment": [],
            // 是否使用外部控制台
            "externalConsole": false,  
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ]
        }]
}
```

## 运行
经过以上配置后，我们打开`main.cpp`文件，在`cout`处打一个断点，按`F5`，即可编译，运行，调试。一定要打开`main.cpp`文件，不能随便打开文件就开始哦。因为我们在配置时使用了一些预定义，比如`${file}`表示当前文件，所以只有打开需要调试的文件才能开始。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210823201621.png)

程序将会在`cout`语句停下来。

我们可以注意一下界面下方的控制台，可以更直观了解`launch.jason`和`tasks.jason`。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210823202012.png)

右边的框，就是我们在`tasks.jason`中配置的任务，左边的框就是我们在`tasks.jason`中`command`以及`args`的内容，他就是帮我们提前写好编译的选项。然后在shell中运行。

## 编译调试RISCV程序
了解以上这些，就可以按需配置所需的环境了。我们还是从`tasks.jason`开始。因为开发用的电脑是`x86`的，所以先要编译出`riscv`的程序，再用模拟器模拟出`rsicv`的环境，然后在模拟的环境中运行程序，最后才能开始调试。

假设已经安装好开头所提到的工具。首先配置`tasks.jason`：
```
{
    "version": "2.0.0",
    "tasks": [
        {
            // 编译当前代码
            "type": "shell",
            "label": "C/C++(RISCV): Build active file",
            // 编译器的位置
            "command": "/opt/riscv/bin/riscv64-unknown-elf-g++",
            "args": [
                "-Wall", // 开启所有警告
                "-g", // 生成调试信息s
                "${file}",
                "-o",
                "${workspaceFolder}/debug/${fileBasenameNoExtension}" // 我选择将可执行文件放在debug目录下
            ],
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "problemMatcher": [
                "$gcc"
            ]
        },
        {
            // 启动qemu供调试器连接
            "type": "shell",
            "label": "Run Qemu Server(RISCV)",
            "dependsOn": "C/C++(RISCV): Build active file",
            "command": "qemu-system-riscv64",
            "args": [
                "-g",
                "65500", // gdb端口，自己定义
                "${workspaceFolder}/debug/${fileBasenameNoExtension}"
            ],
        },
        {
            // 有时候qemu有可能没法退出，故编写一个任务用于强行结束qemu进程
            "type": "shell",
            "label": "Kill Qemu Server(RISCV)",
            "command": "ps -C qemu-riscv64 --no-headers | cut -d \\  -f 1 | xargs kill -9",
        }
    ]
}
```
`tasks.jason`是可以配置多个任务的，第一个任务用来编译成`riscv`架构下的程序，第二个任务用来启动qemu，让程序再qemu上运行起来。

第一个任务中，`command`就是配置编译器`riscv64-unkonown-elf-gcc`的属性，第二个任务中，`command`是配置qemu模拟器`qemu-system-riscv32`的属性。第三个任务中，用来配置结束qemu模拟器的命令。

接下来配置`launch.jason`：
```
{
    "version": "0.2.0",
    "configurations": [
        { 
            "name": "C/C++(RISCV) - Debug Active File",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/debug/${fileBasenameNoExtension}",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            // RISC-V工具链中的gdb
            "miDebuggerPath": "/opt/riscv/bin/riscv64-unknown-elf-gdb", 
            // 这里需要与task.json中定义的端口一致
            "miDebuggerServerAddress": "localhost:65500" 
        }
    ]
}
```
我们在配置`x86`下的调试环境时，`launch.jason`中有个`  "preLaunchTask": "C/C++: g++ build active file"`，属性，这个属性的目的是在启动调试之前，先执行任务名字为`"C/C++: g++ build active file"`任务，也是就编译的任务。

因为启动qemu会导致阻塞，所以这里没有加`preLaunchTask`，在启动调试之前，先把qemu运行起来。输入`Ctrl+Shift+P`，打开VSCode命令行。输入`Run Task`，

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210824094556.png)

点击第一个，选择任务，我们可以看到出现的三个任务就是我们在`tasks.jason`中配置的三个任务。选择第一个Build，编译出程序，再重复操作，选择第三个执行QEMU任务。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210824094609.png)

## 预定义变量
[官网](https://code.visualstudio.com/docs/editor/variables-reference#_predefined-variables)
