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

import $ from 'jquery'
import * as d3 from 'd3'
import React, { Component } from 'react';


import TSMPredictionStatistics from '../Exploration/TSM/TSMPredictionStatistics'

import {algorithmNames} from '../../constants/constants'
import loadFileFromInputFile from '../../lib/data_utils'
import TSMTraceDataset from '../../model/TSMTraceDataset'
import TraceDataset from '../../model/TraceDataset';
import Dataset from '../../model/Dataset'

import LabelInfos from '../visualisation/LabelInfos'
import LearnerOption from '../options/LearnerOption'

import DataPoints from '../DataPoints'
import ModelBehavior from '../visualisation/ModelBehavior'
import ModelBehaviorControls from '../visualisation/ModelBehaviorControls'


import initializeBackend from '../../actions/trace/initializeBackend'
import sendPointBatch from '../../actions/trace/sendPointBatch'

import carDatasetMetadata from './carColumns'
import jobDatasetMetadata from './jobColumns'


import buildTSMConfiguration from '../../lib/buildTSMConfiguration'
import {simpleMarginConfiguration, 
        versionSpaceConfiguration, 
        factorizedVersionSpaceConfiguration} from '../../constants/constants'
import PredictionStatistics from '../Exploration/TSM/PredictionStatitics';


const ENCODED_DATASET_NAME = "./cars_encoded.csv"

class QueryTrace extends Component{

    render(){

        const algorithm = algorithmNames[this.state.algorithm]
        const iteration = this.state.iteration

        
        return (
            <div className="row">
                <div className="col col-lg-12">
                { 
                    this.state.showLoading && 
                    <div className="row">
                        <div className="col col-lg-6 offset-3 card">

                            <h1>
                                Trace module
                            </h1>
                        
                            <div className="form-group ">
                    
                                <label htmlFor="dataset">
                                    1. Choose the dataset to be labeled
                                </label>
                                <input
                                    required
                                    className="form-control-file"
                                    id="dataset" name="dataset" type="file" 
                                />

                                <label htmlFor="trace">
                                    2. Choose the trace
                                </label>
                                <input
                                    className="form-control-file"
                                    id="trace" name="trace"
                                    type="file"
                                >                           
                                </input>

                                <label htmlFor="trace-columns">
                                    3. Choose the trace columns
                                </label>
                                <input
                                    className="form-control-file"
                                    id="trace-columns" name="trace-columns"
                                    type="file"
                                >                           
                                </input>

                                <label htmlFor="f1-score">
                                    4. Load f1 score
                                </label>
                                <input
                                    className="form-control-file"
                                    id="f1-score" name="f1-score"
                                    type="file"
                                >                           
                                </input>

                                { 
                                    false && 
                                
                                    <div>              
                                        <label htmlFor="use-tsm">
                                            Use TSM ?
                                        </label>              
                                        <input 
                                            name="use-tsm"
                                            id="use-tsm"
                                            className="checkbox"
                                            type="checkbox" 
                                            onChange={e => this.setState({useTSM: e.target.checked})}
                                            checked={this.state.useTSM}
                                        />
                                    </div>
                                }
                     
                                <LearnerOption                         
                                    learnerChanged={this.learnerChanged.bind(this)}
                                />

                                <button                    
                                    className="btn btn-raised"
                                    onClick={this.onValidateTrace.bind(this)}
                                >
                                    Validate
                                </button>
                            </div>
                        </div>
                    </div>
                }
                        
                {
                    ! this.state.showLoading && 

                        <div className="row">

                            <div className="col col-lg-12">

                            <div className="row">

                                <div className="col col-lg-6 offset-lg-3">

                                    <h4>
                                        Algorithm : {algorithm} 
                                    </h4>
                                    <div className="center">

                                        {
                                            ! this.state.loadMode &&
                                        
                                            <button 
                                                className="btn btn-primary btn-raised"
                                                onClick={this.sendLabelDataForComputation.bind(this)}
                                                disabled={this.state.isComputing ? true:false}
                                            >
                                                Compute next iteration
                                            </button>
                                        }
                                        <button
                                            className="btn btn-primary btn-raised"
                                            onClick={e => this.setState({
                                                showModelBehavior: false,
                                                showDataPoints: true
                                            })}
                                            
                                        >
                                            Show labeled points
                                        </button>

                                        <button
                                            className="btn btn-primary btn-raised"
                                            onClick={e => this.setState({
                                                showModelBehavior: true,
                                                showDataPoints: false
                                            })}
                                        >
                                            Show Model Behavior
                                        </button>

                                </div>

                                { 
                                    this.state.isComputing &&
                                    <p>Backend is computing please wait</p>
                                }
                            </div>
                        </div>


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
                                            live={false}                                         
                                        />


                                        <div>

                                            <PredictionStatistics 
                                                stats={this.getClassifierStats()}   
                                            />
                                         

                                            { 
                                                this.state.useTSM && 

                                                <div>
                                                    
                                                    <TSMPredictionStatistics 
                                                        stats={this.getTSMStats()}
                                                    />
                                                </div>
                                            }
                                        </div>

                                        <div id="f1-score-img">
                                            <img width="450" src={this.state.f1ScoreImg} />
                                        </div>

                                    </div>
                                  
                                        <div className="col col-lg-8">
                                            
                                            <ModelBehavior                     

                                                availableVariables={this.state.availableVariables}
                                                labeledPoints={this.state.allLabeledPoints}                        
                                                
                                                projectionHistory={this.state.projectionHistory}
                                                fakePointGrid={this.state.fakePointGrid}
                                                modelPredictionHistory={this.state.modelPredictionHistory}
                                                
                                                
                                                iteration={iteration}  
                                                TSMPredictionHistory={this.state.TSMPredictionHistory}   
                                                
                                                hasTSM={this.state.useTSM}
                                                plotLabels={false}           
                                                realDataset={true}
                                            />
                                        </div>
                                    </div>                                    
                            }
                    
                            {
                                this.state.showDataPoints && 
                    
                                <DataPoints                            
                                    points={this.state.allLabeledPoints}
                                    chosenColumns={this.state.availableVariables}
                                    show={true}
                                    dataset={this.state.dataset}
                                    normal={true}
                                />
                            }
                    </div>
                

                </div>
                
                }
                <div className="row">
                    <div className="col col-lg-6 offset-lg-3 card">

                        <p>                        
                            <a 
                                onClick={this.saveTrace.bind(this)}
                                id="download-trace" 
                                download="trace.json" type="application/json"
                                className="btn btn-raised"
                            >
                                Save trace
                            </a>
                        </p>
                        <p>
                            <label htmlFor="load-trace">
                            Select Trace file (json)
                            </label>
                            <input 
                                id="load-trace"
                                name="load-trace"
                                type="file"
                            />

                            <button 
                                className="btn btn-raised"
                                onClick={this.loadTrace.bind(this)}    
                            >
                                Load
                            </button>
                        </p>
                    </div>
            </div>
            
            
            </div>
        </div>     
        )
    }

    constructor(props){

        super(props)

        this.state = {

            showModelBehavior: false,
            showLoading: true,
            isComputing: false,
            useTSM: false,
            useFactorizedInformation: false,
            loadMode: false,

            nIteration: 0,
            iteration: 0,
            lastIndice: 0,

            columnNames: [],
            availableVariables: [],
            
            TSMStatsHistory: [],
            classifierStatsHistory: [],

            fakePointGrid: [],
            TSMPredictionHistory: [],            
            modelPredictionHistory: [],            
            projectionHistory: [],
            
            allLabeledPoints: [],            
            
            
            algorithm: 'simplemargin',
            
        }
    }

    getTSMStats(){
        
        const iteration = this.state.iteration
        var stat = this.state.TSMStatsHistory[iteration];
        
        return stat
    }


    getClassifierStats(){
        const iteration = this.state.iteration
        var stat = this.state.classifierStatsHistory[iteration]
        return stat
    }
    getAlgorithmName(algorithm){        
        return algorithmNames[algorithm]
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


    learnerChanged(algorithm){

        var useTSM = algorithm === "simplemargintsm"
        var useFactorizedInformation = algorithm === "simplemargintsm" ||
                                       algorithm === "factorizedversionspace"
                
        this.setState({
            useTSM: useTSM,
            useFactorizedInformation: useFactorizedInformation,
            algorithm: algorithm,
        })
    }

    encodedDatasetChanged(e){
        this.setState({
            encodedDatasetChanged: e.target.value
        })
    }

    onValidateTrace(e){
        
        this.loadDataset()   
        this.loadF1Score()     
    }

    loadF1Score(){
        
        var file  = document.querySelector('#f1-score').files[0];

        var reader  = new FileReader();

        reader.onloadend = () => {

            
            this.setState({
                f1ScoreImg: reader.result
            })
        }

        reader.readAsDataURL(file);
        
    }

    loadDataset(){

        loadFileFromInputFile("dataset", event => {
            
            var fileContent = event.target.result 
            var dataset = Dataset.buildFromLoadedInput(fileContent)
           

            const filename =  $("#dataset").val(); 
            
            const isCarDataset = filename.toLowerCase().indexOf('car') !== -1
            console.log(isCarDataset)

            this.setState({
                'dataset': dataset,
                'isCarDataset': isCarDataset
            }, this.loadTraceScenario)
        })
    }

    loadTraceScenario(){

        loadFileFromInputFile('trace-columns', event => {
            
            var fileContent = event.target.result
            var traceColumns = JSON.parse(fileContent)        
            var dataset = this.state.dataset

            const usedColumnIds = traceColumns.rawDataset    
            var columnNames = dataset.get_column_names_from_ids(usedColumnIds)
            
            dataset.set_column_names_selected_by_user(columnNames)
            
            var availableVariables =  columnNames.map((e, i) => {
                return {name: e, realId: i}
            })

            this.setState({
                'traceColumns': traceColumns,    
                'columnNames': columnNames,
                'availableVariables': availableVariables,           
                'dataset': dataset
            }, this.loadTraceFile)
        })
    }

    loadTraceFile(){

        loadFileFromInputFile("trace", event => {
            var fileContent = event.target.result 
            
            var ext = getFileExtension('trace')
            const isCsv = ext === "csv"
            const useFactorizedInformation = this.state.useFactorizedInformation

            if (useFactorizedInformation){
                var trace = TSMTraceDataset.buildFromLoadedInput(fileContent, isCsv)
            }
            else{
                var trace = TraceDataset.buildFromLoadedInput(fileContent, isCsv)                
            }
            
            //var encodedColumnNames = trace.get_column_names_from_ids(this.state.traceColumns.rawDataset)
            //console.log(encodedColumnNames, this.state.traceColumns.encodedDataset)
            //trace.set_column_names_selected_by_user(encodedColumnNames)
         
            this.setState({ 
                'traceDataset': trace                
            }, this.initializeBackend)
        })
    }

    initializeBackend(){

        var options = {
            algorithm: this.state.algorithm,
            columnIds: this.state.traceColumns.encodedDataset,
            encodedDatasetName: ENCODED_DATASET_NAME,
            configuration: this.buildConfiguration(),            
        }
                
        this.setState({
            isComputing: true,
            showLoading: false
        }, () => {
            initializeBackend(options, this.traceBackendWasInitialized.bind(this))
        })        
    }


    buildConfiguration(){
        
        var configurations = {
            'simplemargin': simpleMarginConfiguration,
            'simplemargintsm': simpleMarginConfiguration,
            'versionspace': versionSpaceConfiguration,
            'factorizedversionspace': factorizedVersionSpaceConfiguration
        }
        
        var configuration = configurations[this.state.algorithm]

        
        if (this.state.useFactorizedInformation){

            const datasetMetadata = this.getDatasetMetadata()
            const allColumns = datasetMetadata.columnNames
            const columnsUsedInTrace = this.state.traceColumns
            
            const factorizationGroups = columnsUsedInTrace.factorizationGroups  
            const usedColumnNames = this.state.traceColumns.encodedDataset.map(e => allColumns[e])   

            configuration = buildTSMConfiguration(configuration, 
                                                  factorizationGroups, 
                                                  usedColumnNames, 
                                                  datasetMetadata)            

            if (this.state.algorithm == "factorizedversionspace") {
                configuration = this.buildFactorizedVersionSpaceGroup(configuration)                
            }
        }
        
        return configuration
    }

    getDatasetMetadata(){

        if (this.state.isCarDataset){
            return carDatasetMetadata
        }
        else{
            return jobDatasetMetadata
        }

    }

    buildFactorizedVersionSpaceGroup(configuration){

        var flags = configuration.multiTSM.flags
        var categorical = []
        flags.forEach((flag,i)  => {
            if (flag[1]){
                categorical.push(i)
            }
        })
        
        configuration["activeLearner"].repeat = this.state.traceColumns.factorizationGroups.length
        configuration["activeLearner"].categorical = categorical
        configuration["multiTSM"]["hasTsm"] = false
        return configuration
    }

    traceBackendWasInitialized(fakePointGrid){
                                       
        //var grid = fakePointGrid.map(e => {return e.data.array})
                
        var grid = this.state.dataset.get_parsed_columns_by_names(this.state.columnNames)
      
        this.setState({
            fakePointGrid: grid,            
        }, this.sendLabelDataForComputation.bind(this))        
    }

    getLabeledPointToSend(iRowTrace){

        var point = this.state.traceDataset.get_point(iRowTrace)
        
        point.data = {
            array: [2]
        }
        return point
    }
    
    sendLabelDataForComputation(){
        
        var nPointToSend = 1
        var lastIndice = this.state.lastIndice
        var pointsToSend = d3.range(nPointToSend).map((e, i) => {
            return this.getLabeledPointToSend(i + lastIndice)
        })
                
        
        this.setState({
            isComputing: true,
            lastIndice: lastIndice + nPointToSend
        }, () => {
            
            sendPointBatch(pointsToSend, response => {
                this.dataReceived(response, pointsToSend)
            })    
        })        
    }

    getDataPointFromId(sentPoint){

        const id = sentPoint.id
        var data = this.state.dataset.get_selected_columns_point(id)
        
        var data =  {
            id: id,
            label: this.getLabelFromPoint(sentPoint),        
            data: data.map(e => parseFloat(e))
        } 
        
        return data
    }
    getLabelFromPoint(point){
        
        if (this.state.useFactorizedInformation){
            
            return point.labels.every(e => e == 1) ? 1: 0
        }
        return point.label
    }

    computeClassifierStats(modelPredictions){
        

        var nPositives = modelPredictions.filter(e => e.label == 1).length
        var nNegative = modelPredictions.filter(e => e.label != 1).length

        var stats = {
            positive: nPositives,
            negative: nNegative
        }
        
        return stats
    }

    /* Process and data received from the backend and put it in the component state */
    dataReceived(response, sentPoints){
                
        var projectionHistory = this.state.projectionHistory
        var projectionData = JSON.parse(response.jsonProjectionPredictions)
                        
        projectionHistory.push(
            projectionData
        )
    
    
        var modelPredictionHistory = this.state.modelPredictionHistory
        var useTSM = this.state.useTSM
        var modelPredictions = backendPredToFrontendFormat(response.labeledPointsOverGrid, useTSM)
        modelPredictionHistory.push(modelPredictions)

        var allLabeledPoints = this.state.allLabeledPoints
        allLabeledPoints = allLabeledPoints.concat(sentPoints.map(this.getDataPointFromId.bind(this)))
                
        var classifierStats = this.computeClassifierStats(modelPredictions)
        var classifierStatsHistory = this.state.classifierStatsHistory
        classifierStatsHistory.push(classifierStats)
    
        var newState = {
            modelPredictionHistory: modelPredictionHistory,
            projectionHistory: projectionHistory,            
            showLoading: false,            
            nIteration: this.state.nIteration + 1,
            allLabeledPoints: allLabeledPoints,
            isComputing: false,

        }
        
        if (this.state.useTSM){
                        
            var TSMPredictionsOverGrid = response.TSMPredictionsOverGrid.map((e, i) => {
                
                return {
                    'id': e.dataPoint.id,
                    'label': e.label.label
                }
            })
            
            var TSMPredictionHistory = this.state.TSMPredictionHistory
            TSMPredictionHistory.push(TSMPredictionsOverGrid)
            newState['TSMPredictionHistory'] = TSMPredictionHistory
            
            
            var TSMstats = this.computeTSMStats(TSMPredictionsOverGrid)
            var TSMStatsHistory = this.state.TSMStatsHistory
            TSMStatsHistory.push(TSMstats)
            
            newState['TSMStatsHistory'] = TSMStatsHistory
        }

        this.setState(newState)
    }


    /* compute final model stats. To add negative ones*/
    getPositivePredictedPoints(modelPredictionHistory, step){
        
        var iteration = Math.min(step, modelPredictionHistory.length - 1)

        return modelPredictionHistory[iteration].filter(e => {
            return e.label === 1
        }).length
    }

    computeTSMStats(TSMPredictionOverPoints){

        var negative = TSMPredictionOverPoints.filter( e => e.label == -1).length
        var positive = TSMPredictionOverPoints.filter( e => e.label == 1).length
        var unknown = TSMPredictionOverPoints.filter( e => e.label == 0).length

        return {
            positive: positive,
            negative: negative,
            unknown: unknown
        }
    }

    saveTrace(){
        var state = this.state
        state.loadMode = true
        const jsonState = JSON.stringify(state)

        var data = new Blob([jsonState]);
        var a = document.getElementById("download-trace");
        a.href = URL.createObjectURL(data);
    }

    loadTrace(){
        loadFileFromInputFile("load-trace", event => {

            var state = JSON.parse(event.target.result)
            var dataset = state.dataset            
            Object.setPrototypeOf(dataset, Dataset.prototype) //prototype is not saved in state so we need to reaffect it

            state.dataset = dataset
            this.setState(state)

        })
    } 
}


function getFileExtension(id){
    var filePath = $("#" + id).val(); 
    const ext = filePath.substr(filePath.lastIndexOf('.') + 1,filePath.length);    
    return ext
}

function backendPredToFrontendFormat(rawPoints, useTSM){

    return rawPoints.map(e => {
        return {
            'id': useTSM ? e.id: e.dataPoint.id,
            'label': e.label == 'POSITIVE' ? 1: -1
        }
    })
}


export default QueryTrace