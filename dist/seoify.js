$(function(){

    var options = {
        html4mode: true,
        proximity: { 
            near: 300, 
            far: -100 
        }
    };

    seoify.init(options);
});

var seoify = (function(){
    var seoify_eventBuffer;

    return {
        init_title: null,
        root_url: null,
        base_url: null,
        init_path: '',
        active_state: null,
        isloaded: false,
        wait: true,
        proximity: { near: 400, far: -100 },
        html4Mode: true,
        init: function(options) {

            //console.log('seoify init', options, this);

            if(options && options.html4mode) {
                History.options.html4Mode = options.html4mode;
            } else if(options && options.proximity) {
                this.proximity = options.proximity;
            } 

            window.History.init();
            this.load();
        },
        load: function(){
            
            this.init_title = $('title').text();
            this.root_url = History.getRootUrl();
            
            this.base_url = History.getBasePageUrl();
            this.init_path = '/'+this.base_url.replace(this.root_url, '');

            this.active_state = History.getState().hash;

            //console.log('init_hashes', this.init_path, this.root_url, this.base_url);
            var self = this;
            History.Adapter.bind(window, 'statechange', function(){
                self.active_state = History.getState().hash;
                // console.log('History.binder', self.active_state);
            });

            this.setup();
        },
        setup: function() {
            var self = this;
            var seoifyElements = $('body *[data-seoify]');

            $(seoifyElements).each(function(){
                var element = $(this);
                var title = element.attr('data-title');
                var urlslug = self.init_path+element.attr('data-seoify');
                self.store(urlslug, title, element);
            });

            var waitstate = setTimeout(function(){
                self.wait = false;
            }, 1000); 
        },
        store: function(urlslug, title, element) {

            if(!this.isloaded){
            	var init_state = History.getState().hash.replace('#/','');
                var current_hash = this.init_path+init_state;
                //console.warn(current_hash, urlslug);
                if(current_hash == urlslug){
                    this.scrolltoElement(element);
                    this.isloaded = true;
                }
            }
            
            this.watch(element, urlslug, title);
        },
        watch: function(element, urlslug, title) {
            var self = this;
            $(window).scroll(function() {
                var elementpos = $(element).offset().top - $(window).scrollTop();
                var checkpos = (elementpos < self.proximity.near) && (elementpos > self.proximity.far);

                if(checkpos){
                    clearTimeout(seoify_eventBuffer);
                    var seoify_eventBuffer = setTimeout(function(){
                        self.setpushState(urlslug, title);
                    }, 5);
                }
            });
        },
        setpushState: function(slug, title){
            if(this.active_state != slug && !this.wait) {
                this.active_state = slug;
                
                if(slug == this.init_path){
                    window.history.replaceState(null, this.init_title, this.base_url)
                } else {
                    History.pushState(null, title, slug);
                }
                // console.log('setPushState', slug, this.active_state);
            }
        },
        scrolltoElement: function(element) {
            $(element).ScrollTo();
        }
    };
})(seoify);