// Initialize arrays for favorites and cart
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop();

    console.log('Page loaded:', page);

    if (page === 'index.html' || page === '') {
        loadCategories('home');
        // loadFeaturedProducts('home');
        const advertisingImage = document.getElementById('advertising-image');
        advertisingImage.addEventListener('click', function() {
            loadCategoryProducts('kitchen-accessories');
            setActiveCategory(document.querySelector('#home-category-menu li:first-child'), document.getElementById('home-category-menu'));
            advertisingImage.style.display = 'none';
        });
    } else if (page === 'women.html') {
        loadCategories('women');
        // loadFeaturedProducts('women');

        const advertisingImage = document.getElementById('advertising-image');
        advertisingImage.addEventListener('click', function() {
            loadCategoryProducts('womens-dresses');
            setActiveCategory(document.querySelector('#women-category-menu li:first-child'), document.getElementById('women-category-menu'));
            advertisingImage.style.display = 'none';
        });
        
    } else if (page === 'men.html') {
        loadCategories('men');
        // loadFeaturedProducts('men');
        const advertisingImage = document.getElementById('advertising-image');
        advertisingImage.addEventListener('click', function() {
            loadCategoryProducts('mens-shirts');
            setActiveCategory(document.querySelector('#men-category-menu li:first-child'), document.getElementById('men-category-menu'));
            advertisingImage.style.display = 'none';
        });
        
    } else if (page === 'favorites.html') {
        loadFavoriteProducts();
    } else if (page === 'product.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        loadProductDetails(productId);
    } else if (page === 'cart.html') {
        loadCartProducts();
    } else if (page === 'checkout.html') {
        loadCheckoutItems();
        initializeCheckout();
    }

    updateCartBadge(); // Update the cart badge on page load

    
});

function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartBadge.innerText = totalItems;
        cartBadge.style.display = 'inline-block';
    } else {
        cartBadge.style.display = 'none';
    }
}

function initializeCheckout() {
    document.getElementById('add-address-button').addEventListener('click', showAddressForm);
    document.getElementById('save-address-button').addEventListener('click', saveAddress);
    document.getElementById('cancel-address-button').addEventListener('click', hideAddressForm);
    document.getElementById('change-address-button').addEventListener('click', showAddressForm);
    document.getElementById('change-card-button').addEventListener('click', showCardForm);

    loadAddress();
    loadCardDetails();

    }

function showAddressForm() {
    document.getElementById('address-form').style.display = 'block';
    document.getElementById('saved-address').style.display = 'none';
    document.getElementById('add-address-button').style.display = 'none';
}

function hideAddressForm() {
    document.getElementById('address-form').style.display = 'none';
    document.getElementById('saved-address').style.display = 'block';
    document.getElementById('add-address-button').style.display = 'block';
}

function saveAddress() {
    const addressDetails = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        mobile: document.getElementById('mobile').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        county: document.getElementById('county').value,
        postcode: document.getElementById('postcode').value,
        country: document.getElementById('country').value
    };

    localStorage.setItem('addressDetails', JSON.stringify(addressDetails));
    displaySavedAddress(addressDetails);
    hideAddressForm();
}

function loadAddress() {
    const addressDetails = JSON.parse(localStorage.getItem('addressDetails'));
    if (addressDetails) {
        displaySavedAddress(addressDetails);
        hideAddressForm();
    } else {
        showAddressForm();
    }
}

function displaySavedAddress(addressDetails) {
    const addressText = `
        ${addressDetails.firstName} ${addressDetails.lastName}<br>
        ${addressDetails.address}<br>
        ${addressDetails.city}<br>
        ${addressDetails.county}<br>
        ${addressDetails.postcode}<br>
        ${addressDetails.country}<br>
        ${addressDetails.mobile}
    `;
    document.getElementById('saved-address-details').innerHTML = addressText;
    document.getElementById('saved-address').style.display = 'block';
    document.getElementById('address-form').style.display = 'none';
    document.getElementById('add-address-button').style.display = 'none';
}

function showCardForm() {
    document.getElementById('payment-form').style.display = 'block';
    document.getElementById('saved-card').style.display = 'none';
}

function saveCardDetails() {
    const cardDetails = {
        cardNumber: document.getElementById('card-number').value,
        expiryMonth: document.getElementById('expiry-month').value,
        expiryYear: document.getElementById('expiry-year').value,
        nameOnCard: document.getElementById('name-on-card').value
    };

    localStorage.setItem('cardDetails', JSON.stringify(cardDetails));
    displaySavedCard(cardDetails);
    hideCardForm();
}

function loadCardDetails() {
    const cardDetails = JSON.parse(localStorage.getItem('cardDetails'));
    if (cardDetails) {
        displaySavedCard(cardDetails);
        hideCardForm();
    }
}

function displaySavedCard(cardDetails) {
    const cardText = `
        <img src="mastercard-logo.png" alt="Mastercard Logo" style="width: 40px; height: auto;">
        Debit Mastercard (**** ${cardDetails.cardNumber.slice(-4)})<br>
        Exp: ${cardDetails.expiryMonth}/${cardDetails.expiryYear}<br>
        ${cardDetails.nameOnCard}
    `;
    document.getElementById('saved-card-details').innerHTML = cardText;
    document.getElementById('saved-card').style.display = 'block';
    document.getElementById('payment-form').style.display = 'none';
}

function hideCardForm() {
    document.getElementById('payment-form').style.display = 'none';
    document.getElementById('saved-card').style.display = 'block';
}


const categoryMap = {
    home: ['furniture', 'home-decoration','kitchen-accessories','mobile-accessories'],
    women: ['womens-dresses', 'womens-shoes', 'womens-watches', 'beauty','fragrances','sunglasses','tops','womens-jewellery'],
    men: ['mens-shirts', 'mens-shoes', 'mens-watches','sports-accessories']
};

function loadCategories(page) {
    const categories = categoryMap[page];
    let categoryMenu;

    if (page === 'home') {
        categoryMenu = document.getElementById('home-category-menu');
    } else if (page === 'women') {
        categoryMenu = document.getElementById('women-category-menu');
    } else if (page === 'men') {
        categoryMenu = document.getElementById('men-category-menu');
    }

    if (categoryMenu) {
        categories.forEach(category => {
            let li = document.createElement('li');
            li.innerText = category.replace(/-/g, ' ');
            li.onclick = () => {
                loadCategoryProducts(category);
                setActiveCategory(li, categoryMenu);
                document.querySelector('.Advertising').style.display = 'none';

            };
            categoryMenu.appendChild(li);
        });
    }
}

function setActiveCategory(selectedLi, categoryMenu) {
    const lis = categoryMenu.getElementsByTagName('li');
    for (let li of lis) {
        li.classList.remove('active');
    }
    selectedLi.classList.add('active');
}

// function loadFeaturedProducts(page) {
//     const categories = categoryMap[page];
//     let featuredProducts = document.getElementById('featured-products');

//     featuredProducts.innerHTML = '';

//     categories.forEach(category => {
//         fetch(`https://dummyjson.com/products/category/${category}`)
//             .then(response => response.json())
//             .then(data => {
//                 data.products.forEach(product => {
//                     let secondaryImage = product.images[1] ? product.images[1] : product.thumbnail;
//                     let div = document.createElement('div');
//                     div.className = 'product-card';
//                     div.innerHTML = `
//                         <a href="product.html?id=${product.id}">
//                             <div class="product-image">
//                                 <img src="${product.thumbnail}" alt="${product.title}" class="primary">
//                                 <img src="${secondaryImage}" alt="${product.title}" class="secondary">
//                             </div>
//                             <h3>${product.title}</h3>
//                             <p>$${product.price}</p>
//                         </a>
//                         <div class="favorite-icon ${favorites.includes(product.id.toString()) ? 'filled' : ''}" data-product-id="${product.id}" onclick="toggleFavorite(this, ${product.id})"><i class="far fa-heart"></i></div>
//                     `;
//                     featuredProducts.appendChild(div);
//                 });
//                 updateFavoriteIcons();
//             })
//             .catch(error => console.error('Error fetching products:', error));
//     });
// }

function loadCategoryProducts(category) {
    fetch(`https://dummyjson.com/products/category/${category}`)
        .then(response => response.json())
        .then(data => {
            let productList = document.getElementById('featured-products');
            productList.innerHTML = '';
            data.products.forEach(product => {
                let secondaryImage = product.images[1] ? product.images[1] : product.thumbnail;
                let div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <a href="product.html?id=${product.id}">
                        <div class="product-image">
                            <img src="${product.thumbnail}" alt="${product.title}" class="primary">
                            <img src="${secondaryImage}" alt="${product.title}" class="secondary">
                        </div>
                        <h3>${product.title}</h3>
                        <p>$${product.price}</p>
                    </a>
                    <div class="favorite-icon ${favorites.includes(product.id.toString()) ? 'filled' : ''}" data-product-id="${product.id}" onclick="toggleFavorite(this, ${product.id})"><i class="far fa-heart"></i></div>
                `;
                productList.appendChild(div);
            });
            updateFavoriteIcons();
            highlightActiveCategory(category);
        })
        .catch(error => console.error('Error fetching category products:', error));
}

function searchProducts() {
    let query = document.getElementById('search-bar').value;
    fetch(`https://dummyjson.com/products/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            let productList = document.getElementById('featured-products');
            productList.innerHTML = '';
            data.products.forEach(product => {
                let secondaryImage = product.images[1] ? product.images[1] : product.thumbnail;
                let div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <a href="product.html?id=${product.id}">
                        <div class="product-image">
                            <img src="${product.thumbnail}" alt="${product.title}" class="primary">
                            <img src="${secondaryImage}" alt="${product.title}" class="secondary">
                        </div>
                        <h3>${product.title}</h3>
                        <p>$${product.price}</p>
                    </a>
                    <div class="favorite-icon ${favorites.includes(product.id.toString()) ? 'filled' : ''}" data-product-id="${product.id}" onclick="toggleFavorite(this, ${product.id})"><i class="far fa-heart"></i></div>
                `;
                productList.appendChild(div);
            });
            updateFavoriteIcons();
        })
        .catch(error => console.error('Error fetching search results:', error));
}

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function loadProductDetails(productId) {
    fetch(`https://dummyjson.com/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-title').innerText = product.title;
            document.getElementById('product-description').innerText = product.description;
            document.getElementById('product-price').innerText = `$${product.price}`;
            document.getElementById('product-brand').innerText = product.brand || 'No brand';

            const mainImage = document.getElementById('main-product-image');
            mainImage.src = product.thumbnail;

            const carousel = document.getElementById('product-image-carousel');
            carousel.innerHTML = ''; // Clear previous images
            product.images.forEach((image, index) => {
                const img = document.createElement('img');
                img.src = image;
                img.alt = product.title;
                if (index === 0) {
                    img.classList.add('active');
                }
                img.addEventListener('click', function() {
                    document.querySelectorAll('#product-image-carousel img').forEach(img => img.classList.remove('active'));
                    this.classList.add('active');
                    mainImage.src = this.src;
                });
                carousel.appendChild(img);
            });

            // Update the favorite icon for the product page
            updateProductFavoriteIcon(productId);

            // Load reviews
            const reviewsContainer = document.getElementById('reviews-container');
            reviewsContainer.innerHTML = ''; // Clear previous reviews
            product.reviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'review';
                reviewDiv.innerHTML = `
                    <p><strong>${review.reviewerName}</strong> (${new Date(review.date).toLocaleDateString()}):</p>
                    <div class="stars">
                        ${getStars(review.rating)}
                    </div>
                    <p>${review.comment}</p>
                `;
                reviewsContainer.appendChild(reviewDiv);
            });

            // Add rating below price
            const productRating = document.getElementById('product-rating');
            productRating.innerHTML = `
                <div class="stars">
                    ${getStars(product.rating)}
                    <span>${product.rating} (${product.reviews.length})</span>
                </div>
            `;
        })
        .catch(error => console.error('Error fetching product details:', error));
}

function getStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star yellow-star"></i>';
        } else {
            starsHtml += '<i class="fas fa-star grey-star"></i>';
        }
    }
    return starsHtml;
}

function changeImage(direction) {
    const carouselImages = document.querySelectorAll('#product-image-carousel img');
    if (carouselImages.length === 0) return;

    currentImageIndex = (currentImageIndex + direction + carouselImages.length) % carouselImages.length;
    document.querySelectorAll('#product-image-carousel img').forEach(img => img.classList.remove('active'));
    const mainImage = document.getElementById('main-product-image');
    carouselImages[currentImageIndex].classList.add('active');
    mainImage.src = carouselImages[currentImageIndex].src;
}

function toggleFavorite(element, productId) {
    event.stopPropagation();
    productId = productId.toString(); // Convert to string to ensure consistency
    const index = favorites.indexOf(productId);
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        if (element) element.classList.remove('filled');
    } else {
        // Add to favorites
        favorites.push(productId);
        if (element) element.classList.add('filled');
    }
    localStorage.setItem('favorites', JSON.stringify([...new Set(favorites)])); // Remove duplicates
    console.log('Favorites:', favorites); // Print to console after updating favorites
    updateFavoriteIcons(); // Update icons on all pages
    updateProductFavoriteIcon(productId); // Update the product page favorite icon if applicable
}

function loadFavoriteProducts() {
    let favoriteProductsContainer = document.getElementById('favorite-products');
    let emptyFavoritesView = document.getElementById('empty-favorites-view');
    favoriteProductsContainer.innerHTML = ''; // Clear previous content
    const uniqueFavorites = [...new Set(favorites)]; // Ensure uniqueness
    console.log('Unique Favorites:', uniqueFavorites); // Print the unique favorites

    if (uniqueFavorites.length === 0) {
        // No favorite items, show the empty favorites view
        emptyFavoritesView.style.display = 'block';
        favoriteProductsContainer.style.display = 'none';
    } else {
        emptyFavoritesView.style.display = 'none';
    uniqueFavorites.forEach(productId => {
        fetch(`https://dummyjson.com/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                console.log('Fetched product:', product); // Print the fetched product details
                let secondaryImage = product.images[1] ? product.images[1] : product.thumbnail;
                let div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <a href="product.html?id=${product.id}">
                    <div class="product-image">
                        <img src="${product.thumbnail}" alt="${product.title}" class="primary">
                        <img src="${secondaryImage}" alt="${product.title}" class="secondary">
                    </div>
                    </a>
                    <div class="delete-icon" data-product-id="${product.id}" onclick="removeFromFavorites(${product.id})"><i class="fas fa-trash"></i></div>
                     <a href="product.html?id=${product.id}">
                    <h3>${product.title}</h3>
                    <p>$${product.price}</p>
                    </a>

                    
                    <button onclick="moveToBag(${product.id})" class="move-to-bag-button">Move to Bag</button>
                `;
                favoriteProductsContainer.appendChild(div);
            })
            .catch(error => console.error('Error fetching favorite products:', error));
    });
}
}

function loadCartProducts() {
    let cartProductsContainer = document.getElementById('cart-products');
    let subtotalAmount = 0;
    if (!cartProductsContainer) {
        console.error('Element with id "cart-products" not found');
        return;
    }
    cartProductsContainer.innerHTML = '';
    if (cart.length === 0) {
        console.log('empty');
        document.querySelector('.cart-summary').style.display = 'none'; // Hide the cart summary
        document.querySelector('.cart-main').style.display = 'block';
        displayEmptyCartView();
        return;
    } else {
        document.querySelector('.cart-main').style.display = 'flex';
        document.querySelector('.cart-summary').style.display = 'block'; // Show the cart summary
        document.getElementById('empty-cart-view').style.display = 'none';

    }
    cart.forEach(cartItem => {
        fetch(`https://dummyjson.com/products/${cartItem.id}`)
            .then(response => response.json())
            .then(product => {
                subtotalAmount += product.price * cartItem.quantity;
                let div = document.createElement('div');
                div.className = 'cart-item';
                div.setAttribute('data-product-id', product.id);
                div.innerHTML = `
                    <button onclick="removeFromCart(${cartItem.id})" class="remove-button"><i class="fas fa-times"></i></button>
                    <div class="cart-item-image">
                       <a href="product.html?id=${product.id}"><img src="${product.thumbnail}" alt="${product.title}"></a>
                    </div>
                    <div class="cart-item-details">
                        <h3>${product.title}</h3>
                        <p class="cart-item-price">$${product.price}</p>
                        <p>Color: ${product.color ? product.color : 'undefined'}</p>
                        <p>Size: ${cartItem.size ? cartItem.size : 'undefined'}</p>
                        <p>Quantity: 
                            <select onchange="updateCartQuantity(${product.id}, this.value)">
                                <option value="1" ${cartItem.quantity == 1 ? 'selected' : ''}>1</option>
                                <option value="2" ${cartItem.quantity == 2 ? 'selected' : ''}>2</option>
                                <option value="3" ${cartItem.quantity == 3 ? 'selected' : ''}>3</option>
                                <option value="4" ${cartItem.quantity == 4 ? 'selected' : ''}>4</option>
                            </select>
                        </p>
                        <div class="cart-item-actions">
                            <button onclick="saveForLater(${cartItem.id})" class="save-for-later-button">Save for later</button>
                        </div>
                    </div>
                `;
                cartProductsContainer.appendChild(div);
                document.getElementById('subtotal-amount').innerText = `$${subtotalAmount.toFixed(2)}`;
            })
            .catch(error => console.error('Error fetching cart products:', error));
    });
}

function removeFromCart(productId) {
    const cartIndex = cart.findIndex(item => item.id === productId);
    if (cartIndex > -1) {
        cart.splice(cartIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartProducts();
        updateCartBadge(); // Update the cart badge when an item is removed from the cart
    }
}

function saveForLater(productId) {
    console.log('saveForLater called with productId:', productId);
    const cartIndex = cart.findIndex(item => item.id === productId);
    if (cartIndex > -1) {
        const savedItem = cart.splice(cartIndex, 1)[0];
        console.log('Item to be saved for later:', savedItem);
        toggleFavorite(document.querySelector(`.favorite-icon[data-product-id='${savedItem.id}']`), savedItem.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartProducts();
        loadFavoriteProducts();
        updateCartBadge(); // Update the cart badge when an item is saved for later
    }
}

function updateCartQuantity(productId, quantity) {
    console.log('updateCartQuantity called with productId:', productId, 'quantity:', quantity);
    const cartIndex = cart.findIndex(item => item.id === productId);
    if (cartIndex > -1) {
        cart[cartIndex].quantity = parseInt(quantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartProducts();
    }
}

function removeFromFavorites(productId) {
    console.log('removeFromFavorites called with productId:', productId);
    const index = favorites.indexOf(productId.toString());
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavoriteProducts();
    }
}

function updateFavoriteIcons() {
    document.querySelectorAll('.favorite-icon').forEach(icon => {
        const productId = icon.getAttribute('data-product-id');
        if (productId) {
            if (favorites.includes(productId.toString())) {
                icon.classList.add('filled');
                icon.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                icon.classList.remove('filled');
                icon.innerHTML = '<i class="far fa-heart"></i>';
            }
        } else {
            console.warn('No data-product-id attribute found on element:', icon);
        }
    });
}



function updateProductFavoriteIcon(productId) {
    const productFavoriteIcon = document.getElementById('product-favorite-icon');
    if (!productFavoriteIcon) return; // If the icon doesn't exist, exit the function
    if (favorites.includes(productId.toString())) {
        productFavoriteIcon.classList.add('filled');
        productFavoriteIcon.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        productFavoriteIcon.classList.remove('filled');
        productFavoriteIcon.innerHTML = '<i class="far fa-heart"></i>';
    }
    productFavoriteIcon.onclick = function() {
        toggleFavorite(productFavoriteIcon, productId);
    };
}

function highlightActiveCategory(category) {
    document.querySelectorAll('.category-links li').forEach(li => {
        li.classList.remove('active');
        if (li.innerText.replace(/ /g, '-').toLowerCase() === category) {
            li.classList.add('active');
        }
    });
}

function addToCart() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const productInCart = cart.find(item => item.id === productId);
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart');
    updateCartBadge(); // Update the cart badge when an item is added to the cart
}

function moveToBag(productId) {
    console.log('moveToBag called with productId:', productId);
    productId = productId.toString(); // Convert to string to ensure consistency

    // Remove the item from favorites
    const favoriteIndex = favorites.indexOf(productId);
    if (favoriteIndex > -1) {
        favorites.splice(favoriteIndex, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavoriteProducts();
    }

    // Add the item to cart if not already present
    const productInCart = cart.find(item => item.id === parseInt(productId));
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.push({ id: parseInt(productId), quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (document.getElementById('cart-products')) {
        loadCartProducts();
    } else {
        console.log('Cart products element not found');
    }
    updateCartBadge(); // Update the cart badge when an item is moved to the bag
}

// Checkout related functions
function proceedToCheckout() {
    window.location.href = 'checkout.html';
}

function loadCheckoutItems() {
    let orderItemsContainer = document.getElementById('order-items');
    let subtotalAmount = 0;
    let totalItems = 0;

    if (!orderItemsContainer) {
        console.error('Element with id "order-items" not found');
        return;
    }

    orderItemsContainer.innerHTML = ''; // Clear previous content

    cart.forEach(cartItem => {
        fetch(`https://dummyjson.com/products/${cartItem.id}`)
            .then(response => response.json())
            .then(product => {
                subtotalAmount += product.price * cartItem.quantity;
                totalItems += cartItem.quantity;
                let div = document.createElement('div');
                div.className = 'order-item';
                div.innerHTML = `
                    <img src="${product.thumbnail}" alt="${product.title}">
                    <div class="order-item-details">
                        <p><strong>£${(product.price * cartItem.quantity).toFixed(2)}</strong></p>
                        <p>${product.title}</p>
                        <p><strong>${product.color ? product.color : ''}</strong> ${product.size ? product.size : ''}</p>
                        <p>Qty: ${cartItem.quantity}</p>
                    </div>
                `;
                orderItemsContainer.appendChild(div);
                document.getElementById('subtotal-amount').innerText = `£${subtotalAmount.toFixed(2)}`;
                document.getElementById('total-amount').innerText = `£${subtotalAmount.toFixed(2)}`;
                document.getElementById('item-count').innerText = `${totalItems} Items`;
            })
            .catch(error => console.error('Error fetching product details:', error));
    });
}


document.querySelector('.buy-button').addEventListener('click', function() {
    alert('Order placed successfully!');
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartProducts();

    // Display thank you message and continue shopping button
    const checkoutContainer = document.querySelector('.checkout-container');
    checkoutContainer.innerHTML = `
        <div class="thank-you-message">
            <h2>Thank you for your order</h2>
            <button class="continue-shopping-button">Continue Shopping</button>
        </div>
    `;
    
    const continueShoppingButton = document.querySelector('.continue-shopping-button');
    continueShoppingButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});
// document.querySelector('.empty-cart-button').addEventListener('click', function(){
//     console.log('hii');
//     window.location.href = 'favorites.html';
// });
function displayEmptyCartView() {
    document.querySelector('.checkout-container').style.display = 'none';
    document.getElementById('empty-cart-view').style.display = 'block';
    document.getElementById('view-saved-items').addEventListener('click', function() {
        console.log('hii');
        window.location.href = 'favorites.html';
    });
}

// document.getElementsByClassName('Advertising').addEventListener('click', function() {
//     console.log('hii');
//     window.location.href = 'favorites.html';
// });

document.getElementById('empty-cart-view').style.display = 'none';

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const hamburgerContent = document.querySelector('.hamburger-content');
    const navLinks = document.querySelector('.nav-links');

    hamburgerMenu.addEventListener('click', function() {
        hamburgerContent.classList.toggle('active');
        navLinks.style.display = navLinks.style.display === 'none' ? 'flex' : 'none';
    });
});