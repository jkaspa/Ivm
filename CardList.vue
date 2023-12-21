<template>

	<card :table="true">

		<template slot="header" v-if="$slots.header">

			<slot name="header" />

		</template>

		<template slot="default">

			<div class="CardListPlaceholder" v-if="loading">
				<fa-icon class="fa-pulse" :icon="['fad', 'spinner']" />
				<p>Loading</p>
			</div>

			<ul class="CardList" v-else-if="items.length">

				<DynamicScroller
					v-if="virtual"
					:items="items"
					:keyField="virtualKeyField"
					:min-item-size="58"
					:buffer="200"
					class="scroller"
				>

					<template slot-scope="{ item, index, active }">
							<!-- :index="index"
							:data-active="active" -->

						<DynamicScrollerItem
							:item="item"
							:active="active"
							:data-index="index"
							class="message"
						>

							<slot :item="item" />
<!--
							<div class="text">
								{{ item }}
							</div>
							<div class="index">
								<span>{{ index }} (index)</span>
							</div> -->
						</DynamicScrollerItem>

					</template>

				</DynamicScroller>



				<template v-for="(item, index) in items" v-else>

					<slot :item="item" v-if="$scopedSlots.default" />

					<component
						v-else
						:is="item.route ? 'router-link' : 'li'"
						:to="item.route || false"
						tag="li"
						:class="`CardListItem ${item.route && 'CardListItem--link'} ${item.highlight && 'CardListItem--highlight'} ${item.icon && 'CardListItem--hasIcon'}`"
						:key="`model-card-list-${index}`"
					>
						<p class="CardListItem__title" v-html="item.title" />
						<p class="CardListItem__desc" v-html="item.desc" />
						<span class="CardListItem__view" v-if="item.route"><span>View</span></span>
						<span class="CardListItem__icon" v-if="item.icon">
							<fa-icon :icon="item.icon" />
						</span>
					</component>

				</template>

			</ul>

			<div class="CardListPlaceholder" v-else>
				<fa-icon :icon="['fad', 'file-search']" />
				<p v-html="message" />
			</div>

		</template>

		<template slot="footer" v-if="$slots.footer">

			<slot name="footer" />

		</template>

	</card>

</template>

<script>
	import Card from '@/components/card/Card.vue'
	import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

	export default {
		props: {
			virtual: {
				required: false,
				type: Boolean,
				default: false
			},
			virtualKeyField: {
				required: false,
				type: String,
			},
			items: {
				required: false,
				type: Array,
				default: () => [],
			},
			loading: {
				required: false,
				type: Boolean,
				default: false,
			},
			message: {
				required: false,
				type: String,
				default: 'An empty list',
			}
		},
		components: {
			Card,
			DynamicScroller,
			DynamicScrollerItem
		}
	}
</script>



<style scoped>
.scroller {
  height: 500px;
}
</style>
