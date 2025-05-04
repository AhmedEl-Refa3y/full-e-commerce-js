document.addEventListener("DOMContentLoaded", function () {
  // Loader
  const loader = document.querySelector(".loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1500);
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("active");
      if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Check admin access
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.email !== "admin@example.com") {
    alert("ليس لديك صلاحية الدخول إلى هذه الصفحة");
    window.location.href = "index.html";
    return;
  }

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }

  // Product modal elements
  const productModal = document.getElementById("product-modal");
  const addProductBtn = document.getElementById("add-product-btn");
  const cancelProductBtn = document.getElementById("cancel-product");
  const productForm = document.getElementById("product-form");
  const productImageInput = document.getElementById("product-image");
  const imagePreview = document.getElementById("image-preview");
  let productsTable = document.getElementById("products-table");

  let products = [];
  let editingProductId = null;

  // Load products from localStorage
  function loadProducts() {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    } else {
      // Default products
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
    }
    renderProductsTable();
    showAdminSection("إدارة المنتجات");
    setupOrderDetailsModal();
  }

  // Save products to localStorage
  function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Render products to the table
  function renderProductsTable() {
    if (!productsTable) {
      productsTable = document.getElementById("products-table");
      if (!productsTable) return;
    }

    productsTable.innerHTML = "";

    if (products.length === 0) {
      productsTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">لا توجد منتجات متاحة</td>
            </tr>
        `;
      return;
    }

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td><img src="${product.image}" alt="${
        product.name
      }" width="50" height="50" style="object-fit: cover;"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)} ر.س</td>
            <td>${product.stock}</td>
            <td class="actions-cell">
                <button class="btn-edit" data-id="${product.id}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn-delete" data-id="${product.id}">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </td>
        `;
      productsTable.appendChild(row);
    });

    // إعادة ربط الأحداث
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", editProduct);
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", deleteProduct);
    });
  }

  // Add new product
  function addNewProduct() {
    editingProductId = null;
    productForm.reset();
    if (imagePreview) imagePreview.innerHTML = "";
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

      if (imagePreview) {
        imagePreview.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
      }

      openModal(productModal);
    }
  }

  // Delete product
  function deleteProduct(e) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const productId = parseInt(e.currentTarget.getAttribute("data-id"));
      products = products.filter((p) => p.id !== productId);
      saveProducts();
      renderProductsTable();
    }
  }

  // Product form submission
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productData = {
      id: editingProductId || Date.now(),
      name: document.getElementById("product-name").value,
      category: document.getElementById("product-category").value,
      price: parseFloat(document.getElementById("product-price").value),
      stock: parseInt(document.getElementById("product-stock").value),
      description: document.getElementById("product-description").value,
      image: imagePreview?.querySelector("img")
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
    renderProductsTable();
    closeModal(productModal);
  });

  // Image preview
  productImageInput.addEventListener("change", function () {
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
  if (cancelProductBtn && productModal) {
    cancelProductBtn.addEventListener("click", () => {
      closeModal(productModal);
    });
  }

  // Modal functions
  function openModal(modal) {
    if (!modal) return;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === productModal) {
      closeModal(productModal);
    }
  });

  // إضافة قائمة إدارة العملاء والطلبات
  document.querySelectorAll(".admin-menu a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".admin-menu a")
        .forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      const section = this.textContent.trim();
      showAdminSection(section);
    });
  });

  // عرض القسم المحدد
  function showAdminSection(section) {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    switch (section) {
      case "إدارة العملاء":
        renderCustomersSection();
        break;
      case "الطلبات":
        renderOrdersSection();
        break;
      case "الإحصائيات":
        renderStatsSection();
        break;
      case "الإعدادات":
        renderSettingsSection();
        break;
      default:
        renderProductsSection();
    }
  }

  // عرض قسم العملاء
  function renderCustomersSection() {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    adminContent.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">إدارة العملاء</h2>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>البريد الإلكتروني</th>
            <th>تاريخ التسجيل</th>
            <th>عدد الطلبات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="customers-table">
          ${users
            .map(
              (user, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${new Date(
                user.registerDate || new Date()
              ).toLocaleDateString()}</td>
              <td>${getUserOrdersCount(user.email)}</td>
              <td>
                <button class="btn-view" data-id="${user.email}">عرض</button>
                <button class="btn-delete" data-id="${user.email}">حذف</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    // Add event listeners
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", viewCustomerDetails);
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", deleteCustomer);
    });
  }

  // عرض قسم الطلبات
  function renderOrdersSection() {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    adminContent.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">الطلبات</h2>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>تاريخ الطلب</th>
            <th>المجموع</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="orders-table">
          ${orders
            .map(
              (order) => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.userName} (${order.userEmail})</td>
              <td>${order.date}</td>
              <td>${order.total.toFixed(2)} ر.س</td>
              <td>
                <select class="order-status" data-id="${order.id}">
                  <option value="قيد المعالجة" ${
                    order.status === "قيد المعالجة" ? "selected" : ""
                  }>قيد المعالجة</option>
                  <option value="تم الشحن" ${
                    order.status === "تم الشحن" ? "selected" : ""
                  }>تم الشحن</option>
                  <option value="مكتمل" ${
                    order.status === "مكتمل" ? "selected" : ""
                  }>مكتمل</option>
                  <option value="ملغي" ${
                    order.status === "ملغي" ? "selected" : ""
                  }>ملغي</option>
                </select>
              </td>
              <td>
                <button class="btn-view" data-id="${order.id}">تفاصيل</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    // إضافة مستمعين لأزرار تغيير حالة الطلب
    document.querySelectorAll(".order-status").forEach((select) => {
      select.addEventListener("change", function () {
        const orderId = parseInt(this.getAttribute("data-id"));
        const newStatus = this.value;

        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        const orderIndex = orders.findIndex((o) => o.id === orderId);

        if (orderIndex !== -1) {
          orders[orderIndex].status = newStatus;
          localStorage.setItem("orders", JSON.stringify(orders));
          showNotification("تم تحديث حالة الطلب بنجاح");
        }
      });
    });

    // Add event listeners for order details
    document.querySelectorAll(".btn-view").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = parseInt(this.getAttribute("data-id"));
        showOrderDetails(orderId);
      });
    });
  }

  // عرض قسم الإحصائيات
  function renderStatsSection() {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // حساب الإحصائيات
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = users.filter((u) => !u.isAdmin).length;

    adminContent.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">الإحصائيات</h2>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <div class="stat-info">
            <h3>${totalOrders}</h3>
            <p>إجمالي الطلبات</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-info">
            <h3>${totalSales.toFixed(2)} ر.س</h3>
            <p>إجمالي المبيعات</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-box-open"></i>
          </div>
          <div class="stat-info">
            <h3>${totalProducts}</h3>
            <p>إجمالي المنتجات</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>${totalCustomers}</h3>
            <p>إجمالي العملاء</p>
          </div>
        </div>
      </div>
      
      <div class="recent-orders">
        <h3>أحدث الطلبات</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>العميل</th>
              <th>التاريخ</th>
              <th>المجموع</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .slice(0, 5)
              .map(
                (order) => `
              <tr>
                <td>#${order.id}</td>
                <td>${order.userName}</td>
                <td>${order.date}</td>
                <td>${order.total.toFixed(2)} ر.س</td>
                <td><span class="status-badge ${order.status.replace(
                  /\s+/g,
                  "-"
                )}">${order.status}</span></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  // عرض قسم الإعدادات
  function renderSettingsSection() {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    adminContent.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">الإعدادات</h2>
      </div>
      
      <div class="settings-form">
        <form id="admin-settings">
          <div class="form-group">
            <label for="store-name">اسم المتجر</label>
            <input type="text" id="store-name" value="المطور" required>
          </div>
          
          <div class="form-group">
            <label for="shipping-fee">رسوم الشحن (ر.س)</label>
            <input type="number" id="shipping-fee" value="25" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="free-shipping">الحد الأدنى للشحن المجاني (ر.س)</label>
            <input type="number" id="free-shipping" value="500" min="0" required>
          </div>
          
          <div class="form-group">
            <label for="admin-email">بريد المسؤول</label>
            <input type="email" id="admin-email" value="admin@example.com" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-save">حفظ الإعدادات</button>
          </div>
        </form>
      </div>
    `;

    // Handle settings form submission
    const settingsForm = document.getElementById("admin-settings");
    if (settingsForm) {
      settingsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        showNotification("تم حفظ الإعدادات بنجاح");
      });
    }
  }

  // عرض قسم المنتجات
  function renderProductsSection() {
    const adminContent = document.querySelector(".admin-content");
    if (!adminContent) return;

    adminContent.innerHTML = `
      <div class="admin-header">
        <h2 class="admin-title">إدارة المنتجات</h2>
        <button class="btn-add" id="add-product-btn">
          إضافة منتج جديد
        </button>
      </div>

      <table class="admin-table">
        <thead>
          <tr>
            <th>الصورة</th>
            <th>اسم المنتج</th>
            <th>القسم</th>
            <th>السعر</th>
            <th>الكمية</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="products-table">
          <!-- سيتم ملؤها بالمنتجات عبر JavaScript -->
        </tbody>
      </table>
    `;

    // Reinitialize products table
    const newProductsTable = document.getElementById("products-table");
    if (newProductsTable) {
      productsTable = newProductsTable;
      renderProductsTable();
    }

    // Reinitialize add product button
    const newAddProductBtn = document.getElementById("add-product-btn");
    if (newAddProductBtn) {
      newAddProductBtn.addEventListener("click", addNewProduct);
    }
  }

  // دالة مساعدة للحصول على عدد طلبات العميل
  function getUserOrdersCount(userEmail) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    return orders.filter((order) => order.userEmail === userEmail).length;
  }

  // عرض تفاصيل العميل
  function viewCustomerDetails(e) {
    const userEmail = e.currentTarget.getAttribute("data-id");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === userEmail);

    if (!user) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const customerOrders = orders.filter(
      (order) => order.userEmail === userEmail
    );

    // يمكنك إنشاء نموذج لعرض تفاصيل العميل هنا
    alert(
      `تفاصيل العميل: ${user.name}\nالبريد: ${user.email}\nعدد الطلبات: ${customerOrders.length}`
    );
  }

  // حذف العميل
  function deleteCustomer(e) {
    if (
      confirm("هل أنت متأكد من حذف هذا العميل؟ سيتم أيضاً حذف جميع طلباته.")
    ) {
      const userEmail = e.currentTarget.getAttribute("data-id");

      // حذف العميل من قاعدة البيانات
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users = users.filter((u) => u.email !== userEmail);
      localStorage.setItem("users", JSON.stringify(users));

      // حذف طلبات العميل
      let orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders = orders.filter((order) => order.userEmail !== userEmail);
      localStorage.setItem("orders", JSON.stringify(orders));

      showNotification("تم حذف العميل وطلباته بنجاح");
      renderCustomersSection();
    }
  }

  // إعداد نموذج تفاصيل الطلب
  function setupOrderDetailsModal() {
    const modal = document.getElementById("order-details-modal");
    const closeBtn = modal?.querySelector(".close-modal");
    const closeBtn2 = modal?.querySelector(".btn-close");

    // إغلاق النموذج
    if (closeBtn) {
      closeBtn.addEventListener("click", () => (modal.style.display = "none"));
    }
    if (closeBtn2) {
      closeBtn2.addEventListener("click", () => (modal.style.display = "none"));
    }
  }

  // عرض تفاصيل الطلب
  function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const order = orders.find((o) => o.id === orderId);

    if (!order) return;

    const modal = document.getElementById("order-details-modal");
    if (!modal) return;

    // تعبئة بيانات الطلب
    document.getElementById("order-id").textContent = order.id;
    document.getElementById("customer-name").textContent = order.userName;
    document.getElementById("customer-email").textContent = order.userEmail;
    document.getElementById("order-date").textContent = order.date;
    document.getElementById("order-status").textContent = order.status;
    document.getElementById("order-total").textContent = order.total.toFixed(2);

    // تعبئة قائمة المنتجات
    const itemsList = document.getElementById("order-items-list");
    if (itemsList) {
      itemsList.innerHTML = order.items
        .map(
          (item) => `
        <tr>
          <td><img src="${item.image}" alt="${item.name}" width="50"></td>
          <td>${item.name}</td>
          <td>${item.price.toFixed(2)} ر.س</td>
          <td>${item.quantity}</td>
          <td>${(item.price * item.quantity).toFixed(2)} ر.س</td>
        </tr>
      `
        )
        .join("");
    }

    // عرض النموذج
    modal.style.display = "flex";
  }

  // عرض إشعار
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
  if (addProductBtn) {
    addProductBtn.addEventListener("click", addNewProduct);
  }
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", () => closeModal(productModal));
  }
  loadProducts();
});
