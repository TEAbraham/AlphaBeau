import React from 'react';
import { Tree, treeUtil } from 'react-d3-tree';

const jsonSource = 'ecolan.json';

constructor() {
  super();

  this.state = {
    data: undefined,
  };
}

componentWillMount() {
  treeUtil.parseJSON(jsonSource)
  .then((data) => {
    this.setState({ data })
  })
  .catch((err) => console.error(err));
}

class MyComponent extends React.Component {
  render() {
    return (
      
      <div id="treeWrapper" style={{width: '50em', height: '20em'}}>

        <Tree data={this.state.data} />

      </div>
    );
  }
}