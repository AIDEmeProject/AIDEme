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

import axios from "axios" 
import $ from 'jquery'

import {webplatformApi} from '../constants/constants'

import logo from '../AIDEME.png'
import MicroModal from 'micromodal'

class MicroModalComponent extends Component{

  render(){

    return (
            
        <div 
            className="modal micromodal-slide" 
            id="modal-1" aria-hidden="true"
        >
            <div className="modal__overlay" tabIndex="-1" data-micromodal-close>
            <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
                <header className="modal__header">
                <h2 className="modal__title" id="modal-1-title">
                    {this.props.title}
                </h2>
                <button
                     className="modal__close"                     
                     
                    onClick={this.props.onClose}
                    role="button"
                    type="button"
                >

                </button>
                </header>
                <main className="modal__content" id="modal-1-content">
                <div>
                    {this.props.children}
                </div>
                </main>
                <footer className="modal__footer">
                
                <button
                    className="btn btn-primary" 
                    onClick={this.props.onClose}
                    role="button"
                    type="button"
                >
                    Close</button>
                </footer>
            </div>
            </div>
        </div>
    )
    
  }

  componentDidMount(){
      MicroModal.init({
        onClose: () => {MicroModal.close('modal-1'); this.props.onClose()}
      })
      MicroModal.show('modal-1')
  }

  componentWillUnmount(){
      MicroModal.close('modal-1')
  }
}


MicroModalComponent.defaultProps = {
    title: "title"
}

export default MicroModalComponent