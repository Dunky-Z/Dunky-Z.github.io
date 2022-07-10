---
title: volatile能否解决缓存一致性问题
date: 2022-07-08 09:10:27
updated:
tags: [缓存一致性, Cache]
categories: 
---

# volatile能否解决缓存一致性问题
为何会产生这样的疑问，还得从一个工作中的Bug说起。在使用PMP（Physical Memory Protect）对物理内存进行保护时，无法成功保护，简单来说PMP可以对一段物理内存设置保护，如保护这段内存不可写。测试时，先对这段内存写入`0x1234`，再读取这段内存。如果读取的值为`0x0`表示保护成功，但实际总能成功读取`0x1234`。

```C
volatile int test;
test = read(0xFF740000);
print("Before = %x\n", test); // 保护之前数据 Before = 0x1111 
PMP(0xFF740000, 0x400);       // 保护这段内存不可写
write(0xFF740000, 0x1234);    // 写入数据
test = read(0xFF740000);
print("After = %x\n", test);  // 预期读取为0x0，实际总能成功读取0x1234
```

因为读取的变量`test`设置为`volatile`，所以按照以往的理解，系统总是重新从它所在的内存读取数据，这里应该能正确读取出数据。

但是忽略了一点，当使用`volatile`变量时，CPU只是不再使用寄存器中的值，直接去内存中读取数据，这里的内存实际上是包括Cache的。

所以当数据被Cached之后，当再次读取时，CPU可能会直接读取Cached的数据，而不是去读取真正内存中的数据。因此，**volatile不能解决缓存一致性问题**。

关于Cache的详细信息，请参考[CPU Cache高速缓存 - 如云泊](https://dunky-z.github.io/2022/07/10/CPU-Cache%E9%AB%98%E9%80%9F%E7%BC%93%E5%AD%98/)。
