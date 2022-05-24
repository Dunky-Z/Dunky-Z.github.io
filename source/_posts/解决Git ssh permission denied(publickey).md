---
title: 解决ssh permission denied(publickey)
date: 2022-01-13 22:43:02
updated:
tags: [Git, Bug]
categories: [Bug踩坑记录]
---
## 保留现场

```Bash
linux> ssh -p 2221 xxx@gerrit.com
xxx@gerrit.com: Permission denied(publickey)
```

## 探究原因

本次出错是在测试是否能连接gerrit时。连接github也可能会出现。只要用到ssh功能的都有可能。

出错的原因：

- 网页（如gerrit,github）没有设置公钥，一般为`id_rsa.pub`内容；
- 本地生成了多个公私钥，配对配错了；
- 本地没有配置好`git`，比如`git config`时用户名或者邮箱填错；
- 需要开启ssh代理；

## 解决方法

- 生成密钥`cd ~/.ssh && ssh-keygen`
- 复制公钥内容，添加到网页中`github`或者`gerrit`的设置里。`cat id_rsa.pub | xclip`
- 配置`git`账户
    - `git config --global user.name "bob"`
    - `git config --global user.email bob@...`

    

以上检查无误，仍然报错

- 开启`ssh`代理
    - `eval $(ssh-agent -s)`
- 将私钥加入代理
    - `ssh-add ~/.ssh/id_rsa`

## 登陆用户时启动 ssh-agent

如果不幸你的问题就是需要开启`ssh-agent`，那么每次重启电脑都需要开启一次。这也是相当麻烦的，可以通过将以下配置添加到`~/.bashrc`中，让linux启动时自动开启`ssh-agent`。

```Bash
# Add following code at the end of ~/.bashrc

# Check if ~/.pid_ssh_agent exists.
if [ -f ~/.pid_ssh_agent ]; then

    source ~/.pid_ssh_agent

    # Check process of ssh-agent still exists.
    TEST=$(ssh-add -l)

    if [ -z "$TEST" ]; then # Reinit if not.
        NEED_INIT=1
    fi
else
    NEED_INIT=1 # PID file doesm't exist, reinit it.
fi

# Try start ssh-agent.
if [ ! -z "$NEED_INIT" ]; then
    echo $(ssh-agent -s) | sed -e 's/echo[ A-Za-z0-9]*;//g' > ~/.pid_ssh_agent # save the PID to file.
    source ~/.pid_ssh_agent
fi
```

## 参考

[ssh - Git: How to solve Permission denied (publickey) error when using Git? - Stack Overflow](https://stackoverflow.com/questions/2643502/git-how-to-solve-permission-denied-publickey-error-when-using-git)

[Linux 登陆用户时启动 ssh-agent 并复用 - Fenying](https://fenying.net/post/2017/12/20/auto-init-ssh-agent/)