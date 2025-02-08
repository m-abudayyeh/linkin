import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyADpIPsj1xK_9L7t8XMFB_CGQN0RBzqDiM",
    authDomain: "gift-shop-779d5.firebaseapp.com",
    projectId: "gift-shop-779d5",
    storageBucket: "gift-shop-779d5.firebasestorage.app",
    messagingSenderId: "1046929050162",
    appId: "1:1046929050162:web:48582f43a2a466c7c78a2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function getData() {
    try {
        const getDataQuery = await getDocs(collection(db, "giftProduct"));
        let htmlTag = "";
        getDataQuery.forEach(doc => {
            console.log(doc.data());
            const productData = doc.data();
            htmlTag += `
                 <div class="col-lg-4 col-md-6 col-sm-6">
                 <div class="product__item">
                 <div class="product__item__pic">
                    <img src="${productData.imageProduct}" alt="Product Image">
                </div>
                   <div class="product__item__text">
                   <h6>${productData.titleProduct}</h6>
                 <a href="#" class="add-cart">+ Add To Cart</a>
                 <h5>${productData.priceProduct} JD</h5>
                 </div>
                 </div>
                 </div>`
        });
        const cardBox = document.querySelector("#cardBox");
        cardBox.innerHTML = htmlTag;
    }
    catch (error) {
        console.log(error);
    }
}
getData()

//Search Product
document.querySelector("#searchInput").addEventListener("input", (event) => {
    const searchValue = event.target.value.toLowerCase(); 
    const productItems = document.querySelectorAll(".product__item"); 

    productItems.forEach((item) => {
        const title = item.querySelector(".product__item__text h6").innerText.toLowerCase(); 
        item.style.display = title.includes(searchValue) ? "block" : "none";
    });
});

// Category Filter 
const category = await getDocs(collection(db, "giftProduct"));

document.querySelectorAll(".category-item").forEach((category) => {
    category.addEventListener("click", (event) => {
        event.preventDefault();
        const selectedCategory = event.target.getAttribute("data-category").toLowerCase();
        const productItems = document.querySelectorAll(".product__item");

        productItems.forEach((item) => {
            if (selectedCategory === "all") {
                item.style.display = "block";
            } else {
                const categoryName = item.querySelector(".product__item__text h6").innerText.toLowerCase();
                if (categoryName.includes(selectedCategory)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            }
        });
    });
});

getData();



// Shopping Cart
let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

// Add to Cart Functionality
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-cart")) {
        event.preventDefault();

        const productElement = event.target.closest(".product__item");
        const title = productElement.querySelector(".product__item__text h6").innerText;
        const price = productElement.querySelector(".product__item__text h5").innerText;
        const image = productElement.querySelector(".product__item__pic img").src;

        const product = {
            title,
            price,
            image,
            quantity: 1
        };

        // Check if product is already in cart
        const existingProduct = cart.find(item => item.title === product.title);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        updateCartView();
    }
});

// Remove from Cart Functionality
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-cart-item")) {
        const productTitle = event.target.dataset.title;
        cart = cart.filter(item => item.title !== productTitle);
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        updateCartView();
    }
});

// Update Cart View
function updateCartView() {
    const cartContainer = document.querySelector("#cartContainer");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach(item => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}" width="50">
      <div>
          <h6>${item.title}</h6>
          <p>Price: ${price.toFixed(2)} JOD</p>
          <p>Quantity: ${item.quantity}</p>
      </div>
      <button class="remove-cart-item" data-title="${item.title}">Remove</button>
      <p>Total: ${(price * item.quantity).toFixed(2)} JOD</p>
  `;
        cartContainer.appendChild(cartItem);
    });

    const totalPrice = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
        return total + (price * item.quantity);
    }, 0);

    const totalContainer = document.createElement("div");
    totalContainer.classList.add("cart-total");
    totalContainer.innerHTML = `
<h5 style="color:green">Total Price: ${totalPrice.toFixed(2)} JOD</h5><br><br>
<button style="color:green"><a href="checkout.html">Checkout</button>`;
    cartContainer.appendChild(totalContainer);
    document.getElementById("cartDiv1").innerText = totalPrice.toFixed(2);
}

document.getElementById("cartBtnQ").addEventListener("click", () => {
    const cartSidebar = document.createElement("div");
    cartSidebar.id = "cartSidebar";
    cartSidebar.style.position = "fixed";
    cartSidebar.style.right = "0";
    cartSidebar.style.top = "0";
    cartSidebar.style.width = "300px";
    cartSidebar.style.height = "100vh";
    cartSidebar.style.background = "#fff";
    cartSidebar.style.borderLeft = "1px solid #ccc";
    cartSidebar.style.padding = "20px";
    cartSidebar.style.overflowY = "auto";
    cartSidebar.innerHTML = `
          <h4>Your Cart</h4>
          <div id="cartContainer"></div>
      `;

    document.body.appendChild(cartSidebar);
    updateCartView();
});


//Close Cart
document.getElementById("cartBtnQ").addEventListener("click", () => {

    cartSidebar.innerHTML = `
      <button id="closeCart" style="float:right;">&times;</button>
      <h4>Your Cart</h4>
      <div id="cartContainer"></div>
  `;
    document.body.appendChild(cartSidebar);

    document.getElementById("closeCart").addEventListener("click", () => {
        cartSidebar.remove();
    });

    updateCartView();
});
