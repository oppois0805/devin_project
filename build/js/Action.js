(function(parent) {
        function changeActive(obj) {
           $(obj).parent().find("li").each(function(index, el) {
                $(this).removeClass('nb_li--active');
            }).promise().done(function() {
                $(obj).addClass('nb_li--active');
            });
        }

        $(function(event) {

            //底線移動效果
            $('body').on('click', '.nb_li', function() {
                BorderMove(this);
            });

            function BorderMove(obj) {
                var jqObj = $(obj)
                var leftVlaue = 0,
                    activeObj = jqObj.parent().find(".nb_li--active").index(),
                    clickObj =  jqObj.parent().find("li").index(obj),
                    MoveLeft =  jqObj.css('width').replace('px', '')

                if (activeObj !== clickObj) {
                    //如果已被選擇 < 目前要選到，則增加left
                    if (activeObj < clickObj) {
                        leftVlaue = "+=" + ((clickObj - activeObj) * MoveLeft) ;
                    }
                    //反之則減少
                    else if (activeObj > clickObj) {
                        leftVlaue = "-=" + (activeObj - clickObj) * MoveLeft;

                    }

                    changeActive(obj);

                    jqObj.parent().next().find("div").animate({
                        left: leftVlaue,

                    }, 500, function() {
                        // Animation complete.
                    });
                }
            }

        });
}());
