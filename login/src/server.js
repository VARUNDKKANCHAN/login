<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Product Comparison</title>
<style>
  body {
    display: flex;
    margin: 0;
    font-family: Arial, sans-serif;
  }
  
  .container {
    text-align: center;
    padding: 20px;
  }
  
  input[type="text"] {
    padding: 10px;
    margin: 5px;
    width: 250px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
  }
  
  /* Sidebar styles */
  .sidebar {
    width: 250px;
    height: 100vh;
    background-color: #f8f9fa;
    position: fixed;
    top: 0;
    left: -250px;
    transition: 0.3s;
    overflow-y: auto;
    padding-top: 60px;
    z-index: 1;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .sidebar h3 {
    margin: 0;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    font-size: 20px;
    text-align: center;
  }
  
  .sidebar ul {
    list-style-type: none;
    padding: 0;
  }
  
  .sidebar li {
    padding: 10px;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .sidebar li:last-child {
    border-bottom: none;
  }
  
  .sidebar li:hover {
    background-color: #e9ecef;
  }
  
  .sidebar li::before {
    content: "➤ ";
    color: #007bff;
    font-weight: bold;
    margin-right: 5px;
  }
  
  .sidebar li:hover::before {
    color: #0056b3;
  }
</style>
</head>
<body>
<div class="container">
  <form action="/compare" method="post">
    <input type="text" name="p1" class="inp1" placeholder="Enter Product Name 1">
    <br>
    <input type="text" name="p2" class="inp2" placeholder="Enter Product Name 2">
    <br>
    <input type="submit" class="btn" value="Compare">
  </form>
</div>
<div class="sidebar" id="sidebar">
  <h3>Product List</h3>
  <ul id="productList"></ul>
</div>
<button onclick="toggleSidebar()">Toggle Sidebar</button>

<script>
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
  }

  // Fetch product data from the server and display it in the sidebar
  async function fetchAndDisplayProducts() {
    try {
      const response = await fetch('/products');
      const products = await response.json();
      const productList = document.getElementById('productList');
      productList.innerHTML = ''; // Clear existing product list
      products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.textContent = `${product.p1} vs ${product.p2}`;
        productList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  // Call the function to fetch and display products when the page loads
  window.addEventListener('load', fetchAndDisplayProducts);
</script>
</body>
</html>
