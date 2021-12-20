const stakingAddress = "0x230d65Fd723124F1383A2d79683D06f7E3eC4284";
var stakingContract;

var userAccount;

const loginButton = document.querySelector('#loginBtn');
const tokenBalance = document.querySelector('#token-balance');
const nftBalance = document.querySelector('#nft-balance');


addEventListener('load', async function() {
   loginButton.addEventListener('click', async function() {
       await login();
   })
})

async function login() {
    if (typeof web3 !== 'undefined') {
        web3js = new Web3(window.ethereum);
  
        await web3js.eth.net.getId().then(res => {
            if (res != 3) {
                alert("Please Connect to Ropsten Network");
            }
        });

        await ethereum.request({ method: 'eth_requestAccounts' })
        .then(function(result) {
        userAccount = result[0];
        });

        $('#login').remove();
        stakingContract = new web3js.eth.Contract(stakingAbi, stakingAddress);
        checkNft();
    
    } else {
      alert("Please Install Metamask.");
    }
     
}



async function checkNft() {
  
  var nftHolder;
  
  await stakingContract.methods.checkNftHolder().call({from:userAccount}).then(res => {
    nftHolder = res;
  });

  var balances;
  await stakingContract.methods.getUserBalances().call({from:userAccount}).then(res => {
    balances = res;
  })

  tokenBalance.innerText = `MZRO Balance: ${balances[0] / (10 ** 9)} MZRO`;
  nftBalance.innerText = `Nfts Count: ${balances[1]}`;


  if (!nftHolder) {
    $('body').append(`
      <section class="notHolder" id="nft">
          <h2 class="notHolder-alert text-center">You do not own any NFTS</h2>
      </section>
    `);
  } else {

    checkAllowed();

  }

}

async function checkAllowed() {

  var allowed;
  await stakingContract.methods.checkTokenAllowed().call({from:userAccount}).then(res => {
    allowed = res;
  });

  if (allowed == 0) {
    $('body').append(`
        <section class="notHolder notApproved" id="nft">
            <h2 class="notHolder-alert text-center">Need to Approve MZRO Token</h2>
            <button type="button" class="btn btn-success" id="approve-btn">Approve MZRO</button>
        </section>
    `);

    $('#approve-btn').click(async function() {
      stakingContract.methods.allowStake().send({from:userAccount}).on('receipt', () => {
        location.reload();
      });
    });

  } else {

    stakingPools();

  }

}


async function stakingPools() {

  var staker;

  await stakingContract.methods.checkStaker().call({from:userAccount}).then(res => {
    staker = res;
  });

  if (staker) {
    showUnstakingPool();
  } else {
    showStakingPools();
  }

}

async function showStakingPools() {

  var information;

  await stakingContract.methods.getStakingPoolsInformation().call({from:userAccount}).then(res => {
    information = res;
  });

  $('body').append(`
      <div class="cards">

          <div class="staking-card">
              <div class="staking-card-header">
                  <h2>MZRO</h2>
                  <p>Staking Period: 30 days</p>
                  <p class="earning" id="thirty-earnings">${information[0][0] / (10 ** 9)} MZRO / Day</p>
              </div>

              <div class="staking-card-body">
                  <p>APR: <span>${information[0][0] / (10 ** 9) * 365 / information[1] * 100 * 10 ** 9}%</span></p>
                  <p>Earn: <span>MZRO</span></p>
                  <p>Stake Amount: <span>${information[1] / (10 ** 9)} MZRO</span></p>
              </div>

              <div class="staking-card-footer">
                  <button type="button" class="btn btn-success" id="stake-thirty-btn">Stake</button>
              </div>
          </div>

          <div class="staking-card">
              <div class="staking-card-header">
                  <h2>MZRO</h2>
                  <p>Staking Period: 60 days</p>
                  <p class="earning" id="sixty-earnings">${information[0][1] / (10 ** 9)} MZRO / Day</p>
              </div>

              <div class="staking-card-body">
                  <p>APR: <span>${information[0][1] / (10 ** 9) * 365 / information[1] * 100 * 10 ** 9}%</span></p>
                  <p>Earn: <span>MZRO</span></p>
                  <p>Stake Amount: <span>${information[1] / (10 ** 9)} MZRO</span></p>
              </div>

              <div class="staking-card-footer">
                  <button type="button" class="btn btn-success" id="stake-sixty-btn">Stake</button>
              </div>
          </div>

          <div class="staking-card">
              <div class="staking-card-header">
                  <h2>MZRO</h2>
                  <p>Staking Period: 90 days</p>
                  <p class="earning" id="ninety-earnings">${information[0][2] / (10 ** 9)} MZRO / Day</p>
              </div>

              <div class="staking-card-body">
                  <p>APR: <span>${information[0][2] / (10 ** 9) * 365 / information[1] * 100 * 10 ** 9}%</span></p>
                  <p>Earn: <span>MZRO</span></p>
                  <p>Stake Amount: <span>${information[1] / (10 ** 9)} MZRO</span></p>
              </div>

              <div class="staking-card-footer">
                  <button type="button" class="btn btn-success" id="stake-ninety-btn">Stake</button>
              </div>
          </div>

      </div>
  `);

  $('#stake-thirty-btn').click(async function() {
    stakingContract.methods.stakeThirty().send({from:userAccount}).on('receipt', () => {
      location.reload();
    });
  });

  $('#stake-sixty-btn').click(async function() {
    stakingContract.methods.stakeSixty().send({from:userAccount}).on('receipt', () => {
      location.reload();
    });
  });

  $('#stake-ninety-btn').click(async function() {
    stakingContract.methods.stakeNinety().send({from:userAccount}).on('receipt', () => {
      location.reload();
    });
  });

}


async function showUnstakingPool() {

  var information;

  await stakingContract.methods.getStakerPoolInformation().call({from:userAccount}).then(res => {
    information = res;
  });

  var stakingPeriod;
  if (information[1] == 0) {
    stakingPeriod = '30';
  } else if (information[1] == 1) {
    stakingPeriod = '60';
  } else {
    stakingPeriod = '90';
  }

  var early;
  if (information[0]) {
    early = 'Completed Staking Period'
  } else {
    early = 'Early Stake'
  }

  $('body').append(`
      <div class="cards">

          <div class="staking-card">
              <div class="staking-card-header">
                  <h2>MZRO</h2>
                  <p>Staking Period: ${stakingPeriod} days</p>
                  <p class="earning" id="thirty-earnings">${information[3] / (10 ** 9)} MZRO / Day</p>
              </div>

              <div class="staking-card-body">
                  <p>APR: <span>${information[3] / (10 ** 9) * 365 / information[4] * 100 * (10 ** 9)}%</span></p>
                  <p>Earn: <span>MZRO</span></p>
                  <p>Staked Amount: <span>50 MZRO</span></p>
                  <p>Staking Status: <span>${early}</span></p>
                  <p>Days Staked: <span>${information[5]} Days</span></p>
                  <p>Earned Amount: <span>${information[2] / (10 ** 9)} MZRO</span></p>
              </div>

              <div class="staking-card-footer">
                  <button type="button" class="btn btn-warning" id="unstake-btn">Unstake</button>
              </div>
          </div>

      </div>
  `);

  $('#unstake-btn').click(async function() {
    stakingContract.methods.unstake().send({from:userAccount}).on('receipt', () => {
      location.reload();
    });
  });

}