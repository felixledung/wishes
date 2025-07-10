document.addEventListener("DOMContentLoaded", function () {
    const productContainer = document.querySelector(".product-list");
    const isProductDetailPage = document.querySelector(".product-detail");
    const isCartPage = document.querySelector(".cart");

    if (productContainer) {
        displayProducts();
        sortProduct();
    } else if (isProductDetailPage) {
        displayProductDetail();
    } else if (isCartPage) {
        displayCart();
    }

    function displayProducts() {
        productContainer.innerHTML = "";
        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <div class="img-box">
                    <img src="${product.colors[0].mainImage}" alt="${product.title}">
                </div>
                <h2 class="title">${product.title}</h2>
                <span class="price">${product.price}</span>
            `;
            productContainer.appendChild(productCard);

            const imgBox = productCard.querySelector(".img-box");
            imgBox.addEventListener("click", () => {
                sessionStorage.setItem("selectedProduct", JSON.stringify(product));
                window.location.href = "product-detail.html";
            });
        });
    }

    function displayProductDetail() {
        const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));

        const titleEl = document.querySelector(".title");
        const priceEl = document.querySelector(".price");
        const descriptionEl = document.querySelector(".description");
        const mainImageContainer = document.querySelector(".main-img");
        const thumbnailContainer = document.querySelector(".thumbnail-list");
        const colorContainer = document.querySelector(".color-options");
        const sizeContainer = document.querySelector(".size-options");
        const addToCartBtn = document.querySelector("#add-cart-btn");

        let selectedColor = productData.colors[0];
        let selectedSize = selectedColor.sizes[0];

        function updateProductDisplay(colorData) {
            if (!colorData.sizes.includes(selectedSize)) {
                selectedSize = colorData.sizes[0];
            }

            mainImageContainer.innerHTML = `<img src="${colorData.mainImage}">`;

            thumbnailContainer.innerHTML = "";
            const allThumbnails = [colorData.mainImage].concat(colorData.thumbnails.slice(0, 3));
            allThumbnails.forEach(thumb => {
                const img = document.createElement("img");
                img.src = thumb;
                thumbnailContainer.appendChild(img);
                img.addEventListener("click", () => {
                    mainImageContainer.innerHTML = `<img src="${thumb}">`;
                });
            });

            colorContainer.innerHTML = "";
            productData.colors.forEach(color => {
                const img = document.createElement("img");
                img.src = color.mainImage;
                if (color.name === colorData.name) img.classList.add("selected");
                colorContainer.appendChild(img);

                img.addEventListener("click", () => {
                    selectedColor = color;
                    updateProductDisplay(color);
                });
            });

            sizeContainer.innerHTML = "";
            colorData.sizes.forEach(size => {
                const btn = document.createElement("button");
                btn.textContent = size;
                if (size === selectedSize) btn.classList.add("selected");

                sizeContainer.appendChild(btn);

                btn.addEventListener("click", () => {
                    document.querySelectorAll(".size-options button").forEach(el => el.classList.remove("selected"));
                    btn.classList.add("selected");
                    selectedSize = size;
                });
            });
        }

        titleEl.textContent = productData.title;
        priceEl.textContent = productData.price;
        descriptionEl.textContent = productData.description;

        updateProductDisplay(selectedColor);

        addToCartBtn.addEventListener("click", () => {
            addToCart(productData, selectedColor, selectedSize);
        });
    }

    function addToCart(product, color, size) {
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

        const existingItem = cart.find(item =>
            item.id === product.id &&
            item.color === color.name &&
            item.size === size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: color.mainImage,
                color: color.name,
                size: size,
                quantity: 1
            });
        }

        sessionStorage.setItem("cart", JSON.stringify(cart));
        updateCartBadge();
    }

    function displayCart() {
        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

        const cartItemsContainer = document.querySelector(".cart-items");
        const subtotalEl = document.querySelector(".subtotal");
        const grandTotalEl = document.querySelector(".grand-total");

        if (!cartItemsContainer || !subtotalEl || !grandTotalEl) {
            console.error("Ett eller flera element saknas i DOM: .cart-items, .subtotal eller .grand-total");
            return;
        }

        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
            subtotalEl.textContent = "0 SEK";
            grandTotalEl.textContent = "0 SEK";
            return;
        }

        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemPrice = extractPrice(item.price);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
            <div class="product">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-detail">
                    <p>${item.title}</p>
                    <div class="size-color-box">
                        <span class="size">${item.size}</span>
                        <div class="color">${item.color}</div>
                    </div>
                </div>
            </div>
            <span class="price">${formatPrice(itemPrice)}</span>
            <div class="quantity">
                <input type="number" value="${item.quantity}" min="1" data-index="${index}">
            </div>
            <button class="remove" data-index="${index}">
                <i class="ri-close-line"></i>
            </button>
        `;
            cartItemsContainer.appendChild(cartItem);
        });

        subtotalEl.textContent = `${formatPrice(subtotal)} SEK`;
        grandTotalEl.textContent = `${formatPrice(subtotal)} SEK`; // Du kan lägga till frakt om du vill

        removeCartItem();
        updateCartQuantity();
    }

    function removeCartItem() {
        document.querySelectorAll(".remove").forEach(button => {
            button.addEventListener("click", function () {
                let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
                const index = button.getAttribute("data-index");
                cart.splice(index, 1);
                sessionStorage.setItem("cart", JSON.stringify(cart));
                displayCart();
                updateCartBadge();
            });
        });
    }

    function updateCartQuantity() {
        document.querySelectorAll(".quantity input").forEach(function (input) {
            input.addEventListener("change", function () {
                let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
                const index = input.getAttribute("data-index");
                const value = Math.max(1, parseInt(input.value));
                cart[index].quantity = value;
                sessionStorage.setItem("cart", JSON.stringify(cart));
                displayCart();
                updateCartBadge();
            });
        });
    }

    function updateCartBadge() {
        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const badge = document.querySelector(".cart-item-count");

        if (badge) {
            if (cartCount > 0) {
                badge.textContent = cartCount;
                badge.style.display = "block";
            } else {
                badge.style.display = "none";
            }
        }
    }

    updateCartBadge();

    function sortProduct() {
        const sortAlphaForward = document.querySelector(".sortBtn.az");
        const sortAlphaBackward = document.querySelector(".sortBtn.za");
        const sortLowestPrice = document.querySelector(".sortBtn.priceLow");
        const sortHighestPrice = document.querySelector(".sortBtn.priceHigh");

        if (!sortAlphaForward || !sortAlphaBackward || !sortLowestPrice || !sortHighestPrice) return;

        sortAlphaForward.addEventListener("click", () => {
            products.sort((a, b) => a.title.localeCompare(b.title));
            displayProducts();
        });

        sortAlphaBackward.addEventListener("click", () => {
            products.sort((a, b) => b.title.localeCompare(a.title));
            displayProducts();
        });

        sortLowestPrice.addEventListener("click", () => {
            products.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
            displayProducts();
        });

        sortHighestPrice.addEventListener("click", () => {
            products.sort((a, b) => extractPrice(b.price) - extractPrice(a.price));
            displayProducts();
        });
    }

    function extractPrice(priceStr) {
        return parseFloat(priceStr.replace(/\s|kr|SEK/g, "").replace(",", "."));
    }

    // Dropdown toggle
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener("click", () => {
            dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", (e) => {
            if (!document.querySelector(".dropdown").contains(e.target)) {
                dropdownMenu.style.display = "none";
            }
        });

        document.querySelectorAll(".sortBtn").forEach(button => {
            button.addEventListener("click", () => {
                console.log("Vald sortering:", button.className.replace("sortBtn", "").trim());
                dropdownMenu.style.display = "none";
            });
        });
    }

    function formatPrice(number) {
        return number.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
});