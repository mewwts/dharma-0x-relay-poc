import React, { Component } from 'react';
import { Dharma} from "@dharmaprotocol/dharma.js";
const {Debts} = Dharma.Types


export default class DebtView extends Component {

  constructor() {
		super()
    this.state={debts: []}
  }

  componentDidMount() {
    this.stuff()
      .then((debts) => {
        console.log(debts)
        this.setState({debts: debts})
      })
      .catch((err) => console.log(err))
  }

  async stuff() {
    const dharma = new Dharma(this.props.web3.currentProvider)
    const accounts = this.props.web3.accounts
    const debts = await Debts.get(dharma, accounts[0])
    return debts
  }

  render() {
    const debts = this.state.debts.map((d) => <li key={d.params.id}> {d.params.id} </li>)
    return (
      <div>
        hello
        <ul>
          {debts}
        </ul>
      </div>
      );
  }

}
