---
layout: post
title: Caching Builds with Docker Build Branching
image: /assets/img/posts/failure-story-docker-branching/docker-build-branching-issues.png
comments: true
description: >
  This post describes a technical failure story and gives reasons why it failed. I was trying to use a Docker environment to build a C++ project and **cache** the build artifacts to not build them again if they are not changed (utilizing Makefiles). This post gives the context, my approach and where it failed. 
excerpt_separator: <!--more-->
---

**GitHub**: https://github.com/abdelrahmanhosny/yosys

**Description**: _Yosys_ is an open-source Logic Synthesis tool. It takes a circuit design written in Register-Transfer-Level (RTL) and synthesize it to produce a netlist ready for placement and routing. The project is written in C++. The tool is used in an end-to-end silicon compilation flow, called [OpenROAD](https://github.com/The-OpenROAD-Project). The complete flow unifies a build platform to use `CentOS`. Therefore, it was ideal to introduce a `Docker` build for it to ensure portability. 

<!--more-->

The [Dockerfile](https://github.com/abdelrahmanhosny/yosys/blob/master/Dockerfile) uses a multi-stage build to produce a final image of minimal size.

~~~Docker
FROM centos:centos6 AS builder

# install gcc 7
RUN yum -y install centos-release-scl && \
    yum -y install devtoolset-7 devtoolset-7-libatomic-devel
ENV CC=/opt/rh/devtoolset-7/root/usr/bin/gcc \
    CPP=/opt/rh/devtoolset-7/root/usr/bin/cpp \
    CXX=/opt/rh/devtoolset-7/root/usr/bin/g++ \
    PATH=/opt/rh/devtoolset-7/root/usr/bin:$PATH \
    LD_LIBRARY_PATH=/opt/rh/devtoolset-7/root/usr/lib64:/opt/rh/devtoolset-7/root/usr/lib:/opt/rh/devtoolset-7/root/usr/lib64/dyninst:/opt/rh/devtoolset-7/root/usr/lib/dyninst:/opt/rh/devtoolset-7/root/usr/lib64:/opt/rh/devtoolset-7/root/usr/lib:$LD_LIBRARY_PATH

# python 3.6
RUN yum -y install rh-python36
ENV PATH=/opt/rh/rh-python36/root/usr/bin:$PATH


# install other yosys dependencies
RUN yum install -y flex tcl tcl-devel libffi-devel git graphviz readline-devel glibc-static wget autoconf && \
    wget https://ftp.gnu.org/gnu/bison/bison-3.0.1.tar.gz && \
    tar -xvzf bison-3.0.1.tar.gz && \
    cd bison-3.0.1 && \
    ./configure && \
    make -j$(nproc) && \
    make install

COPY . /yosys
WORKDIR /yosys
RUN make PREFIX=build config-gcc-static-tcl-dynamic
RUN make PREFIX=build -j$(nproc)
RUN make PREFIX=build install

FROM centos:centos6 AS runner
RUN yum update -y && yum install -y readline-devel tcl-devel libffi-devel
COPY --from=builder /yosys/build/bin/yosys /build/yosys
COPY --from=builder /yosys/build/bin/yosys-abc /build/yosys-abc
COPY --from=builder /yosys/build/bin/yosys-config /build/yosys-config
COPY --from=builder /yosys/build/bin/yosys-filterlib /build/yosys-filterlib
COPY --from=builder /yosys/build/bin/yosys-smtbmc /build/yosys-smtbmc

RUN useradd -ms /bin/bash openroad
USER openroad
WORKDIR /home/openroad
~~~

## Problem

The problem with this Dockerfile is it cannot be used for a development environment, where a contributor: modify code -> build -> test -> repeat. The reason is in this line `COPY . /yosys`. Everytime there is a new change in of the code files, a whole new copy to the Docker image is executed when issuing `docker build -t <image_name> .` This is time-wasting for the developer.

Why not use a local development environment? That's a possible solution. In our specific use case, the development environment changes frequently from a contributor to another. We wanted to implement a development environment based on Docker. Especially, the Docker-based build will be utilized in a Continuous Integration (CI) pipeline. 

**So, how can we cache the build directory?**

## Attempted Solution

I wanted to modify the Dockerfile to implement this logic:

~~~Docker
FROM centos:centos6
RUN …
IF BUILD_TARGET==development
// cache build directory
ELSE IF BUILD_TARGET==production
// use multi-stage build to get a small final image size.
DONE
~~~

However, `Dockerfiles` don't offer conditional branching! How can we achieve this functionality? 

[Docker Build Arguments](https://docs.docker.com/engine/reference/builder/#arg) defines a variable that we can pass at build-time to the builder with the `docker build` command using the `--build-arg <varname>=<value>` flag. Utilizing this feature, one can implement a branching model for Dockerfiles. The following model is inspired from [this post](https://medium.com/@tonistiigi/advanced-multi-stage-build-patterns-6f741b852fae).

### Dockerfile Branching Model

The attempt is to implement the following scenario. [Click here](/assets/img/posts/failure-story-docker-branching/Dockerfile-branching.svg){:target="_blank"} to open the image in a new tab and Zoom in.

![](/assets/img/posts/failure-story-docker-branching/Dockerfile-branching.svg)

Here, we utilize two build arguments that we are going to branch upon:

1. `BUILD`: [cached, notcached]
2. `ENVIRONMENT`: [production, development]

**The build flow goes as follows:**

- In the first phase (yellow boxes), we build a stage that is not cached. We build another stage that is based on the cached stage and it basically copies the build directory from the `<image>` built previously (using `noncached` argument).
- Based on the `BUILD` argument, we introduce a new build stage that is based on one of the previous stages (cached or notcached). This branching is represented in the orange box. And this is also how we implement branching in Dockerfiles.
- Now, from the builder image, we build two new stages: development and production. The development stage copies everything from the builder stage (source code + build directory). The production stage copies only the binaries needed to run the tool at the end. These stages are represented in the red box.
- Based on the `ENVIRONMENT` argument, we introduce a new build stage that is based on one of the two previous stages (development or production). This branching is represented in the final green box. 

The idea here is to first build using a `noncached` and `development` environment. This yields a final Docker image that contains the build directory in it, in addition to the source code directory. The command used for this is: `docker build --build-arg BUILD=noncached --build-arg ENVIRONMENT=development yosys .`. Next, a developer will build using `cached` value for the `BUILD` argument (`docker build --build-arg BUILD=cached --build-arg ENVIRONMENT=development yosys .`). This means that the build is based on the previous build directory that is already there in the image. In our CI pipeline, and when we want to release the tool, we would use `ENVIRONMENT=production`.

Note that the Docker Build Engine does not build all stages. It determines which stages are needed for the final image and recursively traverses the stage dependencies in the Dockerfile. This is neat!

### Resulting Dockerfile

The final Dockerfile using this branching model is shown below:

~~~Docker
ARG BUILD=notcached
ARG ENVIRONMENT=production

FROM centos:centos6 AS builder-notcached

# install gcc 7
RUN yum -y install centos-release-scl && \
    yum -y install devtoolset-7 devtoolset-7-libatomic-devel
ENV CC=/opt/rh/devtoolset-7/root/usr/bin/gcc \
    CPP=/opt/rh/devtoolset-7/root/usr/bin/cpp \
    CXX=/opt/rh/devtoolset-7/root/usr/bin/g++ \
    PATH=/opt/rh/devtoolset-7/root/usr/bin:$PATH \
    LD_LIBRARY_PATH=/opt/rh/devtoolset-7/root/usr/lib64:/opt/rh/devtoolset-7/root/usr/lib:/opt/rh/devtoolset-7/root/usr/lib64/dyninst:/opt/rh/devtoolset-7/root/usr/lib/dyninst:/opt/rh/devtoolset-7/root/usr/lib64:/opt/rh/devtoolset-7/root/usr/lib:$LD_LIBRARY_PATH

# python 3.6
RUN yum -y install rh-python36
ENV PATH=/opt/rh/rh-python36/root/usr/bin:$PATH

# install other yosys dependencies
RUN yum install -y flex tcl tcl-devel libffi-devel git graphviz readline-devel glibc-static wget autoconf && \
    wget https://ftp.gnu.org/gnu/bison/bison-3.0.1.tar.gz && \
    tar -xvzf bison-3.0.1.tar.gz && \
    cd bison-3.0.1 && \
    ./configure && \
    make -j$(nproc) && \
    make install

COPY . /yosys

FROM builder-notcached AS builder-cached
COPY --from=openroad/yosys /yosys/build /yosys/build

FROM builder-${BUILD} AS builder-final
WORKDIR /yosys
RUN make PREFIX=build config-gcc-static-tcl-dynamic
RUN make PREFIX=build -j$(nproc)
RUN make PREFIX=build install

FROM centos:centos6 AS runner-development
COPY --from=builder-final /yosys /yosys

FROM centos:centos6 AS runner-production
RUN yum update -y && yum install -y readline-devel tcl-devel libffi-devel
COPY --from=builder-final /yosys/build/bin/yosys /build/yosys
COPY --from=builder-final /yosys/build/bin/yosys-abc /build/yosys-abc
COPY --from=builder-final /yosys/build/bin/yosys-config /build/yosys-config
COPY --from=builder-final /yosys/build/bin/yosys-filterlib /build/yosys-filterlib
COPY --from=builder-final /yosys/build/bin/yosys-smtbmc /build/yosys-smtbmc

FROM runner-${ENVIRONMENT}
RUN useradd -ms /bin/bash openroad
USER openroad
~~~

## What Went Wrong?

The same source of problem: `COPY . /yosys`. It turns out that the `COPY` command of Dockerfile does **NOT** preserve all metadata of files (especially timestamps). This means that when we `COPY` files to the Docker image being created, all files get a fresh new `last modified` date. This basically breaks all assumptions I mistakenly made in the beginning. So, the `COPY` command not only copies everything in the source directory if **one** file changed, but also gives a fresh new timestamp to all files! meh! 

Although there is an option in the `COPY` command that changes the ownership of the copied content ([see reference](https://docs.docker.com/engine/reference/builder/#copy)), there is no flag to preserve timestamps. There was a proposal to come up with a solution around this problem. See [Ability to filter ADD / COPY during docker build, based on DIFF](https://github.com/moby/moby/issues/13982). But the issue got closed for reasons in the discussion thread there. 


## Did I Ever Cache Results with Docker?

Yes! I implemented two Dockerfiles. One called `Dockerfile.dev` that only builds the dependencies of the tool. Then, in order to build the actual tool, I do it during `docker run` and mount the source directory inside the container. The `build` directory is preserved on the host after the `docker run` finishes. The other file is the `Dockerfile` presented in the beginning of this post, which is used for release purposes. The final Docker command for build looks something like: `docker run -v $(pwd):/yosys yosys bash -c 'cd /yosys && make'`


## Now What?

Don't try to over-engineer a solution like the one presented above. The force of nature is stronger than any developer! This post is an attempt to write about failures that waste developers time, similar to how we write about our successes. At the end, they both try to save some other developer's time.

If you feel this will save someone else's time, share it with them :) 