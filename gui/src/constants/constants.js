/*
 * Copyright (c) 2019 École Polytechnique
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0
 *
 * Authors:
 *       Luciano Di Palma <luciano.di-palma@polytechnique.edu>
 *       Enhui Huang <enhui.huang@polytechnique.edu>
 *       Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
 *
 * Description:
 * AIDEme is a large-scale interactive data exploration system that is cast in a principled active learning (AL) framework: in this context,
 * we consider the data content as a large set of records in a data source, and the user is interested in some of them but not all.
 * In the data exploration process, the system allows the user to label a record as “interesting” or “not interesting” in each iteration,
 * so that it can construct an increasingly-more-accurate model of the user interest. Active learning techniques are employed to select
 * a new record from the unlabeled data source in each iteration for the user to label next in order to improve the model accuracy.
 * Upon convergence, the model is run through the entire data source to retrieve all relevant records.
 */

export const SIMPLE_MARGIN = "SimpleMargin";
export const VERSION_SPACE = "KernelVersionSpace";
export const FACTORIZED_DUAL_SPACE_MODEL = "FactorizedDualSpaceModel";
export const FACTORIZED_VERSION_SPACE = "SubspatialVersionSpace";

export const simpleMarginConfiguration = {
  name: SIMPLE_MARGIN,
  params: {
    C: 100000.0,
  },
};

export const versionSpaceConfiguration = {
  name: VERSION_SPACE,
  params: {
    decompose: true,
    n_samples: 16,
    warmup: 100,
    thin: 100,
    rounding: true,
    rounding_cache: true,
    rounding_options: {
      strategy: "opt",
      z_cut: true,
      sphere_cuts: true,
    },
  },
};

export const factorizedDualSpaceConfiguration = {
  name: FACTORIZED_DUAL_SPACE_MODEL,
  params: {
    active_learner: {
      name: "SimpleMargin",
      params: {
        C: 100000.0,
      },
    },
  },
};

export const factorizedVersionSpaceConfiguration = {
  name: FACTORIZED_VERSION_SPACE,
  params: {
    loss: "PRODUCT",
    decompose: true,
    n_samples: 16,
    warmup: 100,
    thin: 100,
    rounding: true,
    rounding_cache: true,
    rounding_options: {
      strategy: "opt",
      z_cut: true,
      sphere_cuts: true,
    },
  },
};

export const subsampling = 50000;

export const allLearnerConfigurations = {
  [SIMPLE_MARGIN]: simpleMarginConfiguration,
  [VERSION_SPACE]: versionSpaceConfiguration,
  [FACTORIZED_DUAL_SPACE_MODEL]: factorizedDualSpaceConfiguration,
  [FACTORIZED_VERSION_SPACE]: factorizedVersionSpaceConfiguration,
};

export const allLearners = [
  {
    value: SIMPLE_MARGIN,
    label: "Simple Margin (SVM)",
  },
  {
    value: FACTORIZED_DUAL_SPACE_MODEL,
    label: "Simple Margin (SVM) + TSM",
  },
  {
    value: VERSION_SPACE,
    label: "Version Space",
  },
  {
    value: FACTORIZED_VERSION_SPACE,
    label: "Factorized Version Space",
  },
];

export const learnersInInteractiveSession = [
  {
    value: SIMPLE_MARGIN,
    label: "Simple Margin",
  },
  {
    value: VERSION_SPACE,
    label: "Version Space",
  },
];

export const backend = "http://localhost:7060";
export const webplatformApi = "http://localhost:8000/api";
