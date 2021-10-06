# AIDEme

AIDEme is a scalable interactive data exploration system for efficiently learning a user interest pattern over a large dataset. 
The system is cast in a principled active learning (AL) framework which iteratively presents strategically selected records for user labeling, 
thereby building an increasingly-more-accurate model of the user interest. 

However, existing AL techniques experience slow convergence when learning the user interest on large datasets. To overcome this problem, 
AIDEme explores properties of the user labeling process and the class distribution of observed data to design new AL algorithms, 
which come with provable results on model accuracy and approximation, and have evaluation results showing much improved convergence over 
existing AL methods while maintaining interactive speed.

This software is released under the BSD-3 license.

## Instructions
To start our demo, you simply have to follow the two main steps below:

- Start the **backend** server found in the `api` folder, whose instructions can be found in the [api/README.md](api/README.md) file.

- Start the **frontend** server found in the `gui` folder, whose instructions can be found in the [gui/README.md](gui/README.md) file.

Example datasets can be found in the [`data`](data) folder. Once the servers are running, you can for example select
the [Car dataset](data/cars_raw.csv) for exploration and let the system guide you towards an interesting 
subset of vehicles.

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
