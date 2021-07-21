---
title: Hexo搭建GitHub博客如何添加README文件
date: 2021-07-21 12:14:46
tags:
---
刚开始搭建的时候并没有为仓库添加Readme文件，但是后期添加也不能直接在仓库里直接添加，因为每次部署都会被自动删除。
添加方法：
- 在博客根目录的`source`文件夹下新建`README.md`文件
- 在根目录的`_config.yml`文件中搜索`skip_render`，并做如下更改
```
skip_render: README.md
```

因为在每次`hexo g`时候，README文件都会被自动渲染为HTML文件，所以在配置文件中告诉渲染器跳过这个文件不要渲染他。