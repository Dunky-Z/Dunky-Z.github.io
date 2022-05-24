---
title: C语言实现简单有限状态机
date: 2022-05-15 12:41:30
updated:
tags: [C, FSM, 有限状态机]
categories:
---

## 简介

常说的状态机是有限状态机FSM，是表示有限个状态以及在这些状态之间的转移和动作等行为的数学计算模型。
三个特征：
* 状态总数（state）是有限的。
* 任一时刻，只处在一种状态之中。
* 某种条件下，会从一种状态转变（transition）到另一种状态。

设计状态机的关键点：当前状态、外部输入、下一个状态。

## 状态机分类

### Moore型状态机
Moore型状态机特点是：输出只与当前状态有关（与输入信号无关）。相对简单，考虑状态机的下一个状态时只需要考虑它的当前状态就行了。

### Mealy型状态机 
Mealy型状态机的特点是：输出不只和当前状态有关，还与输入信号有关。状态机接收到一个输入信号需要跳转到下一个状态时，状态机综合考虑2个条件（当前状态、输入值）后才决定跳转到哪个状态。

## 实现一个简单的状态机

代码参考[AstarLight/FSM-framework](https://github.com/AstarLight/FSM-framework)。

以小明的一天设计出一个状态机，下图为状态转移图：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202205151353618.png)

首先，有限状态机的状态是有限的，我们可以定义一天中的状态：
```C
enum
{
	GET_UP,
	GO_TO_SCHOOL,
	HAVE_LUNCH,
	DO_HOMEWORK,
	SLEEP,
};
```

状态机在没有事件的驱动下就是一潭死水，所以我们还需要定义出一些会发生的事件，去驱动状态机的运转：
```C
enum
{
	EVENT1 = 1,
	EVENT2,
	EVENT3,
};
```

再定义一些在某个状态下需要处理的动作，也就是函数：
```C

void GetUp()
{
	// do something
	printf("xiao ming gets up!\n");

}

void Go2School()
{
	// do something
	printf("xiao ming goes to school!\n");
}

void HaveLunch()
{
	// do something
	printf("xiao ming has lunch!\n");
}

void DoHomework()
{
	// do something
	printf("xiao ming does homework!\n");
}

void Go2Bed()
{
	// do something
	printf("xiao ming goes to bed!\n");
}
```

定义一个状态表结构，用来表示一个状态机的状态：
```C
typedef struct FsmTable_s
{
	int event;              //事件
	int CurState;           //当前状态
	void (*eventActFun)();  //函数指针
	int NextState;          //下一个状态
}FsmTable_t;
```

接下来，我们就可以这个结构定义一个状态表，状态机根据这个表进行状态的流转：
```C
FsmTable_t XiaoMingTable[] =
{
	//{到来的事件，当前的状态，将要要执行的函数，下一个状态}
	{ EVENT1,  SLEEP,           GetUp,        GET_UP },
	{ EVENT2,  GET_UP,          Go2School,    GO_TO_SCHOOL },
	{ EVENT3,  GO_TO_SCHOOL,    HaveLunch,    HAVE_LUNCH },
	{ EVENT1,  HAVE_LUNCH,      DoHomework,   DO_HOMEWORK },
	{ EVENT2,  DO_HOMEWORK,     Go2Bed,       SLEEP },
};
```

定义一个状态机结构，表示一个状态机：
```C
typedef struct FSM_s
{
	FsmTable_t* FsmTable;   //指向的状态表
	int curState;           //FSM当前所处的状态

}FSM_t;
```

有了这些基本的结构，就可以写主函数了：
```C
int main()
{
	FSM_t fsm;                        // 实例化一个状态机
	InitFsm(&fsm);                    // 初始化状态机
	int event = EVENT1;               // 初始化事件，为了启动状态机流转，
                                      // 因为状态机只有在有时间发生时才会改变状态

	//小明的一天,周而复始的一天又一天，进行着相同的活动
	while (1)
	{
		printf("event %d is coming...\n", event);
		FSM_EventHandle(&fsm, event); // 有了初始事件，我们就需要处理这个事件，
                                      // 再写一个处理事件的函数
		printf("fsm current state %d\n", fsm.curState);
		test(&event); 
		Sleep(1);                     //休眠1秒，方便观察
	}

	return 0;
}

// 测试用的，模拟事件的发生
void test(int *event)
{
	if (*event == 3)
	{
		*event = 1;
	}
	else
	{
		(*event)++;
	}
	
}
```

编写初始化状态机的函数：
```C
int g_state_max_num = 0; // 状态机的状态最大数量，根据状态表的大小来计算
// 初始化FSM
void InitFsm(FSM_t* pFsm)
{
	g_state_max_num = sizeof(XiaoMingTable) / sizeof(FsmTable_t);
	pFsm->curState = SLEEP; // 初始状态为睡觉
    pFsm->FsmTable = XiaoMingTable;
}
```

编写事件处理函数：
```c
/* 事件处理 */
void FSM_EventHandle(FSM_t* pFsm, int event)
{
	FsmTable_t* pActTable = pFsm->FsmTable;
	void (*eventActFun)() = NULL;  //函数指针初始化为空
	int NextState;
	int CurState = pFsm->curState;

	/* 获取当前动作函数 */
	for (int i = 0; i<g_max_num; i++)
	{
		//当且仅当当前状态下来个指定的事件，我才执行它
		if (event == pActTable[i].event && CurState == pActTable[i].CurState)
		{
			pActTable[i].eventActFun();                      // 执行动作函数
            FSM_StateTransfer(pFsm, pActTable[i].NextState); // 执行状态转移
			break;
		}
        else
        {
            // do nothing
        }
	}
}
```

```C
/* 状态迁移 */
void FSM_StateTransfer(FSM_t* pFsm, int state)
{
	pFsm->curState = state;
}
```



## 参考资料

[Linux编程之有限状态机FSM的理解与实现 - Madcola - 博客园](https://www.cnblogs.com/skyfsm/p/7071386.html)
[JavaScript与有限状态机 - 阮一峰的网络日志](http://www.ruanyifeng.com/blog/2013/09/finite-state_machine_for_javascript.html)
[有限状态机 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E6%9C%89%E9%99%90%E7%8A%B6%E6%80%81%E6%9C%BA)