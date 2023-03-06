# Understanding JavaScript basics

© [Beginner’s Guide to JavaScript](https://codeberryschool.com/blog/en/beginners-guide-to-javascript) all rights reserved.

>This document is at the introductory level. If you want to access more information about javascript, you can access it from [this](https://javascript.info) link.

# Contents
1. [Understanding JavaScript basics](#understanding-javascript-basics)
2. [Contents](#contents)
3. [Introduction](#introduction)
4. [Variables](#variables)
5. [If Statements](#if-statements)
6. [Loops](#loops)
   1. [The For Loop](#the-for-loop)
   2. [The While Loop](#the-while-loop)
7. [Functions](#functions)
8. [Conclusion](#conclusion)


# Introduction
JavaScript is the language of the web. Almost every site you visit in your web browser will be using it in some manner to enhance the user experience. This is why JavaScript is such a desirable component of the modern programmer’s toolkit. There really is no substitute for this flexible language if you want to create brilliant browser-based experiences capable of hooking in customers, clients, and prospective employers. 

Want to create a website for your fast-growing socks-for-dogs business? Or how about an in-browser VR experience of what it’s like to visit your mother-in-law’s house at Christmas? You’ll have to learn JavaScript if you want to achieve these noble dreams and so much more.

So if any of that takes your fancy (or you’re just bored on the toilet at work), read on to find out more about the basics of JavaScript and begin your journey towards becoming a web-programming ninja.

# Variables
A great place to start is with variables. Variables are where coders store information that a program needs whilst it is running. They’re like boxes that you can put **stuff** in. A programmer can create a variable in code, fill it with something, and then access it later. This way information can be available when it is needed.

___So, how do I create a variable in code?___

Like this:
```javascript
var myCoolVariable;
```

___What the hell does that mean?___

Glad you asked. The line above consists of two parts that come together to create a variable. Let’s break it down.

- var
  - In JavaScript, this is a reserved word. There’s quite a few of these in the language and they all have dedicated jobs. This one tells the program you’re about to create a variable.
- myCoolVariable
    - This is the variable identifier, which is just its name. This could be anything, from ‘cat’ to ‘antidisestablishmentarianism’ (please don’t name your variables this). The variable identifier is used to reference the variable later when you need it. It is considered good practice to give your variables names that describe what they do. So if you have a variable to contain your age, then you should probably call it myAge. Do this consistently, and your fellow programmers will love you and buy you things.
  
___Okay, cool, but what next?___

Remember when I said variables are like boxes? Well, the code above creates the box, but we haven’t yet put anything inside it. This is the next step. But before that, a word on data types.

___Data who?___

Data types are the different kinds of variables you can create. Mostly all programming languages have these. Some are very strict about them. They make you state exactly what type of variable you’re creating from the get-go and then stick to that throughout. JavaScript isn’t like this. You can create a variable of a certain type in JavaScript and then change it later on a whim as variable values and types can be changed at any time. Woohoo. Go crazy.

Here are some of the data types available to JavaScript programmers.

- Number
  - The Number type defines a variable with a numeric value. This type of variable can theoretically store values from -Infinity to +Infinity. It can also store a special value, NaN, which means ‘Not a Number’ and happens when you’ve done something wrong and confused JavaScript. Poor JavaScript.
- String
  - The String type defines a variable that contains text, like ‘Hello’, ‘Goodbye’ or ‘Backstreet’s Back, Alright!’
- Boolean
  - The Boolean type defines a variable that can be either true or false. This type of variable is often used for making decisions in code. Should I stay or should I go? Booleans have the answer.

There are other data types available and if you want to look into them, you can click [here](https://www.w3schools.com/js/js_datatypes.asp). 


**Giving Variables a Value**

Let’s look at how to put stuff into variables. The following is some code that does just that.

```javascript
myCoolVariable = 10;
myCoolVariable = ‘hello’;
myCoolVariable = true;
```
The image above shows some code that sets myCoolVariable three times: once to a Numeric value (10), to a String value (‘hello’) and then to a Boolean value (true).

___Creating and Setting a Variable at the Same Time___

It’s also possible to create and set a variable all at once. You do it like this:

```javascript
var myCoolVariable = 10;
```
Here we create myCoolVariable and give it the value 10 in one line. Check us out. Wonderful.

___Referencing a Variable Later___

Creating and setting variables is great. But the true power comes later when you actually use them. So what does that look like? It’s easy. Just use the identifier.
```javascript
var myCoolVariable = 10;
var myCoolVariableDouble = myCoolVariable + myCoolVariable;
``` 

Here we create myCoolVariable and give it the value 10. Then we create another variable, myCoolVariableDouble and set it to the result of adding myCoolVariable to itself. So now myCoolVariableDouble equals 20 and we have two variables in the program. Two! Get the camera, dad.

___Enough about Variables___

We’ve covered the basics of variables: creating them, setting them and referencing them. But there is so much more to programming in JavaScript than that. Now that we have this down, we can move on to bigger and better things. Like if statements.

# If Statements

So we’ve got variables down, but how do we use them to do cool and awesome things? Well, one of the ways is by using if statements.

An ‘if statement’ is a way in which a programmer can build decision-based logic into their code. This means that we can tell our programs to do something based on a certain condition. Let’s look at an example.
```javascript
If (10 > 20) {
  // Run this code
} else {
  // Run this code
}
```

> {}’s define a code block. Some JavaScript tools, like the if statement, require these in order to separate different bits of code.

Let’s break this down.

- if
  - This is another reserved word. It indicates to the program that the following code will be an if statement.
- (10 > 20)
  - This part is the condition. The program will evaluate this and then choose what to do based on the result. A condition always outputs a Boolean value, i.e. true or false. If the output of the condition is true, the if statement will run the code block immediately after the closing bracket of the condition. If it evaluates to false, then the code in the else block will be run instead, which is exactly what happens here since 10 is not more than 20.
- else
  - This is another JavaScript keyword. It simply defines the code that should run if the condition evaluates to false. The else block is not required. If you add it, then you’re technically creating an if else statement.

Hopefully, it is now clear why we need to use {} here. Without defining a code block, it wouldn’t be clear to the program which code should run if the condition evaluates to true or if it evaluates to false.

If statements are one of the core building blocks of complex programs. Mastering these is imperative to becoming a competent JavaScript programmer.

# Loops

Loops are another important tool. As the name suggests, these run bits of code over and over again until a condition is met. There are a few different kinds of loops, but we’re only going to look at two here. I’ll provide links to further study.

## The For Loop

We will look at the for loop first. Here’s an example.
```javascript
var numberOfIterations = 10;
for (var i = 0; i < numberOfIterations; i++) {
  // do something 10 times
}
```

This might look a little weird compared to other stuff, but it becomes really straightforward when you break it down. I’ll go over each individual part.

- var numberOfIterations = 10
  - This is just the code for creating and setting a variable in one go.
- for (var i = 0; i < numberOfIterations; i++)
  - for
    - Another reserved word. This tells the program you’re about to write a for loop.
  - var i = 0
    - Creating and setting a variable again. This is a special case because we’re creating it within the for loop. This means that variable i will only exist for the duration of that for loop. Once it’s done executing, i will be discarded. Forever. Goodbye i.
  - i < numberOfIterations
    - This line tells the for loop to execute only while the variable i is less than the value of numberOfIterations (10).
  - i++
    - Finally, this line tells the for loop that once it is done executing a single iteration, it should increase the value of i by 1.


I hope it’s now quite easy to see how the for loop works. It creates a temporary variable to track the number of loops it has done: (i), then it defines the condition for execution (only while i < some value) and then it defines how i should increase with each loop (in this case, +1 but it can really be anything you want).

Evidently, the for loop is good when you know how many times you want to run something. But what about when you don’t? Here comes the while loop.

## The While Loop

The while loop is simpler than the for loop. It just takes a condition and executes until that condition is false. Here’s an example.

```javascript
var shouldKeepRunning = true;
while (shouldKeepRunning) {
  // Do some code
  shouldKeepRunning = false;
}
```

- while
  - We’re telling the program we’re about to write a while loop.
- (shouldKeepRunning)
  - This is the condition. The loop will run while the value of shouldKeepRunning is true. This is the same as writing shouldKeepRunning == true, but we can write it like this as shorthand.

> JavaScript uses == to compare two values, as = is used to set a value. So if you write if (10 == 20), you’re really saying ‘if 10 is equal to 20’.

This loop will only run once as we immediately set shouldKeepRunning to false on the first iteration. It will probably be a little different in your code, but it’s important to make sure that the loop will stop at some point. We don’t want to cause a global catastrophe.

These are the only two loops we will go over here, but if you want to learn more, you can check out [this link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration).

# Functions

All the tools we’ve got right now are great for writing small, sequential scripts, but what if we want to write larger programs that make use of the same bits of code over and over? We don’t want to have to constantly copy and paste any code we want to reuse. This is where functions come in.

Functions are reusable chunks of code. Here’s an example.

```javascript
function doSomething(argumentOne, argumentTwo) {
  // do something here
}
```
Breaking this down, we get:

- function
  - Just another JavaScript keyword.
- doSomething
  - This is the function identifier. Just like a variable identifier, it lets us refer to this function later in code.
- (argumentOne, argumentTwo)
  - The code within the brackets is the argument list. The two values argumentOne and argumentTwo behave as variables within the function and therefore can be used as such. We’ll see in a second how these variables get set.

Any code defined within the function block can be run as many times as you like simply by invoking the function. Here’s an example of that.

```javascript
doSomething(10, 20);
```

We use the function identifier doSomething and then we pass two arguments, 10 and 20. These arguments that we pass will then populate the arguments in the function’s argument list, argumentOne and argumentTwo. Order matters, so argumentOne will get the value 10, and argumentTwo will get the value 20.

Functions operate the same as variables in that you can only refer to a function within the block, and all child blocks, where it was defined. If you have a function that was created inside an if statement block, for example, then you can’t use it outside of that block.

Functions are extremely important tools if you want to create complex and dynamic programs, so they’re important to practice. For more information, [see here](https://www.w3schools.com/js/js_functions.asp).

# Conclusion

I’ve gone over some of the basics of JavaScript programming in this article, but there is a lot more to know. Coding is a practical skill, and as such can only be learned properly with practice. There are plenty of services out there to help you do this, like CodeAcademy, CodeSchool, Pluralsight and, of course, Codeberry! I hope this information will be useful to you as a handy reference guide for the future. Good luck with your coding career!