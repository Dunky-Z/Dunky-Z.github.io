---
title: Qt模仿登录界面-交互响应
date: 2021-08-18 13:07:01
tags:
---
## 设置窗口拖动
因为这个项目中没有将登录界面直接继承`MainWindow`，而是继承的`Dialog`类，所以它是不能直接移动的，需要我们自己添加相应的方法。这里实现了三种方法，点击，拖动，释放。
```cpp
//mytitlebar.cpp
// 以下通过mousePressEvent、mouseMoveEvent、mouseReleaseEvent三个事件实现了鼠标拖动标题栏移动窗口的效果;
void MyTitleBar::mousePressEvent(QMouseEvent *event)
{
	if (m_buttonType == MIN_MAX_BUTTON)
	{
		// 在窗口最大化时禁止拖动窗口;
		if (m_pButtonMax->isVisible())
		{
			m_isPressed = true;
			m_startMovePos = event->globalPos();
		}
	}
	else
	{
		m_isPressed = true;
		m_startMovePos = event->globalPos();
	}
	
	return QWidget::mousePressEvent(event);
}

void MyTitleBar::mouseMoveEvent(QMouseEvent *event)
{
	if (m_isPressed && m_isMoveParentWindow)
	{
		QPoint movePoint = event->globalPos() - m_startMovePos;
		QPoint widgetPos = this->parentWidget()->pos() + movePoint;
		m_startMovePos = event->globalPos();
		this->parentWidget()->move(widgetPos.x(), widgetPos.y());
	}
	return QWidget::mouseMoveEvent(event);
}

void MyTitleBar::mouseReleaseEvent(QMouseEvent *event)
{
	m_isPressed = false;
	return QWidget::mouseReleaseEvent(event);
}
```


### `globalPos()`获取全局的坐标
`event->globalPos()`是获取全局的坐标，全局是相对于整个屏幕而言的。还有一个函数`pos()`获取的是局部坐标，相对于一个`widget`窗口而言。

### `move()`移动窗口
```cpp
void move(int x, int y);
void move(const QPoint &);
```
其中`move`的原点是父窗口的左上角，  如果没有父窗口，则桌面即为父窗口。x往右递增，y往下递增

`mouseMoveEvent()`这个函数里有一点需要注意的是，`m_startMovePos = event->globalPos()`这条语句。每次移动窗口之前，先把鼠标移动后的位置记录下来，作为下一次移动的起点。

## 设置最小化，关闭
```cpp
//mytitlebar.cpp
// 信号槽的绑定;
void MyTitleBar::initConnections()
{
	connect(m_pButtonMin, SIGNAL(clicked()), this, SLOT(onButtonMinClicked()));
	connect(m_pButtonClose, SIGNAL(clicked()), this, SLOT(onButtonCloseClicked()));
}

void MyTitleBar::onButtonMinClicked()
{
	emit signalButtonMinClicked();
}

void MyTitleBar::onButtonCloseClicked()
{
	emit signalButtonCloseClicked();
}
```
标题栏是在`basewindow`中new出来的，`mytitlebar`类只负责发送信号，真正处理信号的是在`basewindow`类中。
```cpp
//basewindow.cpp
void BaseWindow::initTitleBar()
{
	createMyTitle(this);
	m_titleBar->move(0, 0);
	
	connect(m_titleBar, SIGNAL(signalButtonMinClicked()), this, SLOT(onButtonMinClicked()));
	connect(m_titleBar, SIGNAL(signalButtonCloseClicked()), this, SLOT(onButtonCloseClicked()));
}


void BaseWindow::onButtonMinClicked()
{
	if (Qt::Tool == (windowFlags() & Qt::Tool))
	{
		hide();
	}
	else
	{
		showMinimized();
	}
}

void BaseWindow::onButtonCloseClicked()
{
	close();
}
```
在初始化标题栏时，就把点击信号与相关的槽函数绑定。当有最小化点击信号发生时，就会调用最小化操作。

### 和窗口相关的几个函数
```cpp
showMinimized()     //最小化
showNormal()        //从最小化或者最大化窗口恢复到正常窗口
showMaximized()     //最大化
show()              //显示窗口，可以显示模态窗口也可以显示非模态
hide()              //隐藏窗口
isVisible()         //判断是否可见
isMinimized()       //判断是否处于最小化状态
close()             //关闭窗口
```