const stakingAddress = "0xE22D70b2C754d237cDd7FDccbf5A41BC35D2B7F6";
var stakingContract;

var userAccount;

const loginButton = document.querySelector('#loginBtn');


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
    
      } else {
        alert("Please Install Metamask.");
      }
  
  
      stakingContract = new web3js.eth.Contract(stakingAbi, stakingAddress);
  
      await ethereum.request({ method: 'eth_requestAccounts' })
      .then(function(result) {
      userAccount = result[0];
    });
  
}



async function buyTokens() {
  var amountToBuy = icoBuyAmountInput.value;

  var minPurchase;
  var price;
  var maxPurchase;
  var tokensAvailable;
  var end;

  await icoContract.methods.minPurchase().call({from:userAccount}).then(res => {
    minPurchase = res / 1000000000000000000;
  });

  await icoContract.methods.maxPurchase().call({from:userAccount}).then(res => {
    maxPurchase = res / 1000000000000000000;
  });

  await icoContract.methods.price().call({from:userAccount}).then(res => {
    price = res / 1000000000000000000;
  });

  await icoContract.methods.availableTokensICO().call({from:userAccount}).then(res => {
    tokensAvailable = res / (10**18);
  });

  await icoContract.methods.end().call({from:userAccount}).then(res => {
    if (res - (Date.now() / 1000) < 0) {
      end = 0;
    } else {
      end = res - (Date.now() / 1000);
    }
  });




  if (amountToBuy != "") {
    if (minPurchase <= (amountToBuy * price) <= maxPurchase) {
      if (amountToBuy < tokensAvailable){
        if (end > 0) {
          var sendValue = amountToBuy * price * 1000000000000000000;

          await icoContract.methods.buy().send({from:userAccount, value:sendValue});
        } else {
          alert("Already finished.");
        }
      } else {
        alert("Not enough tokens available.");
      }
    } else {
      alert("Not between min and max Purchase.");
    }
  } else {
    alert("Not a valid Number");
  }
}

async function checkInfo() {

  var price;
  var end;
  var minPurchase;
  var maxPurchase;
  var tokensAvailable;

  await icoContract.methods.price().call({from:userAccount}).then(res => {
    price = res / 1000000000000000000;
  });

  await icoContract.methods.end().call({from:userAccount}).then(res => {
    if (res - (Date.now() / 1000) < 0) {
      end = 0;
    } else {
      end = res - (Date.now() / 1000);
    }
  });

  await icoContract.methods.minPurchase().call({from:userAccount}).then(res => {
    minPurchase = res / 1000000000000000000;
  });

  await icoContract.methods.maxPurchase().call({from:userAccount}).then(res => {
    maxPurchase = res / 1000000000000000000;
  });

  await icoContract.methods.availableTokensICO().call({from:userAccount}).then(res => {
    tokensAvailable = res / (10**18);
  });

  icoLeftTokensText.innerText = `Tokens Left: ${tokensAvailable} YOGI`;
  icoLeftTimeText.innerText = `Time Left: ${Math.floor(end)} Seconds`;
  icoPriceText.innerText = `Token Price: ${price} BNB / 1 YOGI`;
  icoPurchaseAmountText.innerText = `Min Purchase: ${minPurchase} BNB - Max Purchase: ${maxPurchase} BNB`;

  setTimeout(1000, checkInfo());
}
