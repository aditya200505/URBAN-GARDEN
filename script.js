class PlantShopApp {
  constructor() {
    this.PRODUCTS = window.PRODUCT_DATA || [];
    this.CURRENCY_RATES = {
      INR: { rate: 1, symbol: '₹', name: 'INR' },
      USD: { rate: 0.012, symbol: '$', name: 'USD' },
      EUR: { rate: 0.011, symbol: '€', name: 'EUR' },
    };
    this.PRODUCTS.forEach(p => p.effectivePrice = p.salePrice ?? p.price);
   
    this.state = {
      products: this.PRODUCTS,
      cart: {}, 
      currentCategory: 'all',
      sort: 'default',
      currentPage: 1,
      itemsPerPage: 8,
      filters: {
        minPrice: null,
        maxPrice: null,
        inStockOnly: false,
        onSaleOnly: false,
      },
      popularity: {},
      wishlist: [],
      recentlyViewed: [],
      orders: [],
      modalProduct: null,
      onConfirm: null,
      modalQty: 1,
      currency: 'INR',
      userSettings: {
        reduceMotion: false,
        notifications: {
          emailPromo: true,
          orderUpdates: true,
        },
        address: {
          phone: '',
          address: '',
        }
      }
    };

    this._getDOMElements();
    this._initPreloader();
    this._checkLoginStatus();
    this.initTheme();
    this._initScrollAnimations();
    this._loadStateFromURL();
    this._loadUserSettings();
    this._loadCart();
    this._loadWishlist();
    this._loadUsername();
    this._loadPopularity();
    this._loadOrders();
    this._loadRecentlyViewed();
    this._updateUIFromState();
    this._bindEvents();
    this.renderNewArrivals();
    this.renderBestSellers();
    this._updateProductView();
  }

  // Helper: small neutral placeholder (inline SVG) to use when images fail to load
  _placeholderDataUri() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f6f3'/><g fill='%23a3b8a9' font-family='Arial, Helvetica, sans-serif' font-size='20' text-anchor='middle'><text x='50%' y='45%'>Image not available</text><text x='50%' y='60%' font-size='14'>The file may be missing or unsupported</text></g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Create an <img> element with proper attributes and an error fallback
  _createImg(src, alt = '', options = {}) {
    const img = new Image();
    if (options.loading) img.loading = options.loading;
    img.alt = alt;
    img.src = src;
    img.addEventListener('error', () => {
      if (img.src !== this._placeholderDataUri()) img.src = this._placeholderDataUri();
    });
    return img;
  }

  _getDOMElements() {
    this.dom = {
      preloader: document.getElementById('preloader'),
      productList: document.getElementById('productList'),
      gridLoader: document.getElementById('gridLoader'),
      shownCount: document.getElementById('shownCount'),
      totalCount: document.getElementById('totalCount'),
      categoryFilters: document.getElementById('categoryFilters'),
      sortOptions: document.getElementById('sortOptions'),
      cartBar: document.getElementById('cartBar'),
      floatingCount: document.getElementById('floatingCount'),
      cartSummary: document.getElementById('cartSummary'),
      headerCartCount: document.getElementById('headerCartCount'),
      modal: document.getElementById('modal'),
      modalImg: document.getElementById('modalImg'),
      modalTitle: document.getElementById('modalTitle'),
      modalDesc: document.getElementById('modalDesc'),
      modalPrice: document.getElementById('modalPrice'),
      modalStockStatus: document.getElementById('modalStockStatus'),
      alsoBoughtSection: document.getElementById('alsoBoughtSection'),
      alsoBoughtList: document.getElementById('alsoBoughtList'),
      qtyVal: document.getElementById('qtyVal'),
      modalAdd: document.getElementById('modalAdd'),
      modalShare: document.getElementById('modalShare'),
      modalClose: document.getElementById('modalClose'),
      decQty: document.getElementById('decQty'),
      incQty: document.getElementById('incQty'),
      cartModal: document.getElementById('cartModal'),
      cartModalClose: document.getElementById('cartModalClose'),
      cartModalList: document.getElementById('cartModalList'),
      cartModalEmpty: document.getElementById('cartModalEmpty'),
      cartModalSummary: document.getElementById('cartModalSummary'),
      cartModalTotal: document.getElementById('cartModalTotal'),
      proceedToPaymentBtn: document.getElementById('proceedToPaymentBtn'),
      pagination: document.getElementById('pagination'),
      clearCartBtn: document.getElementById('clearCartBtn'),
      searchInput: document.getElementById('globalSearch'),
      searchIcon: document.querySelector('.search-icon'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      recentlyViewedSection: document.getElementById('recentlyViewedSection'),
      recentlyViewedList: document.getElementById('recentlyViewedList'),
      bestSellersSection: document.getElementById('bestSellersSection'),
      bestSellersList: document.getElementById('bestSellersList'),
      ordersPanel: document.getElementById('ordersPanel'),
      noResultsMessage: document.getElementById('noResultsMessage'),
      settingsSidebar: document.getElementById('settingsSidebar'),
      settingsMenu: document.querySelector('.settings-menu'),
      filterBackdrop: document.getElementById('filterBackdrop'),
      closeSettingsSidebar: document.getElementById('closeSettingsSidebar'),
      minPrice: document.getElementById('minPrice'),
      maxPrice: document.getElementById('maxPrice'),
      inStockOnly: document.getElementById('inStockOnly'),
      onSaleOnly: document.getElementById('onSaleOnly'),
      applyFiltersBtn: document.getElementById('applyFiltersBtn'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),
      aboutLinkInFilter: document.getElementById('aboutLinkInFilter'),
      confirmModal: document.getElementById('confirmModal'),
      confirmModalTitle: document.getElementById('confirmModalTitle'),
      confirmModalText: document.getElementById('confirmModalText'),
      confirmModalConfirmBtn: document.getElementById('confirmModalConfirmBtn'),
      confirmModalCancelBtn: document.getElementById('confirmModalCancelBtn'),
      openCartBtn: document.getElementById('openCartBtn'),
      checkoutBtn: document.getElementById('checkoutBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      wishlistBtn: document.getElementById('wishlistBtn'),
      deliveryModal: document.getElementById('deliveryModal'),
      deliveryModalClose: document.getElementById('deliveryModalClose'),
      wishlistModal: document.getElementById('wishlistModal'),
      wishlistModalClose: document.getElementById('wishlistModalClose'),
      wishlistModalList: document.getElementById('wishlistModalList'),
      clearWishlistBtn: document.getElementById('clearWishlistBtn'),
      deliveryForm: document.getElementById('deliveryForm'),
      customerPhone: document.getElementById('customerPhone'),
      customerAddress: document.getElementById('customerAddress'),
      shopNow: document.getElementById('shopNow'),
      backToTopBtn: document.getElementById('backToTopBtn'),
      newArrivalsCarousel: document.getElementById('newArrivalsCarousel'),
      carouselPrevBtn: document.getElementById('carouselPrevBtn'),
      carouselNextBtn: document.getElementById('carouselNextBtn'),
      bestSellersCarouselPrevBtn: document.getElementById('bestSellersCarouselPrevBtn'),
      bestSellersCarouselNextBtn: document.getElementById('bestSellersCarouselNextBtn'),
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      
      currencySelect: document.getElementById('currencySelect'),
      themeToggleSwitch: document.getElementById('themeToggleSwitch'),
      reduceMotionToggle: document.getElementById('reduceMotionToggle'),
      addressForm: document.getElementById('addressForm'),
      savedCustomerPhone: document.getElementById('savedCustomerPhone'),
      savedCustomerAddress: document.getElementById('savedCustomerAddress'),
      emailPromoToggle: document.getElementById('emailPromoToggle'),
      orderUpdatesToggle: document.getElementById('orderUpdatesToggle'),

      loginPage: document.getElementById('loginPage'),
      loginForm: document.getElementById('loginForm'),
      usernameInput: document.getElementById('username'),
      logoutBtn: document.getElementById('logoutBtn'),
      passwordInput: document.getElementById('password'),
      forgotPasswordLink: document.getElementById('forgotPasswordLink'),
    };
  }

  _initPreloader() {
    // Hide preloader after animations
    setTimeout(() => {
      this.dom.preloader?.classList.add('hidden');
    }, 4500); // Increased time for new animations
  }

  _bindEvents() {
    this.dom.productList.addEventListener('click', e => this.handleProductListClick(e));
    this.dom.bestSellersList.addEventListener('click', e => this.handleProductListClick(e));
    this.dom.recentlyViewedList.addEventListener('click', e => this.handleProductListClick(e));

    this.dom.modalAdd.addEventListener('click', () => this.handleModalAddToCart());
    this.dom.modalClose.addEventListener('click', () => this.closeProductModal());
    this.dom.modalShare.addEventListener('click', () => this.handleShare());
    this.dom.decQty.addEventListener('click', () => this.updateModalQty(-1));
    this.dom.incQty.addEventListener('click', () => this.updateModalQty(1));
    this.dom.modal.addEventListener('click', e => { if (e.target === this.dom.modal) this.closeProductModal(); });
    this.dom.alsoBoughtList.addEventListener('click', e => {
      const quickAddBtn = e.target.closest('[data-add]');
      if (quickAddBtn) {
        e.stopPropagation(); 
        this.addToCart(quickAddBtn.dataset.add);
        return;
      }

      const quickViewTarget = e.target.closest('[data-quick]');
      if (quickViewTarget) {
        this.openProductModal(quickViewTarget.dataset.quick);
      }
    });

    
    this.dom.cartModalClose.addEventListener('click', () => this.closeCartModal());
    this.dom.cartModal.addEventListener('click', e => { if (e.target === this.dom.cartModal) this.closeCartModal(); });
    this.dom.proceedToPaymentBtn.addEventListener('click', () => this.handleProceedToPayment());
    this.dom.clearCartBtn.addEventListener('click', () => this.handleClearCartRequest());
    this.dom.confirmModalConfirmBtn.addEventListener('click', () => this.executeConfirmation());
    this.dom.confirmModalCancelBtn.addEventListener('click', () => this.closeConfirmModal());
    this.dom.confirmModal.addEventListener('click', e => { if (e.target === this.dom.confirmModal) this.closeConfirmModal(); });

    this.dom.cartModalList.addEventListener('click', e => {
      if (e.target.dataset.remove) {
        this.removeFromCart(e.target.dataset.remove);
      } else if (e.target.dataset.action === 'increase') {
        this.updateCartQuantity(e.target.dataset.id, 1);
      } else if (e.target.dataset.action === 'decrease') {
        this.updateCartQuantity(e.target.dataset.id, -1);
      }
    });

    
    this.dom.searchInput.addEventListener('input', this._debounce(e => {
      this.handleSearch(e);
      this.toggleClearSearchBtn();
    }, 300));

    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.handleSearch();
      this.toggleClearSearchBtn();
    });

    this.dom.sortOptions.addEventListener('change', e => this.handleSort(e));

    this.dom.pagination.addEventListener('click', e => this.handlePaginationClick(e));

    this.dom.categoryFilters.addEventListener('click', e => this.handleCategoryFilter(e));

    this.dom.settingsBtn.addEventListener('click', () => this.openSettingsSidebar());
    this.dom.closeSettingsSidebar.addEventListener('click', () => this.closeSettingsSidebar());
    this.dom.filterBackdrop.addEventListener('click', () => this.closeSettingsSidebar());
    this.dom.resetFiltersBtn.addEventListener('click', () => this.handleResetFilters());
    this.dom.aboutLinkInFilter.addEventListener('click', () => {
      this.closeSettingsSidebar();
      document.querySelector('.site-footer-about').scrollIntoView({ behavior: 'smooth' });
    });

    this.dom.settingsMenu.addEventListener('click', e => this.handleSettingsPanelSwitch(e));

    this.dom.ordersPanel.addEventListener('click', e => this.handleOrderPanelClick(e));

    const debouncedFilter = this._debounce(() => this._applyFiltersAndUpdate(), 400);
    this.dom.minPrice.addEventListener('input', debouncedFilter);
    this.dom.maxPrice.addEventListener('input', debouncedFilter);
    this.dom.inStockOnly.addEventListener('change', () => this._applyFiltersAndUpdate());
    this.dom.onSaleOnly.addEventListener('change', () => this._applyFiltersAndUpdate());

     this.dom.checkoutBtn.addEventListener('click', () => this.openCartModal());
    this.dom.openCartBtn.addEventListener('click', () => { if (Object.keys(this.state.cart).length === 0) this.showToast('Cart is empty'); else this.openCartModal(); });

    this.dom.deliveryModalClose.addEventListener('click', () => this.closeDeliveryModal());
    this.dom.deliveryModal.addEventListener('click', e => { if (e.target === this.dom.deliveryModal) this.closeDeliveryModal(); });
    this.dom.wishlistBtn.addEventListener('click', () => this.openWishlistModal());
    this.dom.wishlistModalClose.addEventListener('click', () => this.closeWishlistModal());
    this.dom.wishlistModal.addEventListener('click', e => { if (e.target === this.dom.wishlistModal) this.closeWishlistModal(); });
    this.dom.wishlistModalList.addEventListener('click', e => {
      if (e.target.dataset.wishlistRemove) {
        this.handleRemoveFromWishlist(e.target.dataset.wishlistRemove);
      }
    });
    this.dom.clearWishlistBtn.addEventListener('click', () => this.handleClearWishlistRequest());

    this.dom.deliveryForm.addEventListener('submit', e => this.handleConfirmOrder(e));

    this.dom.openCartBtn.addEventListener('mouseenter', this._debounce(e => {
      if (Object.keys(this.state.cart).length > 0) {
        this.triggerCartAnimation(e.currentTarget);
      }
    }, 500, true));

    window.addEventListener('scroll', () => this.handleBackToTopVisibility(), { passive: true });
    this.dom.backToTopBtn.addEventListener('click', () => this.scrollToTop());

    this.dom.shopNow.addEventListener('click', () => this.dom.productList.scrollIntoView({ behavior: 'smooth' }));

    this.dom.newArrivalsCarousel?.addEventListener('click', e => {
      const card = e.target.closest('.card');
      if (card && card.dataset.quick) this.openProductModal(card.dataset.quick);
    });

    this.dom.carouselPrevBtn?.addEventListener('click', () => this.handleCarouselScroll(-1));
    this.dom.carouselNextBtn?.addEventListener('click', () => this.handleCarouselScroll(1));

    this.dom.bestSellersCarouselPrevBtn?.addEventListener('click', () => this.handleBestSellersCarouselScroll(-1));
    this.dom.bestSellersCarouselNextBtn?.addEventListener('click', () => this.handleBestSellersCarouselScroll(1));

    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    this.carouselPauseTimeout = null;
    this.autoScrollInterval = null;
    this.bestSellersAutoScrollInterval = null;

    this.dom.newArrivalsCarousel?.addEventListener('mouseenter', () => this.stopAutoScroll('newArrivals'));
    this.dom.newArrivalsCarousel?.addEventListener('mouseleave', () => this.startAutoScroll('newArrivals'));

    this.dom.currencySelect.addEventListener('change', e => this.handleCurrencyChange(e));
    this.dom.themeToggleSwitch.addEventListener('change', () => this.toggleTheme());
    this.dom.reduceMotionToggle.addEventListener('change', e => this.handleReduceMotionToggle(e));
    this.dom.addressForm.addEventListener('submit', e => this.handleSaveAddress(e));
    this.dom.emailPromoToggle.addEventListener('change', e => this.handleNotificationToggle('emailPromo', e.target.checked));
    this.dom.orderUpdatesToggle.addEventListener('change', e => this.handleNotificationToggle('orderUpdates', e.target.checked));

    this.dom.loginForm.addEventListener('submit', e => this.handleLogin(e));
    this.dom.logoutBtn.addEventListener('click', () => this.handleLogout());
    this.dom.forgotPasswordLink.addEventListener('click', e => {
      e.preventDefault();
      this.showToast('Password recovery feature is coming soon!');
    });

  }

  startAutoScroll(carouselType) {
    if (carouselType === 'newArrivals') {
      this.stopAutoScroll('newArrivals'); 
      this.autoScrollInterval = setInterval(() => {
        this.handleCarouselScroll(1);
      }, 5000);
    }
  }

  stopAutoScroll(carouselType) {
    if (carouselType === 'newArrivals') {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    } else if (carouselType === 'bestSellers') {
      clearInterval(this.bestSellersAutoScrollInterval);
    }
  }

  handleSettingsPanelSwitch(e) {
    const button = e.target.closest('.settings-menu-item');
    if (!button) return;

    const panelId = button.dataset.panel + 'Panel';

    this.dom.settingsMenu.querySelector('.active')?.classList.remove('active');
    button.classList.add('active');
    document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
    document.getElementById(panelId).style.display = 'block';
  }

  _updateProductView() {
    this.dom.gridLoader.style.display = 'flex';
    this.dom.productList.style.opacity = '0.5';

    let filteredProducts = this.PRODUCTS;

    if (this.state.currentCategory !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === this.state.currentCategory);
    }
    const query = this.dom.searchInput.value.trim().toLowerCase();

    if (query) {
      filteredProducts = filteredProducts.filter(p => 
        (p.name + p.desc + p.category).toLowerCase().includes(query));
    }
 
    filteredProducts = filteredProducts.filter(p => {
      const price = p.salePrice ?? p.price;
      const { minPrice, maxPrice, inStockOnly, onSaleOnly } = this.state.filters;
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      if (inStockOnly && p.stock === 0) return false;
      if (onSaleOnly && !p.salePrice) return false;
      return true;
    });

    const sort = this.state.sort;
    const getPrice = p => p.salePrice ?? p.price;
    if (sort === 'popular') {
      filteredProducts.sort((a, b) => (this.state.popularity[b.id] || 0) - (this.state.popularity[a.id] || 0));
    } else if (sort === 'on-sale') {
      filteredProducts.sort((a, b) => (b.salePrice != null) - (a.salePrice != null));
    } else if (sort === 'price-asc') {
      filteredProducts.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === 'rating') {
      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      filteredProducts.sort((a, b) => parseInt(b.id.slice(1)) - parseInt(a.id.slice(1)));
    } else if (sort === 'price-desc') {
      filteredProducts.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sort === 'name-asc') {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    this.state.products = filteredProducts;
    const totalItems = this.state.products.length;
    const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const end = start + this.state.itemsPerPage;
    const paginatedProducts = this.state.products.slice(start, end);

    setTimeout(() => {
      this.renderProducts(paginatedProducts);
      this.renderPagination(totalItems);
      this._updateURL();
      this.renderCartUI();
 
      this.dom.gridLoader.style.display = 'none';
      this.dom.productList.style.opacity = '1';
    }, 100);
  }

  renderProducts(productsToRender) {
    this.dom.productList.innerHTML = '';

    if (productsToRender.length === 0 && this.dom.productList.innerHTML === '') {
      this.dom.noResultsMessage.style.display = 'block';
    } else {
      this.dom.noResultsMessage.style.display = 'none';
    }
    productsToRender.forEach(p => {
      const card = document.createElement('article');

      
      card.classList.add('animate-on-scroll');
      const thumb = document.createElement('div');
      thumb.className = 'thumb loading';
      thumb.setAttribute('aria-hidden', 'true');

      const img = this._createImg(p.img, this.escapeHtml(p.name), { loading: 'lazy' });
      // append immediately so placeholder or image shows even if load is slow/fails
      thumb.appendChild(img);
      const clearLoading = () => thumb.classList.remove('loading');
      img.addEventListener('load', clearLoading);
      img.addEventListener('error', () => {
        // helper will swap to placeholder; ensure spinner is removed
        clearLoading();
      });

      const priceHTML = p.salePrice
        ? `<span class="sale-price">${this.formatPrice(p.salePrice)}</span> <span class="original-price">${this.formatPrice(p.price)}</span>`
        : `${this.formatPrice(p.price)}`;

      const stockInfo = p.stock > 0
        ? `<button class="icon-btn quick-add-btn" data-add="${p.id}" title="Quick Add">+</button>`
        : `<button class="icon-btn" disabled>Sold Out</button>`;

      const saleChip = p.salePrice ? `<span class="chip sale-chip">Sale</span>` : '';

      const isNew = p.dateAdded && (new Date() - new Date(p.dateAdded)) / (1000 * 60 * 60 * 24) <= 7;
      let newChip = '';
      const today = new Date('2025-09-29');
      if (p.dateAdded && (today - new Date(p.dateAdded)) / (1000 * 60 * 60 * 24) <= 7) {
        newChip = `<span class="chip new-chip">New</span>`;
      }
      const ratingHTML = p.rating ? `<div class="rating-display">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</div>` : '';


      card.innerHTML = `
        <button class="icon-btn wishlist-btn" data-wishlist="${p.id}" title="Add to Wishlist">❤</button>
        <div class="meta">
          <h3>${this.escapeHtml(p.name)}</h3>
          ${ratingHTML}
          <p class="muted">${this.escapeHtml(p.desc)}</p>
          <div class="price-row">
            <div class="price">${priceHTML}</div>
            <div class="card-actions">
              <button class="icon-btn card-share-btn" data-share="${p.id}" title="Share">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
              <button class="add-btn" data-quick="${p.id}">View</button>
              ${stockInfo}
            </div>
          </div>
        </div>`;
      if (p.stock === 0) {
        card.style.opacity = 0.7;
      } else {
        card.style.opacity = 1;
      }
      const chipsHTML = saleChip + newChip;
      if (chipsHTML) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'card-chips';
        chipsContainer.innerHTML = chipsHTML;
        card.prepend(chipsContainer);
      }
      card.prepend(thumb);

      card.className = 'card';


      if (this.state.wishlist.includes(p.id)) card.querySelector('.wishlist-btn').classList.add('active');
      this.dom.productList.appendChild(card);
      this.scrollObserver.observe(card);
    });
    this.dom.shownCount.textContent = productsToRender.length;
    this.dom.totalCount.textContent = this.state.products.length;
  }

  addToCart(productId, quantity = 1) {
    const product = this.PRODUCTS.find(p => p.id === productId);
    if (!product) {
      console.error(`Product with id ${productId} not found.`);
      return;
    }

    if (product.stock === 0) {
      this.showToast(`${product.name} is out of stock.`);
      return;
    }

    const currentQtyInCart = this.state.cart[productId] || 0;
    if (currentQtyInCart + quantity > product.stock) {
      this.showToast(`Only ${product.stock} of ${product.name} available.`);
      return;
    }

    this.state.cart[productId] = currentQtyInCart + quantity;
    this._updatePopularity(productId, quantity);
    this._saveCart();
    this.renderCartUI();
    this.showToast(`${quantity} x ${product.name} added to cart!`);
  }

  renderCartUI() {
    const totalQty = Object.values(this.state.cart).reduce((s, q) => s + q, 0);
    const totalPrice = Object.entries(this.state.cart).reduce((sum, [id, q]) => {
      const p = this.PRODUCTS.find(x => x.id === id);
      const price = p ? (p.salePrice ?? p.price) : 0;
      return sum + (price * q);
    }, 0);

    if (totalQty > 0) {
      this.dom.cartBar.style.display = 'flex';
      this.dom.floatingCount.textContent = totalQty;
      this.dom.cartSummary.textContent = `${totalQty} item${totalQty > 1 ? 's' : ''} • ${this.formatPrice(totalPrice)}`;
      this.dom.headerCartCount.textContent = `${totalQty} items in cart`;
    } else {
      this.dom.cartBar.style.display = 'none';
      this.dom.headerCartCount.textContent = `0 items`;
    }
  }

  renderCartModal() {
    this.dom.cartModalList.innerHTML = '';
    const cartItems = Object.entries(this.state.cart);

    if (cartItems.length === 0) {
      this.dom.cartModalEmpty.style.display = 'block';
      this.dom.cartModalSummary.style.display = 'none';
    } else {
      this.dom.cartModalEmpty.style.display = 'none';
      this.dom.cartModalSummary.style.display = 'block';

      let total = 0;
      cartItems.forEach(([id, qty]) => {
        const product = this.PRODUCTS.find(p => p.id === id);
        if (!product) return;

        const price = product.salePrice ?? product.price;
        total += price * qty;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-modal-item';
        itemEl.dataset.id = id;

        const imgWrap = document.createElement('div');
        const imgEl = this._createImg(product.img, this.escapeHtml(product.name));
        imgEl.style.width = '50px';
        imgEl.style.height = '50px';
        imgEl.style.borderRadius = '8px';
        imgEl.style.objectFit = 'cover';
        imgWrap.appendChild(imgEl);

        const flexDiv = document.createElement('div');
        flexDiv.style.flex = '1';
        flexDiv.innerHTML = `
          <div>${this.escapeHtml(product.name)}
            <button class="remove-btn" data-remove="${id}" title="Remove item">remove</button>
          </div>
          <div class="qty">
            <button data-id="${id}" data-action="decrease" aria-label="Decrease quantity">−</button>
            <div class="qty-val">${qty}</div>
            <button data-id="${id}" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
        `;

        const priceDiv = document.createElement('div');
        priceDiv.textContent = this.formatPrice(price * qty);

        itemEl.appendChild(imgWrap);
        itemEl.appendChild(flexDiv);
        itemEl.appendChild(priceDiv);

        this.dom.cartModalList.appendChild(itemEl);
      });
      this.dom.cartModalTotal.textContent = `${this.formatPrice(total)}`;
    }
  }

  renderOrdersPanel() {
    const panel = this.dom.ordersPanel;

    const title = panel.querySelector('h4');
    panel.innerHTML = '';
    panel.appendChild(title);

    if (this.state.orders.length === 0) {
      panel.innerHTML += `
        <div class="placeholder-content">
            <p class="muted">You have no recent orders.</p>
            <p class="muted" style="font-size: 12px;">This is where your order history will appear.</p>
        </div>`;
    } else {
      const sortedOrders = [...this.state.orders].sort((a, b) => b.date - a.date);
      sortedOrders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-history-item';
        const itemsHTML = Object.entries(order.items).map(([id, qty]) => {
          const product = this.PRODUCTS.find(p => p.id === id);
          return `<div class="order-item"><span>${qty} x ${this.escapeHtml(product?.name || 'Unknown Item')}</span></div>`;
        }).join('');
        
        const cancelButtonHTML = order.status === 'Processing' 
          ? `<button class="text-btn cancel-order-btn" data-cancel-order-id="${order.id}">Cancel Order</button>` 
          : '';

        orderEl.innerHTML = `
          <div class="order-history-header">
            <span class="order-id">Order #${order.id}</span>
            <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
          </div>
          <div class="order-item-list">${itemsHTML}</div>
          <div class="order-history-footer">
            <span>Total: ${this.formatPrice(order.total)}</span>
            ${cancelButtonHTML}
            <span class="order-status-badge status-${order.status.toLowerCase()}">${order.status}</span>
          </div>`;
        panel.appendChild(orderEl);
      });
    }
  }

  handleOrderPanelClick(e) {
    const cancelButton = e.target.closest('[data-cancel-order-id]');
    if (cancelButton) {
      const orderId = cancelButton.dataset.cancelOrderId;
      this.handleCancelOrderRequest(orderId);
    }
  }

  handleCancelOrderRequest(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'Processing') {
      this.showToast("This order can no longer be cancelled.");
      return;
    }

    this.openConfirmModal(
      'Cancel Order',
      `Are you sure you want to cancel Order #${orderId}?`,
      () => this.cancelOrder(orderId)
    );
  }

  cancelOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'Cancelled';
      if (order.timeoutIds) {
        clearTimeout(order.timeoutIds.shippedTimeout);
        clearTimeout(order.timeoutIds.deliveredTimeout);
      }
      this._saveOrders();
      this.renderOrdersPanel(); 
      this.showToast(`Order #${orderId} has been cancelled.`);
    }
  }

  simulateOrderStatusUpdate(orderId) {
    const shippedTimeout = setTimeout(() => {
      const order = this.state.orders.find(o => o.id === orderId);
      if (order && order.status === 'Processing') {
        order.status = 'Shipped';
        this._saveOrders();
        this.showToast(`Order #${orderId} has been shipped!`);
      }
    }, 10000);

    const deliveredTimeout = setTimeout(() => {
      const order = this.state.orders.find(o => o.id === orderId);
      if (order && order.status === 'Shipped') {
        order.status = 'Delivered';
        this._saveOrders();
      }
    }, 25000);
    return { shippedTimeout, deliveredTimeout };
  }

  renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.state.itemsPerPage);
    this.dom.pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&laquo;';
    prevBtn.dataset.page = this.state.currentPage - 1;
    if (this.state.currentPage === 1) prevBtn.disabled = true;
    this.dom.pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      pageBtn.dataset.page = i;
      if (i === this.state.currentPage) pageBtn.classList.add('active');
      this.dom.pagination.appendChild(pageBtn);
    }
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&raquo;';
    nextBtn.dataset.page = this.state.currentPage + 1;
    if (this.state.currentPage === totalPages) nextBtn.disabled = true;
    this.dom.pagination.appendChild(nextBtn);
  }

  renderRecentlyViewed() {
    if (this.state.recentlyViewed.length === 0) {
      this.dom.recentlyViewedSection.style.display = 'none';
      return;
    }

    this.dom.recentlyViewedSection.style.display = 'block';
    this.dom.recentlyViewedList.innerHTML = '';

    this.state.recentlyViewed.forEach(productId => {
      const p = this.PRODUCTS.find(prod => prod.id === productId);
      if (!p) return;

      const card = document.createElement('article');
      card.className = 'card';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.setAttribute('aria-hidden', 'true');
    const img = this._createImg(p.img, this.escapeHtml(p.name), { loading: 'lazy' });
    thumb.appendChild(img);

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `
        <h3>${this.escapeHtml(p.name)}</h3>
        <div class="price-row">
          <div class="price">${this.formatPrice(p.price)}</div>
          <div>
            <button class="add-btn" data-quick="${p.id}">View</button>
          </div>
        </div>
      `;

      card.appendChild(thumb);
      card.appendChild(meta);
      this.dom.recentlyViewedList.appendChild(card);
    });
  }

  renderBestSellers() {
    const popularProductIds = Object.keys(this.state.popularity)
      .sort((a, b) => this.state.popularity[b] - this.state.popularity[a])
      .slice(0, 5); 
    if (popularProductIds.length === 0) {
      this.dom.bestSellersSection.style.display = 'none';
      return;
    }
    this.dom.bestSellersSection.style.display = 'block'; 
    this.dom.bestSellersList.innerHTML = '';

    popularProductIds.forEach(productId => {
      const p = this.PRODUCTS.find(prod => prod.id === productId);
      if (!p) return;

      const card = document.createElement('article');
      card.className = 'card'; 
      const soldCount = this.state.popularity[productId] || 0;
      card.innerHTML = `
        <span class="chip best-seller-chip">Best Seller</span>
        <div class="meta">
          <h3>${this.escapeHtml(p.name)}</h3>
          <p class="muted">${p.desc}</p>
          <div class="bestseller-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Sold <strong>${soldCount}</strong> times!</span>
          </div>
          <button class="add-btn" data-quick="${p.id}" style="width:100%; margin-top:auto;">View</button>
        </div>`;
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const img = this._createImg(p.img, this.escapeHtml(p.name), { loading: 'lazy' });
      thumb.appendChild(img);
      card.prepend(thumb);
      this.dom.bestSellersList.appendChild(card.cloneNode(true)); 
      this.dom.bestSellersList.appendChild(card.cloneNode(true)); 
    });
  }

  renderWishlistModal() {
    this.dom.wishlistModalList.innerHTML = '';
    const wishlistItems = this.state.wishlist;
    const emptyMessage = this.dom.wishlistModal.querySelector('#wishlistModalEmpty');

    if (wishlistItems.length === 0) {
      emptyMessage.style.display = 'block';
    } else {
      emptyMessage.style.display = 'none';
      wishlistItems.forEach(id => {
        const product = this.PRODUCTS.find(p => p.id === id);
        if (!product) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-modal-item'; 

        const imgEl = this._createImg(product.img, this.escapeHtml(product.name));
        imgEl.style.width = '50px';
        imgEl.style.height = '50px';
        imgEl.style.borderRadius = '8px';
        imgEl.style.objectFit = 'cover';

        const flexDiv = document.createElement('div');
        flexDiv.style.flex = '1';
        flexDiv.innerHTML = `
          <div>
            ${this.escapeHtml(product.name)}
            <button class="remove-btn" data-wishlist-remove="${product.id}" title="Remove from wishlist">remove</button>
          </div>
          <div class="muted">${product.desc}</div>
        `;

        const viewDiv = document.createElement('div');
        viewDiv.innerHTML = `<button class="add-btn" data-quick="${product.id}">View</button>`;

        itemEl.appendChild(imgEl);
        itemEl.appendChild(flexDiv);
        itemEl.appendChild(viewDiv);
        this.dom.wishlistModalList.appendChild(itemEl);
      });
    }
  }

  renderNewArrivals() {
    const newProducts = [...this.PRODUCTS]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 10); 

    const renderCards = (products) => {
      this.dom.newArrivalsCarousel.innerHTML = '';
      products.forEach(p => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.quick = p.id;
        const priceHTML = p.salePrice
          ? `<span class="sale-price">${this.formatPrice(p.salePrice)}</span> <span class="original-price">${this.formatPrice(p.price)}</span>`
          : `${this.formatPrice(p.price)}`;

        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        thumb.setAttribute('aria-hidden', 'true');
        const img = this._createImg(p.img, this.escapeHtml(p.name), { loading: 'lazy' });
        thumb.appendChild(img);

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `
          <h3>${this.escapeHtml(p.name)}</h3>
          <div class="price-row">
            <div class="price">${priceHTML}</div>
          </div>
        `;

        card.appendChild(thumb);
        card.appendChild(meta);
        this.dom.newArrivalsCarousel.appendChild(card);
      });
    };
    const duplicatedProducts = [...newProducts, ...newProducts];
    renderCards(duplicatedProducts);
  }

  handleProductListClick(e) {
    if (e.target.dataset.add) {
      this.addToCart(e.target.dataset.add);
      this._animateFlyToCart(e.target);
      const btn = e.target;
      btn.innerHTML = '✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.innerHTML = '+';
        btn.classList.remove('added');
      }, 1500);
    } else if (e.target.dataset.quick) {
      this.openProductModal(e.target.dataset.quick);
    } else if (e.target.closest('[data-wishlist]')) {
      const btn = e.target.closest('[data-wishlist]');
      this.handleAddToWishlist(btn);
    } else if (e.target.closest('[data-share]')) {
      const productId = e.target.closest('[data-share]').dataset.share;
      this.handleCardShare(productId);
    }
  }

  handleCarouselScroll(direction) {
    const carousel = this.dom.newArrivalsCarousel;
    if (!carousel) return;

    const card = carousel.querySelector('.card');
    if (!card) return;

    const scrollAmount = card.offsetWidth + 16; 
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    this.stopAutoScroll('newArrivals');
    setTimeout(() => this.startAutoScroll('newArrivals'), 5000);
  }

  updateCartQuantity(id, change) {
    if (!this.state.cart[id]) return;

    const newQty = this.state.cart[id] + change;

    if (newQty <= 0) {
      this.removeFromCart(id);
    } else {
      this.state.cart[id] = newQty;
      this._saveCart();
      this.renderCartUI();
      this.renderCartModal();
    }
  }

  clearCart() {
    this.state.cart = {};
    this._saveCart();
    this.renderCartUI();
  }

  handleClearCartRequest() {
    if (Object.keys(this.state.cart).length === 0) {
      this.showToast("Cart is already empty");
      return;
    }
    this.openConfirmModal('Clear Cart', 'Are you sure you want to remove all items from your cart?', () => {
      this.clearCart();
      this.renderCartModal(); 
    });
  }
  handleSearch(e) {
    this.state.currentPage = 1; 
    this._updateProductView();
  }
  toggleClearSearchBtn() {
    const hasValue = this.dom.searchInput.value.length > 0;
    this.dom.clearSearchBtn.style.display = hasValue ? 'block' : 'none';
    this.dom.searchIcon.style.display = hasValue ? 'none' : 'block';
  }

  handleSort(e) {
    this.state.sort = e.target.value;
    this.state.currentPage = 1; 
    this._updateProductView();
    if (this.state.sort === 'default') {
      this.triggerFallingAnimation();
    }
  }

  handleCategoryFilter(e) {
    const target = e.target.closest('button');
    if (!target || !target.dataset.category) return;

    this.state.currentCategory = target.dataset.category;
    this.state.currentPage = 1; 

    this.dom.categoryFilters.querySelector('.active').classList.remove('active');
    target.classList.add('active');
    this.dom.productList.scrollIntoView({ behavior: 'smooth' });

    this._updateProductView();
  }

  handlePaginationClick(e) {
    const target = e.target.closest('button');
    if (!target || !target.dataset.page) return;

    const newPage = parseInt(target.dataset.page, 10);
    this.state.currentPage = newPage;
    this._updateProductView();
  }

  handleProceedToPayment() {
    if (Object.keys(this.state.cart).length > 0) {
      this.closeCartModal();
      this.openDeliveryModal();
    }
  }

  handleCheckout() {
    if (Object.keys(this.state.cart).length > 0) {
      const newOrder = {
        id: Date.now().toString().slice(-6), 
        date: Date.now(),
        items: { ...this.state.cart },
        total: Object.entries(this.state.cart).reduce((sum, [id, q]) => {
          const p = this.PRODUCTS.find(x => x.id === id);
          return sum + (p.effectivePrice * q);
        }, 0),
        status: 'Processing', 
        timeoutIds: {}
      };
      this.state.orders.push(newOrder);
      newOrder.timeoutIds = this.simulateOrderStatusUpdate(newOrder.id);
      this._saveOrders();

      this.closeDeliveryModal();
      this.showToast('Thank you for shopping! Your order will be delivered within 30 minutes.');
      this.clearCart();
      this.triggerFallingAnimation();

      this.dom.customerPhone.value = '';
      this.dom.customerAddress.value = '';
    }
  }
  openProductModal(id) {
    const p = this.PRODUCTS.find(x => x.id === id);
    if (!p) return;
    this.state.modalProduct = p;
    this.state.modalQty = 1;
  // ensure modal image has an error fallback
  this.dom.modalImg.onerror = () => { if (this.dom.modalImg.src !== this._placeholderDataUri()) this.dom.modalImg.src = this._placeholderDataUri(); };
  this.dom.modalImg.src = p.img;
  this._addRecentlyViewed(id);
  this.dom.modalImg.alt = p.name;
    this.dom.modalTitle.textContent = p.name;
    this.dom.modalDesc.textContent = p.desc;
    this.dom.modalDesc.insertAdjacentHTML('afterend', p.rating ? `<div class="rating-display">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</div>` : '');
    this.dom.modalPrice.innerHTML = p.salePrice ?
      `<span class="sale-price">${this.formatPrice(p.salePrice)}</span> <span class="original-price">${this.formatPrice(p.price)}</span>` :
      `${this.formatPrice(p.price)}`;

    if (p.stock > 10) {
      this.dom.modalStockStatus.innerHTML = `<span class="stock-dot stock-high"></span> In Stock`;
    } else if (p.stock > 0) {
      this.dom.modalStockStatus.innerHTML = `<span class="stock-dot stock-low"></span> Low Stock (${p.stock} left)`;
    } else {
      this.dom.modalStockStatus.innerHTML = `<span class="stock-dot stock-out"></span> Out of Stock`;
    }

    const recommendations = this.PRODUCTS
      .filter(pRec => pRec.category === p.category && pRec.id !== p.id)
      .sort((a, b) => (this.state.popularity[b.id] || 0) - (this.state.popularity[a.id] || 0))
      .slice(0, 3);

    if (recommendations.length > 0) {
      this.dom.alsoBoughtSection.style.display = 'block';
      this.dom.alsoBoughtList.innerHTML = '';
      recommendations.forEach(rec => {
        const recEl = document.createElement('div');
        recEl.className = 'also-bought-item';
        recEl.dataset.quick = rec.id;
        const imgEl = this._createImg(rec.img, this.escapeHtml(rec.name));
        const addBtn = document.createElement('button');
        addBtn.className = 'icon-btn quick-add-btn also-bought-add-btn';
        addBtn.dataset.add = rec.id;
        addBtn.title = 'Quick Add';
        addBtn.textContent = '+';

        const meta = document.createElement('div');
        meta.className = 'also-bought-meta';
        meta.innerHTML = `<span>${this.escapeHtml(rec.name)}</span><span class="price">${this.formatPrice(rec.effectivePrice)}</span>`;

        recEl.appendChild(imgEl);
        recEl.appendChild(addBtn);
        recEl.appendChild(meta);
        this.dom.alsoBoughtList.appendChild(recEl);
      });
    } else {
      this.dom.alsoBoughtSection.style.display = 'none';
    }

    this.dom.modalAdd.disabled = p.stock === 0;
    this.dom.modalAdd.textContent = p.stock === 0 ? "Out of Stock" : "Add to cart";
    this.dom.qtyVal.textContent = this.state.modalQty;
    this.dom.modal.style.display = 'flex';
    this.openModal(this.dom.modal);
  }

  _createBestSellerCard(p, soldCount) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <span class="chip best-seller-chip">Best Seller</span>
      <div class="meta">
        <h3>${this.escapeHtml(p.name)}</h3>
        <p class="muted">${p.desc}</p>
        <div class="bestseller-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>Sold <strong>${soldCount}</strong> times!</span>
        </div>
        <button class="add-btn" data-quick="${p.id}" style="width:100%; margin-top:auto;">View</button>
      </div>`;
  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  const imgEl = this._createImg(p.img, this.escapeHtml(p.name), { loading: 'lazy' });
  thumb.appendChild(imgEl);
  card.prepend(thumb);
    this.dom.bestSellersList.appendChild(card);
  }

  openSettingsSidebar() {
    this.dom.settingsSidebar.classList.add('is-open');
    this.dom.filterBackdrop.style.display = 'block';
    this._updateSettingsUI();
  }

  closeSettingsSidebar() {
    this.dom.settingsSidebar.classList.remove('is-open');
    this.dom.filterBackdrop.style.display = 'none';
  }

  _applyFiltersAndUpdate() {
    this.state.filters.minPrice = this.dom.minPrice.value ? parseFloat(this.dom.minPrice.value) : null;
    this.state.filters.maxPrice = this.dom.maxPrice.value ? parseFloat(this.dom.maxPrice.value) : null;
    this.state.filters.inStockOnly = this.dom.inStockOnly.checked;
    this.state.filters.onSaleOnly = this.dom.onSaleOnly.checked;

    this.state.currentPage = 1;
    this._updateProductView();
    this._updateFilterIndicator();
  }

  handleResetFilters() {
    this.dom.minPrice.value = '';
    this.dom.maxPrice.value = '';
    this.dom.inStockOnly.checked = false;
    this.dom.onSaleOnly.checked = false;
    
    this._applyFiltersAndUpdate();
    this._updateFilterIndicator();
  }
  
  handleCurrencyChange(e) {
    this.state.currency = e.target.value;
    this.state.userSettings.currency = this.state.currency;
    this._saveUserSettings();
    this._updateProductView(); 
  }

  handleReduceMotionToggle(e) {
    this.state.userSettings.reduceMotion = e.target.checked;
    document.body.classList.toggle('reduce-motion', this.state.userSettings.reduceMotion);
    this._saveUserSettings();
  }

  handleSaveAddress(e) {
    e.preventDefault();
    this.state.userSettings.address = {
      phone: this.dom.savedCustomerPhone.value,
      address: this.dom.savedCustomerAddress.value,
    };
    this._saveUserSettings();
    this.showToast('Address saved successfully!');
  }

  handleNotificationToggle(type, isEnabled) {
    this.state.userSettings.notifications[type] = isEnabled;
    this._saveUserSettings();
  }

  formatPrice(priceInINR) {
    const { rate, symbol } = this.CURRENCY_RATES[this.state.currency];
    const convertedPrice = priceInINR * rate;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  }



  closeProductModal() {
    this.dom.modal.style.display = 'none';
    this.closeModal(this.dom.modal);
    this.state.modalProduct = null;
  }

  openConfirmModal(title, text, onConfirm) {
    this.dom.confirmModalTitle.textContent = title;
    this.dom.confirmModalText.textContent = text;
    this.state.onConfirm = onConfirm;
    this.openModal(this.dom.confirmModal);
  }

  closeConfirmModal() {
    this.closeModal(this.dom.confirmModal);
    this.state.onConfirm = null;
  }

  executeConfirmation() {
    if (typeof this.state.onConfirm === 'function') {
      this.state.onConfirm();
    }
    this.closeConfirmModal();
  }

  updateModalQty(change) {
    this.state.modalQty = Math.max(1, Math.min(20, this.state.modalQty + change));
    this.dom.qtyVal.textContent = this.state.modalQty;
  }

  handleModalAddToCart() {
    if (!this.state.modalProduct) return;
    this.addToCart(this.state.modalProduct.id, this.state.modalQty);
    this.closeProductModal();
  }

  async handleCardShare(productId) {
    const product = this.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const url = new URL(window.location);
    url.searchParams.set('product', productId);

    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from The Urban Garden!`,
      url: url.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        this.showToast('Link copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.showToast('Could not copy link.');
      });
    }
  }

  async handleShare() {
    const product = this.state.modalProduct;
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from The Urban Garden!`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        this.showToast('Product shared successfully!');
      } catch (err) {
        console.error('Share failed:', err);
        this.showToast('Could not share product.');
      }
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        this.showToast('Link copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.showToast('Could not copy link.');
      });
    }
  }

  openCartModal() {
    this.dom.cartModalList.querySelectorAll('.cart-modal-item').forEach((el, i) => {
      el.classList.add('item-add-anim');
      el.style.animationDelay = `${i * 50}ms`;
    });
    this.renderCartModal();
    this.openModal(this.dom.cartModal);
  }

  closeCartModal() {
    this.closeModal(this.dom.cartModal);
  }

  openDeliveryModal() {
    this.openModal(this.dom.deliveryModal);
    const { phone, address } = this.state.userSettings.address;
    if (phone || address) {
      this.dom.customerPhone.value = phone;
      this.dom.customerAddress.value = address;
    }
  }

  closeDeliveryModal() {
    this.closeModal(this.dom.deliveryModal);
  }

  handleConfirmOrder(event) {
    event.preventDefault(); 
    if (this.dom.customerPhone.value.trim() && this.dom.customerAddress.value.trim()) {
      this.handleCheckout();
    } else {
      this.showToast('Please fill in all required fields.');
    }
  }

  openWishlistModal() {
    this.renderWishlistModal();
    this.openModal(this.dom.wishlistModal);
  }

  closeWishlistModal() {
    this.closeModal(this.dom.wishlistModal);
  }

  handleAddToWishlist(button) {
    const productId = button.dataset.wishlist;
    const product = this.PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const index = this.state.wishlist.indexOf(productId);

    if (index > -1) { 
      this.state.wishlist.splice(index, 1);
      button.classList.remove('active');
      this.showToast(`${product.name} removed from wishlist`);
    } else { 
      this.state.wishlist.push(productId);
      button.classList.add('active');
      this.showToast(`${product.name} added to wishlist`);
      this.triggerPlantingAnimation(button);
    }

    this._saveWishlist();
    const hasItems = this.state.wishlist.length > 0;
    this.dom.wishlistBtn.classList.toggle('has-active-filters', hasItems);
  }

  handleRemoveFromWishlist(productId) {
    const index = this.state.wishlist.indexOf(productId);
    if (index > -1) {
      this.state.wishlist.splice(index, 1);
      this._saveWishlist();
      this.renderWishlistModal(); 

      const productCardBtn = this.dom.productList.querySelector(`[data-wishlist="${productId}"]`);
      if (productCardBtn) {
        productCardBtn.classList.remove('active');
      }

      const hasItems = this.state.wishlist.length > 0;
      this.dom.wishlistBtn.classList.toggle('has-active-filters', hasItems);
    }
  }

  handleClearWishlistRequest() {
    if (this.state.wishlist.length === 0) {
      this.showToast("Wishlist is already empty");
      return;
    }
    this.openConfirmModal('Clear Wishlist', 'Are you sure you want to remove all items from your wishlist?', () => {
      this.state.wishlist = [];
      this._saveWishlist();
      this.renderWishlistModal();

      this.dom.productList.querySelectorAll('.wishlist-btn.active').forEach(btn => {
        btn.classList.remove('active');
      });

      this.dom.wishlistBtn.classList.remove('has-active-filters');
    });
  }

  openModal(modalElement) {
    if (!modalElement) return;
    modalElement.style.display = 'flex';
    modalElement.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    // Use a timeout to allow the display property to apply before adding the animation class
    setTimeout(() => modalElement.classList.add('is-open'), 10);
  }

  closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('is-open');
    modalElement.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    // Wait for the animation to finish before hiding the element
    setTimeout(() => modalElement.style.display = 'none', 300);
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-mode');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) { 
        document.body.classList.toggle('dark-mode', e.matches);
      }
    });
  }

  _applyReduceMotion(isReduced) {
    document.body.classList.toggle('reduce-motion', isReduced);
    this.dom.reduceMotionToggle.checked = isReduced;
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  _loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    this.state.currentCategory = params.get('category') || 'all';
    this.state.sort = params.get('sort') || 'default';
    this.state.currentPage = parseInt(params.get('page'), 10) || 1;
    const productId = params.get('product');
    if (productId) {
      this.openProductModal(productId);
    }
  }

  _updateUIFromState() {
    const params = new URLSearchParams(window.location.search);
    this.dom.searchInput.value = params.get('q') || '';

    this.dom.categoryFilters.querySelector('.active')?.classList.remove('active');
    this.dom.categoryFilters.querySelector(`[data-category="${this.state.currentCategory}"]`)?.classList.add('active');

    this.dom.sortOptions.value = this.state.sort;
  }
  _updateSettingsUI() {
    this.dom.currencySelect.value = this.state.currency;
    this.dom.themeToggleSwitch.checked = document.body.classList.contains('dark-mode');
    this.dom.reduceMotionToggle.checked = this.state.userSettings.reduceMotion;
    this.dom.savedCustomerPhone.value = this.state.userSettings.address.phone || '';
    this.dom.savedCustomerAddress.value = this.state.userSettings.address.address || '';
    this.renderOrdersPanel();
    this.dom.emailPromoToggle.checked = this.state.userSettings.notifications.emailPromo;
    this.dom.orderUpdatesToggle.checked = this.state.userSettings.notifications.orderUpdates;

  }
  _updateFilterIndicator() {
    const { minPrice, maxPrice, inStockOnly, onSaleOnly } = this.state.filters;
    const isActive = minPrice || maxPrice || inStockOnly || onSaleOnly;
    this.dom.settingsBtn.classList.toggle('has-active-filters', isActive);
    const hasWishlistItems = this.state.wishlist.length > 0;
    this.dom.wishlistBtn.classList.toggle('has-active-filters', hasWishlistItems);
  }


  _updateURL() {
    const params = new URLSearchParams();
    if (this.state.currentCategory !== 'all') params.set('category', this.state.currentCategory);
    if (this.state.sort !== 'default') params.set('sort', this.state.sort);
    if (this.state.currentPage > 1) params.set('page', this.state.currentPage);
    
    const searchQuery = this.dom.searchInput.value.trim();
    if (searchQuery) params.set('q', searchQuery);

    if (this.state.modalProduct) {
      params.set('product', this.state.modalProduct.id);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' : ''}${params.toString()}`;
    history.pushState({}, '', newUrl);
  }
  _saveCart() {
    localStorage.setItem('bloomeryCart', JSON.stringify(this.state.cart));
  }

  _loadCart() {
    const savedCart = localStorage.getItem('bloomeryCart');
    if (savedCart) {
      try {
        this.state.cart = JSON.parse(savedCart);
      } catch (e) {
        console.error("Could not parse cart from localStorage", e);
        this.state.cart = {}; 
      }
    }
  }

  _saveWishlist() {
    localStorage.setItem('plantShopWishlist', JSON.stringify(this.state.wishlist));
  }

  _loadWishlist() {
    const savedWishlist = localStorage.getItem('plantShopWishlist');
    if (savedWishlist) {
      try {
        this.state.wishlist = JSON.parse(savedWishlist);
      } catch (e) {
        console.error("Could not parse wishlist from localStorage", e);
        this.state.wishlist = [];
      }
    }
  }

  _updatePopularity(productId, quantity) {
    this.state.popularity[productId] = (this.state.popularity[productId] || 0) + quantity;
    this._savePopularity();
  }

  _savePopularity() {
    localStorage.setItem('popularity', JSON.stringify(this.state.popularity));
  }

  _saveOrders() {
    localStorage.setItem('plantShopOrders', JSON.stringify(this.state.orders));
  }

  _loadOrders() {
    const savedOrders = localStorage.getItem('plantShopOrders');
    if (savedOrders) {
      try {
        this.state.orders = JSON.parse(savedOrders);
      } catch (e) {
        console.error("Could not parse orders from localStorage", e);
        this.state.orders = [];
      }
    }
  }

  _loadPopularity() {
    const saved = localStorage.getItem('popularity');
    if (saved) this.state.popularity = JSON.parse(saved);
  }

  _loadUserSettings() {
    const savedSettings = localStorage.getItem('plantShopUserSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        this.state.userSettings = { ...this.state.userSettings, ...parsed };
        this.state.currency = this.state.userSettings.currency || 'INR';
        this._applyReduceMotion(this.state.userSettings.reduceMotion);
      } catch (e) {
        console.error("Could not parse user settings from localStorage", e);
      }
    }
  }

  _saveUserSettings() {
    this.state.userSettings.currency = this.state.currency;
    localStorage.setItem('plantShopUserSettings', JSON.stringify(this.state.userSettings));
  }

  _addRecentlyViewed(productId) {
    const index = this.state.recentlyViewed.indexOf(productId);
    if (index > -1) {
      this.state.recentlyViewed.splice(index, 1);
    }
    this.state.recentlyViewed.unshift(productId);
    if (this.state.recentlyViewed.length > 4) {
      this.state.recentlyViewed.pop();
    }
    localStorage.setItem('recentlyViewed', JSON.stringify(this.state.recentlyViewed));
    this.renderRecentlyViewed();
  }

  _loadRecentlyViewed() {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) this.state.recentlyViewed = JSON.parse(saved);
  }

  _initScrollAnimations() {
    this.scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  _animateFlyToCart(startElement) {
    if (this.state.userSettings.reduceMotion) return; const productCard = startElement.closest('.card');
    if (!productCard) return;

    const imgToClone = productCard.querySelector('.thumb img');
    if (!imgToClone) return;

    const startRect = imgToClone.getBoundingClientRect();
    const endRect = this.dom.openCartBtn.getBoundingClientRect();

    const flyingEl = imgToClone.cloneNode(true);
    flyingEl.classList.add('fly-to-cart');

    flyingEl.style.top = `${startRect.top}px`;
    flyingEl.style.left = `${startRect.left}px`;
    flyingEl.style.width = `${startRect.width}px`;
    flyingEl.style.height = `${startRect.height}px`;

    document.body.appendChild(flyingEl);
    requestAnimationFrame(() => {
      flyingEl.style.top = `${endRect.top + endRect.height / 4}px`;
      flyingEl.style.left = `${endRect.left + endRect.width / 4}px`;
      flyingEl.style.width = '0px';
      flyingEl.style.height = '0px';
      flyingEl.style.opacity = '0';
    });

    flyingEl.addEventListener('transitionend', () => {
      flyingEl.remove();
    }, { once: true });
  }
  escapeHtml(text) {
    return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  _debounce(func, delay, immediate = false) {
    let timeout;
    return (...args) => {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
      if (callNow) func.apply(this, args);
    };
  }

  showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      bottom: 96px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(0,0,0,0.76);
      color: white;
      z-index: 9999;
      transition: opacity 220ms;
    `;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = 0; }, 900);
    setTimeout(() => t.remove(), 1300);
  }

  triggerFallingAnimation() {
    if (this.state.userSettings.reduceMotion) return;
    const elements = ['🌸', '🍃', '🌿', '🌷', '🌼', '🍀'];
    const count = 30; 
  
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'falling-element';
      el.textContent = elements[Math.floor(Math.random() * elements.length)];

      const duration = Math.random() * 3 + 2; 
      const delay = Math.random() * 2; 
      const startX = Math.random() * 100; 
      const fontSize = Math.random() * 16 + 14; 
  
      el.style.left = `${startX}vw`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;
      el.style.fontSize = `${fontSize}px`;
  
      document.body.appendChild(el);
        setTimeout(() => { el.remove(); }, (duration + delay) * 1000);
    }
  }

  triggerPlantingAnimation(targetElement) {
    if (this.state.userSettings.reduceMotion) return;
    const elements = ['🌱', '🌿', '🍃'];
    const count = 5; 
    const rect = targetElement.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'planting-sprout';
      el.textContent = elements[Math.floor(Math.random() * elements.length)];
      const duration = Math.random() * 1.5 + 0.8; 
      const delay = Math.random() * 0.2; 
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      const endX = (Math.random() - 0.5) * 100; 
      const endY = -(Math.random() * 60 + 40); 

      el.style.setProperty('--start-x', `${startX}px`);
      el.style.setProperty('--start-y', `${startY}px`);
      el.style.setProperty('--end-x-translate', `${endX}px`);
      el.style.setProperty('--end-y-translate', `${endY}px`);
      el.style.animation = `grow-out ${duration}s ease-out ${delay}s forwards`;
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, (duration + delay) * 1000);
    }
  }

  handleBackToTopVisibility() {
    if (window.scrollY > 400) {
      this.dom.backToTopBtn.classList.add('is-visible');
    } else {
      this.dom.backToTopBtn.classList.remove('is-visible');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  triggerCartAnimation(targetElement) {
    if (this.state.userSettings.reduceMotion) return;
    const elements = ['🌸', '🍃', '🌿', '🌷'];
    const count = 4;
    const rect = targetElement.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'cart-drop-element';
      el.textContent = elements[Math.floor(Math.random() * elements.length)];

      const duration = Math.random() * 0.8 + 0.5; 
      const delay = Math.random() * 0.3;

      const startX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 30;
      const startY = rect.top - 20;

      el.style.setProperty('--start-x', `${startX}px`);
      el.style.setProperty('--start-y', `${startY}px`);
      el.style.animation = `drop-into-cart ${duration}s ease-in ${delay}s forwards`;

      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, (duration + delay) * 1000);
    }
  }

  _checkLoginStatus() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      document.body.classList.remove('logged-out');
      this.dom.loginPage.classList.add('hidden');
    } else {
      document.body.classList.add('logged-out');
      this.dom.loginPage.classList.remove('hidden');
    }
  }

  _initTreeAnimation() {
    if (this.state.userSettings.reduceMotion) return;

    const leafContainer = document.querySelector('#growingTree .leaves');
  }

  handleLogin(e) {
    e.preventDefault();
    const username = this.dom.usernameInput.value.trim();
    if (username) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      this.state.username = username;
      this.dom.loginPage.classList.add('hidden');
      document.body.classList.remove('logged-out');
      this.showToast(`Welcome, ${this.escapeHtml(username)}!`);
    }
  }

  handleLogout() {
    this.openConfirmModal(
      'Logout',
      'Are you sure you want to log out?',
      () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.reload();
      }
    );
  }

  _loadUsername() {
    const username = localStorage.getItem('username');
    if (username) {
      this.state.username = username;
    }
  }

}
document.addEventListener('DOMContentLoaded', () => {
  new PlantShopApp();
});