var pager = {};
var ulList = $("ul.SClist");
var pagerUL = $("ul.pager");
var query = document.getElementById("query").value;
var cookieList;
var list;
var items;

function createPager() {
    pagerUL.empty();
    var pagerPrevios = $('<li/">')
        .addClass('previous')
        .appendTo(pagerUL);
    var pagerNext = $('<li/">')
        .addClass('next')
        .appendTo(pagerUL)
    var previosA = $("<a href='' onclick='prevPage(); return false;'>&laquo;</a>")
        .appendTo(pagerPrevios)
    var nextA = $("<a href='' onclick='nextPage(); return false;'>&raquo;</a>")
        .appendTo(pagerNext)
};

// The names of the results should be displayed as a list below the
// textbox
function bindList() {
    var pgItems = pager.pagedItems[pager.currentPage];
    ulList.empty();
    pgItems.forEach(function (el) {
        var li = $('<li class="list-group-item">')
            .addClass('row liItem')
            .attr('playLink', el.uri)
            .appendTo(ulList)
            // When a search result is clicked, it should fly to the Image Container,
            // fade out and the image for the search result should fade in instead
            .click(function () {
                var trackURI = this.attributes.playlink.nodeValue;

                function playTrack() {
                    var widgetLink = 'https://w.soundcloud.com/player/?url=' + trackURI + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true';
                    var player = $("<iframe width='100%' height='450' scrolling='no' frameborder='no' allow='autoplay' src= " + widgetLink + "></iframe>")
                        .appendTo('.widget');
                }

                $('.widget').fadeOut(300, function () {
                    $('.widget').empty();
                    $(".listPadding")
                        .removeClass('col-sm-10')
                        .addClass('col-sm-5');
                    $('.widget').fadeIn(500);
                    playTrack()
                });
            });

        var img = $('<div/>')
            .addClass('trackImg col-sm-1')
            .css('background-image', 'url("' + el.artwork_url + '")')
            .appendTo(li);
        var liWrapper = $("<div/>")
            .addClass('liWrapper col-sm-10')
            .appendTo(li);
        var userNameWrapper = $("<div/>")
            .addClass('row')
            .appendTo(liWrapper);
        var trackNmameWrapper = $("<div/>")
            .addClass('row')
            .appendTo(liWrapper);
        var userName = $('<span/>')
            .addClass('userName')
            .text(el.user.username)
            .appendTo(userNameWrapper);
        var trackNmame = $('<span/>')
            .addClass('trackName col-sm-12')
            .text(el.title)
            .appendTo(trackNmameWrapper);
    });
    createPager()
}
function prevPage() {
    pager.prevPage();
    bindList();
}
function nextPage() {
    pager.nextPage();
    bindList();
}

function cookieFunc() {

    cookieList = function (cookieName) {
//When the cookie is saved the items will be a comma seperated string
//So we will split the cookie by comma to get the original array
        var cookie = $.cookie(cookieName);
//Load the items or a new array if null.
        items = cookie ? cookie.split(/,/) : new Array();
        return {
            "add": function (val) {
                //Add to the items.
                items.push(val);
                //Save the items to a cookie.
                //EDIT: Modified from linked answer by Nick see
                //      http://stackoverflow.com/questions/3387251/how-to-store-array-in-jquery-cookie
                $.cookie(cookieName, items.join(','));
            },
            "remove": function (val) {
                //EDIT: Thx to Assef and luke for remove.
                indx = items.indexOf(val);
                if (indx != -1) items.splice(indx, 1);
                $.cookie(cookieName, items.join(','));
            },
            "clear": function () {
                items = null;
                //clear the cookie.
                $.cookie(cookieName, null);
            },
            "items": function () {
                //Get all the items.
                return items;
            }
        }
    }

    list = new cookieList("MyItems");
    items.forEach(function (el, i) {
        if (el == query) {
            list.remove(el);
        } else if (items.length >= 5 && i == items.length - 1 && query != "") {
            list.remove(items[0]);
        }
    });
    if(query != ""){
        list.add(query);
    }
}

// Use the SoundCloud API to allow the user to search for anything entered in the
// search box.
function search() {
    query = document.getElementById("query").value;
    cookieFunc();

    SC.get('/tracks', {
        q: query, limit: 100
    }).then(function (tracks) {
        pager.items = tracks
        pager.itemsPerPage = 6;
        pagerInit(pager);
        function pagerInit(p) {
            p.pagedItems = [];
            p.currentPage = 0;
            if (p.itemsPerPage === undefined) {
                p.itemsPerPage = 10;
            }
            p.prevPage = function () {
                if (p.currentPage > 0) {
                    p.currentPage--;
                }
            };
            p.nextPage = function () {
                if (p.currentPage < p.pagedItems.length - 1) {
                    p.currentPage++;
                }
            };
            init = function () {
                for (var i = 0; i < p.items.length; i++) {
                    if (i % p.itemsPerPage === 0) {
                        p.pagedItems[Math.floor(i / p.itemsPerPage)] = [p.items[i]];
                    } else {
                        p.pagedItems[Math.floor(i / p.itemsPerPage)].push(p.items[i]);
                    }
                }
                bindList()
            };
            init();
        }
        badgeFunc()
    });
}


function badgeFunc() {
    var searchedItems = $.cookie("MyItems") ? $.cookie("MyItems").split(",") : null;

    $(".badgeWrap").empty();

    if (Array.isArray(searchedItems)) {

        searchedItems.forEach(function (el) {
            $("<span/>")
                .addClass('badge')
                .text(el)
                .click(function (e) {
                    $('input').val(this.childNodes[0].data);
                    search();
                })
                .appendTo(".badgeWrap");
        })

        $(" <i class='close'>x</i>").click(function (e) {
                list.remove(this.parentElement.childNodes[0].data);
                badgeFunc()
                e.preventDefault();
                event.stopPropagation()
            })

            .appendTo(".badge");
    }

}

window.onload = function () {
    SC.initialize({
        client_id: '516b790a82b7c6d89856376fa4ced361',
    });
    badgeFunc();
    search();
};