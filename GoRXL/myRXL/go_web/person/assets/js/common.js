/**
 * 2018-06-08 by:lx
 */
$(function(){
    //index_banner
    var swiper = new Swiper('.index_banner', {
        pagination: '.index_bn_pagination',
        paginationClickable: true,
        autoplay:5000,
        loop:true,
        speed:500
    });
    //首页支撑体系
    $("#system_control li").click(function(){
        var index = $(this).index();
        $("#system_content .content,#system_control li").removeClass("on");
        $("#system_content .content").eq(index).addClass("on");
        $(this).addClass("on");
    })
    //首页新闻轮播
    var swiper = new Swiper('.news_swiper .swiper-container', {
        nextButton: '.new_next',
        prevButton: '.new_prev',
        spaceBetween: 0,
        autoplay:5000,
        loop:true,
        speed:500
    });
    //产品详情tab切换
    $(".product_details .tab_control li").click(function(){
        var index = $(this).index();
        $(".product_details .tab_control li,.product_details .content .am-paragraph").removeClass("on");
        $(".product_details .content .am-paragraph").eq(index).addClass("on");
        $(this).addClass("on");
    })
    //推荐产品swipwe
    var swiper = new Swiper('.recommend_swiper', {
        pagination: '.recommend_pagination',
        paginationClickable: true,
        autoplay:5000,
        loop:true,
        speed:500
    });
})

