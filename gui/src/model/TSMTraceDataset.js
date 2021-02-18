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

import * as d3 from 'd3'

import Dataset from './Dataset'

class TSMTraceDataset extends Dataset{

    constructor(d3dataset){
        super(d3dataset)
    }

    static buildFromLoadedInput(fileContent, isCSV){
        
        var csv = isCSV ? d3.csvParse(fileContent) : d3.tsvParse(fileContent)
        var dataset = new TSMTraceDataset(csv)
        
        dataset.parse_trace()
        return dataset
    }

    get_point(id){
        return {
            id: this.point_indices[id],
            labels: this.labels[id]
        }
    }

    parse_trace(){

        this.labels = this.get_raw_col_by_name('labels').flatMap(s => {
            
            return JSON.parse(s)
            //return parseFloat(e.replace(/[\[\]']/g,'' ))                
        })
        
        this.point_indices = this.get_raw_col_by_name('labeled_indexes').flatMap(e => {
            return JSON.parse(e)
            //return parseFloat(e.replace(/[\[\]']/g,'' ))
        })    
    }
}

export default TSMTraceDataset