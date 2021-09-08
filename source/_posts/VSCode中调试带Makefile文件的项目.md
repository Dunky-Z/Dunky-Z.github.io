---
title: VSCode中调试带Makefile文件的项目
date: 2021-09-06 15:41:56
tags: [VSCode,Linux]
---
在调试QEMU时，自己需要修改源文件，但是每次修改都需要在命令行重新`make`编译一遍，比较麻烦，想到之前刚刚配置过`tasks.json`文件，可以把命令行任务配置到文件里，`make`命令不也一样可以加入吗？修改`tasks.json`文件如下：
```json
{
  "version": "2.0.0",
  "tasks": [
    {
       //任务的名字方便执行
      "label": "make qemu",
      "type": "shell",
      "command": "make",
      "args":[
          //8线程编译
          "-j8",
      ],
      "options": {
        //切换到build文件夹下
        "cwd": "${workspaceFolder}/build" 
      },
    },
    {
        // 启动qemu供调试器连接
        "type": "shell",
        "label": "Run Qemu Server(RISCV)",
        //在执行这个任务前，先执行make qemu任务、
        //这样就可以在执行调试时，自动先编译一遍
        "dependsOn": "make qemu",
        "command": "qemu-system-riscv64",
        "args": [
            "-g",
            "${workspaceFolder}/debug/${fileBasenameNoExtension}"
        ],
    },
  ]
}
```