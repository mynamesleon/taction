/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~             lpswipe, sidenav javascript             ~~
~~           Leon Slater, www.lpslater.co.uk           ~~
~~                    Version 1.0.0                    ~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

(function(){

    var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        cancelAnimFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame || window.msCancelAnimationFrame;

    var siteNav = {

        init: function(){
            siteNav.storeVars();
            siteNav.checkCSSProp();
            siteNav.domEvents();
            siteNav.setNavSwipe();
            siteNav.resizeEvent();
        },

        storeVars: function(){
            siteNav.html = document.documentElement;
            siteNav.body = document.getElementsByTagName('body')[0];
            siteNav.mainNav = document.getElementById('main-nav');
            siteNav.mobHeader = document.getElementById('mob-header');
            siteNav.mobOpener = document.getElementById('mobile-opener');
            siteNav.mainNavWidth = siteNav.mainNav.offsetWidth;
            siteNav.overrideNavScroll = false;
        },

        checkCSSProp: function(){
             var div = document.createElement('div'),
                props = ['WebkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'transform'];
            for (var i in props) { // cycle through css Perspective properties to see if the browser supports them
                if (div.style[props[i]] !== undefined) {
                    siteNav.animProp = props[i];
                }
            }
        },

        setTransforms: function(elem, prop){
            elem.style[siteNav.animProp] = prop;
        },

        closeNav: function(){
            siteNav.setTransforms(siteNav.mainNav, 'translate3d('+ siteNav.mainNavWidth +'px, 0, 0)');
            siteNav.setTransforms(siteNav.mobHeader, 'translate3d(0, 0, 0)');
        },

        openNav: function(){
            siteNav.setTransforms(siteNav.mainNav, 'translate3d(0, 0, 0)');
            siteNav.setTransforms(siteNav.mobHeader, 'translate3d(-'+ siteNav.mainNavWidth +'px, 0, 0)');
        },

        navMovementPrep: function(d){
            var navState = siteNav.hasClass(siteNav.html, 'open-nav') ? 'open' : 'closed', // if nav is open or closed
                direction = d.x > 0 ? 'right' : 'left', // if swipe is going to the right, or left
            movementDir = {
                'open': {
                    'right': function(){
                        if (d.x < siteNav.mainNavWidth){
                            siteNav.navClosingMovement(d.x, d.x + siteNav.mainNavWidth);
                        } else { // if user has swiped further to the right than the width of the nav
                            siteNav.closeNav(); // use closeNav function to ensure that nav is in correct position off screen
                        }
                    },
                    'left': siteNav.openNav
                },
                'closed': {
                    'right': siteNav.closeNav,
                    'left': function(){
                        if (d.x <= -siteNav.mainNavWidth){ // if at or past the navwidth, force nav to stay in final open state
                            siteNav.openNav(); // use openNav function to ensure that nav is in correct position on screen
                        } else {
                            siteNav.navOpeningMovement(d.x, d.x + siteNav.mainNavWidth);
                        }
                    }
                }
            }[navState][direction]();
        },

        navOpeningMovement: function(posX, mainNavPos){
            siteNav.setTransforms(siteNav.mobHeader, 'translate3d('+ posX +'px, 0, 0)');
            siteNav.setTransforms(siteNav.mainNav, 'translate3d('+ mainNavPos +'px, 0, 0)');
        },

        navClosingMovement: function(posX, mainNavPos){
            var mobHeaderMovement = -siteNav.mainNavWidth + posX;
            siteNav.setTransforms(siteNav.mobHeader, 'translate3d('+ mobHeaderMovement +'px, 0, 0)');
            siteNav.setTransforms(siteNav.mainNav, 'translate3d('+ posX +'px, 0, 0)');
        },

        removeClass: function(elem, classToRemove){
            elem.className = elem.className.replace(classToRemove, '').replace(/^\s+|\s+$/gm,'');
        },

        addClass: function(elem, classToAdd){
            if (!siteNav.hasClass(elem, classToAdd)){
                elem.className = elem.className + ' ' + classToAdd;
            }
        },
        
        hasClass: function(elem, classToCheck){
            return elem.className.indexOf(classToCheck) > -1;
        },

        setNavSwipe: function(){
            lpswipe(document.getElementsByTagName('body'), {
                threshold: 50,
                swipeDirection: 'horizontal',
                start: function(){
                    siteNav.mainNavWidth = siteNav.mainNav.offsetWidth; // reset when opening/closing nav to ensure width is detected correctly
                    siteNav.removeClass(siteNav.mobHeader, 'transition');
                    siteNav.removeClass(siteNav.mainNav, 'transition');
                    siteNav.addClass(siteNav.html, 'nav-prep');
                },
                beforeEnd: function(){
                    cancelAnimFrame(animRequestId);
                    siteNav.addClass(siteNav.mobHeader, 'transition'); // add classes here to ensure animation works on MS surface
                    siteNav.addClass(siteNav.mainNav, 'transition');
                },
                left: function(){
                    if (!siteNav.hasClass(siteNav.html, 'open-nav')){
                        siteNav.addClass(siteNav.html, 'open-nav');
                        siteNav.openNav();
                    }
                },
                right: function(){
                    if (siteNav.hasClass(siteNav.html, 'open-nav')){
                        siteNav.removeClass(siteNav.html, 'open-nav');
                        siteNav.closeNav();
                    }
                },
                moving: function(d){
                    animRequestId = requestAnimFrame(function(){
                        siteNav.navMovementPrep(d);
                    });
                },
                notReached: function(){
                    if (siteNav.hasClass(siteNav.html, 'open-nav')){
                        siteNav.openNav(); // reset to open nav position
                    } else {
                        siteNav.closeNav(); // reset to closed nav position
                    }
                },
                reset: function(){
                    siteNav.addClass(siteNav.mobHeader, 'transition'); // add classes here to reenable animations if user hasn't used custom swipe action
                    siteNav.addClass(siteNav.mainNav, 'transition');
                    siteNav.removeClass(siteNav.html, 'nav-prep');
                }
            });
        },

        domEvents: function(){
            var clickEvent = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) ? 'touchend' : 'click';
            if (window.addEventListener){
                siteNav.mobOpener.addEventListener(clickEvent, function(){
                    siteNav.mainNavWidth = siteNav.mainNav.offsetWidth; // reset when opening/closing nav to ensure width is detected correctly
                    if (siteNav.hasClass(siteNav.html, 'open-nav')){
                        siteNav.removeClass(siteNav.html, 'open-nav');
                        siteNav.closeNav();
                    } else {
                        siteNav.addClass(siteNav.html, 'open-nav');
                        siteNav.openNav();
                    }
                });
            }
        },

        resizeEvent: function(){
            var resizeTimer,
                orientationchanged = true,
                newOrientation,
                winWidth = window.innerWidth || document.documentElement.offsetWidth,
                winHeight = window.innerHeight || document.documentElement.offsetHeight,
                oldOrientation = winWidth > winHeight ? 'landscape' : 'portrait',
                isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(navigator.userAgent.toLowerCase());

            function resizeFunc(){ // resize event - custom orientation change check for mobile
                if (resizeTimer){
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function(){
                    if (isMobile){
                        winWidth = window.innerWidth || document.documentElement.offsetWidth;
                        winHeight = window.innerHeight || document.documentElement.offsetHeight;
                        newOrientation = winWidth > winHeight ? 'landscape' : 'portrait';
                        orientationchanged = newOrientation !== oldOrientation;
                        oldOrientation = newOrientation;
                    }

                    if (orientationchanged){
                        siteNav.overrideNavScroll = false;
                        siteNav.mainNavWidth = siteNav.mainNav.offsetWidth; // reset when resizing in case any styling affects the width
                        siteNav.removeClass(siteNav.html, 'open-nav'); // close nav when resizing
                        siteNav.closeNav();
                    }
                }, 100);
            }

            if (window.addEventListener){
                window.addEventListener('resize', resizeFunc);
            } else {
                window.onresize = resizeFunc();
            }
        }

    };

    if (window.lpswipe){
        lpswipe.sidenav = siteNav;
        lpswipe.sidenav.init();
    }
})();
