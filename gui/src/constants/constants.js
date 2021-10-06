/*
 *  Copyright 2019 École Polytechnique
 *
 * Authorship
 *   Luciano Di Palma <luciano.di-palma@polytechnique.edu>
 *   Enhui Huang <enhui.huang@polytechnique.edu>
 *   Le Ha Vy Nguyen <nguyenlehavy@gmail.com>
 *   Laurent Cetinsoy <laurent.cetinsoy@gmail.com>
 *
 * Disclaimer
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 *   TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 *   CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *   IN THE SOFTWARE.
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
