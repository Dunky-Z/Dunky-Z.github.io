---
title: Qt添加资源文件（QtCreator）
date: 2021-08-12 10:23:58
tags: [Qt]
---
QtCreator➜新建文件或项目➜Qt➜Qt Resource File

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210812102544.png)

点击`Choose`，设置资源文件名和路径。资源文件是一系列文件的集合，比如我要建立一个图片的资源文件，我可以设置`img`为资源文件名，将来所有图片类资源，都放到这个资源文件里，加入还有音频类的文件，我可以新建一个`audio`的资源文件，以后所有音频类的文件都放到这个资源文件下。

而不是我想要添加的文件名。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210812103024.png)
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210812103101.png)

右侧编辑器下方有个`Add Prefix`(添加前缀)，我们首先要添加文件前缀，前缀就是存放文件的文件夹名，然后添加需要的文件。添加完以后看效果就知道啥意思了。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210812104121.png)


这么做带来的一个问题是，如果以后我们要更改文件名，比如将 `xbl.png` 改成 `xiabanle.png`，那么，所有使用了这个名字的路径都需要修改。所以，更好的办法是，我们给这个文件去一个“别名”，以后就以这个别名来引用这个文件。具体做法是，选中这个文件，添加别名信息：

这样，我们可以直接使用`:/images/avatar `用到这个资源，无需关心图片的真实文件名。

