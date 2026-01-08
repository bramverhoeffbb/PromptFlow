document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'promptflow_cart_v1';
  // Fill these with your EmailJS credentials
  const EMAILJS_SERVICE_ID = 'service_rh9wjpo';
  const EMAILJS_TEMPLATE_ID = 'template_mjzphuz';
  const summaryItemsEl = document.getElementById('summaryItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const vatEl = document.getElementById('summaryVat');
  const totalEl = document.getElementById('summaryTotal');
  const form = document.getElementById('checkoutForm');
  const successBox = document.getElementById('checkoutSuccess');
  const orderRefEl = document.getElementById('orderRef');

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function euro(n) {
    return `€${Number(n).toFixed(0)}`;
  }
  function computeSubtotal(cart) {
    return cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  }
  function render() {
    const cart = loadCart();
    summaryItemsEl.innerHTML = '';
    if (cart.length === 0) {
      summaryItemsEl.innerHTML = '<div class="text-center text-muted py-4">Your cart is empty. <a href="index.html#products">Go back</a>.</div>';
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-group-item d-flex justify-content-between align-items-center';
        row.innerHTML = `
          <div>
            <div class="fw-semibold">${item.name}</div>
            <small class="text-muted">${euro(item.price)} x ${item.qty}</small>
          </div>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary q-dec" data-id="${item.id}">-</button>
            <button class="btn btn-outline-secondary q-inc" data-id="${item.id}">+</button>
            <button class="btn btn-outline-danger q-rem" data-id="${item.id}"><i class="fas fa-trash"></i></button>
          </div>`;
        summaryItemsEl.appendChild(row);
      });
    }
    const subtotal = computeSubtotal(cart);
    const vat = 0; // Adjust if you want VAT
    const total = subtotal + vat;
    subtotalEl.textContent = euro(subtotal);
    vatEl.textContent = euro(vat);
    totalEl.textContent = euro(total);
  }

  // Quantity controls
  summaryItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const cart = loadCart();
    const item = cart.find(it => it.id === id);
    if (!item) return;
    if (btn.classList.contains('q-inc')) item.qty += 1;
    else if (btn.classList.contains('q-dec')) item.qty = Math.max(0, item.qty - 1);
    else if (btn.classList.contains('q-rem')) item.qty = 0;
    if (item.qty === 0) {
      const idx = cart.findIndex(it => it.id === id);
      cart.splice(idx, 1);
    }
    saveCart(cart);
    render();
  });

  // Form submission (demo)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = loadCart();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    const first = document.getElementById('firstName').value.trim();
    const last = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!first || !last || !email) {
      alert('Please fill in your name and email.');
      return;
    }
    // Create order reference
    const ref = 'PF-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    orderRefEl.textContent = ref;

    // Build items (text and HTML)
    const itemsList = cart
      .map(it => `• ${it.name} — €${Number(it.price).toFixed(0)} x ${it.qty}`)
      .join('\n');
    const itemsListHtml = cart.map(it => `
      <tr>
        <td style="padding:8px 0; color:#334155;">${it.name}</td>
        <td style="padding:8px 0; color:#334155;" align="right">€${Number(it.price).toFixed(0)} × ${it.qty}</td>
      </tr>
    `).join('');
    const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
    const total = subtotal; // adjust VAT if needed

    // Attempt to send via EmailJS if configured
    const canEmail = typeof emailjs !== 'undefined' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

    const payload = {
      // Recipient
      to_email: email,
      to_name: `${first} ${last}`,
      reply_to: email,

      // Order info
      customer_name: `${first} ${last}`,
      order_ref: ref,
      order_items: itemsList,
      order_items_html: itemsListHtml,
      order_total: `€${Number(total).toFixed(0)}`,
      year: new Date().getFullYear()
    };

    const finalizeSuccess = () => {
      // Clear cart
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      render();
      // Show success
      successBox.classList.remove('d-none');
      successBox.scrollIntoView({ behavior: 'smooth' });
    };

    if (canEmail) {
      // Disable submit button to prevent double clicks
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...'; }

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload)
        .then(() => {
          finalizeSuccess();
        })
        .catch((err) => {
          console.error('EmailJS error:', err);
          const msg = (err && (err.text || err.message)) ? String(err.text || err.message) : 'Unknown error';
          alert('Order placed, but email sending failed. Details: ' + msg + '\n\nCheck: service ID, template ID, template variables, and allowed origins in EmailJS settings.');
          finalizeSuccess();
        })
        .finally(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Place Order'; }
        });
    } else {
      // Fallback if EmailJS not configured yet
      alert('Demo: configure EmailJS to send the order email automatically. Proceeding to success state.');
      finalizeSuccess();
    }
  });

  // Initial
  render();
});
