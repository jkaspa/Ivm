<template functional>
	<p
		class="CardDetails__item"
		:ref="data.ref"
		:class="[data.class, data.staticClass]"
		:style="[data.style, data.staticStyle]"
	>
		<router-link :to="props.route" v-if="props.route">
			<strong class="CardDetails__label">
				<slot name="label" />
			</strong>
			<span class="CardDetails__value">
				<slot />
			</span>
		</router-link>
		<template v-else>
			<strong class="CardDetails__label">
				<slot name="label" />
			</strong>
			<span class="CardDetails__value">
				<slot />
			</span>
		</template>
	</p>
</template>
