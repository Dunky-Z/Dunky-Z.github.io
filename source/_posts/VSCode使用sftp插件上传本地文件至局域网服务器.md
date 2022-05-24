---
title: VSCode使用sftp插件上传本地文件至局域网服务器
date: 2021-12-24 11:39:03
updated: 2022-02-24 11:39:03
tags: [VSCode,Linux]
categories: [万能VSCode]
---

测试代码时经常需要上传文件至服务器端运行，每次上传都需要通过第三方传输工具如FileZilla，有了`SFTP`插件，可以直接在VSCode上编译成功后，一键上传本地文件。

## 安装插件
打开插件中心，搜索`sftp`，安装量最高的就是我们需要的插件，点击安装。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220104114810.png)

## 配置插件

插件安装完成后，输入快捷键`Control + Shift + P` 弹出命令面板，然后输入`sftp:config`，回车，当前工程的`.vscode`文件夹下就会自动生成一个`sftp.json`文件，我们需要在这个文件里配置的内容可以是：

```json
{
  "host": "192.168.xxx.xxx", //服务器ip
  "port": 22,               //端口，sftp模式是22
  "username": "",           //用户名
  "password": "",           //密码
  "protocol": "ftp",       //模式，sfpt 或者 ftp
  "agent": null,
  "privateKeyPath": null,   //存放在本地的已配置好的用于登录工作站的密钥文件（也可以是 ppk 文件）
  "passphrase": null,
  "passive": false,
  "interactiveAuth": false,
  "remotePath": "/root/node/build/", //服务器上的文件地址
  "context": "./server/build",      //本地的文件地址
  "uploadOnSave": true,             //监听保存并上传
  "syncMode": "update",
  "watcher": {
    //监听外部文件
    "files": false,                 //外部文件的绝对路径
    "autoUpload": false,
    "autoDelete": false
  },
  "ignore": [
    //指定在使用 sftp: sync to remote 的时候忽略的文件及文件夹
    //注意每一行后面有逗号，最后一行没有逗号
    //忽略项
    "**/.vscode/**",
    "**/.git/**",
    "**/.DS_Store"
  ]
}
```

## 插件使用

- 可以直接右击文件，选择`Upload`，会将文件上传至配置好的`remotePath`。
- 可以`Control + Shift + P`输入`sftp`，选择想要执行的命令，命令都是字面意思，不多做解释。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20220104115716.png)

- 如果有多个IP需要配置，可以在`sftp.json`文件中，通过方括号`[]`添加。比如
    ```json
    [
        {
        "host": "192.168.xxx.01", //服务器ip
        "port": 22,               //端口，sftp模式是22
        "username": "",           //用户名
        "password": "",           //密码
        "protocol": "sftp",       //模式，sfpt 或者 ftp
        "agent": null,
        },
        {
        "host": "192.168.xxx.02", //服务器ip
        "port": 22,               //端口，sftp模式是22
        "username": "",           //用户名
        "password": "",           //密码
        "protocol": "sftp",       //模式，sfpt 或者 ftp
        "agent": null,
        },
        {
        "host": "192.168.xxx.03", //服务器ip
        "port": 22,               //端口，sftp模式是22
        "username": "",           //用户名
        "password": "",           //密码
        "protocol": "sftp",       //模式，sfpt 或者 ftp
        "agent": null,
        }
    ]
    ```