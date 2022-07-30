---
title: 解决提交gerrit missing Change-Id
date: 2022-07-30 15:05:48
updated:
tags: [Bug]
categories: [Bug踩坑记录]
---

## 保留现场
```bash
remote: Resolving deltas: 100% (114/114)
remote: Processing changes: refs: 1,done   
remote: ERROR: missing Change-Idincommit message footer
remote:
remote: Hint: To automatically insert Change-Id,installthe hook:
remote:   gitdir=$(git rev-parse --git-dir);scp-p -P XX XX@gerrit.xxxxx.com:hooks/commit-msg${gitdir}/hooks/
remote: And then amend the commit:
remote:   git commit --amend
```

## 探究原因

### 理解change-id

代码审核是要对一个完整的变更进行审核，比如一次Bug修复，有多次提交Commit，每次的Commit Id都不同，那么如何将多个不同的Commit ID 关联到同一个Chanege-Id呢？我们需要将Change-Id添加到Commit的footer中，这样就可以将多个Commit关联到同一个Change-Id了。

## 解决方法