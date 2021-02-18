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

(function() {

  d3.rectbin = function() {
    var dx = 0.1,
        dy = 0.1, 
        x = rectbinX,
        y = rectbinY;

    function rectbin(points) {
      var binsById = {};
      var xExtent = d3.extent(points, function(d, i){ return x.call(rectbin, d, i) ;});
      var yExtent = d3.extent(points, function(d, i){ return y.call(rectbin, d, i) ;});

      d3.range(yExtent[0], yExtent[1] + dx, dy).forEach(function(Y){
        d3.range(xExtent[0], xExtent[1] + dx, dx).forEach(function(X){
          var py = Y / dy; 
          var pj = trunc(py);
          var px = X / dx;
          var pi = trunc(px);
          var id = pi + '-' + pj;
          var bin = binsById[id] = [];
          bin.i = pi;
          bin.j = pj;
          bin.x = pi * dx;
          bin.y = pj * dy;
        });
      });
      points.forEach(function(point, i) {
        var py = y.call(rectbin, point, i) / dy;
        var pj = trunc(py);
        var px = x.call(rectbin, point, i) / dx;
        var pi = trunc(px);

        var id = pi + '-' + pj;
        var bin = binsById[id];
        bin.push(point);
      });
      return d3.values(binsById);
    }

    rectbin.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return rectbin;
    };

    rectbin.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return rectbin;
    };

    rectbin.dx = function(_) {
      if (!arguments.length) return dx;
      dx = _;
      return rectbin;
    };

    rectbin.dy = function(_) {
      if (!arguments.length) return dy;
      dy = _;
      return rectbin;
    };


    return rectbin;
  };

  var rectbinX = function(d) { return d[0]; },
      rectbinY = function(d) { return d[1]; };

})();

function trunc(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}
