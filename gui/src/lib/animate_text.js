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

function animate_text(text, speed, outputer){
    
    var initialText = text
    
    var render = ""
    var i = 0
        
    var outputInterval = setInterval(function(){
        
        render += initialText[i]
        outputer(render)
        
        
        i++
        if (i >= initialText.length){
            clearInterval(outputInterval)
        }
    }, speed)
            
}

function animate_html_element(element, speed){
    
    var text = $(element).text().trim()
        
    var outputer = function(text){
        $(element).show()
        $(element).text(text)
    }
    
    animate_text(text, speed, outputer)
}


export default animate_html_element