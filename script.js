// GET SAVED DATA
let budget = Number(localStorage.getItem("budget")) || 0;

let transactions = [];

try {
  transactions = JSON.parse(
    localStorage.getItem("transactions") || "[]"
  );

  if (!Array.isArray(transactions)) {
    transactions = [];
  }
} catch {
  transactions = [];
}

// SAVE DATA
function saveData() {
  localStorage.setItem("budget", budget);
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// FORMAT MONEY
function formatMoney(amount) {
  return Number(amount).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}

// NAVIGATION
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    const pageName = button.dataset.page;

    pages.forEach(page => {
      page.classList.remove("active");
    });

    navButtons.forEach(nav => {
      nav.classList.remove("active");
    });

    document.getElementById(pageName).classList.add("active");
    button.classList.add("active");
  });
});

// CALCULATE TOTALS AND UPDATE OVERVIEW
function updateOverview() {
  const income = transactions
    .filter(item => item.type === "Income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === "Expense")
    .reduce((total, item) => total + item.amount, 0);

  const remaining = budget + income - expenses;

  document.getElementById("totalBudget").textContent =
    formatMoney(budget);

  document.getElementById("totalIncome").textContent =
    formatMoney(income);

  document.getElementById("totalExpenses").textContent =
    formatMoney(expenses);

  document.getElementById("remainingBalance").textContent =
    formatMoney(remaining);

  document.getElementById("currentBudget").textContent =
    formatMoney(budget);
}

// SET BUDGET
document.getElementById("budgetForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const input = document.getElementById("budgetInput");
  const message = document.getElementById("budgetMessage");
  const newBudget = Number(input.value);

  if (input.value.trim() === "" || !Number.isFinite(newBudget) || newBudget < 0) {
    message.textContent = "Please enter a valid budget.";
    return;
  }

  budget = newBudget;

  saveData();
  updateOverview();

  message.style.color = "#35804b";
  message.textContent = "Budget saved successfully!";

  input.value = "";
});

// ADD TRANSACTION
document.getElementById("transactionForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const message = document.getElementById("transactionMessage");

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (!description || amountInput.value.trim() === "" ||
      !Number.isFinite(amount) || amount <= 0) {
    message.style.color = "#a13e32";
    message.textContent = "Please enter a valid description and amount.";
    return;
  }

  const income = transactions
    .filter(item => item.type === "Income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === "Expense")
    .reduce((total, item) => total + item.amount, 0);

  const currentBalance = budget + income - expenses;

  if (type === "Expense" && amount > currentBalance) {
    message.style.color = "#a13e32";
    message.textContent = "Not enough remaining balance!";
    return;
  }

  const transaction = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    description: description,
    amount: amount,
    type: type,
    date: new Date().toLocaleDateString("en-PH")
  };

  transactions.push(transaction);

  saveData();
  updateOverview();
  displayHistory();

  this.reset();

  message.style.color = "#35804b";
  message.textContent = "Transaction added successfully!";
});

// DISPLAY TRANSACTION HISTORY
function displayHistory() {
  const table = document.getElementById("historyTable");
  const emptyMessage = document.getElementById("emptyMessage");

  table.innerHTML = "";

  emptyMessage.style.display =
    transactions.length === 0 ? "block" : "none";

  transactions.slice().reverse().forEach(item => {
    const row = document.createElement("tr");

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;

    const typeCell = document.createElement("td");
    typeCell.textContent = item.type;
    typeCell.className =
      item.type === "Income" ? "income-text" : "expense-text";

    const amountCell = document.createElement("td");
    amountCell.textContent = formatMoney(item.amount);

    const dateCell = document.createElement("td");
    dateCell.textContent = item.date;

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
      deleteTransaction(item.id);
    });

    actionCell.appendChild(deleteButton);

    row.append(
      descriptionCell,
      typeCell,
      amountCell,
      dateCell,
      actionCell
    );

    table.appendChild(row);
  });
}

// DELETE ONE TRANSACTION
function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);

  saveData();
  updateOverview();
  displayHistory();
}

// CLEAR TRANSACTION HISTORY
document.getElementById("clearHistory").addEventListener("click", function() {
  if (transactions.length === 0) {
    alert("Your transaction history is already empty.");
    return;
  }

  const confirmClear = confirm(
    "Are you sure you want to clear all transaction history?"
  );

  if (confirmClear) {
    transactions = [];

    saveData();
    updateOverview();
    displayHistory();
  }
});

// INITIAL DISPLAY
updateOverview();
displayHistory();

