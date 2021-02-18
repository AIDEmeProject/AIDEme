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

import actions from '../../actions/sendChosenColumns'

import GroupVariables from './GroupVariables'
import AdvancedOptions from './AdvancedOptions'

import DataExploration from '../visualisation/DataExploration'


class SessionOptions extends Component{
    
    render(){

        const datasetInfos = this.props.datasetInfos
        const columns = datasetInfos.columns               

        return (
            <div>        
                <ul className="nav nav-tabs bg-primary">
                    <li className="nav-item">
                        <a 
                           className={ this.state.showColumns ? "nav-link active": "nav-link"}
                           onClick={this.onBasicOptionClick.bind(this)}
                        >
                            Attribute selection
                        </a>                    
                    </li>
                    <li>
                        <a 
                            className="nav-link"                        
                            onClick={this.onSessionStartClick.bind(this)}
                        >        
                                Start session
                        </a>
                    </li>

                    <li className="nav-item">
                        <a 
                           className={this.state.showVariableGroups ? "nav-link active" : "nav-link" }                           
                           onClick={this.onVariableGrouping.bind(this)}
                        >
                            Factorization structure
                        </a>
                    </li>

                    <li className="nav-item">
                        <a 
                            className={this.state.showAdvancedOptions ? "nav-link active" : "nav-link"}
                            onClick={this.onAdvancedOptionClick.bind(this)}
                        >
                            Algorithm selection
                        </a>
                    </li>                    
                </ul>

                <form                 
                    id="choose-columns"  
                    className="card"                  
                >                        
                    <div                         
                         style={{ "display": this.state.showColumns ? "initial": "none"}}
                    >

                        <div className="row">
                            <div className="col col-lg-12">
                                <p>
                                    Explore the dataset and pick the variables for the labeling phase
                                </p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col col-lg-3"  id="column-picker">
                               
                                <h3>
                                    Column name
                                </h3>

                            {                
                                columns.map((column, key) => (
                                        
                                    <div key={key} className="">

                                        <div className="form-check form-check-inline">
                                                                            
                                            <input        
                                                id={"column-" + column }  
                                                name={"column" + key }
                                                type="checkbox"
                                                value={key}
                                                className="form-check-input"                                                                                             
                                                onClick={this.onCheckedColumn.bind(this)}
                                                defaultChecked={this.state.checkboxes[key]}
                                            /> 
                                            
                                            <label
                                                className="column-name-label"
                                                htmlFor={"column-" + column}>
                                                {column || "Not available"}
                                            </label>
                                            
                                            { false && 
                                            <button
                                                className="btn btn-primary btn-raised btn-explore"
                                                role="button"
                                                type="button"
                                                data-key={key}
                                                onClick={this.onExploreClick.bind(this)}>
                                                Explore
                                            </button>
                                            }
                                        </div>

                                    </div>                                                    
                                    ))
                                }
                        </div>
                                    
                        <div className="col col-lg-9">
                                                                                           
                            <DataExploration                                 
                                dataset={this.props.dataset}
                                firstVariable={this.state.firstVariable}
                                secondVariable={this.state.secondVariable}
                                show={this.state.showExploration}
                                chosenColumns={this.state.chosenColumns}
                            />
                                                                                                                      
                        </div>
                        </div>
                    </div>
                                            
                    <AdvancedOptions {...this.state} />
                    
                    <GroupVariables                
                        show={this.state.showVariableGroups}         
                        chosenColumns={this.state.chosenColumns}                        
                        groupWasAdded={this.groupWasAdded.bind(this)}                        
                        groupsWereValidated={this.groupsWereValidated.bind(this)}   
                        
                        availableVariables={this.props.chosenColumns}
                        points={this.sampledPoints()}
                                                
                        dataset={this.props.dataset}
                    />

                    <input 
                        id="conf" 
                        name="configuration"
                        type="text"
                        style={{visibility: "hidden"}}
                    />
                           
                </form>
            </div>
        )
    }

    constructor(props){

        super(props)

        var datasetInfos = this.props.datasetInfos
        
        const columnTypes = datasetInfos.uniqueValueNumbers.map((e, i) => {
            
            var nRow = this.props.dataset.getLength()
            
            var uniqueValues = datasetInfos.uniqueValueNumbers[i]
            var hasFloats = datasetInfos.hasFloats[i]
            var hasMoreThanXPercentOfUniqueValues = uniqueValues > 0.2 * nRow
            
            var hasMaxOverNRow = datasetInfos.maximums[i] > nRow

            var shouldBeNumeric = hasFloats || hasMoreThanXPercentOfUniqueValues || hasMaxOverNRow
        
            return shouldBeNumeric ? "numerical" : "categorical"
            
        })

        
        
        var chosenColumns = datasetInfos.columns.map( (col, idx) => {
            return {
                'name': col,
                'idx': idx,
                'isUsed': false,
                'type': columnTypes[idx]
            }
        })            

        this.state = {
            firstVariable: 0,
            secondVariable: 1,
            columnTypes: chosenColumns.map(e => e['type']),
            checkboxes: datasetInfos.columns.map (c => false),
            chosenColumns: chosenColumns,
            showAdvancedOptions: false,
            showVariableGroups: false,
            availableVariables: [],            
            variableGroups: [
                [],
                []
            ],  
            finalVariables: [],            

            learner: "Uncertainty sampling",
            classifier: "SVM",
            showColumns: true,
            showExploration: false
        }
    }

    sampledPoints(){
        return [
            {
                'id': 243
            },
            {
                'id': 666
            }
        ]
    }

    componentDidMount(){

        window.$('form').bootstrapMaterialDesign()     
        window.$('select').select();   
    }
    
    onVariableGrouping(){

        this.setState({
            showAdvancedOptions: false,
            showColumns: false,
            showVariableGroups: true
        })
    }

    onBasicOptionClick(){
        this.setState({
            showAdvancedOptions: false,
            showColumns: true,
            showVariableGroups: false
        })
    }

    onAdvancedOptionClick(){

        this.setState({
            showAdvancedOptions: true,
            showColumns: false,
            showVariableGroups: false
        })
    }

    onExploreClick(e){
        
        e.preventDefault()

        var columnId = e.target.dataset.key
        
        this.setState({
            firstVariable: columnId,
            showExploration: true
        })
        
        
        return false
    }

    onCheckedColumn(e){
        
        var idx = e.target.value
        var checkboxes = this.state.checkboxes.map (e => e)
        

        var newChosenColumns = this.state.chosenColumns.map(e => e)
        newChosenColumns[idx].isUsed = e.target.checked      
        var idx = 0;
        newChosenColumns.forEach((e, i) => {

            if (e.isUsed){
                newChosenColumns[i] =  Object.assign({}, e, {
                    finalIdx: idx
                })
                idx++
            }            
        })

        checkboxes[idx] = e.target.checked

              
        this.setState({
            chosenColumns: newChosenColumns,
            checkboxes: checkboxes,            
        })
    }

    onColumnTypeChange(e){

        var iColumn = e.target.dataset.key
        
        var newChosenColumnState = this.state.chosenColumns.map(e => e)
        newChosenColumnState[iColumn].type = e.target.value
                
        this.setState({
            chosenColumns: newChosenColumnState,            
        })                
    }
    
    onSessionStartClick(e){
        
        e.preventDefault()                       
        var chosenColumns = this.state.chosenColumns.filter(e => e.isUsed)
        //const enableTSM = chosenColumns.length == 2                           
        actions.sendColumns(this.props.tokens, chosenColumns, this.props.sessionWasStarted)        
        this.props.sessionOptionsWereChosen({            
            chosenColumns: chosenColumns,                
        })                            
    }
   
    groupsWereValidated(groups){
        
        var chosenColumns = groups.flatMap( g => {
            return g.map( v => {return v} )
        })
        //var chosenColumns = this.state.chosenColumns //.filter(e => e.isUsed)      
        
        this.computeVariableColumnIndices(groups)


        var datasetMetadata = this.buildDatasetMetadata()
        
        this.props.groupsWereValidated(chosenColumns, groups, ()=> {
            actions.sendVariableGroups(this.props.tokens, chosenColumns, groups, datasetMetadata, this.props.sessionWasStarted)    
        })                                  
    }

    buildDatasetMetadata(){
    
        var metadata = {
            'types': this.state.columnTypes.map( e => e == "categorical"),
            'columnNames': this.state.chosenColumns.map( e => e['name'])
        }
        
        return metadata
    }

    computeVariableColumnIndices(groups){
        
        var i = 0;

        groups.forEach( variables => {
            
            variables.forEach(variable => {
                
                variable['realId'] = i
                i++
            })  
        })     
    }

    groupWasAdded(){

        var groups = this.state.variableGroups.map(e => e)
        groups.push([])

        this.setState({
            variableGroups: groups
        })

        this.forceUpdate()
    }
       
    onFakePointClick(e){
         
        this.setState({
            useFakePoint: e.target.checked
        })
    }      
}


export default SessionOptions