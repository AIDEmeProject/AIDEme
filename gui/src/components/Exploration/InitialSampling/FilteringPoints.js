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
import sendFilters from '../../../actions/sendFilters';
import PointLabelisation from '../../PointLabelisation';

import * as  d3 from "d3"

import robot from '../../../resources/robot.png'

class NumericalFilter extends Component{

    render(){

        const variable = this.props.variable        
        const values = this.props.dataset.get_column_name(variable.name)        
        const extend = d3.extent(values)

        const min = extend[0],
              max = extend[1]
        
        return (
            <div className="card filter inline-block">

                    <p>
                        {variable.name} <br />
                        range: [{this.state.minValue}, {this.state.maxValue}]
                    </p>
                    <label>
                        Min                        
                        <input 
                            value={this.state.minValue}
                            onChange={this.minChanged.bind(this)}
                            type="range"
                            min={min}
                            max={max}
                        />
                    </label>

                    <br />
                    
                    <label>
                        Max: {this.state.max}                
                        <input 
                            value={this.state.maxValue}
                            onChange={this.maxChanged.bind(this)}
                            type="range"
                            min={min}
                            max={max}
                        />
                    </label>
            </div>
        )        
    }

    constructor(props){
        super(props)
        const variable = this.props.variable
        const values = this.props.dataset.get_column_name(variable.name)        
        const extend = d3.extent(values)

        const min = extend[0],
              max = extend[1]
        
        

        this.state = {
            
            minValue: min,
            maxValue: max
        }
    }

    minChanged(e){
        var newValue = parseFloat(e.target.value)
        
        if (newValue >= this.state.maxValue){
            newValue = this.state.maxValue
        }
        this.setState({
            minValue:newValue
        })

        const iFilter = this.props.iFilter
        this.props.filterChanged(iFilter, {min: newValue})
    }

    maxChanged(e){
        var newValue = parseFloat(e.target.value)
        if (newValue <= this.state.minValue){
            newValue = this.state.minValue
        }
        
        this.setState({maxValue: newValue})

        const iFilter = this.props.iFilter
        this.props.filterChanged(iFilter, {max: newValue})
    }
}

class CategoricalFilter extends Component{

    render(){

        return (
            <div className="card filter categorical-filter inline-block">

                <p>{this.props.variable.name}</p>
                {
                    this.props.variable.values.map((value, i) => {

                        return (
                            <div>
                                <label htmlFor={"cat-filter-" + i}>
                                    {value}
                                </label>
                                <input 
                                    type="checkbox"
                                    data-value={value} 
                                    onChange={this.categoryWasClicked.bind(this)}    
                                />
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    constructor(props){
        super(props)
        this.state = {
            filterValues: []
        }
    }

    categoryWasClicked(e){

        const iFilter = this.props.iFilter
        var isIncluded = e.target.checked
        var value = e.target.dataset.value

        if (isIncluded){
            var filterValues = this.state.filterValues
            filterValues.push(value)
        }
        else{
            var filterValues = this.state.filterValues.filter( e => e !== value)
        }
        
        this.setState({
            filterValues: filterValues
        }, () => {
            this.props.filterChanged(iFilter, {filterValues: filterValues})
        })
        
    }
}

class PointFiltering extends Component{

    render(){
        return (
            <div>

                    <p className="card">
                        <span className="chatbot-talk">
                        <img src={robot} width="70" />
                        <q>
                            Filter positive points and click on get Points
                        </q>
                        </span>
                    </p>


                <p>                
                    <button
                        className="btn btn-raised"
                        onClick={this.getPoints.bind(this)}
                    >
                        Get Points
                    </button>
                </p>

                {
                    this.props.chosenVariables.map( (variable, i) => {

                        var Filter = variable.type === "numerical" ? NumericalFilter: CategoricalFilter
                        return (
                            
                            <Filter          
                                iFilter={i}   
                                filterChanged={this.filterChanged.bind(this)}
                                key={i}
                                variable={variable}   
                                dataset={this.props.dataset}                             
                            />                            
                        )
                    })
                }

                <p>                
                    <button
                        className="btn btn-raised"
                        onClick={this.getPoints.bind(this)}
                    >
                        Get Points
                    </button>
                </p>

                { 
                    this.state.points.length > 0 && 
                    <div>

                        <PointLabelisation
                            chosenColumns={this.props.chosenVariables}
                            dataset={this.props.dataset}
                            pointsToLabel={this.state.points}
                            onPositiveLabel={this.onPositiveLabel.bind(this)}
                            onNegativeLabel={this.onNegativeLabel.bind(this)}
                        />
                    </div>
                }
            </div>
        )
    }

    constructor(props){

        super(props)
        this.state = {
            filters: this.props.chosenVariables.map( e => { 
                return {
                    'columnName': e.name,                
                }
            }),
            points: []
        }        
    }

    onPositiveLabel(e){
        var iPoint = e.target.dataset.key

        var points = this.state.points
        points.splice(iPoint, 1)
        this.setState({
            points
        })

        this.props.onPositiveLabel(e)
    }

    onNegativeLabel(e){

        var iPoint = e.target.dataset.key

        var points = this.state.points
        points.splice(iPoint, 1)
        this.setState({
            points
        })
        this.props.onNegativeLabel(e)
    }

    filterChanged(iFilter, change){
        var filter = this.getFilter(iFilter)
        
        filter = Object.assign(filter, change)
        
        var filters = this.updateFilter(iFilter, filter)
        
        this.setState({
            filters: filters
        })
    }

    updateFilter(iFilter, filter){
        var filters = this.state.filters.map(e => e)
        filters[iFilter] = filter
        return filters
    }

    getFilter(iFilter){
        return this.state.filters[iFilter]
    }

    getPoints(){
        
        const filters = this.state.filters
        
        sendFilters(filters, this.pointsReceived.bind(this))
    }

    pointsReceived(points){

        var receivedPoints = points.map(e => {
            return {
                id: e.id,
                data: e.data.array
            }
        }).filter((e, i) => { return i < 25})
        this.setState({
            points: receivedPoints
        })
    }

}


export default PointFiltering