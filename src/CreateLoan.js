import React, { Component } from 'react';
import { Dharma} from "@dharmaprotocol/dharma.js";
const {LoanRequest} = Dharma.Types;


export default class CreateLoan extends Component {

  constructor() {
		super()
    this.newLoan = this.newLoan.bind(this);
    this.fillLoan = this.fillLoan.bind(this);
    this.setAllowance = this.setAllowance.bind(this);
		this.dharma = null;
    this.state = {loans: {}}
  }

	componentDidUpdate(prevProps) {
		this.dharma = new Dharma(prevProps.web3)
	}

  async newLoan(dharma) {
		const loanRequest = await LoanRequest.create(dharma, {
			principalAmount: 200,
			principalToken: "DAI",
			collateralAmount: 200,
			collateralToken: "ZRX",
			interestRate: 3.5,
			termDuration: 3,
			termUnit: "months",
			expiresInDuration: 1,
			expiresInUnit: "weeks"
		});
		await loanRequest.signAsDebtor()
    const l = loanRequest.toJSON()
    //const txHash = await loanRequest.allowCollateralTransfer();
    this.setState({loans: {...this.state.loans, [l.salt]: l}})
  }

  async fillLoan(dharma, loanJSON) {
    const loan = await LoanRequest.load(dharma, loanJSON);
    const txHash = await loan.fillAsCreditor()
    console.log(txHash)
  }

  async setAllowance(dharma, web3) {
    const { Token } = Dharma.Types;
    const accounts = await web3.eth.getAccounts()
    const txhash = await Token.makeAllowanceUnlimitedIfNecessary(dharma, "ZRX", accounts[0])
    console.log(txhash)
    const txhash1 = await Token.makeAllowanceUnlimitedIfNecessary(dharma, "WETH", accounts[0])
    console.log(txhash1)
  }

  render() {
    const dharma = new Dharma(this.props.web3.currentProvider)
    const loans = Object.keys(this.state.loans).map((loan) => {
      return (<li key={loan}><button onClick={() => this.fillLoan(dharma, this.state.loans[loan])}> {loan} </button> </li>) 
    })



    return (
			<div>
        <button onClick={() => this.setAllowance(dharma, this.props.web3)}> Set Allowance </button>
				<button onClick={() => this.newLoan(dharma)}>New Loan</button>
        <ul>{loans}</ul>
			</div>
		)
  }
}
