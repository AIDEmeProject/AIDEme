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

import React, { Component } from 'react';
import Dataset from '../model/Dataset'

class PointLabelisation extends Component{
    
    render(){
        const dataset = this.props.dataset
        return (
            <div className="">
                <div className="row">
                    <div className="col col-lg-8 offset-lg-2">
                        <p>
                            Please label the following examples
                        </p>
                  

                <table className="table-label">
                    <thead>                        
                        <tr>                        
                            

                            {
                                this.props.chosenColumns.map((column, key) => {
                                    
                                    return (
                                        <th key={key} >
                                            {column.name} 
                                        </th>
                                    )
                                })
                            }

                                                                             
                        </tr>
                    </thead>

                    <tbody>
                    
                {
                    this.props.pointsToLabel.map((point, key) => {
                        const pointData = this.props.dataset.get_selected_columns_point(point.id)
                        return (

                            <tr key={key}>

                               
                      
                                {

                                    pointData.map((value, valueKey) => {
                                        return (
                                            
                                            <td
                                                key={valueKey}
                                                data-toggle="tooltip"
                                                data-placement="top" 
                                                title={value}
                                            >
                                                {Dataset.displayValue(value)}
                                            </td>
                                        )
                                    })
                                }

                               
                            </tr>
                        )
                    })                    
                }
                </tbody>

                </table>

                <table className="table-control">
                    <thead>
                        <tr>
                            <th>Label</th>
                        </tr>

                    </thead>
                    <tbody>
                        {
                        this.props.pointsToLabel.map((point, key) => {
                            
                            return (

                                <tr key={key}>

                                    
                                    <td className="button-td">
                                        <button
                                            className="btn btn-raised btn-primary" 
                                            data-key={key} 
                                            onClick={e => this.props.onPositiveLabel(e)}>
                                            Yes
                                        </button>

                                        <button 
                                            className="btn btn-raised btn-primary"  
                                            data-key={key} 
                                            onClick={e => this.props.onNegativeLabel(e)}
                                        >
                                            No
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>

            </div>
                </div>
        )   
    }        
}

export default PointLabelisation