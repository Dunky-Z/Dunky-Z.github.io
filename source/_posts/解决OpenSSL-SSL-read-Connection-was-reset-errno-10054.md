---
title: '解决OpenSSL SSL_read: Connection was reset, errno 10054'
date: 2022-02-16 11:12:31
updated:
tags: [Git]
categories: [Bug踩坑记录]
---

## 解决方法
方法一：
```
git config --global http.sslVerify "false"
```
方法二：
```
git config --global https.sslVerify "false"
```

方法三：
这可能是因为版本库的大小和git的默认缓冲区大小，所以通过下述操作（在git bash上），git的缓冲区大小会增加。
```
//在仓库init后，添加以下配置
git config http.postBuffer 524288000
//如果仓库不是自己的，可以添加以下配置
git config --global http.postBuffer 524288000
```

方法四：
网速太慢，换个网速快的环境。

## Reference
[windows - git clone error: RPC failed; curl 56 OpenSSL SSL_read: SSL_ERROR_SYSCALL, errno 10054 - Stack Overflow](https://stackoverflow.com/questions/46232906/git-clone-error-rpc-failed-curl-56-openssl-ssl-read-ssl-error-syscall-errno)
[解决OpenSSL SSL_read: Connection was reset, errno 10054問題](https://chowdera.com/2021/08/20210816115836695u.html)