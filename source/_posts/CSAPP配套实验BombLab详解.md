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
调试过程用到的GDB命令可以先参考[GDB调试入门](https://dunky-z.github.io/2021/08/29/GDB%E8%B0%83%E8%AF%95%E5%85%A5%E9%97%A8/)这篇文章。文中所用例子也是摘自与BombLab的源码，更容易理解如何使用。还有一定比较重要的是，如何使用gdb带参数调试。为了不用每次运行`bomb`程序都需要重新输入答案，`bomb`程序可以读取文本信息，在文本文件中写入答案即可免去手动输入。

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
这个炸弹的作者应该再心狠手辣一点，把函数名换成`read_some_numbers`，这样我们就不得不看这个函数的内容了，因为这个函数里还有一个坑，这个坑在函数名字上一句被填了。那就是这个函数会对参数个数做判断，如果小于5就爆炸。

```{.line-numbers}
(gdb) disas read_six_numbers
Dump of assembler code for function read_six_numbers:
   0x000000000040145c <+0>:	sub    $0x18,%rsp
   0x0000000000401460 <+4>:	mov    %rsi,%rdx
   0x0000000000401463 <+7>:	lea    0x4(%rsi),%rcx
   0x0000000000401467 <+11>:	lea    0x14(%rsi),%rax
   0x000000000040146b <+15>:	mov    %rax,0x8(%rsp)
   0x0000000000401470 <+20>:	lea    0x10(%rsi),%rax
   0x0000000000401474 <+24>:	mov    %rax,(%rsp)
   0x0000000000401478 <+28>:	lea    0xc(%rsi),%r9
   0x000000000040147c <+32>:	lea    0x8(%rsi),%r8
   0x0000000000401480 <+36>:	mov    $0x4025c3,%esi
   0x0000000000401485 <+41>:	mov    $0x0,%eax
   0x000000000040148a <+46>:	callq  0x400bf0 <__isoc99_sscanf@plt>
   0x000000000040148f <+51>:	cmp    $0x5,%eax
   0x0000000000401492 <+54>:	jg     0x401499 <read_six_numbers+61>
   0x0000000000401494 <+56>:	callq  0x40143a <explode_bomb>
   0x0000000000401499 <+61>:	add    $0x18,%rsp
   0x000000000040149d <+65>:	retq   
End of assembler dump.
```
- 3：申请24个字节栈空间
- 4：`rdx=rsi`，将输入参数的第一个参数放到寄存器`rdx`中，为啥是第一个参数，因为`rsi`现在保存的地址是栈顶位置，栈顶目前保存就是第一个参数。
- 5：`rcx = rsi + 4`，把第二个参数的地址传给寄存器`rcx`
- 6：`rax = rsi + 20`，把第六个参数的地址传给寄存器`rax`
- 7：`rsp + 8 = rax`第八个参数
- 8：`rax = rsi + 16`，把第五个参数传给
- 9：`rsp = rax`第七个参数
- 10：`r9 = rsi + 12`把第四个参数传给寄存器`r9`
- 11：`r8 = rsi + 8`把第三个参数传给寄存器`r8`
- 12：
- 13：`eax = 0`
- 14：调用输入函数`sscanf`
- 15-17：函数返回值个数与5比较，如果小于5就爆炸，否则返回
## phase_3
```{.line-numbers}
   0x0000000000400f43 <+0>:	sub    $0x18,%rsp
   0x0000000000400f47 <+4>:	lea    0xc(%rsp),%rcx
   0x0000000000400f4c <+9>:	lea    0x8(%rsp),%rdx
   0x0000000000400f51 <+14>:	mov    $0x4025cf,%esi
   0x0000000000400f56 <+19>:	mov    $0x0,%eax
   0x0000000000400f5b <+24>:	callq  0x400bf0 <__isoc99_sscanf@plt>
   0x0000000000400f60 <+29>:	cmp    $0x1,%eax
   0x0000000000400f63 <+32>:	jg     0x400f6a <phase_3+39>
   0x0000000000400f65 <+34>:	callq  0x40143a <explode_bomb>
   0x0000000000400f6a <+39>:	cmpl   $0x7,0x8(%rsp)
   0x0000000000400f6f <+44>:	ja     0x400fad <phase_3+106>
   0x0000000000400f71 <+46>:	mov    0x8(%rsp),%eax
   0x0000000000400f75 <+50>:	jmpq   *0x402470(,%rax,8)
   0x0000000000400f7c <+57>:	mov    $0xcf,%eax
   0x0000000000400f81 <+62>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400f83 <+64>:	mov    $0x2c3,%eax
   0x0000000000400f88 <+69>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400f8a <+71>:	mov    $0x100,%eax
   0x0000000000400f8f <+76>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400f91 <+78>:	mov    $0x185,%eax
   0x0000000000400f96 <+83>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400f98 <+85>:	mov    $0xce,%eax
   0x0000000000400f9d <+90>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400f9f <+92>:	mov    $0x2aa,%eax
   0x0000000000400fa4 <+97>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400fa6 <+99>:	mov    $0x147,%eax
   0x0000000000400fab <+104>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400fad <+106>:	callq  0x40143a <explode_bomb>
   0x0000000000400fb2 <+111>:	mov    $0x0,%eax
   0x0000000000400fb7 <+116>:	jmp    0x400fbe <phase_3+123>
   0x0000000000400fb9 <+118>:	mov    $0x137,%eax
   0x0000000000400fbe <+123>:	cmp    0xc(%rsp),%eax
   0x0000000000400fc2 <+127>:	je     0x400fc9 <phase_3+134>
   0x0000000000400fc4 <+129>:	callq  0x40143a <explode_bomb>
   0x0000000000400fc9 <+134>:	add    $0x18,%rsp
   0x0000000000400fcd <+138>:	retq   

```
- 1：开辟24字节的栈空间
- 2：`rcx = rsp + 12`第二个参数
- 3：`rdx = rsp + 8`第一个参数
- 4-8：和`phase_2`里`read_six_numbers`函数中的第13行开始一样，输入数据，判断一下输入参数的个数，只不过这里是返回值个数大于1，如果参数个数正确就跳到`phase_3+39`也就是第10行，否则引爆炸弹。
- 10-11：如果`7 < rsp + 8 等价于 7 < rdx 等价于 7 < 第一个参数`就跳转到`phase_3+106`，爆炸。这里确定第一个数必须小于7
- 12：`eax = rsp + 8 等价于 eax = 第一个参数`
- 13：跳转至`0x402470 + 8 * rax`处，具体跳转到哪里根据第一个值做判断
- 14：`eax = 207`
- 15：跳转至`phase_3+123`,即32行
- 16：`eax = 707`
- 17：跳转到32行
- 18：`eax = 256`
- 19：跳转到32行
- 20：`eax = 389`
- 21-27：以此类推
- 29：`eax = 0`
- 30：
- 31：`eax = 311`
- 32-34：比较`eax`和`rsp + 12` 等价于 比较 第二个参数和`eax`。如果相等就返回，如果不等就引爆。

分析至此，我们也就知道了程序的大概流程，输入两个值，第一个值必须小于等于7，第二个值根据第一个值来确定，具体等于多少，根据跳转表确定，因为第一个值有八个数，也就对应着汇编中八段寄存器`eax`赋值的过程，我们只要输入第一个合法的数值，然后再打印出寄存器`eax`的值，即可确定答案。

比如我们先测试一下第一个值为0时，对应的第二个值为多少，我们输入`0  10`，因为只是测试，第二个值任意。
```
That's number 2.  Keep going! //接上个炸弹后面
88	    input = read_line();
(gdb) n
0 10              //输入测试答案
89	    phase_3(input);
(gdb) n
Breakpoint 4, 0x0000000000400f43 in phase_3 ()
(gdb) n
Single stepping until exit from function phase_3,
which has no line number information.
Breakpoint 2, 0x000000000040143a in explode_bomb ()
(gdb) p $eax
$14 = 207         //207即是答案
```
输入真正答案测试，
```
(gdb) n
0 207                         //输入答案
89	    phase_3(input);
(gdb) n
Breakpoint 4, 0x0000000000400f43 in phase_3 ()
(gdb) n
Single stepping until exit from function phase_3,
which has no line number information.
main (argc=<optimized out>, argv=<optimized out>) at bomb.c:90
90	    phase_defused();    //炸弹拆除
(gdb) 
91	    printf("Halfway there!\n");
```

我们上面说过，第一个值有八种可能，所以这题答案也有八个，我们只要挨个测试`0-7`，分别打印出寄存器`eax`的值就可以得到所有答案。他们分别是
```
0 207
1 311
2 707
3 256
4 389
5 206
6 682
7 327
```

## phase_4
行百里者半九十，NO
```{.line-numbers}
(gdb) disas phase_4
Dump of assembler code for function phase_4:
   0x000000000040100c <+0>:	sub    $0x18,%rsp
   0x0000000000401010 <+4>:	lea    0xc(%rsp),%rcx
   0x0000000000401015 <+9>:	lea    0x8(%rsp),%rdx
   0x000000000040101a <+14>:	mov    $0x4025cf,%esi
   0x000000000040101f <+19>:	mov    $0x0,%eax
   0x0000000000401024 <+24>:	callq  0x400bf0 <__isoc99_sscanf@plt>
   0x0000000000401029 <+29>:	cmp    $0x2,%eax
   0x000000000040102c <+32>:	jne    0x401035 <phase_4+41>
   0x000000000040102e <+34>:	cmpl   $0xe,0x8(%rsp)
   0x0000000000401033 <+39>:	jbe    0x40103a <phase_4+46>
   0x0000000000401035 <+41>:	callq  0x40143a <explode_bomb>
   0x000000000040103a <+46>:	mov    $0xe,%edx
   0x000000000040103f <+51>:	mov    $0x0,%esi
   0x0000000000401044 <+56>:	mov    0x8(%rsp),%edi
   0x0000000000401048 <+60>:	callq  0x400fce <func4>
   0x000000000040104d <+65>:	test   %eax,%eax
   0x000000000040104f <+67>:	jne    0x401058 <phase_4+76>
   0x0000000000401051 <+69>:	cmpl   $0x0,0xc(%rsp)
   0x0000000000401056 <+74>:	je     0x40105d <phase_4+81>
   0x0000000000401058 <+76>:	callq  0x40143a <explode_bomb>
   0x000000000040105d <+81>:	add    $0x18,%rsp
   0x0000000000401061 <+85>:	retq   
```
- 1-8：开辟空间，保存参数信息，调用输入函数，和上面的分析重复，不再赘述。注意的是第6行，`x/s 0x4025cf`可知两个参数是整型数值。
- 9-10：参数个数必须等于2，否则引爆
- 11-12：`14`与`rsp + 8`比较，等价于`14`与第一个参数比较。表示第一个参数必须小于等于14，否则引爆。
- 14：`edx = 14`
- 15：`esi = 0`
- 16：`edi = rsp + 8`即`edi = 第一个参数`
- 17：调用函数`fun4`，参数分别为`edi 0 14`
- 18：测试返回值是否为0，如果不为0，引爆
- 20-22：比较`0`和`rsp + 12`，如果不等，引爆，否则返回


```{.line-numbers}
(gdb) disas func4
Dump of assembler code for function func4:
   0x0000000000400fce <+0>:	sub    $0x8,%rsp
   0x0000000000400fd2 <+4>:	mov    %edx,%eax
   0x0000000000400fd4 <+6>:	sub    %esi,%eax
   0x0000000000400fd6 <+8>:	mov    %eax,%ecx
   0x0000000000400fd8 <+10>:	shr    $0x1f,%ecx
   0x0000000000400fdb <+13>:	add    %ecx,%eax
   0x0000000000400fdd <+15>:	sar    %eax
   0x0000000000400fdf <+17>:	lea    (%rax,%rsi,1),%ecx
   0x0000000000400fe2 <+20>:	cmp    %edi,%ecx
   0x0000000000400fe4 <+22>:	jle    0x400ff2 <func4+36>
   0x0000000000400fe6 <+24>:	lea    -0x1(%rcx),%edx
   0x0000000000400fe9 <+27>:	callq  0x400fce <func4>
   0x0000000000400fee <+32>:	add    %eax,%eax
   0x0000000000400ff0 <+34>:	jmp    0x401007 <func4+57>
   0x0000000000400ff2 <+36>:	mov    $0x0,%eax
   0x0000000000400ff7 <+41>:	cmp    %edi,%ecx
   0x0000000000400ff9 <+43>:	jge    0x401007 <func4+57>
   0x0000000000400ffb <+45>:	lea    0x1(%rcx),%esi
   0x0000000000400ffe <+48>:	callq  0x400fce <func4>
   0x0000000000401003 <+53>:	lea    0x1(%rax,%rax,1),%eax
   0x0000000000401007 <+57>:	add    $0x8,%rsp
   0x000000000040100b <+61>:	retq   
```
```C
func (edi, esi, edx)
{
   // edi = 第一个参数, esi = 0, edx = 14
   eax = edx            // 4:mov %edx, %eax
   eax = eax -esi       // 5:sub esi, %eax
   eax = edx -esi
   ecx = eax            // 6:mov %eax, %ecx
   ecx = edx - esi
   eсx = ecx >> 31      // 7:shr  $0x1f, %ecx
   ecx = (edx - esi) >> 31
   eax = eax + ecx      // 8:add %ecx, %eax
   eax = (edx - esi) + ((edx - esi) >> 31)//替换eax和ecx
   eax = eax > 1;       // 9:sar %eax
   eax = ((edx - esi) +((edx -esi) >> 31)) / 2
   ecx = eax + esi * 1   // 10:lea (rax,ersi,1), %ecx
   ecx = ((edx - esi) +((edx -esi) >> 31)) / 2 + esi * 1

   ecx = ((14 - 0) + ((14 - 0) >> 31)) / 2 + 0
   ecx = 7

   // 11:cmp %edi, %ecx
   if (ecx <= edi)
   {
      // 12:jle 400ff2
      eax = 0    // mov $0x0,%eax
      // 18:cmp %edi, %ecx
      if(ecx >= edi)
      {
         // 19:jge    0x401007 <func4+57>
         return;
         //由此可以得知道 edx == edi
      }
   }
}
```
