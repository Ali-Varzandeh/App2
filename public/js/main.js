document.addEventListener("DOMContentLoaded", (e) => {
  (function () {
    $(".toggle-menu").click(function () {
      $(".exo-menu").toggleClass("display");
    });
  });

  // (function () {
  //   $("#cart").on("click", function () {
  //     $(".shopping-cart").fadeToggle("fast");
  //   });
  // })();
});
