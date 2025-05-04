document.addEventListener("DOMContentLoaded", function () {
  // إعدادات المسؤول الافتراضية
  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "admin123";

  // إنشاء مستخدم مسؤول إذا لم يكن موجوداً
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.some((user) => user.email === ADMIN_EMAIL)) {
    users.push({
      name: "المسؤول",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
    });
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Loader
  const loader = document.querySelector(".loader");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 1500);

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

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
  userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelector(".auth-dropdown").classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    document.querySelector(".auth-dropdown").classList.remove("show");
  });

  // Auth modals
  const loginModal = document.getElementById("login-modal");
  const signupModal = document.getElementById("signup-modal");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const switchToSignup = document.getElementById("switch-to-signup");
  const switchToLogin = document.getElementById("switch-to-login");
  const closeModals = document.querySelectorAll(".close-modal");

  function openModal(modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Login button event
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(loginModal);
    });
  }

  // Signup button event
  if (signupBtn) {
    signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(signupModal);
    });
  }

  // Switch between modals
  if (switchToSignup) {
    switchToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(signupModal);
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(signupModal);
      openModal(loginModal);
    });
  }

  // Close modals
  closeModals.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(loginModal);
      closeModal(signupModal);
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      closeModal(loginModal);
    }
    if (e.target === signupModal) {
      closeModal(signupModal);
    }
  });

  // Login form submission
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin || false,
        })
      );

      updateUserStatus();
      showNotification("تم تسجيل الدخول بنجاح!");
      closeModal(loginModal);
      setTimeout(() => {
        updateUserDropdown();
        location.reload();
      }, 1000);
    } else {
      showNotification("البريد الإلكتروني أو كلمة المرور غير صحيحة", "error");
    }
  });

  // Signup form submission
  document.getElementById("signup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm").value;

    if (password !== confirmPassword) {
      showNotification("كلمة المرور وتأكيدها غير متطابقين!", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((u) => u.email === email)) {
      showNotification("هذا البريد الإلكتروني مسجل بالفعل!", "error");
      return;
    }

    const newUser = { name, email, password, isAdmin: false, addresses: [] };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        email: newUser.email,
        name: newUser.name,
        isAdmin: false,
      })
    );

    updateUserStatus();
    showNotification("تم إنشاء الحساب بنجاح!");
    closeModal(signupModal);
    setTimeout(() => {
      updateUserDropdown();
      window.location.href = "index.html";
    }, 1000);
  });

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    updateUserStatus();
    showNotification("تم تسجيل الخروج بنجاح");
    setTimeout(() => location.reload(), 1000);
  });

  // Update user status in UI
  function updateUserStatus() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userDropdown = document.querySelector(".auth-dropdown");

    if (currentUser) {
      if (userDropdown) {
        let dropdownContent = `
          <a href="profile.html">حسابي</a>
          <a href="#" id="logout-btn">تسجيل الخروج</a>
        `;

        if (currentUser.isAdmin) {
          dropdownContent += `<a href="admin.html">لوحة التحكم</a>`;
        }

        userDropdown.innerHTML = dropdownContent;

        document
          .getElementById("logout-btn")
          ?.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            updateUserStatus();
            showNotification("تم تسجيل الخروج بنجاح");
            setTimeout(() => location.reload(), 1000);
          });
      }

      if (loginBtn) loginBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";
    } else {
      if (userDropdown) {
        userDropdown.innerHTML = `
          <a href="#" id="login-btn">تسجيل الدخول</a>
          <a href="#" id="signup-btn">إنشاء حساب</a>
        `;

        document.getElementById("login-btn")?.addEventListener("click", (e) => {
          e.preventDefault();
          openModal(loginModal);
        });

        document
          .getElementById("signup-btn")
          ?.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(signupModal);
          });
      }

      if (loginBtn) loginBtn.style.display = "block";
      if (signupBtn) signupBtn.style.display = "block";
    }
  }

  // Product modal
  const productModal = document.getElementById("product-modal");
  const addProductBtn = document.getElementById("add-product-btn");
  const manageProductsBtn = document.getElementById("manage-products-btn");
  const cancelProductBtn = document.getElementById("cancel-product");
  const productForm = document.getElementById("product-form");
  const productImageInput = document.getElementById("product-image");
  const imagePreview = document.getElementById("image-preview");
  const productsContainer = document.getElementById("products-container");

  let products = [];
  let editingProductId = null;

  // Load products from localStorage
  function loadProducts() {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      products = JSON.parse(savedProducts);
      renderProducts();
    } else {
      products = [
        {
          id: 1,
          name: "عطر سياستش",
          category: "المطور",
          price: 320,
          stock: 10,
          description: "عطر فاخر برائحة مميزة تدوم طويلاً",
          image:
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          id: 2,
          name: "عطر برمزات بشرتون",
          category: "المطور",
          price: 390,
          stock: 5,
          description: "عطر برائحة شرقية فاخرة",
          image:
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
        {
          id: 3,
          name: "عطر فروز ثابت",
          category: "المطور",
          price: 370,
          stock: 8,
          description: "عطر برائحة الفواكه الطازجة",
          image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f",
        },
        {
          id: 4,
          name: "باقة هدايا فاخرة",
          category: "الهدايا",
          price: 450,
          stock: 15,
          description: "باقة هدايا تحتوي على مجموعة من العطور الفاخرة",
          image:
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        },
      ];
      saveProducts();
      renderProducts();
    }
  }

  // Save products to localStorage
  function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Render products to the page
  function renderProducts(filterCategory = "all") {
    if (!productsContainer) return;

    const filteredProducts =
      filterCategory === "all"
        ? products
        : products.filter((product) => product.category === filterCategory);

    productsContainer.innerHTML = "";

    filteredProducts.forEach((product) => {
      const isLoggedIn = localStorage.getItem("currentUser") !== null;
      const currentUser = isLoggedIn
        ? JSON.parse(localStorage.getItem("currentUser"))
        : null;
      const isAdminUser = currentUser?.isAdmin || false;

      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        ${
          product.stock < 5
            ? '<span class="product-badge">كمية محدودة</span>'
            : ""
        }
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-price">${product.price.toFixed(2)} ر.س</div>
          <div class="product-stock ${
            product.stock > 0 ? "in-stock" : "out-of-stock"
          }">
            ${product.stock > 0 ? `متوفر (${product.stock})` : "غير متوفر"}
          </div>
          <button class="add-to-cart" data-id="${product.id}" ${
        product.stock < 1 ? "disabled" : ""
      }>
            <i class="fas fa-shopping-cart"></i> 
            ${isLoggedIn ? "أضف إلى السلة" : "سجل الدخول للشراء"}
          </button>
        </div>
        ${
          isAdminUser
            ? `
        <div class="product-actions">
          <div class="edit-product" data-id="${product.id}">
            <i class="fas fa-edit"></i>
          </div>
          <div class="delete-product" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </div>
        </div>
        `
            : ""
        }
      `;
      productsContainer.appendChild(productCard);
    });

    // Add event listeners
    document.querySelectorAll(".edit-product").forEach((btn) => {
      btn.addEventListener("click", editProduct);
    });

    document.querySelectorAll(".delete-product").forEach((btn) => {
      btn.addEventListener("click", deleteProduct);
    });

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        if (!localStorage.getItem("currentUser")) {
          e.preventDefault();
          openModal(loginModal);
          showNotification("يجب تسجيل الدخول لإضافة منتجات إلى السلة", "error");
          return;
        }

        const productId = parseInt(this.getAttribute("data-id"));
        addToCart(productId);
      });
    });
  }

  // Add new product
  function addNewProduct() {
    editingProductId = null;
    productForm.reset();
    imagePreview.innerHTML = "";
    document.getElementById("product-modal-title").textContent =
      "إضافة منتج جديد";
    openModal(productModal);
  }

  // Edit product
  function editProduct(e) {
    const productId = parseInt(e.currentTarget.getAttribute("data-id"));
    const product = products.find((p) => p.id === productId);

    if (product) {
      editingProductId = productId;
      document.getElementById("product-modal-title").textContent =
        "تعديل المنتج";
      document.getElementById("product-id").value = product.id;
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-category").value = product.category;
      document.getElementById("product-price").value = product.price;
      document.getElementById("product-stock").value = product.stock;
      document.getElementById("product-description").value =
        product.description;

      imagePreview.innerHTML = `<img src="${product.image}" alt="${product.name}">`;

      openModal(productModal);
    }
  }

  // Delete product
  function deleteProduct(e) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const productId = parseInt(e.currentTarget.getAttribute("data-id"));
      products = products.filter((p) => p.id !== productId);
      saveProducts();
      renderProducts();
    }
  }

  // Product form submission
  productForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const productData = {
      id: editingProductId || Date.now(),
      name: document.getElementById("product-name").value,
      category: document.getElementById("product-category").value,
      price: parseFloat(document.getElementById("product-price").value),
      stock: parseInt(document.getElementById("product-stock").value),
      description: document.getElementById("product-description").value,
      image: imagePreview.querySelector("img")
        ? imagePreview.querySelector("img").src
        : "https://via.placeholder.com/300x300?text=No+Image",
    };

    if (editingProductId) {
      const index = products.findIndex((p) => p.id === editingProductId);
      if (index !== -1) {
        products[index] = productData;
      }
    } else {
      products.push(productData);
    }

    saveProducts();
    renderProducts();
    closeModal(productModal);
  });

  // Image preview
  productImageInput?.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Cancel product editing
  cancelProductBtn?.addEventListener("click", () => {
    closeModal(productModal);
  });

  // Add to cart
  function addToCart(productId) {
    const product = products.find((p) => p.id === productId);

    if (product.stock < 1) {
      showNotification("هذا المنتج غير متوفر حالياً!", "error");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification(`تمت إضافة ${product.name} إلى السلة`);
  }

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = totalItems;
    });
  }

  // Show notification
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize
  addProductBtn?.addEventListener("click", addNewProduct);
  manageProductsBtn?.addEventListener("click", () => renderProducts());
  loadProducts();
  updateUserStatus();
  updateCartCount();

  // Filter products by category
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category");
      renderProducts(category);
      document.querySelector("#products").scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Contact form submission
  document.getElementById("contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("شكراً لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.");
    e.target.reset();
  });

  // Newsletter form submission
  document
    .getElementById("newsletter-form")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.querySelector("input").value;
      alert(`شكراً لاشتراكك في النشرة البريدية باستخدام ${email}`);
      e.target.reset();
    });

  // Update user dropdown in navbar
  function updateUserDropdown() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userDropdown = document.querySelector(".auth-dropdown");

    if (currentUser && userDropdown) {
      let dropdownContent = `
      <a href="profile.html">حسابي</a>
      <a href="#" id="logout-btn">تسجيل الخروج</a>
    `;

      if (currentUser.isAdmin) {
        dropdownContent += `<a href="admin.html">لوحة التحكم</a>`;
      }

      userDropdown.innerHTML = dropdownContent;

      document
        .getElementById("logout-btn")
        ?.addEventListener("click", function (e) {
          e.preventDefault();
          localStorage.removeItem("currentUser");
          updateUserStatus();
          showNotification("تم تسجيل الخروج بنجاح");
          setTimeout(() => location.reload(), 1000);
        });
    }
  }
});

// تسجيل الخروج التلقائي بعد 30 دقيقة من عدم النشاط
let inactivityTime = function () {
  let time;
  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onkeypress = resetTimer;

  function logout() {
    if (JSON.parse(localStorage.getItem("currentUser"))) {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    }
  }

  function resetTimer() {
    clearTimeout(time);
    time = setTimeout(logout, 1800000); // 30 دقيقة
  }
};
inactivityTime();
