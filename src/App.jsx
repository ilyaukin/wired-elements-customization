import ReactDOM from 'react-dom';
import React from 'react';
import '../components/wired-combo/src/wired-combo';
import '../components/wired-item/wired-item/src/wired-item';

const App = () => {
  return <div>
    <wired-combo>
      {[...Array(500).keys()].map((i) => <wired-item key={i} value={i}>Item {i}</wired-item>)}
    </wired-combo>
  </div>
}

ReactDOM.render(<App/>, document.getElementById('app'));
