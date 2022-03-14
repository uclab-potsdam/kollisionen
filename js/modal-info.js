const modalInfo = document.getElementById("modal-info");
  
// Get the button that opens the modal
const btnInfo = document.getElementById("info-button");

// Get the <span> element that closes the modal
const closeInfo = document.getElementById("closeInfo");

// When the user clicks the button, open the modal 
btnInfo.onclick = function() {
  modalInfo.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeInfo.onclick = function() {
  modalInfo.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function(event) {
  if (event.target == modalInfo) {
    modalInfo.style.display = "none";
  }
});