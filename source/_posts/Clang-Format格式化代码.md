---
title: Clang-Format格式化代码
date: 2021-12-01 17:42:45
updated:
tags: [Linux, Qt, VSCode]
categories: [工欲善其事必先利其器]
---

## 安装
### Linux
```bash
sudo apt-get install clang-format
```

### windows
## 使用
### 入门使用
Linux可以直接命令行，使用以LLVM代码风格格式化`main.cpp`, 结果直接写到`main.cpp`
```bash
clang g-format -i main.cpp -style=LLVM
```
### 进阶配置
如果每次编码都命令行执行一遍那也太麻烦了，而且每次修改也不止一个文件。最好的方式就是每次保存文件时自动格式化。比如VSCode已经内置了`Clang-Format`稍作配置即可实现，接下来介绍几种常见IDE如何配置`Clang-Format`。

#### VSCode
VSCode最常用，因为内置了`Clang-Format`也最容易配置。
- 安装`C/C++`插件，`Ctrl+Shift+X`打开应用商店，搜索`C/C++`找到下图插件，安装后会自动安装`Clang-Format`程序，无需单独下载。默认安装路径为:
`C:\Users\(你的用户名)\.vscode\extensions\ms-vscode.cpptools-1.7.1\LLVM\bin\clang-format.exe`。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012311818.png)
- 打开设置页面（左下角齿轮-设置），搜索`format`，勾选`Format On Save`，每次保存文件时自动格式化文档。下方的设置是决定每次格式化是整个文档，还是做过修改的内容。默认是`file`，对整个文档进行格式化。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012304766.png)
- 仍在设置页面搜索`Clang`，配置如下。`.clang-format`文件最后详解。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012321838.png)
- 效果图
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/202112012327867.gif)

#### QtCreator
- 安装`Beautifier`插件：帮助（`Help`）-关于插件（`About Plugins`）- `Beautifier`勾选，重启QtCreator。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211202183720.png)
- 工具（Tool）- `Beautifier`，配置如图。该配置，保存文档时自动格式化，并选择`Clang-Format`作为格式化工具。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211202184119.png)
配置`Clang-Format`程序路径，如果开头已经`apt install`安装过，这里会自动补全。
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211202184247.png)
- `Use predefined style`可以选择内置的一些代码风格，如`LLVM`，`Google`等。
- `Use customized style`使用自定义的一些代码风格。点击添加（`Add`）将配置文件粘贴进去即可，具体配置文件见最后。
- 别忘了点击`OK`保存。

#### Eclipse
- 安装`cppstyle`插件：Help - Eclipse Marketplace - 搜索`cppstyle`。
- 下载`cpplint`。
    可以去github上下载[cpplint的源码](https://github.com/google/styleguide)，下载完之后解压放到某个目录下。
- 在`Window` - `Preferences` - `C/C++` - `CppStyle`页面把`clang-format`的路径添加进去，然后把`cpplint`的目录指向刚才下载的`styleguide`目录下的`cpplint/cpplint.py`就可以了。勾选下面的`Enable cpplint`，`Run clang-format on file save`，然后点击`Apply and Close`保存修改并退出。如下图所示。
  ![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20211202190912.png)
- 此时再保存代码，将会出现如下错误，因为我们还未给当前项目编写配置文件`.clang-format`。将最后一章提到的配置文件放到当前项目的下即可，程序会自动搜索。
    ```bash
    Cannot find .clang-format or _clang-format configuration file under any level parent directories of path.
    Clang-format will default to Google style.
    ```


## 配置简介

上文多次提到了`.clang-format`配置文件，该文件决定了代码如何格式化，现在来介绍如何使用该文件。

### 导出`.clang-format`文件
如果重新编写一份配置文件，需要考虑的东西太多，`clang-format`内置了一些常见风格，我们可以根据已有的配置文件稍作修改，形成自己的代码风格。所以我们先导出一份内置的配置文件。
```bash
clang-format -style=可选格式名 -dump-config > .clang-format
# 可选格式最好写预设那那几个写最接近你想要的格式. 比如我想要接近google C++ style的。 我就写-style=google
```

### 各个选项的含义

这里给出了配置的含义，感兴趣也可以查看官方文档，还提供了一些有案例，描述更清晰。

一些比较明显的代码分格区别
```
# 括号是分行，还是不分行，只有当BreakBeforeBraces设置为Custom时才有效
BraceWrapping:
  AfterCaseLabel:  true
  # class定义后面
  AfterClass:      true
  # 控制语句后面
  AfterControlStatement: true
  AfterEnum:       true
  AfterFunction:   true
  AfterNamespace:  true
  AfterObjCDeclaration: true
  AfterStruct:     true
  AfterUnion:      true
  AfterExternBlock: true
  BeforeCatch:     true
  BeforeElse:      true
  # 缩进大括号
  IndentBraces:    false
  SplitEmptyFunction: true
  SplitEmptyRecord: true
  SplitEmptyNamespace: true
BreakBeforeBinaryOperators: None
BreakBeforeBraces: Custom

# tab宽度
TabWidth:	4

# 换行缩进字符数
IndentWidth:     4
```
```
---
# 语言: None, Cpp, Java, JavaScript, ObjC, Proto, TableGen, TextProto
Language:	Cpp
# BasedOnStyle:	LLVM
# 访问说明符(public、private等)的偏移
AccessModifierOffset:	-4
# 开括号(开圆括号、开尖括号、开方括号)后的对齐: Align, DontAlign, AlwaysBreak(总是在开括号后换行)
AlignAfterOpenBracket:	Align
# 连续赋值时，对齐所有等号
AlignConsecutiveAssignments:	true
# 连续声明时，对齐所有声明的变量名
AlignConsecutiveDeclarations:	true
# 左对齐逃脱换行(使用反斜杠换行)的反斜杠
AlignEscapedNewlinesLeft:	true
# 水平对齐二元和三元表达式的操作数
AlignOperands:	true
# 对齐连续的尾随的注释
AlignTrailingComments:	true
# 允许函数声明的所有参数在放在下一行
AllowAllParametersOfDeclarationOnNextLine:	true
# 允许短的块放在同一行
AllowShortBlocksOnASingleLine:	false
# 允许短的case标签放在同一行
AllowShortCaseLabelsOnASingleLine:	false
# 允许短的函数放在同一行: None, InlineOnly(定义在类中), Empty(空函数), Inline(定义在类中，空函数), All
AllowShortFunctionsOnASingleLine:	Empty
# 允许短的if语句保持在同一行
AllowShortIfStatementsOnASingleLine:	false
# 允许短的循环保持在同一行
AllowShortLoopsOnASingleLine:	false
# 总是在定义返回类型后换行(deprecated)
AlwaysBreakAfterDefinitionReturnType:	None
# 总是在返回类型后换行: None, All, TopLevel(顶级函数，不包括在类中的函数), 
#   AllDefinitions(所有的定义，不包括声明), TopLevelDefinitions(所有的顶级函数的定义)
AlwaysBreakAfterReturnType:	None
# 总是在多行string字面量前换行
AlwaysBreakBeforeMultilineStrings:	false
# 总是在template声明后换行
AlwaysBreakTemplateDeclarations:	false
# false表示函数实参要么都在同一行，要么都各自一行
BinPackArguments:	true
# false表示所有形参要么都在同一行，要么都各自一行
BinPackParameters:	true
# 大括号换行，只有当BreakBeforeBraces设置为Custom时才有效
BraceWrapping:   
  # class定义后面
  AfterClass:	false
  # 控制语句后面
  AfterControlStatement:	false
  # enum定义后面
  AfterEnum:	false
  # 函数定义后面
  AfterFunction:	false
  # 命名空间定义后面
  AfterNamespace:	false
  # ObjC定义后面
  AfterObjCDeclaration:	false
  # struct定义后面
  AfterStruct:	false
  # union定义后面
  AfterUnion:	false
  # catch之前
  BeforeCatch:	true
  # else之前
  BeforeElse:	true
  # 缩进大括号
  IndentBraces:	false
# 在二元运算符前换行: None(在操作符后换行), NonAssignment(在非赋值的操作符前换行), All(在操作符前换行)
BreakBeforeBinaryOperators:	NonAssignment
# 在大括号前换行: Attach(始终将大括号附加到周围的上下文), Linux(除函数、命名空间和类定义，与Attach类似), 
#   Mozilla(除枚举、函数、记录定义，与Attach类似), Stroustrup(除函数定义、catch、else，与Attach类似), 
#   Allman(总是在大括号前换行), GNU(总是在大括号前换行，并对于控制语句的大括号增加额外的缩进), WebKit(在函数前换行), Custom
#   注：这里认为语句块也属于函数
BreakBeforeBraces:	Custom
# 在三元运算符前换行
BreakBeforeTernaryOperators:	true
# 在构造函数的初始化列表的逗号前换行
BreakConstructorInitializersBeforeComma:	false
# 每行字符的限制，0表示没有限制
ColumnLimit:	200
# 描述具有特殊意义的注释的正则表达式，它不应该被分割为多行或以其它方式改变
CommentPragmas:	'^ IWYU pragma:'
# 构造函数的初始化列表要么都在同一行，要么都各自一行
ConstructorInitializerAllOnOneLineOrOnePerLine:	false
# 构造函数的初始化列表的缩进宽度
ConstructorInitializerIndentWidth:	4
# 延续的行的缩进宽度
ContinuationIndentWidth:	4
# 去除C++11的列表初始化的大括号{后和}前的空格
Cpp11BracedListStyle:	false
# 继承最常用的指针和引用的对齐方式
DerivePointerAlignment:	false
# 关闭格式化
DisableFormat:	false
# 自动检测函数的调用和定义是否被格式为每行一个参数(Experimental)
ExperimentalAutoDetectBinPacking:	false
# 需要被解读为foreach循环而不是函数调用的宏
ForEachMacros:	[ foreach, Q_FOREACH, BOOST_FOREACH ]
# 对#include进行排序，匹配了某正则表达式的#include拥有对应的优先级，匹配不到的则默认优先级为INT_MAX(优先级越小排序越靠前)，
#   可以定义负数优先级从而保证某些#include永远在最前面
IncludeCategories: 
  - Regex:	'^"(llvm|llvm-c|clang|clang-c)/'
    Priority:	2
  - Regex:	'^(<|"(gtest|isl|json)/)'
    Priority:	3
  - Regex:	'.*'
    Priority:	1
# 缩进case标签
IndentCaseLabels:	false
# 缩进宽度
IndentWidth:	4
# 函数返回类型换行时，缩进函数声明或函数定义的函数名
IndentWrappedFunctionNames:	false
# 保留在块开始处的空行
KeepEmptyLinesAtTheStartOfBlocks:	true
# 开始一个块的宏的正则表达式
MacroBlockBegin:	''
# 结束一个块的宏的正则表达式
MacroBlockEnd:	''
# 连续空行的最大数量
MaxEmptyLinesToKeep:	1
# 命名空间的缩进: None, Inner(缩进嵌套的命名空间中的内容), All
NamespaceIndentation:	Inner
# 使用ObjC块时缩进宽度
ObjCBlockIndentWidth:	4
# 在ObjC的@property后添加一个空格
ObjCSpaceAfterProperty:	false
# 在ObjC的protocol列表前添加一个空格
ObjCSpaceBeforeProtocolList:	true
# 在call(后对函数调用换行的penalty
PenaltyBreakBeforeFirstCallParameter:	19
# 在一个注释中引入换行的penalty
PenaltyBreakComment:	300
# 第一次在<<前换行的penalty
PenaltyBreakFirstLessLess:	120
# 在一个字符串字面量中引入换行的penalty
PenaltyBreakString:	1000
# 对于每个在行字符数限制之外的字符的penalty
PenaltyExcessCharacter:	1000000
# 将函数的返回类型放到它自己的行的penalty
PenaltyReturnTypeOnItsOwnLine:	60
# 指针和引用的对齐: Left, Right, Middle
PointerAlignment:	Left
# 允许重新排版注释
ReflowComments:	true
# 允许排序#include
SortIncludes:	true
# 在C风格类型转换后添加空格
SpaceAfterCStyleCast:	false
# 在赋值运算符之前添加空格
SpaceBeforeAssignmentOperators:	true
# 开圆括号之前添加一个空格: Never, ControlStatements, Always
SpaceBeforeParens:	ControlStatements
# 在空的圆括号中添加空格
SpaceInEmptyParentheses:	false
# 在尾随的评论前添加的空格数(只适用于//)
SpacesBeforeTrailingComments:	2
# 在尖括号的<后和>前添加空格
SpacesInAngles:	true
# 在容器(ObjC和JavaScript的数组和字典等)字面量中添加空格
SpacesInContainerLiterals:	true
# 在C风格类型转换的括号中添加空格
SpacesInCStyleCastParentheses:	true
# 在圆括号的(后和)前添加空格
SpacesInParentheses:	true
# 在方括号的[后和]前添加空格，lamda表达式和未指明大小的数组的声明不受影响
SpacesInSquareBrackets:	true
# 标准: Cpp03, Cpp11, Auto
Standard:	Cpp11
# tab宽度
TabWidth:	4
# 使用tab字符: Never, ForIndentation, ForContinuationAndIndentation, Always
UseTab:	Never
...
```

### 格式化最新的commit代码
`clang-format`还提供一个`clang-format-diff.py`脚本，用来格式化`patch`，`code review`提交代码前，跑一遍下面的代码。

```bash
// 格式化最新的commit，并直接在原文件上修改
git diff -U0 HEAD^ | clang-format-diff.py -i -p1
```