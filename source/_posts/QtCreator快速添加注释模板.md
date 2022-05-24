---
title: QtCreator快速添加注释模板
date: 2021-09-28 19:26:03
tags: [QtCreator,Qt]
---

## 需求
通常函数的注释一般都比较长，而且每个函数注释都格式一致，例如下面的函数注释模板。如果每次写注释都要复制一遍比较麻烦，复制完还要删除多余的字符。但是现有的编辑器一般都支持快捷输入。下面介绍在QtCreator中如何快捷输入注释模板。

```cpp
/* 
 * Description:      // 函数功能、性能等的描述  
 * Input Parameter:  // 输入参数说明，包括每个参数的作 
 * Output Parameter: // 对输出参数的说明。 
 * Return:           // 函数返回值的说明 
 */ 
```

## 方法
- QtCreator-菜单栏工具（Tool）-选项（Options）-文本编辑器（Text Editor）-片段（Snippets）
- 组（Group）选择`C++`-添加（Add）
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210928193309.png)
- 现在要为我们的触发（Trigger）起个名字，因为是函数注释，我起了个`funcom`，然后在下方空白框里填入注释模板。Apply保存。如图
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210928193538.png)
- 在需要添加注释模板的地方输入`funcom`即可提示快捷输入，回车即可添加注释模板。
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210928194108.gif)

我们可以看到片段里有很多熟悉的内容，比如`if else`，我们在写代码时输入`if else`自动补全花括号其实就是在这里设置的。同理，我们还可以设置一些其他需要的快捷输入内容。比如行注释，文件注释，经常使用的代码框架等等。