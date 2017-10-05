Celestial Walk Demo
===================

This repository contains code implementing the celestial walk, as well
as the visibility walk and the straight walk for point location in
two-dimensional meshes.

The implementation is self contained. Do note that the mesh is not
reusable as is. In particular it can only handle small, integer
coordinates robustly.

Running
-------

Via this repository's github [page](https://wkuijper.github.com/celestial-walk-demo/). Or locally, just open `index.html` with a modern ES6 compliant browser.

Usage
-----

Select a mesh type to generate a random mesh. Select a walking
strategy (note that the visibility walk is only guaranteed to
terminate on the Delaunay type meshes).

Click or touch on the mesh to select an initial face, click or touch a
second time to select aq query point.

The demo will display the number of faces in the path as well as the
number of orientation tests that was performed as a good indication of
the walks' efficiency.

Switch between walk type using the select box at the top of the page
to quickly compare the results of different walks on the same mesh,
start face and query point.

Building
--------

Install [node.js](https://nodejs.org).

Install dependencies:

    npm install

Run unit tests:

    npm test

Start the app:

    npm start
