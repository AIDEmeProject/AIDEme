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