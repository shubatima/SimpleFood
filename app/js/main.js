$(function () {

  $('.feedback__slider').slick({

    arrows: true,
    dots: true,

    prevArrow: '<button type="button" class="feedback__btn feedback__btn--prev"><svg class="feedback__arrow feedback__arrow--left"><use xlink:href="images/sprite.svg#icon-vector"></use></svg></button>',

    nextArrow: '<button type="button" class="feedback__btn feedback__btn--next"><svg class="feedback__arrow feedback__arrow--right"><use xlink:href="images/sprite.svg#icon-vector"></use></svg></button>',

    appendArrows: '.arrows-wrap'
  })

})

var mixer = mixitup('.product');