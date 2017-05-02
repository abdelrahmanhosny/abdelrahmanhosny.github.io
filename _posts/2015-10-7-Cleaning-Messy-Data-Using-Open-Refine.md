---
layout: post
title: Cleaning Messy Data Using Open Refine
comments: true
blog_nav: active
---

This post discusses a nightmare activity that people working with data face everyday. It is putting the data in a format ready to be processed according to your need. No doubt that working with data sets has become a vital activity in everyday work; not only for developers but also for mathematicians, statisticians, ...endless list. The problem is that real data sets have some inconsistencies; for example a variability in data format ( Oct. 7, 2015 vs. 10/07/2015 vs. October, 7 2015, vs. ....etc.). Problems like misspelling, extra spaces, random punctuation or weird capitalization plague your data consistency and accuracy. These problems arise when we retrieve data or work with data from multiple sources that are not inter-operable.

So, in this post I'm giving a brief introduction to [Open Refine](http://openrefine.org/) (formerly Google Refine) as a very easy-to-learn tool to prepare your data for further processing.

## Download

First, download the tool from this [link](http://openrefine.org/download.html). Choose the appropriate version for your operating system. Instructions on how to launch it is given too. It's noteworthy that Open Refine is a free open source tool that was supported by Google till late 2012. The source code is available on GitHub too if you are kind of a hardcore developer who wants to dig into the details.

## What Can It Do?

When you first launch the application, it looks like the following picture:

![_config.yml]({{ site.baseurl }}/images/cleaning-messy-data/1.png)

In this window, you can first explore your data. Data can be in any of the supported formats listed (TSV, CSV, *SV, excel, JSON, XML and Google sheets).

**Can Open Refine work on any size of data?** Yes and No.
Theoretically, there is no restriction on the data size. So, yes.
However, it depends on how much memory you installed in your machine as well as how much memory is allocated to Open Refine process itself. If you work with very large data sets, [this link](https://github.com/OpenRefine/OpenRefine/wiki/FAQ:-Allocate-More-Memory) will tell you how to increase the amount of memory allocated to your process.

Now, go ahead and choose a file then hit next ..
(In this exercise, you may use any sample data set or have a list of publicly available data sets you would like to discover from [here](http://www.datasciencecentral.com/profiles/blogs/the-free-big-data-sources-everyone-should-know))

### 1. Explore Data

I have used this data set and got the following:

![_config.yml]({{ site.baseurl }}/images/cleaning-messy-data/2.png)

In the top half of the screen, it shows a windows on the data where you can have a look at column names and some sample data (in order). In the bottom half of the screen, it tells you how Open Refine parsed your file (as CSV in my case) and some preview options that you can tweak to get different views. At this point, you are just exploring data. To proceed to edit it, you should click on create project on the top-right corner of the screen.

### 2. Create The Project and Clean Your Data

When the project is created, Open Refine transforms your data into a local database where it can manipulate it faster. Data is not sent over the internet for processing; so don't worry about your data privacy. My created project page looks like:

![_config.yml]({{ site.baseurl }}/images/cleaning-messy-data/3.png)

You can see that I have near 460k rows as well as the columns. You can navigate through this view using `<first, previous next, last>` links on the top right.

## Clean Your Data

Now comes the meat. What can you do to clean your data? Note that this tool is not automated. You have to tell it what to clean and how to clean it. It just makes the process of cleaning very fast instead of writing a code to clean it.

### Filter

In a specific column, ![_config.yml]({{ site.baseurl }}/images/cleaning-messy-data/4.png#right) if you want to filter all rows that have a specific value in this column, hit the small arrow beside column name and click **text filter**. Write your filter criteria on the left. This will shows only the rows that match your filter.


Then what to do? You are free to edit each cell separately (hover over the cell and you will see a small edit button) or you can edit the whole column (note that the column in this context mean the filtered one); click the small arrow beside column name and choose edit cells.

### Transform

The common way to edit multiple cells at once is using a transform function. A transform function is simply something that maps a value -that matches criteria- into another value. I choose "Edit cells" -> "Transform..."
This will open the following window:

![_config.yml]({{ site.baseurl }}/images/cleaning-messy-data/5.png)

You will see a preview on the row number, the old value and the new value (according to the transform function). The easiest way to write a transform function is to use Google Refine Expression Language (GREL) syntax. Here are some of the most popular transforms:

- `value.replace(old_value, new_value)` --> to replace a specific value in the text to a new value
- `value.join(some_text)` --> to concatenate some text
- `value.slice(start_index, end_index)` --> to get part of the text starting at the start index and ending at the end index.
- `value.split(delimiter)` --> to split the value based on a specific delimiter (you can further split them into columns).

Get a complete list of all function here.

### Infinite Undo History

Play with your data as much as you like with no worry. You can undo any transform or change you did using the Undo / Redo history on the left.

### Don't Forget to Export Your Data ..

All of the work you have done so far is saved in the project (the local database Open Refine created in the back-end). To get your modified clean data, don't forget to export it from the top right corner ..

## Further Readings ..

Is that all Open Refine? Absolutely NO. The tool has a lot more to do to clean your data. This is just an introduction. You might find this book helpful and Google search engine will always be your best friend to ask ..

Happy Cleaning :)

Acknowledgement: Thanks to Jennifer Eustis [Jennifer.Eustis@lib.uconn.edu] workshop at UConn on Wednesday Oct. 7, 2015