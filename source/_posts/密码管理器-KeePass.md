---
title: 密码管理器-KeePass
date: 2022-07-09 19:11:40
updated:
tags:
categories: [工欲善其事必先利其器]
---

## **KeePass安装**

**下载与安装**

官网： [https://keepass.info/download.html](https://keepass.info/download.html)

下载完成后进行安装，默认安装位置是：**C:\Program Files (x86)\KeePass Password Safe 2 **文件夹下，可以根据自己需要选择安装路径。

**更改中文语言**

中文语言包： [KeePass-Chinese_Simplified](https://www.keepass.com.cn/language#:~:text=%E5%9C%A8keepass%E4%B8%AD%EF%BC%8C%E5%8D%95%E5%87%BB,%E9%87%8D%E6%96%B0%E5%90%AF%E5%8A%A8Keepass%E3%80%82)


将语言包下载后复制到安装路径下的**Languages**文件夹下，默认为：**C:\Program Files (x86)\KeePass Password Safe 2\Languages。****重启软件****。**

点击 **View**->**Change Language**. 选择中文简体（Chinese-Simplified）。**重启软件**，即可完成语言更改。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091913508.png)

中文界面：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091913034.png)

## **基本使用**

1.创建一个数据库

点击 文件-》新建。弹出对话框为数据库创建管理密码。这个密码是唯一需要记忆的密码。当然如果追求更高的安全性，可以点击**显示高级选项**，提供更多的密码选项。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091913919.png)

2.添加记录

点击添加记录，在弹出的窗口填入相关信息。即可完成密码添加。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091914888.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091914656.png)

如果是第一次使用的网站，第一次注册密码。可以通过密码生成器，生成一个高强度的密码来添加记录。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091914597.png)

3.创建一个密码生成模板

正常国内的网站可以使用的密码长度6-16位，可以使用大小写，数字，下划线。我们把这些选项勾选，密码长度设置16位。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091915434.png)

点击保存并给模板设置个名字方便下次使用

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091915338.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091915241.png)

如果保存后想更改一下，比如再加个可以使用空格，可以重新勾选刚刚的选项，保存时点击小三角，选择刚刚保存的方案就可以覆盖。

**导入Chrome已保存的密码**

很多小伙伴在使用KeePass之前肯定在Chrome等浏览器里也保存了很多密码。想将其导入KeePass方便管理。Chrome是可以导出密码的，KeePass也可以导入密码。

点击浏览器右上角，打开设置界面。找到**密码**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091915807.png)

找到已保存的密码-》导出密码。选择方便找到的路径，保存密码记录。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091915014.png)

打开KeePass，点击文件-》导入，选择Chrome浏览器的格式。点击文件夹图标找到刚刚导出的密码文件。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091916436.png)

## 高级配置

### **KeePass搭配坚果云实现云同步**

[登录坚果云](https://www.jianguoyun.com/)创建个人同步文件夹，若没有先注册。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091916293.png)

最好单独建一个专门的文件夹

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091916684.png)

将已经生成的数据库上传到这个文件夹下

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091916021.png)

点击右上角进入**账户信息，**点击**安全选项：**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091916935.png)

点击添加应用

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091917760.png)

输入应用名称，应用名称只是方便区分作用，所以和要同步的应用名称一致就好：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091917877.png)

点击**生成密码**：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091917649.png)

此时云盘端配置完成，切回到KeePass进行客户端配置。点击**文件**-》**同步**-》**与网址（URL）同步**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091917478.png)

**网址：** [https://dav.jianguoyun.com/dav/](https://dav.jianguoyun.com/dav/)**KeePass**/**keepassData.kdbx **

**注意：红色部分是个人同步文件夹的名称，绿色部分是上传的数据库全称，一定别忘了后缀**

**用户名：**你的坚果云登录名（邮箱或者手机号）

**密码**：生成应用的密码，（**不是登录坚果云的密码**）

点击确定，此时已经可以完成同步，但是每次同步仍然需要手动确定。参考了[什么值得买上小乐CSN](https://post.smzdm.com/p/660417/)的方法，通过触发器实现自动同步。

触发器代码：

```text
<?xml version="1.0" encoding="utf-8"?>
<TriggerCollection xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Triggers>
                <Trigger>
                        <Guid>L2euC7Mr/EKh7nPjueuZvQ==</Guid>
                        <Name>SaveSync</Name>
                        <Events>
                                <Event>
                                        <TypeGuid>s6j9/ngTSmqcXdW6hDqbjg==</TypeGuid>
                                        <Parameters>
                                                <Parameter>1</Parameter>
                                                <Parameter>kdbx</Parameter>
                                        </Parameters>
                                </Event>
                        </Events>
                        <Conditions />
                        <Actions>
                                <Action>
                                        <TypeGuid>tkamn96US7mbrjykfswQ6g==</TypeGuid>
                                        <Parameters>
                                                <Parameter>SaveSync</Parameter>
                                                <Parameter>0</Parameter>
                                        </Parameters>
                                </Action>
                                <Action>
                                        <TypeGuid>Iq135Bd4Tu2ZtFcdArOtTQ==</TypeGuid>
                                        <Parameters>
                                                <Parameter>https://dav.jianguoyun.com/dav/keePass/passwordSync.kdbx</Parameter>
                                                <Parameter>123456</Parameter>
                                                <Parameter>123456</Parameter>
                                        </Parameters>
                                </Action>
                                <Action>
                                        <TypeGuid>tkamn96US7mbrjykfswQ6g==</TypeGuid>
                                        <Parameters>
                                                <Parameter>SaveSync</Parameter>
                                                <Parameter>1</Parameter>
                                        </Parameters>
                                </Action>
                        </Actions>
                </Trigger>
        </Triggers>
</TriggerCollection>
```

复制触发器代码，点击**工具**-》**触发器**，点击**工具**-》**从剪切板粘贴触发器**：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091918521.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091918858.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091918743.png)

导入成功后，在触发器页面会多一个触发器：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091918790.png)

双击打开**SaveSync**,打开最后一个**动作**窗口：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091918061.png)

双击中间的条目：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091919250.png)

将信息换成同步云盘的信息：

**文件/网址：** [https://dav.jianguoyun.com/dav/](https://dav.jianguoyun.com/dav/)**KeePass**/**keepassData.kdbx **

**注意：红色部分是个人同步文件夹的名称，绿色部分是上传的数据库全称，一定别忘了后缀**

**IO 连接-用户名：**你的坚果云登录名（邮箱或者手机号）

**IO 连接-密码**：生成应用的密码，（**不是登录坚果云的密码**）

点击确定，回到主页面，点击**工具**-》**选项**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091919251.png)

找到 **高级**，向下翻，在**文件输入/输出连接** 栏目里找到 **写入数据库时使用文件交换** 此项不勾选

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091919398.png)

点击确定，返回主页面。此时点击保存按钮或者Ctrl+S。即可与云盘进行同步。

### **Chrome上使用插件实现密码自动填充与同步**

在KeePass客户端安装[KeePassRPC插件](https://github.com/kee-org/keepassrpc/releases)：



将其放入安装目录（.\KeePass\Plugins）文件夹下，退出软件，重启即可自动安装。

在浏览器客户端安装[浏览器插件](https://chrome.google.com/webstore/detail/kee-password-manager/mmhlniccooihdimnnjhamobppdhaolme)Kee,若无法科学上网，可能需要自行百度搜索Kee插件

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091919168.png)

安装完成后会跳出窗口提示授权，将KeePass客户端跳出的窗口中的红色授权码填入即可连接浏览器：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091920270.png)

使用Kee

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091920016.png)

再次使用浏览器填写密码是可以看到文本框会有logo，Kee会自动填写已保存的密码。如果第一次登陆，在登录后可以点击浏览器插件图标，找到Save latest login，保存刚刚输入的密码。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091920687.png)

密码管理器的重要作用之一就是生成高强度密码，可以用KeePass客户端来生成，也可以是Kee这个插件的一个生成密码功能生成。英文版的是**Generate new password**

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202207091920769.png)