---
layout: post
title: Three Solutions to Bi-directional Linking Problem in Docker Compose
comments: true
blog_nav: active
---

Docker is one of the most trending technology platforms that gained community interest in a short time. In the simplest words, it enables developers and system admins to ship their distributed applications in an easy-to-use process. The ecosystem around Docker is so large and there are A LOT of tools that work with it. One of the most useful tools that is available is [Docker Compose](https://docs.docker.com/compose/). It enables you to define and run multi-container applications in a single file and then spin your application up in a single command.

Basically, a `docker-compose.yml` file looks like:

![_config.yml]({{ site.baseurl }}/images/docker-bi-directional-linking/1.png)

I would like to mention the **links** option here. This option enables to container to talk to each other in an internal network created at run-time and destroyed after the application is shutdown. In the above example, when the application is fired up, an entry with the alias name 'redis' will be created in /etc/hosts file in web container. This enables web to access services available in redis container.

# The problem

So far, the tool enables you to run multi-container apps with a single command. However, if you have a complicated communication between containers, that might cause a problem and the application will not be run. By complicated communication, I mean that more than one container uses a service from other containers using `links` option. To give an example, in the above application, web container uses a service from redis container. If you tried to add `links: - web` in redis container, and then run it with docker-compose, you will see the following message:

![_config.yml]({{ site.baseurl }}/images/docker-bi-directional-linking/2.png)

Actually, this is one of the historical problems of Docker. The networking system in Docker used to have problems and this is one of its symptoms. You can read more about this problem in [this issue](https://github.com/docker/compose/issues/666). The community proposed to use ambassador pattern as a work-around for this problem. However, this solution adds overhead on your application in addition to the fact that it is after all a work-around; not a docker solution!

As this was one of the problems I am facing in my application, I have been searching for solutions that utilizes Docker platform and its tools. Here are three possible solutions that I tried and worked for me.

# Solution 1: Using the new docker network interface

At the time of writing this post, Docker has announced a lot of new features and tools at [DockerCon 2015](http://www.dockercon.com/), a week ago. One of the most useful advancements is the new networking system. You can check the new experimental features. I had the chance to figure out an easy way to fire up a multi-container application that has sophisticated communication using the new network class.

Here is what you can do such that two containers see each other in a private network.

## 1. Create a network

`docker network create mynetwork`

Make sure the network is created by listing all networks

`docker network ls`

## 2. Attach containers to your network

Open a terminal and run one of your containers as following:

`docker run -it --publish-service web.mynetwork web`

Open another terminal tab and run the other container as following:

`docker run -it --publish-service redis.mynetwork redis`

## 3. Containers see each other!

Now, from the first terminal tab, you can ping `redis.mynetwork` and receive a reply. Also, from the second terminal tab, you can ping `web.mynetwork` and receive a reply. That is services are published under `<service_name>.<network_name>`

That way, you don't spin your application with Docker Compose at all. You just create a network and publish services on it. In other words, we are substituting links option in `docker-compose.yml` with a network.

Although the feature is still under experimental tag (at the time of this writing), it is very flexible and I think it is the future of running multi-container apps. So, it is advantageous you follow the main stream of where Docker is going.

Note: to try experimental features, refer to this [link](https://github.com/docker/docker/tree/master/experimental).

# Solution 2: Using Docker Swarm and Compose with Multi-host Networking

Again, this is also an experimental feature to use Swarm and Compose with Multi-host networking. This solution needs more work than the previous solution. However, if you have many containers communicating and you are planning to run them on clusters, this is the best solution.

To have a step-by-step solution, refer to the original feature on GitHub [here](https://github.com/docker/docker/blob/master/experimental/compose_swarm_networking.md). First, you setup Swarm with multi-host networking and then you can immediately run a compose application after removing the links option. Why? because every container started on this multi-host networking-enables Swarm cluster use "overlay:multihost" network by default, meaning they can all intercommunicate by container name.

Refer to the illustration here to walk through it.

Don't forget that this is an experimental feature. So, give feedback to the authors on GitHub.

# Solution 3: Using external DNS container

A classical solution that I consider as a work-around is using an additional container in your docker-compose.yml file. Add the following container to your file:

```
dnsdock:
 image: tonistiigi/dnsdock
 volumes:
 - /var/run/docker.sock:/run/docker.sock
 ports:
 - 172.17.42.1:53:53/udp
```
 
And in each container you have to do the following:

1 . Tell the container where is DNS service is: `dns: 172.17.42.1`
  
  
2 . Name each container to be visible for service discovery:

```
 environment:
 - DNSDOCK_NAME=web
 - DNSDOCK_IMAGE=web
```
You use environment variables for this naming. Do the same with redis container (whatever the other container your have).

3 . Containers see each other under the name <container_name>.<container_name>.docker
That is redis container can communicate with services on web container at web.web.docker

Reference: [http://sgillis.github.io/posts/2015-03-23-docker-dns.html](http://sgillis.github.io/posts/2015-03-23-docker-dns.html)

# In Summary

Docker technology is improving so quickly. It has gained community support and is continuously expanding. When solving problems you face, have a look first at the new tools provided around Docker to follow the main stream of development. In this post, I have presented three possible solutions for bi-directional linking problem in Docker Compose; two of them depends on the new networking system that will be available soon. If your application is not sophisticated, you may try the solution of DNS container.

Do you have other solutions? I'd be happy if you posted them here ..

Special Thanks to [Thibauld Favre](https://twitter.com/thibauld)