const bankElement = document.getElementById("bankButton");
const workElement = document.getElementById("workButton");
const loanButtonElement = document.getElementById("loanButtonContainer");
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
const debtButtonElement = document.getElementById("debtButtonContainer");

let bankBalance = 0.00;
let payBalance = 0.00;
let loanBalance = 0.00;
let laptops = [];

// Fetch computer data
fetch("https://noroff-komputer-store-api.herokuapp.com/computers")
    .then(response => response.json())
    .then(data => laptops = data)
    .then(laptops => addLaptopsToSelection(laptops));

// Add laptops to selection and choose the first item
const addLaptopsToSelection = (laptops) => {
    laptops.forEach(laptop => addLaptopToSelection(laptop));
    updateSelection(laptops[0]);
};

// Populate the laptops section with laptop data
const addLaptopToSelection = (laptop) => {
    const laptopElement = document.createElement("option");
    laptopElement.value = laptop.id;
    laptopElement.appendChild(document.createTextNode(laptop.title));
    laptopsElement.appendChild(laptopElement);
};

// Handle the laptop change
const handleLaptopSelectionChange = e => {
    const selectedLaptop = laptops[e.target.selectedIndex];
    infoImageElement.removeChild(infoImageElement.lastChild);
    specsElement.removeChild(specsElement.lastChild);
    updateSelection(selectedLaptop);
};

// Handle loaning and paying debt
const handleLoan = () => {
    // Loan
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
    // Pay debt
    else {
        if (payBalance <= loanBalance) {
            loanBalance -= payBalance;
            payBalance = 0;
        } else {
            payBalance -= loanBalance;
            bankBalance += payBalance;
            payBalance = 0;
            loanBalance = 0;
        }
        checkBankBalance();
    }
};

// The work button
const handleWork = () => {
    payBalance += 100;
    checkBankBalance();
};

// Banking button
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

// Updates bank and pay balance whenever button is clicked
const checkBankBalance = () => {
    paySumElement.innerText = "Pay " + payBalance + " kr";
    bankBalanceElement.innerText = "Balance " + bankBalance + " kr";
    // Remove loan and debt buttons before new one is created
    if (debtButtonElement.lastChild != null) {
        debtButtonElement.removeChild(debtButtonElement.lastChild);
    }
    if (loanButtonElement.lastChild != null) {
        loanButtonElement.removeChild(loanButtonElement.lastChild);
    }
    // Which button is created whether loan has already been taken
    if (loanBalance === 0) {
        if (loanButtonElement.lastChild == null) {
            const loanButton = document.createElement("button");
            loanButton.setAttribute("class", "loanButton");
            loanButton.innerText = "Get a loan";
            loanButtonElement.appendChild(loanButton);
            debtElement.innerText = "";
        }
    } else {
        const debtButton = document.createElement("button");
        debtButton.setAttribute("class", "debtButton");
        debtButton.innerText = "Pay debt";
        debtButtonElement.appendChild(debtButton);
        debtElement.innerText = "Outstanding loan " + loanBalance + " kr";
    }
};

// Updates when new laptop is selected
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
    // Check if image is found on the right url
    checkIfImageExists(laptop, (exists) => {
        if (exists == 200) {
            const laptopImage = document.createElement("img");
            laptopImage.setAttribute("class", "infoImageFile");
            laptopImage.setAttribute("src", "https://noroff-komputer-store-api.herokuapp.com/" + laptop.image);
            infoImageElement.appendChild(laptopImage);
        } else {
            // Corrects the image path
            const laptopImage = document.createElement("img");
            laptopImage.setAttribute("class", "infoImageFile");
            const specialPath = laptop.image.split(".")
            laptopImage.setAttribute("src", "https://noroff-komputer-store-api.herokuapp.com/" + specialPath[0] + ".png");
            infoImageElement.appendChild(laptopImage);
        }
    });
};


// Image correction check
const checkIfImageExists = (laptop, exists) => {
    fetch("https://noroff-komputer-store-api.herokuapp.com/" + laptop.image)
        .then((response) => response.status)
        .then(status => exists(status))
};

// handles the laptop buying
const handleBuy = () => {
    if (bankBalance >= buyElement.value) {
        alert("Congratulations you have just bough a new Komputer!");
        bankBalance -= buyElement.value;
        checkBankBalance();
    } else {
        alert("Insufficient funds!");
    }
};


// Creates all balances on page start up
checkBankBalance();

// Event listeners
laptopsElement.addEventListener("change", handleLaptopSelectionChange);
loanButtonElement.addEventListener("click", handleLoan);
debtButtonElement.addEventListener("click", handleLoan);
workElement.addEventListener("click", handleWork);
bankElement.addEventListener("click", handleBank);
buyElement.addEventListener("click", handleBuy);