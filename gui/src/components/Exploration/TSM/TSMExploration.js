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

import TSMModelVisualization from './TSMModelVisualization'
import SpecificPointToLabel from '../InitialSampling/SpecificPointToLabel'
import DataPoints from './DataPoints'
import GroupedPointTableHead from './GroupedPointTableHead'
import ModelBehavior from '../../visualisation/ModelBehavior'
import ModelBehaviorControls from '../../visualisation/ModelBehaviorControls'
import LabelInfos from '../../visualisation/LabelInfos'
import getDecisionBoundaryData from '../../../actions/getDecisionBoundaryData'
import getGridPoints from '../../../actions/getGridPoints'

import getTSMPredictions from '../../../actions/getTSMPredictionsOverGridPoints';
import getModelPredictionsOverGridPoints from '../../../actions/getModelPredictionsOverGridPoints';

import buildRealDatasetGrid from '../../../lib/buildRealDatasetGrid'

import {backend, webplatformApi} from '../../../constants/constants'

import robot from '../../../resources/robot.png'

class TSMExploration extends Component{

    constructor(props){
        
        super(props)

        this.state = {
            pointsToLabel: this.props.pointsToLabel.map(e => e),
            noPoints: [],
            allLabeledPoints: [],
            labeledPoints: [],   
            initialLabelingSession: true,    
            hasYes: false,
            hasNo: false,
            showModelPerformance: false,
            showLabelView: true,
            showLabelHistory: false,
            showModelBehavior: false,
            visualizationData: {
                TSMBound: null
            },          
            
            fakePointGrid:[],
            TSMPredictionHistory: [],
            modelPredictionHistory: [],
            projectionHistory: [],
            nIteration: 0,
            iteration: 0
        }        
    }

    render(){
        var dataset = this.props.dataset
        return (
            
            <div>                                
                {
                    ! this.state.initialLabelingSession &&
                
                    <ul className="nav nav-tabs bg-primary">
                    
                        <li className="nav-item">

                            <a 
                                className={ this.state.showLabelView ? "nav-link active": "nav-link"}
                                onClick={() => this.setState({
                                    'showModelPerformance': false, 
                                    'showLabelView': true,
                                    'showLabelHistory': false,
                                    'showModelBehavior': false
                                })}
                            >
                                Labeleling
                            </a>
                        </li>

                        <li className="nav-item">
                            <a 
                                className={ this.state.showLabelHistory ? "nav-link active": "nav-link"}
                               
                                onClick={() => this.setState({
                                    'showModelPerformance': false, 
                                    'showLabelView': false,  
                                    'showLabelHistory': true,
                                    'showModelBehavior': false
                                })}
                            >
                                History
                            </a>
                        </li>   

                        <li className="nav-item">
                                <a 
                                    className={this.state.showModelVisualisation ? "nav-link active": "nav-link"} 
                                   
                                    onClick={this.onModelBehaviorClick.bind(this)}
                                >
                                    Model Behavior
                                </a>
                            </li>   

                        {
                            false && 
                        

                        <li className="nav-item">
                            <a 
                                className="nav-link" 
                                href="#advanced-options"
                                onClick={() => this.setState({
                                    'showModelPerformance': true, 
                                    'showLabelView': false,  
                                    'showLabelHistory': false,
                                    'showModelBehavior': false
                                })}
                            >
                                Assess model Performance
                            </a>
                        </li>      
                        }
                        <li className="nav-item">
                                <a
                                    className="nav-link"
                                    onClick={this.onLabelWholeDatasetClick.bind(this)}
                                >                        
                                    Auto-labeling           
                                </a>
                            </li>                 
                    </ul>
                }
                { 
                    //this.state.initialLabelingSession && 
                    false && 
                    <div className="card">
                       
                       
                        {
                            false && 
                            <SpecificPointToLabel 
                                onNewPointsToLabel={this.newPointsToLabel.bind(this)}                            
                            />         
                        }   
                    </div>                
                }
            
                {
                    this.state.showLabelView && 
                
                    <div className='center card'>
                        <div className="row">
                        <div className="col col-lg-8 offset-lg-2">
                            
                        {
                             this.state.initialLabelingSession && 


                        <p className="card">   
                            <span className="chatbot-talk">
                                <img src={robot} width="70" />
                                <q>
                                    The first phase of labeling continues until we obtain 
                                    a positive example and a negative example. 
                                </q>
                            </span>
                        </p>
                        }


                        <p className="card">   

                            <span className="chatbot-talk">
                                <img src={robot} width="70" />
                                <q>
                                    Grouped variable exploration. If you chose no, 
                                    you will be asked to label each subgroups
                                    independantly                    
                                </q>
                            </span>
                        </p>

                       <table className="group-variable">

                        <GroupedPointTableHead 
                            groups={this.props.groups}
                        />

                            <tbody>                
                            {
                            this.state.pointsToLabel.map((point, i) => {
                                
                                const pointData = dataset.get_selected_columns_point(point.id)
                                return (

                                    <tr 
                                        key={i}
                                        className="variable-group">

                                       
                                        {
                                            this.props.groups.map((g, iGroup) => {
                                                console.log(g)
                                                var pointIds = g.map(e => e.realId)    
                                                
                                                var dataAsGroups = []

                                                pointIds.forEach(realId => {
                                                    var value = pointData[realId]
                                                
                                                    dataAsGroups.push(value)
                                                })
                                                                                                                                
                                                var values = dataAsGroups.join(", ")
                                                                                                                                                                         
                                                if ( typeof point.labels !== "undefined"){
                                                    var L = () => {
                                                        return <button
                                                                    data-point={i}
                                                                    data-subgroup={iGroup}
                                                                    className="btn btn-primary btn-raised"
                                                                    onClick = {this.onSubGroupNo.bind(this)}
                                                                >
                                                                    No
                                                                </button>
                                                    }
                                                }
                                                else{
                                                    var L = () => {return <span></span>}
                                                }                                
                                                
                                                return (
                                                    <td 
                                                        colSpan={g.length}
                                                        key={iGroup}
                                                    >
                                                        {values} <L />
                                                    </td>
                                                )
                                            })
                                        }
                                        <td
                                        className="label-col"
                                        >
                                        
                                            <button 
                                                style={{display: typeof point.labels === "undefined" ? "inherit": "none"}}
                                                className="btn btn-primary btn-raised"
                                                data-point={i}
                                                onClick={this.groupWasLabeledAsYes.bind(this)}
                                            >
                                                Yes
                                            </button>
                                                                
                                            <button 
                                                style={{display: typeof point.labels === "undefined" ? "inherit": "none"}}
                                                className="btn btn-primary btn-raised"
                                                data-point={i}
                                                onClick={this.groupWasLabeledAsNo.bind(this)}
                                            >
                                                No
                                            </button>

                                            <button
                                                className="btn btn-primary btn-raised"
                                                style={{display: typeof point.labels === "undefined" ? "none": "inherit"}}
                                                data-point={i}
                                                onClick={this.groupSubLabelisationFinished.bind(this)}
                                            >
                                                Validate Subgroup labels
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
                }                           
                {
                    this.state.showModelPerformance && 
                    <TSMModelVisualization 
                        TSMBound={this.state.visualizationData.TSMBound}
                    />
                }

                {
                    this.state.showModelBehavior && 
                    
                    <div className="row">

                        <div className="col col-lg-4">
                      
                            <ModelBehaviorControls         
                                iteration={this.getIteration()}          
                                nIteration={this.state.nIteration}
                                onPreviousIteration={this.onPreviousIteration.bind(this)}
                                onNextIteration={this.onNextIteration.bind(this)}
                            />

                            <LabelInfos
                                iteration={this.state.iteration}
                                labeledPoints={this.state.allLabeledPoints}                                            
                            />

                        </div>
                        <div className="col col-lg-8">
                            <ModelBehavior     
                                iteration={this.getIteration()}              
                                labeledPoints={this.state.allLabeledPoints}
                                datasetInfos={this.props.datasetInfos}
                                availableVariables={this.props.chosenColumns}
                                fakePointGrid={this.state.fakePointGrid}
                                TSMPredictionHistory={this.state.TSMPredictionHistory}
                                modelPredictionHistory={this.state.modelPredictionHistory}                        
                                projectionHistory={this.state.projectionHistory}
                                hasTSM={this.state.TSMPredictionHistory.length > 0}
                                plotProjection={false}
                            />
                        </div>
                    </div>
                }

                {
                    this.state.showLabelHistory && 

                    <DataPoints                             
                        availableVariables={this.props.chosenColumns}
                        labeledPoints={this.state.allLabeledPoints}
                        chosenColumns={this.props.chosenColumns}
                        groups={this.props.groups}
                        dataset={this.props.dataset}
                    />
                }                
            </div>
        )
    }

    onModelBehaviorClick(e){
        
        const hasBehaviorData = this.state.modelPredictionHistory.length > 0

        if (hasBehaviorData){ 

            this.setState({
                'showModelVisualisation': false, 
                'showLabelView': false,  
                'showHeatmap': false,
                'showLabelHistory': false,
                'showModelBehavior': true
            })
        }
        else{
            alert('Please label at least one more point or wait for computation to finish')
        }    
    }

    newPointsToLabel(points){
        
        var newPoints = points.map(e => {
            return {
                id: e.id,
                data: e.data.array
            }
        })
        
        var pointsToLabel = this.state.pointsToLabel.map(e => e)

        this.setState({
            pointsToLabel: pointsToLabel.concat(newPoints),
            labeledPoints: [],
            //initialLabelingSession: ! (this.state.hasYes && this.state.hasNo)
        })        
    }
     
    groupWasLabeledAsYes(e){

        var pointId = e.target.dataset.point                
        var labeledPoint = this.state.pointsToLabel[pointId]
        labeledPoint.labels = this.props.groups.map(e => 1)
        labeledPoint.label = 1

        var pointsToLabel = this.state.pointsToLabel.map(e => e)
        pointsToLabel.splice(pointId, 1)        
                                                          
        if (this.state.initialLabelingSession){
            
           this.pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel)
        }        
        else{
            this.pointWasLabeledAfterInitialSession(labeledPoint, pointsToLabel)
        }                
    }

    pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel){

        var labeledPoints = this.state.labeledPoints.map(e => e)
        labeledPoints.push(labeledPoint)

        var allLabeledPoints = this.state.allLabeledPoints.map(e => e)

        const isYes = labeledPoint.label === 1
        var hasYesAndNo

        if (isYes){
            hasYesAndNo = this.state.hasNo
        }
        else{
            hasYesAndNo = this.state.hasYes
        }
        
        if (hasYesAndNo){
            allLabeledPoints = allLabeledPoints.concat(labeledPoints)
            this.setState({
                pointsToLabel: [],
                initialLabelingSession: false,
                hasYesAndNo: true,
                allLabeledPoints: allLabeledPoints
            }, () => {
                sendLabels(labeledPoints, this.newPointsToLabel.bind(this))
            })                
            
        }
        else if (this.state.pointsToLabel.length === 0){

            allLabeledPoints = allLabeledPoints.concat(labeledPoints)

            var newState = {
                pointsToLabel: pointsToLabel,
                initialLabelingSession: false,                
                allLabeledPoints: allLabeledPoints
            }
            if (isYes) {
                newState['hasYes'] = true
            }
            else{
                newState['hasNo'] = true
            }

            this.setState(newState, () => {
                sendLabels(labeledPoints, this.newPointsToLabel.bind(this))
            })                            
        }
        else{

            var newState = {                
                pointsToLabel: pointsToLabel,
                labeledPoints: labeledPoints            
            }
            if (isYes) {
                newState['hasYes'] = true
            }
            else{
                newState['hasNo'] = true
            }
            this.setState(newState)
        }
    }

    pointWasLabeledAfterInitialSession(labeledPoint){

        var labeledPoints = this.state.labeledPoints
        labeledPoints.push(labeledPoint)
        var allLabeledPoints = this.state.allLabeledPoints.concat(labeledPoints)

        
        this.setState({
            allLabeledPoints: allLabeledPoints,
            pointsToLabel: [],
            labeledPoints: labeledPoints,            
        },
        () => {
            
            sendLabels(labeledPoints, response => {
                this.newPointsToLabel(response)
                this.getModelBoundaries()
            })            
        })      
    }
    
    groupWasLabeledAsNo(e){

        var iPoint = e.target.dataset.point
        
        var pointsToLabel = this.state.pointsToLabel.map(e => e)

        var point = pointsToLabel[iPoint]
        point.labels = this.props.groups.map (e => 1)
        point.label = 0

        this.setState({
            pointsToLabel: pointsToLabel,  
            hasNo: true          
        })   
    }

    groupSubLabelisationFinished(e){
        
        var iPoint = e.target.dataset.point
        var pointsToLabel = this.state.pointsToLabel.map(e => e)
        var labeledPoint = pointsToLabel[iPoint]
        
        if ( labeledPoint.labels.reduce( (acc, v) => acc + v) == labeledPoint.labels.length ){
            alert('please label at least one subgroup')
            return
        }
                
        pointsToLabel.splice(iPoint, 1)        
        var labeledPoints = this.state.labeledPoints.map(e => e)
        labeledPoints.push(labeledPoint)

        
        if (this.state.initialLabelingSession){
            
            this.pointWasLabeledDuringInitialSession(labeledPoint, pointsToLabel)
         }        
         else{
             this.pointWasLabeledAfterInitialSession(labeledPoint, pointsToLabel)
         }   
    }

    getModelBoundaries(){

        this.setState({
            isFetchingModelPrediction: true,
            isFetchingTSMPrediction: true,
            isFetchingProjection: true,
            nIteration: this.state.nIteration + 1
        }, this._getModelBoundaries.bind(this))    
                
    }

    _getModelBoundaries(){

        this.getGridPoints()

        if ( ! this.state.initialLabelingSession){

            //getDecisionBoundaryData(this.projectionDataWasReceived.bind(this))
            getTSMPredictions(predictedLabels => {
                                            
                var TSMPredictionHistory = this.state.TSMPredictionHistory
                TSMPredictionHistory.push(predictedLabels)
                
                this.setState({
                    'TSMPredictionHistory': TSMPredictionHistory,
                    'isFetchingTSMPrediction': false
                })
            })

            getModelPredictionsOverGridPoints(predictions => {
                var history = this.state.modelPredictionHistory

                history.push(predictions)                
                this.setState({
                    'modelPredictionHistory': history,
                    'isFetchingModelPrediction': false
                })
            }, true)
        }        
    }

    getNumberOfIterations(){
        return this.state.nIteration
    }

    getIteration(){
        return this.state.iteration
    }     
    
    onPreviousIteration(){

        var iteration = this.getIteration() - 1
        this.setState({
            iteration: Math.max(iteration, 0)
        })    
    }

    onNextIteration(){

        const nIteration = this.getNumberOfIterations()
        var iteration = this.getIteration() + 1

        this.setState({
            iteration: Math.min(iteration, nIteration - 1)
        })        
    }

    projectionDataWasReceived(boundaryData){
        
        let history = this.state.projectionHistory
        history.push(JSON.parse(boundaryData))
        
        this.setState({
            projectionHistory: history,
            isFetchingProjection: false
        })        
    }

    getGridPoints(){

        if (this.props.useRealData){
            //var grid = buildRealDatasetGrid(this.props.dataset)
            const usedColumnNames = this.props.chosenColumns.map(e => e['name'])
            console.log(usedColumnNames)
            var grid = this.props.dataset.get_parsed_columns_by_names(usedColumnNames)
            this.setState({
                fakePointGrid: grid
            })
        }
        else{

            if ( this.state.fakePointGrid.length === 0){
                getGridPoints(points => {
                    
                    this.setState({
                        fakePointGrid: points
                    })
                })
            }
        }
    }

    onSubGroupNo(e){

        var data = e.target.dataset
        var iPoint = data.point
        var iSubgroup = data.subgroup

        var pointsToLabel = this.state.pointsToLabel.map(e => e)
        var point = pointsToLabel[iPoint]
       
        point.labels[iSubgroup] = 0
            
        pointsToLabel[iPoint] = point
        this.setState({
            pointsToLabel: pointsToLabel,
          
        })
    }
    
   
    onLabelWholeDatasetClick(e){

        e.preventDefault()

        getWholedatasetLabeled()

        notifyLabelWholeDataset(this.props.tokens)
    }    
}


function getWholedatasetLabeled(){

    var url = backend + "/get-labeled-dataset"

    $.get(url, response => {

        var blob = new Blob([response]);
        var link = document.createElement('a');
        
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.download = "labeled_dataset.csv";
        link.click();
    })
}

function notifyLabelWholeDataset(tokens){
    
    var wasAskedToLabelDatasetUrl = webplatformApi + "/session/" + tokens.sessionToken + "/label-whole-dataset"

    $.ajax({
        type: "PUT", 
        dataType: "JSON",
        url: wasAskedToLabelDatasetUrl,
        headers: {
            Authorization: "Token " + tokens.authorizationToken
        },
        data:{
            clicked_on_label_dataset: true
        }        
    })
}

function sendLabels(labeledPoints, onSuccess){
    
    var labeledPoints = labeledPoints.map(e => {
        return {
            id: e.id,
            labels: e.labels,
            data: {
                array: e.data
            }
        }
    })
    
    var endPoint = backend + "/tsm-data-point-were-labeled"
    $.ajax({
        type: "POST",
        dataType: 'JSON',
        url: endPoint,
        data: {
            labeledPoints: JSON.stringify(labeledPoints)
        },
       
        success: onSuccess
    })
}



TSMExploration.defaultProps = {
    useRealData: true
    
}

export default TSMExploration