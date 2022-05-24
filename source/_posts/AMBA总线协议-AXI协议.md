---
title: AMBA总线协议-AXI协议
date: 2022-05-17 21:16:45
updated:
tags: [AMBA总线协议, AXI协议, 总线协议, AMBA，协议, 通信协议]
categories: [通信协议]
---
## AXI

组成部分：

AXI4协议中包含五种信道，通道之间相互独立且存在差别，通过通道进行通信之前需要使用VALID/READY 进行握手，Read和Write根据Master定义：

- 读地址信道（Read Address Channel）
- 写地址信道（Write Address Channel）
- 读数据信道（Read Data Channel）
- 写数据信道（Write Data Channel）
- 写响应信道（Write Response Channel）

还有两种Component

- Master component
- Slave component

通信由Master发起，Master可以对Slave进行读数据（read）或写（write）数据。每次读写操作都需要一个地址，读地址信道（Read Address Channel）和写地址信道（Write Address Channel）用于传输地址。在写完数据后，Master需要确认Slave有没有收完数据，Slave收到完整数据后，会通过写响应信道（Write Response Channel）给Master一个反馈（completion），表示写操作已经完成。

### VALID/READY 握手机制

AXI五个信道相互独立，但是使用同一个握手机制来实现信息传递。

在握手机制中，通信双方分别扮演**发送方**(Source)和**接收方**（Destination），两者的操作（技能）并不相同。

**发送方**置高 **VALID** 信号表示发送方已经将数据，地址或者控制信息已经就绪，并保持于消息总线上。

**接收方**置高 **READY** 信号表示接收方已经做好接收的准备。

当双方的 VALID/READY 信号同时为高，在时钟 ACLK 上升沿，完成一次数据传输。所有数据传输完毕后，双方同时置低自己的信号。

每个通道都有自己的 VALID /READY 握手信号对：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516200137.png)

在握手过程中，还会用到LAST信号。LAST信号存在Write Data Channel和Read Data Channel中，分别表示为WLAST和RLAST，用于标记burst的最后一次数据传输，当slave接收到LAST信号后，说明本次数据传输完成。

#### 双向流控

所谓的**双向流控**机制，指的是发送方通过置起 VALID 信号控制发送的时机与速度，接收方也可以通过 READY 信号的置起与否控制接收速度。

发送方拥有传输的主动权，但接收方在不具备接收能力时，也能够置低信号停止传输，反压发送方。

#### 握手过程分析

> 图中INFORMATION信号无底色区域表示此时数据已经准备好，已经有新的数据到达。

**VALID信号先到**

发送方 VALID 信号早早就到了，但是接收方的READY信号在T2之前都没有发送。可能接收方在接收其他数据，或者被堵在数据通路上。

过了T2后，READY信号到来，此时开始传输，直到T3结束，传输完成。

这里也体现了双向流控机制，发送方的VALID信号只要置高，再握手完成之前都不能置低，必须等到接收方READY信号置高。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516201556.png)

**READY信号先到**

READY 信号很自由，可以等待 VALID 信号到来再做响应，但也完全可以在 VALID 信号到来前就置高，表示接收端已经做好准备了。

而且，READY 信号与 VALID 不同，接收方可以置起 READY 之后在VALID置高之前都可以随时再置低READY信号。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516201616.png)

**信号同时同时到达**

这个最简单，两个信号都等着一个时钟上升沿就完成传输了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516201647.png)





#### 握手信号之间的依赖关系

为了防止死锁发生，信号之间要遵循一些规矩，举例来说，如上面提到的READY信号依赖VALID信号，但是VALID信号不能根据READY信号来判断是否数据已准备好，否则将会造成死锁。下面详细解释读写过程中需要遵循的依赖关系。

- 单箭头指向的两个信号，信号的置高，低没有顺序要求。
- 双箭头表示箭头所指对象应迟于箭头出发信号发送。

**Read transaction dependencies**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517100503.png)

- Master不得等待Slave置高 ARREADY
- Slave可以在置高ARREADY 之前等待 ARVALID 置高
- Slave能够在ARVALID置高之前先置高ARREADY
- Slave必须等待 ARVALID 和 ARREADY 都被置高，然后才置高RVALID 以表示有效数据可用
- 在置高 RVALID 之前，Slave不得等待Master置高 RREADY
- Master可以在置高RREADY 之前等待 RVALID 被置高
- Master可以在 RVALID 被置高之前置高RREADY

**Write transaction dependencies**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517100647.png)

- 在置高AWVALID 或 WVALID 之前，Master不得等待Slave置高 AWREADY 或 WREADY
- Slave可以在置高 AWREADY 之前等待 AWVALID 或 WVALID，或两者都等待
- Slave可以在 AWVALID 或 WVALID 或两者都被置高之前置高 AWREADY
- 在置高 WREADY 之前，Slave可以等待 AWVALID 或 WVALID，或两者都等待
- Slave可以在 AWVALID 或 WVALID 或两者都被置高之前置高WREADY
- 在置高 BVALID 之前，Slave必须等待 WVALID 和 WREADY 都被置高
    - Slave还必须在置高 BVALID 之前等待 WLAST 被置高，因为写入响应 BRESP 必须在写入事务的最后一次数据传输之后才发出信号
- 在置高 BVALID 之前，Slave不得等待Master置高 BREADY
- Master可以在置高 BREADY 之前等待 BVALID
- Master可以在 BVALID 被置高之前置高 BREADY

### 地址结构（Address structure）

AXI协议是基于Burst的，地址结构里声明了一些传输过程中需要的信号，如起始地址，burst传输长度，传输模式等等。

#### Burst

在介绍Burst transfer之前，需要解释一下什么是Burst。在手册的术语表中，与 AXI 传输相关的有三个概念，分别是 transfer(beat)、burst、transaction。

- **AXI Transaction**：the complete set of required operations on the AXI bus form the AXI Transaction.表示传输一段数据(AXI burst)所需的一整套操作；
- **AXI Burst**：any required payload data is transferred as an AXI Burst.表示AXI待传数据；
- **AXI Beats**：a burst can comprise multiple data transfers, or AXI Beats.表示AXI burst的组成，一个Beat就是一个transfer。

三者的关系：在 AXI 传输事务（Transaction）中，数据以突发传输（Burst）的形式组织。一次突发传输中可以包含一至多个数据（Transfer）。每个 transfer 因为使用一个周期，又被称为一拍数据（Beat）。

$$
\text{Transaction} = M * \text{Burst} ,M \geq 1 \\
\text{Burst} = N * \text{Transfer( or Beat)} ,N \geq 1
$$

 

在地址通道中有三个信号控制进行控制，包括：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516151233.png)

**ARLEN(Burst Length)**

指一次突发传输中包含的数据传输(transfer)数量，在协议中使用 AxLen 信号控制。在 AXI4 中，INCR 类型最大支持长度为 256，其他类型最大长度为 16。而 AXI3 中这一数字无论何种模式均为 16。因此 AXI4 中 AxLen 信号位宽为 8bit，AXI3 中的 AxLen 则仅需要 4bit。

**ARSIZE(Burst Size)**

指传输中的数据位宽，具体地，是每周期传输数据的字节数量，在协议中使用 AXSIZE 信号控制。**突发传输数据宽度不能超过数据总线本身的位宽**。而当数据总线位宽大于突发传输宽度时，将根据协议的相关规定，将数据在部分数据线上传输。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516154710.png)

**ARBURST(Burst Type)**

Burst Type：AXI协议中支持不同的Burst传输类型，主要分FIXED、INCR、WRAP。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516144318.png)

- **FIXED传输为地址固定传输**，所有传输都会写在同一个地址中。主要应用在FIFO的传输中，因为FIFO为先入先出，只需要往同一个地址写数据即可。
- **INCR传输为地址递增传输**，可根据具体的配置有固定长度递增和非定长递增。**大部分的数据传输都是使用这种方式**，尤其是在内存访问中，可以大大提高效率。
- **WRAP传输为地址回环传输**，在一定长度后会回环到起始地址。主要应用在Cache操作中，因为cache是按照cache line进行操作，采用wrap传输可以方便的实现从内存中取回整个cache line。

AXI burst读操作：**master只需要发送burst的起始地址**，slave会根据burst的起始地址与burst场地自动进行地址计算，将对应的数据与响应发送到master侧。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516143930.png)

AXI burst写操作中，**也只需要发送burst写的起始地址**，slave只需要接受起始地址，然后根据传输的长度将数据传输到对应的地址缓存中。  只需要进行一次握手就可以实现地址通道的请求传输，避免系统总线的占用。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516144030.png)

### 数据结构（Data read and write structure）

读写数据结构中声明了几种数据传输方式。

在介绍这些传输方式之前，需要了解**WSTRB(Write strobes)写选通信号**。写选通信号 WSTRB 允许在写数据总线上进行 稀疏数据 传输。每个写选通信号对应写数据总线上的一个字节。当写选通断言时，表示写数据总线上对应的字节通道中包含将被更新到 memory 的有效信息。  

写数据总线上每 8 位具有一个写选通位，因此 WSTRB[n] 对应  WDATA[(8 x n) + 7 : (8 x n)]。默认情况下WSTRB = 0xFFFF。也就是所有通路都是通的。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516162105.png)

#### Narrow Transfer

当本次传输中数据位宽小于通道本身的数据位宽时，称为**窄位宽数据传输**，或者直接翻译成**窄传输**。如下图，传输总线为32bit，但是每次只传了8 bit。

窄传输就是**通过STRB信号指定有效传输数据的位宽来实现**。针对一些特定的寄存器读写，或者在不同数据位宽的总线传输中会使用窄传输操作。如图，第一次传输时，WSTRB信号为0x01，WSTRB = b'001，表示WDATA[7:0]数据有效。

需要注意**在多笔连续的窄传输操作中，STRB会随着地址递增进行响应的变化**，这样方便在系统设计使用中可以方便的将窄传输合并，从而提升系统传输效率。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516162805.png)

#### Unaligned Transfer

AXI 协议规定单次 burst 传输中的数据，其地址不能跨越 4KB 边界。也就是在传输过程中会进行4K对齐。但是在某些时候，会期望在非对齐的地址开始一个突发，即非对齐传输。  

> 协议中之所以规定一个burst不能跨越4K边界是为了避免一次burst 访问两个slave（每个slave的地址空间是4K/1K对齐的）。4K对齐最大原因是系统中定义一个page大小是4K，而所谓的4K边界是指低12bit为0的地址。

非对齐传输是指**有些传输指令不是按照word对齐，而是按照Byte对齐进行传输**。起始地址可能是任意的地址。如下图中，起始地址为0x1，则在系统上需要按照非对齐的方式进行传输。**第一次传输采用strb信号指定对应的Byte有效，后面的传输可以按照正常的传输进行**。

下图是一些传输示例，有阴影的格子表示当前字节不会被传输。

图一为正常的对齐传输，传输起始地址为0x00。

图二为非对齐传输，起始地址为0x01，第一个格子对应的WSTRB = b'1110。

图三同上，只是Burst length为5。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516171247.png)

图四也为非对齐传输，起始地址为0x07。对应的WSTRB = b'1000。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220516171348.png)

