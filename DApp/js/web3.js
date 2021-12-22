const stakingAddress = "0xE76A217736D2F1B166Dbf814098E5F0B7b398462";
var stakingContract;

const nftContractAddress = "0xf37fffd3Fd47d783fE24aA823368877EFa1DA92D";
var nftContract;

var userAccount;

var ownerNftsIds;
var basePinataGatewayUrl = "https://gateway.pinata.cloud/ipfs/";

const loginButton = document.querySelector('#loginBtn');
const tokenBalance = document.querySelector('#token-balance');
const nftBalance = document.querySelector('#nft-balance');


var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

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
                alert("Please Connect to Polygon Network");
            }
        });

        await ethereum.request({ method: 'eth_requestAccounts' })
        .then(function(result) {
        userAccount = result[0];
        });

        await showAddress();

        $('#login').remove();
        stakingContract = new web3js.eth.Contract(stakingAbi, stakingAddress);
        nftContract = new web3js.eth.Contract(nftContractAbi, nftContractAddress);
        checkNft();
    
    } else {
      alert("Please Install Metamask.");
    }
     
}


async function showAddress() {

  $('#loginBtn').remove();
  $('#header-info').append(`
    <p class="account-address">${userAccount.substring(0, 4) + "..." + userAccount.substring(userAccount.length - 6, userAccount.length)}</p>
  `);

}



async function checkNft() {
  
  var ownerNfts;
  
  await nftContract.methods.walletOfOwner(userAccount).call({from:userAccount}).then(res => {
    ownerNfts = res;
  });

  var balances;
  await stakingContract.methods.getUserBalances().call({from:userAccount}).then(res => {
    balances = res;
  })

  tokenBalance.innerText = `MZRO Balance: ${balances[0] / (10 ** 9)}`;
  nftBalance.innerText = `Nfts Count: ${balances[1]}`;


  if (balances[1] == 0) {
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

  var nfts;
  
  await nftContract.methods.walletOfOwner(userAccount).call({from:userAccount}).then(res => {
    nfts = res;
  });
  console.log(nfts);

  $('body').append(`
    <div id="ownedNfts"></div>
  `);

  for (var nft in nfts) {
    var nftInfo; 
    
    await nftContract.methods.tokenURI(nft).call({from:userAccount}).then(res => {
      nftInfo = res;
    });
    console.log(nftInfo);

    if (nft != 0) {
      nftInfo = nftInfo.replace('ipfs://', '');
      var response = await fetch(`https://ipfs.io/ipfs/${nftInfo}`);
      var json = await response.json();
      var image = "https://ipfs.io/ipfs/" + json.image.replace('ipfs://', '');
      console.log(json);

      $('#ownedNfts').append(`
      
      <div class="card nftCard" style="width: 18rem;">
        <img class="card-img-top" src="${image}" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${json.name}</h5>
          <p class="card-text">${json.description}</p>
          <a href="#" class="btn btn-primary">Go somewhere</a>
        </div>
      </div>
      
      `);
    }
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