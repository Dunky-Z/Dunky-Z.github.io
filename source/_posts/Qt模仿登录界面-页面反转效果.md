---
title: Qt模仿登录界面-页面反转效果
date: 2021-08-24 13:55:37
tags: [Qt,Linux]
---

设置一个旋转效果，将登录界面旋转翻个面，设置一些网络参数。
## 效果

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210826100416.gif)

## 网络参数设置界面布局

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210824144033.png)

## 网络参数设置界面
```cpp
//loginnetsetwindow.cpp
//初始化标题
void LoginNetSetWindow::initMyTitle()
{
	m_titleBar->move(0, 0);
	m_titleBar->raise();
	m_titleBar->setBackgroundColor(0, 0, 0, true);
	m_titleBar->setButtonType(MIN_BUTTON);
	m_titleBar->setTitleWidth(this->width());
	m_titleBar->setMoveParentWindowFlag(false);
}

void LoginNetSetWindow::initWindow()
{
	QLabel* pBack = new QLabel(this);
	QMovie *movie = new QMovie();
	movie->setFileName(":/Resources/NetSetWindow/headBack.gif");
	pBack->setMovie(movie);
	movie->start();
	pBack->move(0, 0);

	connect(ui.pButtonOk, SIGNAL(clicked()), this, SIGNAL(rotateWindow()));
	connect(ui.pButtonCancel, SIGNAL(clicked()), this, SIGNAL(rotateWindow()));
	
    ui.comboBoxNetType->addItem(QStringLiteral("不使用代理"));
	ui.comboBoxServerType->addItem(QStringLiteral("不使用高级选项"));
}

void LoginNetSetWindow::paintEvent(QPaintEvent *event)
{
	// 绘制背景图;
	QPainter painter(this);
	QPainterPath pathBack;
	pathBack.setFillRule(Qt::WindingFill);
	pathBack.addRoundedRect(QRect(0, 0, this->width(), this->height()), 3, 3);
	painter.setRenderHint(QPainter::Antialiasing, true);
	painter.fillPath(pathBack, QBrush(QColor(235, 242, 249)));
	
	QPainterPath pathBottom;
	pathBottom.setFillRule(Qt::WindingFill);
	pathBottom.addRoundedRect(QRect(0, 300, this->width(), this->height() - 300), 3, 3);
	painter.setRenderHint(QPainter::Antialiasing, true);
	painter.fillPath(pathBottom, QBrush(QColor(205, 226, 242)));

	painter.setPen(QPen(QColor(160 , 175 , 189)));
	painter.drawRoundedRect(QRect(0, 0, this->width(), this->height()), 3, 3);
}

```
`initMyTitle()`就不多说了，和正面登录界面差不多。
### `QPainterPath`类
它是由一些图形如曲线、矩形、椭圆组成的对象。主要的用途是，能保存已经绘制好的图形。实现图形元素的构造和复用；图形状只需创建一次，然后调用`QPainter::drawPath()` 函数多次绘制。`painterpath `可以加入闭合或不闭合的图形( 如：矩形、椭圆和曲线) 。`QPainterPath` 可用于填充，描边，clipping 。

#### `setFillRule()`设置填充模式
不是很理解
 https://doc.qt.io/qt-5/qt.html#FillRule-enum

 #### `addRoundedRect(QRect(0, 0, this->width(), this->height()), 3, 3)`圆角矩形

 - `QRect(0, 300, this->width(), this->height() - 300)`设置了矩形的位置及大小
 - `(3,3)`表示倒圆角的大小

### `setRenderHint()`开启反走样
- `QPainter::Antialiasing`           告诉绘图引擎应该在可能的情况下进行边的反锯齿绘制
- `QPainter::TextAntialiasing`       尽可能的情况下文字的反锯齿绘制
- `QPainter::SmoothPixmapTransform` 使用平滑的pixmap变换算法(双线性插值算法),而不是近邻插值算


## 初始化旋转窗口
```cpp
// 初始化旋转的窗口;
void RotateWidget::initRotateWindow()
{
	m_loginWindow = new LoginWindow(this);
	// 这里定义了两个信号，需要自己去发送信号;
	connect(m_loginWindow, SIGNAL(rotateWindow()), this, SLOT(onRotateWindow()));
	connect(m_loginWindow, SIGNAL(closeWindow()), this, SLOT(close()));
	connect(m_loginWindow, SIGNAL(hideWindow()), this, SLOT(onHideWindow()));

	m_loginNetSetWindow = new LoginNetSetWindow(this);
	connect(m_loginNetSetWindow, SIGNAL(rotateWindow()), this, SLOT(onRotateWindow()));
	connect(m_loginNetSetWindow, SIGNAL(closeWindow()), this, SLOT(close()));
	connect(m_loginNetSetWindow, SIGNAL(hideWindow()), this, SLOT(onHideWindow()));

	this->addWidget(m_loginWindow);
	this->addWidget(m_loginNetSetWindow);

	// 这里宽和高都增加，是因为在旋转过程中窗口宽和高都会变化;
	this->setFixedSize(QSize(m_loginWindow->width() + 20, m_loginWindow->height() + 100));
}
```
对正面和反面分别定义了信号槽，当对应的面接收到信号时，执行对应的动作。因为是旋转一百八十度，所以选择函数可以公用。

## 旋转窗口
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210824182705.gif)
```cpp

// 开始旋转窗口;
void RotateWidget::onRotateWindow()
{
	// 如果窗口正在旋转，直接返回;
	if (m_isRoratingWindow)
	{
		return;
	}
	m_isRoratingWindow = true;
	m_nextPageIndex = (currentIndex() + 1) >= count() ? 0 : (currentIndex() + 1);
	QPropertyAnimation *rotateAnimation = new QPropertyAnimation(this, "rotateValue");
	// 设置旋转持续时间;
	rotateAnimation->setDuration(1500);
	// 设置旋转角度变化趋势;
	rotateAnimation->setEasingCurve(QEasingCurve::InCubic);
	// 设置旋转角度范围;
	rotateAnimation->setStartValue(0);
	rotateAnimation->setEndValue(180);
	connect(rotateAnimation, SIGNAL(valueChanged(QVariant)), this, SLOT(repaint()));
	connect(rotateAnimation, SIGNAL(finished()), this, SLOT(onRotateFinished()));
	// 隐藏当前窗口，通过不同角度的绘制来达到旋转的效果;
	currentWidget()->hide();
	rotateAnimation->start();
}

// 旋转结束;
void RotateWidget::onRotateFinished()
{
	m_isRoratingWindow = false;
	setCurrentWidget(widget(m_nextPageIndex));
	repaint();
}
/ 绘制旋转效果;
void RotateWidget::paintEvent(QPaintEvent *event)
{
    if (m_isRoratingWindow)
    {
        // 小于90度时;
        int rotateValue = this->property("rotateValue").toInt();
        if (rotateValue <= 90)
        {
            QPixmap rotatePixmap(currentWidget()->size());
            currentWidget()->render(&rotatePixmap);
            QPainter painter(this);
            painter.setRenderHint(QPainter::Antialiasing);
            QTransform transform;
            transform.translate(width() / 2, 0);
            transform.rotate(rotateValue, Qt::YAxis);
            painter.setTransform(transform);
            painter.drawPixmap(-1 * width() / 2, 0, rotatePixmap);
        }
        // 大于90度时
        else
        {
            QPixmap rotatePixmap(widget(m_nextPageIndex)->size());
            widget(m_nextPageIndex)->render(&rotatePixmap);
            QPainter painter(this);
            painter.setRenderHint(QPainter::Antialiasing);
            QTransform transform;
            transform.translate(width() / 2, 0);
            transform.rotate(rotateValue + 180, Qt::YAxis);
            painter.setTransform(transform);
            painter.drawPixmap(-1 * width() / 2, 0, rotatePixmap);
        }
    }
    else
    {
        return QStackedWidget::paintEvent(event);
    }
}
```

### `QPropertyAnimation `动画类
`	QPropertyAnimation *rotateAnimation = new QPropertyAnimation(this, "rotateValue")`
- `rotateValue`就是这个动画的属性，我们这个动画中变化的就是旋转值，也就是旋转角度。这个属性名完全自己起，也可以改成`rotateAngle`等等，或者说想做一个平移的动画，也可以取一个`moveDist`等名字。

下面这一串就是标准的一套动画流程
```
    // 设置旋转持续时间;
    rotateAnimation->setDuration(1000);
    // 设置旋转角度变化趋势;
    rotateAnimation->setEasingCurve(QEasingCurve::InCubic);
    // 设置旋转角度范围;
    rotateAnimation->setStartValue(0);
    rotateAnimation->setEndValue(180);
    //开始动画
    rotateAnimation->start();
```

### `paintEvent`绘图事件
```cpp
#include <QtWidgets/QApplication>
#include "rotatewidget.h"

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    RotateWidget w;
    w.show();
    return a.exec();
}
```
我们`main`函数得知，最开始显示的窗口就是`RotateWidget`。在实例化一个`RotateWidget`类后，进行了标题栏的初始化工作，然后开始执行`w.show()`显示，但是此时窗口是不显示的。这是因为我们在`RotateWidget`的构造函数中进行了设置不显示窗口。
```cpp
    this->setWindowFlags(Qt::FramelessWindowHint | 
    Qt::WindowStaysOnTopHint | 
    Qt::WindowMinimizeButtonHint);
```

当运行到`    return a.exec()`时，Qt会自动调用`void RotateWidget::paintEvent()`。此时开始正式绘制窗口，但是因为我们还没哟点击登录页面的网络设置按钮，所以`m_isRoratingWindow=0`。会调用父类的绘图事件，`QStackedWidget::paintEvent()`，最后也就是`BaseWindow::paintEvent()`。会将登录页面先绘制出来。

当我们点击网络设置按钮时，`m_isRoratingWindow=1`开始绘制旋转画面。