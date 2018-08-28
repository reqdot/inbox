const assert = require('assert');

// 테스트 로컬 네트워크
const ganache = require('ganache-cli');

// 하나의 Web3는 하나의 네트워크에 접속하기 위한 것
// Web3는 constructor임
const Web3 = require('web3');

// web3 - provider(커뮤니케이션 레이어) - ganache
// provider를 바꾸면 다른 이더리움 네트워크로 접속이 가능
const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let accounts;
let inbox;
const INITIAL_MESSAGE ='Hi there!';

// ganache에서 accounts들을 publickey, privatekey이 없어도 되도록 계좌 생성해 줌
// unlocked된 accounts
beforeEach(async () => {
    // Get a list of all accounts
   accounts = await web3.eth.getAccounts();
         
    // Use one of those accounts to deploy
    // the contract
   inbox = await new web3.eth.Contract(JSON.parse(interface))
   .deploy({ data: bytecode, arguments: [INITIAL_MESSAGE] })
   .send({ from: accounts[0], gas: '1000000' });

   inbox.setProvider(provider);
});

describe('Inbox', () => {
    it('deploys a contract', () => {
      assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
      const message = await inbox.methods.message().call();
      assert.equal(message, INITIAL_MESSAGE);
    });

    it('can change the message', async () => {
      await inbox.methods.setMessage('bye').send({ from: accounts[0] });
      const message = await inbox.methods.message().call();
      assert.equal(message, 'bye');
    });
});


