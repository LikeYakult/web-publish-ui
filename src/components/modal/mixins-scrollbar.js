import { getScrollBarSize } from "../utils/assist"

export default {
    methods: {
        checkScrollBar () {
            let fullWindowWidth = window.innerWidth;
            if (!fullWindowWidth) {
                const documentElementRect = document.documentElement.getBoundingClientRect();
                fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
            }
            this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
            if (this.bodyIsOverflowing) {
                this.scrollBarWidth = getScrollBarSize();
            }
        },
        checkMaskInVisible () {
            let masks = document.getElementsByClassName('ivu-modal-mask') || [];
            return Array.from(masks).every(m => m.style.display === 'none' || m.classList.contains('fade-leave-to'));
        },
        setScrollBar () {
            if (this.bodyIsOverflowing && this.scrollBarWidth !== undefined) {
                if(!this.draggable) {
                    // document.body.style.paddingRight = `${this.scrollBarWidth}px`;
                }
            }
        },
        resetScrollBar () {
            document.body.style.paddingRight = '';
        },
        addScrollEffect () {
            this.checkScrollBar();
            this.setScrollBar();
            if(!this.draggable) {
                document.body.style.overflow = 'hidden';
            }
        },
        removeScrollEffect() {
            if (this.checkMaskInVisible()) {
                document.body.style.overflow = '';
                this.resetScrollBar();
            }
        }
    }
};