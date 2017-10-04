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

Via this repository's github [page](https://wkuijper.github.com/celestial-walk-demo/). Or locally, just open `index.html` with a modern EC6 compliant browser.

Building
--------

Install [node.js](https://nodejs.org).

Install dependencies:

    npm install

Run unit tests:

    npm test

Start webpack:

    webpack --watch
