import ReactDOM from 'react-dom';
import React from 'react';
import '../components/wired-combo/src/wired-combo';
import '../components/wired-item/wired-item/src/wired-item';
import '../components/wired-combo-lazy/src/wired-combo-lazy';

const App = () => {
  function getItems() {

    // get, not render
    let s = new Date();
    let element = <>
      {[...Array(50000).keys()].map((i) => <wired-item key={i} value={i}>Item {i}</wired-item>)}
    </>;
    let t = new Date() - s;
    console.log(t);
    return element;
  }

  function getValues() {
    let s = new Date();
    let values = [...Array(50000).keys()].map((i) => ({ value: i, text: `Item ${i}` }))
    let t = new Date() - s;
    console.log(t);
    return values;
  }

  // getItems();

  // return <div>
  //   <wired-combo>
  //     {getItems()}
  //   </wired-combo>
  // </div>

  React.useEffect(() => {
    document.getElementById("combo").values = getValues();
    document.getElementById("combo").addEventListener("selected",
      (e) => console.log(e.detail));
  })

  return <div>
    <wired-combo-lazy id='combo'>
    </wired-combo-lazy>
  </div>
}

ReactDOM.render(<App/>, document.getElementById('app'));
