---
title: Interlaken协议
date: 2022-05-18 22:40:47
updated:
tags: [Interlaken, 协议, 通信协议]
categories: [通信协议]
---
> 对Interlaken协议文档的翻译加了一些自己的理解；

**8b/10b编码**：在串行通道上传输时，将 8bits数据编码为10bits数据，做一个转换，使各位数据之间有更多的 1到0 和 0到1 的跳变，以便接收设备检测这些跳变，能更容易地恢复时钟。**64B/67B 编码**编码的原因也是类似的。这样，在串行通道上传输10位数据，实际上只传输了8位。

## 协议层（Protocol Layer）

### 传输格式

数据通过可配置数量的 SerDes 通道（Lane），再由 Interlaken 接口传输。在本文档中，通道被定义为两个 IC 之间的单工串行链路（simplex serial link）。该协议旨在与任意数量的通道一起运行（1个或多个，没有上限）。实际实现时会固定一个数值，不会设计为可变值。

接口发送数据的基本单位是一个 8 字节的字（Word）。用8字节是为了符合**64B/67B 编码**，用于描述突发（Burst）的控制字的大小也是8字节。通过使基本传输单元与控制字大小相等，可以**很容易地调整接口的宽度**。

数据和控制字按顺序在通道上传输，从通道 0 开始，到通道 M 结束，并在下一个数据块中重复。图 4 说明了该过程

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517120049.png)

64B/67B编码在每个通道上独立进行。传输通过两种基本数据类型实现：数据字和控制字，他们通过64B/67B 帧位（framing bits）进行区分。这两种数据字类型的格式如下图所示：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517120402.png)

数据和控制信息都是以位66～0的顺序传输的，框架层引入了4个附加控制字，详细信息后面将描述。

### Burst 结构（Burst Structure）

#### 数据传输流程

Interlaken接口的带宽在支持的通道上被划分为Bursts。数据包通过一个或多个Burst在接口上传输。Burst通过一个或多个控制字来描述。为了将任意大小的数据包分割成Burst，定义以下两个参数：

- BurstMax：Burst的最大大小（64Bytes的倍数）
- BurstShort：Burst的最小大小（最小32Bytes，增量为8Bytes）

该接口通常通过发送一个 BurstMax 长度的数据突发来运行，然后是一个控制字。发送设备中的调度逻辑可以自由选择信道服务的顺序，**受流控状态的约束**。Burst在每个通道上传输，直到数据包完全传输，此时该通道上的新数据包传输才开始。

因为接口是信道化的，数据包的结束可能会在几个信道上连续地出现，每个信道上的剩余数据量非常小。由于发射器和接收器的存储器可能被理想地设计成宽数据通路，它们需要以非常高的速率来处理这种情况。为了减少接收器和发射器的负担，BurstShort参数保证了连续的Burst控制字之间的最小间隔。最小的BurstShort间隔是32字节，更大的值可以以8字节为增量。

> 如果没有最小Burst的限制，那么数据包太小的话，发送器或者接收器就会频繁收到end-of-packet，这就增加了处理负担。



![示意如何保证 BurstShort 最小间隔。 BurstShort 通过在下一个Burst控制字之前添加额外的空闲控制字来保证最小Burst的大小。图中，Idle Control Word 1 的 EOP_Format 指示 EOP 和Last Data Word的适当大小，Idle Control Word 1 的 CRC24 涵盖了Last Data Word和Idle Control Word 1 。插入Idle Control Word 2 和Idle Control Word 3 BurstShort来保证BurstShort为32字节，随后的 Burst 控制字属于下一轮发送的数据。](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517142438.png)

#### 控制字格式

突发通过一个 8 字节的控制字来描述。控制字在数据流中通过使用位 [66:64] 的“0x10”控制代码和位 [63] = '1' 来标识突发和空闲控制字格式如第 16 页的图 7 所示： 

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517182706.png)

### 流控（Flow Control）

Interlaken 的一个关键特性是能够传达每个通道背压（backpressure）。为了提供此功能，指定了两个选项：**带外流控接口和带内通道**。从语义上讲，流控制信息**使用简单的开关机制来表示允许在特定通道上传输**。

开关流控制状态与每个通道的单个状态位进行通信。按照惯例，“1”标识“XON”状态，表示允许发送器在该通道上发送数据。 “0”标识“XOFF”状态，表示发送器不允许在该通道上发送数据。

该协议没有Credits的概念；一旦通道被指示为 XON，发送器可以在该通道上发送尽可能多的数据，直到流控制状态更改为 XOFF。接收器选择在 XON 和 XOFF 状态之间切换的阈值是留给用户的可编程选项，取决于支持的通道数量、接收缓冲区的深度和给定环境的流控制延迟。

流控制通道可以选择映射到calendar，从而流控制可以映射到任何一组calendar entry。例如，这些可以包括通道到calendar entry的一对一映射、一对多映射或插入空字段以匹配具有不同通道定义的设备。

> Channel Calendar 将通道映射到流控状态槽

这个Calendar 结构也可以用来提供链路级的流控制，Calendar 中的一个bit代表了在整个接口上传输数据的权限。链路状态的极性将与通道状态的极性相同：“1”表示允许传输，“0”表示立即停止传输。要启用此功能，可以为每个Calendar entry配置通道信息或链接信息。为了促进低延迟链路状态，接口需要提供足够的Calendar entry，以便在每个突发/空闲控制字的相同位位置编程链路状态。例如，使用超过 16 个通道，这可以通过以下设置执行：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517165148.png)

使用此方法，link status将始终出现在突发/空闲控制字的位[55]中。

#### 带外流控

为了支持需要单工操作的系统，定义了带外流量控制选项。这是作为一个源同步接口实现的，并由以下信号指定:

|||
|-|-|
|型号名称|功能|
|FC_CLK |与流控数据同步的时钟|
|FC_DATA|流量控制状态信息(单比特)|
|FC_SYNC|一种同步信号，用于标识流控制calendar的开头|


每个信号的pad技术可以是LVDS或LVCMOS。这些信号的逻辑时序关系如下图所示：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220517165803.png)

带外流控制通道由4位CRC计算保护，该CRC计算覆盖了多达64位的流控制数据。根据^[P. Koopman and T. Chakravarty, Cyclic Redundancy Code (CRC) Polynomial Selection 
for Embedded Networks, The International Conference on Dependable Networks and 
Systems, DSN-2004.]中的建议，CRC4多项式为：

$$
x^4+x+1
$$

#### 带内流控

当使用此选项时，接收器利用通过接口发送的控制字中的流控制状态，作为正常数据传输的一部分。提供此选项的目的是，需要最少数量的外部信号引脚的全双工实现。  

如Figure 7所示，控制字的流控制字段为16位，位于bit[55:40]。控制字的位[31:24]也可以用于流控制的另外8位，总共24位。这些状态位表示每个Interlaken Calendar通道的ON-OFF流控制状态，当前Calendar Entry X在位[55]，Calendar Entry X + 1在位[54]，依此类推。为了同步calendar的开始，在空闲/突发控制字中提供了“reset calendar”位。当该位为“1”时，calendar entry 0的状态将出现在位[55]中。当“reset calendar”为“ 0”时，calendar将从上一个控制字中保留的位置开始继续。当所有通道的流控状态被传输完，发送器将重置复位calendar，然后重复上一轮顺序操作。Calendar最后一个控制字中不需要的bit（即，当通道数目不是状态数目的倍数时）被发送端置0，接收端忽略。







## 参考资料



