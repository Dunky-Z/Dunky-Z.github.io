---
title: ZH-Unix是什么，为什么重要？
date: 2021-07-20 15:44:05
tags: [Linux, Unix, 翻译]
---

# Unix是什么，为什么重要？
>Author：CHRIS HOFFMAN
译 ：https://www.howtogeek.com/182649/htg-explains-what-is-unix/

大多数操作系统都可以分为两大类。除了微软基于 Windows NT 的操作系统之外，几乎所有其他系统的祖宗都是Unix。

Linux、Mac OS X、Android、iOS、Chrome OS、PlayStation 4 上使用的 Orbis 操作系统，无论路由器上运行的是什么固件——所有这些操作系统通常都被称为“类 Unix”操作系统。

## Unix的设计延续至今
19世纪中后期Unix在贝尔实验室中被开发出来。最初版的Unix有许多重要的设计特性至今仍然在使用。

“Unix哲学”之一就是，创建小型、模块化的程序，一个程序只做一件事并把它做好。如果你经常使用Linux 终端，那么你应该对此很熟悉——系统提供了许多实用程序，这些程序可以通过管道和其他功能以不同方式组合以执行更复杂的任务。甚至图形程序也可能在后台调用更简单的实用程序来完成复杂的工作。这也使得创建 shell 脚本变得容易，将简单的工具串在一起来完成复杂的事情。

Unix有一个程序之间通信用的单一文件系统。这就是为什么在Linux上“一切都是文件” ——包括硬件设备和提供系统信息或其他数据的特殊文件。这也是为什么只有 Windows 有驱动器号（C、D、E盘）的原因，它是从 DOS 继承的——在其他操作系统上，系统上的每个文件都是单个目录层次结构的一部分。

## 追寻Unix的后代
Unix及其后代的历史错综复杂，简化起见，我们大致将Unix的后代分为两类。

一类Unix后代是在学术界发展起来的。第一个是BSD（BerkeleySoftwareDistribution），一个开源、类Unix操作系统。BSD通过FreeBSD、NetBSD和OpenBSD延续至今。NeXTStep也是基于最初的BSD开发的，Apple的Mac OS X 是基于NeXTStep开发出来的，而iOS则基于Mac OS X。还有一些操作系统，包括PlayStation 4上使用的Orbis OS，都是从BSD操作系统衍生而来的。

Richard Stallman的GNU项目也是为了应对AT&T日益严格的Unix软件许可条款而启动的。MINIX是一个为教育目的而创建的类Unix操作系统，Linux的灵感来自于MINIX。我们今天所知道的Linux实际上是GNU/Linux，因为它由Linux内核和许多GNU实用程序组成。GNU/Linux并非直接继承自BSD，但它继承了Unix的设计并植根于学术界。当今的许多操作系统，包括Android、ChromeOS、SteamOS以及大量设备的嵌入式操作系统，都基于Linux。

另一类就是商业Unix操作系统。AT&T UNIX、SCO UnixWare、Sun Microsystems Solaris、HP-UX、IBM AIX、SGI IRIX——许多大公司想要创建他们自己的Unix版本。这些在今天并不常见，但其中一些仍然存在。

## DOS 和 Windows NT 的崛起

许多人期望Unix成为行业标准操作系统，但DOS系统和“IBM PC兼容”的计算机最终流行起来。Microsoft的DOS成为其中最成功的DOS系统。DOS系统完全不同于Unix，这就是为什么Windows使用反斜杠作为文件路径，而其他一切都使用正斜杠。这个决定是在DOS系统早期做出的，后来的Windows版本继承了它，就像BSD、Linux、Mac OS X 和其他类Unix操作系统继承了许多Unix的设计一样。

Windows 3.1、Windows 95、Windows 98 和 Windows ME 都基于底层的 DOS。当时，微软正在开发一种更现代、更稳定的操作系统，他们将其命名为 Windows NT——即“Windows  New Technology”。Windows NT 最终以 Windows XP 的形式出现在普通用户的计算机中，但在此之前，它以 Windows 2000 和 Windows NT 的形式供公司使用。

今天，微软的所有操作系统都基于 Windows NT 内核。Windows 7、Windows 8、Windows RT、Windows Phone 8、Windows Server 和 Xbox One 的操作系统都使用 Windows NT 内核。与大多数其他操作系统不同，Windows NT 并不是作为类 Unix 操作系统开发的。

当然，微软并不是完全重新开始。为了保持与 DOS 和旧的 Windows 软件的兼容性，Windows NT 继承了许多 DOS 约定，如驱动器号、文件路径的反斜杠和命令行的正斜杠。

> “在绝大多数地方，用的都是/（slash），包括Mac/Linux，也包括URL。你唯一需要记住的是，Microsoft这个怪鸡在自己的操作系统里面偏要用\（backslash），使得自己与众不同。
在Windows中，正斜杠/表示除法，用来进行整除运算；反斜杠\用来表示目录。
在Unix系统中，/表示目录；\表示跳脱字符将特殊字符变成一般字符
Windows由于使用斜杠/作为DOS命令提示符的参数标志了，为了不混淆，所以采用反斜杠\作为路径分隔符。所以目前windows系统上的文件浏览器都是用反斜杠\作为路径分隔符。


## 为什么重要？
你是否曾经看过 Mac OS X 终端或文件系统，并注意到它与 Linux 的相似之处，以及它们与 Windows 的不同之处？嗯，这就是为什么——Mac OSX 和 Linux 都是类 Unix 操作系统。

了解这段历史有助于您了解什么是“类 Unix”操作系统，以及为什么这么多操作系统看起来彼此如此相似而 Windows 似乎如此不同。这解释了为什么Linux极客会觉得Mac OS X上的终端如此熟悉，而Windows上的命令提示符和PowerShell与其他命令行环境如此不同。

这只是一个简短的历史，它将帮助您了解我们如何到达今天的位置，而不会陷入细节中。如果您想了解更多信息，可以找到有关Unix历史的整本书。
