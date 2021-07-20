---
title: Hexo和GitHub搭建博客以及更换电脑同步博客
date: 2021-07-20 12:04:37
tags:
---

只要有`source`文件夹下所有源文件就可以重新部署，按照正常的搭建Hexo环境开始搭建，搭建好以后将`source`文件夹替换即可，需要应用主题就下载主题然后替换。

注意：
- 主题更换需要更改`_config_yml`文件
- `_config_yml`文件中的部署配置，`branch:master`就是每次`hexo d`操作推送的分支。而在命令行每次`git push`推送的分支是设置的默认分支`hexo`
```
deploy:
  type: git
  repository: https://github.com/Dunky-Z/Dunky-Z.github.io.git
  branch: master
```
[利用Hexo在多台电脑上提交和更新github pages博客
](https://www.jianshu.com/p/0b1fccce74e0)
