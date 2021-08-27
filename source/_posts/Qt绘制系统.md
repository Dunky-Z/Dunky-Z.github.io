---
title: Qt绘制系统
date: 2021-08-27 14:39:12
tags: [Qt]
---
## 绘制系统简介
Qt的绘图系统允许使用相同的 API 在屏幕和其它打印设备上进行绘制。整个绘图系统基于`QPainter`,`QPainterDevice`和`QPaintEngine`三个类。

`QPainter`用来执行绘制的操作；`QPaintDevice`是一个二维空间的抽象，这个二维空间允许`QPainter`在其上面进行绘制，也就是`QPainter`工作的空间；`QPaintEngine`提供了画笔（`QPainter`）在不同的设备上进行绘制的统一的接口。`QPaintEngine`类应用于`QPainter`和`QPaintDevice`之间，通常对开发人员是透明的。

三个类的关系：`QPainter->QPaintEngine->QPaintDevice`。通过这个关系我们也可以知道，`QPainter`通过`QPaintEngine`翻译指令在`QPaintDevice`上绘制。

通过一个实例来了解一下绘制系统的，
```cpp
//main.h
#include <QPainter>
#include <QWidget>
#include <QPaintEvent>
#include <QApplication>
#include <QMainWindow>

class PaintedWidget : public QWidget
{
    Q_OBJECT
public:
    PaintedWidget(QWidget *parent = 0);

protected:
    void paintEvent(QPaintEvent *);
};
```
```cpp
//main.cpp
#include "paintwidget.h"

PaintedWidget::PaintedWidget(QWidget *parent) : QWidget(parent)
{
    resize(800, 600);
    setWindowTitle(tr("Paint Demo"));
}

void PaintedWidget::paintEvent(QPaintEvent *)
{
    QPainter painter(this);
    painter.drawLine(20, 20, 700, 20);
    painter.setPen(Qt::red);
    painter.drawRect(10, 10, 100, 400);
    painter.setPen(QPen(Qt::green, 5));
    painter.setBrush(Qt::blue);
    painter.drawEllipse(0, 0, 300, 40);
    // painter.drawRect(120, 50, 50, 400);

}

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    PaintedWidget paintMap;
    paintMap.show();
    return app.exec();
}
```

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827184613.png)

在构造函数中，我们仅仅设置了窗口的大小和标题。而`paintEvent()`函数则是绘制的代码。

首先，我们在栈上创建了一个`QPainter`对象，也就是说，每次运行`paintEvent()`函数的时候，都会重建这个`QPainter`对象。注意，这一点可能会引发某些细节问题：由于我们每次重建`QPainter`，因此第一次运行时所设置的画笔颜色、状态等，第二次再进入这个函数时就会全部丢失。有时候我们希望保存画笔状态，就必须自己保存数据，否则的话则需要将`QPainter`作为类的成员变量。

`paintEvent()`作为重绘函数，会在需要重绘时由Qt自动调用。“需要重绘”可能发生在很多地方，比如组件刚刚创建出来的时候就需要重绘；**组件最大化、最小化的时候也需要重新绘制**；组件由遮挡变成完全显示的时候也需要等等。

`QPainter`接收一个`QPaintDevice`指针作为参数。`QPaintDevice`有很多子类，比如`QImage`，以及`QWidget`。注意回忆一下，`QPaintDevice`可以理解成要在哪里去绘制，而现在我们希望画在这个组件，因此传入的是 `this` 指针。

我们还需要注意绘制的顺序，直线-矩形-椭圆，所以直线位于最下方，以此类推。

如果了解 `OpenGL`，肯定听说过这么一句话：`OpenGL` 是一个状态机。所谓状态机，就是说，`OpenGL` 保存的只是各种状态。比如，将画笔颜色设置成红色，那么，除非你重新设置另外的颜色，它的颜色会一直是红色。`QPainter`也是这样，它的状态不会自己恢复，除非你使用了各种设置函数。因此，如果在上面的代码中，我们在椭圆绘制之后再画一个矩形，它的样式还会是绿色` 5 `像素的轮廓线以及蓝色的填充，除非你显式地调用了设置函数进行状态的更新。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827184538.png)

这是大多数绘图系统的实现方式，包括 `OpenGL`、`QPainter`以及 `Java2D`。正因为`QPainter`是一个状态机，才会引出我们前面曾经介绍过的一个细节问题：**由于`paintEvent()`是需要重复进入的，因此，需要注意第二次进入时，`QPainter`的状态是不是和第一次一致，否则的话可能会造成闪烁的现象**。这个闪烁并不是由于双缓冲的问题，而是由于绘制状态的快速切换。

## 画刷和画笔
画刷和画笔。前者使用`QBrush`描述，大多用于填充；后者使用`QPen`描述，大多用于绘制轮廓线。
```cpp
//main.cpp
void PaintedWidget::paintEvent(QPaintEvent *)
{
    QPainter painter(this);
    painter.drawLine(20, 20, 700, 20);
    painter.setPen(Qt::red);
    painter.drawRect(10, 10, 100, 400);
    painter.setPen(QPen(Qt::green, 5));
    painter.setBrush(Qt::blue);
    painter.drawEllipse(0, 0, 300, 40);
    painter.drawRect(120, 50, 50, 400);
    ///////////////////画笔与笔刷
    QLinearGradient gradient(QPointF(180, 50), QPointF(230, 400));
    gradient.setColorAt(0, Qt::black);
    gradient.setColorAt(1, Qt::red);
    gradient.setSpread(QGradient::PadSpread);

    QBrush brush(gradient);

    QPen pen(Qt::green, 3, Qt::DashDotLine, Qt::RoundCap, Qt::RoundJoin);
    // painter.setPen(pen);
    painter.setBrush(brush);
    painter.drawRect(180, 50, 50, 400);
}
```
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827190208.png)

画刷的`style()`定义了填充的样式，使用`Qt::BrushStyle`枚举，默认值是`Qt::NoBrush`，也就是不进行任何填充。我们可以从下面的图示中看到各种填充样式的区别：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827190421.png)

画刷的`gradient()`定义了渐变填充。这个属性只有在样式是`Qt::LinearGradientPattern`、`Qt::RadialGradientPattern`或者`Qt::ConicalGradientPattern`之一时才有效。渐变可以由`QGradient`对象表示。`Qt` 提供了三种渐变：`QLinearGradient`、`QConicalGradient`和`QRadialGradient`，它们都是`QGradient`的子类。

本文以`QLinearGradient`为例，两个坐标分别为起点与重点坐标。`setColorAt`设置渐变颜色，`0`表示开始，`1`表示结束。意思就是从黑色渐变到红色。`setSpread`设置显示方式为平铺。
```cpp
QLinearGradient gradient(QPointF(180, 50), QPointF(230, 400));
gradient.setColorAt(0, Qt::black);
gradient.setColorAt(1, Qt::red);
gradient.setSpread(QGradient::PadSpread);
```

默认的画笔属性是纯黑色，0 像素，方形笔帽（`Qt::SquareCap`），斜面型连接（`Qt::BevelJoin`）。

画笔样式有一下几种，
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827191748.png)

你也可以使用`setDashPattern()`函数自定义样式，例如如下代码片段：


```cpp
QVector<qreal> dashes;
qreal space = 4;

dashes << 1 << space << 3 << space << 9 << space
        << 27 << space << 9 << space;
pen.setColor(Qt::black);
pen.setDashPattern(dashes);
painter.setPen(pen);
painter.drawLine(30, 300, 600, 30);
```

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827193722.png)

`pen.setCapStyle(Qt::RoundCap)`笔帽定义了画笔末端的样式，例如：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827193821.png)

`pen.setJoinStyle(Qt::RoundJoin)`连接样式定义了两条线连接时的样式，例如：


![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827193833.png)

