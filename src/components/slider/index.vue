<template>
    <div :class="classes">
        <div :class="[prefixCls + '-wrap', { vertex: exportValue[0] === 100 }]"
             ref="slider"
             @click.self="handleSliderClick"
        >
            <input type="hidden" :name="name" :value="exportValue">
            <template>
                <div :class="[prefixCls + '-stop', { active: stepShowAry.includes(item), over: exportValue[0] >= item }]"
                     v-for="(item, key) in stops"
                     :style="{ left: `${item}%` }"
                     @click.self="handleSliderClick"
                     :key="key"
                />
            </template>
            <div :class="[prefixCls + '-bar']"
                 :style="barStyle"
                 @click.self="handleSliderClick"
            />
            <div :class="[prefixCls + '-button-wrap', { overAll: exportValue[0] === 100 }]"
                 :style="{ left: `${minPosition}%` }"
                 @touchstart="event => handleOnPointerDown(event, 'min')"
                 @mousedown="event => handleOnPointerDown(event, 'min')"
            >
                <Tooltip :controlled="pointerDown === 'min'"
                         placement="top"
                         :content="tipFormat(exportValue[0] + '%')"
                         :disabled="tipDisabled"
                         :always="showTip === 'always'"
                         ref="minTooltip"
                >
                    <div :class="minButtonClasses"
                         tabindex="0"
                         @focus="handleFocus('min')"
                         @blur="handleBlur('min')"
                         @keydown.left="event => handleOnKeyLeft(event, 'min')"
                         @keydown.down="event => handleOnKeyLeft(event, 'min')"
                         @keydown.right="event => handleOnKeyRight(event, 'min')"
                         @keydown.up="event => handleOnKeyRight(event, 'min')"
                    />
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<script>
import {on, off} from "../../utils/dom";
import {getStyle, oneOf} from "../utils/assist";

const prefixCls = "trade-slider";
export default {
    name: "Slider",
    props: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 100
        },
        step: {
            type: Number,
            default: 1
        },
        value: {
            type: [Number, String, Array],
            default: 0
        },
        disabled: {
            type: Boolean,
            default: false
        },
        showStops: {
            type: Boolean,
            default: false
        },
        tipFormat: {
            type: Function,
            default(val) {
                return val;
            }
        },
        showTip: {
            type: String,
            default: 'hover',
            validator(value) {
                return oneOf(value, ['hover', 'always', 'never'])
            }
        },
        name: {
            type: String
        },
        range: {
            type: Boolean,
            default: false
        },
    },
    data() {
        const val = this.handleCheckLimits(Array.isArray(this.value) ? this.value : [this.value]);
        return {
            prefixCls,
            currentValue: val,
            dragging: false,
            pointerDown: '',
            startX: 0,
            currentX: 0,
            startPos: 0,
            oldValue: [...val],
            valueIndex: {
                min: 0,
                max: 1
            }
        }
    },
    computed: {
        stepShowAry() {
            return [0, 25, 50, 75, 100];
        },
        valueRange() {
            return this.max - this.min;
        },
        classes() {
            return [
                `${prefixCls}`, {
                    [`${prefixCls}-disabled`]: this.disabled
                }
            ]
        },
        minButtonClasses() {
            return [
                `${prefixCls}-button`, {
                    [`${prefixCls}-button-dragging`]: this.pointerDown === 'min'
                }
            ]
        },
        stops() {
            let stopCount = this.valueRange / this.step;
            let result = [];
            let stepWidth = 100 * this.step / this.valueRange;

            for (let i = 0; i <= stopCount; i++) {
                result.push(i * stepWidth);
            }

            return result;
        },
        sliderWidth() {
            return parseInt(getStyle(this.$refs.slider, 'width'), 10);
        },
        exportValue() {
            return this.currentValue.map(nr => Number(String(nr).split(".")[0]));
        },
        minPosition() {
            const val = this.currentValue;
            return (val[0] - this.min) / this.valueRange * 100;
        },
        maxPosition() {
            const val = this.currentValue;
            return (val[1] - this.min) / this.valueRange * 100;
        },
        barStyle() {
            return {
                width: (this.currentValue[0] - this.min) / this.valueRange * 100 + '%'
            }
        },
        tipDisabled() {
            return this.tipFormat(this.currentValue[0] === null || this.showTip === 'never');
        }
    },
    watch: {
        value(val) {
            val = this.handleCheckLimits(Array.isArray(val) ? val : [val]);
            if (val[0] !== this.currentValue[0] || val[1] !== this.currentValue[1]) {
                this.currentValue = val;
            }
        },
        exportValue(values) {
            this.$nextTick(() => this.$refs["minTooltip"].updatePopper());
            const value = values[0];
            this.$emit("input", value);
        },
    },
    methods: {
        handleOnKeyLeft(event, type) {
            const value = this.getCurrentValue(event, type);
            if (Number.isFinite(value)) {
                this.handleChangeButtonPosition(value - this.step, type);
            }
        },
        handleOnKeyRight(event, type) {
            const value = this.getCurrentValue(event, type);
            if (Number.isFinite(value)) {
                this.handleChangeButtonPosition(value + this.step, type);
            }
        },
        getCurrentValue(event, type) {
            if (this.disabled) {
                return;
            }

            const index = this.valueIndex[type];

            if (typeof index === 'undefined') {
                return;
            }

            return this.currentValue[index];
        },
        handleDispatch(componentName, eventName, params) {
            let parent = this.$parent || this.$root;
            let name = parent.$options.name;

            while (parent ** (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.name;
                }
            }

            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        handleEmitChange() {
            const value = this.exportValue[0];
            this.$emit("change", value);
        },
        handleDecimal(pos, step) {
            if (step < 1) {
                let sl = step.toString();
                let multiple = 1;
                let m;

                try {
                    m = sl.split(".")[1].length;
                } catch (e) {
                    m = 0;
                }

                multiple = Math.pow(10, m);

                return (pos * multiple) % (step * multiple) / multiple;
            } else {
                return pos % step;
            }
        },
        handleOnPointerDragStart(event) {
            this.dragging = false;
            this.startX = this.handleGetPointerX(event);
            this.startPos = (this[`${this.pointerDown}Position`] * this.valueRange / 100) + this.min;
        },
        handleOnPointerDrag(event) {
            this.dragging = true;
            this.$refs[`${this.pointerDown}Tooltip`].visible = true;
            this.currentX = this.handleGetPointerX(event);

            const diff = (this.currentX - this.startX) / this.sliderWidth * this.valueRange;

            this.handleChangeButtonPosition(this.startPos + diff);
        },
        handleOnPointerDown(event, type) {
            if (this.disabled) {
                return;
            }

            event.preventDefault();
            this.pointerDown = type;
            this.handleOnPointerDragStart(event);
            this.$emit('change-type', 'move');
            on(window, "mousemove", this.handleOnPointerDrag);
            on(window, "touchmove", this.handleOnPointerDrag);
            on(window, "mouseup", this.handleOnPointerDragEnd);
            on(window, "touchend", this.handleOnPointerDragEnd);
        },
        handleOnPointerDragEnd() {
            if (this.dragging) {
                this.dragging = false;
                this.$refs[`${this.pointerDown}Tooltip`].visible = false;
                this.handleEmitChange();
            }

            this.pointerDown = '';
            off(window, 'mousemove', this.handleOnPointerDrag);
            off(window, 'touchmove', this.handleOnPointerDrag);
            off(window, 'mouseup', this.handleOnPointerDragEnd);
            off(window, 'touchend', this.handleOnPointerDragEnd);
        },
        handleChangeButtonPosition(newPos, forceType) {
            const type = forceType || this.pointerDown;
            const index = type === 'min' ? 0 : 1;

            newPos = type === 'min' ? this.handleCheckLimits([newPos, this.max])[0] : this.handleCheckLimits([this.min, newPos])[1];

            const modulus = this.handleDecimal(newPos, this.step);
            const value = this.currentValue;
            value[index] = newPos - modulus;

            this.currentValue = [...value];

            if (!this.dragging) {
                if (this.currentValue[index] !== this.oldValue[index]) {
                    this.handleEmitChange();
                    this.oldValue[index] = this.currentValue[index];
                }
            }
        },
        handleGetPointerX(event) {
            return event.type.indexOf("touch") !== -1 ? event.touches[0].clientX : event.clientX;
        },
        handleCheckLimits([min, max]) {
            min = Math.max(this.min, min);
            min = Math.min(this.max, min);

            max = Math.max(this.min, min, max);
            max = Math.min(this.max, max);
            return [min, max];
        },
        handleSliderClick(event) {
            if (this.disabled) {
                return;
            }

            const currentX = this.handleGetPointerX(event);
            const sliderOffsetList = this.$refs.slider.getBoundingClientRect().left;

            let newPos = ((currentX - sliderOffsetList) / this.sliderWidth * this.valueRange);
            let regularNewPos = newPos / this.valueRange * 100;

            if (!this.range || regularNewPos <= this.minPosition) {
                this.handleChangeButtonPosition(newPos, 'min');
                this.$emit("change-type", "move");
            } else if (newPos >= this.maxPosition) {
                this.handleChangeButtonPosition(newPos, "max");
            } else {
                this.handleChangeButtonPosition(newPos, ((newPos - this.firstPosition) <= (this.secondPosition - newPos)) ? 'min' : 'max');
            }
        },
        handleFocus(type) {
            this.$refs[`${type}Tooltip`].handleShowPopper();
        },
        handleBlur(type) {
            this.$refs[`${type}Tooltip`].handleClosePopper();
        }
    }
}
</script>