

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

var refresh_table_info = function(){
	
	var tablename_select = $("#inputTable").val();
	
	//console.log(tablename_select);
	
    d3.json("get_table_size.php", function(error, data) {
      if (error)
        return console.warn(error);

	  //console.log(data[0].table_size);
	  
	  //output the table in the page
	  $("#tableSize").text(data[0].table_size);
		
      })
      .header("Content-Type", "application/x-www-form-urlencoded")
      .post('tablename=' + tablename_select);
	
};


var init_table_info = function(){

	refresh_table_info();
	
	  $("#inputTable").change(function(){
		
	  	refresh_table_info();	  
		  
	  });  
	

};

$(init_table_info);