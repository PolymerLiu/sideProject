(function () {
    var Util = (function () {
        var prefix = 'html5_reader_'
        var StorageGetter = function (key) {
            return localStorage.getItem(prefix + key)
        }
        var StorageSetter = function (key, val) {
            return localStorage.setItem(prefix + key, val)
        }
        var getJSONP = function (url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function (result) {
                    var data = $.base64.decode(result)
                    var json = decodeURIComponent(escape(data))
                    callback(json)
                }

            })
        }
        return {
            getJSONP: getJSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();

    var Dom = {
        top_nav: $('#top_nav'),
        bottom_nav: $('#bottom_nav'),
        font: $('#font'),
        bottom_nav_panel: $('#bottom_nav_panel'),
        fiction_container: $('#fiction_container'),
        backgroundArr: $('.background').find('li'),
        time: $('#time')
    }
    var Win = $(window)
    var Doc = $(document)
    var initFontSize = Util.StorageGetter("font-size")
    initFontSize = parseInt(initFontSize)
    if (!initFontSize) {
        initFontSize = 14
    }
    Dom.fiction_container.css('font-size', initFontSize)

    var initBackground = Util.StorageGetter('background')
    Dom.fiction_container.css('background', initBackground)


    function main() {
        //整个项目的入口函数
        var readerModel = ReaderModel()
        var readerUI = ReaderBaseFrame(Dom.fiction_container)

        readerModel.init(function (data) {
            readerUI(data)
        })
        EventHandler()
    }

    function ReaderModel() {
        //实现和阅读器相关的数据交互的方法  ajax jsonp
        var Chapter_id
        var chapterTotal
        var init = function (UIcallback) {
            getFictionInfo(function () {
                getCurChapterContent(Chapter_id, function (data) {
                    UIcallback && UIcallback(data)
                })
            })
        }
        var getFictionInfo = function (callback) {
            $.get('data/chapter.json', function (data) {
                Chapter_id = data.chapters[1].chapter_id
                chapterTotal = data.chapters.length
                callback && callback()
            }, 'json')
        }
        var getCurChapterContent = function (chapter_id, callback) {
            $.get('data/data' + chapter_id + '.json', function (data) {
                if (data.result == 0) {
                    var url = data.jsonp
                    Util.getJSONP(url, function (data) {
                        callback && callback(data)
                    })
                }
            }, 'json')
        }
        var prevChapter = function (UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10)
            if (Chapter_id == 0) {
                return
            }
            Chapter_id -= 1
            getCurChapterContent(Chapter_id, UIcallback)
        }
        var nextChapter = function (UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10)
            if (Chapter_id == chapterTotal) {
                return
            }
            Chapter_id += 1
            getCurChapterContent(Chapter_id, UIcallback)
        }
        return {
            init: init,
            prevChapter:prevChapter,
            nextChapter:nextChapter
        }
    }

    function ReaderBaseFrame(container) {
        //渲染基本的UI结构
        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData)
            var html = '<h4>' + jsonObj.t + '</h4>'
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += "<p>" + jsonObj.p[i] + '</p>'
            }
            return html
        }

        return function (data) {
            container.html(parseChapterData(data))
        }
    }

    function EventHandler() {
        //唤出上下导航栏
        $('#action_mid').click(function () {
            if (Dom.top_nav.css('display') === 'none') {
                Dom.top_nav.show()
                Dom.bottom_nav.show()
            } else {
                Dom.top_nav.hide()
                Dom.bottom_nav.hide()
                Dom.bottom_nav_panel.hide()
            }
        })
        //唤出字体控制面板
        Dom.font.click(function () {
            if (Dom.bottom_nav_panel.css('display') === 'none') {
                Dom.bottom_nav_panel.show()
                Dom.font.find('i').addClass('current')
            } else {
                Dom.bottom_nav_panel.hide()
                Dom.font.find('i').removeClass('current')

            }
        })
        //窗口滚动，导航消失
        Win.scroll(function () {
            Dom.top_nav.hide()
            Dom.bottom_nav.hide()
            Dom.bottom_nav_panel.hide()
            Dom.font.removeClass('current')
        })
        //控制字号大小
        $('#large').click(function () {
            initFontSize += 1
            if (initFontSize > 20) {
                return
            }
            Dom.fiction_container.css('font-size', initFontSize)
            Util.StorageSetter('font-size', initFontSize)
        })
        $('#small').click(function () {
            initFontSize -= 1
            if (initFontSize < 12) {
                return
            }
            Dom.fiction_container.css('font-size', initFontSize)
            Util.StorageSetter('font-size', initFontSize)
        })
        //改变背景
        for (var i = 0; i < Dom.backgroundArr.length; i++) {
            Dom.backgroundArr.eq(i).click(function () {
                Dom.fiction_container.css('background', $(this).css('background'))
                Util.StorageSetter('background', $(this).css('background'))
            })
        }
        $("#time").on('click', function () {
            if (Dom.time.find('h6').text() === '白天') {
                Dom.time.find('i').removeClass('day')
                Dom.time.find('i').addClass('night')
                Dom.fiction_container.css('background', '#283548')
                Util.StorageSetter('background', '#283548')
                Dom.time.find('h6').text('晚间')
            } else {
                Dom.time.find('i').removeClass('night')
                Dom.time.find('i').addClass('day')
                Dom.fiction_container.css('background', '#f7eee5')
                Util.StorageSetter('background', '#f7eee5')
                Dom.time.find('h6').text('白天')
            }
        })
    }

    main()
})();