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

import $ from "jquery";
import {backend, webplatformApi} from '../../constants/constants'

import ModelVisualization from '../visualisation/ModelVisualization'
import ModelBehaviorControls from '../visualisation/ModelBehaviorControls'

import PointLabelisation from '../PointLabelisation'
import InitialSampling from './InitialSampling/InitialSampling'
import ModelBehavior from '../visualisation/ModelBehavior'
import LabelInfos from '../visualisation/LabelInfos'

import DataPoints from '../DataPoints'

import wholeDatasetLabelizationWasAsked from '../../actions/statisticCollection/wholeDatasetLabelizationWasAsked'
import explorationSendLabeledPoint from '../../actions/explorationSendLabeledPoint'
import getWholedatasetLabeled from '../../actions/getWholeLabeledDataset'
import getDecisionBoundaryData from '../../actions/getDecisionBoundaryData'

import getGridPoints from '../../actions/getGridPoints'
import getModelPredictionsOverGridPoints from '../../actions/getModelPredictionsOverGridPoints'



class Exploration extends Component{

    render(){
                   
        const iteration = this.getIteration()
        if (this.state.initialLabelingSession){
            return (
                <InitialSampling 
                    pointsToLabel={this.state.pointsToLabel}
                    chosenColumns={this.props.chosenColumns}
                    availableVariables={this.props.availableVariables}

                    onPositiveLabel={this.onPositiveLabel.bind(this)}
                    onNegativeLabel={this.onNegativeLabel.bind(this)}
                    onNewPointsToLabel={this.onNewPointsToLabel.bind(this)}
                    dataset={this.props.dataset}
                />)
        }
        
        return (

            <div>
               <div className="row">
                    <div className="col col-lg-8 offset-lg-2">                            
                        <ul className="nav nav-tabs bg-primary">
                        
                            <li className="nav-item">
                                <a 
                                    className={this.state.showLabelView ? "nav-link active": "nav-link"} 
                                    
                                    onClick={() => this.setState({
                                        'showModelVisualisation': false,
                                        'showLabelView': true,
                                        'showHeatmap': false,
                                        'showLabelHistory': false,
                                        'showModelBehavior': false
                                        })}
                                >
                                    Labeling
                                </a>
                            </li>

                            <li className="nav-item">
                                <a 
                                    className={this.state.showLabelHistory ? "nav-link active": "nav-link"} 
                                    
                                    onClick={() => this.setState({
                                        'showModelVisualisation': false, 
                                        'showLabelView': false, 
                                        'showHeatmap': false,
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

                            { false && 
                            <li className="nav-item">
                                <a 
                                    className={this.state.showModelVisualisation ? "nav-link active": "nav-link"} 
                                    
                                    onClick={() => this.setState({
                                        'showModelVisualisation': true, 
                                        'showLabelView': false,  
                                        'showHeatmap': false,
                                        'showLabelHistory': false,
                                        'showModelBehavior': false
                                    })}
                                >
                                    Model Performance
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
                    </div>
                </div>
                                                                                     
                { 
                    this.state.showLabelView && 

                        <div className="row">
                            <div className="col col-lg-12">
                            <PointLabelisation                                                           
                                chosenColumns={this.props.chosenColumns}
                                pointsToLabel={this.state.pointsToLabel}
                                onPositiveLabel={this.onPositiveLabel.bind(this)}
                                onNegativeLabel={this.onNegativeLabel.bind(this)}
                                dataset={this.props.dataset}
                            />
                        </div>
                        </div>
                }

                { 
                    this.state.showModelBehavior && 
                    <div className="row">

                        <div className="col col-lg-4">

                            <ModelBehaviorControls         
                                iteration={iteration}          
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
                                iteration={iteration}                     
                                labeledPoints={this.state.allLabeledPoints}
                                datasetInfos={this.props.datasetInfos}
                                availableVariables={this.props.chosenColumns}
                                projectionHistory={this.state.projectionHistory}
                                fakePointGrid={this.state.fakePointGrid}
                                modelPredictionHistory={this.state.modelPredictionHistory}
                                hasTSM={false}
                                plotProjection={false}
                            />
                        </div>
                    </div>
                }

                {
                    //this.state.showModelVisualisation && 
                    false &&                  
                    <ModelVisualization 
                        {...this.props}
                        {...this.state}
                    />
                }

                {
                    this.state.showLabelHistory && 
                        <div className="row">
                            <div className="col col-lg-8 offset-lg-2">
                                <DataPoints                             
                                    availableVariables={this.props.finalVariables}
                                    points={this.state.allLabeledPoints}
                                    chosenColumns={this.props.chosenColumns}
                                    show={true}
                                    normal={true}
                                    dataset={this.props.dataset}
                                />
                            </div>
                        </div>
                }                
            </div>
        )
    }

    constructor(props){
        
        super(props)
        this.state = {
            showModelVisualisation: false,
            showLabelView: true,
            showLabelHistory: false,
            showModelBehavior: false,
            labeledPoints: [],
            pointsToLabel: this.props.pointsToLabel.map(e => e),
            allLabeledPoints: [],
            initialLabelingSession: true,            
            fakePointGridabelHistory: [],
            projectionHistory: [],
            fakePointGrid: [],
            modelPredictionHistory: [],
            iteration: 0,
            nIteration: 0
        }
    }

    onNewPointsToLabel(points){
        
        var pointsToLabel = this.state.pointsToLabel.map(e=>e)

        var receivedPoints = points.map(e => {
            return {
                id: e.id,
                data: e.data.array
            }
        })

        for (var point of receivedPoints){
            pointsToLabel.push(point)
        }

        this.setState({
            pointsToLabel: pointsToLabel
        })       
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

    onPositiveLabel(e){
        
        var dataIndex = parseInt(e.target.dataset.key)
        this.dataWasLabeled(dataIndex, 1)
    }

    onNegativeLabel(e){
        var dataIndex = parseInt(e.target.dataset.key)
        this.dataWasLabeled(dataIndex, 0)                      
    }

    componentDidUpdate(){
        //console.log(this.state)
        //console.log(this.state.allLabeledPoints)
    }

    dataWasLabeled(dataIndex, label){
        
        var tokens = this.props.tokens
        var labeledPoint = this.state.pointsToLabel[dataIndex]
        
        labeledPoint.label = label

        var allLabeledPoints = this.state.allLabeledPoints
        allLabeledPoints.push(labeledPoint)

        var labeledPoints = this.state.labeledPoints.map(e => e)
        labeledPoints.push(labeledPoint)

        var pointsToLabel = this.state.pointsToLabel.map(e => e)
        
        pointsToLabel.splice(dataIndex, 1)
        
        this.setState({
            allLabeledPoints: allLabeledPoints,
            pointsToLabel: pointsToLabel,
            labeledPoints: labeledPoints
        })
        
        if (this.state.initialLabelingSession){

            if (label === 1){
                this.setState({
                    hasYes: true
                }, () => {
                    this.labelForInitialSession(labeledPoints, pointsToLabel)
                })
            }
            else{
                this.setState({
                    hasNo: true
                }, () => {
                    this.labelForInitialSession(labeledPoints, pointsToLabel)
                })
            }                        
        }
        else{     
            this.setState({
                labeledPoints: []
            }, () =>{  
                explorationSendLabeledPoint({
                    data: labeledPoints,
                }, tokens, response => {
                    
                    this.onNewPointsToLabel(response)
                    
                    this.getModelBehaviorData()
                })
            })
        }
    }

    
    getModelBehaviorData(){

        this.setState({
            isFetchingPrediction: true,
            isFetchingProjection: true,
            nIteration: this.state.nIteration + 1
        }, this._getModelBehaviorData.bind(this))    
                
    }

    _getModelBehaviorData(){

        if (this.props.useRealData){
            const usedColumnNames = this.props.chosenColumns.map(e => e['name'])            
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

        if ( ! this.state.initialLabelingSession){

            //getDecisionBoundaryData(this.projectionDataWasReceived.bind(this))
            getModelPredictionsOverGridPoints(predictedLabels => {
                                                            
                var history = this.state.modelPredictionHistory
                history.push(predictedLabels)                
                console.log(history)
                this.setState({
                    modelPredictionHistory: history,
                    isFetchingProjection: false
                })
            }, false)
        }
    }

    labelForInitialSession(labeledPoints, pointsToLabel){
        
        var tokens = this.props.tokens

        const hasYesAndNo = this.state.hasYes && this.state.hasNo

        if (hasYesAndNo){
            this.setState({
                hasYesAndNo: true,
                initialLabelingSession: false,
                labeledPoints: [],
                pointsToLabel: []
            }, ()=> {
                explorationSendLabeledPoint({
                    data: labeledPoints,
                }, tokens, this.onNewPointsToLabel.bind(this))
            })

            return 
        }

        if  (pointsToLabel.length === 0){

            if (this.state.hasYes && this.state.hasNo ){
                
                this.setState({
                    hasYesAndNo: true,
                    initialLabelingSession: false,
                    labeledPoints: []
                }, ()=> {
                    explorationSendLabeledPoint({
                        data: labeledPoints,
                    }, tokens, this.onNewPointsToLabel.bind(this))
                })
            }
            else{

                this.setState({
                    labeledPoints: []
                }, () => {
                    explorationSendLabeledPoint({
                        data: labeledPoints,
                    }, tokens, this.onNewPointsToLabel.bind(this))
                })                            
            }
        }
    }

    onLabelWholeDatasetClick(e){

        e.preventDefault()
        
        getWholedatasetLabeled()

        wholeDatasetLabelizationWasAsked(this.props.tokens)
    }


    dataWasReceived(data){
        
        this.setState({
            showModelVisualisation: true,
            visualizationData: data
        })
    }

    onNewPointsToLabel(points){
        
        var pointsToLabel = this.state.pointsToLabel.map(e=>e)

        var receivedPoints = points.map(e => {
            return {
                id: e.id,
                data: e.data.array
            }
        })

        for (var point of receivedPoints){
            pointsToLabel.push(point)
        }

        this.setState({
            pointsToLabel: pointsToLabel
        })       
    }

    onPositiveLabel(e){
        
        var dataIndex = e.target.dataset.key
        this.dataWasLabeled(dataIndex, 1)
    }

    onNegativeLabel(e){
        var dataIndex = e.target.dataset.key
        this.dataWasLabeled(dataIndex, 0)                      
    }

    projectionDataWasReceived(boundaryData){
        
        let history = this.state.projectionHistory
        history.push(JSON.parse(boundaryData))
        
        this.setState({
            isFetchingProjection: false,
            projectionHistory: history
        })        
    }   
}

Exploration.defaultProps = {
    useRealData: true
}

export default Exploration