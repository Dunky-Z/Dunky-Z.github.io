---
title: Qt事件
date: 2021-08-09 09:55:07
tags: [Qt]
---
本篇文章所涉及代码可在[此处查看](https://github.com/Dunky-Z/learning-qt/tree/main/Event)

## 事件以及与信号的区别
**事件**（event）是由系统或者 Qt 本身在不同的时刻发出的。当用户按下鼠标、敲下键盘，或者是窗口需要重新绘制的时候，都会发出一个相应的事件。一些事件在对用户操作做出响应时发出，如键盘事件等；另一些事件则是由系统自动发出，如计时器事件。

事件和信号槽的区别
- 信号是由具体对象发出，然后马上交给`connect`函数连接的槽进行处理，如果处理过程中产生了新的信号，将会继续执行新的信号，一直这样递归进行下去。而事件使用一个事件队列对发出的所有事件进行维护，当新的事件产生时会被加到事件队列的尾部。

在运行过程中发现，刚启动时并不会显示任何内容，只有在点击一次后，平面才会显示信息。这是因为`QWidget`中有一个`mouseTracking`属性，该属性用于设置是否追踪鼠标。只有鼠标被追踪时，`mouseMoveEvent()`才会发出。如果`mouseTracking`是 `false`（默认即是），组件在至少一次鼠标点击之后，才能够被追踪，也就是能够发出`mouseMoveEvent()`事件。如果`mouseTracking`为 `true`，则`mouseMoveEvent()`直接可以被发出。知道了这一点，我们就可以在`main()`函数中直接设置下：
```
EventLabel *label = new EventLabel;
label->setWindowTitle("MouseEvent Demo");
label->resize(300, 200);
label->setMouseTracking(true);
label->show();
```
### 显示效果
![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210809102859.png)

## 事件的接受与忽略
```cpp
//custombutton.h
#include <QDebug>
#include <QMouseEvent>
#include <QApplication>
#include <QPushButton>

class CustomButton : public QPushButton
{
    Q_OBJECT
private:
    void onButtonClicked();

public:
    CustomButton(QWidget *parent = 0);

};
```
```cpp
//custombutton.cpp
#include "custombutton.h"

CustomButton::CustomButton(QWidget *parent) : QPushButton(parent)
{
    connect(this, &CustomButton::clicked, this, &CustomButton::onButtonClicked);
}

void CustomButton::onButtonClicked()
{
    qDebug() << "You clicked this!";
}
```

```cpp
//main02.cpp
#include "custombutton.h"

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    CustomButton btn;
    btn.setText("This is a Button!");
    btn.show();

    return a.exec();
}
```
以上代码运行结果就是点击按钮会在控制台输出："You clicked this!"。

现在，我们在`CustomButton`类中再添加一个事件函数：
```cpp
//custombutton.h
protected:
    void mousePressEvent(QMouseEvent *event);
```
```cpp
//custombutton.cpp
void CustomButton::mousePressEvent(QMouseEvent *event)
{
    if (event->button() == Qt::LeftButton)
    {
        qDebug() << "Left";
    }
    else
    {
        QPushButton::mousePressEvent(event);
    }
}
```

这时运行结果为点击按键输出"Left"。而没有再输出"You clicked this!"。说明我们把父类的实现覆盖了。**当重写事件回调函数时，时刻注意是否需要通过调用父类的同名函数来确保原有实现仍能进行！**。这一定程度上说，我们的组件**忽略**了父类的事件。

通过调用父类的同名函数，我们可以把 Qt 的事件传递看成链状：如果子类没有处理这个事件，就会继续向其父类传递。`Qt` 的事件对象有两个函数：`accept()`和`ignore()`。正如它们的名字一样，前者用来告诉 Qt，这个类的事件处理函数想要处理这个事件；后者则告诉 Qt，这个类的事件处理函数不想要处理这个事件。在事件处理函数中，可以使用`isAccepted()`来查询这个事件是不是已经被接收了。具体来说：如果一个事件处理函数调用了一个事件对象的`accept()`函数，这个事件就不会被继续传播给其父组件；如果它调用了事件的`ignore()`函数，Qt 会从其父组件中寻找另外的接受者。

```cpp
//custombutton01.h
#include <QDebug>
#include <QVBoxLayout>
#include <QMainWindow>
#include <QMouseEvent>
#include <QPushButton>
#include <QApplication>

class CustomButton : public QPushButton
{
    Q_OBJECT

public:
    CustomButton(QWidget *parent) : QPushButton(parent)
    {
    }

protected:
    void mousePressEvent(QMouseEvent *event)
    {
        qDebug() << "CustomButton";
    }
};

class CustomButtonEx : public CustomButton
{
    Q_OBJECT
public:
    CustomButtonEx(QWidget *parent) : CustomButton(parent)
    {
    }

protected:
    void mousePressEvent(QMouseEvent *event)
    {
        qDebug() << "CustomButtonEx";
    }
};

class CustomWidget : public QWidget
{
    Q_OBJECT
public:
    CustomWidget(QWidget *parent) : QWidget(parent)
    {
    }

protected:
    void mousePressEvent(QMouseEvent *event)
    {
        qDebug() << "CustomWidget";
    }
};

class MainWindow : public QMainWindow
{
    Q_OBJECT
public:
    MainWindow(QWidget *parent = 0) : QMainWindow(parent)
    {
        CustomWidget *widget = new CustomWidget(this);
        CustomButton *cbex = new CustomButton(widget);
        cbex->setText(tr("CustomButton"));
        CustomButtonEx *cb = new CustomButtonEx(widget);
        cb->setText(tr("CustomButtonEx"));
        QVBoxLayout *widgetLayout = new QVBoxLayout(widget);
        widgetLayout->addWidget(cbex);
        widgetLayout->addWidget(cb);
        this->setCentralWidget(widget);
    }

protected:
    void mousePressEvent(QMouseEvent *event)
    {
        qDebug() << "MainWindow";
    }
};
```

```cpp
//mai03.cpp
#include "custombutton01.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    MainWindow win;
    win.show();
    return app.exec();
}
```
这段代码在一个`MainWindow`中添加了一个`CustomWidget`，里面有两个按钮对象：`CustomButton`和`CustomButtonEx`。每一个类都重写了`mousePressEvent()`函数。

![](https://gitee.com/dominic_z/markdown_picbed/raw/master/img/20210809145445.png)

运行程序点击 `CustomButtonEx`，结果是
```
CustomButtonEx
```
因为我们重写了`mousePressEvent()`，所以调用子类自己的函数，如果在`CustomButtonEx`的`mousePressEvent()`第一行增加一句`event->accept()`，重新运行，发现结果不变。正如我们前面所说，QEvent默认是`accept`的，调用这个函数并没有什么区别。然后我们将`CustomButtonEx`的`event->accept()`改成`event->ignore()`。这次运行结果是
```
CustomButtonEx
CustomWidget
```

`ignore()`说明我们想让事件继续传播，于是`CustomButtonEx`的父组件`CustomWidget`也收到了这个事件，所以输出了自己的结果。

同理，`CustomWidget`又没有调用父类函数或者显式设置`accept()`或`ignore()`，所以事件传播就此打住。

这里值得注意的是，`CustomButtonEx`的事件传播给了父组件`CustomWidget`，而不是它的父类`CustomButton`。**事件的传播是在组件层次上面的，而不是依靠类继承机制**。

在一个特殊的情形下，我们必须使用`accept()`和`ignore()`函数，那就是窗口关闭的事件。对于窗口关闭`QCloseEvent`事件，调用`accept()`意味着 Qt 会停止事件的传播，窗口关闭；调用`ignore()`则意味着事件继续传播，即阻止窗口关闭。[回到我们前面写的简单的文本编辑器](https://github.com/Dunky-Z/learning-qt/blob/main/Dialog/mainwindow.cpp)。

## event()函数
事件对象创建完毕后，Qt 将这个事件对象传递给`QObject`的`event()`函数。`event()`函数并不直接处理事件，而是将这些事件对象按照它们不同的类型，分发给不同的事件处理器（`event handler`）。

如上所述，`event()`函数主要用于事件的分发。所以，如果你希望在事件分发之前做一些操作，就可以重写这个`event()`函数了。例如，我们希望在一个QWidget组件中监听 `tab` 键的按下，那么就可以继承QWidget，并重写它的`event()`函数，来达到这个目的：

```cpp
bool CustomWidget::event(QEvent *e)
{
    if (e->type() == QEvent::KeyPress) 
    {
        QKeyEvent *keyEvent = static_cast<QKeyEvent *>(e);
        if (keyEvent->key() == Qt::Key_Tab) 
        {
            qDebug() << "You press tab.";
            return true;
        }
    }
    return QWidget::event(e);
}
```

`CustomWidget`是一个普通的`QWidget`子类。我们重写了它的`event()`函数，这个函数有一个`QEvent`对象作为参数，也就是需要转发的事件对象。函数返回值是 `bool` 类型。如果传入的事件已被识别并且处理，则需要返回 `true`，否则返回 `false`。如果返回值是 `true`，并且，该事件对象设置了`accept()`，那么 Qt 会认为这个事件已经处理完毕，不会再将这个事件发送给其它对象，而是会继续处理事件队列中的下一事件。注意，在`event()`函数中，调用事件对象的`accept()`和`ignore()`函数是没有作用的，不会影响到事件的传播。

我们可以通过使用`QEvent::type()`函数可以检查事件的实际类型，其返回值是`QEvent::Type`类型的枚举。我们处理过自己感兴趣的事件之后，可以直接返回 `true`，表示我们已经对此事件进行了处理；对于其它我们不关心的事件，则需要调用父类的`event()`函数继续转发，否则这个组件就只能处理我们定义的事件了。为了测试这一种情况，我们可以尝试下面的代码：
```cpp
bool CustomTextEdit::event(QEvent *e)
{
    if (e->type() == QEvent::KeyPress) {
        QKeyEvent *keyEvent = static_cast<QKeyEvent *>(e);
        if (keyEvent->key() == Qt::Key_Tab) {
            qDebug() << "You press tab.";
            return true;
        }
    }
    return false;
}
```
`CustomTextEdit`是`QTextEdit`的一个子类。我们重写了其`event()`函数，却没有调用父类的同名函数。这样，我们的组件就只能处理 `Tab` 键，再也无法输入任何文本，也不能响应其它事件，比如鼠标点击之后也不会有光标出现。这是因为我们只处理的`KeyPress`类型的事件，并且如果不是`KeyPress`事件，则直接返回 `false`，鼠标事件根本不会被转发，也就没有了鼠标事件。

## 事件过滤器
有时候，对象需要查看、甚至要拦截发送到另外对象的事件。例如，对话框可能想要拦截按键事件，不让别的组件接收到；或者要修改回车键的默认处理。

通过前面的章节，我们已经知道，Qt 创建了`QEvent`事件对象之后，会调用`QObject`的`event()`函数处理事件的分发。显然，我们可以在`event()`函数中实现拦截的操作。由于`event()`函数是 `protected` 的，因此，需要继承已有类。如果组件很多，就需要重写很多个`event()`函数。这当然相当麻烦，更不用说重写`event()`函数还得小心一堆问题。好在 Qt 提供了另外一种机制来达到这一目的：事件过滤器。

`QObject`有一个`eventFilter()`函数，用于建立事件过滤器。这个函数的签名如下：

这个函数正如其名字显示的那样，是一个“事件过滤器”。所谓事件过滤器，可以理解成一种过滤代码。想想做化学实验时用到的过滤器，可以将杂质留到滤纸上，让过滤后的液体溜走。事件过滤器也是如此：它会检查接收到的事件。如果这个事件是我们感兴趣的类型，就进行我们自己的处理；如果不是，就继续转发。这个函数返回一个 `bool` 类型，如果你想将参数 `event` 过滤出来，比如，不想让它继续转发，就返回 `true`，否则返回 `false`。事件过滤器的调用时间是目标对象（也就是参数里面的`watched`对象）接收到事件对象之前。也就是说，如果你在事件过滤器中停止了某个事件，那么，`watched`对象以及以后所有的事件过滤器根本不会知道这么一个事件。



