# AIDEme Web

## Introduction

AIDEme Web is the web application built upon AIDEme system. It allows a user-friendly interface to find samples of interest in a large dataset via interactive learning.

More precisely, in interactive sessions, it allows user to:

- Upload a dataset without missing values in csv format (with comma, semicolon, or tab as delimiter).

- Explore the columns of the dataset with histogram plots.

- Select columns, factorization groups (optional), and algorithm for the interactive learning. The supported algorithms are Simple Margin and Version Space for the non-factorization case. In the factorization case, Factorized Dual Space Model (DSM) and Subspatial Version Space are used underneath.

- Label samples randomly and/or through filtering (faceted search) until at least one negative and one positive are found.

- Label samples suggested by the algorithm to find all samples of interest in the dataset.

- View labeling history.

- View predictions plots (model predictions and polytope predictions in case of DSM).

- Download all predicted labels of the dataset.

In trace sessions, the application allows user to:

- Upload a dataset, choosen columns, a list of labeled samples, and a plot of f1 score.

- Compute the predictions after each labeled sample (or after the first two positive and negative labeled sample).

- View labeling history and predictions plots.

- Save the current trace session.

- Load a saved trace session.

## Limits

- Datasets without missing values are supported.

## Links

- AIDEme project website: [https://www.lix.polytechnique.fr/aideme](https://www.lix.polytechnique.fr/aideme)
- AIDEme python package: [https://gitlab.inria.fr/aideme/aideme](https://gitlab.inria.fr/aideme/aideme)
- AIDEplus (frontend + java backend + django backend): [https://gitlab.com/lcetinsoy/aideplus-mirror](https://gitlab.com/lcetinsoy/aideplus-mirror)

## Source code

### Old version

For the old AIDEme system in java, a web application with frontend in javascript, backend in java and python were built.

- The frontend and the backend code is in the branch `v2-dsm-fix` in the [AIDEplus](https://gitlab.com/lcetinsoy/aideplus-mirror) repo.

### New version

For the new AIDEme system in python, the java backend is translated into python. The frontend is also adjusted to fit with the new AIDEme system.

- The backend python code is in the branch `master` of the `api` folder.

- The frontend javascript code is in the branch `python` of the `src/frontend/gui` folder in the [AIDEplus](https://gitlab.com/lcetinsoy/aideplus-mirror) repo.

Each folder has its own `README.md` file describing how to setup and run the server.

## Updates

New updates with respect to the old [frontend and backend (in java)](https://gitlab.com/lcetinsoy/aideplus-mirror) are listed below.

In the frontend code:

- A large number of unused variables and functions were removed.

- The code were formatted with the formatter prettier.

- Bugs in Data upload, Attribute selection, Factorization groups, Algorithm selection, Faceted search, Model behavior, and Trace session were fixed.

- Improvements in Factorization groups, Faceted search, History display, and Model behavior were made.

In the backend code:

- The core AIDEme python is included via install from its repo. This separation allows easy maintenance and development. Functions in the package that are used in the backend are tested to ensure easy problem detection. These tests are included in `tests/aideme` and are run together with other end-to-end and unit tests.

- Managing sessions is introduced in the branch `web`.

- End-to-end tests for all endpoints are included. Unit tests for important functions are included as well.

## Issues

The list of issues and suggestions is found in `BACKLOG.md`.
