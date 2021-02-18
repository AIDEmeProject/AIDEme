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

class ModelVisualization extends Component{

    constructor(props){

        super(props)
        this.state = {
            confirmedPredictions: this.props.visualizationData.predictions.map(e => null)
        }
    }

    render(){
        
        if ( ! this.props.showModelVisualisation){
            return (<div></div>)
        }

        var predictions = this.props.visualizationData.predictions.map(e => {
            return {
                id: e.dataPoint.id,
                label: e.label,
                data: e.dataPoint.data.array
            }
        })
               
        return (
            <div>
                <div className="row">
                    <div className="col col-lg-6 offset-lg-3">
        
                        <p>
                            We ran the current model of several example of the dataset so that you can check
                            if the model     
                        </p>

                        {
                            this.props.visualizationData.TSMBound &&  
                        
                            <p>                    
                                Estimated model performance >= {this.props.visualizationData.TSMBound * 100} %
                            </p>

                        }
                        
                        <p>
                            Estimated accuracy : {this.state.estimatedRate}
                        </p>

                        </div>
                    </div>
                <table className='predicted'>
                    <thead>
                        <tr>
                            <th>
                                Id
                            </th>
                            
                            {                                
                                this.props.chosenColumns.map((c, i) => {
                                    return (
                                        <th
                                            key={i}
                                        >
                                            {c.name}
                                        </th>
                                    )
                                })                     
                            }
                            <th>
                                Predicted Label
                            </th>                            
                        </tr>
                    </thead>
                
                    {
                        predictions.map((data, i) => {
                            return (
                                <tr key={i}>

                                    <td>
                                        {data.id}
                                    </td>

                                    {
                                        data.data.map( (d, j) => {
                                            return (
                                                <td
                                                    key={j}
                                                >
                                                    {d}
                                                </td>

                                            )
                                        })
                                    }

                                    <td>
                                        {data.label}
                                    </td>

                                    <td>
                                        <button 
                                            data-i={i}
                                            onClick={this.onValidatePrediction.bind(this)}
                                            className="btn ">
                                            Yes
                                        </button>

                                                                                <button 
                                            data-i={i}
                                            onClick={this.onRefusePrediction.bind(this)}
                                            className="btn ">
                                            No
                                        </button>

                                    </td>
                                </tr>
                            )
                        })
                    }                    
                </table>
            </div>
        )
    }

    onValidatePrediction(e){
        var i = e.target.dataset.i

        var predictions = this.state.confirmedPredictions.map(e => e)
        predictions[i] = true
        
        var estimatedRate = predictions.reduce((acc, e, j) => {
            
            return acc + predictions[j] * 1
        }, 0) 
        
        this.setState({
            confirmedPredictions: predictions,
            estimatedRate: estimatedRate / predictions.length
        })
    }

    onRefusePrediction(e){
        var i = e.target.dataset.i

        var predictions = this.state.confirmedPredictions.map(e => e)
        predictions[i] = false
        
        var estimatedRate = predictions.reduce((acc, e, j) => {
            
            return acc + predictions[j] * 1
        }, 0) 
        

        this.setState({
            confirmedPredictions: predictions,
            estimatedRate: estimatedRate / predictions.length
        })
    }
}

ModelVisualization.defaultProps = {
  
    visualizationData: {
        predictions: [
            
            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            },


            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Negative"
            },


            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            },
            {                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            },
            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            },{
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            },
            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Negative"
            },
            {
                
                dataPoint: {
                    id: 13,
                    data: {array: [20, 20]},
                },
                label: "Positive"
            }
        ]
    },
    showModelVisualisation: true
}

export default ModelVisualization