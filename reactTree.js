// import React from 'react';
// import Tree from 'react-d3-tree';
const React = require('react');
const Tree = require('react-d3-tree');
const createReactClass = require('create-react-class');

const myTreeData = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

var MyComponent = createReactClass({
  render: function() {
    return (
      <div id="treeWrapper" style={{width: '50em', height: '20em'}}>

        <Tree data={myTreeData} />

      </div>
    );
  }
});