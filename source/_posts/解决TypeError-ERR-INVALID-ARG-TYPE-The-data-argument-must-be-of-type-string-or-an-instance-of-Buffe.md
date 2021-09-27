---
title: >-
  解决TypeError [ERR_INVALID_ARG_TYPE]: The data argument must be of type string
  or an instance of Buffe
date: 2021-09-10 15:59:34
tags: [Bug]
---
安装GitBook时出现这个错误，将`node`版本降级即可

```
MINGW64 ~/Desktop/dir1/dir11
$ gitbook init
warn: no summary file in this book
info: create SUMMARY.md

TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string
 or an instance of Buffer, TypedArray, or DataView. Received an instance of
Promise
```