---
title: VSCode设置终端为Gitbash
date: 2022-05-24 14:42:48
updated:
tags: [VSCode,Git,Gitbash]
categories: [万能VSCode]
---

## 设置终端为Gitbash
用惯了Linux终端的命令，Windows的shell真的太不顺手了，但是Gitbash很多命令相似，可以将默认的shell换成Gitbash。

打开`settings.json`配置文件，添加如下

```JSON
    "terminal.integrated.profiles.windows": {
        "PowerShell -NoProfile": {
          "source": "PowerShell",
          "args": [
            "-NoProfile"
          ]
        },
        "Git-Bash": {
          "path": "D:\\Software\\Git\\bin\\bash.exe", //bin路径下的bash，不是git-bash.exe。否则会打开外部窗口
          "args": []
        }
      },
    "terminal.integrated.defaultProfile.windows": "Git-Bash",
```

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204301517302.png)

## 修改终端配色

打开[Base16 Terminal Colors for Visual Studio Code](https://glitchbone.github.io/vscode-base16-term/#/)，选择一款配置复制

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204301515778.png)



打开VScode`settings.json`，替换如下

```JSON
 "workbench.colorCustomizations": {
        "terminal.background":"#1C2023",
        "terminal.foreground":"#C7CCD1",
        "terminalCursor.background":"#C7CCD1",
        "terminalCursor.foreground":"#C7CCD1",
        "terminal.ansiBlack":"#1C2023",
        "terminal.ansiBlue":"#AE95C7",
        "terminal.ansiBrightBlack":"#747C84",
        "terminal.ansiBrightBlue":"#AE95C7",
        "terminal.ansiBrightCyan":"#95AEC7",
        "terminal.ansiBrightGreen":"#95C7AE",
        "terminal.ansiBrightMagenta":"#C795AE",
        "terminal.ansiBrightRed":"#C7AE95",
        "terminal.ansiBrightWhite":"#F3F4F5",
        "terminal.ansiBrightYellow":"#AEC795",
        "terminal.ansiCyan":"#95AEC7",
        "terminal.ansiGreen":"#95C7AE",
        "terminal.ansiMagenta":"#C795AE",
        "terminal.ansiRed":"#C7AE95",
        "terminal.ansiWhite":"#C7CCD1",
        "terminal.ansiYellow":"#AEC795"
    },
```

修改后效果

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204301517302.png)

## 修改终端字体

方法一：打开VScode`settings.json`，加上下面这个配置，字体改成自己电脑上的字体

```JSON
    "terminal.integrated.fontFamily": "JetBrains Mono",

```

方法二：打开设置页面，搜索`terminal font` 

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220524142319.png)

修改后的效果

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220524142612.png)

## 解决中文乱码

```
git config --global core.quotepath false
```
 