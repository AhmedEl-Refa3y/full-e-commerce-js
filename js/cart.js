document.addEventListener("DOMContentLoaded", function () {
  // Loader
  const loader = document.querySelector(".loader");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 1500);

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // User dropdown
  const userIcon = document.querySelector(".user-icon");
  if (userIcon) {
    userIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelector(".auth-dropdown").classList.toggle("show");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    const dropdown = document.querySelector(".auth-dropdown");
    if (dropdown) dropdown.classList.remove("show");
  });

  // Load cart items
  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-container");

    if (!cartContainer) return;

    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>سلة التسوق فارغة</h3>
          <p>لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
          <a href="index.html#products" class="continue-shopping">تسوق الآن</a>
        </div>
      `;
      return;
    }

    let subtotal = 0;
    let html = `
      <div class="cart-items">
        <h3>المنتجات (${cart.length})</h3>
    `;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      html += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="cart-item-price">${item.price.toFixed(2)} ر.س</div>
            <div class="cart-item-actions">
              <div class="quantity-control">
                <button class="quantity-btn decrease" data-id="${
                  item.id
                }">-</button>
                <input type="number" class="quantity-input" value="${
                  item.quantity
                }" min="1" data-id="${item.id}">
                <button class="quantity-btn increase" data-id="${
                  item.id
                }">+</button>
              </div>
              <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="cart-item-total">
            ${itemTotal.toFixed(2)} ر.س
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Add summary
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    html += `
      <div class="cart-summary">
        <h3 class="summary-title">ملخص الطلب</h3>
        <div class="summary-row">
          <span>المجموع الفرعي</span>
          <span>${subtotal.toFixed(2)} ر.س</span>
        </div>
        <div class="summary-row">
          <span>تكلفة الشحن</span>
          <span>${shipping.toFixed(2)} ر.س</span>
        </div>
        <div class="summary-row summary-total">
          <span>المجموع الكلي</span>
          <span>${total.toFixed(2)} ر.س</span>
        </div>
        <button class="checkout-btn">إتمام الشراء</button>
      </div>
    `;

    cartContainer.innerHTML = html;

    // Add event listeners
    document.querySelectorAll(".decrease").forEach((btn) => {
      btn.addEventListener("click", decreaseQuantity);
    });

    document.querySelectorAll(".increase").forEach((btn) => {
      btn.addEventListener("click", increaseQuantity);
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", updateQuantity);
    });

    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", removeItem);
    });

    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", checkout);
    }

    updateCartCount();
  }

  // Quantity controls
  function decreaseQuantity(e) {
    const productId = parseInt(e.currentTarget.getAttribute("data-id"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find((item) => item.id === productId);

    if (item && item.quantity > 1) {
      item.quantity--;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    }
  }

  function increaseQuantity(e) {
    const productId = parseInt(e.currentTarget.getAttribute("data-id"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find((item) => item.id === productId);

    if (item) {
      item.quantity++;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    }
  }

  function updateQuantity(e) {
    const productId = parseInt(e.currentTarget.getAttribute("data-id"));
    const newQuantity = parseInt(e.currentTarget.value);

    if (newQuantity < 1) {
      e.currentTarget.value = 1;
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find((item) => item.id === productId);

    if (item) {
      item.quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    }
  }

  // Remove item
  function removeItem(e) {
    const productId = parseInt(e.currentTarget.getAttribute("data-id"));
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }

  // Checkout
  function checkout() {
    if (!localStorage.getItem("currentUser")) {
      alert("يجب تسجيل الدخول لإتمام عملية الشراء");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("سلة التسوق فارغة");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // إنشاء طلب جديد
    const newOrder = {
      id: Date.now(),
      userId: currentUser.id || currentUser.email, // استخدام البريد إذا لم يكن هناك id
      userName: currentUser.name,
      userEmail: currentUser.email,
      items: [...cart],
      date: new Date().toLocaleString(),
      status: "قيد المعالجة",
      subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shipping:
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 500
          ? 0
          : 25,
      total:
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0) +
        (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) > 500
          ? 0
          : 25),
    };

    // حفظ الطلب في localStorage
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    // تحديث المخزون
    updateStockAfterOrder(cart);

    alert("شكراً لشرائك من متجرنا! سيتم تجهيز طلبك قريباً.");
    localStorage.removeItem("cart");
    loadCart();
    updateCartCount();

    window.location.href = "index.html";
  }

  // Update stock after order
  function updateStockAfterOrder(cartItems) {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    cartItems.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      if (product) {
        product.stock -= cartItem.quantity;
        if (product.stock < 0) product.stock = 0;
      }
    });

    localStorage.setItem("products", JSON.stringify(products));
  }

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll(".cart-count");

    cartCountElements.forEach((el) => {
      el.textContent = totalItems;
    });
  }

  // Initialize
  loadCart();
});
