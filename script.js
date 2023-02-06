const popupCart = document.querySelector('.js-popup-cart');
const popupOrder = document.querySelector('.js-popup-order');
const showOrderBtn = document.querySelector('.js-show-order');
const popupCartList = document.querySelector('.js-popup-cart-list');
const headerCount = document.querySelector('.js-header-count');
const filterSelect = document.querySelector('.js-goods-filter');
const sortInputs = document.querySelectorAll('.js-goods-sort');
const notification = document.querySelector('.js-notification');
const notificationText = document.querySelector('.js-notification-content');
const ids = getAddedProducts();
const deadline = new Date(2023, 03, 01);
const banner = document.querySelector('.js-sale-banner');
const closeBannerBtn = banner.querySelector('.js-sale-banner-close');

setCount(ids.length);
getSearchParams('filter');
// showOrderBtn.addEventListener('click', () => {
//     hidePopup(popupCart);
//     showPopup(popupOrder);
// })


async function getGoods() {
    let url = 'https://my-json-server.typicode.com/OlhaKlymas/json-lesson/goods';
    let response = await fetch(url);
    return response.json();
}

function showProducts(goods, filterBy) {
    let productList = document.querySelector('.product-list');
    productList.innerHTML = '';

    switch (filterBy) {
        case 'all':
            goods = [...goods];
            break;
        case 'new':
        case 'sale':
            goods = goods.filter(item => item.badge === filterBy);
            break;
        case 'low-price':
            goods = goods.filter(item => item.price.current <= 1000);
            break;
        case 'high-price':
            goods = goods.filter(item => item.price.current > 1000);
            break;
    }

    goods.forEach(item => {
        const article = document.createElement('article');
        const isSale = item.badge === 'sale';
        article.classList.add('product-list__item', 'tile', 'js-product');
        article.setAttribute('data-id', item.id);

        article.innerHTML = `
        <a href="${item.href}" class="tile__link">
            <span class="tile__top">
                <span class="tile__badge tile__badge--${item.badge}">${item.badge}</span>
                <span class="tile__delete hidden js-delete-item"> 
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_6043_11153)">
                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                        <clipPath id="clip0_6043_11153">
                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                        </clipPath>
                        </defs>
                    </svg>
                </span>
            </span>
            <span class="tile__image">
                <img src="${item.images[0].preview}" alt="${item.title}">
            </span>
            <span class="tile__title">${item.title}</span>
            ${addSaleElem(isSale)}
            <span class="tile__info">
                <span class="tile__price">
                    <span class="tile__old-price">${item.price.old} ₴</span>
                    <span class="tile__new-price">${item.price.current} ₴</span>
                </span>
                <button class="btn js-add-to-cart-btn">Купити</button>
            </span>
        </a>
    `;
        productList.appendChild(article);
    });
}

function addSaleElem(isSale) {
    if (isSale) {
        return `
        <span class="tile__sale-info sale">
            <span class="sale__text">Акція діє до 01.04.2023</span>
            <div class="sale__counter counter">
                <span class="counter__item counter__days">0 дня</span>
                <span class="counter__item counter__hours">0 год</span>
                <span class="counter__item counter__minutes">0 хв</span>
                <span class="counter__item counter__seconds">0 сек</span>
            </div>
        </span>
        `;
    } else {
        return '';
    }
}

function showDeleteButton(ids) {
    let products = document.querySelectorAll('.js-product');
    products.forEach(function (product) {
        if (ids.includes(product.dataset.id)) {
            let deleteButton = product.querySelector('.js-delete-item');
            deleteButton.classList.remove('hidden');
        }
    });
}

function setCount(num) {
    headerCount.innerText = num;
}

function setCountEvent(products) {
    headerCount.addEventListener('click', () => {
        let addedToCartProducts = getAddedProducts();
        if (addedToCartProducts.length > 0) {
            showCartProducts(addedToCartProducts, products);
            showPopup(popupCart);
        }
    });
}

function getAddedProducts() {
    return localStorage.getItem('cart')?.split(', ') || [];
}

function removeFromCart(parent, isPopup = false) {
    let id = parent.dataset.id;
    let addedToCartProducts = getAddedProducts();
    let newProductsList = addedToCartProducts.filter((item) => item != id);
    newProductsList.length > 0 ? localStorage.setItem('cart', newProductsList.join(', ')) : localStorage.removeItem('cart');
    setCount(newProductsList.length);
    if (!isPopup) {
        let deleteButton = parent.querySelector('.js-delete-item');
        let tileTitle = parent.querySelector('.tile__title').innerText;
        deleteButton.classList.add('hidden');
        showNotification(tileTitle, 'видалено');
    } else {
        let products = document.querySelectorAll('.js-product');
        products.forEach(product => {
            if (product.dataset.id === id) {
                let deleteButton = product.querySelector('.js-delete-item');
                deleteButton.classList.add('hidden');
            }
        });
    }
}

function addToCart(button) {
    let parent = button.closest('.product-list__item');
    let deleteButton = parent.querySelector('.js-delete-item');
    let id = parent.dataset.id;
    let tileTitle = parent.querySelector('.tile__title').innerText;
    let addedToCartProducts = getAddedProducts();

    deleteButton.classList.remove('hidden');
    addedToCartProducts.push(id);
    localStorage.setItem('cart', addedToCartProducts.join(', '));
    setCount(addedToCartProducts.length);
    showNotification(tileTitle, 'додано');
}

function showNotification(productName, text) {
    notification.classList.add('notification--active');
    notificationText.innerText = `Продукт ${productName} успішно ${text}!`;
    setTimeout(() => notification.classList.remove('notification--active'), 3000);
}

function showPopup(popup) {
    let popupClose = popup.querySelector('.js-popup-close');
    popup.classList.add('popup--active');
    popupClose.addEventListener('click', () => hidePopup(popup));
}

function hidePopup(popup) {
    popup.classList.remove('popup--active');
}

function showCartProducts(productIds, goods) {
    popupCartList.innerHTML = '';
    goods.forEach(item => {
        if (productIds.includes(String(item.id))) {
            let filtered = productIds.filter(el => el === String(item.id));
            let counter = filtered.length;
            let itemList = document.createElement('li');
            itemList.className = "popup-cart__list-item cart-item";
            itemList.dataset.id = item.id;
            itemList.innerHTML = `<span class="cart-item__img">
                                    <img src="${item.images[0].preview}" alt="${item.title}">
                                </span>
                                <span class="cart-item__info">
                                    <a href="${item.href}" class="cart-item__link">
                                        <span class="cart-item__title">${item.title}</span>
                                        <span class="cart-item__price">
                                            <span class="tile__count">${counter}</span>
                                            <span class="tile__price">Вартість - ${item.price.current} ₴</span>
                                            <span class="tile__total-price">Сума - ${item.price.current * counter} ₴</span>
                                        </span>
                                    </a>
                                </span>
                                <span class="cart-item__remove js-cart-remove">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_6043_11153)">
                                        <path d="M2.03125 3.85352H12.9687" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M11.753 3.85352V12.3605C11.753 12.9681 11.1454 13.5757 10.5378 13.5757H4.46137C3.85373 13.5757 3.24609 12.9681 3.24609 12.3605V3.85352" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M5.06934 3.85341V2.63813C5.06934 2.03049 5.67697 1.42285 6.28461 1.42285H8.71517C9.32281 1.42285 9.93045 2.03049 9.93045 2.63813V3.85341" stroke="#EF3E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                        </g>
                                        <defs>
                                        <clipPath id="clip0_6043_11153">
                                        <rect width="14.5833" height="14.5833" fill="white" transform="translate(0.208008 0.208008)"/>
                                        </clipPath>
                                        </defs>
                                    </svg>
                                </span>`;
            popupCartList.appendChild(itemList);
        }
    });
    setPopupCartRemove();
}

function setPopupCartRemove() {
    let removeBtns = document.querySelectorAll('.js-cart-remove');

    removeBtns.forEach(btn => btn.addEventListener('click', function () {
        let parent = btn.closest('.cart-item');
        parent.classList.add('hidden');
        removeFromCart(parent, true);
    }));
}

function sortProducts(e, products) {
    let value = e.target.value;
    let sortedProducts = [...products];

    switch (value) {
        case 'price':
            sortedProducts = products.sort((a, b) => a.price.current > b.price.current ? 1 : -1);
            break;
        case 'alphabet':
            sortedProducts = products.sort((a, b) => a.title > b.title ? 1 : -1);
            break;
    }

    showProducts(sortedProducts);
}

function setSort(arr) {
    sortInputs.forEach(input => input.addEventListener('change', (e) => sortProducts(e, arr)));
}

function setFilter(arr) {
    filterSelect.addEventListener('change', e => getFilteredProducts(e, arr));
}

function getFilteredProducts(e, products) {
    let value = e.target.value;
    let filteredProducts = null;

    if (value == 'all') {
        setSearchParams('filter', '');
        filteredProducts = [...products];
    } else {
        setSearchParams('filter', value);
        filteredProducts = products.filter(item => item.tag_list.includes(value));
    }

    showProducts(filteredProducts);
}

function setSearchParams(key, value) {
    let currentUrl = window.location;
    let url = new URL(currentUrl);
    let params = new URLSearchParams(url.search);

    if (value === '') {
        params.delete(key);
    } else {
        params.set(key, value);
    }
    url.search = params.toString();
    window.location.href = url.toString();
}

function getSearchParams(key) {
    let currentUrl = window.location;
    let url = new URL(currentUrl);
    let params = new URLSearchParams(url.search);
    let search = params.get(key);

    if (search) {
        setCurrentOption(search);
    }

    getGoods().then(result => {
        showProducts(result, search);
        setSort(result);
        setFilter(result);
        showDeleteButton(ids);
        setBtnProductsEvent();
        setCountEvent(result);
        countdownTimer();
    });
}

function setCurrentOption(val) {
    filterSelect.querySelector(`option[value=${val}]`).setAttribute('selected', 'selected');
}

function setBtnProductsEvent() {
    let deleteButtons = document.querySelectorAll('.js-delete-item');
    let addToCartButtons = document.querySelectorAll('.js-add-to-cart-btn');

    deleteButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            removeFromCart(btn.closest('.product-list__item'));
        });
    });

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(button);
        });
    });
}

function countdownTimer() {
    const diff = deadline - new Date();
    const days = diff > 0 ? Math.floor(diff / 1000 / 60 / 60 / 24) : 0;
    const hours = diff > 0 ? Math.floor(diff / 1000 / 60 / 60) % 24 : 0;
    const minutes = diff > 0 ? Math.floor(diff / 1000 / 60) % 60 : 0;
    const seconds = diff > 0 ? Math.floor(diff / 1000) % 60 : 0;
    const daysElems = document.querySelectorAll('.counter__days');
    const hoursElems = document.querySelectorAll('.counter__hours');
    const minutesElems = document.querySelectorAll('.counter__minutes');
    const secondsElems = document.querySelectorAll('.counter__seconds');

    daysElems.forEach(elem => {
        elem.textContent = days < 10 ? '0' + days + ' днів' : days + ' днів';
    });
    hoursElems.forEach(elem => {
        elem.textContent = hours < 10 ? '0' + hours + ' год' : hours + ' год';
    });
    minutesElems.forEach(elem => {
        elem.textContent = minutes < 10 ? '0' + minutes + ' хв' : minutes + ' хв';
    });
    secondsElems.forEach(elem => {
        elem.textContent = seconds < 10 ? '0' + seconds + ' сек' : seconds + ' сек';

    });
}

function showBanner() {
    const bannerTime = new Date(localStorage.getItem('banner'));
    const currentTime = new Date();

    if (bannerTime) {
        const diff = Math.ceil(Math.abs(currentTime.getTime() - bannerTime.getTime()) / (1000 * 3600 * 24));

        if (diff > 7) {
            banner.classList.add('show');
        }
    }
}

closeBannerBtn.addEventListener('click', () => {
    const bannerTime = new Date();
    localStorage.setItem('banner', bannerTime.valueOf());
    banner.classList.remove('show');
});

setTimeout(showBanner, 3000);
setInterval(countdownTimer, 1000);
