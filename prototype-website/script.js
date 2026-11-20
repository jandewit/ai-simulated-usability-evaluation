const products = [
  { id: 1, brand: "Apple", name: "MacBook Air 13”", specs: "2020 · M1 · 8GB RAM · 256GB SSD", price: 599, oldPrice: 999, tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
  { id: 2, brand: "Lenovo", name: "ThinkPad X1 Carbon", specs: "2020 · Intel i5 · 16GB RAM · 256GB SSD", price: 449, oldPrice: 899, tag: "GREAT VALUE", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
  { id: 3, brand: "Apple", name: "MacBook Pro 13”", specs: "2020 · Intel i5 · 8GB RAM · 512GB SSD", price: 649, oldPrice: 1299, tag: "JUST IN", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
  { id: 4, brand: "Dell", name: "Dell XPS 13", specs: "2021 · Intel i7 · 16GB RAM · 512GB SSD", price: 579, oldPrice: 1099, tag: "GREAT VALUE", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" }
];

const cart = new Map();
const productsElement = document.querySelector("#products");
const overlay = document.querySelector("#overlay");
const cartView = document.querySelector("#cart-view");
const checkoutView = document.querySelector("#checkout-view");
const checkoutForm = document.querySelector("#checkout-form");
let filter = "All";
let lastFocused = null;

const money = amount => `$${amount.toLocaleString("en-US")}`;

function renderProducts() {
  const sort = document.querySelector("#sort").value;
  const visible = products.filter(product => filter === "All" || product.brand === filter);
  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  productsElement.innerHTML = visible.map(product => `
    <article class="product">
      <div class="product-image" style="background-image:url('${product.image}')"><span class="product-tag ${product.tag === "BESTSELLER" ? "green" : ""}">${product.tag}</span></div>
      <div class="product-info"><div class="product-brand">${product.brand}</div><h3 class="product-title">${product.name}</h3><p class="product-specs">${product.specs}</p>
        <div class="product-bottom"><div><span class="price">${money(product.price)}</span><span class="old-price">${money(product.oldPrice)}</span></div><button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></div>
      </div>
    </article>`).join("");
}

function renderCart() {
  let count = 0;
  let total = 0;
  const items = [];
  for (const [id, quantity] of cart) {
    const product = products.find(item => item.id === id);
    count += quantity;
    total += product.price * quantity;
    items.push(`<div class="cart-item"><img class="cart-item-image" src="${product.image}" alt=""><div class="cart-item-details"><h3>${product.name}</h3><p>${product.specs}</p><strong>${money(product.price)}</strong><div class="quantity"><button type="button" data-change="${id}" data-delta="-1" aria-label="Remove one ${product.name}">−</button><span>${quantity}</span><button type="button" data-change="${id}" data-delta="1" aria-label="Add one ${product.name}">+</button></div></div></div>`);
  }
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-total").textContent = money(total);
  document.querySelector("#checkout-total").textContent = money(total);
  document.querySelector("#cart-items").innerHTML = items.length ? items.join("") : '<p class="empty-cart">Your bag is waiting for something good.<br>Find a laptop you love and give it another life.</p>';
  document.querySelector("#checkout-button").disabled = count === 0;
}

function showCart() {
  cartView.hidden = false;
  checkoutView.hidden = true;
  document.querySelector("#drawer-title").firstChild.textContent = "Your bag ";
}

function openCart() {
  lastFocused = document.activeElement;
  showCart();
  renderCart();
  overlay.hidden = false;
  document.body.classList.add("drawer-open");
  document.querySelector("#close-drawer").focus();
}

function closeCart() {
  overlay.hidden = true;
  document.body.classList.remove("drawer-open");
  if (lastFocused && lastFocused.isConnected) lastFocused.focus();
}

document.querySelector(".filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  filter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});
document.querySelector("#sort").addEventListener("change", renderProducts);
productsElement.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = Number(button.dataset.add);
  cart.set(id, (cart.get(id) || 0) + 1);
  openCart();
});
document.querySelector("#cart-items").addEventListener("click", event => {
  const button = event.target.closest("[data-change]");
  if (!button) return;
  const id = Number(button.dataset.change);
  const quantity = cart.get(id) + Number(button.dataset.delta);
  if (quantity <= 0) cart.delete(id);
  else cart.set(id, quantity);
  renderCart();
});
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-drawer").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
overlay.addEventListener("click", event => { if (event.target === overlay) closeCart(); });
document.addEventListener("keydown", event => {
  if (overlay.hidden) return;
  if (event.key === "Escape") closeCart();
  if (event.key === "Tab") {
    const focusable = [...overlay.querySelectorAll("button:not(:disabled), input, select, a[href]")].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
document.querySelector("#checkout-button").addEventListener("click", () => {
  cartView.hidden = true;
  checkoutView.hidden = false;
  document.querySelector("#drawer-title").firstChild.textContent = "Checkout ";
  document.querySelector("#checkout-form input").focus();
});
document.querySelector("#back-to-cart").addEventListener("click", showCart);
checkoutForm.addEventListener("submit", event => {
  event.preventDefault();
  checkoutView.querySelector(".checkout-body").scrollTop = 0;
});

renderProducts();
renderCart();
