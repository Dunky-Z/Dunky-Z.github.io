---
title: Qt模仿登录界面-窗口布局及样式
date: 2021-08-17 11:30:06
tags: [Qt]
---
## 框架类图
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210827120419.png)

## 效果预览

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210818130510.gif)
完整项目及资源文件请在[Github](https://github.com/Dunky-Z/learning-qt/tree/main/Demo/login)查看。
## 页面布局

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210820101857.png)

## 初始化标题栏
```cpp
// 初始化标题栏;
void LoginWindow::initMyTitle()
{
    // 因为这里有控件层叠了，所以要注意控件raise()方法的调用顺序;
    m_titleBar->move(0, 0);
    m_titleBar->raise();
    m_titleBar->setBackgroundColor(100, 0, 0, true);
    m_titleBar->setButtonType(MIN_BUTTON);
    m_titleBar->setTitleWidth(this->width());
    // 这里需要设置成false，不允许通过标题栏拖动来移动窗口位置,否则会造成窗口位置错误;
    m_titleBar->setMoveParentWindowFlag(false);
    ui->pButtonArrow->raise();
}
```
### `raise()`将控件置于顶层
程序在打开后一般都在所有窗体的顶层，打开其他程序后之前的程序就会被放到下一层，在这里，当设置完`my_titleBar`后对其他控件操作就会把`my_titleBar`控件覆盖。所有要用`raise()`方法将其置于顶层。

## 初始化窗口
```cpp
// 初始化窗口;
void LoginWindow::initWindow()
{
    //背景GIG图;
    QLabel* pBack = new QLabel(this);
    QMovie *movie = new QMovie();
    movie->setFileName(":/Resources/LoginWindow/back.gif");
    pBack->setMovie(movie);
    movie->start();
    pBack->move(0, 0);

    //文本框内提示
    ui->accountComboBox->setEditable(true);
    QLineEdit* lineEdit = ui->accountComboBox->lineEdit();
    lineEdit->setPlaceholderText(QStringLiteral("QQ号码/手机/邮箱"));
    QRegExp regExp("[A-Za-z0-9_]{6,30}");	//正则表达式限制用户名输入不能输入汉字
    lineEdit->setValidator(new QRegExpValidator(regExp,this));
    ui->passwordEdit->setPlaceholderText(QStringLiteral("密码"));

    //密码框中的小键盘按钮;
    m_keyboardButton = new QPushButton();
    m_keyboardButton->setObjectName("pButtonKeyboard");
    m_keyboardButton->setFixedSize(QSize(16, 16));
    m_keyboardButton->setCursor(QCursor(Qt::PointingHandCursor));//鼠标放上去变成手形

    QHBoxLayout* passwordEditLayout = new QHBoxLayout();
    passwordEditLayout->addStretch();
    passwordEditLayout->addWidget(m_keyboardButton);
    passwordEditLayout->setSpacing(0);
    passwordEditLayout->setContentsMargins(0, 0, 8, 0);

    ui->passwordEdit->setLayout(passwordEditLayout);
    //设置密码达到最长时最后一个字符离小键盘图标的距离（12）
    ui->passwordEdit->setTextMargins(0, 0, m_keyboardButton->width() + 12, 0);

    //设置头像以及状态图标
    ui->userHead->setPixmap(QPixmap(":/Resources/LoginWindow/HeadImage.png"));
    ui->loginState->setIcon(QIcon(":/Resources/LoginWindow/LoginState/state_online.png"));
    ui->loginState->setIconSize(QSize(13, 13));
}
```
lineEdit->setPlaceholderText
QStringLiteral:如果该QString不会修改的话，那使用QStringLiteral

### `setPlaceholderText()`设置文本提示
该方法可以设置文本框中的默认文字提示，如图片中的QQ号码/手机/邮箱。

### `setCursor()`设置鼠标形态
共有以下19种鼠标形态：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210820150422.png)

图片来自[这里](https://blog.csdn.net/taiyang1987912/article/details/35281407)

### `addStretch()`布局加入弹簧
```cpp
QHBoxLayout* passwordEditLayout = new QHBoxLayout();
passwordEditLayout->addStretch();
passwordEditLayout->addWidget(m_keyboardButton);
```
`addStretch()`用来在布局中平分布局，他就是个弹簧的作用。如果不加参数，就是等于加个弹簧，会把小键盘图标挤到边上。如图：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210817143033.png)

如果将代码改一下：
```cpp
QHBoxLayout* passwordEditLayout = new QHBoxLayout();
passwordEditLayout->addStretch(1);
passwordEditLayout->addWidget(m_keyboardButton);
passwordEditLayout->addStretch(1);
```
意思就是将除了小键盘图标以外的空间分成两份，那么刚好小键盘图标就是在中间位置，就像两遍各防止了一个弹簧。效果如下：

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210817143135.png)

`setSpacing()`设置空间之间上下距离，还有一个容易混淆的设置`setMargin()`表示设置空间与窗口边缘的左右距离。

`setContentsMargins`设置左侧、顶部、右侧和底部边距，以便在布局周围使用。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210817144359.png)

现在我们设置的是`setContentsMargins(0, 0, 8, 0)`，现在我们设置大一点看看效果。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210817144532.png)

`QLineEdit.setTextMargins(left=,top=,right=,bottom=) `设置文本边距，这里主要为了设置密码输入过长时，最后一个字符距离小键盘图标有一定间隙。

## 初始化用户登录信息
```cpp
//accountitem.cpp
void LoginWindow::initAccountList()
{
	for (int i = 0; i < 3; i++)
	{
		AccountItem *account_item = new AccountItem();
		account_item->setAccountInfo(i, QStringLiteral("Dominic_%1号").arg(i), QString(":/Resources/LoginWindow/headImage/head_%1.png").arg(i));
		QListWidgetItem *list_item = new QListWidgetItem(m_Accountlist);
		m_Accountlist->setItemWidget(list_item, account_item);
	}
}
```