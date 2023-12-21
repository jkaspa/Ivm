<template functional>
	<div class="CardDetails row" v-if="props.items.some(i => !!i.value)">
		<p class="CardDetails__item col-xs-12 col-md-3" v-for="(item, index) in props.items" v-if="!!item.value" :key="`cd-${index}`">
			<template v-if="item.route">
				<router-link v-if="item.route" :to="item.route">
					<strong class="CardDetails__label" v-html="item.label" />
					<span class="CardDetails__value" v-html="item.value" />
				</router-link>
			</template>
			<template v-else>
				<strong class="CardDetails__label" v-html="item.label" />
				<span class="CardDetails__value" v-html="item.value" />
			</template>
		</p>
	</div>
</template>
