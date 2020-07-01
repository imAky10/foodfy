
btnIngredient = document.querySelector('.btn-ingredients')
btnIngredient.addEventListener("click", function() {
    document.querySelector('.ingredient-list').classList.toggle('hide')
        if (btnIngredient.innerHTML === "Show") {
                 btnIngredient.innerHTML = "Hide"
        } else {
                btnIngredient.innerHTML = "Show"
     }
})

btnPreparation = document.querySelector('.btn-preparation')
btnPreparation.addEventListener("click", function() {
    document.querySelector('.preparation-list').classList.toggle('hide')
        if (btnPreparation.innerHTML === "Show") {
                 btnPreparation.innerHTML = "Hide"
        } else {
                btnPreparation.innerHTML = "Show"
     }
})

btnInformation = document.querySelector('.btn-information')
btnInformation.addEventListener("click", function() {
    document.querySelector('.p-information').classList.toggle('hide')
        if (btnInformation.innerHTML === "Show") {
                 btnInformation.innerHTML = "Hide"
        } else {
                btnInformation.innerHTML = "Show"
     }
})

