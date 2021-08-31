---
title: Qt绘制系统
date: 2021-08-27 14:39:12
tags: [Qt]
---
本篇文章所涉及代码可在[此处查看](https://github.com/Dunky-Z/learning-qt/tree/main/QtRoad2)。

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

## 反走样
我们在光栅图形显示器上绘制非水平、非垂直的直线或多边形边界时，或多或少会呈现锯齿状外观。这是因为直线和多边形的边界是连续的，而光栅则是由离散的点组成。在光栅显示设备上表现直线、多边形等，必须在离散位置采样。由于采样不充分重建后造成的信息失真，就叫走样；用于减少或消除这种效果的技术，就称为反走样。也就是常说的防锯齿现象。因为性能方面的考虑，Qt默认关闭反走样。
```cpp
void paintEvent(QPaintEvent *)
{
    ///////////////////对比反走样效果
    QPainter painter(this);
    painter.setPen(QPen(Qt::black, 5, Qt::DashDotLine, Qt::RoundCap));
    painter.setBrush(Qt::yellow);
    painter.drawEllipse(550, 150, 200, 150);

    painter.setRenderHint(QPainter::Antialiasing, true);
    painter.setPen(QPen(Qt::black, 5, Qt::DashDotLine, Qt::RoundCap));
    painter.setBrush(Qt::yellow);
    painter.drawEllipse(300, 150, 200, 150);
}
```

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830192414.png)

我们可以明显观察到右边的椭圆轮廓是有锯齿现象的，这两个椭圆除了位置位置不同，唯一的区别就是右边的开启了反锯齿。
```cpp
painter.setRenderHint(QPainter::Antialiasing, true);
```

虽然反走样比不反走样的图像质量高很多，但是，没有反走样的图形绘制还是有很大用处的。首先，就像前面说的一样，在一些对图像质量要求不高的环境下，或者说性能受限的环境下，比如嵌入式和手机环境，一般是不进行反走样的。另外，在一些必须精确操作像素的应用中，也是不能进行反走样的。

## 坐标系统
在 Qt 的坐标系统中，每个像素占据 `1x1` 的空间。你可以把它想象成一张方格纸，每个小格都是1个像素。方格的焦点定义了坐标，也就是说，像素 `(x, y)` 的中心位置其实是在` (x + 0.5, y + 0.5) `的位置上。这个坐标系统实际上是一个“半像素坐标系”。我们可以通过下面的示意图来理解这种坐标系：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830195728.png)

我们使用一个像素的画笔进行绘制，可以看到，每一个绘制像素都是以坐标点为中心的矩形。注意，这是坐标的逻辑表示，实际绘制则与此不同。因为在实际设备上，像素是最小单位，我们不能像上面一样，在两个像素之间进行绘制。所以在实际绘制时，Qt 的定义是，绘制点所在像素是逻辑定义点的右下方的像素。

接下来，我们探究Qt绘制图像的坐标情况，
对于画笔大小为一个像素的情况比较容易理解，当我们绘制矩形左上角 `(1, 2)` 时，实际绘制的像素是在右下方。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830195744.png)

当画笔大小超过1个像素时，就略显复杂了。如果绘制像素是偶数，则实际绘制会包裹住逻辑坐标值；如果是奇数，则是包裹住逻辑坐标值，再加上右下角一个像素的偏移。具体请看下面的图示：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830200442.png)

从上图可以看出，如果实际绘制是偶数像素，则会将逻辑坐标值夹在相等的两部分像素之间；如果是奇数，则会在右下方多出一个像素。

Qt 的这种处理，带来的一个问题是，我们可能获取不到真实的坐标值。由于历史原因，`QRect::right()`和`QRect::bottom()`的返回值并不是矩形右下角点的真实坐标值：`QRect::right()`返回的是` left() + width() - 1`；`QRect::bottom()`则返回 `top() + height() - 1`，上图的绿色点指出了这两个函数的返回点的坐标。

为避免这个问题，我们建议是使用`QRectF。QRectF`使用浮点值，而不是整数值，来描述坐标。这个类的两个函数`QRectF::right()`和`QRectF::bottom()`是正确的。如果你不得不使用`QRect`，那么可以利用 `x() + width()` 和 `y() + height() `来替代 `right() `和` bottom() `函数。

对于反走样，实际绘制会包裹住逻辑坐标值：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830201429.png)

前面说过，`QPainter`是一个状态机。那么，有时我想保存下当前的状态：当我临时绘制某些图像时，就可能想这么做。当然，我们有最原始的办法：将可能改变的状态，比如画笔颜色、粗细等，在临时绘制结束之后再全部恢复。对此，`QPainter`提供了内置的函数：`save()`和`restore()`。`save()`就是保存下当前状态；`restore()`则恢复上一次保存的结果。这两个函数必须成对出现：`QPainter`使用栈来保存数据，每一次`save()`，将当前状态压入栈顶，`restore()`则弹出栈顶进行恢复。

在了解了这两个函数之后，我们就可以进行示例代码了：

```cpp
//绘制一个网格背景
void CoordinateWidget::paintGrid()
{
    size_t win_width = this->geometry().width();
    size_t win_height = this->geometry().height();
    QPainter painter(this);
    for (size_t x = 0; x < win_width; x += 25)
    {
        painter.drawLine(QPoint(x, 1), QPoint(x, win_height));
    }
    for (size_t y = 0; y < win_height; y += 25)
    {
        painter.drawLine(QPoint(1, y), QPoint(win_width, y));
    }
}
void CoordinateWidget::paintEvent(QPaintEvent *)
{
    paintGrid();
    QPainter painter(this);
    painter.fillRect(10, 10, 50, 100, Qt::red);
    painter.save();
    painter.translate(100, 0); // 向右平移 100px
    painter.fillRect(10, 10, 50, 100, Qt::yellow);
    painter.restore();
    painter.save();
    painter.translate(300, 0); // 向右平移 300px
    painter.rotate(30);        // 顺时针旋转 30 度
    painter.fillRect(10, 10, 50, 100, Qt::green);
    painter.restore();
    painter.save();
    painter.translate(400, 0); // 向右平移 400px
    painter.scale(2, 3);       // 横坐标单位放大 2 倍，纵坐标放大 3 倍
    painter.fillRect(10, 10, 50, 100, Qt::blue);
    painter.restore();
    painter.save();
    painter.translate(600, 0); // 向右平移 600px
    painter.shear(0, 1);       // 横向不变，纵向扭曲 1 倍
    painter.fillRect(10, 10, 50, 100, Qt::cyan);
    painter.restore();
}
```

Qt 提供了四种坐标变换：平移 `translate`，旋转 `rotate`，缩放 `scale` 和扭曲 `shear`。在这段代码中，我们首先在 `(10, 10)` 点绘制一个红色的 `50x100` 矩形。保存当前状态，将坐标系平移到 `(100, 0)`，绘制一个黄色的矩形。注意，`translate()`操作平移的是坐标系，不是矩形。因此，我们还是在` (10, 10)` 点绘制一个 `50x100` 矩形，现在，它跑到了右侧的位置。然后恢复先前状态，也就是把坐标系重新设为默认坐标系（相当于进行`translate(-100, 0)`），再进行下面的操作。之后也是类似的。由于我们只是保存了默认坐标系的状态，因此我们之后的`translate()`横坐标值必须增加，否则就会覆盖掉前面的图形。所有这些操作都是针对坐标系的，因此在绘制时，我们提供的矩形的坐标参数都是不变的。

为了更直观的查看绘制坐标，先在背景画了一个网格。

运行结果如下：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210830201720.png)

