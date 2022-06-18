---
layout: post
title: Getting Started with OpenROAD (Part 2)
image: /assets/img/posts/openroad/logo-2.png
comments: true
description: >
  In these posts, I give a hands-on tutorial on using the OpenROAD application.
excerpt_separator: <!--more-->
---

In the [previous post](/tech/eda/2019-12-06-getting-started-with-openroad-1/), I have given a brief introduction on physical design and the steps needed to manufacture a hardware circuit. In this post, I will showcase the use of OpenROAD tools to perform the tasks discussed in the physical design process.


# Prerequisites

## Machine specs
To follow up with this tutorial, we recommend the use of a machine with 4GB+ of RAM to build and run the tools. However, if you are using big designs, more memory is required for the tools to perform their computations in a timely manner.

<!--more-->

> Disclaimer: I'm part of OpenROAD project team. Thanks to all my colleagues for putting together this effort.

> NOTE: If you are reading this post after July 2020, the chances are that this post is obsolete and there is another up-to-date writing on OpenROAD. Please, see other posts on this blog or refer to the OpenROAD website.

## Operating system
While the tools can theoretically be built on Linux, Windows and Mac, they have been tested only on CentOS 7. If you have a MacOS or a Windows machine, please, [install Docker](https://docs.docker.com/v17.09/engine/installation/) to follow up with the tutorial.

## Install the required packages

### Bare-metal

1. Install essential build tools
  ~~~shell
  yum group install -y "Development Tools"
  yum -y install centos-release-scl
  yum -y install devtoolset-8 devtoolset-8-libatomic-devel
  ~~~

2. Install CMake
  ~~~shell
  wget https://cmake.org/files/v3.14/cmake-3.14.0-Linux-x86_64.sh
  chmod +x cmake-3.14.0-Linux-x86_64.sh
  ./cmake-3.14.0-Linux-x86_64.sh --skip-license --prefix=/usr/local
  ~~~

3. Install development dependencies
  ~~~shell
  yum install -y wget git
  wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
  yum install -y epel-release-latest-7.noarch.rpm
  yum install -y tcl-devel tcl tk libstdc++ tk-devel boost-devel
  ~~~

4. Install Python development dependencies
  ~~~shell
  yum install -y https://centos7.iuscommunity.org/ius-release.rpm
  yum update -y
  yum install -y python36u python36u-libs python36u-devel python36u-pip
  ~~~

### Docker
A docker image with all required packages pre-installed is available at [openroad/openroad:base](https://hub.docker.com/repository/docker/openroad/openroad). Use the following command to pull the image from Docker Hub.

~~~shell
docker pull openroad/openroad:base
~~~

## Build OpenROAD

1. Clone the repository
  ~~~shell
  git clone --recursive https://github.com/The-OpenROAD-Project/OpenROAD.git
  ~~~

2. Change to repo directory
  ~~~shell
  cd OpenROAD
  ~~~
    If you are using Docker, then run the following command and continue working inside the container for the rest of the tutorial.
    ~~~shell
    docker run -it -v $(pwd):/OpenROAD openroad/openroad:base bash
    cd /OpenROAD
    ~~~

3. Build OpenROAD
  ~~~shell
  mkdir build
  cd build
  cmake ..
  make -j 4
  make install
  ~~~

4. Test OpenROAD
  ~~~shell
  openroad -version
  ~~~
    You should see openroad version printed out along with the hash of the build.

## Prepare your data

### Technology Node
Typically, a fabrication lab provides designers with the necessary files that describe supported cells along with their physical and geometric characteristics. These files are referred to as [Standard Cell Library](https://en.wikipedia.org/wiki/Standard_cell).

In this tutorial, we will use an open-source library called [Nangate](https://projects.si2.org/openeda.si2.org/help/group_ld.php?group=63). For your convenience, I provide direct download links:
- [nangate.lib](/assets/eda/nangate.lib): the lib file includes descriptions of the standard cell functionalities, along with some of their physical properties such as timing and power.
- [nangate.lef](/assets/eda/nangate.lef): the lef file (or [library exchange format](https://en.wikipedia.org/wiki/Library_Exchange_Format)) includes specification of the cell geometries and metal layers, in addition to the design rules for the target technology.

The original library file can be downloaded from [here](https://github.com/The-OpenROAD-Project/alpha-release/tree/master/flow/platforms/nangate45).
See licence information of using this library [here](/assets/eda/OpenCellLibraryLicenseSi2.txt).

### Design
There are many open-source designs that you can try out from [EPFL benchmark suite](https://github.com/lsils/benchmarks) and [OpenCores](https://opencores.org/). In this tutorial, we will use a simple design that calculates the *greatest common divisor (GCD)* between two numbers. For your convenience, you can download a netlist of the design from [here](/assets/eda/gcd_netlist.v).

The original design file can be downloaded from [here](https://github.com/The-OpenROAD-Project/alpha-release/tree/master/flow/designs/src/gcd).

## Run OpenROAD
After copying the above files to the `build` directory, run OpenROAD application
~~~shell
openroad
% <type-commands-here>
~~~

**1. Load LEF file**
~~~shell
% read_lef nangate.lef
~~~

**2. Load netlist**
~~~shell
% read_verilog gcd_netlist.v
% link_design gcd
~~~

**3. Save a temporary state of the database**
~~~shell
% write_db gcd_tutorial.db
~~~

> NOTE: At this point, the application is ready to perform the physical design operations we discussed in the [previous post](/tech/eda/2019-12-06-getting-started-with-openroad-1/). At any point in time, you can just load the database file (gcd_tutorial.db) and execute the commands available in the tool.


**4. Floorplanning**
This command initializes the chip with a utilization of 70%.
~~~shell
% initialize_floorplan -utilization 70 -site FreePDK45_38x28_10R_NP_162NW_34O
~~~

This command places IO pins around the chip boundaries.
~~~shell
% auto_place_pins metal8
~~~

**5. Placement**
~~~shell
% global_placement
% legalize_placement
~~~

You should see the following report printed out:

```
CoreArea: 
0.000000 : 0.000000 - 52060.000000 : 50400.000000
DieArea: 
0.000000 : 0.000000 - 52060.000000 : 50400.000000
 non_group_cell_region_assign done ..
 - - - - - - - - - - - - - - - - - - - - - - - - 
 non_group_cell_placement done .. 
 - - - - - - - - - - - - - - - - - - - - - - - - 
 ==== CHECK LEGALITY ==== 
 row_check ==>> PASS 
 site_check ==>> PASS 
 power_check ==>> PASS 
 edge_check ==>> PASS 
 placed_check ==>> PASS 
 overlap_check ==>> PASS 
-------------------- DESIGN ANALYSIS ------------------------------
  total cells              : 322
  multi cells              : 0
  fixed cells              : 0
  total nets               : 393
  design area              : 2623824000.0000
  total f_area             : 0.0000
  total m_area             : 1920520000.0000
  design util              : 73.1955
  num rows                 : 18
  row height               : 2800.0000
-------------------------------------------------------------------
```

**6. Save results**
~~~shell
% write_def gcd_placed.def
~~~
This writes the design to a [Design Exchange Format](https://en.wikipedia.org/wiki/Design_Exchange_Format) that can be used later (or with other open-source tools).

### What's next?
This tutorial does not include the logic synthesis step, nor the routing step. This will be continued in Part 3.


Please, leave questions in the comments below and I will respond as soon as possible ..
