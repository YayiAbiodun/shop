const db = new Dexie('ShoppingApp')
db.version(35).stores({items: "++id,name,price,isPurchased"})


const itemForm = document.getElementById('itemForm')
const itemDiv = document.querySelector('.itemContainer')
const totalPrice = document.querySelector('.totalPrice')
const editForm = document.getElementById('editForm')
const clearBtn = document.getElementById('clearButton')
const editContainer = document.querySelector('.editContainer')
const count = document.querySelector('.count')

editContainer.style.display = 'none';



editContainer.addEventListener('click', ()=>{
    editContainer.style.display = 'none';
})



const populate = async () => { 
    const allItems = await db.items.reverse().toArray()  
     itemDiv.innerHTML = allItems.map(item =>`
     <div class="item ${item.isPurchased && "purchased"}">
    <div class="checkgroup">
    <h3 class="${item.isPurchased && "dash"}">${item.name}</h3>
    <input type="checkbox" onChange="toggle(event,${item.id})" id="check"${item.isPurchased && "checked"}>
</div>    
<p class="${item.isPurchased && "dash"}">$${item.price} x ${item.quantity} </p>
<p id="price" class="${item.isPurchased && "dash"}">$ ${item.price * item.quantity}</p>
<div class="change">
    <button onClick="editItem(${item.id})">
    <span><i class="fa fa-pencil" aria-hidden="true"></i>
    </span></button>
     <button onClick="removeItem(${item.id})">
        <span>
            <i class="fa fa-trash" aria-hidden="true"></i>
        </span>
    </button>
 </div>  
</div>  
    `).join('')
    const arrayOfPrices = allItems.map( item =>{ 
        if(!item.isPurchased){
        return  Number(item.price) * Number(item.quantity) 
          }
          else{
              return  0;
          }
       })
    const allPrice = arrayOfPrices.reduce((a,b)=>a + b,0)
    totalPrice.innerText = `$${allPrice}`;
    const quantity = allItems.map(item =>{ 
        if(!item.isPurchased){
             return Number(item.quantity)
        }
        else{
            return  0;
        }
    })
    const totalQuantity = quantity.reduce((a,b)=>a + b,0)
    count.innerText = totalQuantity;
    count.style.display = "none";
    if(totalQuantity){
        count.style.display = "flex";
    }
}



const toggle = async (event,id) => {
    await db.items.update(id, { isPurchased: !!event.target.checked })
    await populate()
}
const removeItem = async (id)=>{
    await db.items.delete(id)
    await populate()
}

const clearAll = async () => {
    const allItems = await db.items.toArray()
    const allIds = allItems.map(item => item.id)
    await db.items.bulkDelete(allIds);
}

clearBtn.onclick = async () =>{
    await clearAll()
    await populate()
}

const editItem = async (id) => {
    const item = await db.items.get({id:id})
    editContainer.style.display ="block";
    editForm.innerHTML =` 
    <div class="form-group" >
                        <label for=""> Item Name </label>
                        <input type="text" id="nameInput" class="editName" value="${item.name}" data-id="${item.id}">
                    </div>
                    <div class="quant">
                        <div class="form-group">
                            <label for="">Quantity: </label>
                            <input type="number" id="quantityInput" class="editQuantity" value="${item.quantity}">
                        </div>
                        <div class="form-group">
                            <label for="">Price:</label>
                            <input type="number" id="priceInput" class="editPrice" value="${item.price}">
                        </div>
                    </div>
                    <input type="submit" value="Submit" id="addButton" class="submitBtn">   
                    `
    editForm.style.display="block"
}

window.onload = populate()



itemForm.onsubmit = async (event) =>{
    event.preventDefault()
    const ItemName = document.getElementById('nameInput').value
    const ItemQuantity = document.getElementById('quantityInput').value   
    const ItemPrice = document.getElementById('priceInput').value
    await db.items.add({name:ItemName, quantity:ItemQuantity, price:ItemPrice})

    await populate()   
    itemForm.reset()
}
editForm.onsubmit = async (event) =>{
    event.preventDefault()
    
    const itemId = document.querySelector('.editName').dataset.id
    let id = Number(itemId)
    console.log(id)
    const editName = document.querySelector('.editName').value
    const editQuantity = document.querySelector('.editQuantity').value   
    const editPrice = document.querySelector('.editPrice').value
    await db.items.update(id, {name:editName, quantity:editQuantity, price:editPrice})

    await populate()   
    editContainer.style.display = 'none';  
}