document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expenseForm");
  const expenseTarget = document.getElementById("expenseTarget");
  const amount = document.getElementById("amount");
  const category = document.getElementById("category");
  const transactionList = document.getElementById("transactionList");
  const totalSpent = document.getElementById("totalSpent");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  function saveTransaction(target, value, category) {
    const transaction = { 
      id: Date.now(), 
      target, 
      value: parseFloat(value),
      category,
      date: new Date().toISOString()
    };
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function getCurrentMonthTransactions() {
    const now = new Date();
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === now.getFullYear() && transactionDate.getMonth() === now.getMonth();
    });
  }

  function displayTransactions() {
    if (!transactionList) return;

    transactionList.innerHTML = "";
    let total = 0;
    let categoryTotals = { "récurrente": 0, "courses": 0, "plaisir": 0 };

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const formattedDate = transactionDate.toLocaleDateString("fr-FR");

      if (transactionDate.getFullYear() === new Date().getFullYear() &&
          transactionDate.getMonth() === new Date().getMonth()) {
        total += transaction.value;
        categoryTotals[transaction.category] += transaction.value;
      }

      const li = document.createElement("li");
      li.innerHTML = `${formattedDate} - ${transaction.target} - ${transaction.value} € (${transaction.category}) 
        <button onclick="deleteTransaction(${transaction.id})">X</button>`;
      transactionList.appendChild(li);
    });

    if (totalSpent) {
      totalSpent.textContent = total.toFixed(2);
    }

    updateChart(categoryTotals);
  }

  function updateChart(categoryTotals) {
    const ctx = document.getElementById("categoryChart").getContext("2d");

    // Vérifie si le graphique existe et si c'est bien une instance de Chart.js
    if (window.categoryChart instanceof Chart) {
        window.categoryChart.destroy();
    }

    window.categoryChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Récurrente", "Courses", "Plaisir"],
            datasets: [{
                data: [categoryTotals.récurrente, categoryTotals.courses, categoryTotals.plaisir],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
            }]
        }
    });
}


  window.deleteTransaction = function(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    displayTransactions();
  };

  if (expenseForm) {
    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (expenseTarget.value && amount.value && category.value) {
        saveTransaction(expenseTarget.value, amount.value, category.value);
        expenseTarget.value = "";
        amount.value = "";
      }
    });
  }

  displayTransactions();
});
