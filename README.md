# AIDEme

AIDEme is a scalable interactive data exploration system for efficiently learning a user interest pattern over a large dataset. 
The system is cast in a principled active learning (AL) framework which iteratively presents strategically selected records for user labeling, 
thereby building an increasingly-more-accurate model of the user interest. 

However, existing AL techniques experience slow convergence when learning the user interest on large datasets. To overcome this problem, 
AIDEme explores properties of the user labeling process and the class distribution of observed data to design new AL algorithms, 
which come with provable results on model accuracy and approximation, and have evaluation results showing much improved convergence over 
existing AL methods while maintaining interactive speed.

This software is released under the BSD-3 license.

## Run Instructions

Below you can find two sets of instructions for starting the demo software. Once started, you can start
using the demo by opening your browser at [`localhost:3000`](http://localhost:3000/).

### Using Docker
Running our demo is extremely simple if you have [Docker](https://www.docker.com/) installed. 
Simply open a terminal at the root folder of this project and run:

```shell
docker-compose up
```

This command will take care of starting the front and backend servers in Docker containers with all the necessary
dependencies installed.

### Manual start

To manually start our demo, you need have to follow the two steps below:

- Start the **backend** server found in the `api` folder, whose instructions can be found in the [api/README.md](api/README.md) file.

- Start the **frontend** server found in the `gui` folder, whose instructions can be found in the [gui/README.md](gui/README.md) file.


## Exploration instructions

This demo software is composed of two modes: *interactive exploration* and *traces*.  

### Interactive Exploration

In interactive exploration mode, the user can explore a dataset of their choice for elements of interest. 
To start this mode, simply click on the "Interactive Exploration" button and select a CSV file containing 
your data. An example [Car dataset](data/cars_raw.csv) is also contained into the [`data`](data) folder.

### Trace

The trace session was part of our NeurIPS demo presentation, and it allows us to replay certain query traces
from our experimental evaluation and observe how the classification models evolve as the user labels more examples. 

To run a particular trace, you simply have to select the appropriate data and metadata associated with a
particular query trace and algorithm, which can be found on the [traces](data/traces) folder. More precisely,
upon clicking on the "Trace Session" button, you have to specify five quantities:

  - *Dataset*: The [cars_encoded.csv](data/traces/cars_encoded.csv) dataset.
  - *Trace data*: The trace of a particular query and algorithm, e.g., traces/q1/trace-dsm.csv
  - *Features metadata*: The column metadata file in a given query, e.g., traces/q1/q1_columns.json
  - *F-Score plot*: A performance plot of a particular query and algorithm, e.g., traces/q1/fscore-dsm.png
  - *Algorithm*: The particular algorithm to run from the drop-down list (Simple Margin, DSM, ...)

# Websites
We also invite you to check our [website](https://www.lix.polytechnique.fr/aideme), which contains a more complete description of this project.


# References
[1] 
Enhui Huang, Luciano Palma, Laurent Cetinsoy, Yanlei Diao, Anna Liu.
[AIDEme: An active learning based system for interactive exploration of large datasets](https://nips.cc/Conferences/2019/Schedule?showEvent=15427).
NeurIPS - Thirty-third Conference on Neural Information Processing Systems, Dec 2019, Vancouver, Canada

[2] 
Luciano Di Palma, Yanlei Diao, Anna Liu. 
[A Factorized Version Space Algorithm for "Human-In-the-Loop" Data Exploration](https://hal.inria.fr/hal-02274497v2/document). 
ICDM - 19th IEEE International Conference in Data Mining, Nov 2019, Beijing, China.

[3] 
Enhui Huang, Liping Peng, Luciano Di Palma, Ahmed Abdelkafi, Anna Liu, Yanlei Diao.
[Optimization for Active Learning-based Interactive Database Exploration](http://www.vldb.org/pvldb/vol12/p71-huang.pdf). 
PVLDB - 12th Proceedings of Very Large Database Systems, Sep 2018, Los Angeles, USA.
