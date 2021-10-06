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