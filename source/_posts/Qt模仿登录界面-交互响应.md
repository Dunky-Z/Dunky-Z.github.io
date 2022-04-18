---
title: Qt模仿登录界面-交互响应
date: 2021-08-18 13:07:01
tags:
---
## 效果预览

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820152215.gif)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820152316.gif)

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820153546.gif)
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

## 切换用户及删除用户
```cpp
//loginwindow.cpp
// 初始化用户登录信息;
void LoginWindow::initAccountList()
{
    // 设置代理;
    m_Accountlist = new QListWidget(this);
    ui->accountComboBox->setModel(m_Accountlist->model());
    ui->accountComboBox->setView(m_Accountlist);

    for (int i = 0; i < 3; i++)
    {
        AccountItem *account_item = new AccountItem();
        account_item->setAccountInfo(i, QStringLiteral("Dominic%1号").arg(i), QString(":/Resources/LoginWindow/headImage/head_%1.png").arg(i));
        connect(account_item, SIGNAL(signalShowAccountInfo(int, QString)), this, SLOT(onShowAccountInfo(int, QString)));
        connect(account_item, SIGNAL(signalRemoveAccount(int)), this, SLOT(onRemoveAccount(int)));
        QListWidgetItem *list_item = new QListWidgetItem(m_Accountlist);
        m_Accountlist->setItemWidget(list_item, account_item);
    }
}
//将选项文本显示在QComboBox当中
void LoginWindow::onShowAccountInfo(int index, QString accountName)
{
    ui->accountComboBox->setEditText(accountName);
    ui->accountComboBox->hidePopup();

    // 更换用户头像;
    QString fileName = QString(":/Resources/LoginWindow/headImage/head_%1.png").arg(index);
    ui->userHead->setPixmap(QPixmap(fileName).scaled(ui->userHead->width(), ui->userHead->height()));
}

// 移除当前登录列表中某一项;
void LoginWindow::onRemoveAccount(int index)
{
    for (int row = 0; row < m_Accountlist->count(); row++)
    {
        AccountItem* itemWidget = (AccountItem*)m_Accountlist->itemWidget(m_Accountlist->item(row));
        if (itemWidget != NULL && itemWidget->getItemWidgetIndex() == index)
        {
            m_Accountlist->takeItem(row);
            itemWidget->deleteLater();
        }
    }
}
```
在`initAccountList()`中，初始化好了三个账户信息，当接收到显示用户信息的信号`signalShowAccountInfo`后，就会调用`onShowAccountInfo`槽函数显示用户信息。在这个函数中，将下拉框的内容设置成切换后的用户名，然后隐藏下拉框`hidPopup`。更改头像。

当接收到删除信号时，调用`onRemoveAccount`槽函数，删除指定的用户信息。
### `hidPopup()`隐藏下拉框
文章开头的效果图是隐藏下拉框的效果，每次切换用户下拉框隐藏，我们再来看一下不隐藏什么效果就容易理解了。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820105158.gif)

### `takeItem()`删除部件
```cpp
QListWidgetItem *QListWidget::takeItem(int row)
```
从下拉菜单中选择一行部件删除。
### `deleteLater()`稍后删除对象
`deletelater`的原理是 `QObject::deleteLater()`并没有将对象立即销毁，而是向主消息循环发送了一个`event`，下一次主消息循环收到这个`event`之后才会销毁对象。

## 切换登录状态
```cpp
//loginwindow.cpp
// 选择了新的用户登录状态;
void LoginWindow::onLoginStateClicked()
{
    m_loginStateMemu = new QMenu();
    QAction *pActionOnline = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_online.png"), QStringLiteral("我在线上"));
    QAction *pActionActive = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_Qme.png"), QStringLiteral("Q我吧"));
    m_loginStateMemu->addSeparator();
    QAction *pActionAway = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_away.png"), QStringLiteral("离开"));
    QAction *pActionBusy = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_busy.png"), QStringLiteral("忙碌"));
    QAction *pActionNoDisturb = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_notdisturb.png"), QStringLiteral("请勿打扰"));
    m_loginStateMemu->addSeparator();
    QAction *pActionHide = m_loginStateMemu->addAction(QIcon(":/Resources/LoginWindow/LoginState/state_hide.png"), QStringLiteral("隐身"));
    // 设置状态值;
    pActionOnline->setData(ONLINE);
    pActionActive->setData(ACTIVE);
    pActionAway->setData(AWAY);
    pActionBusy->setData(BUSY);
    pActionNoDisturb->setData(NOT_DISTURB);
    pActionHide->setData(HIDE);


    connect(m_loginStateMemu, SIGNAL(triggered(QAction *)), this, SLOT(onMenuClicked(QAction*)));

    QPoint pos = ui->loginState->mapToGlobal(QPoint(0, 0)) + QPoint(0, 20);
    m_loginStateMemu->exec(pos);
}

// 用户状态菜单点击;
void LoginWindow::onMenuClicked(QAction * action)
{
    ui->loginState->setIcon(action->icon());
    // 获取状态值;
    m_loginState = (LoginState)action->data().toInt();
    qDebug() << "onMenuClicked" << m_loginState;
}
```
在接收到点击状态按钮信号时，调用`onLoginStateClicked`槽函数，改变用户登录状态。切换的下拉菜单用的是`QMenu`。
### `addSeparator()`添加分割线
Q我吧和离开状态之间的分割线。
![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820113856.png)

### `mapToGlobal()`映射成全局坐标
弹出登录状态菜单`m_loginStateMemu`是我们自己new出来的，默认显示是从左上角开始显示，这样当然不行。

![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820140445.png)

 `mapToGlobal()`的作用就是将控件的坐标映射成全局坐标。代码里的意思就是将`loginState`控件里面的坐标用全局坐标表示。然后再向下偏移`20`个单位。再把得到的全局坐标作为`m_loginStateMemu`显示起始坐标。

下图是未偏移的结果，
 ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820141408.png)

向下偏移`20`个单位的效果，因为我们`mapToGlobal(QPoint(0, 0))`的参数是`(0,0)`为起点。如果我们`mapToGlobal(QPoint(0, 20))`的参数是`(0,20)`，就不用再加上偏移了。
 ![](https://picbed-1311007548.cos.ap-shanghai.myqcloud.com/markdown_picbed/img/20210820141521.png)

