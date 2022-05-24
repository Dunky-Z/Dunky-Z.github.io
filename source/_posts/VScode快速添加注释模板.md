---
title: VScode快速添加注释模板
date: 2021-09-29 17:03:13
tags: [VSCode]
---
## 需求
通常函数的注释一般都比较长，而且每个函数注释都格式一致，例如下面的函数注释模板。如果每次写注释都要复制一遍比较麻烦，复制完还要删除多余的字符。但是现有的编辑器一般都支持快捷输入。下面介绍在VSCode中如何快捷输入注释模板。

## 方法
- `Ctrl+Shift+P`打开编辑器命令窗口-输入`snippets`-选择`Preferences:Configure User Snippets`-选择·c.json·
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210929170226.png)
    ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210929170717.png)
- 更改如下：
    ```json
    {
	// Place your snippets for c here. Each snippet is defined under a snippet name and has a prefix, body and 
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders. Placeholders with the 
	// same ids are connected.
	// Example:
	// "Print to console": {
	// 	"prefix": "log",
	// 	"body": [
	// 		"console.log('$1');",
	// 		"$2"
	// 	],
	// 	"description": "Log output to console"
	// }
		"Function comment": {
		"prefix": "funcom",
		"body": [
				"/* "
				 "* Description:      "
				 "* Input Parameter:  "
				 "* Output Parameter: "
				 "* Return:           "
				 "*/ "
		],
		"description": "function comment"
    }
    ```
    - `prefix`:输入时的缩写，触发器
    - `body`:内容
    - `description`:描述


[VSCode 利用 Snippets 设置超实用的代码块 - 掘金](https://juejin.cn/post/6844903869424599053)