import React, { Component } from 'react';
import './App.css';
import CreateLoan from './CreateLoan.js'
import DebtView from './DebtView.js'
import InvestmentView from './InvestmentView.js'
import Market from './Market.js'
import { BrowserRouter, Link, Route } from 'react-router-dom'
var Web3 = require('web3')
class App extends Component {
  render() {
    const web3 = new Web3(window.web3.currentProvider)
    return (
      <BrowserRouter>
        <div className="App">
          <nav>
            <Link to="/create">Create Loan</Link>
            <Link to="/debt">Debt</Link>
            <Link to="/investment">Investments</Link>
            <Link to="/market">Market</Link>
          </nav>
          <div>
            <Route path="/create" render={() => <CreateLoan web3={web3} />}/>
            <Route path="/debt" render={() => <DebtView web3={web3} />}/>
            <Route path="/investment" render={() => <InvestmentView web3={web3} />}/>
            <Route path="/market" render={() => <Market web3={web3} />}/>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
