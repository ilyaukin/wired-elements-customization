import ReactDOM from 'react-dom';
import React from 'react';
import '../packages/wired-combo-lazy/src/wired-combo-lazy';
// import '../packages/wired-combo/src/wired-combo';
// import 'wired-item';

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
  //     <wired-item value="banana">Banana</wired-item>
  //     <wired-item value="apple">Apple</wired-item>
  //     <wired-item value=''>Some fruit with a long name a</wired-item>
  //   </wired-combo>
  // </div>
  //
  React.useEffect(() => {
    document.getElementById("combo").values = getValues();
    document.getElementById("combo").addEventListener("selected",
      (e) => console.log(e.detail));
    document.getElementById("combo").focus();
  })

  return <div>
    <wired-combo-lazy id='combo'>
    </wired-combo-lazy>
  </div>
}

ReactDOM.render(<App/>, document.getElementById('app'));
