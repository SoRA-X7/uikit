import { $, hasTouch, includes, isTouch, pointerEnter, pointerLeave, query, trigger, win } from '../util/index';

export default function (UIkit) {

    UIkit.component('toggle', {

        mixins: [UIkit.mixin.togglable],

        args: 'target',

        props: {
            href: String,
            target: null,
            mode: 'list',
            media: 'media'
        },

        defaults: {
            href: false,
            target: false,
            mode: 'click',
            queued: true,
            media: false
        },

        computed: {

            target() {
                return query(this.$props.target || this.href, this.$el) || this.$el;
            }

        },

        events: [

            {

                name: `${pointerEnter} ${pointerLeave}`,

                filter() {
                    return includes(this.mode, 'hover');
                },

                handler(e) {
                    if (!isTouch(e)) {
                        this.toggle(`toggle${e.type === pointerEnter ? 'show' : 'hide'}`);
                    }
                }

            },

            {

                name: 'click',

                filter() {
                    return includes(this.mode, 'click') || hasTouch;
                },

                handler(e) {

                    if (!isTouch(e) && !includes(this.mode, 'click')) {
                        return;
                    }

                    // TODO better isToggled handling
                    var link = $(e.target).closest('a[href]')[0];
                    if ($(e.target).closest('a[href="#"], button').length
                        || link && (
                            this.cls
                            || !this.target.is(':visible')
                            || link.hash && this.target.is(link.hash)
                        )
                    ) {
                        e.preventDefault();
                    }

                    this.toggle();
                }

            }
        ],

        update: {

            write() {

                if (!includes(this.mode, 'media') || !this.media) {
                    return;
                }

                var toggled = this.isToggled(this.target);
                if (win.matchMedia(this.media).matches ? !toggled : toggled) {
                    this.toggle();
                }

            },

            events: ['load', 'resize']

        },

        methods: {

            toggle(type) {
                if (trigger(this.target, type || 'toggle', [this])) {
                    this.toggleElement(this.target);
                }
            }

        }

    });

}
