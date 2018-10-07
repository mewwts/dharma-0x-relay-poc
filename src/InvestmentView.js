import React, { Component } from 'react';
import { Dharma} from "@dharmaprotocol/dharma.js";
const {Investments} = Dharma.Types


export default class DebtView extends Component {

  constructor() {
		super()
    this.state={investments: []}
  }

  componentDidMount() {
    this.stuff()
      .then((investments) => {
        this.setState({investments: investments})
      })
 }

  async stuff() {
    const dharma = new Dharma(this.props.web3.currentProvider)
    const debtContract = await dharma.contracts.loadDebtTokenAsync()
    console.log(debtContract)
    const accounts = this.props.web3.eth.accounts
    console.log(accounts)
    const d = await debtContract.balanceOf.callAsync(accounts[0], "latest")
    console.log(d)
    const investments = await Investments.get(dharma, accounts[0])
    console.log(investments)
    const exists = await debtContract.exists.callAsync(investments[0].params.id)
    console.log(exists)
    return investments
  }

  render() {
    const investments = this.state.investments.map((d) => <li key={d.params.id}> {d.params.id} </li>)
    return (
      <div>
        hello
        <ul>
          {investments}
        </ul>
      </div>
      );
  }

}
