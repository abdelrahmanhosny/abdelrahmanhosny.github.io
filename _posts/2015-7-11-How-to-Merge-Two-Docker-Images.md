---
layout: post
title: How to Merge Two Docker Images
comments: true
blog_nav: active
---

It's always said, "*Do not try to re-invent the wheel!*". When working with Docker, it is a good practice to search for some ready-to-use images on Docker Hub before building you own. It is very powerful to have your software architecture distributed in a set of containers, each one does one job. And the best building block of your distributed application is to use official images from Docker Hub. You can trust their functionalities.

In some cases, you may want to have one container do two different jobs. In other few cases, you may want one Docker image to contain dependencies from two different Docker images. This is easily done as long as you have the Dockerfile of each image. Simply, organize them in one file and build it!

**However**, if you spend most of the time using ready images from Docker Hub, you do not have their source Dockerfile. I spent some time searching for a tool to use it to merge (or flatten) two different Docker images; that I don't have their Dockerfiles. I was searching for something to do the following:

```
image1 --
            \
             ---> merged_image_12
            /
image2 --
```
Although this issue was closed before in two different threads ([1](https://github.com/docker/docker/issues/3378), [2](https://github.com/docker/docker/issues/332)), it arises in some scenarios when you want to do something like that!..

# Is it possible? ..

So, is there any tool that one can use to act like: docker merge image1 image2 merged_image ?

**No!**

You can not even build a Dockerfile like:

```
FROM image1
FROM image2
```

Simply, because you cannot have multiple base images in a Dockerfile.

# But, I need this feature!

The only solution you have is to get the Dockerfile of these images and organize them in one file, then build. So, can I get the Dockerfile of an image on Docker Hub? The happy news is YES. It is not available online, but you can reverse-engineer it with `docker history` command.

## How to use it?

On your machine, use docker pull to download the images from Docker Hub.

```
docker pull image1
docker pull image2
```

Then, use `docker history` to get the commands that were used to build them.

```
docker history --no-trunc=true image1 > image1-dockerfile
docker history --no-trunc=true image2 > image2-dockerfile
```
Then, open these two files. You can then see the command stack of each image. This holds true because of the fact that Docker images are structured into layers. That is, each command you type in the Dockerfile builds a new image on top of previous images from previous commands. Therefore, you can reverse-engineer images.

# Restrictions

The only scenario when you will not be able to reverse-engineer an image is when the maintainer of the image has used ADD or COPY commands in his Dockerfile. You will see a line like:

`ADD file:1ac56373f7983caf22`

or `ADD dir:cf6fe659e9d21535844`

This is because you cannot get what local files the maintainer used on his machine to include in this image.

Happy Reverse-Engineering :)