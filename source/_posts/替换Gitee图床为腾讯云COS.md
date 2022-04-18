---
title: 替换Gitee图床为腾讯云COS
date: 2022-04-09 16:43:08
updated:
tags:
categories:
---

[Gitee图床挂了](https://cloud.tencent.com/developer/article/1964208)，但是各大云服务厂商提供的对象存储服务免费额度，对于个人小博客来说也够用了。下面介绍如何将图床更换为腾讯云COS。


## 下载原有图片

从`gitee`下载整个仓库。保持原有目录结构。

## 配置腾讯云COS

注册腾讯云账号，创建 COS 存储桶，选择公有读私有写。创建 COS 存储桶地址：https://console.cloud.tencent.com/cos ，创建存储桶后可以在存储桶里打开防盗链设置。

创建桶--选择地域--填写名称--选择公有读私有写--点击创建。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091731554.png)

如果忘了设置读写权限可以按一下方法设置；
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091727355.png)

选择**菜单**--**文件列表**。上传下载好的文件夹（整个仓库的文件夹）。鼠标放到**选择文件**出现**上传文件夹选项**，或者将文件夹**拖入浏览器**。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091727353.png)

## 配置Picgo

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091727351.png)

**COS版本**：V5
**设定Secreid，设定Secrekey，设定APPID：** APPID、SecretID与SecretKey [点此直达获取](https://console.cloud.tencent.com/cam/capi)。
选择继续使用--创建秘钥。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/202204091715578.png)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091727352.png)

**设定存储空间名，设定存储区域：** [点此获取存储空间名以及存储区域](https://console.cloud.tencent.com/cos/bucket)。桶名称即存储空间名，所属区域：`ap-shanghai`即确认存储区域。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091727354.png)

**指定存储区域：**
指定上传到COS的目录，比如我原先从`gitee`下载来的图床的仓库名是`markdown_picbed`，图片又保存在`markdown_picbed/img`目录下，那么就指定`markdown_picbed/img`目录。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091722487.png)

## 替换旧图床URL

VSCode全局替换：

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/202204091753809.png)