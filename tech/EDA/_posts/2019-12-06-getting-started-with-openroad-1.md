---
layout: post
title: Getting Started with OpenROAD (Part 1)
image: /assets/img/posts/openroad/logo-1.png
comments: true
description: >
  In these posts, I give a hands-on tutorial on using the OpenROAD application.
excerpt_separator: <!--more-->
---

In digital design, a circuit is described in a hardware description language (e.g. Verilog) and the goal is to manufacture it.
To get the actual layout of the circuit that is manufacturable, it needs to pass through a number of steps before handing it over to a fabrication lab.
In this post, I briefly give an overview of the steps and show how to perform them using open-source tools in OpenROAD.

Website: [https://theopenroadproject.org/](https://theopenroadproject.org/)

GitHub: [https://github.com/The-OpenROAD-Project](https://github.com/The-OpenROAD-Project)

Twitter: [https://twitter.com/OpenROAD_EDA](https://twitter.com/OpenROAD_EDA)

<!--more-->

# Before you read
This post assumes that you have some background on hardware design. 
No programming knowledge is required to use the tools. 
Physical design knowledge is a plus, but not necessary.
When appropriate, I give some links to Wikipedia articles to refer to.

This post assumes that you have some background on hardware design. 
No programming knowledge is required to use the tools. 
Physical design knowledge is a plus, but not necessary.
When appropriate, I give some links to Wikipedia articles to refer to.

 > Disclaimer: I'm part of OpenROAD project team. Thanks to all my colleagues for putting together this effort.

 > NOTE: If you are reading this post after July 2020, the chances are that this post is obsolete and there is another up-to-date writing on OpenROAD. Please, see other posts on this blog or refer to the OpenROAD website.

# So, you have a circuit design ..
.. and you want to get it manufactured. For example, the below is a desciption of a multiplier circtuit in Verilog.

~~~verilog
module multiplier(clk, a, b, c); 
  input clk;
  input [7:0] a, b; 
  output reg [15:0] c;
  
  always @(posedge clk) 
    c <= a*b;
endmodule
~~~

This is a simple circuit that takes two inputs, `a` and `b`, 8 bits each and multiplies them to produce the result in a 16-bit register `c`.
We call this abstraction [Register-Transfer Level (RTL)](https://en.wikipedia.org/wiki/Register-transfer_level) because it models the functionality of a synchronous digital circuit in terms of the flow of digital signals (data) between hardware registers, and the logical operations performed on those signals. Although the multiplier circuit is less than 10 lines of code, the gate representation of the circuit is not simple. Gate representation are the actual [logic gates](https://en.wikipedia.org/wiki/Logic_gate) that implement the functionality of the circuit, such as `AND`, `OR` and `NOT`.

# Logic Synthesis
```
Input: RTL (design.v)
Output: Gate-level (netlist.v)
```

[Logic synthesis](https://en.wikipedia.org/wiki/Logic_synthesis) is the first step in this flow, which takes as input the RTL (basically the Verilog design) and outputs a [gate-level netlist](https://en.wikipedia.org/wiki/Netlist) that describes the connectivity of the logic gates. 
The logic synthesis tool takes care of this transformation. One such open-source tool is [Yosys](https://github.com/YosysHQ/yosys).

# Physical Design
```
Input: Gate-level netlist (netlist.v)
Output: Graphic Database System format (layout.gds)
```

Logic circuits are manufactured using [transistors](https://en.wikipedia.org/wiki/Transistor). A combination of transistors arranged in a specific layout perform the functionality of a logic gate. The goal of the [Physical Design](https://en.wikipedia.org/wiki/Physical_design_(electronics)) step is to obtain the geometric representations of the shapes (of transistors and wire interconnects), that when manufactured in the corresponding layers of material, will produce the required functionality of the circuit (e.g. multiply two numbers). This layout description is defined in a binary format called [GDSII](https://en.wikipedia.org/wiki/GDSII).

**But how can we go from Netlist to GDS?**

There are several steps that are necessary to complete in order to get a manufacturable circuit. Let's give a high-level overview on them below.

## Floorplanning

[Floorplanning](https://en.wikipedia.org/wiki/Floorplan_(microelectronics)) produces a tentative representation of where the major blocks of the circuits are placed. In particular, we want to specify the following:

* What is the area of the chip? And what are the dimensions within which, the gates and wires will be placed?
* Where are the input and output pins? For example, in the multiplier above, we have 8 pins for input `a`, 8 pins for input `b`, 1 pin for the `clk` input and 16 pins for the output `c`. Now, where on the perimeter of the chip should these pins be placed?
* How are we connecting power/ground to each of the individual gates? This is known as the [Power Delivery Network (PDN)](https://en.wikipedia.org/wiki/Power_network_design_(IC)).
* Are we placing macros or IP blocks somewhere on the chip? Where are they located? Should they be connected to any IO pins?

OpenROAD has tools that automates the above process. See: [ioPlacer](https://github.com/The-OpenROAD-Project/ioPlacer), [MacroPlacer](https://github.com/The-OpenROAD-Project/TritonMacroPlace), [pdn](https://github.com/The-OpenROAD-Project/pdn) and [tapcell](https://github.com/The-OpenROAD-Project/tapcell).

## Placement
[Placement](https://en.wikipedia.org/wiki/Placement_(electronic_design_automation)) is the step where we identify the exact locations of the different circuit components (i.e. cells). The exact location is given by the `(x,y)` coordinates of the cell on the chip described in the floorplanning step.

In modern placement tools, this step is divided into global placement and detailed placement. Global placement distributes all the cells to appropriate locations in the global scale with some overlaps (which violates the design rules). Detailed placement shifts each instance to nearby legal location with very moderate layout change so that the layout is correct and can be manufactured.

OpenROAD has tools that automates the placement process. See [RePlAce](https://github.com/The-OpenROAD-Project/RePlAce) and [OpenDP](https://github.com/The-OpenROAD-Project/OpenDP).

## Clock Tree Synthesis
When circuits have sequential elements that require synchronization, such as [flip-flops](https://en.wikipedia.org/wiki/Flip-flop_(electronics)), [Clock Tree Synthesis (CTS)](https://vlsibasic.blogspot.com/2014/01/clock-tree-synthesis.html?m=1) is the process that distributes the `clk` signal evenly to all sequential elements of the circuit. The goal of the CTS step is to reduce clock [skew](https://en.wikipedia.org/wiki/Clock_skew) and [latency](https://en.wikipedia.org/wiki/Clock_synchronization).

OpenROAD uses [TritonCTS](https://github.com/The-OpenROAD-Project/TritonCTS) to generate the clock tree.

## Routing
Now that we know the location of every element in the circuit (also referred to as cells), we want to describe how these elements are wired. Wires are defined as an exact geometric path on the metal layers that are used for fabrication. This is where the [Routing](https://en.wikipedia.org/wiki/Routing_(electronic_design_automation)) step comes into place. It builds upon the placement step in order to have a fully connected circuit that functions properly. 

The challenge in the placement/CTS/routing steps is that all of the algorithms used have to obey some technology rules (i.e. constraints) while describing the layout of the circuit. These are also referred to as **Design Rules**, and they are usually given by the technology foundry that are targeted for manufacturing.

OpenROAD uses [FastRoute](https://github.com/The-OpenROAD-Project/FastRoute) and [TritonRoute](https://github.com/The-OpenROAD-Project/TritonRoute) as the global and detailed routing tools respectively.

# Getting Started with OpenROAD

Now, that we understand the main steps involved in physical design, we are ready to see how they are performed in OpenROAD.

OpenROAD targets a no-human-in-loop (NHIL) design. 
No humans means that tools must adapt and self-tune, and never get stuck within the layout generation process. 
That's why using OpenROAD tools doesn't require the knowledge of physical design.

## What you need to know

**The OpenROAD v1.0 tool, to be released in July 2020, will be capable of push-button, DRC-clean RTL-to-GDS layout generation in a commercial FinFET process node.**

The tool is currently visible at: [https://github.com/The-OpenROAD-Project/OpenROAD](https://github.com/The-OpenROAD-Project/OpenROAD)

In its v1.0 form, it will be integrated on an incremental substrate provided by the [OpenDB](https://github.com/The-OpenROAD-Project/OpenDB) database and the [OpenSTA](https://github.com/The-OpenROAD-Project/OpenSTA) static timing engine.
It will also offer users and developers Tcl/Python scripting interfaces, and support SoC designs.
At the same time, the functionality of OpenROAD v1.0 will be highly limited relative to that of commercial EDA tools that IC designers are familiar with. 
Further, the development resources of the OpenROAD project are being largely focused on support of a ~July 2020 SoC tapeout in a commercial FinFET node.

Please, refer to [OpenROAD v1.0 Expectations](https://vlsicad.ucsd.edu/NEWS19/OpenROAD%20RTL-to-GDS%20v1.0%20Expectations.pdf) for a detailed description on the capabilities of the tools used.

## Installing the tools

Continue to [Part 2](/tech/eda/2019-12-06-getting-started-with-openroad-2/) ..


Please, leave questions in the comments below and I will respond as soon as possible ..