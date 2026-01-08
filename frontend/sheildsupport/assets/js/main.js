; (function ($) {
    "use strict";

    $(document).ready(function () {

        /**-----------------------------
         *  Navbar fix
         * ---------------------------*/
        $(document).on('click', '.navbar-area .navbar-nav li.menu-item-has-children>a', function (e) {
            e.preventDefault();
        })

        /*-------------------------------------
            menu
        -------------------------------------*/
        $('.navbar-area .menu').on('click', function () {
            $(this).toggleClass('open');
            $('.navbar-area .navbar-collapse').toggleClass('sopen');
        });

        // mobile menu
        if ($(window).width() < 992) {
            $(".in-mobile").clone().appendTo(".sidebar-inner");
            $(".in-mobile ul li.menu-item-has-children").append('<i class="fas fa-chevron-right"></i>');
            $('<i class="fas fa-chevron-right"></i>').insertAfter("");

            $(".menu-item-has-children a").on('click', function (e) {
                // e.preventDefault();

                $(this).siblings('.sub-menu').animate({
                    height: "toggle"
                }, 300);
            });
        }

        var menutoggle = $('.menu-toggle');
        var mainmenu = $('.navbar-nav');

        menutoggle.on('click', function () {
            if (menutoggle.hasClass('is-active')) {
                mainmenu.removeClass('menu-open');
            } else {
                mainmenu.addClass('menu-open');
            }
        });

        /* -----------------------------------------------------
            Variables
        ----------------------------------------------------- */
        var leftArrow = '<i class="fas fa-arrow-left"></i>';
        var rightArrow = '<i class="fas fa-arrow-right"></i>';

        /*--------------------------------------------------
            project-slider
        ---------------------------------------------------*/
        $('.banner-slider').owlCarousel({
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            smartSpeed: 450,
            loop: true,
            autoplay: true,
            autoplayTimeout: 10000,
            nav: true,
            dots: false,
            items: 1,
            smartSpeed: 1800,
            navText: [leftArrow, rightArrow],
        });

        /*--------------------------------------------------
            client-slider
        ---------------------------------------------------*/
        $('.client-slider').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: false,
            smartSpeed: 3000,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            slideTransition: 'linear',
            navText: [leftArrow, rightArrow],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 4
                },
            }
        });

        /*--------------------------------------------------
            client-slider
        ---------------------------------------------------*/
        $('.blog-thumb-slider').owlCarousel({
            loop: true,
            nav: true,
            dots: false,
            smartSpeed: 1500,
            navText: [leftArrow, rightArrow],
            items: 1,
        });

        /*--------------------------------------------------
            client-slider
        ---------------------------------------------------*/
        if ($.fn.slick) {
            $('.testimonial-thumb').slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                autoplay: true,
                fade: true,
                autoplaySpeed: 1500,
                speed: 1500,
                asNavFor: '.testimonial-nav-slider'
            });
            $('.testimonial-nav-slider').slick({
                slidesToShow: 3,
                slidesToScroll: 1,
                asNavFor: '.testimonial-thumb',
                dots: false,
                autoplay: true,
                autoplaySpeed: 1500,
                centerMode: false,
                focusOnSelect: true,
                arrows: false,
            });
        }

        /*--------------------------------------------------
            testimonial-slider
        ---------------------------------------------------*/
        $('.testimonial-slider-2').owlCarousel({
            loop: true,
            margin: 30,
            nav: true,
            dots: false,
            smartSpeed: 1500,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            center: true,
            navText: [leftArrow, rightArrow],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 3
                },
            }
        });

        /*--------------------------------------------------
            project-slider
        ---------------------------------------------------*/
        $('.project-slider').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: false,
            smartSpeed: 1500,
            navText: [leftArrow, rightArrow],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                992: {
                    items: 3
                },
            }
        });

        /*--------------------------------------------------
            project-slider
        ---------------------------------------------------*/
        $('.project-slider-2').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: false,
            smartSpeed: 1500,
            navText: [leftArrow, rightArrow],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 3
                },
                992: {
                    items: 3
                },
                1200: {
                    items: 4
                },
                1600: {
                    items: 5
                },
            }
        });

        /*--------------------------------------------------
            select onput
        ---------------------------------------------------*/
        if ($('.single-select').length) {
            $('.single-select').niceSelect();
        }

        /**banner-move**/
        if ($('.banner-bg-img').length) {
            function touches(e) {
                var x = e.touches ? e.touches[0].clientX : e.clientX,
                    y = e.touches ? e.touches[0].clientY : e.clientY;
                var w = window.innerWidth / 2;
                var h = window.innerHeight / 2;
                var l = -(x - w) / (w / 1) - 1;
                var t = -(y - h) / (h / 1) - 1;
                TweenMax.to($('.banner-bg-img'), 1, {
                    top: t + "%",
                    left: l + "%"
                });
            }
            window.addEventListener("mousemove", touches);
            window.addEventListener("touchstart", touches);
            window.addEventListener("touchmove", touches);
        }

        /*--------------------------------------------
            Search Popup
        ---------------------------------------------*/
        var bodyOvrelay = $('#body-overlay');
        var searchPopup = $('#td-search-popup');
        var sidebarMenu = $('#sidebar-menu');

        $(document).on('click', '#body-overlay', function (e) {
            e.preventDefault();
            bodyOvrelay.removeClass('active');
            searchPopup.removeClass('active');
            sidebarMenu.removeClass('active');
        });
        $(document).on('click', '.search-bar-btn', function (e) {
            e.preventDefault();
            searchPopup.addClass('active');
            bodyOvrelay.addClass('active');
        });

        /* -------------------------------------------------
            Magnific JS Image
        ------------------------------------------------- */
        $('.swp-image-popup').magnificPopup({
            type: 'image',
            mainClass: 'mfp-with-zoom',
            gallery: {
                enabled: true
            },
        });

        /*------------------------------------------------
            Magnific JS
        ------------------------------------------------*/
        $('.video-play-btn').magnificPopup({
            type: 'iframe',
            removalDelay: 260,
            mainClass: 'mfp-zoom-in',
        });
        $.extend(true, $.magnificPopup.defaults, {
            iframe: {
                patterns: {
                    youtube: {
                        index: 'youtube.com/',
                        id: 'v=',
                        src: 'https://www.youtube.com/embed/Wimkqo8gDZ0'
                    }
                }
            }
        });



        /**---------------------------------------
          Progress BAR
        ----------------------------------------*/
        function td_Progress() {
            var progress = $('.progress-rate');
            var len = progress.length;
            for (var i = 0; i < len; i++) {
                var progressId = '#' + progress[i].id;
                var dataValue = $(progressId).attr('data-value');
                $(progressId).css({ 'width': dataValue + '%' });
            }
        }
        var progressRateClass = $('.progress-item');
        if ((progressRateClass).length) {
            td_Progress();
        }
        $('.counting').each(function () {
            var $this = $(this),
                countTo = $this.attr('data-count');

            $({ countNum: $this.text() }).animate({
                countNum: countTo
            },

                {
                    duration: 2000,
                    easing: 'linear',
                    step: function () {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function () {
                        $this.text(this.countNum);
                    }
                });
        });

        /* -----------------------------------------
            fact counter
        ----------------------------------------- */
        $('.counter').counterUp({
            delay: 15,
            time: 2000
        });

        /* -------------------------------------------------------------
           All-item isotope
        ------------------------------------------------------------- */
        var $galleryFilterArea = $('.project-isotope'),
            $galleryFilterMenu = $('.project-isotope-btn');
        /*Filter*/
        $galleryFilterMenu.on('click', 'button, a', function () {
            var $this = $(this),
                $filterValue = $this.attr('data-filter');
            $galleryFilterMenu.find('button, a').removeClass('active');
            $this.addClass('active');
            $galleryFilterArea.isotope({ filter: $filterValue });
        });
        /*Grid*/
        $galleryFilterArea.each(function () {
            var $this = $(this),
                $galleryFilterItem = '.all-isotope-item';
            $this.imagesLoaded(function () {
                $this.isotope({
                    itemSelector: $galleryFilterItem,
                    percentPosition: true,
                    masonry: {
                        columnWidth: '.item-sizer',
                    }
                });
            });
        });

        $('.testimonial-slider-3').owlCarousel({
            loop: true,
            thumbs: true,
            items: 1,
            responsiveClass: true, autoplayHoverPause: true,
            autoplay: true,
            slideSpeed: 1500,
            paginationSpeed: 900,
            thumbsPrerendered: true,
            autoplayTimeout: 3000,
            smartSpeed: 1500,
            nav: false,
            dots: false,
            responsive: {
                0: {
                    items: 1,
                    nav: false,
                },
                360: {
                    items: 1,
                    nav: false
                },
                768: {
                    items: 1,
                    nav: false,
                },
                1000: {
                    items: 1,
                    nav: false,
                    loop: true
                }
            }
        });


        /*----------------------------------------
           back to top
        ----------------------------------------*/
        $(document).on('click', '.back-to-top', function () {
            $("html,body").animate({
                scrollTop: 0
            }, 2000);
        });

        /*--------------------------------------------------
           Newsletter Subscription
        ---------------------------------------------------*/
        $(document).on('click', '.widget_subscribe button', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var $input = $btn.siblings('input[type="text"]');
            var email = $input.val().trim();

            if (!email) {
                alert('Please enter your email address.');
                return;
            }

            var originalIcon = $btn.html();
            $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i>');

            $.ajax({
                url: 'http://localhost:5000/api/subscribers',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email: email }),
                success: function (response) {
                    alert('Subscribed successfully!');
                    $input.val('');
                    $btn.prop('disabled', false).html(originalIcon);
                },
                error: function (xhr) {
                    var msg = (xhr.responseJSON && xhr.responseJSON.msg) ? xhr.responseJSON.msg : 'Subscription failed.';
                    alert(msg);
                    $btn.prop('disabled', false).html(originalIcon);
                }
            });
        });

    });

    $(window).on("scroll", function () {
        /*---------------------------------------
            back-to-top
        -----------------------------------------*/
        var ScrollTop = $('.back-to-top');
        if ($(window).scrollTop() > 1000) {
            ScrollTop.fadeIn(1000);
        } else {
            ScrollTop.fadeOut(1000);
        }

        /*---------------------------------------
            sticky-active
        -----------------------------------------*/
        var scroll = $(window).scrollTop();
        if (scroll < 445) {
            $(".navbar").removeClass("sticky-active");
        } else {
            $(".navbar").addClass("sticky-active");
        }

    });


    $(window).on('load', function () {

        /*-----------------
            preloader
        ------------------*/
        var preLoder = $("#preloader");
        preLoder.fadeOut(0);

        /*-----------------
            back to top
        ------------------*/
        var backtoTop = $('.back-to-top')
        backtoTop.fadeOut();

        /*---------------------
            Cancel Preloader
        ----------------------*/
        $(document).on('click', '.cancel-preloader a', function (e) {
            e.preventDefault();
            $("#preloader").fadeOut(2000);
        });

    });



})(jQuery);



document.addEventListener("DOMContentLoaded", function () {
    const circles = document.querySelectorAll(".skill-circle");

    circles.forEach(circle => {
        const percent = circle.getAttribute("data-percent");
        const color = circle.getAttribute("data-color");
        circle.style.setProperty("--color", color);

        let current = 0;
        const animate = () => {
            current++;
            if (current <= percent) {
                circle.style.setProperty("--percent", current);
                circle.querySelector(".percent").textContent = current + "%";
                requestAnimationFrame(animate);
            }
        };
        animate();
    });
});
