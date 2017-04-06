---
layout: post
title: Learn Apache Spark On Your Desktop
comments: true
---
I am a newbie to the field of data science and big data. Actually, I started to learn it smoothly as in the saying "*learn to analyze data first, then do it big*". I have been performing algorithms on small data sets in various contexts to solve different problems or come up with some conclusions. Now, the data sets I work on are becoming larger and larger (order of GBs per file) that I cannot process fast. The problem becomes worse when I debug. Each run takes me minutes to get a result that I probably don't use! So, I had  to transform to work on a platform that satisfies my needs. Here my journey with [Apache Spark](http://spark.apache.org/) starts. I started learning it from this [edX course](https://courses.edx.org/courses/BerkeleyX/CS100.1x/1T2015/info). The course material uses a virtual machine that comes with the environment pre-installed and everything ready to start learning.

# Is it fast to learn?

At first, I thought that there is a barrier to have an environment like that to work unless someone configures it for me. I used to think that big data platforms require advanced configuration and special machine specification. However, this turns to be NOT TRUE. It is **so fast** to get your hands dirty with coding with Apache Spark on your desktop. No need for system admins, special servers or advanced knowledge. In this post, I will preview how to quickly write your first code with Apache Spark and run it.

Note: In this post, I will not illustrate Spark API or code details. It is just a getting started guide to break the barrier of learning the platform. In the last section, I will mention resources to learn it.

# What is Apache Spark?

Usually, you think of a traditional algorithm to process some data on a file. When the file becomes larger, you think of possible ways to reduce execution time. The first technique you probably think of is how to parallelize the execution into 2+ threads. Another technique you think of is to read the file in chunks and cache them in memory. More techniques you will think of based on the problem you have. However, all of these techniques actually distracts you from performing the actual work you want to achieve! Here comes cluster computing; and Apache Spark as a very powerful emerging platform. Apache Spark is an open-source framework for cluster computing. Don't worry if you don't know what cluster computing is; you don't need it right now. As a beginner, let's just start solving our problems of having large files with slow code, then we will have more posts on how cluster computing and Spark achieve that (If you can't wait: check [Spark website](http://spark.apache.org/)). Among all the amazing features tit provides, Spark will remove the hassle of parallelizing your application or providing caching. It will do it for you.

# Standalone Installation

The first step is to download Spark and unpack it. Visit the downloads page and select the package **Pre-built for Hadoop 2.6 and later** and choose **Direct Download** option. This will download a compressed file. Use any software you like to decompress it. Put the resulting folder in your preferred directory. Basically, here is the directory I have on my machine (you may have slightly different folders as there is a lot of updates to the project):

![_config.yml]({{ site.baseurl }}/images/learning-spark/1.png)

- `bin`: contains executable files that Spark provides for direct use (like the shell we will use shortly).
- `conf`: contains some configuration files that Spark loads on startup.
- `data`: contains some data sets that you can use for testing.
- `ec2`: contains a script for launching Spark clusters on Amazon EC2.
- `examples`: contains examples written in java, python, r and scala. We will use one of them shortly.

Other folders are used by Spark core.

# Test Spark's Python Shell

To test your package, open the terminal and type the command: **$ ./bin/pyspark** You should see the python shell working as following:

![_config.yml]({{ site.baseurl }}/images/learning-spark/2.png)

To reduce the logging statements printed on the terminal (they are distracting!), do the following:

- Open `conf` folder.
- Copy the file `log4j.properties.template` to the same directory and remove the extension `.template`
- Find the line `log4j.rootCategory=INFO`, console and change it to log4j.rootCategory=WARN, console This will print only the warning messages.

# Run Your First Code

Spark supports Java, Scala, R and Python. In this post, I use python. You can check the documentation for other language options. Let's try a very simple ad-hoc code to count the number of occurrences of words in a file. On the terminal, write the following lines

```
>>> lines = sc.textFile("README.md"); 
>>> counts = lines.flatMap(lambda x: x.split(' ')).map(lambda x: (x, 1)).reduceByKey(lambda x,y: x+y); 
>>> print counts.collect();
```
You will see the output of key-value pairs (word: count).

![_config.yml]({{ site.baseurl }}/images/learning-spark/3.png)

Congratulations! Spark is running on your desktop :-)

To quit the shell:

```
>>> exit();
```

# How to write your code in a separate file and execute it?

At this point, you have tested a very simple application from the shell. In real-world work, you use the shell only for quick debugging purposes. Usually, you have your code in file(s) and execute it. For python, you cannot simply use the terminal to write `python main.py` and let it execute. What you need to do is to submit the code to spark engine. We will do so with the word-count code included in the examples folder (python). Open the terminal and type the following command:

```$ bin/spark-submit examples/src/main/python/wordcount.py "README.md"```
![_config.yml]({{ site.baseurl }}/images/learning-spark/4.png)

You will see the code result. It's a parsed word: count pairs.

# What's Next ? ..

Now, that you have a fully working Spark engine now. Let's start learning what these APIs are all about. Here are some useful resources to get started:

- [edX Course](https://courses.edx.org/courses/BerkeleyX/CS100.1x/1T2015/info) from UC Berkeley.
- [Learn Spark](http://shop.oreilly.com/product/0636920028512.do) from O'Reilly.
- [Documentation](http://spark.apache.org/docs/latest/) from Apache.
- [Spark Training](https://databricks.com/training) from Databricks.

Enjoy Sparking you applications ;)