const modalGuide = document.getElementById("modal-guide");
  
// Get the button that opens the modal
const btnGuide = document.getElementById("guide-button");

// Get the <span> element that closes the modal
const closeGuide = document.getElementById("closeGuide");

// When the user clicks the button, open the modal 
btnGuide.onclick = function() {
  modalGuide.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeGuide.onclick = function() {
  modalGuide.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function(event) {
  console.log("fuck");
  if (event.target == modalGuide) {
    modalGuide.style.display = "none";
  }
});
