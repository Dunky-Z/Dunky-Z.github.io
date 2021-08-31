---
title: CSAPP配套实验BombLab详解
date: 2021-08-29 18:40:16
tags: [Linux,GDB,CSAPP]
---


## Tips
### 缩写注释
CSAPP：Computer Systems A Programmer’s Perspective（深入理解计算机操作系统）。CSAPP（C：P166，O：P278）表示书本的中文版第166页，英文原版第278页。

### 寄存器信息
了解寄存器的基本用途，看到一个汇编代码，可以大概了解这个寄存器是在栈中使用的，还是保存参数的，是调用者保存，还是被调用者保存。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830160500.png)

<div STYLE="page-break-after: always;"></div>

### GDB
调试过程用到的GDB命令可以先参考[GDB调试入门]()这篇文章。文中所用例子也是摘自与BombLab的源码，更容易理解如何使用。
## phase_1
拆弹专家已上线，开干！！！！！！！！！！！！！
```{.line-numbers}

(gdb) b phase_1
(gdb) b explode_bomb
(gdb) disas phase_1
Dump of assembler code for function phase_1:'
   0x0000000000400ee0 <+0>:	sub    $0x8,%rsp
   0x0000000000400ee4 <+4>:	mov    $0x402400,%esi
   0x0000000000400ee9 <+9>:	callq  0x401338 <strings_not_equal>
   0x0000000000400eee <+14>:	test   %eax,%eax
   0x0000000000400ef0 <+16>:	je     0x400ef7 <phase_1+23>
   0x0000000000400ef2 <+18>:	callq  0x40143a <explode_bomb>
   0x0000000000400ef7 <+23>:	add    $0x8,%rsp
   0x0000000000400efb <+27>:	retq   
End of assembler dump.
```
- 3：将栈指针`rsp`减去8个字节，也就是申请8个字节的栈空间
- 4：将一个立即数存到寄存器`esi`中
- 5：调用函数`strings_not_equal`，该函数第一条语句的地址为`0x401338`。`callq`指令的执行过程可参考书本CSAPP（C：P166，O：P278）
- 6：使用`test`命令（同`and`命令，不修改目标对象的值）来测试`eax`中的值是否为`0`，如果为`0`则跳过引爆炸弹的函数
- 7：这一句和上一句是一个整体，如果`eax==0`,就跳转到`0x400ef7`，这个地址也就是第9行的地址，成功跳过了引爆炸弹函数。意思就是我们输入的某个字符串成功匹配，也就是`strings_not_equal`函数返回值为0。
- 8：调用函数`explode_bomb`，引爆炸弹
- 9：将栈指针`rsp`加上8个字节，也就是恢复8个字节的栈空间

```{.line-numbers}
(gdb) disas strings_not_equal 
Dump of assembler code for function strings_not_equal:
=> 0x0000000000401338 <+0>:	push   %r12
   0x000000000040133a <+2>:	push   %rbp
   0x000000000040133b <+3>:	push   %rbx
   0x000000000040133c <+4>:	mov    %rdi,%rbx
   0x000000000040133f <+7>:	mov    %rsi,%rbp
   0x0000000000401342 <+10>:	callq  0x40131b <string_length>
   0x0000000000401347 <+15>:	mov    %eax,%r12d
   0x000000000040134a <+18>:	mov    %rbp,%rdi
   0x000000000040134d <+21>:	callq  0x40131b <string_length>
   0x0000000000401352 <+26>:	mov    $0x1,%edx
   0x0000000000401357 <+31>:	cmp    %eax,%r12d
   0x000000000040135a <+34>:	jne    0x40139b <strings_not_equal+99>
   0x000000000040135c <+36>:	movzbl (%rbx),%eax
   0x000000000040135f <+39>:	test   %al,%al
   0x0000000000401361 <+41>:	je     0x401388 <strings_not_equal+80>
   0x0000000000401363 <+43>:	cmp    0x0(%rbp),%al
   0x0000000000401366 <+46>:	je     0x401372 <strings_not_equal+58>
   0x0000000000401368 <+48>:	jmp    0x40138f <strings_not_equal+87>
   0x000000000040136a <+50>:	cmp    0x0(%rbp),%al
   0x000000000040136d <+53>:	nopl   (%rax)
   0x0000000000401370 <+56>:	jne    0x401396 <strings_not_equal+94>
   0x0000000000401372 <+58>:	add    $0x1,%rbx
   0x0000000000401376 <+62>:	add    $0x1,%rbp
   0x000000000040137a <+66>:	movzbl (%rbx),%eax
   0x000000000040137d <+69>:	test   %al,%al
   0x000000000040137f <+71>:	jne    0x40136a <strings_not_equal+50>
   0x0000000000401381 <+73>:	mov    $0x0,%edx
   0x0000000000401386 <+78>:	jmp    0x40139b <strings_not_equal+99>
   0x0000000000401388 <+80>:	mov    $0x0,%edx
   0x000000000040138d <+85>:	jmp    0x40139b <strings_not_equal+99>
   0x000000000040138f <+87>:	mov    $0x1,%edx
   0x0000000000401394 <+92>:	jmp    0x40139b <strings_not_equal+99>
   0x0000000000401396 <+94>:	mov    $0x1,%edx
   0x000000000040139b <+99>:	mov    %edx,%eax
   0x000000000040139d <+101>:	pop    %rbx
   0x000000000040139e <+102>:	pop    %rbp
   0x000000000040139f <+103>:	pop    %r12
   0x00000000004013a1 <+105>:	retq   
End of assembler dump.
       
```
- 3-5：在函数调用时先保存相关寄存器值，`rbp`和`rbx`就是用来保存两个参数的寄存器
- 6：将寄存器`rdi`的值复制到寄存器`rbp`
- 7：将寄存器`rsi`的值复制到寄存器`rbx`

其实看到这里就一直能够猜到答案是什么了。我们通过之前的`phase_1`函数能够大概知道需要输入一个值进行比较，如果比较正确就能解除炸弹。现在我们又进入到了这个比较函数，比较函数有两个参数，分别保存在两个寄存器里。我们正常的思维如果写一个比较函数，肯定一个参数是我们输入的值，一个参数是正确的值。

这里看到了`rsi`寄存器，我们还记得在`phase_1`函数中第4行的`esi`寄存器吗？这两个寄存器是同一个寄存器，只不过`esi`是寄存器的低32位，既然`esi`已经赋值了，那剩下的一个参数保存我们输入的内容。所以`esi`内存的内容就是我们需要的正确答案。我们只要把寄存器`esi`中的值打印出来，或者内存地址为`0x402400`的内容打印出来即可。可以通过以下三条命令查看。
```{.line-numbers}
(gdb) p (char*)($esi)
$5 = 0x402400 "Border relations with Canada have never been better."
(gdb) x/s 0x402400
0x402400:	"Border relations with Canada have never been better."
(gdb) x/s $esi
0x402400:	"Border relations with Canada have never been better."
```
将答案复制，然后继续运行

```{.line-numbers}
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/dominic/learning-linux/bomb/bomb 
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
Border relations with Canada have never been better.

Breakpoint 2, 0x0000000000400ee0 in phase_1 ()
(gdb) s
Single stepping until exit from function phase_1,
which has no line number information.
main (argc=<optimized out>, argv=<optimized out>) at bomb.c:75
75	    phase_defused();                 /* Drat!  They figured it out!
(gdb) s
77	    printf("Phase 1 defused. How about the next one?\n");
```

从13行`phase_defused()`可以知道我们已经解除了炸弹，从15行`printf`函数也可以看到，需要进行下一个炸弹的拆除。过来人的建议，在这里就开始分析`phase_2`，寻找答案，因为继续执行就要开始输入内容了，将无法调试。


## phase_2
继续分析第二个炸弹，
```{.line-numbers}
(gdb) disas phase_2
Dump of assembler code for function phase_2:
   0x0000000000400efc <+0>:	push   %rbp
   0x0000000000400efd <+1>:	push   %rbx
   0x0000000000400efe <+2>:	sub    $0x28,%rsp
   0x0000000000400f02 <+6>:	mov    %rsp,%rsi
   0x0000000000400f05 <+9>:	callq  0x40145c <read_six_numbers>
   0x0000000000400f0a <+14>:	cmpl   $0x1,(%rsp)
   0x0000000000400f0e <+18>:	je     0x400f30 <phase_2+52>
   0x0000000000400f10 <+20>:	callq  0x40143a <explode_bomb>
   0x0000000000400f15 <+25>:	jmp    0x400f30 <phase_2+52>
   0x0000000000400f17 <+27>:	mov    -0x4(%rbx),%eax
   0x0000000000400f1a <+30>:	add    %eax,%eax
   0x0000000000400f1c <+32>:	cmp    %eax,(%rbx)
   0x0000000000400f1e <+34>:	je     0x400f25 <phase_2+41>
   0x0000000000400f20 <+36>:	callq  0x40143a <explode_bomb>
   0x0000000000400f25 <+41>:	add    $0x4,%rbx
   0x0000000000400f29 <+45>:	cmp    %rbp,%rbx
   0x0000000000400f2c <+48>:	jne    0x400f17 <phase_2+27>
   0x0000000000400f2e <+50>:	jmp    0x400f3c <phase_2+64>
   0x0000000000400f30 <+52>:	lea    0x4(%rsp),%rbx
   0x0000000000400f35 <+57>:	lea    0x18(%rsp),%rbp
   0x0000000000400f3a <+62>:	jmp    0x400f17 <phase_2+27>
   0x0000000000400f3c <+64>:	add    $0x28,%rsp
   0x0000000000400f40 <+68>:	pop    %rbx
   0x0000000000400f41 <+69>:	pop    %rbp
   0x0000000000400f42 <+70>:	retq   
End of assembler dump.
```


- 3-6：保存程序入口地址，变量等内容，就不再赘述了
- 7: 调用`read_six_numbers`函数，根据函数名我们可以猜测这个函数需要读入六个数字
- 8-9：比较寄存器`rsp`存的第一个数字是否等于`0x1`，如果等于就跳转到`phase_2+52`处继续执行，如果不等于就执行`explode_bomb`。栈中保存了六个输入的数字，保存顺序是从右往左，假如输入`1,2,3,4,5,6`。那么入栈的顺序就是`6,5,4,3,2,1`，寄存器`rsp`指向栈顶，也就是数字`1`的地址。
- 21:假设第一个数字正确，我们跳转到`<+52>`位置，也就是第21行，将`rsp+0x4`写入寄存器`rbx`，栈指针向上移动四个字节，也就是取第二个输入的参数，将它赋给寄存器`rbx`
- 22：将`rsp+0x18`写入寄存器`rbp`，十六进制`0x18=24`，4个字节一个数，刚好6个数，就是将输入参数的最后一个位置赋给寄存器`rbp`
- 23：跳到`phase_2+27`继续执行
- 12：`rbx-0x4`赋给寄存器`eax`。第21行我们知道，`rbx`此时已经到第二个参数了，这一句就是说把第一个参数的值写入寄存器`eax`
- 13：将`eax`翻一倍，第8行知道第一个参数值为`1`，所以此时`eax`值为`2`
- 14-15：比较`eax`是否等于`rbx`。`rbx`此时保存的是第二个参数，这里也就是比较第二个参数是否等于`2`。如果等于跳转到`phase_2+41`位置，如果不等于就调用爆炸函数
- 17-18：假设第二个参数就是2，我们跳过了炸弹来到第17行，将`rbx`继续上移，然后比较`rbp`是否等于`rbx`，我们知道`rbp`保存了最后一个参数的地址，所以这里的意思就是看看参数有没有到最后一个参数。
- 19：如果`rbx<rbp`，意思就是还没到最后一个参数，就跳转到`phase_2+27`
- 12：再次回到第12行，这里就是相当于一个循环了，让`rbx`一直向上移动，分别存入第2，3，4，5，6个参数，在移动到下一个参数时先保存当前参数到寄存器`eax`让其翻一倍，然后`rbx`再移动到下一个参数，比较`eax==rbx`。直到`rbx`越过了`rbp`。程序跳转到`phase_2+64`，将栈空间恢复。

以上分析也可以得出答案了，我们只要输入一个以`1`为初值，公比为`2`，个数为`6`的等比数列就是答案，也就是`1 2 4 8 16 32`。

```shell{.line-numbers}
(gdb) c
Continuing.
Phase 1 defused. How about the next one?
1 2 4 8 16 32

Breakpoint 6, 0x00000000004015c4 in phase_defused ()
(gdb) s
Single stepping until exit from function phase_defused,
which has no line number information.
main (argc=<optimized out>, argv=<optimized out>) at bomb.c:84
84	    printf("That's number 2.  Keep going!\n");
(gdb) s
```

## phase_3
