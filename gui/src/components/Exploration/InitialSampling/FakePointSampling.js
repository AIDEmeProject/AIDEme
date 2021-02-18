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

import $ from 'jquery'
import {backend, webplatformApi} from '../../../constants/constants'

class FakePointSampling extends Component{

    constructor(props){
        
        super(props)

        this.state = {
            
            fakePoint: this.props.pointToLabel
        }        
    }
    
    render(){
        console.log(this.props)
        
        return (
            <div>
               
                <h4>
                    Fake point initial sampling
                </h4>

                <p>
                    We have created a fake point. It was created by taking the median value of t
                    the numerical columns and the the most common category.

                    Please change the attribute of the point until you reach a point which
                    would belong to the positive class
                </p>

                <table>
                    <thead>
                        <tr>
                            {
                                this.props.availableVariables.map((v, i) => {
                                    return (
                                        <th key={i}>
                                            { v.name }
                                        </th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {
                                this.state.fakePoint.map((col, i) => {
                                
                                return (
                                    <td
                                        key={i}
                                    >                                        
                                        <button
                                            data-col={i}
                                            className="btn"
                                            onClick={this.increaseValue.bind(this)}                            
                                        >
                                            <i 
                                                className="material-icons"
                                                data-col={i}
                                            >
                                                keyboard_arrow_up
                                            </i> 
                                        </button>                                        

                                        <span>
                                            <input value={col} />
                                        </span>

                                        <button 
                                            
                                            className="btn"
                                            onClick={this.decreaseValue.bind(this)}     
                                            data-col={i}                                   
                                        >
                                            <i 
                                                className="material-icons"         
                                                data-col={i}                                       
                                            >
                                                keyboard_arrow_down</i>          
                                        </button>
                                    </td>
                                )
                            })
                        }

                        <td>

                            <button 
                                onClick={this.onValidatePoint.bind(this)}
                                className="btn"
                            >
                                Validate
                            </button>
                        </td>
                    </tr>        
                </tbody>
                </table>                                
            </div>
        )
    }

    increaseValue(e){

        var i = e.target.dataset.col
        
        
        var pointToLabel = this.state.fakePoint.map(e => e)
        
        var colType = this.props.availableVariables[i].type

        if (colType == "numerical"){
            pointToLabel[i] += pointToLabel[i] * 0.1
        }
        else{
            pointToLabel[i] += 1
        }

        this.setState({
            fakePoint: pointToLabel
        })
    }

    decreaseValue(e){
        
        var i = e.target.dataset.col

        var pointToLabel = this.state.fakePoint.map(e => e)
        
        var colType = this.props.availableVariables[i].type

        if (colType == "numerical"){
            pointToLabel[i] -= pointToLabel[i] * 0.1
        }
        else{
            pointToLabel[i] = Math.max(0, pointToLabel[i] - 1)
        }

        this.setState({
            fakePoint: pointToLabel
        })
    }

    onValidatePoint(){

        this.props.onFakePointValidation(this.state.fakePoint)
        
       
    }
}



export default FakePointSampling