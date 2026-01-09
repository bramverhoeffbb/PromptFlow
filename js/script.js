document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-sm');
            navbar.style.padding = '0.5rem 0';
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.style.padding = '1rem 0';
            navbar.style.background = 'rgba(15, 23, 42, 0.9)';
        }
    });

    // Back to top button
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Don't prevent default for # links that don't have a corresponding element
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
                
                // Scroll to the target element
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });

    // Add animation to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.fade-in-up');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles for fade-in-up elements
    document.querySelectorAll('.fade-in-up').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run once on load
    animateOnScroll();
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Add animation to pricing cards on hover
    const pricingCards = document.querySelectorAll('.card');
    
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
        });
    });

    // Form submission handling
    const contactForm = document.querySelector('form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Add animation to navbar items on hover
    const navLinksHover = document.querySelectorAll('.nav-link');
    
    navLinksHover.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add loading animation to buttons on click
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.getAttribute('type') === 'submit' || this.classList.contains('add-to-cart')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
                this.disabled = true;
                
                // Reset button after 3 seconds (simulating form submission)
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 3000);
            }
        });
    });

    // ==========================
    // Cart functionality
    // ==========================
    const CART_KEY = 'promptflow_cart_v1';
    const cartCountEl = document.getElementById('cartCount');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function formatEuro(n) {
        return `€${Number(n).toFixed(0)}`;
    }

    function getTotal(cart) {
        return cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    }

    function updateCartBadge(cart) {
        if (!cartCountEl) return;
        const count = cart.reduce((sum, it) => sum + it.qty, 0);
        cartCountEl.textContent = count;
    }

    function renderCart(cart) {
        if (!cartItemsEl || !cartTotalEl) return;
        cartItemsEl.innerHTML = '';
        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<div class="text-center text-muted py-4">Your cart is empty</div>';
        } else {
            cart.forEach(item => {
                const row = document.createElement('div');
                row.className = 'list-group-item d-flex justify-content-between align-items-center';
                row.innerHTML = `
                    <div>
                        <div class="fw-semibold">${item.name}</div>
                        <small class="text-muted">${formatEuro(item.price)} x ${item.qty}</small>
                    </div>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-secondary cart-decrease" data-id="${item.id}">-</button>
                        <button class="btn btn-outline-secondary cart-increase" data-id="${item.id}">+</button>
                        <button class="btn btn-outline-danger cart-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItemsEl.appendChild(row);
            });
        }
        cartTotalEl.textContent = formatEuro(getTotal(cart));
        updateCartBadge(cart);
    }

    function addItem(product) {
        const cart = loadCart();
        const existing = cart.find(it => it.id === product.id);
        if (existing) existing.qty += 1; else cart.push({ ...product, qty: 1 });
        saveCart(cart);
        renderCart(cart);
    }

    function changeQty(id, delta) {
        const cart = loadCart();
        const item = cart.find(it => it.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                const idx = cart.findIndex(it => it.id === id);
                cart.splice(idx, 1);
            }
            saveCart(cart);
            renderCart(cart);
        }
    }

    function removeItem(id) {
        const cart = loadCart().filter(it => it.id !== id);
        saveCart(cart);
        renderCart(cart);
    }

    // Wire up product buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const { id, name, price } = btn.dataset;
            const product = {
                id: id || btn.closest('.card')?.querySelector('h4')?.textContent?.toLowerCase().replace(/\s+/g,'-') || `p-${Date.now()}`,
                name: name || btn.closest('.card')?.querySelector('h4')?.textContent || 'Product',
                price: price ? Number(price) : Number((btn.closest('.card')?.querySelector('h3')?.textContent || '0').replace(/[^0-9,.]/g,'').replace(',','.'))
            };
            addItem(product);

            // Toast feedback
            const toast = document.createElement('div');
            toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');
            toast.setAttribute('aria-atomic', 'true');
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-check-circle me-2"></i>
                        ${product.name} added to cart!
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>`;
            document.body.appendChild(toast);
            new bootstrap.Toast(toast, { autohide: true, delay: 2000 }).show();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        });
    });

    // Offcanvas cart actions
    if (cartItemsEl) {
        cartItemsEl.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.getAttribute('data-id');
            if (!id) return;
            if (target.classList.contains('cart-increase')) changeQty(id, +1);
            else if (target.classList.contains('cart-decrease')) changeQty(id, -1);
            else if (target.classList.contains('cart-remove')) removeItem(id);
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            saveCart([]);
            renderCart([]);
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = loadCart();
            if (cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    // Initialize cart UI on load
    renderCart(loadCart());

    // Initialize AOS (Animate On Scroll) if included
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Handle newsletter subscription
    const newsletterForm = document.querySelector('form[action*="newsletter"]');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && validateEmail(email)) {
                // Here you would typically send the email to your server
                console.log('Subscribed with email:', email);
                
                // Show success message
                alert('Thank you for subscribing to our newsletter!');
                this.reset();
            } else {
                // Show error message
                alert('Please enter a valid email address.');
                emailInput.focus();
            }
        });
    }

    // Email validation helper function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Lazy loading for images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // Add active class to current nav item
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');
    
    function onScroll() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navItems.forEach(navItem => {
                    navItem.classList.remove('active');
                    if (navItem.getAttribute('href') === `#${sectionId}`) {
                        navItem.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', onScroll);
    
    // Run once on page load
    onScroll();
});
