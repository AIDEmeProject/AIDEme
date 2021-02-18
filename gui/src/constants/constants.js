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

var factorizedVersionSpaceConfiguration ={
    "activeLearner": {
        "learners": {
            "name": "MajorityVote",
            "sampleSize": 8,
            "versionSpace": {
                "addIntercept": true, 
                "decompose": false,
                "hitAndRunSampler": {
                    "cache": true,
                    "rounding": true, 
                    "roundingCache": false, 
                    "selector": {
                        "name": "WarmUpAndThin",
                        "thin": 64,
                        "warmUp": 256 
                    } 
                },
                "jitter": 1e-09, 
                "kernel": {
                    "gamma": 0, 
                    "name": "gaussian" 
                },
                "solver": "ojalgo" 
            } 
        }, 
        "lossFunctionId": "GREEDY", 
        "name": "SubspatialSampler", 
      
    },
    "subsampleSize": 50000, 
    "task": "sdss_overlapping_0.1%", 
    "useFactorizationInformation": true
} 

var versionSpaceConfiguration = {
    "activeLearner": {
        "learner": {
            "name": "MajorityVote", // MajorityVote | SVM |
            "sampleSize": 8, // Only for MajorityVote : >= 1
            "versionSpace": {
                "addIntercept": true,
                "hitAndRunSampler": {
                "cache": true,
                "rounding": true,
                "selector": {
                    "name": "WarmUpAndThin", // Only For Majority Vote
                    "thin": 10,
                    "warmUp": 100
                }
                },
                "kernel": {
                    "name": "gaussian"
                },
                "solver": "ojalgo"
            }
        },
        "name": "UncertaintySampler" //Version space = uncertainty sampler
    },
    "subsampleSize": 50000,
    "task": "sdss_Q4_0.1%"
}


var simpleMarginConfiguration = {

    "activeLearner": {
        "name": "SimpleMargin",
        "svmLearner": {
            "C": 1024,
            "kernel": {
                "gamma": 0,
                "name": "gaussian"
            },
            "name": "SVM"
        }
    },
    "subsampleSize": 50000,    
    "useFactorizationInformation": false
}

var algorithmNames = {
    'simplemargin': 'Simple Margin (SVM)',
    'simplemargintsm': 'Simple Margin (SVM) + TSM',
    'versionspace': 'Version Space',
    'factorizedversionspace': 'Factorized Version Space'
}

module.exports = {
    backend: "http://localhost:7060",
    webplatformApi: "http://localhost:8000/api",
    defaultConfiguration: versionSpaceConfiguration,

    versionSpaceConfiguration: versionSpaceConfiguration,
    
    simpleMarginConfiguration: simpleMarginConfiguration,
    
    factorizedVersionSpaceConfiguration: factorizedVersionSpaceConfiguration,

    algorithmNames: algorithmNames
}
