const bankElement = document.getElementById("bankButton");
const workElement = document.getElementById("workButton");
const loanElement = document.getElementById("loanButton");
const buyElement = document.getElementById("buyButton");
const debtElement = document.getElementById("debt");
const paySumElement = document.getElementById("paySum");
const bankBalanceElement = document.getElementById("bankBalance");
const infoImageElement = document.getElementById("infoImage");
const infoTitleElement = document.getElementById("infoTitle");
const infoPriceElement = document.getElementById("infoPrice");
const laptopsElement = document.getElementById("laptops");
const specsElement = document.getElementById("specs");
const infoDescriptionElement = document.getElementById("infoDescription");

let bankBalance = 0.00;
let payBalance = 0.00;
let loanBalance = 0.00;
let laptops = [];

fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    .then(response => response.json())
    .then(data => laptops = data)
    .then(laptops => addLaptopsToSelection(laptops));

const addLaptopsToSelection = (laptops) => {
    laptops.forEach(laptop => addLaptopToSelection(laptop));
    updateSelection(laptops[0]);
};

const addLaptopToSelection = (laptop) => {
    const laptopElement = document.createElement("option");
    laptopElement.value = laptop.id;
    laptopElement.appendChild(document.createTextNode(laptop.title));
    laptopsElement.appendChild(laptopElement);
};

const handleLaptopSelectionChange = e => {
    const selectedLaptop = laptops[e.target.selectedIndex];
    infoImageElement.removeChild(infoImageElement.lastChild);
    specsElement.removeChild(specsElement.lastChild);
    updateSelection(selectedLaptop);
};

const handleLoan = () => {
    if (loanBalance === 0 && bankBalance === 0) {
        alert("You have to do some work first!");
    } else if (loanBalance === 0) {
        const maxLoan = bankBalance * 2;
        const amountString = prompt("Your bank allows up to " + maxLoan + " kr, choose your amount");
        const loanAmount = parseFloat(amountString);
        if (loanAmount > 0 && loanAmount <= maxLoan && loanAmount != null) {
            alert(loanAmount + " has been transferred to your account");
            bankBalance += loanAmount;
            loanBalance += loanAmount;
            checkBankBalance();
        } else if (loanAmount != null) {
            alert("Please enter a valid amount!");
        }
    }
    else {
        const paymentString = prompt("How much would you like to repay?");
        const payment = parseFloat(paymentString)
        if (payment < bankBalance && payment <= loanBalance) {
            alert(payment + " has been deducted from your account");
            bankBalance -= parseFloat(payment);
            loanBalance -= parseFloat(payment);
        } else {
            alert("Invalid entry")
        }
        checkBankBalance();
    }
};

const handleWork = () => {
    payBalance += 100;
    checkBankBalance();
};

const handleBank = () => {
    if (payBalance === 0) {
        alert("You need to do some work first");
    } else if (loanBalance > 0) {
        if (0.1 * payBalance >= loanBalance) {
            bankBalance = bankBalance + payBalance - loanBalance;
            loanBalance = 0;
        } else {
            bankBalance += 0.9 * payBalance;
            loanBalance -= 0.1 * payBalance;
        }
        alert("Up to 10% of your earnings has been forwarded towards paying of your debt");
        payBalance = 0;
        checkBankBalance();
    } else {
        bankBalance += payBalance;
        payBalance = 0;
        paySumElement.innerText = payBalance + " kr";
        checkBankBalance();
    }

};

const checkBankBalance = () => {
    paySumElement.innerText = "Pay " + payBalance + " kr";
    bankBalanceElement.innerText = "Balance " + bankBalance + " kr";
    if (loanBalance === 0) {
        loanElement.innerText = "Get a loan";
        debtElement.innerText = "";
    } else {
        loanElement.innerText = "Pay debt";
        debtElement.innerText = "Outstanding loan " + loanBalance + " kr";
    }
};

const updateSelection = (laptop) => {
    infoTitleElement.innerText = laptop.title;
    infoDescriptionElement.innerText = laptop.description;
    infoPriceElement.innerText = laptop.price + " NOK";
    buyElement.value = laptop.price;
    const listElement = document.createElement("ul");
    laptop.specs.forEach(element => {
        const listItem = document.createElement("li");
        listItem.innerText = element;
        listElement.appendChild(listItem);
    });
    specsElement.appendChild(listElement);
    checkIfImageExists(laptop, (exists) => {
        if (exists) {
            const laptopImage = document.createElement("img");
            laptopImage.setAttribute("class", "infoImageFile");
            laptopImage.setAttribute("src", "https://noroff-komputer-store-api.herokuapp.com/" + laptop.image);
            infoImageElement.appendChild(laptopImage);
        } else {
            infoImageElement.innerText = "No image available!";
        }
    });
};

const checkIfImageExists = (laptop, exists) => {
    const path = "https://noroff-komputer-store-api.herokuapp.com/" + laptop.image;
    const img = new Image();
    img.src = path;
    if (img.complete) {
        exists(true);
    } else {
        img.onload = () => {
            exists(true);
        };
    }
    img.onerror = () => {
        exists(false);

    };
};

const handleBuy = () => {
    if (bankBalance >= buyElement.value) {
        alert("Congratulations you have just bough a new Komputer!");
        bankBalance -= buyElement.value;
        checkBankBalance();
    } else {
        alert("Insufficient funds!")
    }
};

checkBankBalance();
laptopsElement.addEventListener("change", handleLaptopSelectionChange);
loanElement.addEventListener("click", handleLoan);
workElement.addEventListener("click", handleWork);
bankElement.addEventListener("click", handleBank);
buyElement.addEventListener("click", handleBuy);