---
title: 解决一台电脑配置两个GIT账户
date: 2021-10-30 11:14:27
tags: [Git]
---
公司的也在用git，但是账号和地址肯定都不同，需要配置两个不同的提交环境。

## 生成两个Key

### 生成第一个Key

如果电脑上已经在用Git了就无需重新生成key，用当前的就可以。key保存在`~/.ssh`文件夹内。

如果第一次使用，就使用以下命令重新生成：

```bash
➜  .ssh ssh-keygen -t rsa -C home_pc
Generating public/private rsa key pair.
Enter file in which to save the key (/home/dominic/.ssh/id_rsa): id_rsa_pc

```

`home_pc`就是个备注名，假设我们这个key是平时捣腾GitHub玩，用来和GitHub同步用的，`id_rsa_pc`是生成的文件名，打开`id_rsa_pc.pub`可以看到生成的key最后就是备注名（如下）。

```PowerShell
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABR/Fyj7Pz+e+/////////////////ZbdPGtHB86fLQYh/uR+TKcCERedrDKzGPdVt8= home_pc
```



### 配置Github SSH

路径为：

```PowerShell
Github-头像-settings-SSH and GPG keys-New SSH key
```



### 测试连通

```bash
ssh -T git@github.com
```



### 生成第二Key

这个key就打算用来和公司代码同步用，所以备注名换成了`work_ubuntu`，文件名也换成了`id_rsa_work`。

```bash
➜  .ssh ssh-keygen -t rsa -C work_ubuntu
Generating public/private rsa key pair.
Enter file in which to save the key (/home/dominic/.ssh/id_rsa): id_rsa_work

```

### 配置公司 SSH

和GitHub类似，根据自己公司使用的平台设置。



## 配置本地账户

因为本地的代码仓库可能是从GitHub下载的，也有从公司仓库下载的。那么提交代码时就需要为仓库配置指定的用户名和邮箱。以前只有一个GitHub，所以配置时使用的是`-global`参数，任何一个仓库都是配置的相同的用户名与邮箱，而现在需要区分。



### 取消全局配置

```bash
 # 取消全局 用户名/邮箱 配置
git config --global --unset user.name
git config --global --unset user.email


```



### 单独配置代码仓

进入项目目录，有`.git`目录的那一级。

```bash
# 单独设置每个repo 用户名/邮箱
git config user.email “xxxx@xx.com”
git config user.name “xxxx”
```

