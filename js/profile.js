document.addEventListener("DOMContentLoaded", function () {
  // Loader
  const loader = document.querySelector(".loader");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 1500);

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  menuToggle?.addEventListener("click", () => {
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

  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Load user data
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userData = users.find((user) => user.email === currentUser.email) || {};

  // Load user orders
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const userOrders = orders.filter(
    (order) => order.userEmail === currentUser.email
  );

  // Load user addresses
  const userAddresses = userData.addresses || [];
  const defaultAddress = userAddresses.find((addr) => addr.isDefault) || {};

  // Display user info
  document.getElementById("user-name").textContent = currentUser.name;
  document.getElementById("full-name").value = currentUser.name;
  document.getElementById("email").value = currentUser.email;
  document.getElementById("phone").value = userData.phone || "";

  // Profile menu navigation
  const menuItems = document.querySelectorAll(".profile-menu li");
  const profileSections = document.querySelectorAll(".profile-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      menuItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Hide all sections
      profileSections.forEach((section) => section.classList.remove("active"));

      // Show the selected section
      const sectionId = this.getAttribute("data-section");
      document.getElementById(sectionId).classList.add("active");
    });
  });

  // Update profile form
  document
    .getElementById("profile-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const fullName = document.getElementById("full-name").value;
      const phone = document.getElementById("phone").value;

      // Update current user in localStorage
      const updatedCurrentUser = {
        ...currentUser,
        name: fullName,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

      // Update user in users array
      const updatedUsers = users.map((user) => {
        if (user.email === currentUser.email) {
          return {
            ...user,
            name: fullName,
            phone: phone,
          };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Update welcome message
      document.getElementById("user-name").textContent = fullName;

      showNotification("تم تحديث معلوماتك بنجاح");
    });

  // Change password form
  document
    .getElementById("password-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById("current-password").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validate current password
      if (currentPassword !== userData.password) {
        showNotification("كلمة المرور الحالية غير صحيحة", "error");
        return;
      }

      // Validate new password
      if (newPassword !== confirmPassword) {
        showNotification("كلمة المرور الجديدة وتأكيدها غير متطابقين", "error");
        return;
      }

      // Update password
      const updatedUsers = users.map((user) => {
        if (user.email === currentUser.email) {
          return {
            ...user,
            password: newPassword,
          };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Reset form
      this.reset();

      showNotification("تم تغيير كلمة المرور بنجاح");
    });

  // Render orders
  function renderOrders() {
    const ordersList = document.getElementById("orders-list");
    if (!ordersList) return;

    if (userOrders.length === 0) {
      ordersList.innerHTML = `
          <div class="no-orders">
            <i class="fas fa-shopping-bag"></i>
            <p>لا يوجد لديك أي طلبات سابقة</p>
            <a href="index.html#products" class="btn-save">تصفح المنتجات</a>
          </div>
        `;
      return;
    }

    ordersList.innerHTML = userOrders
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(
        (order) => `
          <div class="order-card">
            <div class="order-card-header">
              <div>
                <span class="order-id">طلب #${order.id}</span>
                <span class="order-date">${order.date}</span>
              </div>
              <span class="order-status ${order.status.replace(/\s+/g, "-")}">
                ${order.status}
              </span>
            </div>
            
            <div class="order-summary">
              <div class="order-summary-item">
                <span>عدد المنتجات:</span>
                <span class="order-items-count">${order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}</span>
              </div>
              <div class="order-summary-item">
                <span>طريقة الدفع:</span>
                <span>الدفع عند الاستلام</span>
              </div>
              <div class="order-summary-item">
                <span>طريقة الشحن:</span>
                <span>توصيل سريع</span>
              </div>
              <div class="order-summary-item">
                <span>المجموع:</span>
                <span class="order-total">${order.total.toFixed(2)} ر.س</span>
              </div>
            </div>
            
            <div class="order-actions">
              <button class="view-order-btn" data-id="${order.id}">
                عرض تفاصيل الطلب
              </button>
            </div>
          </div>
        `
      )
      .join("");

    // Add event listeners to view order buttons
    document.querySelectorAll(".view-order-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = parseInt(this.getAttribute("data-id"));
        viewOrderDetails(orderId);
      });
    });
  }

  // View order details
  function viewOrderDetails(orderId) {
    const order = userOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Create modal HTML
    const modalHTML = `
        <div class="order-details-modal" id="order-details-modal">
          <div class="order-content">
            <span class="close-modal">&times;</span>
            <h2>تفاصيل الطلب #${order.id}</h2>
            
            <div class="order-info">
              <div class="order-customer">
                <h3>معلومات العميل</h3>
                <p><strong>الاسم:</strong> ${order.userName}</p>
                <p><strong>البريد الإلكتروني:</strong> ${order.userEmail}</p>
                ${
                  defaultAddress.phone
                    ? `<p><strong>الهاتف:</strong> ${defaultAddress.phone}</p>`
                    : ""
                }
              </div>
              
              <div class="order-summary">
                <h3>ملخص الطلب</h3>
                <p><strong>تاريخ الطلب:</strong> ${order.date}</p>
                <p><strong>حالة الطلب:</strong> <span class="order-status ${order.status.replace(
                  /\s+/g,
                  "-"
                )}">${order.status}</span></p>
                <p><strong>طريقة الدفع:</strong> الدفع عند الاستلام</p>
                <p><strong>طريقة الشحن:</strong> توصيل سريع</p>
                <p><strong>عنوان التوصيل:</strong> ${
                  defaultAddress
                    ? formatAddress(defaultAddress)
                    : "لم يتم تحديد عنوان"
                }</p>
              </div>
            </div>
            
            <div class="order-items">
              <h3>المنتجات (${order.items.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>المنتج</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items
                    .map(
                      (item) => `
                    <tr>
                      <td><img src="${item.image}" alt="${
                        item.name
                      }" width="50"></td>
                      <td>${item.name}</td>
                      <td>${item.price.toFixed(2)} ر.س</td>
                      <td>${item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)} ر.س</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            
            <div class="order-totals">
              <div class="total-row">
                <span>المجموع الفرعي:</span>
                <span>${order.subtotal.toFixed(2)} ر.س</span>
              </div>
              <div class="total-row">
                <span>رسوم الشحن:</span>
                <span>${order.shipping.toFixed(2)} ر.س</span>
              </div>
              <div class="total-row grand-total">
                <span>المجموع الكلي:</span>
                <span>${order.total.toFixed(2)} ر.س</span>
              </div>
            </div>
            
            <div class="order-actions">
              <button class="btn-print">طباعة الفاتورة</button>
              <button class="btn-close">إغلاق</button>
            </div>
          </div>
        </div>
      `;

    // Add modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const modal = document.getElementById("order-details-modal");

    // Close modal
    const closeModal = () => {
      modal.remove();
    };

    modal.querySelector(".close-modal").addEventListener("click", closeModal);
    modal.querySelector(".btn-close").addEventListener("click", closeModal);

    // Print button
    modal.querySelector(".btn-print").addEventListener("click", () => {
      window.print();
    });

    // Show modal
    modal.style.display = "flex";
  }

  // Format address for display
  function formatAddress(address) {
    return `${
      address.city
    }، ${address.district}، ${address.street}، مبنى ${address.building}${address.apartment ? `، شقة ${address.apartment}` : ""}`;
  }

  // Render addresses
  function renderAddresses() {
    const addressesList = document.getElementById("addresses-list");
    if (!addressesList) return;

    if (userAddresses.length === 0) {
      addressesList.innerHTML = `
          <div class="no-addresses">
            <i class="fas fa-map-marker-alt"></i>
            <p>لا يوجد عناوين مسجلة</p>
            <button class="btn-add-address">إضافة عنوان جديد</button>
          </div>
        `;

      document
        .querySelector(".btn-add-address")
        .addEventListener("click", showAddressForm);
      return;
    }

    addressesList.innerHTML = userAddresses
      .map(
        (address) => `
        <div class="address-card">
          <div class="address-header">
            <h4 class="address-title">${address.title}</h4>
            ${
              address.isDefault
                ? '<span class="address-default">افتراضي</span>'
                : ""
            }
          </div>
          <div class="address-details">
            <p>${formatAddress(address)}</p>
            ${address.additionalInfo ? `<p>${address.additionalInfo}</p>` : ""}
            ${
              address.phone
                ? `<p><strong>الهاتف:</strong> ${address.phone}</p>`
                : ""
            }
          </div>
          <div class="address-actions">
            ${
              !address.isDefault
                ? `
              <button class="address-btn set-default" data-id="${address.id}">
                تعيين كافتراضي
              </button>
            `
                : ""
            }
            <button class="address-btn edit-address" data-id="${address.id}">
              تعديل
            </button>
            <button class="address-btn delete-address" data-id="${address.id}">
              حذف
            </button>
          </div>
        </div>
      `
      )
      .join("");

    // Add event listeners
    document.querySelectorAll(".btn-add-address").forEach((btn) => {
      btn.addEventListener("click", showAddressForm);
    });

    document.querySelectorAll(".set-default").forEach((btn) => {
      btn.addEventListener("click", setDefaultAddress);
    });

    document.querySelectorAll(".edit-address").forEach((btn) => {
      btn.addEventListener("click", editAddress);
    });

    document.querySelectorAll(".delete-address").forEach((btn) => {
      btn.addEventListener("click", deleteAddress);
    });
  }

  // Show address form
  function showAddressForm() {
    document.getElementById("address-form").style.display = "block";
    document.getElementById("addresses-list").style.display = "none";

    // Reset form
    document.getElementById("new-address-form").reset();
    document.getElementById("new-address-form").dataset.id = "";
  }

  // Hide address form
  function hideAddressForm() {
    document.getElementById("address-form").style.display = "none";
    document.getElementById("addresses-list").style.display = "block";
  }

  // Set default address
  function setDefaultAddress(e) {
    const addressId = e.currentTarget.getAttribute("data-id");

    const updatedUsers = users.map((user) => {
      if (user.email === currentUser.email) {
        const updatedAddresses = user.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        }));

        return {
          ...user,
          addresses: updatedAddresses,
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    showNotification("تم تحديث العنوان الافتراضي بنجاح");
    renderAddresses();
  }

  // Edit address
  function editAddress(e) {
    const addressId = e.currentTarget.getAttribute("data-id");
    const address = userAddresses.find((addr) => addr.id === addressId);
    if (!address) return;

    // Fill form with address data
    document.getElementById("address-title").value = address.title;
    document.getElementById("city").value = address.city;
    document.getElementById("district").value = address.district;
    document.getElementById("street").value = address.street;
    document.getElementById("building").value = address.building;
    document.getElementById("apartment").value = address.apartment || "";
    document.getElementById("additional-info").value =
      address.additionalInfo || "";

    // Set form to edit mode
    document.getElementById("new-address-form").dataset.id = addressId;

    // Show form
    showAddressForm();
  }

  // Delete address
  function deleteAddress(e) {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;

    const addressId = e.currentTarget.getAttribute("data-id");

    const updatedUsers = users.map((user) => {
      if (user.email === currentUser.email) {
        const updatedAddresses = user.addresses.filter(
          (addr) => addr.id !== addressId
        );

        // If we're deleting the default address, set another one as default if available
        const deletedIsDefault = user.addresses.find(
          (addr) => addr.id === addressId
        )?.isDefault;
        let finalAddresses = updatedAddresses;

        if (deletedIsDefault && updatedAddresses.length > 0) {
          finalAddresses = updatedAddresses.map((addr, index) => ({
            ...addr,
            isDefault: index === 0,
          }));
        }

        return {
          ...user,
          addresses: finalAddresses,
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    showNotification("تم حذف العنوان بنجاح");
    renderAddresses();
  }

  // Save address
  document
    .getElementById("new-address-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const addressId = this.dataset.id || Date.now().toString();
      const isEditMode = !!this.dataset.id;

      const newAddress = {
        id: addressId,
        title: document.getElementById("address-title").value,
        city: document.getElementById("city").value,
        district: document.getElementById("district").value,
        street: document.getElementById("street").value,
        building: document.getElementById("building").value,
        apartment: document.getElementById("apartment").value,
        additionalInfo: document.getElementById("additional-info").value,
        isDefault: isEditMode
          ? userAddresses.find((addr) => addr.id === addressId)?.isDefault ||
            false
          : userAddresses.length === 0, // Set as default if it's the first address
      };

      const updatedUsers = users.map((user) => {
        if (user.email === currentUser.email) {
          let updatedAddresses;

          if (isEditMode) {
            // Update existing address
            updatedAddresses = user.addresses.map((addr) =>
              addr.id === addressId ? newAddress : addr
            );
          } else {
            // Add new address
            updatedAddresses = [...user.addresses, newAddress];
          }

          return {
            ...user,
            addresses: updatedAddresses,
          };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));
      showNotification(`تم ${isEditMode ? "تحديث" : "إضافة"} العنوان بنجاح`);

      // Hide form and refresh addresses list
      hideAddressForm();
      renderAddresses();
    });

  // Cancel address form
  document
    .querySelector(".btn-cancel")
    ?.addEventListener("click", hideAddressForm);

  // Logout
  document
    .getElementById("logout-btn")
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });

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

  // Update user dropdown in navbar
  function updateUserDropdown() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userDropdown = document.querySelector(".auth-dropdown");

    if (currentUser && userDropdown) {
      let dropdownContent = `
      <a href="profile.html">حسابي</a>
      ${currentUser.isAdmin ? '<a href="admin.html">لوحة التحكم</a>' : ""}
      <a href="#" id="logout-btn">تسجيل الخروج</a>
    `;

      userDropdown.innerHTML = dropdownContent;

      document
        .getElementById("logout-btn")
        .addEventListener("click", function (e) {
          e.preventDefault();
          localStorage.removeItem("currentUser");
          updateUserStatus();
          showNotification("تم تسجيل الخروج بنجاح");
          setTimeout(() => location.reload(), 1000);
        });
    }
  }

  // Initialize
  renderOrders();
  renderAddresses();
});
