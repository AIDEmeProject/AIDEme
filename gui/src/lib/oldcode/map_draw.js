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

var markers = [];

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

var icons = {
    unlabel: {
        name: 'Unlabeled',
        icon: 'house.png'
    },
    positive: {
        name: 'Relevant',
        icon: 'positive.png'
    },
    negative: {
        name: 'Non-relevant',
        icon: 'negative.png'
    },
    newSample: {
        name: 'New sample',
        icon: 'new.png'
    }
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


/*function initialize() {
// Create the Google Map…
var map = new google.maps.Map(d3.select("#chart").node(), {
  zoom: 9,
  center: new google.maps.LatLng(37.76487, -122.41948),
  mapTypeId: google.maps.MapTypeId.ROADMAP
});


// Load the station data. When the data comes back, create an overlay.
d3.json("js/stations.json", function(data) {

    var marker, i;
    var infowindow = new google.maps.InfoWindow();

    dt = d3.entries(data);

    for (i = 0; i < dt.length; i++) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(dt[i].value[1], dt[i].value[0]),
        map: map,
        icon: "house.png"
    });
    markers.push(marker);

    // Add the circle for this city to the map.


    google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
        return function() {
            var name = (134364 + i%3);
            var html = "<!DOCTYPE html> <html> <head> <style> .text{float:right;margin:10px;} .image{float:left;} img{width:100px;height:100px;} </style> </head> <body> <div class='image'> <img src=pictures/139661.jpg> </div> <div class='text'> <b>price: 35k </b> <br> bedroom:5  <br> bathroom:4 <br> size: 1000sqft </div> </body> </html>";
            //var html = dt[i].value[2];
            infowindow.setContent(html);
            infowindow.open(map, marker);
        }
    })(marker, i));

    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
    });
  }
});
}

google.maps.event.addDomListener(window, 'load', initialize);*/

// data: {mls, latitude, longitude, price, bedrooms, bathrooms, size}
function map_plot(data, header) {
    var hd = [];
    for (var i = 0; i < header.length; i++) {
        hd.push(header[i]);
    }

    clearMarkers();
    var map = new google.maps.Map(d3.select("#chart").node(), {
        zoom: 9,
        center: new google.maps.LatLng(data[0].lat, data[0].long),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var chart = document.getElementById('chart');
    var d = document.createElement('div');
    d.setAttribute("id", "legend");
    chart.appendChild(d);

    var legend = document.getElementById('legend');
    for (var key in icons) {
        var type = icons[key];
        var name = type.name;
        var icon = type.icon;
        var div = document.createElement('div');
        div.innerHTML = '<img src="' + icon + '"> ' + name;
        legend.appendChild(div);
    }

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);

    var marker, i;
    var infowindow = new google.maps.InfoWindow();
    for (i = 0; i < data.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(data[i].lat, data[i].long),
            map: map,
            icon: "house.png"
        });
        
        marker.set('id', data[i].id);
        if (showingObject == 0) {
        for (var idx = 0; idx < data.length; idx++) {
            if(global_marker[idx].id == marker.get('id')) {
    
                if(global_marker[idx].label == 'positive') {
                    marker.setIcon("positive.png");
                    marker.set('status', 'positive');
                }
                
                if(global_marker[idx].label == 'negative') {
                     marker.setIcon("negative.png");
                    marker.set('status', 'negative');
                }
                
                if(global_marker[idx].label =='unlabel') {
                    if (new_samples.indexOf(marker.get('id')) > -1) {
                        marker.setIcon("new.png");
                    }
                    else {
                        marker.setIcon("house.png");
                    }
                    marker.set('status', 'unlabel');
                }
            
                break;
            }
        }
    }
    else {
        marker.setIcon("house.png");
        marker.set('status', 'unlabel');
    }
        //marker.set('status', 'unlabel');
        markers.push(marker);
        
        google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
            return function() {
                /*var html = "<!DOCTYPE html>\n" +
                "<html>\n" + 
                "<head>\n" + 
                "<style>\n" +
                ".text{float:right;margin:10px;}\n" +
                ".image{float:left}\n" + 
                "img{width:100px;height:100px;}\n" +
                "</style> </head>\n" +
                "<body> <div class = 'image'> <img src = pictures/" + data[i].mls +
                ".jpg> </div> <div class='text'>\n" + 
                "<b> price: " + data[i].price +
                "<br> bedrooms: " + data[i].bedrooms +
                "<br> bathrooms: " + data[i].bathrooms + 
                "<br> size: " + data[i].size + 
                "</div> </body> </html>";
                var html = "<div style='float:left'> <img src=pictures/" + data[i].id +
                           ".jpg height=130px width=130px> </div> <div style='float:right;margin:10px;color:black'>\n";
                           /*"<b> $" + numberWithCommas(data[i].price) + "</b>" + 
                           "<br> " + data[i].beds + " beds " + data[i].baths + " baths " + numberWithCommas(data[i].size) + " sqft" +
                           "<br>" + "\n" +
                           "<br>" +"<b> "+ data[i].town +" information: </b> "+ 
                           "<br> annual crimes per 1000 residents: " + data[i].crime +
                           "<br> population: " + numberWithCommas(data[i].population) +
                           "<br> adults with bachelor: " + data[i].prc_college + "%" +
                           "<br> per capita income: $" + numberWithCommas(data[i].income) +
                           "</div>";*/
                var html = "<div style='float:left'> <img src=pictures/" + data[i].id +
                           ".jpg height=130px width=130px> </div> <div style='float:right;margin:10px;color:black'>\n";
                var index = hd.indexOf("picture");
                if (index > -1) {
                    hd.splice(index, 1);
                }
                index = hd.indexOf("label");
                if (index > -1) {
                    hd.splice(index, 1);
                }
                for (var j = 0; j < hd.length; j++) {
                    if (hd[j] == "size" || hd[j] == "price" || hd[j] == "income" || hd[j] == "population")
                        html += "<br> " + hd[j] + ": " + numberWithCommas(data[i][hd[j]]) + "</br>";
                    else
                        html += "<br> " + hd[j] + ": " + data[i][hd[j]] + "</br>";
                }
                html += "</div>";
                infowindow.setContent(html);
                infowindow.open(map, marker);
            }
        })(marker, i));

        google.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
        });

        if (showingObject == 0) {
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {

                if (marker.get('status') != 'unlabel' && new_samples.indexOf(marker.get('id')) == -1) {
                    if (old_sample_current_labeled.indexOf(marker.get('id')) == -1) {
                        return;
                    }
                }

                for (i = 0; i < data.length; i++) {
                    if(global_marker[i].id == marker.get('id')) {
                        break;
                    }
                }
                
                /*if (marker.get('status') === 'positive') {
                    marker.set('status', 'unlabel');
                    $("#list_num_positive").text( +$("#list_num_positive").text() - 1);
                    marker.setIcon("house.png");
                    
                    global_marker[i].label = 'unlabel';
                }
                else if (marker.get('status') === 'negative') {
                    marker.set('status', 'unlabel');
                    $("#list_num_negative").text( +$("#list_num_negative").text() - 1);
                    marker.setIcon("house.png");
                    
                    global_marker[i].label = 'unlabel';
                }
                else {*/
                    if ($('#point-label').val() === 'positive'){
                        if (marker.get('status') == 'positive') {
                        }
                        else if (marker.get('status') == 'negative') {
                            $("#list_num_positive").text( +$("#list_num_positive").text() + 1);
                            $("#list_num_negative").text( +$("#list_num_negative").text() - 1);
                            
                        }
                        else if (marker.get('status') == 'unlabel') {
                            $("#list_num_positive").text( +$("#list_num_positive").text() + 1);
							$("#list_num_labeled").text( +$("#list_num_labeled").text() + 1);
                        }
                        marker.setIcon("positive.png");
                        marker.set('status', 'positive');
                        global_marker[i].label = 'positive';
                    }
                    else if ($('#point-label').val() === 'negative') {
                        if (marker.get('status') == 'negative') {
                        }
                        else if (marker.get('status') == 'positive') {
                            $("#list_num_positive").text( +$("#list_num_positive").text() - 1);
                            $("#list_num_negative").text( +$("#list_num_negative").text() + 1);
                            
                        }
                        else if (marker.get('status') == 'unlabel') {
                            $("#list_num_negative").text( +$("#list_num_negative").text() + 1);
							$("#list_num_labeled").text( +$("#list_num_labeled").text() + 1);
                        }
                        marker.setIcon("negative.png");
                        marker.set('status', 'negative');
                        global_marker[i].label = 'negative';
                    }
                    else {
                        console.log("error, point label should either be positive or negative");
                    }
                    if (old_sample_current_labeled.indexOf(marker.get('id')) == -1) {
                        old_sample_current_labeled.push(marker.get('id'));
                    }
                //}
            }
        })(marker, i));
}
        
    }
}

/*
var attr_info = [];

var get_attr_info = function() {

    //get attr array, this is an array of objects
	//the structure of objects is: {attr_name, min_value, max_value}
	var attr_array = $.parseJSON($('#attr_range_data_input').val());
	
	//empty attr_info array
	attr_info = [];

	//get x attr obj, filter result is a one object array
    var attr_x_obj = attr_array.filter(function(element){
      return element.attr_name === $('#x-attr-name').val();
    });

	//push x object
	attr_info.push(attr_x_obj[0]);
	
	//get y attr obj, filter result is a one object array 
    var attr_y_obj = attr_array.filter(function(element){
      return element.attr_name === $('#y-attr-name').val();
    });

	//push y object
	attr_info.push(attr_y_obj[0]);
}
*/

/*
// added by kemi
var map_init_mixed = function() {


    //set x attr as the first item
  	$('#x-attr-name :nth-child(1)').prop('selected', true);
  	//set y attr as the second item
  	$('#y-attr-name :nth-child(2)').prop('selected', true);
  
  	//the number of x options
  	attr_x_option_num = $("#x-attr-name option").length;
  	//the number of y options
  	attr_y_option_num = $("#y-attr-name option").length;
  
  	//events when x attr changes
  	$("#x-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change y attr name to be the next
		  
		  //change y attr name to be the next
		  y_selected_index = (y_selected_index + 1) % attr_y_option_num;
		  //change the attr index to start from 1
		  y_selected_index = y_selected_index + 1;
		  $('#y-attr-name :nth-child(' + y_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
  	//events when y attr changes
  	$("#y-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change x attr name to be the next
		  
		  //change x attr name to be the next
		  x_selected_index = (x_selected_index + 1) % attr_x_option_num;
		  //change the attr index to start from 1
		  x_selected_index = x_selected_index + 1;
		  $('#x-attr-name :nth-child(' + x_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
}

//not used
var map_init = function() {

    //set x attr as the first item
  	$('#x-attr-name :nth-child(1)').prop('selected', true);
  	//set y attr as the second item
  	$('#y-attr-name :nth-child(2)').prop('selected', true);
  
  	//the number of x options
  	attr_x_option_num = $("#x-attr-name option").length;
  	//the number of y options
  	attr_y_option_num = $("#y-attr-name option").length;
  
  	//events when x attr changes
  	$("#x-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change y attr name to be the next
		  
		  //change y attr name to be the next
		  y_selected_index = (y_selected_index + 1) % attr_y_option_num;
		  //change the attr index to start from 1
		  y_selected_index = y_selected_index + 1;
		  $('#y-attr-name :nth-child(' + y_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});
	
  	//events when y attr changes
  	$("#y-attr-name").change(function(){
	  
	  //index starts from 0
	  x_selected_index = $("#x-attr-name").prop("selectedIndex");
	  y_selected_index = $("#y-attr-name").prop("selectedIndex");
	  
	  if(x_selected_index === y_selected_index){
		  //x attr and y attr are the same, change x attr name to be the next
		  
		  //change x attr name to be the next
		  x_selected_index = (x_selected_index + 1) % attr_x_option_num;
		  //change the attr index to start from 1
		  x_selected_index = x_selected_index + 1;
		  $('#x-attr-name :nth-child(' + x_selected_index + ')').prop('selected', true);
		  		  
	  }
	  	
  	});

    $("#initial-sampling-start-btn").on('click', function(event){
		
    //after user click start, the program here reads the value range for x attr and y attr, get intial samples and plot
	
    // clear all markers on the map
    clearMarkers();
    
    //get attribute name and range info into attr_info array
		get_attr_info();
		
		//x attr name
		var attr_x_name = attr_info[0].attr_name;
		//x attr min value
		var attr_x_minvalue = attr_info[0].min_value;
		//x attr max value
		var attr_x_maxvalue = attr_info[0].max_value;
	
		
		//y attr name
		var attr_y_name = attr_info[1].attr_name;
		//y attr min value
		var attr_y_minvalue = attr_info[1].min_value;
		//y attr max value
		var attr_y_maxvalue = attr_info[1].max_value;
	
		//console.log(attr_y_name, attr_y_minvalue, attr_y_maxvalue)
	
	    //set initial sampling method:  width, depth or others
		var sampling_method = "depth";
		
		//build parameter string to send to server in order to get data
	    var post_str = 'xname=' + attr_x_name +
	    '&yname=' + attr_y_name +
	    '&xmin=' + attr_x_minvalue +
	    '&xmax=' + attr_x_maxvalue +
	    '&ymin=' + attr_y_minvalue +
	    '&ymax=' + attr_y_maxvalue +
		'&method=' + sampling_method;
		
		
		//console.log(post_str)
		//console.log(attr_y_minvalue)
		//console.log(+attr_y_minvalue)
        
		//use asynchronous call to get data in json format 
		//data is parsed as object array 
        d3.json("get_initial_samples_for_map.php", function(error, data) {
			if (error)
            	return console.warn(error);

            //console.log("here");
			//console.log(data);
			
			//output the number of samples to the list
			$("#list_num_samples").html(data.length);
			
			//initialize the number of positive-labeled samples to be 0
			$("#list_num_positive").text(0);
			
			//initialize the number of negative-labeled samples to be 0
			$("#list_num_negative").text(0);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(1);
			
			
            //call scatter plot function
			map_plot(data);

          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        
		
	    
		
	  
    });

	$("#resample-btn").on('click', function(event){
		
    	//after user click start, the program here reads the value range for x attr and y attr, get intial samples and plot
	
    	// clear all markers on the map
    	clearMarkers();
    
    	//get attribute name and range info into attr_info array
		get_attr_info();
		
		//x attr name
		var attr_x_name = attr_info[0].attr_name;
		//x attr min value
		var attr_x_minvalue = attr_info[0].min_value;
		//x attr max value
		var attr_x_maxvalue = attr_info[0].max_value;
	
		
		//y attr name
		var attr_y_name = attr_info[1].attr_name;
		//y attr min value
		var attr_y_minvalue = attr_info[1].min_value;
		//y attr max value
		var attr_y_maxvalue = attr_info[1].max_value;
	
		//console.log(attr_x_name, attr_x_minvalue, attr_x_maxvalue)
		//console.log(attr_y_name, attr_y_minvalue, attr_y_maxvalue)
	
	    //set initial sampling method:  width, depth or others
		var sampling_method = "depth";
		
		//build parameter string to send to server in order to get data
	    var post_str = 'xname=' + attr_x_name +
	    '&yname=' + attr_y_name +
	    '&xmin=' + attr_x_minvalue +
	    '&xmax=' + attr_x_maxvalue +
	    '&ymin=' + attr_y_minvalue +
	    '&ymax=' + attr_y_maxvalue +
		'&method=' + sampling_method;
		
		
		//console.log(post_str)
		//console.log(attr_y_minvalue)
		//console.log(+attr_y_minvalue)
        
		//use asynchronous call to get data in json format 
		//data is parsed as object array 
        d3.json("get_initial_samples_for_map.php", function(error, data) {
			if (error)
            	return console.warn(error);

            //console.log("here");
			//console.log(data);
			
			//output the number of samples to the list
			$("#list_num_samples").html(data.length);
			
			//initialize the number of positive-labeled samples to be 0
			$("#list_num_positive").text(0);
			
			//initialize the number of negative-labeled samples to be 0
			$("#list_num_negative").text(0);
			 
			//write 1 to the list value for the number of iterations
			$("#list_iterations").text(1);
			
			
            //call scatter plot function
			map_plot(data);

          })
          .header("Content-Type", "application/x-www-form-urlencoded")
          .post(post_str);
        
		
		
	  
    });


}

//$(map_init);
*/
