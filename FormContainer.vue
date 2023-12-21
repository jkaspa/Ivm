<template functional>
    <form
		class="FormContainer"
        :ref="data.ref"
        :class="[data.class, data.staticClass]"
        :style="[data.style, data.staticStyle]"
        v-bind="data.attrs"
        v-on="listeners"
    >

		<component
			:is="injections.components.FormBlock"
			:top="true"
			class="FormHeader"
			v-if="$slots.header"
		>
            <slot name="header" />
        </component>

		<div class="FormBody">
        	<slot />
		</div>

        <component
			:is="injections.components.FormBlock"
			:class="'FormActions'"
			:bottom="true"
			v-if="$slots.actions"
		>
            <slot name="actions" />
        </component>
    </form>
</template>

<script>
    import FormBlock from './FormBlock.vue'
    export default {
        inject: {
            components: {
                default: {
                    FormBlock
                }
            }
        }
    }
</script>
