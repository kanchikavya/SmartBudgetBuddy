// 🌐 Element References
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const totalBox = document.getElementById("total");
const filterCategory = document.getElementById("filter-category");
const themeToggleBtn = document.getElementById("theme-toggle");

let expenses = [];
let chart;

// Apply saved theme or system preference on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    document.documentElement.classList.remove("dark");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }

  //  Load saved expenses
  const storedExpenses = localStorage.getItem("myExpenses");
  if (storedExpenses) {
    expenses = JSON.parse(storedExpenses);
  }

  renderExpenses(filterCategory.value);
  updateTotal();
  updateChart();
});

//  Toggle Theme
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

//  Add Expense
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const date = dateInput.value.trim();
  const category = categoryInput.value.trim();

  if (!title || isNaN(amount) || !date || !category) {
    alert("Please fill all fields!");
    return;
  }

  const expense = {
    id: Date.now(),
    title,
    amount,
    date,
    category
  };

  expenses.push(expense);
  saveExpenses();
  renderExpenses(filterCategory.value);
  updateTotal();
  updateChart();
  form.reset();
});

// Render Expense List
function renderExpenses(filter = "all") {
  expenseList.innerHTML = "";

  const filtered = filter === "all" ? expenses : expenses.filter(exp => exp.category === filter);

  filtered.forEach(exp => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded animate-fade-in";
    li.innerHTML = `${exp.title} - ₹${exp.amount} - ${exp.category} - ${exp.date}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "text-red-500 hover:text-red-700 ml-2 font-bold";
    delBtn.addEventListener("click", () => {
      deleteExpense(exp.id);
    });

    li.appendChild(delBtn);
    expenseList.appendChild(li);
  });
}

// Update Total
function updateTotal() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  totalBox.textContent = `Total: ₹${total}`;
}

// Update Chart
function updateChart() {
  const categories = ["food", "transport", "shopping", "bills"];
  const data = categories.map(cat =>
    expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
  );

  const ctx = document.getElementById("expense-chart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{
        label: "Spending",
        data: data,
        backgroundColor: ["#F87171", "#60A5FA", "#34D399", "#FBBF24"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "right" }
      }
    }
  });
}

//  Delete Expense
function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveExpenses();
  renderExpenses(filterCategory.value);
  updateTotal();
  updateChart();
}

//  Save Expenses
function saveExpenses() {
  localStorage.setItem("myExpenses", JSON.stringify(expenses));
}

//  Filter by Category
filterCategory.addEventListener("change", () => {
  renderExpenses(filterCategory.value);
});
