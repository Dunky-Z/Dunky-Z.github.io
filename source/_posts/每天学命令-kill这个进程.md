---
title: 每天学命令-kill这个进程
date: 2021-08-11 15:22:40
tags: [Linux,每天学命令]
---

对于在前台运行的程序，我们可以用`Ctrl+C`来终止运行，但是在后台的程序就必须用`kill`命令来终止了。
## Command
```
-l  信号，若果不加信号的编号参数，则使用“-l”参数会列出全部的信号名称
-a  当处理当前进程时，不限制命令名和进程号的对应关系
-p  指定 kill 命令只打印相关进程的进程号，而不发送任何信号
-s  指定发送信号
-u  指定用户
```


## Examples
### 查看所有信号
```
➜   kill -l
HUP INT QUIT ILL TRAP ABRT BUS FPE KILL USR1 
SEGV USR2 PIPE ALRM TERM STKFLT CHLD CONT STOP 
TSTP TTIN TTOU URG XCPU XFSZ VTALRM PROF WINCH POLL PWR SYS
```
常用信号
```
HUP    1    终端断线
INT     2    中断（同 Ctrl + C）
QUIT    3    退出（同 Ctrl + \）
TERM   15    终止
KILL    9    强制终止
CONT   18    继续（与 STOP 相反， fg/bg 命令）
STOP    19    暂停（同 Ctrl + Z）
```

### 用 ps 查找进程，然后用 kill 杀掉
```
ps -ef | grep 'program'
kill PID
```

### 无条件彻底杀死进程
```
kill –9 PID
```

### 杀死指定用户所有进程
```
kill -9 $(ps -ef | grep username)
kill -u username
```