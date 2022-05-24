

## QEMU 

### 基本概念

[QEMU学习记录](https://dunky-z.github.io/2021/07/20/QEMU%E5%AD%A6%E4%B9%A0%E8%AE%B0%E5%BD%95/)

[QEMU学习笔记——QOM(Qemu Object Model) - 博客 - binsite](https://www.binss.me/blog/qemu-note-of-qemu-object-model/)

[设备类型注册 - understanding_qemu](https://richardweiyang-2.gitbook.io/understanding_qemu/00-devices/01-type_register)

### 外设模拟
[Qemu - 百问网嵌入式Linux wiki](http://wiki.100ask.org/Qemu#QEMU.E7.9A.84.E8.BE.93.E5.87.BA.EF.BC.9AGUI.E7.B3.BB.E7.BB.9F) **QEMU的设备创建过程**章节


[QEMU源码分析-外设模拟（以GPIO为例）](https://dunky-z.github.io/2021/11/11/QEMU%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90-%E5%A4%96%E8%AE%BE%E6%A8%A1%E6%8B%9F%EF%BC%88%E4%BB%A5GPIO%E4%B8%BA%E4%BE%8B%EF%BC%89/)

### 共享内存

[进程间通信（IPC）之共享内存(SharedMemory)](https://dunky-z.github.io/2021/08/10/%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1%EF%BC%88IPC%EF%BC%89%E4%B9%8B%E5%85%B1%E4%BA%AB%E5%86%85%E5%AD%98%EF%BC%88SharedMemory%EF%BC%89/)

### 帧缓冲

[Lcd（一）显示原理 - yooooooo - 博客园](https://www.cnblogs.com/linhaostudy/p/10467249.html)

[Linux帧缓冲](https://dunky-z.github.io/2022/01/17/Linux%E5%B8%A7%E7%BC%93%E5%86%B2/)

[韦东山_嵌入式Linux_第2期_Linux高级驱动视频教程_免费试看版_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1HW411L76t?spm_id_from=333.999.0.0)

## QT

[Qt 编程指南](https://qtguide.ustclug.org/contents.htm)

## 调试
[VSCode调试RISCV程序 ](https://dunky-z.github.io/2021/08/23/VSCode%E8%B0%83%E8%AF%95%E7%A8%8B%E5%BA%8F/)

[Clang-Format格式化代码](https://dunky-z.github.io/2021/12/01/Clang-Format%E6%A0%BC%E5%BC%8F%E5%8C%96%E4%BB%A3%E7%A0%81/)

## 常用命令
### 代码下载
```
repo init -u ssh://zhangdongdong@gerrit.eswin.cn:29418/platform/manifest -b qiantang-qemu-d_dev --repo-url=ssh://zhangdongdong@gerrit.eswin.cn:29418/tools/git-repo
```

### 代码提交
```
git push origin HEAD:refs/for/qiantang-qemu-d_dev
```