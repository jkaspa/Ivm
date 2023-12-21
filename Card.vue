<template functional>
	<div class="Card" :class="{
		'Card--table': !!props.table,
		'Card--highlight': !!props.highlight
	}">
		<div class="Card__con">

			<div class="Card__header" v-if="!!$slots.header">
				<slot name="header" />
			</div>

			<div class="Card__body" v-if="!!$slots.default">
				<slot />
			</div>

			<div class="Card__footer" v-if="!!$slots.footer">
				<slot name="footer" />
			</div>

			<div class="Card__actions" v-if="!!$slots.actions">
				<slot name="actions" />
			</div>

		</div>
	</div>
</template>
