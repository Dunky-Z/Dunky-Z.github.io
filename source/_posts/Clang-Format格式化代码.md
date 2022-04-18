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
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112012311818.png)
- 打开设置页面（左下角齿轮-设置），搜索`format`，勾选`Format On Save`，每次保存文件时自动格式化文档。下方的设置是决定每次格式化是整个文档，还是做过修改的内容。默认是`file`，对整个文档进行格式化。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112012304766.png)
- 仍在设置页面搜索`Clang`，配置如下。`.clang-format`文件最后详解。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112012321838.png)
- 效果图
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112012327867.gif)

#### QtCreator
- 安装`Beautifier`插件：帮助（`Help`）-关于插件（`About Plugins`）- `Beautifier`勾选，重启QtCreator。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211202183720.png)
- 工具（Tool）- `Beautifier`，配置如图。该配置，保存文档时自动格式化，并选择`Clang-Format`作为格式化工具。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211202184119.png)
配置`Clang-Format`程序路径，如果开头已经`apt install`安装过，这里会自动补全。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211202184247.png)
- `Use predefined style`可以选择内置的一些代码风格，如`LLVM`，`Google`等。
- `Use customized style`使用自定义的一些代码风格。点击添加（`Add`）将配置文件粘贴进去即可，具体配置文件见最后。
- 别忘了点击`OK`保存。

#### Eclipse
- 安装`cppstyle`插件：Help - Eclipse Marketplace - 搜索`cppstyle`。
- 下载`cpplint`。
    可以去github上下载[cpplint的源码](https://github.com/google/styleguide)，下载完之后解压放到某个目录下。
- 在`Window` - `Preferences` - `C/C++` - `CppStyle`页面把`clang-format`的路径添加进去，然后把`cpplint`的目录指向刚才下载的`styleguide`目录下的`cpplint/cpplint.py`就可以了。勾选下面的`Enable cpplint`，`Run clang-format on file save`，然后点击`Apply and Close`保存修改并退出。如下图所示。
  ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20211202190912.png)
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

# 宏定义对齐
AlignConsecutiveMacros: AcrossEmptyLinesAndComments
```

基于LLVM代码风格修改的个人使用版本，使用时需要删除中文：
```
---
Language:        Cpp
# BasedOnStyle:  LLVM
AccessModifierOffset: -2
AlignAfterOpenBracket: Align
# 宏定义对齐
AlignConsecutiveMacros: AcrossEmptyLinesAndComments
AlignConsecutiveAssignments: true
AlignConsecutiveDeclarations: true
AlignConsecutiveBitFields: true
AlignEscapedNewlines: Right
AlignOperands:   true
AlignTrailingComments: true
AllowAllArgumentsOnNextLine: true
AllowAllConstructorInitializersOnNextLine: true
AllowAllParametersOfDeclarationOnNextLine: true
AllowShortBlocksOnASingleLine: Never
AllowShortCaseLabelsOnASingleLine: false
# 是否允许短方法单行，只有一行的函数将不会分行，直接写在函数名后
AllowShortFunctionsOnASingleLine: false
AllowShortLambdasOnASingleLine: All
AllowShortIfStatementsOnASingleLine: Never
AllowShortLoopsOnASingleLine: false
AlwaysBreakAfterDefinitionReturnType: None
AlwaysBreakAfterReturnType: None
AlwaysBreakBeforeMultilineStrings: false
AlwaysBreakTemplateDeclarations: MultiLine
BinPackArguments: true
BinPackParameters: true
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
  AfterExternBlock: false
  BeforeCatch:     true
  BeforeElse:      true
  # 缩进大括号
  IndentBraces:    false
  SplitEmptyFunction: true
  SplitEmptyRecord: true
  SplitEmptyNamespace: true
BreakBeforeBinaryOperators: None
BreakBeforeBraces: Custom
BreakBeforeInheritanceComma: false
BreakInheritanceList: BeforeColon
BreakBeforeTernaryOperators: true
BreakConstructorInitializersBeforeComma: false
BreakConstructorInitializers: BeforeColon
BreakAfterJavaFieldAnnotations: false
BreakStringLiterals: true
ColumnLimit:     100
CommentPragmas:  '^ IWYU pragma:'
CompactNamespaces: false
ConstructorInitializerAllOnOneLineOrOnePerLine: false
ConstructorInitializerIndentWidth: 4
ContinuationIndentWidth: 4
Cpp11BracedListStyle: true
DeriveLineEnding: true
DerivePointerAlignment: false
DisableFormat:   false
ExperimentalAutoDetectBinPacking: false
FixNamespaceComments: true
ForEachMacros:
  - foreach
  - Q_FOREACH
  - BOOST_FOREACH
IncludeBlocks:   Preserve
IncludeCategories:
  - Regex:           '^"(llvm|llvm-c|clang|clang-c)/'
    Priority:        2
    SortPriority:    0
  - Regex:           '^(<|"(gtest|gmock|isl|json)/)'
    Priority:        3
    SortPriority:    0
  - Regex:           '.*'
    Priority:        1
    SortPriority:    0
IncludeIsMainRegex: '(Test)?$'
IncludeIsMainSourceRegex: ''
IndentCaseLabels: false
IndentGotoLabels: true
IndentPPDirectives: None
# 换行缩进字符数
IndentWidth:     4
IndentWrappedFunctionNames: false
JavaScriptQuotes: Leave
JavaScriptWrapImports: true
KeepEmptyLinesAtTheStartOfBlocks: true
MacroBlockBegin: ''
MacroBlockEnd:   ''
MaxEmptyLinesToKeep: 1
NamespaceIndentation: None
ObjCBinPackProtocolList: Auto
ObjCBlockIndentWidth: 0
ObjCSpaceAfterProperty: false
ObjCSpaceBeforeProtocolList: true
PenaltyBreakAssignment: 2
PenaltyBreakBeforeFirstCallParameter: 19
PenaltyBreakComment: 300
PenaltyBreakFirstLessLess: 120
PenaltyBreakString: 1000
PenaltyBreakTemplateDeclaration: 10
PenaltyExcessCharacter: 1000000
PenaltyReturnTypeOnItsOwnLine: 60
PointerAlignment: Right
ReflowComments:  true
SortIncludes:    true
SortUsingDeclarations: true
SpaceAfterCStyleCast: false
SpaceAfterLogicalNot: false
SpaceAfterTemplateKeyword: true
SpaceBeforeAssignmentOperators: true
SpaceBeforeCpp11BracedList: false
SpaceBeforeCtorInitializerColon: true
SpaceBeforeInheritanceColon: true
SpaceBeforeParens: ControlStatements
SpaceBeforeRangeBasedForLoopColon: true
SpaceInEmptyBlock: false
SpaceInEmptyParentheses: false
SpacesBeforeTrailingComments: 1
SpacesInAngles:  false
SpacesInConditionalStatement: false
SpacesInContainerLiterals: true
SpacesInCStyleCastParentheses: false
SpacesInParentheses: false
SpacesInSquareBrackets: false
SpaceBeforeSquareBrackets: false
Standard:        Latest
StatementMacros:
  - Q_UNUSED
  - QT_REQUIRE_VERSION
TabWidth:        8
UseCRLF:         false
UseTab:          Never
...

```

### 格式化最新的commit代码
`clang-format`还提供一个`clang-format-diff.py`脚本，用来格式化`patch`，`code review`提交代码前，跑一遍下面的代码。

```bash
// 格式化最新的commit，并直接在原文件上修改
git diff -U0 HEAD^ | clang-format-diff.py -i -p1
```


### 常见问题
#### 如何看懂官方文档并编写配置文件
[官方文档](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)里有各种设置的示例代码，即使不知道想要的格式化是哪个配置参数，翻一翻官方文档是示例大概率能找到。那么找到了想要的配置参数，如何在文件里配置呢？

以宏定义对齐为例。我们想要宏定义的值保持对齐的状态，如下一节图片所示。可以翻一遍官方文档，可以发现这个示例代码对应的参数可能是我们想要的，`AlignConsecutiveMacros `翻译为**对齐连续的宏定义**。那应该八九不离十了。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112202021134.png)

找到了参数如何编写配置文件呢？可以继续看这个参数下面的更多示例，每一个示例都对应一个配置可能值`Possible values`。

- `ACS_None` (in configuration: `None`)
Do not align macro definitions on consecutive lines.
`ACS_None`为这个配置的缩写，`None`表示在配置文件里的值。该配置表示不对宏定义进行对齐操作，在配置文件里可以添加如下：
  ```
  AlignConsecutiveMacros: None
  ```

- `ACS_Consecutive` (in configuration: `Consecutive`)
Align macro definitions on consecutive lines. This will result in formattings like:
  ```
  #define SHORT_NAME       42
  #define LONGER_NAME      0x007f
  #define EVEN_LONGER_NAME (2)

  #define foo(x) (x * x)
  /* some comment */
  #define bar(y, z) (y + z)
  ```
  `ACS_Consecutive`为这个配置的缩写，`Consecutive`表示在配置文件里的值。该配置表示对连续的宏定义进行对齐，在配置文件里可以添加如下：
  ```
  AlignConsecutiveMacros: Consecutive
  ```

#### 宏定义对齐失效
```
# 宏定义对齐
AlignConsecutiveMacros: AcrossEmptyLinesAndComments
```
使用宏定义对齐更详细的配置，可以[参考官方文档](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)。使用该配置一定要使用等宽的字体，否则配置生效但是显示不正确。
比如我是用**微软雅黑**字体作为编码字体，因为该字体每个字符不等宽，导致格式化正确，但是显示不正确。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112201954096.png)

如果将字体换位等宽字体如常用的**Consolas**，就可以正常显示。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202112201958869.png)
