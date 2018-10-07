import React, { Component } from 'react';
import { Dharma} from "@dharmaprotocol/dharma.js";

import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    orderHashUtils,
    signatureUtils,
    SignerType,
} from '0x.js';
import { Web3Wrapper } from '@0xproject/web3-wrapper';
import { Web3ProviderEngine } from '0x.js';
import { SignerSubprovider, RPCSubprovider} from '@0xproject/subproviders';

const {Investments} = Dharma.Types

export default class Market extends Component {

  constructor() {
		super()
    this.stuff = this.stuff.bind(this)
    this.state={investments: [], orders: []}
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
    const accounts = this.props.web3.eth.accounts
    const investments = await Investments.get(dharma, accounts[0])
    const exists = await debtContract.exists.callAsync(investments[0].params.id)
    return investments
  }

  async sell(d) {
    console.log(d)
    const dharma = new Dharma(this.props.web3.currentProvider)
    const debtContract = await dharma.contracts.loadDebtTokenAsync()
    const accounts = this.props.web3.eth.accounts
    const debtAddress = debtContract.address;

    // 0x stuff
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new SignerSubprovider(this.props.web3.currentProvider));
    providerEngine.start()

    const contractWrappers = new ContractWrappers(providerEngine, {networkId: 42});
  
    const zrxAddress = await dharma.contracts.getTokenAddressBySymbolAsync("ZRX");
    const daiAddress = await dharma.contracts.getTokenAddressBySymbolAsync("DAI");

    
    const tokenId = this.props.web3.toBigNumber(d.params.id);
    const makerAssetAmount = new BigNumber(1);
    const makerAssetData = assetDataUtils.encodeERC721AssetData(debtAddress, tokenId);
    const takerAssetData = assetDataUtils.encodeERC20AssetData(daiAddress);
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(10), 18);
    const proxy = contractWrappers.erc721Proxy.getContractAddress();
    const ownerOf = await debtContract.ownerOf.callAsync(tokenId)
    const isApproved = await debtContract.getApproved.callAsync(tokenId);
    if (isApproved !== proxy) {
      const a = await debtContract.approve.sendTransactionAsync(
        proxy,
        d.params.id,
        {from: accounts[0]}
      );
    }
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
    const ZERO = new BigNumber(0);
    const order = {
      exchangeAddress: contractWrappers.exchange.getContractAddress(),
      makerAddress: accounts[0],
      takerAddress: NULL_ADDRESS,
      senderAddress: NULL_ADDRESS,
      feeRecipientAddress: NULL_ADDRESS,
      expirationTimeSeconds: new BigNumber(Date.now() + 10000*60*60).div(1000).ceil(),
      salt: generatePseudoRandomSalt(),
      makerAssetAmount,
      takerAssetAmount,
      makerAssetData,
      takerAssetData,
      makerFee: ZERO,
      takerFee: ZERO,
    };
    console.log(order)
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    console.log(orderHashHex)

    const signature = await signatureUtils.ecSignOrderHashAsync(
        providerEngine,
        orderHashHex,
        accounts[0],
        'METAMASK'
    );
    console.log(signature)
    const signedOrder = { ...order, signature };
    // Fill the Order via 0x.js Exchange contract
    console.log(signedOrder)
    
    this.setState(...this.state, {orders: [signedOrder]})
  }

  async fill(order) {
    const accounts = this.props.web3.eth.accounts
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(new SignerSubprovider(this.props.web3.currentProvider));
    providerEngine.start()

    const contractWrappers = new ContractWrappers(providerEngine, {networkId: 42});
    const t = await contractWrappers.exchange.fillOrderAsync(order, order.takerAssetAmount, accounts[0], {
      gasLimit: 400000,
    });
    console.log(t)
    return t
  }

  render() {
    const investments = this.state.investments.map((d) => <li key={d.params.id}> <button onClick={() => this.sell(d)}> Sell: {d.params.id} </button> </li>)
    const orders = this.state.orders.map(o => <li key={o.salt}> <button onClick={() => this.fill(o)}>Fill</button></li>)
    return (
      <div>
        My investments:
        <ul>
          {investments}
        </ul>
        Fillable orders:
        <ul>
          {orders}
        </ul>
      </div>
      );
  }

}
