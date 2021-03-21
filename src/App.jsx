import ReactDOM from 'react-dom';
import React from 'react';
import '../components/wired-combo/src/wired-combo';
import '../components/wired-item/wired-item/src/wired-item';

const App = () => {
  return <div>
    <wired-combo>
      <wired-item value='banana'>Banana</wired-item>
      <wired-item value='apple'>Apple</wired-item>
      <wired-item value='long'>Some fruit with a long name</wired-item>
    </wired-combo>
  </div>
}

ReactDOM.render(<App/>, document.getElementById('app'));
